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
    
    initializeAutocomplete();
    
    renderOrders();
    updateStats();
});

function initializeAutocomplete() {
    const orderIdInput = document.getElementById('orderId');
    const restaurantInput = document.getElementById('restaurantName');
    const orderIdSuggestions = document.getElementById('orderIdSuggestions');
    const restaurantSuggestions = document.getElementById('restaurantSuggestions');
    
    let activeIndex = -1;
    let currentSuggestions = [];
    
    orderIdInput.addEventListener('input', function(e) {
        const value = e.target.value.trim();
        if (value.length === 0) {
            hideAutocomplete(orderIdSuggestions);
            return;
        }
        
        const suggestions = generateOrderIdSuggestions(value);
        showAutocomplete(orderIdSuggestions, suggestions, orderIdInput);
    });
    
    restaurantInput.addEventListener('input', function(e) {
        const value = e.target.value.trim();
        if (value.length === 0) {
            hideAutocomplete(restaurantSuggestions);
            return;
        }
        
        const suggestions = getRestaurantSuggestions(value);
        showAutocomplete(restaurantSuggestions, suggestions, restaurantInput);
    });
    
    orderIdInput.addEventListener('blur', function() {
        setTimeout(() => hideAutocomplete(orderIdSuggestions), 200);
    });
    
    restaurantInput.addEventListener('blur', function() {
        setTimeout(() => hideAutocomplete(restaurantSuggestions), 200);
    });
    
    orderIdInput.addEventListener('keydown', function(e) {
        handleKeyNavigation(e, orderIdSuggestions, orderIdInput);
    });
    
    restaurantInput.addEventListener('keydown', function(e) {
        handleKeyNavigation(e, restaurantSuggestions, restaurantInput);
    });
    
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.autocomplete-wrapper')) {
            hideAutocomplete(orderIdSuggestions);
            hideAutocomplete(restaurantSuggestions);
        }
    });
}

function generateOrderIdSuggestions(input) {
    const suggestions = [];
    
    const existingIds = orders.map(order => order.orderId);
    
    const patterns = [
        `ORD${input.replace(/\D/g, '')}`,
        `ORDER${input.replace(/\D/g, '')}`,
        `${input.toUpperCase()}`,
    ];
    
    patterns.forEach(pattern => {
        if (pattern.length >= 3 && !existingIds.includes(pattern)) {
            suggestions.push({
                text: pattern,
                type: 'suggestion',
                highlight: input.toUpperCase()
            });
        }
    });
    
    if (input.length >= 3) {
        const nextNumber = Math.max(0, ...orders.map(o => {
            const match = o.orderId.match(/\d+/);
            return match ? parseInt(match[0]) : 0;
        })) + 1;
        
        const autoSuggestion = `ORD${String(nextNumber).padStart(3, '0')}`;
        if (!existingIds.includes(autoSuggestion)) {
            suggestions.unshift({
                text: autoSuggestion,
                type: 'auto',
                highlight: input.toUpperCase()
            });
        }
    }
    
    return suggestions.slice(0, 5);
}

function getRestaurantSuggestions(input) {
    const suggestions = [];
    const lowerInput = input.toLowerCase();
    
    const restaurants = [
        { name: 'Dragon Wok', cuisine: 'Chinese' },
        { name: 'Burger Bros', cuisine: 'American' },
        { name: 'Tokyo Sushi Bar', cuisine: 'Japanese' },
        { name: 'Spice Palace', cuisine: 'Indian' },
        { name: 'Mama Mia Pizza', cuisine: 'Italian' },
        { name: 'Taco Loco', cuisine: 'Mexican' },
        { name: 'Burger King', cuisine: 'Fast Food' },
        { name: 'Pizza Hut', cuisine: 'Italian' },
        { name: 'KFC', cuisine: 'Fast Food' },
        { name: 'Subway', cuisine: 'Fast Food' },
        { name: 'Dominos Pizza', cuisine: 'Italian' },
        { name: 'Thai Express', cuisine: 'Thai' },
        { name: 'Panda Express', cuisine: 'Chinese' },
        { name: 'Olive Garden', cuisine: 'Italian' },
        { name: 'Chipotle', cuisine: 'Mexican' },
        { name: 'Noodle House', cuisine: 'Asian' },
        { name: 'Steak House', cuisine: 'American' },
        { name: 'Curry Palace', cuisine: 'Indian' },
        { name: 'Sushi Master', cuisine: 'Japanese' },
        { name: 'Taco Bell', cuisine: 'Mexican' }
    ];
    
    const uniqueExisting = [...new Set(orders.map(o => o.restaurantName))];
    uniqueExisting.forEach(name => {
        if (name.toLowerCase().includes(lowerInput)) {
            suggestions.push({
                text: name,
                type: 'existing',
                highlight: input
            });
        }
    });
    
    restaurants.forEach(restaurant => {
        if (restaurant.name.toLowerCase().includes(lowerInput) && 
            !suggestions.some(s => s.text === restaurant.name)) {
            suggestions.push({
                text: restaurant.name,
                type: 'popular',
                cuisine: restaurant.cuisine,
                highlight: input
            });
        }
    });
    
    return suggestions.slice(0, 6);
}

function showAutocomplete(container, suggestions, inputElement) {
    if (suggestions.length === 0) {
        container.innerHTML = '<div class="autocomplete-empty">No suggestions available</div>';
        container.classList.add('show');
        return;
    }
    
    container.innerHTML = '';
    
    suggestions.forEach((suggestion, index) => {
        const item = document.createElement('div');
        item.className = 'autocomplete-item';
        
        const highlightedText = highlightMatch(suggestion.text, suggestion.highlight);
        
        if (suggestion.type === 'auto') {
            item.innerHTML = `<strong>💡 ${highlightedText}</strong> <span style="color: #7f8c8d; font-size: 0.85rem;">(Auto-generated)</span>`;
        } else if (suggestion.type === 'existing') {
            item.innerHTML = `<strong>🔄 ${highlightedText}</strong> <span style="color: #7f8c8d; font-size: 0.85rem;">(Recent)</span>`;
        } else if (suggestion.type === 'popular') {
            item.innerHTML = `🍽️ ${highlightedText} <span style="color: #95a5a6; font-size: 0.85rem;">(${suggestion.cuisine})</span>`;
        } else {
            item.innerHTML = highlightedText;
        }
        
        item.addEventListener('click', function() {
            inputElement.value = suggestion.text;
            hideAutocomplete(container);
            inputElement.focus();
        });
        
        container.appendChild(item);
    });
    
    container.classList.add('show');
}

function hideAutocomplete(container) {
    container.classList.remove('show');
    container.innerHTML = '';
}

function highlightMatch(text, query) {
    if (!query) return text;
    
    const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
    return text.replace(regex, '<strong>$1</strong>');
}

function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function handleKeyNavigation(e, container, inputElement) {
    const items = container.querySelectorAll('.autocomplete-item');
    if (items.length === 0) return;
    
    let activeItem = container.querySelector('.autocomplete-item.active');
    let activeIndex = Array.from(items).indexOf(activeItem);
    
    if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (activeIndex < items.length - 1) {
            activeIndex++;
        } else {
            activeIndex = 0;
        }
        updateActiveItem(items, activeIndex);
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (activeIndex > 0) {
            activeIndex--;
        } else {
            activeIndex = items.length - 1;
        }
        updateActiveItem(items, activeIndex);
    } else if (e.key === 'Enter' && activeIndex >= 0) {
        e.preventDefault();
        items[activeIndex].click();
    } else if (e.key === 'Escape') {
        hideAutocomplete(container);
    }
}

function updateActiveItem(items, activeIndex) {
    items.forEach((item, index) => {
        if (index === activeIndex) {
            item.classList.add('active');
            item.scrollIntoView({ block: 'nearest' });
        } else {
            item.classList.remove('active');
        }
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
    
    applyFilters();
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
    
    currentFilters.status = statusFilter;
    currentFilters.maxDistance = distanceFilter ? parseFloat(distanceFilter) : null;
    
    if (distanceFilter && parseFloat(distanceFilter) < 0) {
        showToast('❌ Maximum distance cannot be negative!', 'error');
        return;
    }
    
    filteredOrders = [...orders];
    
    if (statusFilter === 'paid') {
        filteredOrders = filteredOrders.filter(order => order.isPaid === true);
    } else if (statusFilter === 'unpaid') {
        filteredOrders = filteredOrders.filter(order => order.isPaid === false);
    }
    
    if (currentFilters.maxDistance !== null && currentFilters.maxDistance > 0) {
        filteredOrders = filteredOrders.filter(order => order.deliveryDistance <= currentFilters.maxDistance);
    }
    
    renderOrders();
    
    if (filteredOrders.length === 0 && orders.length > 0) {
        showToast('🔍 No orders match the current filters.', 'warning');
    } else if (statusFilter !== 'all' || currentFilters.maxDistance !== null) {
        showToast(`🔍 Showing ${filteredOrders.length} of ${orders.length} orders.`, 'success');
    }
}

function clearFilters() {
    document.getElementById('statusFilter').value = 'all';
    document.getElementById('distanceFilter').value = '';
    
    currentFilters.status = 'all';
    currentFilters.maxDistance = null;
    
    filteredOrders = [...orders];
    renderOrders();
    
    showToast('🔄 Filters cleared. Showing all orders.', 'success');
}

function assignDelivery() {
    const maxDistanceInput = document.getElementById('maxDistanceAssign').value;
    
    if (!maxDistanceInput || maxDistanceInput === '') {
        showToast('❌ Please enter a maximum distance for assignment!', 'error');
        document.getElementById('maxDistanceAssign').focus();
        return;
    }
    
    const maxDistance = parseFloat(maxDistanceInput);
    
    if (isNaN(maxDistance)) {
        showToast('❌ Maximum distance must be a valid number!', 'error');
        return;
    }
    
    if (maxDistance <= 0) {
        showToast('❌ Maximum distance must be greater than 0!', 'error');
        return;
    }
    
    const eligibleOrders = orders.filter(order => 
        !order.isPaid && order.deliveryDistance <= maxDistance
    );
    
    if (eligibleOrders.length === 0) {
        displayAssignmentResult({
            success: false,
            message: 'No order available',
            details: `No unpaid orders found within ${maxDistance} KM.`
        });
        return;
    }
    
    let nearestOrder = eligibleOrders[0];
    for (let i = 1; i < eligibleOrders.length; i++) {
        if (eligibleOrders[i].deliveryDistance < nearestOrder.deliveryDistance) {
            nearestOrder = eligibleOrders[i];
        }
    }
    
    displayAssignmentResult({
        success: true,
        order: nearestOrder,
        totalEligible: eligibleOrders.length
    });
}

function displayAssignmentResult(result) {
    const resultPanel = document.getElementById('assignmentResult');
    const resultContent = document.getElementById('resultContent');
    
    resultPanel.style.display = 'block';
    
    if (result.success) {
        resultPanel.className = 'result-panel success';
        resultContent.innerHTML = `
            <div style="line-height: 2;">
                <p style="font-size: 1.1rem; color: #27ae60; font-weight: 600; margin-bottom: 10px;">
                    ✅ Delivery Assigned Successfully!
                </p>
                <p><strong>Order ID:</strong> ${result.order.orderId}</p>
                <p><strong>Restaurant:</strong> ${result.order.restaurantName}</p>
                <p><strong>Items:</strong> ${result.order.itemCount}</p>
                <p><strong>Distance:</strong> ${result.order.deliveryDistance} KM</p>
                <p><strong>Payment Status:</strong> <span style="color: #f39c12;">Unpaid</span></p>
                ${result.totalEligible > 1 ? `<p style="margin-top: 10px; color: #7f8c8d;"><em>(Selected from ${result.totalEligible} eligible orders)</em></p>` : ''}
            </div>
        `;
        showToast('✅ Nearest unpaid order assigned successfully!', 'success');
    } else {
        resultPanel.className = 'result-panel error';
        resultContent.innerHTML = `
            <div style="line-height: 2;">
                <p style="font-size: 1.1rem; color: #e74c3c; font-weight: 600; margin-bottom: 10px;">
                    ❌ ${result.message}
                </p>
                <p style="color: #7f8c8d;">${result.details}</p>
            </div>
        `;
        showToast('❌ ' + result.message, 'error');
    }
    
    resultPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function renderOrders() {
    const tableBody = document.getElementById('ordersTableBody');
    
    const ordersToDisplay = filteredOrders.length > 0 || currentFilters.status !== 'all' || currentFilters.maxDistance !== null
        ? filteredOrders
        : orders;
    
    tableBody.innerHTML = '';
    
    if (ordersToDisplay.length === 0) {
        tableBody.innerHTML = `
            <tr class="empty-state">
                <td colspan="6">
                    <div class="empty-message">
                        <span class="empty-icon">📦</span>
                        <p>${orders.length === 0 ? 'No orders yet. Add your first order above!' : 'No orders match the current filters.'}</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    const sortedOrders = [...ordersToDisplay].sort((a, b) => a.deliveryDistance - b.deliveryDistance);
    
    sortedOrders.forEach((order, index) => {
        const row = document.createElement('tr');
        row.style.animation = `fadeIn 0.3s ease ${index * 0.05}s both`;
        
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

console.log('%c🍔 FoodHub - Universal Food Delivery Manager Loaded Successfully!', 'color: #ff6b35; font-size: 16px; font-weight: bold;');
console.log('%cTip: Use loadDemoData() in console to load sample orders from various cuisines', 'color: #1e293b; font-size: 12px;');
