// Track Order JavaScript

const user = JSON.parse(localStorage.getItem('user') || '{}');

// --- Price Formatter for LKR ---
const lkrFormatter = new Intl.NumberFormat('si-LK', {
    style: 'currency',
    currency: 'LKR',
});

// Display user info
if (document.getElementById('user-name')) {
    document.getElementById('user-name').textContent = user.firstName ? `${user.firstName} ${user.lastName}` : 'Customer';
}

// Display current date
const dateElement = document.getElementById('current-date');
if (dateElement) {
    const today = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateElement.textContent = today.toLocaleDateString('en-US', options);
}

// Logout functionality
document.querySelector('.logout-btn')?.addEventListener('click', () => {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '../index.html';
    }
});

// --- Show Alert Message ---
function showAlert(message, type = 'error') {
    const alertBox = document.getElementById('alertBox');
    const alertMessage = document.getElementById('alertMessage');
    const alertIcon = document.getElementById('alertIcon');

    if (!alertBox || !alertMessage || !alertIcon) {
        console.error('Alert elements not found');
        alert(message); // Fallback
        return;
    }

    alertBox.className = `alert alert-${type}`;
    if (type === 'success') {
        alertIcon.className = 'fas fa-check-circle';
        alertBox.style.background = '#e8f5e9';
        alertBox.style.color = '#1e4620';
        alertBox.style.borderColor = '#a5d6a7';
    } else { // 'error'
        alertIcon.className = 'fas fa-exclamation-circle';
        alertBox.style.background = '#f8d7da';
        alertBox.style.color = '#842029';
        alertBox.style.borderColor = '#f5c2c7';
    }

    alertMessage.textContent = message;
    alertBox.style.display = 'flex';
    alertBox.style.opacity = '1';

    setTimeout(() => {
        alertBox.style.opacity = '0';
        setTimeout(() => {
            alertBox.style.display = 'none';
        }, 500);
    }, 5000);
}

// --- 1. Load "Active Orders" table ---
async function loadActiveOrders() {
    const tbody = document.getElementById('active-orders-tbody');
    if (!tbody) return;

    try {
        const response = await apiRequest(API_CONFIG.ENDPOINTS.MY_ORDERS, { method: 'GET' });
        if (response.success && response.data.data) {
            const allOrders = response.data.data;
            // Filter for only active orders
            const activeOrders = allOrders.filter(order =>
                order.status === 'PENDING' || order.status === 'PROCESSING' || order.status === 'IN_TRANSIT'
            );
            renderActiveOrdersTable(activeOrders);
        } else {
            showAlert(response.error || 'Failed to load active orders.', 'error');
            tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: red;">${response.error}</td></tr>`;
        }
    } catch (error) {
        showAlert('Connection error while loading orders.', 'error');
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: red;">Connection error.</td></tr>`;
    }
}

// --- 2. Render "Active Orders" table ---
function renderActiveOrdersTable(orders) {
    const tbody = document.getElementById('active-orders-tbody');
    if (orders.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 20px;">No active orders found.</td></tr>`;
        return;
    }

    tbody.innerHTML = orders.map(order => {
        const orderDate = new Date(order.createdAt).toLocaleDateString('en-CA');
        const orderIdString = `#ORD-${String(order.id).padStart(3, '0')}`;

        let statusClass = 'pending'; // PENDING
        if (order.status === 'PROCESSING') statusClass = 'processing';
        if (order.status === 'IN_TRANSIT') statusClass = 'green'; // Special case for track button

        return `
            <tr>
                <td>${orderIdString}</td>
                <td>${orderDate}</td>
                <td>${order.items ? order.items.length : 0} items</td>
                <td><strong>${lkrFormatter.format(order.totalAmount || 0)}</strong></td>
                <td><span class="status ${statusClass}">${order.status}</span></td>
                <td>
                    <button class="quick-action-btn ${statusClass}" 
                            style="padding: 6px 12px; font-size: 12px;" 
                            onclick="handleTrackOrder(${order.id})">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>Track</span>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// --- 3. Handle Track Order (from search or table) ---
async function handleTrackOrder(orderId) {
    const trackingCard = document.getElementById('tracking-details');
    if (!trackingCard) return;

    // Clean Order ID (if it came from search box)
    if (typeof orderId !== 'number') {
        const rawId = document.getElementById('order-id-input').value.replace('#', '').replace('ORD-', '');
        orderId = parseInt(rawId);
        if (isNaN(orderId)) {
            showAlert('Please enter a valid Order ID number.', 'error');
            return;
        }
    }

    trackingCard.style.display = 'block';
    trackingCard.innerHTML = `
        <div style="display: flex; justify-content: center; padding: 50px;">
            <div class="spinner" style="border-top-color: #4fc3f7;"></div>
        </div>`;
    trackingCard.scrollIntoView({ behavior: 'smooth' });

    // No try...catch is needed here because apiRequest safely handles errors
    const response = await apiRequest(`${API_CONFIG.ENDPOINTS.TRACK_ORDER}/${orderId}`, {
        method: 'GET'
    });

    // --- START OF FIX ---
    // 1. Check if the API request itself was successful
    if (response.success) {

        // 2. Check for data at response.data.data OR response.data
        const responseData = response.data.data || response.data;

        // 3. Now, check if the *content* we need (the 'order' object) exists inside the data
        if (responseData && responseData.order) {
            renderTrackingDetails(responseData);
        } else {
            // This handles cases where the API call succeeded but returned no data
            const errorMessage = 'Tracking information not found for this order.';
            showAlert(errorMessage, 'error');
            trackingCard.innerHTML = `<h2 style="color: red; text-align: center;">${errorMessage}</h2>`;
        }
    } else {
        // 4. This handles API-level errors (404, 500, 403 Forbidden, etc.)
        // response.error will contain the specific message from the backend (e.g., "Order not found")
        const errorMessage = response.error || 'An unknown error occurred.';
        showAlert(errorMessage, 'error');
        trackingCard.innerHTML = `<h2 style="color: red; text-align: center;">${errorMessage}</h2>`;
    }
    // --- END OF FIX ---
}

// --- 4. Render Tracking Details Card ---
function renderTrackingDetails(data) {
    const trackingCard = document.getElementById('tracking-details');
    const { order, delivery } = data;

    const orderIdString = `#ORD-${String(order.id).padStart(3, '0')}`;
    const orderDate = new Date(order.createdAt).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
    const deliveryDate = delivery?.scheduledDate ? new Date(delivery.scheduledDate).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Pending...';
    const orderStatus = order.status;
    const deliveryStatus = delivery?.status;

    // Build Status Timeline
    let timelineHTML = '';
    const timeline = [
        { status: 'PENDING', title: 'Order Placed', desc: 'Your order has been received.', icon: 'fa-check', completed: false },
        { status: 'PROCESSING', title: 'Order Processing', desc: 'A pharmacist is reviewing your order.', icon: 'fa-box', completed: false },
        { status: 'ASSIGNED', title: 'Driver Assigned', desc: 'A delivery driver is assigned to your order.', icon: 'fa-user-check', completed: false },
        { status: 'IN_TRANSIT', title: 'Out for Delivery', desc: 'Your order is on its way to you.', icon: 'fa-truck', completed: false },
        { status: 'DELIVERED', title: 'Delivered', desc: 'Your order has been delivered.', icon: 'fa-home', completed: false }
    ];

    const statusHierarchy = ['PENDING', 'PROCESSING', 'ASSIGNED', 'IN_TRANSIT', 'DELIVERED'];
    // Determine current status
    let currentStatus = deliveryStatus || orderStatus;
    let statusIndex = statusHierarchy.indexOf(currentStatus);

    timeline.forEach((step, index) => {
        let isCompleted = index < statusIndex;
        let isActive = index === statusIndex;

        if (currentStatus === 'DELIVERED') isCompleted = true; // All are complete
        if (currentStatus === 'FAILED' || currentStatus === 'CANCELLED') {
            // Handle failed state later if needed
        }

        let itemClass = 'pending';
        let iconClass = 'grey';
        let borderClass = 'grey';
        if (isActive) {
            itemClass = 'active';
            iconClass = 'blue';
            borderClass = 'blue';
        } else if (isCompleted) {
            itemClass = 'completed';
            iconClass = 'green';
            borderClass = 'green';
        }

        timelineHTML += `
            <div class="activity-item" style="border-left: 3px solid ${borderClass === 'grey' ? '#ccc' : (borderClass === 'blue' ? '#2196f3' : '#4caf50')}; padding-left: 20px; margin-bottom: 20px;">
                <div class="activity-icon ${iconClass}" style="${iconClass === 'grey' ? 'background: #ccc;' : ''}">
                    <i class="fas ${step.icon}"></i>
                </div>
                <div class="activity-details">
                    <h4 style="${itemClass === 'pending' ? 'color: #999;' : ''}">${step.title}</h4>
                    <p style="${itemClass === 'pending' ? 'color: #999;' : ''}">${step.desc}</p>
                </div>
            </div>
        `;
    });


    // Build Driver Info (if delivery is assigned)
    let driverHTML = '';
    if (delivery && deliveryStatus !== 'PENDING') {
        driverHTML = `
        <div style="background: #e3f2fd; padding: 20px; border-radius: 10px; margin-top: 30px;">
            <h3 style="margin-bottom: 15px;"><i class="fas fa-user"></i> Delivery Personnel</h3>
            <div style="display: flex; align-items: center; gap: 15px;">
                <div style="width: 60px; height: 60px; background: #2196f3; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 24px;">
                    <i class="fas fa-user"></i>
                </div>
                <div>
                    <h4>${delivery.driverName || 'N/A'}</h4>
                    <p style="color: #666; margin: 5px 0;">Phone: ${delivery.driverPhone || 'N/A'}</p>
                    <p style="color: #666;">Vehicle: ${delivery.vehicleNumber || 'N/A'}</p>
                </div>
            </div>
        </div>
        `;
    }

    // Full Card HTML
    trackingCard.innerHTML = `
        <h2><i class="fas fa-truck"></i> Order Details</h2>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px;">
                <div>
                    <p style="color: #666; margin-bottom: 5px;">Order ID</p>
                    <h3 id="track-order-id" style="color: #0288d1;">${orderIdString}</h3>
                </div>
                <div>
                    <p style="color: #666; margin-bottom: 5px;">Order Date</p>
                    <h3 id="track-order-date">${orderDate}</h3>
                </div>
                <div>
                    <p style="color: #666; margin-bottom: 5px;">Estimated Delivery</p>
                    <h3 id="track-delivery-date">${deliveryDate}</h3>
                </div>
                <div>
                    <p style="color: #666; margin-bottom: 5px;">Status</p>
                    <h3 id="track-status"><span class="status ${currentStatus === 'IN_TRANSIT' ? 'processing' : 'pending'}">${currentStatus}</span></h3>
                </div>
            </div>
        </div>

        <div style="margin-top: 30px;">
            <h3 style="margin-bottom: 20px;"><i class="fas fa-route"></i> Delivery Progress</h3>
            <div id="tracking-timeline">
                ${timelineHTML}
            </div>
        </div>

        ${driverHTML}
    `;
}

// Load on page load
window.addEventListener('DOMContentLoaded', () => {
    loadActiveOrders(); // Load the table at the bottom

    // Check if an orderId was passed from my-orders.html
    const urlParams = new URLSearchParams(window.location.search);
    const orderIdFromUrl = urlParams.get('orderId');
    if (orderIdFromUrl) {
        // Remove #ORD- prefix and parse to number
        const numericId = parseInt(orderIdFromUrl.replace(/\D/g, ''));
        if (!isNaN(numericId)) {
            document.getElementById('order-id-input').value = numericId;
            handleTrackOrder(numericId);
        }
    }

    // Add listener to the search button
    document.getElementById('track-btn').addEventListener('click', handleTrackOrder);

    // Check and apply dark mode
    const darkMode = localStorage.getItem('darkMode');
    if (darkMode === 'enabled') {
        document.body.classList.add('dark-mode');
    }
});