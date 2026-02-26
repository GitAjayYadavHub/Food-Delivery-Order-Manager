# Food-Delivery-Order-Manager
A web application for managing food delivery orders with intelligent delivery assignment based on proximity and payment status.
# 🍔 FoodFleet - Food Delivery Manager

A professional food delivery order management system with intelligent delivery assignment, real-time tracking, and interactive restaurant browsing.

## 👨‍💻 Developer

**Name**: Ajay Yadav  
**Phone**: +91 8126783617  
**Email**: ajayyadav3617@outlook.com  
**Location**: 142 Govindpuram, Ghaziabad, Uttar Pradesh 201013  
**Service**: 24/7 Available

---

## 🚀 Live Demo

**Deployment URL**: https://food-delivery-ordered-manager.vercel.app/ 

**GitHub Repository**: https://github.com/GitAjayYadavHub/Food-Delivery-Order-Manager

---

## ✨ Features

### Core Functionality
- ✅ **Add Orders** - Create new delivery orders with smart autocomplete
- ✅ **View Orders** - Display all orders sorted by delivery distance
- ✅ **Filter Orders** - Filter by payment status and maximum distance
- ✅ **Assign Delivery** - Intelligent algorithm assigns nearest unpaid order
- ✅ **Delete Orders** - Remove orders with confirmation

### Enhanced Features
- 🎯 **Smart Autocomplete** - Auto-suggestions for Order ID and Restaurant Name
- 🍽️ **Interactive Cuisines** - Browse 8 cuisines with 40+ restaurants
- 📊 **Real-time Statistics** - Live counters for total, paid, and unpaid orders
- 💾 **Data Persistence** - Orders saved in localStorage
- 🎨 **Modern UI/UX** - Beautiful, responsive design with animations
- 📱 **Mobile Responsive** - Works perfectly on all devices

---

## 🎯 Assignment Compliance

### Mandatory Requirements Met ✅
- ✅ Add Order through UI
- ✅ View All Orders functionality
- ✅ Filter by Paid/Unpaid status
- ✅ Filter by maximum distance
- ✅ Assign nearest unpaid order algorithm
- ✅ Handle "No order available" case
- ✅ Complete and usable UI
- ✅ Clean, modular code
- ✅ Comprehensive error handling

---

## 🛠️ Technology Stack

- **HTML5** - Semantic markup
- **CSS3** - Modern styling with animations
- **JavaScript (ES6+)** - Vanilla JS, no frameworks
- **LocalStorage** - Client-side data persistence
- **Flaticon** - Professional food icons

---

## 📂 Project Structure

```
Symb/
├── FrontEnd/
│   ├── index.html          # Main application file
│   ├── style.css           # Complete styling
│   └── body.js             # All functionality
├── README.md               # This file
├── .gitignore              # Git ignore rules
├── vercel.json             # Vercel deployment config
```

---

## 🌐 Deployment

### Deploy to Vercel
1. Visit: https://food-delivery-ordered-manager.vercel.app/
2. Drag and drop the `Food-Delivery-Order-Manager` folder
3. Get your live URL!

### Deploy to GitHub Pages
1. Push code to GitHub
2. Go to Settings → Pages
3. Select `/Food-Delivery-Order-Manager` as source
4. Deploy!

---

## 📖 Usage Guide

### Adding an Order
1. Fill in Order ID
2. Enter Restaurant Name (autocomplete shows popular restaurants)
3. Specify number of items
4. Enter delivery distance in KM
5. Check "Order is Paid" if applicable
6. Click "Add Order"

### Filtering Orders
1. Select payment status (All/Paid/Unpaid)
2. Enter maximum distance (optional)
3. Click "Apply Filters"
4. Click "Clear Filters" to reset

### Assigning Delivery
1. Enter maximum distance for delivery
2. Click "Assign Nearest Unpaid Order"
3. System finds the closest unpaid order
4. Result displayed in output panel

### Browsing Cuisines
1. Click on any cuisine card (Italian, Chinese, etc.)
2. Modal opens with 5 restaurants and menu items
3. Click "Order Now" to auto-fill form
4. Complete and submit order

---

## 🧮 Delivery Assignment Algorithm

```javascript
// Core Logic:
1. Filter unpaid orders within maximum distance
2. If no orders found → Display "No order available"
3. If orders found → Find minimum distance order
4. Return assigned order with details

Time Complexity: O(n)
Space Complexity: O(k) where k = eligible orders
```

---

## 🎨 Key Features Breakdown

### 1. Smart Autocomplete
- **Order ID**: Auto-generates ORD001, ORD002, etc.
- **Restaurant Name**: 20+ popular restaurants with cuisine tags
- **Keyboard Navigation**: Use ↑/↓ arrows and Enter
- **Recent History**: Shows previously used restaurants

### 2. Interactive Cuisines (8 Cuisines × 5 Restaurants = 40 Total)
- Italian & Pizza
- Burgers & Fast Food
- Chinese & Asian
- Sushi & Japanese
- Mexican & More
- Indian & Curry
- Healthy & Fresh
- Desserts & Sweets

### 3. Real-time Validation
- Duplicate Order ID detection
- Range validation (items 1-100, distance > 0)
- Required field checks
- User-friendly error messages

---

## 📊 Data Model

```javascript
{
    orderId: String,          // Unique identifier
    restaurantName: String,   // Restaurant name
    itemCount: Number,        // Number of items (1-100)
    isPaid: Boolean,          // Payment status
    deliveryDistance: Number  // Distance in KM (> 0)
}
```

---

## ✅ Testing Checklist

- [x] Add order with valid inputs
- [x] Add order with duplicate ID (rejected)
- [x] Add order with invalid values (validated)
- [x] Filter by payment status
- [x] Filter by distance
- [x] Assign delivery with eligible orders
- [x] Assign delivery with no eligible orders
- [x] Delete order
- [x] Data persists after refresh
- [x] Mobile responsive
- [x] Cross-browser compatible

---

## 📱 Browser Compatibility

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

---

## 🔮 Future Enhancements

- Backend integration (Node.js + MongoDB)
- User authentication
- Real-time order tracking with maps
- Push notifications
- Payment gateway integration
- Restaurant admin dashboard
- Order history and analytics
- Multi-language support

---

## 📞 Contact & Support

**Developer**: Ajay Yadav  
**Phone**: +91 8126783617  
**Email**: ajayyadav3617@outlook.com  
**Address**: 142 Govindpuram, Ghaziabad, Uttar Pradesh 201013, India  
**Service Hours**: 24/7 Available

---

## 🙏 Acknowledgments

- **Icons**: [Flaticon](https://www.flaticon.com/)
- **Fonts**: [Google Fonts - Poppins](https://fonts.google.com/)

---

**Built with ❤️ by Ajay Yadav**

*FoodFleet - Your trusted food delivery partner, available 24/7*

---

**Last Updated**: 2026  
**Version**: 1.1  
**Status**: Production Ready ✅
