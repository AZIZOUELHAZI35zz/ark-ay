#!/usr/bin/env python3
"""
Startup Idea Analyzer – MVP

This script reads a startup idea and generates:
- Summary (3 sentences)
- Market analysis (size, competitors, opportunities, risks)
- Business Model Canvas
- 5-step marketing strategy
- Viability/investment score (0–100)

It uses Google Gemini for text generation and Pydantic for structured parsing.
Optional: local summarization via transformers to pre-shorten long inputs, and PDF export.
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
from dataclasses import dataclass
from datetime import datetime
from typing import Any, Dict, List, Optional, Tuple

import google.generativeai as genai
from pydantic import BaseModel, Field, ValidationError, field_validator

# Optional deps; guard import to keep script runnable without them
try:
    from transformers import pipeline  # type: ignore
    _TRANSFORMERS_AVAILABLE = True
except Exception:
    _TRANSFORMERS_AVAILABLE = False

try:
    import pandas as pd  # noqa: F401  # type: ignore - reserved for future data handling
    from sklearn.preprocessing import MinMaxScaler  # noqa: F401  # type: ignore
    _SKLEARN_AVAILABLE = True
except Exception:
    _SKLEARN_AVAILABLE = False

try:
    from fpdf import FPDF  # type: ignore
    _FPDF_AVAILABLE = True
except Exception:
    _FPDF_AVAILABLE = False


# -----------------------------
# Data Models (Pydantic v2)
# -----------------------------


class MarketAnalysis(BaseModel):
    market_size: str = Field(description="Estimated market size or qualitative size descriptor")
    competitors: List[str] = Field(default_factory=list)
    opportunities: List[str] = Field(default_factory=list)
    risks: List[str] = Field(default_factory=list)


class BusinessModelCanvas(BaseModel):
    key_partners: List[str] = Field(default_factory=list)
    key_activities: List[str] = Field(default_factory=list)
    key_resources: List[str] = Field(default_factory=list)
    value_propositions: List[str] = Field(default_factory=list)
    customer_relationships: List[str] = Field(default_factory=list)
    channels: List[str] = Field(default_factory=list)
    customer_segments: List[str] = Field(default_factory=list)
    cost_structure: List[str] = Field(default_factory=list)
    revenue_streams: List[str] = Field(default_factory=list)


class LLMOutput(BaseModel):
    summary: str
    market_analysis: MarketAnalysis
    business_model_canvas: BusinessModelCanvas
    marketing_strategy: List[str] = Field(default_factory=list)
    viability_score: int = Field(ge=0, le=100)

    @field_validator("summary")
    @classmethod
    def trim_summary(cls, v: str) -> str:
        return v.strip()


class FinalOutput(BaseModel):
    idea: str
    language: str
    model: str
    llm_result: LLMOutput
    heuristic_score: int = Field(ge=0, le=100)
    combined_score: int = Field(ge=0, le=100)
    generated_at: str


# -----------------------------
# Utility Functions
# -----------------------------


def read_text_file(file_path: str) -> str:
    """Read UTF-8 text content from a file."""
    with open(file_path, "r", encoding="utf-8") as f:
        return f.read()


def ensure_dir(path: str) -> None:
    """Create directory if it does not exist."""
    os.makedirs(path, exist_ok=True)


def clean_text(text: str) -> str:
    """Basic text cleanup suitable for LLM input."""
    if not text:
        return ""
    # Normalize whitespace and strip
    cleaned = re.sub(r"\s+", " ", text).strip()
    return cleaned


def load_dotenv_if_present() -> None:
    """Load environment variables from a .env file if available."""
    try:
        from dotenv import load_dotenv  # type: ignore

        load_dotenv()
    except Exception:
        # dotenv is optional; ignore if not installed
        pass


def try_local_summarize(text: str, max_length: int = 256) -> Optional[str]:
    """Optionally pre-summarize long input using transformers if available.

    Returns a short summary or None if summarizer not available.
    """
    if not _TRANSFORMERS_AVAILABLE:
        return None
    try:
        # A small-ish summarization model; may still download weights on first use.
        summarizer = pipeline("summarization", model="sshleifer/distilbart-cnn-12-6")
        result = summarizer(text, max_length=max_length, min_length=64, do_sample=False)
        if result and isinstance(result, list) and "summary_text" in result[0]:
            return result[0]["summary_text"].strip()
    except Exception:
        return None
    return None


def extract_json_block(text: str) -> str:
    """Extract JSON from a string that may include extra text or code fences.

    Strategy:
    1) If text is valid JSON, return as-is.
    2) Look for fenced blocks ```json ... ``` or ``` ... ``` and try to parse.
    3) Fallback: greedy match of first { ... } block.
    """
    # Direct parse
    try:
        json.loads(text)
        return text
    except Exception:
        pass

    # Fenced block with explicit json
    fenced_json = re.findall(r"```json\s*([\s\S]*?)\s*```", text)
    if fenced_json:
        candidate = fenced_json[0].strip()
        try:
            json.loads(candidate)
            return candidate
        except Exception:
            pass

    # Any fenced block
    fenced_any = re.findall(r"```\s*([\s\S]*?)\s*```", text)
    if fenced_any:
        candidate = fenced_any[0].strip()
        try:
            json.loads(candidate)
            return candidate
        except Exception:
            pass

    # Greedy first {...}
    brace_match = re.search(r"\{[\s\S]*\}", text)
    if brace_match:
        candidate = brace_match.group(0)
        # attempt quick fixes: remove trailing commas
        candidate = re.sub(r",\s*([}\]])", r"\1", candidate)
        try:
            json.loads(candidate)
            return candidate
        except Exception:
            pass

    # If nothing works, return original for visibility
    return text


def compute_heuristic_score(result: LLMOutput) -> int:
    """Compute a simple heuristic viability score (0–100) from structured fields.

    Heuristics (naive and explainable):
    - More opportunities (+) and more value propositions (+)
    - Excessive competitors (−) unless opportunities also high
    - Presence of clear revenue streams (+)
    - If risks mention strong regulation or high CAC, small penalty (−)
    """
    score: float = 50.0

    num_opps = len(result.market_analysis.opportunities)
    num_comp = len(result.market_analysis.competitors)
    num_value_props = len(result.business_model_canvas.value_propositions)
    num_revenue = len(result.business_model_canvas.revenue_streams)
    risks_text = " ".join(result.market_analysis.risks).lower()

    score += min(20, num_opps * 3)
    score += min(10, num_value_props * 2)
    score += min(10, num_revenue * 2)

    # Competitors: moderate penalty beyond first 3
    if num_comp > 3:
        score -= min(15, (num_comp - 3) * 2)

    # Risk keywords: simple pattern-based penalties
    risk_penalty = 0
    for kw, pts in [("regulation", 5), ("régulation", 5), ("cac", 5), ("privacy", 4), ("rgpd", 4)]:
        if kw in risks_text:
            risk_penalty += pts
    score -= min(15, risk_penalty)

    # Clamp and return as int
    score = max(0.0, min(100.0, score))
    return int(round(score))


def combine_scores(heuristic_score: int, llm_score: int, weight_llm: float = 0.6) -> int:
    """Combine heuristic and LLM-provided scores with a weighted average."""
    weight_llm = max(0.0, min(1.0, weight_llm))
    weight_heur = 1.0 - weight_llm
    combined = heuristic_score * weight_heur + llm_score * weight_llm
    return int(round(max(0.0, min(100.0, combined))))


# -----------------------------
# Gemini Interaction
# -----------------------------


def configure_gemini(api_key: str) -> None:
    """Configure the Gemini client with the provided API key."""
    genai.configure(api_key=api_key)


def build_prompt(idea: str, language: str) -> str:
    """Build a minimal deterministic prompt instructing JSON output in the chosen language."""
    if language.lower().startswith("fr"):
        return (
            "Analyse cette idée de startup et réponds uniquement en JSON valide.\n"
            "Idée:\n" + idea + "\n\n"
            "Donne-moi:\n"
            "1. Un résumé clair en 3 phrases,\n"
            "2. Analyse du marché (taille + concurrents + opportunités + risques),\n"
            "3. Business Model Canvas,\n"
            "4. Stratégie marketing en 5 étapes,\n"
            "5. Score de viabilité/investissement (0-100).\n\n"
            "Format de sortie STRICT: JSON avec ce schéma exact:\n"
            "{\n"
            "  \"summary\": \"string\",\n"
            "  \"market_analysis\": {\n"
            "    \"market_size\": \"string\",\n"
            "    \"competitors\": [\"string\"],\n"
            "    \"opportunities\": [\"string\"],\n"
            "    \"risks\": [\"string\"]\n"
            "  },\n"
            "  \"business_model_canvas\": {\n"
            "    \"key_partners\": [\"string\"],\n"
            "    \"key_activities\": [\"string\"],\n"
            "    \"key_resources\": [\"string\"],\n"
            "    \"value_propositions\": [\"string\"],\n"
            "    \"customer_relationships\": [\"string\"],\n"
            "    \"channels\": [\"string\"],\n"
            "    \"customer_segments\": [\"string\"],\n"
            "    \"cost_structure\": [\"string\"],\n"
            "    \"revenue_streams\": [\"string\"]\n"
            "  },\n"
            "  \"marketing_strategy\": [\"string\"],\n"
            "  \"viability_score\": 0\n"
            "}\n"
        )
    else:
        return (
            "Analyze this startup idea and reply only with valid JSON.\n"
            "Idea:\n" + idea + "\n\n"
            "Provide:\n"
            "1. A clear 3-sentence summary,\n"
            "2. Market analysis (size + competitors + opportunities + risks),\n"
            "3. Business Model Canvas,\n"
            "4. A 5-step marketing strategy,\n"
            "5. Viability/investment score (0-100).\n\n"
            "STRICT output format: JSON with this exact schema:\n"
            "{\n"
            "  \"summary\": \"string\",\n"
            "  \"market_analysis\": {\n"
            "    \"market_size\": \"string\",\n"
            "    \"competitors\": [\"string\"],\n"
            "    \"opportunities\": [\"string\"],\n"
            "    \"risks\": [\"string\"]\n"
            "  },\n"
            "  \"business_model_canvas\": {\n"
            "    \"key_partners\": [\"string\"],\n"
            "    \"key_activities\": [\"string\"],\n"
            "    \"key_resources\": [\"string\"],\n"
            "    \"value_propositions\": [\"string\"],\n"
            "    \"customer_relationships\": [\"string\"],\n"
            "    \"channels\": [\"string\"],\n"
            "    \"customer_segments\": [\"string\"],\n"
            "    \"cost_structure\": [\"string\"],\n"
            "    \"revenue_streams\": [\"string\"]\n"
            "  },\n"
            "  \"marketing_strategy\": [\"string\"],\n"
            "  \"viability_score\": 0\n"
            "}\n"
        )


def call_gemini(
    idea: str,
    language: str,
    model_name: str = "gemini-1.5-pro",
    temperature: float = 0.2,
) -> str:
    """Call Gemini with a JSON-enforced generation config and return raw text."""
    generation_config = {
        "temperature": temperature,
        "top_p": 0.9,
        "top_k": 40,
        # Ask for JSON directly; model should respect but we still validate.
        "response_mime_type": "application/json",
    }

    model = genai.GenerativeModel(
        model_name=model_name,
        generation_config=generation_config,
    )

    prompt = build_prompt(idea=idea, language=language)
    response = model.generate_content(prompt)
    # google-generativeai returns text in .text
    return response.text or ""


def analyze_with_gemini(
    idea_text: str,
    language: str,
    model_name: str,
    temperature: float,
) -> LLMOutput:
    """Perform the end-to-end call and parse into LLMOutput."""
    raw = call_gemini(idea=idea_text, language=language, model_name=model_name, temperature=temperature)
    json_str = extract_json_block(raw)
    try:
        data = json.loads(json_str)
    except Exception as e:
        # Provide context in error to help debugging
        raise RuntimeError(f"Gemini returned non-JSON or malformed JSON. Raw snippet: {raw[:400]}...") from e

    try:
        return LLMOutput.model_validate(data)
    except ValidationError as ve:
        # Attempt lenient coercion: fill missing fields with defaults
        coerced: Dict[str, Any] = {
            "summary": data.get("summary", ""),
            "market_analysis": {
                "market_size": data.get("market_analysis", {}).get("market_size", "Unknown"),
                "competitors": data.get("market_analysis", {}).get("competitors", []) or [],
                "opportunities": data.get("market_analysis", {}).get("opportunities", []) or [],
                "risks": data.get("market_analysis", {}).get("risks", []) or [],
            },
            "business_model_canvas": {
                "key_partners": data.get("business_model_canvas", {}).get("key_partners", []) or [],
                "key_activities": data.get("business_model_canvas", {}).get("key_activities", []) or [],
                "key_resources": data.get("business_model_canvas", {}).get("key_resources", []) or [],
                "value_propositions": data.get("business_model_canvas", {}).get("value_propositions", []) or [],
                "customer_relationships": data.get("business_model_canvas", {}).get("customer_relationships", []) or [],
                "channels": data.get("business_model_canvas", {}).get("channels", []) or [],
                "customer_segments": data.get("business_model_canvas", {}).get("customer_segments", []) or [],
                "cost_structure": data.get("business_model_canvas", {}).get("cost_structure", []) or [],
                "revenue_streams": data.get("business_model_canvas", {}).get("revenue_streams", []) or [],
            },
            "marketing_strategy": data.get("marketing_strategy", []) or [],
            "viability_score": int(
                data.get("viability_score", 50) if str(data.get("viability_score", "")).isdigit() else 50
            ),
        }
        try:
            return LLMOutput.model_validate(coerced)
        except ValidationError as ve2:  # noqa: F841
            raise RuntimeError("Failed to validate LLM JSON even after coercion.") from ve


# -----------------------------
# PDF Export
# -----------------------------


def export_to_pdf(result: FinalOutput, pdf_path: str) -> None:
    """Render a simple PDF report using fpdf2."""
    if not _FPDF_AVAILABLE:
        raise RuntimeError("PDF export requested but fpdf2 is not installed.")

    pdf = FPDF()
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.add_page()
    pdf.set_font("Helvetica", size=16)
    pdf.cell(0, 10, txt="Startup Idea Analysis", ln=True)

    pdf.set_font("Helvetica", size=10)
    pdf.cell(0, 8, txt=f"Generated at: {result.generated_at}", ln=True)
    pdf.cell(0, 8, txt=f"Model: {result.model} | Language: {result.language}", ln=True)
    pdf.ln(4)

    def section(title: str) -> None:
        pdf.set_font("Helvetica", style="B", size=12)
        pdf.cell(0, 8, txt=title, ln=True)
        pdf.set_font("Helvetica", size=11)

    section("Idea")
    pdf.multi_cell(0, 6, txt=result.idea)
    pdf.ln(2)

    section("Summary")
    pdf.multi_cell(0, 6, txt=result.llm_result.summary)
    pdf.ln(2)

    section("Market Analysis")
    ma = result.llm_result.market_analysis
    pdf.multi_cell(0, 6, txt=f"Market size: {ma.market_size}")
    if ma.competitors:
        pdf.multi_cell(0, 6, txt="Competitors: " + ", ".join(ma.competitors))
    if ma.opportunities:
        pdf.multi_cell(0, 6, txt="Opportunities: " + ", ".join(ma.opportunities))
    if ma.risks:
        pdf.multi_cell(0, 6, txt="Risks: " + ", ".join(ma.risks))
    pdf.ln(2)

    section("Business Model Canvas")
    bmc = result.llm_result.business_model_canvas
    for label, items in [
        ("Key partners", bmc.key_partners),
        ("Key activities", bmc.key_activities),
        ("Key resources", bmc.key_resources),
        ("Value propositions", bmc.value_propositions),
        ("Customer relationships", bmc.customer_relationships),
        ("Channels", bmc.channels),
        ("Customer segments", bmc.customer_segments),
        ("Cost structure", bmc.cost_structure),
        ("Revenue streams", bmc.revenue_streams),
    ]:
        if items:
            pdf.set_font("Helvetica", style="B", size=11)
            pdf.cell(0, 6, txt=label + ":", ln=True)
            pdf.set_font("Helvetica", size=11)
            pdf.multi_cell(0, 6, txt="; ".join(items))
            pdf.ln(1)

    section("Marketing Strategy (5 steps)")
    if result.llm_result.marketing_strategy:
        for idx, step in enumerate(result.llm_result.marketing_strategy, 1):
            pdf.multi_cell(0, 6, txt=f"{idx}. {step}")
    pdf.ln(2)

    section("Scores")
    pdf.multi_cell(
        0,
        6,
        txt=(
            f"LLM viability: {result.llm_result.viability_score}/100\n"
            f"Heuristic score: {result.heuristic_score}/100\n"
            f"Combined score: {result.combined_score}/100"
        ),
    )

    pdf.output(pdf_path)


# -----------------------------
# CLI and Main Flow
# -----------------------------


def parse_args(argv: Optional[List[str]] = None) -> argparse.Namespace:
    """Parse CLI arguments."""
    parser = argparse.ArgumentParser(
        description="Analyze a startup idea with Gemini and output structured results",
    )
    idea_group = parser.add_mutually_exclusive_group(required=True)
    idea_group.add_argument("--idea", type=str, help="Idea text input")
    idea_group.add_argument("--idea-file", type=str, help="Path to a text file containing the idea")

    parser.add_argument("--language", type=str, default="fr", help="Output language: fr or en (default: fr)")
    parser.add_argument("--model", type=str, default="gemini-1.5-pro", help="Gemini model name")
    parser.add_argument("--temperature", type=float, default=0.2, help="Generation temperature (default: 0.2)")

    parser.add_argument("--local-summarizer", dest="local_summarizer", action="store_true", help="Enable optional local summarization pre-step")
    parser.add_argument("--no-local-summarizer", dest="local_summarizer", action="store_false", help="Disable local summarization pre-step")
    parser.set_defaults(local_summarizer=False)

    parser.add_argument("--output", type=str, choices=["json", "pdf", "both"], default="json", help="Output format")
    parser.add_argument("--outdir", type=str, default="./outputs", help="Directory for outputs")
    parser.add_argument("--outfile", type=str, default="analysis", help="Base filename without extension")
    parser.add_argument("--weight-llm", type=float, default=0.6, help="Weight for LLM score in combined score (0-1)")

    return parser.parse_args(argv)


def main(argv: Optional[List[str]] = None) -> int:
    """Entry point for CLI run."""
    args = parse_args(argv)

    load_dotenv_if_present()
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        print("ERROR: GOOGLE_API_KEY is not set in environment.", file=sys.stderr)
        return 2

    # Prepare idea text
    if args.idea:
        idea_raw = args.idea
    else:
        idea_raw = read_text_file(args.idea_file)

    idea_clean = clean_text(idea_raw)

    # Optional local summarization to shorten very long inputs
    if args.local_summarizer and len(idea_clean) > 1500:
        pre_summary = try_local_summarize(idea_clean)
        if pre_summary:
            idea_clean = f"Résumé (pré-traitement): {pre_summary}\n\nDétails: {idea_clean}"

    # Configure and call Gemini
    configure_gemini(api_key)
    llm_result = analyze_with_gemini(
        idea_text=idea_clean, language=args.language, model_name=args.model, temperature=args.temperature
    )

    # Compute scores
    heuristic_score = compute_heuristic_score(llm_result)
    combined_score = combine_scores(heuristic_score, llm_result.viability_score, weight_llm=args.weight_llm)

    final = FinalOutput(
        idea=idea_clean,
        language=args.language,
        model=args.model,
        llm_result=llm_result,
        heuristic_score=heuristic_score,
        combined_score=combined_score,
        generated_at=datetime.utcnow().isoformat(timespec="seconds") + "Z",
    )

    # Outputs
    ensure_dir(args.outdir)
    base_path = os.path.join(args.outdir, args.outfile)

    if args.output in ("json", "both"):
        json_path = base_path + ".json"
        with open(json_path, "w", encoding="utf-8") as f:
            f.write(final.model_dump_json(indent=2, ensure_ascii=False))
        print(f"Saved JSON to: {json_path}")

    if args.output in ("pdf", "both"):
        pdf_path = base_path + ".pdf"
        export_to_pdf(final, pdf_path)
        print(f"Saved PDF to: {pdf_path}")

    # Also print concise console summary
    print("\n=== Summary ===")
    print(final.llm_result.summary)
    print("\nScores:")
    print(f"LLM viability: {final.llm_result.viability_score}/100")
    print(f"Heuristic score: {final.heuristic_score}/100")
    print(f"Combined score: {final.combined_score}/100")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())

