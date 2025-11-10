

const user = JSON.parse(localStorage.getItem('user') || '{}');


const lkrFormatter = new Intl.NumberFormat('si-LK', {
    style: 'currency',
    currency: 'LKR',
});


if (document.getElementById('user-name')) {
    document.getElementById('user-name').textContent = user.firstName ? `${user.firstName} ${user.lastName}` : 'Customer';
}
if (document.getElementById('welcome-header')) {
    document.getElementById('welcome-header').textContent = user.firstName ? `Welcome Back, ${user.firstName}!` : 'Welcome Back!';
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


function showAlert(message, type = 'error') {
    const alertBox = document.getElementById('alertBox');
    const alertMessage = document.getElementById('alertMessage');
    const alertIcon = document.getElementById('alertIcon');

    if (!alertBox || !alertMessage || !alertIcon) {
        console.error('Alert elements not found');
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


async function loadDashboardData() {
    try {
        const response = await apiRequest(API_CONFIG.ENDPOINTS.CUSTOMER_DASHBOARD_STATS, {
            method: 'GET'
        });

        if (response.success && response.data.data) {
            const data = response.data.data;


            document.getElementById('total-orders').textContent = data.totalOrders;
            document.getElementById('pending-orders').textContent = data.pendingOrders;
            document.getElementById('active-prescriptions').textContent = data.activePrescriptions;
            document.getElementById('total-spent').textContent = lkrFormatter.format(data.totalSpent);

            renderRecentOrders(data.recentOrders || []);

        } else {
            showAlert(response.error || 'Failed to load dashboard data.', 'error');
            displayErrorState();
        }
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        showAlert('A connection error occurred.', 'error');
        displayErrorState();
    }
}


function renderRecentOrders(orders) {
    const tbody = document.getElementById('orders-table-body');
    if (!tbody) return;

    if (orders.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 40px; color: #666;">
                    <i class="fas fa-shopping-cart" style="font-size: 48px; opacity: 0.3; margin-bottom: 15px;"></i>
                    <p>No recent orders found.</p>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = orders.map(order => {
        const orderDate = new Date(order.createdAt).toLocaleDateString('en-CA');
        return `
            <tr>
                <td>#ORD-${String(order.id).padStart(3, '0')}</td>
                <td>${orderDate}</td>
                <td>${order.items ? order.items.length : 0}</td>
                <td>${lkrFormatter.format(order.totalAmount || 0)}</td>
                <td>${getStatusBadge(order.status)}</td>
            </tr>
        `;
    }).join('');
}


function getStatusBadge(status) {
    let statusClass = 'pending';
    if (status === 'DELIVERED' || status === 'COMPLETED') statusClass = 'completed';
    if (status === 'IN_TRANSIT') statusClass = 'processing';
    if (status === 'FAILED' || status === 'CANCELLED') statusClass = 'red';


    if (statusClass === 'red') {
        return `<span class="status" style="background: #ffebee; color: #c62828;">${status}</span>`;
    }

    return `<span class="status ${statusClass}">${status}</span>`;
}


function displayErrorState() {
    document.getElementById('total-orders').textContent = 'N/A';
    document.getElementById('pending-orders').textContent = 'N/A';
    document.getElementById('active-prescriptions').textContent = 'N/A';
    document.getElementById('total-spent').textContent = 'N/A';
    const tbody = document.getElementById('orders-table-body');
    if(tbody) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 40px; color: red;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 48px; opacity: 0.3; margin-bottom: 15px;"></i>
                    <p>Could not load recent orders.</p>
                </td>
            </tr>
        `;
    }
}


window.addEventListener('DOMContentLoaded', () => {
    loadDashboardData();


    const darkMode = localStorage.getItem('darkMode');
    if (darkMode === 'enabled') {
        document.body.classList.add('dark-mode');
    }
});