// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functionality
    initScrollAnimations();
    initSmoothScrolling();
    initCounterAnimations();
    initParallaxEffects();
    initButtonEffects();
});

// Scroll Animations
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                
                // Trigger counter animation when stats section is visible
                if (entry.target.closest('.stats-section')) {
                    animateCounters();
                }
            }
        });
    }, observerOptions);

    // Observe all elements with fade-in-scroll class
    const elementsToAnimate = document.querySelectorAll('.fade-in-scroll');
    elementsToAnimate.forEach(el => observer.observe(el));
}

// Smooth Scrolling for anchor links
function initSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Counter Animation for Stats
function initCounterAnimations() {
    let countersAnimated = false;
    
    window.animateCounters = function() {
        if (countersAnimated) return;
        countersAnimated = true;
        
        const counters = document.querySelectorAll('.stat-number');
        
        counters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-count'));
            const increment = target / 100;
            let current = 0;
            
            const updateCounter = () => {
                if (current < target) {
                    current += increment;
                    counter.textContent = Math.ceil(current);
                    setTimeout(updateCounter, 20);
                } else {
                    counter.textContent = target;
                }
            };
            
            updateCounter();
        });
    };
}

// Parallax Effects
function initParallaxEffects() {
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const parallaxElements = document.querySelectorAll('.hero-section::before');
        
        // Add subtle parallax to hero background
        const heroSection = document.querySelector('.hero-section');
        if (heroSection) {
            const speed = scrolled * 0.5;
            heroSection.style.transform = `translateY(${speed}px)`;
        }
    });
}

// Button Effects and Interactions
function initButtonEffects() {
    // Add ripple effect to buttons
    const buttons = document.querySelectorAll('.btn-buy-now, .btn-primary-glow');
    
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
    
    // Add hover sound effect (optional)
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px) scale(1.02)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
}

// Glitch Effect Enhancement
function enhanceGlitchEffect() {
    const glitchElement = document.querySelector('.glitch-effect');
    
    if (glitchElement) {
        setInterval(() => {
            glitchElement.style.textShadow = `
                ${Math.random() * 10 - 5}px ${Math.random() * 10 - 5}px 0 #ff0040,
                ${Math.random() * 10 - 5}px ${Math.random() * 10 - 5}px 0 #00ffff
            `;
            
            setTimeout(() => {
                glitchElement.style.textShadow = 'none';
            }, 100);
        }, 3000 + Math.random() * 2000);
    }
}

// Loading Animation
function initLoadingAnimation() {
    window.addEventListener('load', function() {
        const heroContent = document.querySelector('.hero-content');
        if (heroContent) {
            heroContent.style.opacity = '0';
            heroContent.style.transform = 'translateY(50px)';
            
            setTimeout(() => {
                heroContent.style.transition = 'all 1s ease-out';
                heroContent.style.opacity = '1';
                heroContent.style.transform = 'translateY(0)';
            }, 300);
        }
    });
}

// Mouse Movement Effects
function initMouseEffects() {
    const heroSection = document.querySelector('.hero-section');
    
    if (heroSection) {
        heroSection.addEventListener('mousemove', function(e) {
            const mouseX = e.clientX / window.innerWidth;
            const mouseY = e.clientY / window.innerHeight;
            
            const moveX = (mouseX - 0.5) * 20;
            const moveY = (mouseY - 0.5) * 20;
            
            const heroTitle = document.querySelector('.hero-title');
            if (heroTitle) {
                heroTitle.style.transform = `translate(${moveX}px, ${moveY}px)`;
            }
        });
    }
}

// Product Image Hover Effects
function initProductImageEffects() {
    const productImages = document.querySelectorAll('.product-image img, .gallery-item img');
    
    productImages.forEach(img => {
        img.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.05) rotate(1deg)';
            this.style.filter = 'brightness(1.1) contrast(1.1)';
        });
        
        img.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1) rotate(0deg)';
            this.style.filter = 'brightness(1) contrast(1)';
        });
    });
}

// Navbar Hide/Show on Scroll (if needed in future)
function initNavbarScroll() {
    let lastScrollTop = 0;
    
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Future navbar functionality can be added here
        
        lastScrollTop = scrollTop;
    });
}

// Performance Optimization - Throttle scroll events
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Initialize all enhancements
document.addEventListener('DOMContentLoaded', function() {
    enhanceGlitchEffect();
    initLoadingAnimation();
    initMouseEffects();
    initProductImageEffects();
    initNavbarScroll();
});

// Add CSS for ripple effect
const style = document.createElement('style');
style.textContent = `
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        pointer-events: none;
        animation: ripple-animation 0.6s linear;
        z-index: 1;
    }
    
    @keyframes ripple-animation {
        to {
            transform: scale(2);
            opacity: 0;
        }
    }
    
    .btn-buy-now, .btn-primary-glow {
        position: relative;
        overflow: hidden;
    }
`;
document.head.appendChild(style);

// Add performance monitoring
function monitorPerformance() {
    if ('performance' in window) {
        window.addEventListener('load', function() {
            setTimeout(function() {
                const perfData = performance.getEntriesByType('navigation')[0];
                console.log('Page load time:', perfData.loadEventEnd - perfData.loadEventStart, 'ms');
            }, 0);
        });
    }
}

monitorPerformance();

// Error handling for missing elements
function safeQuerySelector(selector, callback) {
    const element = document.querySelector(selector);
    if (element && callback) {
        callback(element);
    }
    return element;
}

// Accessibility improvements
function initAccessibility() {
    // Add keyboard navigation support
    const focusableElements = document.querySelectorAll('button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])');
    
    focusableElements.forEach(element => {
        element.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                if (this.tagName === 'BUTTON' || this.tagName === 'A') {
                    this.click();
                }
            }
        });
    });
    
    // Add focus indicators
    focusableElements.forEach(element => {
        element.addEventListener('focus', function() {
            this.style.outline = '2px solid #ff0040';
            this.style.outlineOffset = '2px';
        });
        
        element.addEventListener('blur', function() {
            this.style.outline = 'none';
        });
    });
}

// Initialize accessibility features
document.addEventListener('DOMContentLoaded', initAccessibility);

// Export functions for potential module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initScrollAnimations,
        initSmoothScrolling,
        initCounterAnimations,
        throttle
    };
}