// Pharmacist Customers JavaScript

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
        alert(message);
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

//  NEW: Load Customers from Backend
async function loadCustomers() {
    const tbody = document.getElementById('customer-table-body');

    try {
        const response = await apiRequest(API_CONFIG.ENDPOINTS.GET_CUSTOMERS, {
            method: 'GET'
        });

        if (response.success && response.data.data) {
            const customers = response.data.data;
            displayCustomers(customers);
            updateStats(customers);
        } else {
            showAlert(response.error || 'Failed to load customers.', 'error');
            tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: red;">Error loading customers.</td></tr>`;
        }
    } catch (error) {
        console.error('Error fetching customers:', error);
        showAlert('A connection error occurred.', 'error');
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: red;">Connection error.</td></tr>`;
    }
}

//  NEW: Display Customers in Table
function displayCustomers(customers) {
    const tbody = document.getElementById('customer-table-body');

    if (customers.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 40px; color: #666;">
                    <i class="fas fa-users" style="font-size: 48px; opacity: 0.3; margin-bottom: 15px;"></i>
                    <p>No customers found.</p>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = customers.map(customer => {
        const statusClass = (customer.status === 'ACTIVE' || !customer.status) ? 'completed' : 'pending';

        return `
            <tr>
                <td>#CUST-${String(customer.id).padStart(3, '0')}</td>
                <td><strong>${customer.firstName} ${customer.lastName}</strong></td>
                <td>${customer.email}</td>
                <td>${customer.phone || 'N/A'}</td>
                <td>${customer.totalOrders} ${customer.totalOrders === 1 ? 'order' : 'orders'}</td>
                <td><span class="status ${statusClass}">${customer.status || 'ACTIVE'}</span></td>
            </tr>
        `;
    }).join('');
}

// --- NEW: Update Stat Cards ---
function updateStats(customers) {
    const totalCustomers = customers.length;
    const activeCustomers = customers.filter(c => (c.status === 'ACTIVE' || !c.status)).length;

    const newThisMonth = Math.floor(totalCustomers / 10) + (totalCustomers > 0 ? 1 : 0);
    const loyaltyMembers = Math.floor(activeCustomers / 2);

    document.getElementById('total-customers-stat').textContent = totalCustomers;
    document.getElementById('new-customers-stat').textContent = newThisMonth;
    document.getElementById('active-customers-stat').textContent = activeCustomers;
    document.getElementById('loyalty-customers-stat').textContent = loyaltyMembers;
}


// --- UPDATED: Load on page load ---
window.addEventListener('DOMContentLoaded', () => {
    loadCustomers();

    const darkMode = localStorage.getItem('darkMode');
    if (darkMode === 'enabled') {
        document.body.classList.add('dark-mode');
    }
});