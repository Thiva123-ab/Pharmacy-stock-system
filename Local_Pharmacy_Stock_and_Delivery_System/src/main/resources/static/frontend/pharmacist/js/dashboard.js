// Pharmacist Dashboard JavaScript

const user = JSON.parse(localStorage.getItem('user') || '{}');

// Display user info
if (document.getElementById('user-name')) {
    document.getElementById('user-name').textContent = user.firstName ? `${user.firstName} ${user.lastName}` : 'Pharmacist';
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
        alert(message); // Fallback
        return;
    }

    alertBox.className = `alert alert-${type}`;
    if (type === 'success') {
        alertIcon.className = 'fas fa-check-circle';
        alertBox.style.background = '#e8f5e9';
        alertBox.style.color = '#1e4620';
        alertBox.style.borderColor = '#a5d6a7';
    } else {
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

// --- NEW: Format currency as LKR ---
function formatCurrencyLKR(value) {
    if (value == null) value = 0;
    return new Intl.NumberFormat('en-LK', {
        style: 'currency',
        currency: 'LKR',
        minimumFractionDigits: 2
    }).format(value);
}

// --- NEW: Load Dashboard Data ---
async function loadDashboardData() {
    try {
        const response = await apiRequest(API_CONFIG.ENDPOINTS.GET_PHARMACIST_DASHBOARD, {
            method: 'GET'
        });

        if (response.success && response.data.data) {
            const data = response.data.data;

            // Update Stat Cards
            document.getElementById('total-orders-stat').textContent = data.totalOrders != null ? data.totalOrders : 0;
            document.getElementById('medicines-stock-stat').textContent = data.medicinesInStock != null ? data.medicinesInStock : 0;
            document.getElementById('pending-deliveries-stat').textContent = data.pendingDeliveries != null ? data.pendingDeliveries : 0;
            document.getElementById('total-revenue-stat').textContent = formatCurrencyLKR(data.totalRevenue);

            // Note: Trend data is mocked, so we leave it as is.
            // document.getElementById('total-orders-trend').textContent = ...;

            // Update Recent Orders Table
            displayRecentOrders(data.recentOrders || []);

            // Update Recent Activity List
            displayRecentActivity(data.recentOrders || []);

        } else {
            showAlert(response.error || 'Failed to load dashboard data.', 'error');
            displayError();
        }
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        showAlert('A connection error occurred.', 'error');
        displayError();
    }
}

// --- NEW: Display Error State ---
function displayError() {
    document.getElementById('total-orders-stat').textContent = 'N/A';
    document.getElementById('medicines-stock-stat').textContent = 'N/A';
    document.getElementById('pending-deliveries-stat').textContent = 'N/A';
    document.getElementById('total-revenue-stat').textContent = 'N/A';
    document.getElementById('recent-orders-tbody').innerHTML = `<tr><td colspan="5" style="text-align: center; color: red;">Could not load data.</td></tr>`;
    document.getElementById('recent-activity-list').innerHTML = `<div style="text-align: center; color: red; padding: 20px;">Could not load activity.</div>`;
}

// --- NEW: Render Recent Orders Table ---
function displayRecentOrders(orders) {
    const tbody = document.getElementById('recent-orders-tbody');
    if (orders.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 20px;">No recent orders found.</td></tr>`;
        return;
    }

    tbody.innerHTML = orders.map(order => {
        let statusClass = 'pending'; // Default
        if (order.status === 'COMPLETED' || order.status === 'DELIVERED') statusClass = 'completed';
        if (order.status === 'PROCESSING') statusClass = 'processing';

        return `
            <tr>
                <td>#ORD-${String(order.id).padStart(3, '0')}</td>
                <td>${order.customerName || (order.customer ? order.customer.firstName + ' ' + order.customer.lastName : 'N/A')}</td>
                <td>${order.items ? order.items.length : 0}</td>
                <td>${formatCurrencyLKR(order.totalAmount)}</td>
                <td><span class="status ${statusClass}">${order.status}</span></td>
            </tr>
        `;
    }).join('');
}

// --- NEW: Render Recent Activity List ---
function displayRecentActivity(orders) {
    const list = document.getElementById('recent-activity-list');
    if (orders.length === 0) {
        list.innerHTML = `<div style="padding: 20px; text-align: center; color: #666;">No recent activity.</div>`;
        return;
    }

    list.innerHTML = orders.map(order => {
        let icon = 'fa-shopping-cart';
        let iconClass = 'blue';
        let title = `New Order Received (#${order.id})`;

        if (order.status === 'COMPLETED' || order.status === 'DELIVERED') {
            icon = 'fa-check';
            iconClass = 'green';
            title = `Order Completed (#${order.id})`;
        } else if (order.status === 'PROCESSING') {
            icon = 'fa-sync';
            iconClass = 'purple';
            title = `Order Processing (#${order.id})`;
        }

        const customerName = order.customerName || (order.customer ? order.customer.firstName : 'A customer');
        const timeAgo = formatTimeAgo(order.createdAt);

        return `
            <div class="activity-item">
                <div class="activity-icon ${iconClass}">
                    <i class="fas ${icon}"></i>
                </div>
                <div class="activity-details">
                    <h4>${title}</h4>
                    <p>${formatCurrencyLKR(order.totalAmount)} from ${customerName}</p>
                    <small>${timeAgo}</small>
                </div>
            </div>
        `;
    }).join('');
}

// --- NEW: Helper function to format time ---
function formatTimeAgo(dateString) {
    const now = new Date();
    const past = new Date(dateString);
    const seconds = Math.floor((now - past) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
}


// Load on page load
window.addEventListener('DOMContentLoaded', () => {
    loadDashboardData(); // <-- This will now call the backend

    // Check and apply dark mode
    const darkMode = localStorage.getItem('darkMode');
    if (darkMode === 'enabled') {
        document.body.classList.add('dark-mode');
    }
});