# SORIN - Luxury Clothing Brand Website

A premium, elegant, and minimalist ecommerce website for the luxury clothing brand "Sorin" with a focus on timeless, high-end fashion.

## 🎯 Target Audience
Affluent, fashion-conscious individuals looking for timeless, high-end fashion pieces.

## 🎨 Design Philosophy
- **Minimalist** layout with clean lines and elegant spacing
- **Black & white** color palette with **gold accents** (#c9a96e)
- **Premium typography** using Playfair Display and Inter fonts
- **Luxurious imagery** showcasing high-end fashion
- **Smooth animations** and transitions for a premium feel

## 📁 Project Structure

```
sorin-luxury-website/
├── sorin-homepage.html      # Main landing page
├── sorin-shop.html          # Luxury boutique/shop page
├── sorin-styles.css         # Main stylesheet
├── sorin-shop-styles.css    # Additional shop page styles
├── sorin-script.js          # JavaScript functionality
└── README.md                # Project documentation
```

## ✨ Features

### Homepage (`sorin-homepage.html`)
- **Hero Section** with brand name, tagline "Eternal Elegance", and call-to-action
- **Product Showcase** featuring 6 luxury items with hover animations
- **Brand Story** section with company heritage and statistics
- **Newsletter Subscription** with email validation
- **Responsive Design** optimized for all devices

### Shop Page (`sorin-shop.html`)
- **Product Grid** with luxury boutique layout
- **Filtering System** by category (Women's, Men's, Accessories) and price range
- **Sorting Options** (Featured, Newest, Price, Name)
- **Shopping Cart** functionality with local storage
- **Product Badges** (New, Bestseller, Luxury)
- **Smooth Animations** for filtering and interactions

### Technical Features
- **Mobile-First** responsive design
- **Smooth Scrolling** navigation
- **Sticky Transparent** navbar with scroll effects
- **Cart Persistence** using localStorage
- **Form Validation** for newsletter signup
- **Accessibility** features including keyboard navigation
- **Performance Optimized** with lazy loading and debounced events

## 🚀 Quick Start

1. **Download** all project files to your local directory
2. **Open** `sorin-homepage.html` in your web browser
3. **Navigate** to the shop page using the "Boutique" link in the menu

### File Dependencies
- All files should be in the same directory
- External dependencies are loaded via CDN:
  - Bootstrap 5.3.0
  - Font Awesome 6.4.0
  - Google Fonts (Playfair Display, Inter)

## 🎨 Color Palette

```css
Primary Black:   #000000
Primary White:   #ffffff
Accent Gold:     #c9a96e
Deep Beige:      #8b7355
Light Gray:      #f8f9fa
Medium Gray:     #6c757d
Dark Gray:       #343a40
```

## 📱 Responsive Breakpoints

- **Desktop**: 1200px and above
- **Tablet**: 768px - 1199px
- **Mobile**: Below 768px

## 🛍️ Shopping Cart Features

- **Add to Cart** functionality on all product cards
- **Cart Counter** in navigation showing total items
- **Local Storage** persistence across sessions
- **Notification System** for cart updates
- **Duplicate Handling** (increases quantity for existing items)

## 🔧 Customization

### Adding New Products
1. Copy an existing product card structure
2. Update the `data-category` and `data-price` attributes
3. Replace image URL and product information
4. Add appropriate badges if needed

### Modifying Colors
Update the CSS custom properties in `sorin-styles.css`:
```css
:root {
    --primary-black: #000000;
    --accent-gold: #c9a96e;
    /* Add your custom colors */
}
```

### Adding Categories
1. Add new radio button in the filter section
2. Update the `filterProducts()` function in JavaScript
3. Add corresponding `data-category` to product items

## 🌟 Performance Features

- **Intersection Observer** for scroll animations
- **Debounced Events** for scroll and resize handlers
- **Lazy Loading** support for images
- **Optimized CSS** with efficient selectors
- **Minified Dependencies** via CDN

## ♿ Accessibility

- **Semantic HTML** structure
- **ARIA Labels** for screen readers
- **Keyboard Navigation** support
- **Focus Management** for interactive elements
- **High Contrast** mode support
- **Alt Text** for all images

## 🔮 Future Enhancements

- **Product Detail Modal** for quick view functionality
- **User Authentication** system
- **Wishlist** functionality
- **Search** functionality
- **Multiple Product Images** gallery
- **Size Selection** for clothing items
- **Customer Reviews** system
- **Payment Integration**

## 📄 Browser Support

- **Chrome** 90+
- **Firefox** 88+
- **Safari** 14+
- **Edge** 90+

## 📝 License

This project is created for demonstration purposes. All images are sourced from Unsplash and are free to use under their license.

## 👨‍💻 Development

### Local Development
Simply open the HTML files in your browser. No build process required.

### Making Changes
1. Edit HTML files for structure changes
2. Modify CSS files for styling updates
3. Update JavaScript file for functionality changes
4. Test across different devices and browsers

## 📞 Support

For questions or support regarding this luxury fashion website, please refer to the code comments or contact the development team.

---

**Built with ❤️ for luxury fashion enthusiasts**

*Sorin - Where elegance meets excellence*