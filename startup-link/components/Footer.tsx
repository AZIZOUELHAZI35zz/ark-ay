export default function Footer() {
  return (
    <footer className="border-t border-black/5 bg-white">
      <div className="container-xl py-8 text-sm text-black/60 flex items-center justify-between">
        <p>© {new Date().getFullYear()} StartupLink</p>
        <p>
          Built with Next.js, Firebase, Tailwind and Framer Motion
        </p>
      </div>
    </footer>
  );
}
