
let revenueChartInstance = null;
let userChartInstance = null;
let orderChartInstance = null;

const formatCurrencyLKR = (value) => {
    if (value == null) value = 0;
    return new Intl.NumberFormat('en-LK', {
        style: 'currency',
        currency: 'LKR',
        minimumFractionDigits: 2
    }).format(value);
};



async function loadAnalyticsData() {
    try {
        const response = await apiRequest(API_CONFIG.ENDPOINTS.ADMIN_ANALYTICS, { method: 'GET' });
        if (response.success && response.data.success) {
            const data = response.data.data;
            updateStatCards(data);
            renderRevenueChart(data.ordersLast7Days);
            renderUserDistributionChart(data.userDistribution);
            renderOrderStatisticsChart(data.ordersLast7Days);
        } else {
            console.error("Failed to load analytics:", response.error);
            alert("Could not load analytics data from the server.");
        }
    } catch (error) {
        console.error("Error loading analytics:", error);
        alert("A connection error occurred while loading analytics.");
    }
}


function updateStatCards(data) {

    document.getElementById('stat-total-revenue').textContent = formatCurrencyLKR(data.totalRevenue || 0);

    document.getElementById('stat-total-orders').textContent = data.totalOrders.toString();
    document.getElementById('stat-active-users').textContent = data.activeUsers.toString();
    document.getElementById('stat-average-rating').textContent = (data.averageRating || 0.0).toFixed(1);
}


function renderRevenueChart(orderData) {
    const ctx = document.getElementById('revenueChart').getContext('2d');
    if (revenueChartInstance) {
        revenueChartInstance.destroy();
    }

    const labels = Object.keys(orderData);

    const data = Object.values(orderData).map(count => count * 1500);

    revenueChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{

                label: 'Mock Revenue (LKR)',

                data: data,
                borderColor: '#4fc3f7',
                backgroundColor: 'rgba(79, 195, 247, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}


function renderUserDistributionChart(userData) {
    const ctx = document.getElementById('userChart').getContext('2d');
    if (userChartInstance) {
        userChartInstance.destroy();
    }

    const labels = Object.keys(userData);
    const data = Object.values(userData);

    userChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: ['#4fc3f7', '#66bb6a', '#ff9800', '#9c27b0']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
            }
        }
    });
}


function renderOrderStatisticsChart(orderData) {
    const ctx = document.getElementById('orderChart').getContext('2d');
    if (orderChartInstance) {
        orderChartInstance.destroy();
    }

    const labels = Object.keys(orderData);
    const data = Object.values(orderData);

    orderChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Orders',
                data: data,
                backgroundColor: '#66bb6a'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}


const user = JSON.parse(localStorage.getItem('user') || '{}');


if (document.getElementById('user-name')) {
    document.getElementById('user-name').textContent = user.firstName ? `${user.firstName} ${user.lastName}` : 'Administrator';
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


window.addEventListener('DOMContentLoaded', () => {

    loadAnalyticsData();


    const darkMode = localStorage.getItem('darkMode');
    if (darkMode === 'enabled') {
        document.body.classList.add('dark-mode');
    }
});