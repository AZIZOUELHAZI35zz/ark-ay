/*
===================================
SORIN - LUXURY CLOTHING BRAND
JavaScript Functionality
===================================
*/

// Global Variables
let cart = [];
let filteredProducts = [];

// DOM Elements
const navbar = document.getElementById('mainNav');
const cartCount = document.querySelector('.cart-count');
const productsGrid = document.getElementById('products-grid');
const productCountElement = document.getElementById('product-count');

// Initialize website when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeWebsite();
});

// Main initialization function
function initializeWebsite() {
    initNavbar();
    initSmoothScrolling();
    initAnimations();
    initProductFiltering();
    initCartFunctionality();
    initNewsletterForm();
    updateCartDisplay();
}

// ===================================
// NAVBAR FUNCTIONALITY
// ===================================

function initNavbar() {
    // Navbar scroll effect
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Close mobile menu when clicking on links
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
    const navbarCollapse = document.querySelector('.navbar-collapse');
    
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navbarCollapse.classList.contains('show')) {
                const navbarToggler = document.querySelector('.navbar-toggler');
                navbarToggler.click();
            }
        });
    });
}

// ===================================
// SMOOTH SCROLLING
// ===================================

function initSmoothScrolling() {
    // Smooth scroll for anchor links
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Skip empty hashes and non-element targets
            if (href === '#' || href === '#!') return;
            
            const targetElement = document.querySelector(href);
            if (targetElement) {
                e.preventDefault();
                
                const navbarHeight = navbar.offsetHeight;
                const targetPosition = targetElement.offsetTop - navbarHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ===================================
// SCROLL ANIMATIONS
// ===================================

function initAnimations() {
    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animatedElements = document.querySelectorAll('.product-card, .about-content, .newsletter-section');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// ===================================
// PRODUCT FILTERING (SHOP PAGE)
// ===================================

function initProductFiltering() {
    if (!productsGrid) return; // Only run on shop page
    
    const categoryFilters = document.querySelectorAll('input[name="category"]');
    const priceFilters = document.querySelectorAll('input[type="checkbox"]');
    const sortSelect = document.querySelector('.sort-select');
    
    // Get all product items
    const allProducts = Array.from(document.querySelectorAll('.product-item'));
    filteredProducts = [...allProducts];
    
    // Category filtering
    categoryFilters.forEach(filter => {
        filter.addEventListener('change', function() {
            filterProducts();
        });
    });
    
    // Price filtering
    priceFilters.forEach(filter => {
        filter.addEventListener('change', function() {
            filterProducts();
        });
    });
    
    // Sorting
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            sortProducts(this.value);
        });
    }
    
    // Initial product count
    updateProductCount();
}

function filterProducts() {
    const selectedCategory = document.querySelector('input[name="category"]:checked').value;
    const selectedPrices = Array.from(document.querySelectorAll('input[type="checkbox"]:checked'))
        .map(checkbox => checkbox.value);
    
    const allProducts = Array.from(document.querySelectorAll('.product-item'));
    
    filteredProducts = allProducts.filter(product => {
        // Category filter
        const productCategory = product.dataset.category;
        const categoryMatch = selectedCategory === 'all' || productCategory === selectedCategory;
        
        // Price filter
        let priceMatch = true;
        if (selectedPrices.length > 0) {
            const productPrice = parseInt(product.dataset.price);
            priceMatch = selectedPrices.some(priceRange => {
                const [min, max] = priceRange.split('-').map(p => p.replace('+', ''));
                const minPrice = parseInt(min) || 0;
                const maxPrice = max ? parseInt(max) : Infinity;
                return productPrice >= minPrice && productPrice <= maxPrice;
            });
        }
        
        return categoryMatch && priceMatch;
    });
    
    // Show/hide products with animation
    allProducts.forEach(product => {
        if (filteredProducts.includes(product)) {
            product.classList.remove('hidden');
            product.classList.add('filter-fade');
        } else {
            product.classList.add('hidden');
        }
    });
    
    updateProductCount();
    
    // Remove animation class after animation completes
    setTimeout(() => {
        document.querySelectorAll('.filter-fade').forEach(el => {
            el.classList.remove('filter-fade');
        });
    }, 500);
}

function sortProducts(sortBy) {
    const container = productsGrid;
    const products = [...filteredProducts];
    
    products.sort((a, b) => {
        switch (sortBy) {
            case 'price-low':
                return parseInt(a.dataset.price) - parseInt(b.dataset.price);
            case 'price-high':
                return parseInt(b.dataset.price) - parseInt(a.dataset.price);
            case 'name':
                const nameA = a.querySelector('.product-name').textContent;
                const nameB = b.querySelector('.product-name').textContent;
                return nameA.localeCompare(nameB);
            case 'newest':
                // Simulate newest by checking for "New" badge
                const hasNewA = a.querySelector('.badge-new') ? 1 : 0;
                const hasNewB = b.querySelector('.badge-new') ? 1 : 0;
                return hasNewB - hasNewA;
            default: // featured
                return 0;
        }
    });
    
    // Re-append products in new order
    products.forEach(product => {
        container.appendChild(product);
    });
}

function updateProductCount() {
    if (productCountElement) {
        productCountElement.textContent = filteredProducts.length;
    }
}

// ===================================
// CART FUNCTIONALITY
// ===================================

function initCartFunctionality() {
    // Add to cart buttons
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('add-to-cart')) {
            const productCard = e.target.closest('.product-card, .product-card-shop');
            if (productCard) {
                addToCart(productCard);
            }
        }
    });
}

function addToCart(productCard) {
    const productName = productCard.querySelector('.product-name').textContent;
    const productPrice = productCard.querySelector('.product-price').textContent;
    const productImage = productCard.querySelector('img').src;
    
    const product = {
        id: Date.now(), // Simple ID generation
        name: productName,
        price: productPrice,
        image: productImage,
        quantity: 1
    };
    
    // Check if product already exists in cart
    const existingProduct = cart.find(item => item.name === product.name);
    
    if (existingProduct) {
        existingProduct.quantity += 1;
    } else {
        cart.push(product);
    }
    
    updateCartDisplay();
    showCartNotification(product.name);
    
    // Save cart to localStorage
    localStorage.setItem('sorinCart', JSON.stringify(cart));
}

function updateCartDisplay() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartCount) {
        cartCount.textContent = totalItems;
        cartCount.style.display = totalItems > 0 ? 'inline-flex' : 'none';
    }
}

function showCartNotification(productName) {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: var(--accent-gold);
        color: white;
        padding: 1rem 2rem;
        border-radius: 0;
        box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        z-index: 9999;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        font-family: var(--font-secondary);
        font-size: 0.9rem;
        max-width: 300px;
    `;
    
    notification.innerHTML = `
        <strong>Added to Cart</strong><br>
        ${productName}
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Animate out and remove
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Load cart from localStorage on page load
function loadCartFromStorage() {
    const savedCart = localStorage.getItem('sorinCart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartDisplay();
    }
}

// ===================================
// NEWSLETTER FORM
// ===================================

function initNewsletterForm() {
    const newsletterForm = document.querySelector('.newsletter-form');
    
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const emailInput = this.querySelector('input[type="email"]');
            const email = emailInput.value.trim();
            
            if (email && isValidEmail(email)) {
                // Simulate newsletter subscription
                showNewsletterSuccess();
                emailInput.value = '';
            } else {
                showNewsletterError();
            }
        });
    }
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showNewsletterSuccess() {
    showNotification('Thank you for subscribing to our newsletter!', 'success');
}

function showNewsletterError() {
    showNotification('Please enter a valid email address.', 'error');
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    const backgroundColor = type === 'success' ? 'var(--accent-gold)' : '#dc3545';
    
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${backgroundColor};
        color: white;
        padding: 1rem 2rem;
        border-radius: 0;
        box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        z-index: 9999;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        font-family: var(--font-secondary);
        font-size: 0.9rem;
        max-width: 300px;
    `;
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Animate out and remove
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 4000);
}

// ===================================
// PRODUCT QUICK VIEW (FUTURE ENHANCEMENT)
// ===================================

function initQuickView() {
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('quick-view')) {
            e.preventDefault();
            const productCard = e.target.closest('.product-card, .product-card-shop');
            if (productCard) {
                // This would open a modal with product details
                console.log('Quick view for:', productCard.querySelector('.product-name').textContent);
            }
        }
    });
}

// ===================================
// PERFORMANCE OPTIMIZATIONS
// ===================================

// Lazy loading for images
function initLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));
}

// Debounce function for performance
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ===================================
// WINDOW EVENTS
// ===================================

// Handle resize events
window.addEventListener('resize', debounce(function() {
    // Update any size-dependent calculations
    updateNavbar();
}, 250));

function updateNavbar() {
    // Close mobile menu on resize to desktop
    if (window.innerWidth > 992) {
        const navbarCollapse = document.querySelector('.navbar-collapse');
        if (navbarCollapse.classList.contains('show')) {
            navbarCollapse.classList.remove('show');
        }
    }
}

// ===================================
// INITIALIZE ON LOAD
// ===================================

// Load cart when page loads
window.addEventListener('load', function() {
    loadCartFromStorage();
    initLazyLoading();
    initQuickView();
});

// ===================================
// UTILITY FUNCTIONS
// ===================================

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

// Get product price as number
function getProductPrice(priceString) {
    return parseFloat(priceString.replace(/[^0-9.-]+/g, ''));
}

// ===================================
// ACCESSIBILITY IMPROVEMENTS
// ===================================

// Keyboard navigation for custom elements
document.addEventListener('keydown', function(e) {
    // Handle Enter key on custom buttons
    if (e.key === 'Enter' && e.target.classList.contains('add-to-cart')) {
        e.target.click();
    }
    
    // Handle Escape key for notifications
    if (e.key === 'Escape') {
        const notifications = document.querySelectorAll('[style*="position: fixed"]');
        notifications.forEach(notification => {
            if (notification.style.transform !== 'translateX(100%)') {
                notification.style.transform = 'translateX(100%)';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }
        });
    }
});

// Focus management for modal elements
function trapFocus(element) {
    const focusableElements = element.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    element.addEventListener('keydown', function(e) {
        if (e.key === 'Tab') {
            if (e.shiftKey) {
                if (document.activeElement === firstElement) {
                    lastElement.focus();
                    e.preventDefault();
                }
            } else {
                if (document.activeElement === lastElement) {
                    firstElement.focus();
                    e.preventDefault();
                }
            }
        }
    });
}

// ===================================
// ERROR HANDLING
// ===================================

// Global error handling
window.addEventListener('error', function(e) {
    console.error('Sorin Website Error:', e.error);
    // You could send this to an error reporting service
});

// Unhandled promise rejections
window.addEventListener('unhandledrejection', function(e) {
    console.error('Unhandled Promise Rejection:', e.reason);
    e.preventDefault();
});

console.log('Sorin Luxury Fashion Website - JavaScript Loaded Successfully ✨');