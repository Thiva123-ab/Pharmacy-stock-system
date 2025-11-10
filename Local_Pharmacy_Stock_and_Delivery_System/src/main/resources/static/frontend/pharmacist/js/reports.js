// Pharmacist Reports JavaScript

const user = JSON.parse(localStorage.getItem('user') || '{}');

if (document.getElementById('user-name')) {
    document.getElementById('user-name').textContent = user.firstName ? `${user.firstName} ${user.lastName}` : 'Pharmacist';
}

const dateElement = document.getElementById('current-date');
if (dateElement) {
    const today = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateElement.textContent = today.toLocaleDateString('en-US', options);
}

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

// --- NEW: Load Report Data ---
async function loadReportData() {
    try {
        const response = await apiRequest(API_CONFIG.ENDPOINTS.GET_PHARMACIST_REPORTS, {
            method: 'GET'
        });

        if (response.success && response.data.data) {
            const data = response.data.data;
            const stats = data.quickStats || {};

            // Update Stat Cards
            document.getElementById('monthly-revenue-stat').textContent = formatCurrencyLKR(data.monthlyRevenue);
            document.getElementById('growth-rate-stat').textContent = data.growthRate || '+0%'; // This is mocked in backend
            document.getElementById('total-orders-stat').textContent = data.totalOrders != null ? data.totalOrders : 0;
            document.getElementById('total-customers-stat').textContent = data.totalCustomers != null ? data.totalCustomers : 0;

            // Update Quick Stats
            document.getElementById('today-sales').textContent = formatCurrencyLKR(stats.todaySales);
            document.getElementById('today-orders').textContent = stats.todayOrders != null ? stats.todayOrders : 0;

            document.getElementById('week-sales').textContent = formatCurrencyLKR(stats.weekSales);
            document.getElementById('week-orders').textContent = stats.weekOrders != null ? stats.weekOrders : 0;

            document.getElementById('month-sales').textContent = formatCurrencyLKR(stats.monthSales);
            document.getElementById('month-orders').textContent = stats.monthOrders != null ? stats.monthOrders : 0;

        } else {
            showAlert(response.error || 'Failed to load report data.', 'error');
        }
    } catch (error) {
        console.error('Error fetching report data:', error);
        showAlert('A connection error occurred.', 'error');
    }
}


// --- UPDATED: Load on page load ---
window.addEventListener('DOMContentLoaded', () => {
    loadReportData(); // Fetch real data

    const darkMode = localStorage.getItem('darkMode');
    if (darkMode === 'enabled') {
        document.body.classList.add('dark-mode');
    }
});