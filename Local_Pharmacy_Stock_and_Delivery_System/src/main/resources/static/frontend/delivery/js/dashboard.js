// Delivery Dashboard JavaScript

const user = JSON.parse(localStorage.getItem('user') || '{}');
let dashboardData = { activeDeliveries: [] }; // Store dashboard data globally

// --- Price Formatter for LKR ---
const lkrFormatter = new Intl.NumberFormat('si-LK', {
    style: 'currency',
    currency: 'LKR',
});

// Display user info
if (document.getElementById('user-name')) {
    document.getElementById('user-name').textContent = user.firstName ? `${user.firstName} ${user.lastName}` : 'Delivery Person';
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

// Show Alert Message
function showAlert(message, type = 'error') {
    const alertBox = document.getElementById('alertBox');
    const alertMessage = document.getElementById('alertMessage');
    const alertIcon = document.getElementById('alertIcon');

    if (!alertBox || !alertMessage || !alertIcon) {
        console.error('Alert elements not found');
        // Fallback to simple alert if elements are missing
        alert(message);
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

// --- Load Dashboard Data ---
async function loadDashboardData() {
    try {
        const response = await apiRequest(API_CONFIG.ENDPOINTS.GET_DELIVERY_DASHBOARD, {
            method: 'GET'
        });

        if (response.success && response.data.data) {
            dashboardData = response.data.data; // Store data globally
            renderStats();
            renderTable(dashboardData.activeDeliveries || []);
            renderActivity(dashboardData.activeDeliveries || []);
        } else {
            showAlert(response.error || 'Failed to load dashboard data.', 'error');
            displayErrorState();
        }
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showAlert('A connection error occurred.', 'error');
        displayErrorState();
    }
}

// --- Render Stat Cards ---
function renderStats() {
    if (!dashboardData) return;

    // Use the stats from the service
    document.getElementById('total-deliveries').textContent = dashboardData.totalDeliveriesThisMonth || 0;
    document.getElementById('pending-deliveries').textContent = dashboardData.pendingDeliveries || 0;
    document.getElementById('completed-deliveries').textContent = dashboardData.deliveredToday || 0;
    document.getElementById('total-distance').textContent = (dashboardData.totalDistanceThisMonth || 0).toFixed(1) + ' km';
}

// --- Render Deliveries Table ---
function renderTable(deliveries) {
    const tbody = document.getElementById('deliveries-table-body');
    if (!tbody) return;

    // --- START OF FIX ---
    // The line below was limiting the view to 3 items. It has been removed.
    // const dashboardDeliveries = deliveries.slice(0, 3);

    // Now we check the full 'deliveries' array
    if (deliveries.length === 0) {
        // --- END OF FIX ---
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 40px; color: #666;">
                    <i class="fas fa-truck" style="font-size: 48px; opacity: 0.3; margin-bottom: 15px;"></i>
                    <p>No active deliveries found.</p>
                </td>
            </tr>
        `;
        return;
    }

    // --- START OF FIX ---
    // We map over the full 'deliveries' array now
    tbody.innerHTML = deliveries.map(delivery => {
        // --- END OF FIX ---
        const order = delivery.order;
        if (!order) return ''; // Skip if order data is missing

        const customer = order.customer;
        const customerName = customer ? `${customer.firstName} ${customer.lastName}` : 'N/A';

        let statusBadge, actionButtons;

        if (delivery.status === 'ASSIGNED') {
            statusBadge = `<span class="status pending">Assigned</span>`;
            actionButtons = `
                <button class="quick-action-btn blue" style="padding: 6px 12px; font-size: 12px; margin: 2px;" onclick="startDelivery(${delivery.id})">
                    <i class="fas fa-truck"></i> Start
                </button>
            `;
        } else if (delivery.status === 'IN_TRANSIT') {
            statusBadge = `<span class="status processing">In Transit</span>`;
            actionButtons = `
                <button class="quick-action-btn green" style="padding: 6px 12px; font-size: 12px; margin: 2px;" onclick="markAsDelivered(${delivery.id})">
                    <i class="fas fa-check"></i> Complete
                </button>
            `;
        } else { // DELIVERED or FAILED
            statusBadge = `<span class="status ${delivery.status === 'DELIVERED' ? 'completed' : 'red'}">${delivery.status}</span>`;
            actionButtons = `
                <button class="quick-action-btn" style="padding: 6px 12px; font-size: 12px; background: #999;" disabled>
                    <i class="fas fa-eye"></i> View
                </button>
            `;
        }


        return `
            <tr>
                <td>#DEL-${String(delivery.id).padStart(3, '0')}</td>
                <td>${customerName}</td>
                <td>${delivery.deliveryAddress}</td>
                <td>${statusBadge}</td>
                <td>${actionButtons}</td>
            </tr>
        `;
    }).join('');
}

// --- Render Activity Feed ---
function renderActivity(deliveries) {
    const list = document.getElementById('recent-activity-list');
    if(!list) return;

    // Use a helper to format time
    const timeAgo = (dateString) => {
        if (!dateString) return 'just now';
        const now = new Date();
        const past = new Date(dateString);
        const seconds = Math.floor((now - past) / 1000);
        let interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " hours ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " minutes ago";
        return Math.floor(seconds) + " seconds ago";
    };

    if (deliveries.length === 0) {
        list.innerHTML = `<div style="padding: 20px; text-align: center; color: #666;">No recent activity.</div>`;
        return;
    }

    // --- START OF FIX ---
    // Show all recent activities, not just 3
    list.innerHTML = deliveries.map(delivery => {
        // --- END OF FIX ---
        let icon, iconClass, title, time;

        if (delivery.status === 'ASSIGNED') {
            icon = 'fa-box';
            iconClass = 'orange';
            title = 'New Assignment';
            time = timeAgo(delivery.order.createdAt); // Time it was assigned
        } else { // IN_TRANSIT
            icon = 'fa-truck';
            iconClass = 'blue';
            title = 'Started Delivery';
            time = 'Just now'; // Assume start is recent
        }

        return `
            <div class="activity-item">
                <div class="activity-icon ${iconClass}">
                    <i class="fas ${icon}"></i>
                </div>
                <div class="activity-details">
                    <h4>${title}</h4>
                    <p>Order #DEL-${String(delivery.id).padStart(3, '0')} is ${delivery.status.toLowerCase()}</p>
                    <small>${time}</small>
                </div>
            </div>
        `;
    }).join('');
}


// --- Handle "Start Delivery" button ---
function startDelivery(deliveryId) {
    if (confirm('Are you sure you want to start this delivery? The status will be updated to "IN_TRANSIT".')) {
        updateDeliveryStatus(deliveryId, 'IN_TRANSIT');
    }
}

// --- Handle "Mark as Delivered" button ---
function markAsDelivered(deliveryId) {
    if (confirm('Are you sure you want to mark this delivery as "DELIVERED"?')) {
        updateDeliveryStatus(deliveryId, 'DELIVERED');
    }
}

// --- Generic function to update status ---
async function updateDeliveryStatus(id, newStatus) {
    try {
        const response = await apiRequest(`${API_CONFIG.ENDPOINTS.UPDATE_DELIVERY_STATUS}/${id}`, {
            method: 'PUT',
            body: { status: newStatus }
        });

        if (response.success) {
            showAlert(`Delivery status updated to ${newStatus}!`, 'success');
            loadDashboardData(); // Refresh all data
        } else {
            showAlert(response.error || `Failed to update status.`, 'error');
        }
    } catch (error) {
        console.error('Error updating status:', error);
        showAlert('A connection error occurred.', 'error');
    }
}

// --- Show error state on fail ---
function displayErrorState() {
    document.getElementById('total-deliveries').textContent = 'N/A';
    document.getElementById('pending-deliveries').textContent = 'N/A';
    document.getElementById('completed-deliveries').textContent = 'N/A';
    document.getElementById('total-distance').textContent = 'N/A';
    document.getElementById('deliveries-table-body').innerHTML = `
        <tr>
            <td colspan="5" style="text-align: center; padding: 40px; color: red;">
                <i class="fas fa-exclamation-triangle" style="font-size: 48px; opacity: 0.3; margin-bottom: 15px;"></i>
                <p>Could not load delivery data.</p>
            </td>
        </tr>
    `;
    document.getElementById('recent-activity-list').innerHTML = `<div style="text-align: center; color: red; padding: 20px;">Could not load activity.</div>`;
}

// Load on page load
window.addEventListener('DOMContentLoaded', () => {
    loadDashboardData(); // Load all data from the new endpoint

    // Check and apply dark mode
    const darkMode = localStorage.getItem('darkMode');
    if (darkMode === 'enabled') {
        document.body.classList.add('dark-mode');
    }
});