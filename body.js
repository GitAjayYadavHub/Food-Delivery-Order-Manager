let orders = [];
let filteredOrders = [];
let currentFilters = {
    status: 'all',
    maxDistance: null
};

document.addEventListener('DOMContentLoaded', function() {
    loadOrdersFromStorage();
    
    const form = document.getElementById('addOrderForm');
    form.addEventListener('submit', handleAddOrder);
    
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactForm);
    }
    
    setupLogoClicks();
    
    renderOrders();
    updateStats();
});

function setupLogoClicks() {
    const logos = document.querySelectorAll('.logo, .footer-logo');
    logos.forEach(logo => {
        logo.addEventListener('click', function(e) {
            e.preventDefault();
            document.getElementById('hero').scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
        });
    });
}

function handleContactForm(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    // Show loading state
    const submitBtn = form.querySelector('.btn-contact');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '⏳ Sending...';
    submitBtn.disabled = true;
    
    // Submit to Formspree
    fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: {
            'Accept': 'application/json'
        }
    })
    .then(response => {
        if (response.ok) {
            showToast('✅ Message sent successfully! We will get back to you soon.', 'success');
            form.reset();
        } else {
            throw new Error('Form submission failed');
        }
    })
    .catch(error => {
        console.error('Form submission error:', error);
        showToast('❌ Failed to send message. Please try again or contact us directly.', 'error');
    })
    .finally(() => {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    });
}



function handleAddOrder(event) {
    event.preventDefault();
    
    const orderId = document.getElementById('orderId').value.trim();
    const restaurantName = document.getElementById('restaurantName').value.trim();
    const itemCount = document.getElementById('itemCount').value;
    const deliveryDistance = document.getElementById('deliveryDistance').value;
    const isPaid = document.getElementById('isPaid').checked;
    
    const validation = validateOrderInput(orderId, restaurantName, itemCount, deliveryDistance);
    if (!validation.isValid) {
        showToast(validation.message, 'error');
        return;
    }
    
    if (orders.some(order => order.orderId.toLowerCase() === orderId.toLowerCase())) {
        showToast('Order ID already exists! Please use a unique Order ID.', 'error');
        return;
    }
    
    const newOrder = {
        orderId: orderId,
        restaurantName: restaurantName,
        itemCount: parseInt(itemCount),
        isPaid: isPaid,
        deliveryDistance: parseFloat(deliveryDistance)
    };
    
    orders.push(newOrder);
    
    saveOrdersToStorage();
    
    document.getElementById('addOrderForm').reset();
    
    // Reset filters to show all orders including the new one
    currentFilters.status = 'all';
    currentFilters.maxDistance = null;
    filteredOrders = [...orders];
    
    renderOrders();
    updateStats();
    
    showToast(`✅ Order ${orderId} added successfully!`, 'success');
    
    document.querySelector('.orders-section').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function validateOrderInput(orderId, restaurantName, itemCount, deliveryDistance) {
    if (!orderId || orderId.length === 0) {
        return { isValid: false, message: '❌ Order ID is required!' };
    }
    
    if (orderId.length < 3) {
        return { isValid: false, message: '❌ Order ID must be at least 3 characters long!' };
    }
    
    if (!restaurantName || restaurantName.length === 0) {
        return { isValid: false, message: '❌ Restaurant Name is required!' };
    }
    
    if (restaurantName.length < 2) {
        return { isValid: false, message: '❌ Restaurant Name must be at least 2 characters long!' };
    }
    
    if (!itemCount || itemCount === '') {
        return { isValid: false, message: '❌ Number of Items is required!' };
    }
    
    const itemCountNum = parseInt(itemCount);
    if (isNaN(itemCountNum)) {
        return { isValid: false, message: '❌ Number of Items must be a valid number!' };
    }
    
    if (itemCountNum < 1) {
        return { isValid: false, message: '❌ Number of Items must be at least 1!' };
    }
    
    if (itemCountNum > 100) {
        return { isValid: false, message: '❌ Number of Items cannot exceed 100!' };
    }
    
    if (!deliveryDistance || deliveryDistance === '') {
        return { isValid: false, message: '❌ Delivery Distance is required!' };
    }
    
    const distanceNum = parseFloat(deliveryDistance);
    if (isNaN(distanceNum)) {
        return { isValid: false, message: '❌ Delivery Distance must be a valid number!' };
    }
    
    if (distanceNum <= 0) {
        return { isValid: false, message: '❌ Delivery Distance must be greater than 0!' };
    }
    
    if (distanceNum > 1000) {
        return { isValid: false, message: '❌ Delivery Distance cannot exceed 1000 KM!' };
    }
    
    return { isValid: true };
}

function applyFilters() {
    const statusFilter = document.getElementById('statusFilter').value;
    const distanceFilter = document.getElementById('distanceFilter').value;
    
    console.log('Applying filters:', { statusFilter, distanceFilter });
    
    // Validate distance filter
    if (distanceFilter && parseFloat(distanceFilter) < 0) {
        showToast('❌ Maximum distance cannot be negative!', 'error');
        return;
    }
    
    // Update current filters
    currentFilters.status = statusFilter;
    currentFilters.maxDistance = distanceFilter ? parseFloat(distanceFilter) : null;
    
    console.log('Current filters set to:', currentFilters);
    console.log('Total orders available:', orders.length);
    
    // Start with all orders
    filteredOrders = [...orders];
    
    // Apply payment status filter
    if (statusFilter === 'paid') {
        filteredOrders = filteredOrders.filter(order => order.isPaid === true);
        console.log(`After paid filter: ${filteredOrders.length} orders`);
    } else if (statusFilter === 'unpaid') {
        filteredOrders = filteredOrders.filter(order => order.isPaid === false);
        console.log(`After unpaid filter: ${filteredOrders.length} orders`);
    }
    
    // Apply distance filter
    if (currentFilters.maxDistance !== null && currentFilters.maxDistance > 0) {
        const beforeDistance = filteredOrders.length;
        filteredOrders = filteredOrders.filter(order => order.deliveryDistance <= currentFilters.maxDistance);
        console.log(`After distance filter (${currentFilters.maxDistance}km): ${filteredOrders.length} orders (was ${beforeDistance})`);
    }
    
    console.log('Final filtered orders:', filteredOrders);
    
    // Update the display
    renderOrders();
    
    // Show feedback to user
    if (orders.length === 0) {
        showToast('📝 Add some orders first to test filtering!', 'warning');
    } else if (filteredOrders.length === 0) {
        showToast('🔍 No orders match the current filters. Try different criteria.', 'warning');
    } else if (statusFilter !== 'all' || currentFilters.maxDistance !== null) {
        showToast(`🔍 Showing ${filteredOrders.length} of ${orders.length} orders.`, 'success');
    }
}

function clearFilters() {
    // Reset form fields
    document.getElementById('statusFilter').value = 'all';
    document.getElementById('distanceFilter').value = '';
    
    // Reset filter state
    currentFilters.status = 'all';
    currentFilters.maxDistance = null;
    
    console.log('Filters cleared. Showing all orders:', orders.length);
    
    // Show all orders
    filteredOrders = [...orders];
    renderOrders();
    
    // Clear any assignment results
    const resultPanel = document.getElementById('assignmentResult');
    if (resultPanel) {
        resultPanel.style.display = 'none';
    }
    
    showToast(`🔄 Filters cleared. Showing all ${orders.length} orders.`, 'success');
}

function assignDelivery() {
    console.log('Assign delivery called');
    
    const maxDistanceInput = document.getElementById('maxDistanceAssign').value;
    console.log('Max distance input:', maxDistanceInput);
    
    // Validate input
    if (!maxDistanceInput || maxDistanceInput === '') {
        showToast('❌ Please enter a maximum distance for assignment!', 'error');
        document.getElementById('maxDistanceAssign').focus();
        return;
    }
    
    const maxDistance = parseFloat(maxDistanceInput);
    
    if (isNaN(maxDistance)) {
        showToast('❌ Maximum distance must be a valid number!', 'error');
        document.getElementById('maxDistanceAssign').focus();
        return;
    }
    
    if (maxDistance <= 0) {
        showToast('❌ Maximum distance must be greater than 0!', 'error');
        document.getElementById('maxDistanceAssign').focus();
        return;
    }
    
    console.log(`Looking for unpaid orders within ${maxDistance} KM`);
    console.log('All orders:', orders);
    
    // Check if we have any orders at all
    if (orders.length === 0) {
        displayAssignmentResult({
            success: false,
            message: 'No orders available',
            details: 'Please add some orders first before assigning delivery.'
        });
        return;
    }
    
    // Filter for eligible orders (unpaid and within distance)
    const eligibleOrders = orders.filter(order => {
        const isUnpaid = !order.isPaid;
        const withinDistance = order.deliveryDistance <= maxDistance;
        console.log(`Order ${order.orderId}: isPaid=${order.isPaid}, distance=${order.deliveryDistance}km, eligible=${isUnpaid && withinDistance}`);
        return isUnpaid && withinDistance;
    });
    
    console.log(`Found ${eligibleOrders.length} eligible orders:`, eligibleOrders);
    
    // Check if any eligible orders found
    if (eligibleOrders.length === 0) {
        const unpaidOrders = orders.filter(order => !order.isPaid);
        let details;
        if (unpaidOrders.length === 0) {
            details = 'All orders are already paid. No delivery assignment needed.';
        } else {
            const closestUnpaid = Math.min(...unpaidOrders.map(order => order.deliveryDistance));
            details = `No unpaid orders within ${maxDistance} KM. Closest unpaid order is ${closestUnpaid} KM away.`;
        }
        
        displayAssignmentResult({
            success: false,
            message: 'No order available',
            details: details
        });
        return;
    }
    
    // Find the nearest order
    let nearestOrder = eligibleOrders[0];
    for (let i = 1; i < eligibleOrders.length; i++) {
        if (eligibleOrders[i].deliveryDistance < nearestOrder.deliveryDistance) {
            nearestOrder = eligibleOrders[i];
        }
    }
    
    console.log('Nearest order selected:', nearestOrder);
    
    displayAssignmentResult({
        success: true,
        order: nearestOrder,
        totalEligible: eligibleOrders.length,
        maxDistance: maxDistance
    });
}

function displayAssignmentResult(result) {
    const resultPanel = document.getElementById('assignmentResult');
    const resultContent = document.getElementById('resultContent');
    
    if (!resultPanel || !resultContent) {
        console.error('Assignment result elements not found');
        return;
    }
    
    resultPanel.style.display = 'block';
    
    if (result.success) {
        resultPanel.className = 'result-panel success';
        resultContent.innerHTML = `
            <div style="line-height: 2; padding: 1rem; background: #f8fff9; border-radius: 8px; border: 1px solid #27ae60;">
                <p style="font-size: 1.2rem; color: #27ae60; font-weight: 600; margin-bottom: 15px;">
                    ✅ Delivery Assigned Successfully!
                </p>
                <div style="background: white; padding: 1rem; border-radius: 6px; margin-bottom: 1rem;">
                    <p><strong>Order ID:</strong> <span style="color: #2c3e50;">${result.order.orderId}</span></p>
                    <p><strong>Restaurant:</strong> <span style="color: #2c3e50;">${result.order.restaurantName}</span></p>
                    <p><strong>Items:</strong> <span style="color: #2c3e50;">${result.order.itemCount}</span></p>
                    <p><strong>Distance:</strong> <span style="color: #2c3e50;">${result.order.deliveryDistance} KM</span></p>
                    <p><strong>Payment Status:</strong> <span style="color: #f39c12; font-weight: 600;">⏳ Unpaid</span></p>
                </div>
                ${result.totalEligible > 1 ? `
                    <p style="color: #7f8c8d; font-style: italic; font-size: 0.9rem;">
                        📊 Selected from ${result.totalEligible} eligible orders within ${result.maxDistance || 'specified'} KM
                    </p>
                ` : `
                    <p style="color: #7f8c8d; font-style: italic; font-size: 0.9rem;">
                        🎯 This was the only eligible order within ${result.maxDistance || 'specified'} KM
                    </p>
                `}
            </div>
        `;
        showToast('✅ Nearest unpaid order assigned successfully!', 'success');
    } else {
        resultPanel.className = 'result-panel error';
        resultContent.innerHTML = `
            <div style="line-height: 2; padding: 1rem; background: #fff5f5; border-radius: 8px; border: 1px solid #e74c3c;">
                <p style="font-size: 1.2rem; color: #e74c3c; font-weight: 600; margin-bottom: 15px;">
                    ❌ ${result.message}
                </p>
                <div style="background: white; padding: 1rem; border-radius: 6px;">
                    <p style="color: #7f8c8d; font-size: 1rem;">${result.details}</p>
                </div>
            </div>
        `;
        showToast('❌ ' + result.message, 'error');
    }
    
    // Scroll to result with a slight delay to ensure rendering
    setTimeout(() => {
        resultPanel.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
}

function renderOrders() {
    const tableBody = document.getElementById('ordersTableBody');
    
    if (!tableBody) {
        console.error('Orders table body not found');
        return;
    }
    
    // Determine which orders to display
    let ordersToDisplay;
    if (currentFilters.status !== 'all' || currentFilters.maxDistance !== null) {
        ordersToDisplay = filteredOrders;
        console.log('Displaying filtered orders:', ordersToDisplay.length);
    } else {
        ordersToDisplay = orders;
        console.log('Displaying all orders:', ordersToDisplay.length);
    }
    
    tableBody.innerHTML = '';
    
    if (ordersToDisplay.length === 0) {
        const emptyMessage = orders.length === 0 
            ? { title: 'No orders yet', text: 'Add your first order above!' }
            : { title: 'No matching orders', text: 'No orders match the current filters. Try different criteria or clear filters.' };
            
        tableBody.innerHTML = `
            <tr class="empty-state">
                <td colspan="6">
                    <div class="empty-content">
                        <span class="empty-icon">📦</span>
                        <h3>${emptyMessage.title}</h3>
                        <p>${emptyMessage.text}</p>
                        ${orders.length > 0 ? '<button onclick="clearFilters()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: var(--primary-color); color: white; border: none; border-radius: 4px; cursor: pointer;">Clear Filters</button>' : ''}
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    // Sort orders by delivery distance (nearest first)
    const sortedOrders = [...ordersToDisplay].sort((a, b) => a.deliveryDistance - b.deliveryDistance);
    
    sortedOrders.forEach((order, index) => {
        const row = document.createElement('tr');
        row.style.animation = `fadeIn 0.3s ease ${index * 0.05}s both`;
        
        // Highlight unpaid orders for easy identification
        if (!order.isPaid) {
            row.style.backgroundColor = 'rgba(255, 107, 53, 0.05)';
        }
        
        row.innerHTML = `
            <td><strong>${escapeHtml(order.orderId)}</strong></td>
            <td>${escapeHtml(order.restaurantName)}</td>
            <td>${order.itemCount}</td>
            <td>${order.deliveryDistance.toFixed(1)} KM</td>
            <td>
                <span class="status-badge ${order.isPaid ? 'paid' : 'unpaid'}">
                    ${order.isPaid ? '✓ Paid' : '⏳ Unpaid'}
                </span>
            </td>
            <td>
                <button class="btn btn-danger" onclick="deleteOrder('${escapeHtml(order.orderId)}')">
                    <span>🗑️</span> Delete
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    console.log(`Rendered ${sortedOrders.length} orders in table`);
}

function deleteOrder(orderId) {
    if (!confirm(`Are you sure you want to delete order "${orderId}"?`)) {
        return;
    }
    
    const index = orders.findIndex(order => order.orderId === orderId);
    
    if (index !== -1) {
        orders.splice(index, 1);
        saveOrdersToStorage();
        applyFilters();
        updateStats();
        showToast(`🗑️ Order ${orderId} deleted successfully!`, 'success');
    } else {
        showToast('❌ Order not found!', 'error');
    }
}

function updateStats() {
    const totalOrders = orders.length;
    const paidOrders = orders.filter(order => order.isPaid).length;
    const unpaidOrders = orders.filter(order => !order.isPaid).length;
    
    document.getElementById('totalOrders').textContent = totalOrders;
    document.getElementById('paidOrders').textContent = paidOrders;
    document.getElementById('unpaidOrders').textContent = unpaidOrders;
}

function saveOrdersToStorage() {
    try {
        localStorage.setItem('foodDeliveryOrders', JSON.stringify(orders));
    } catch (error) {
        console.error('Error saving to localStorage:', error);
        showToast('⚠️ Could not save orders to local storage!', 'warning');
    }
}

function loadOrdersFromStorage() {
    try {
        const stored = localStorage.getItem('foodDeliveryOrders');
        if (stored) {
            orders = JSON.parse(stored);
            filteredOrders = [...orders];
        }
    } catch (error) {
        console.error('Error loading from localStorage:', error);
        showToast('⚠️ Could not load saved orders!', 'warning');
        orders = [];
        filteredOrders = [];
    }
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 4000);
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.toString().replace(/[&<>"']/g, m => map[m]);
}

function loadDemoData() {
    if (orders.length === 0) {
        orders = [
            {
                orderId: 'ORD001',
                restaurantName: 'Dragon Wok (Chinese)',
                itemCount: 3,
                isPaid: false,
                deliveryDistance: 2.5
            },
            {
                orderId: 'ORD002',
                restaurantName: 'Burger Bros',
                itemCount: 2,
                isPaid: true,
                deliveryDistance: 5.2
            },
            {
                orderId: 'ORD003',
                restaurantName: 'Tokyo Sushi Bar',
                itemCount: 5,
                isPaid: false,
                deliveryDistance: 1.8
            },
            {
                orderId: 'ORD004',
                restaurantName: 'Spice Palace (Indian)',
                itemCount: 4,
                isPaid: false,
                deliveryDistance: 7.3
            },
            {
                orderId: 'ORD005',
                restaurantName: 'Mama Mia Pizza',
                itemCount: 2,
                isPaid: true,
                deliveryDistance: 3.1
            },
            {
                orderId: 'ORD006',
                restaurantName: 'Taco Loco (Mexican)',
                itemCount: 3,
                isPaid: false,
                deliveryDistance: 4.2
            }
        ];
        saveOrdersToStorage();
        applyFilters();
        updateStats();
        showToast('📦 Demo data loaded successfully!', 'success');
    } else {
        showToast('⚠️ Orders already exist. Clear all orders first to load demo data.', 'warning');
    }
}

document.addEventListener('keydown', function(event) {
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        document.getElementById('orderId').focus();
    }
});

const cuisineData = {
    italian: {
        name: 'Italian & Pizza',
        icon: 'https://cdn-icons-png.flaticon.com/128/3480/3480618.png',
        description: 'Authentic Italian cuisine from traditional pizzerias and pasta houses',
        restaurants: [
            { name: 'Mama Mia Pizza', rating: 4.5, delivery: '25-35 min', distance: 2.3 },
            { name: 'Pizza Hut', rating: 4.2, delivery: '30-40 min', distance: 3.1 },
            { name: 'Dominos Pizza', rating: 4.3, delivery: '20-30 min', distance: 1.8 },
            { name: 'Olive Garden', rating: 4.6, delivery: '35-45 min', distance: 4.2 },
            { name: 'La Trattoria', rating: 4.7, delivery: '40-50 min', distance: 5.5 }
        ],
        items: ['Margherita Pizza', 'Pepperoni Pizza', 'Spaghetti Carbonara', 'Fettuccine Alfredo', 'Lasagna', 'Risotto', 'Bruschetta', 'Tiramisu']
    },
    american: {
        name: 'Burgers & Fast Food',
        icon: 'https://cdn-icons-png.flaticon.com/128/4727/4727424.png',
        description: 'Classic American favorites - burgers, fries, wings and more',
        restaurants: [
            { name: 'Burger King', rating: 4.1, delivery: '20-30 min', distance: 1.5 },
            { name: 'Burger Bros', rating: 4.4, delivery: '25-35 min', distance: 2.8 },
            { name: 'Five Guys', rating: 4.6, delivery: '30-40 min', distance: 3.5 },
            { name: 'Shake Shack', rating: 4.5, delivery: '25-35 min', distance: 2.1 },
            { name: 'In-N-Out', rating: 4.8, delivery: '35-45 min', distance: 4.8 }
        ],
        items: ['Classic Burger', 'Cheeseburger', 'Bacon Burger', 'French Fries', 'Chicken Wings', 'Hot Dogs', 'Milkshakes', 'Onion Rings']
    },
    chinese: {
        name: 'Chinese & Asian',
        icon: 'https://cdn-icons-png.flaticon.com/128/2515/2515268.png',
        description: 'Delicious Chinese cuisine with noodles, rice dishes and dim sum',
        restaurants: [
            { name: 'Dragon Wok', rating: 4.3, delivery: '30-40 min', distance: 2.5 },
            { name: 'Panda Express', rating: 4.0, delivery: '20-30 min', distance: 1.9 },
            { name: 'China Bistro', rating: 4.5, delivery: '35-45 min', distance: 3.7 },
            { name: 'Wok Palace', rating: 4.4, delivery: '30-40 min', distance: 2.9 },
            { name: 'Lucky Dragon', rating: 4.6, delivery: '40-50 min', distance: 5.2 }
        ],
        items: ['Chow Mein', 'Fried Rice', 'Sweet & Sour Chicken', 'Kung Pao Chicken', 'Dim Sum', 'Spring Rolls', 'Wonton Soup', 'Dumplings']
    },
    japanese: {
        name: 'Sushi & Japanese',
        icon: 'https://cdn-icons-png.flaticon.com/128/2252/2252060.png',
        description: 'Fresh sushi, ramen and authentic Japanese dishes',
        restaurants: [
            { name: 'Tokyo Sushi Bar', rating: 4.7, delivery: '35-45 min', distance: 3.2 },
            { name: 'Sushi Master', rating: 4.8, delivery: '40-50 min', distance: 4.5 },
            { name: 'Ramen House', rating: 4.5, delivery: '30-40 min', distance: 2.7 },
            { name: 'Sakura Japanese', rating: 4.6, delivery: '35-45 min', distance: 3.8 },
            { name: 'Zen Sushi', rating: 4.4, delivery: '25-35 min', distance: 2.2 }
        ],
        items: ['California Roll', 'Salmon Sashimi', 'Tuna Nigiri', 'Ramen Bowl', 'Teriyaki Chicken', 'Tempura', 'Bento Box', 'Miso Soup']
    },
    mexican: {
        name: 'Mexican & More',
        icon: 'https://cdn-icons-png.flaticon.com/128/2921/2921822.png',
        description: 'Spicy and flavorful Mexican cuisine with tacos, burritos and more',
        restaurants: [
            { name: 'Taco Loco', rating: 4.4, delivery: '25-35 min', distance: 2.4 },
            { name: 'Chipotle', rating: 4.2, delivery: '20-30 min', distance: 1.7 },
            { name: 'Taco Bell', rating: 4.0, delivery: '15-25 min', distance: 1.2 },
            { name: 'El Mariachi', rating: 4.6, delivery: '35-45 min', distance: 4.1 },
            { name: 'Casa Mexico', rating: 4.5, delivery: '30-40 min', distance: 3.3 }
        ],
        items: ['Beef Tacos', 'Chicken Burrito', 'Quesadillas', 'Nachos Supreme', 'Guacamole', 'Enchiladas', 'Fajitas', 'Churros']
    },
    indian: {
        name: 'Indian & Curry',
        icon: 'https://cdn-icons-png.flaticon.com/128/2422/2422678.png',
        description: 'Rich and aromatic Indian curries, biryanis and tandoori specialties',
        restaurants: [
            { name: 'Spice Palace', rating: 4.6, delivery: '35-45 min', distance: 3.6 },
            { name: 'Curry Palace', rating: 4.5, delivery: '30-40 min', distance: 2.9 },
            { name: 'Tandoor House', rating: 4.7, delivery: '40-50 min', distance: 4.7 },
            { name: 'Mumbai Express', rating: 4.3, delivery: '25-35 min', distance: 2.1 },
            { name: 'India Gate', rating: 4.8, delivery: '45-55 min', distance: 5.8 }
        ],
        items: ['Chicken Tikka Masala', 'Butter Chicken', 'Biryani', 'Naan Bread', 'Samosas', 'Tandoori Chicken', 'Palak Paneer', 'Mango Lassi']
    },
    healthy: {
        name: 'Healthy & Fresh',
        icon: 'https://cdn-icons-png.flaticon.com/128/3143/3143609.png',
        description: 'Fresh salads, bowls and healthy meal options',
        restaurants: [
            { name: 'Fresh Bowl', rating: 4.5, delivery: '20-30 min', distance: 1.6 },
            { name: 'Green Leaf', rating: 4.6, delivery: '25-35 min', distance: 2.3 },
            { name: 'Juice Bar', rating: 4.4, delivery: '15-25 min', distance: 1.1 },
            { name: 'Salad Stop', rating: 4.3, delivery: '20-30 min', distance: 1.8 },
            { name: 'Healthy Bites', rating: 4.7, delivery: '30-40 min', distance: 3.2 }
        ],
        items: ['Caesar Salad', 'Greek Salad', 'Buddha Bowl', 'Smoothie Bowl', 'Green Smoothie', 'Protein Bowl', 'Wraps', 'Fresh Juice']
    },
    desserts: {
        name: 'Desserts & Sweets',
        icon: 'https://cdn-icons-png.flaticon.com/128/3081/3081986.png',
        description: 'Sweet treats, cakes, ice cream and pastries',
        restaurants: [
            { name: 'Sweet Treats', rating: 4.5, delivery: '25-35 min', distance: 2.2 },
            { name: 'Ice Cream Palace', rating: 4.6, delivery: '20-30 min', distance: 1.9 },
            { name: 'Cake Shop', rating: 4.7, delivery: '30-40 min', distance: 3.1 },
            { name: 'Bakery Delights', rating: 4.4, delivery: '25-35 min', distance: 2.5 },
            { name: 'Dessert Bar', rating: 4.8, delivery: '35-45 min', distance: 4.2 }
        ],
        items: ['Chocolate Cake', 'Vanilla Ice Cream', 'Croissants', 'Cupcakes', 'Cookies', 'Brownies', 'Cheesecake', 'Macarons']
    }
};

function showCuisineDetails(cuisine) {
    const data = cuisineData[cuisine];
    if (!data) return;
    
    const modal = document.getElementById('cuisineModal');
    const modalContent = document.getElementById('cuisineModalContent');
    
    modalContent.innerHTML = `
        <div style="text-align: center; margin-bottom: 2rem;">
            <img src="${data.icon}" alt="${data.name}" style="width: 80px; height: 80px; margin-bottom: 1rem;">
            <h2 style="font-size: 2rem; color: var(--text-primary); margin-bottom: 0.5rem;">${data.name}</h2>
            <p style="color: var(--text-secondary); font-size: 1.1rem;">${data.description}</p>
        </div>
        
        <div style="margin-bottom: 2rem;">
            <h3 style="font-size: 1.5rem; color: var(--text-primary); margin-bottom: 1rem;">
                🍽️ Popular Items
            </h3>
            <div style="display: flex; flex-wrap: wrap; gap: 0.75rem;">
                ${data.items.map(item => `
                    <span style="background: linear-gradient(135deg, rgba(255, 107, 53, 0.1), rgba(255, 107, 53, 0.05)); 
                                 padding: 0.6rem 1.2rem; 
                                 border-radius: 25px; 
                                 border: 2px solid rgba(255, 107, 53, 0.2);
                                 font-size: 0.95rem;
                                 color: var(--text-primary);
                                 font-weight: 500;">
                        ${item}
                    </span>
                `).join('')}
            </div>
        </div>
        
        <div>
            <h3 style="font-size: 1.5rem; color: var(--text-primary); margin-bottom: 1rem;">
                🏪 Available Restaurants (${data.restaurants.length})
            </h3>
            <div style="display: grid; gap: 1rem;">
                ${data.restaurants.map(restaurant => `
                    <div style="background: #f8f9fa; 
                                padding: 1.25rem; 
                                border-radius: 12px; 
                                border: 2px solid #e9ecef;
                                transition: all 0.2s ease;
                                cursor: pointer;"
                         onmouseover="this.style.borderColor='var(--primary-color)'; this.style.transform='translateX(5px)';"
                         onmouseout="this.style.borderColor='#e9ecef'; this.style.transform='translateX(0)';">
                        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
                            <div>
                                <h4 style="font-size: 1.2rem; color: var(--text-primary); margin-bottom: 0.5rem;">
                                    ${restaurant.name}
                                </h4>
                                <div style="display: flex; gap: 1.5rem; flex-wrap: wrap; font-size: 0.9rem; color: var(--text-secondary);">
                                    <span>⭐ ${restaurant.rating}</span>
                                    <span>🕐 ${restaurant.delivery}</span>
                                    <span>📍 ${restaurant.distance} KM</span>
                                </div>
                            </div>
                            <button onclick="selectRestaurant('${restaurant.name}', ${restaurant.distance})"
                                    style="background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
                                           color: white;
                                           border: none;
                                           padding: 0.75rem 1.5rem;
                                           border-radius: 8px;
                                           font-weight: 600;
                                           cursor: pointer;
                                           transition: all 0.2s ease;"
                                    onmouseover="this.style.transform='scale(1.05)'"
                                    onmouseout="this.style.transform='scale(1)'">
                                Order Now
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeCuisineModal() {
    const modal = document.getElementById('cuisineModal');
    modal.classList.remove('show');
    document.body.style.overflow = 'auto';
}

function selectRestaurant(restaurantName, distance) {
    closeCuisineModal();
    
    document.getElementById('restaurantName').value = restaurantName;
    document.getElementById('deliveryDistance').value = distance;
    
    document.getElementById('addOrderForm').scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    setTimeout(() => {
        document.getElementById('orderId').focus();
    }, 500);
    
    showToast(`✨ ${restaurantName} selected! Complete the order details.`, 'success');
}

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeCuisineModal();
    }
});

console.log('%c📚 FoodFleet - Food Delivery Manager Loaded Successfully!', 'color: #ff6b35; font-size: 16px; font-weight: bold;');
console.log('%cDeveloped by: Ajay Yadav | Contact: +91 8126783617 | Email: ajayyadav3617@outlook.com', 'color: #27ae60; font-size: 12px; font-weight: bold;');
console.log('%cTip: Use loadDemoData() in console to load sample orders from various cuisines', 'color: #1e293b; font-size: 12px;');
console.log('%cClick on any cuisine card to explore restaurants and menu items!', 'color: #667eea; font-size: 12px;');
console.log('%cContact form powered by Formspree - messages will be sent to ajayyadav3617@outlook.com', 'color: #9b59b6; font-size: 11px;');
console.log('%c🔍 Filter & Assign functions enhanced with debug logging', 'color: #e67e22; font-size: 11px;');
console.log('%c24/7 Service Available | 142 Govindpuram, Ghaziabad, U.P 201013', 'color: #7f8c8d; font-size: 11px;');
