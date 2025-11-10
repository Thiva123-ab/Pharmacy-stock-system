// Completed Deliveries JavaScript

const user = JSON.parse(localStorage.getItem('user') || '{}');

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


// --- NEW: Load All Driver Data ---
async function loadCompletedData() {
    try {
        // We use the single dashboard endpoint
        const response = await apiRequest(API_CONFIG.ENDPOINTS.GET_DELIVERY_DASHBOARD, {
            method: 'GET'
        });

        if (response.success && response.data.data) {
            const data = response.data.data;
            updateStats(data);
            renderTable(data.completedDeliveries || []);
        } else {
            showAlert(response.error || 'Failed to load completed deliveries.', 'error');
            displayErrorState();
        }
    } catch (error) {
        console.error('Error loading data:', error);
        showAlert('A connection error occurred.', 'error');
        displayErrorState();
    }
}

// --- NEW: Update Stat Cards ---
function updateStats(data) {
    document.getElementById('total-completed').textContent = data.totalCompletedAllTime || 0;
    document.getElementById('this-month').textContent = data.completedThisMonth || 0;
    document.getElementById('avg-rating').textContent = (data.averageRating || 0.0).toFixed(1);
    document.getElementById('total-earnings').textContent = lkrFormatter.format(data.earningsThisMonth || 0);
}

// --- NEW: Render Completed Table ---
function renderTable(deliveries) {
    const tbody = document.getElementById('completed-table-body');
    if (!tbody) return;

    if (deliveries.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 40px; color: #666;">
                    <i class="fas fa-check-circle" style="font-size: 48px; opacity: 0.3; margin-bottom: 15px;"></i>
                    <p>No completed deliveries found.</p>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = deliveries.map(delivery => {
        const order = delivery.order;
        if (!order) return ''; // Skip if order data is missing

        const customerName = order.customer ? `${order.customer.firstName} ${order.customer.lastName}` : 'N/A';
        const itemsCount = order.items ? order.items.length : 0;
        const deliveryDate = delivery.scheduledDate ? new Date(delivery.scheduledDate).toLocaleDateString('en-CA') : 'N/A';

        return `
            <tr>
                <td>#DEL-${String(delivery.id).padStart(3, '0')}</td>
                <td>${deliveryDate}</td>
                <td>${customerName}</td>
                <td>${delivery.deliveryAddress}</td>
                <td>${itemsCount} items</td>
                <td>${renderStars(delivery.rating)}</td>
                <td>${lkrFormatter.format(delivery.earnings || 0)}</td>
            </tr>
        `;
    }).join('');
}

// --- NEW: Helper to render stars ---
function renderStars(rating) {
    if (!rating || rating === 0) {
        return '<span style="color: #999;">N/A</span>';
    }
    let stars = '';
    for (let i = 0; i < 5; i++) {
        if (i < rating) {
            stars += '<i class="fas fa-star" style="color: #ff9800;"></i>';
        } else {
            stars += '<i class="far fa-star" style="color: #ff9800;"></i>';
        }
    }
    return `<span>${stars}</span>`;
}


// --- NEW: Show error state on fail ---
function displayErrorState() {
    document.getElementById('total-completed').textContent = 'N/A';
    document.getElementById('this-month').textContent = 'N/A';
    document.getElementById('avg-rating').textContent = 'N/A';
    document.getElementById('total-earnings').textContent = 'N/A';
    document.getElementById('completed-table-body').innerHTML = `
        <tr>
            <td colspan="7" style="text-align: center; padding: 40px; color: red;">
                <i class="fas fa-exclamation-triangle" style="font-size: 48px; opacity: 0.3; margin-bottom: 15px;"></i>
                <p>Could not load delivery data.</p>
            </td>
        </tr>
    `;
}

// Filter by date (placeholder)
function filterByDate() {
    const fromDate = document.getElementById('from-date').value;
    const toDate = document.getElementById('to-date').value;

    if (fromDate && toDate) {
        showAlert(`Filtering from ${fromDate} to ${toDate}. (This is a placeholder, filtering is not yet implemented.)`, 'success');
        // In a real app, you would call loadCompletedData() with these dates as params
    } else {
        showAlert('Please select both start and end dates', 'error');
    }
}

// Load on page load
window.addEventListener('DOMContentLoaded', () => {
    loadCompletedData();

    // Check and apply dark mode
    const darkMode = localStorage.getItem('darkMode');
    if (darkMode === 'enabled') {
        document.body.classList.add('dark-mode');
    }
});