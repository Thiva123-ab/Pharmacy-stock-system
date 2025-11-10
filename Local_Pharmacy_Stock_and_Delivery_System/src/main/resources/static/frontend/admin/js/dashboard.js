
const user = JSON.parse(localStorage.getItem('user') || '{}');


function formatCurrencyLKR(value) {
    if (value == null) value = 0;
    return new Intl.NumberFormat('en-LK', {
        style: 'currency',
        currency: 'LKR',
        minimumFractionDigits: 2
    }).format(value);
}

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


async function loadStatistics() {
    try {

        const response = await apiRequest(API_CONFIG.ENDPOINTS.ADMIN_DASHBOARD_STATS, { method: 'GET' });

        if (response.success && response.data.success) {
            const stats = response.data.data;


            document.getElementById('total-users').textContent = stats.totalUsers.toString();
            document.getElementById('total-orders').textContent = stats.totalOrders.toString();
            document.getElementById('total-medicines').textContent = stats.totalMedicines.toString();


            const revenue = stats.totalRevenue != null ? stats.totalRevenue : 0.0;
            document.getElementById('total-revenue').textContent = formatCurrencyLKR(revenue);

            populateUserOverviewTable(stats.recentUsers);

        } else {
            console.error("Failed to load dashboard stats:", response.error);
            showStatsError();
        }
    } catch (error) {
        console.error("Error in loadStatistics:", error);
        showStatsError();
    }
}


function showStatsError() {
    document.getElementById('total-users').textContent = 'N/A';
    document.getElementById('total-orders').textContent = 'N/A';
    document.getElementById('total-medicines').textContent = 'N/A';
    document.getElementById('total-revenue').textContent = 'N/A';
    const tbody = document.getElementById('user-overview-tbody');
    if (tbody) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: red;">Could not load data.</td></tr>';
    }
}


function populateUserOverviewTable(users) {
    const tbody = document.getElementById('user-overview-tbody');
    if (!tbody) return;

    if (!users || users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No users found.</td></tr>';
        return;
    }

    tbody.innerHTML = users.map(user => {

        const role = (user.role || 'N/A').replace('ROLE_', '');
        const status = user.status || 'Active';

        let roleClass = 'processing';
        if (role === 'CUSTOMER') roleClass = 'completed';
        if (role === 'DELIVERY') roleClass = 'pending';

        let statusClass = (status === 'Active' || status === 'ACTIVE') ? 'completed' : 'pending';

        return `
            <tr>
                <td>#U${user.id.toString().padStart(3, '0')}</td>
                <td>${user.firstName} ${user.lastName}</td>
                <td>${user.email}</td>
                <td><span class="status ${roleClass}">${role}</span></td>
                <td><span class="status ${statusClass}">${status}</span></td>
            </tr>
        `;
    }).join('');
}



window.addEventListener('DOMContentLoaded', () => {
    loadStatistics();


    const darkMode = localStorage.getItem('darkMode');
    if (darkMode === 'enabled') {
        document.body.classList.add('dark-mode');
    }
});