// Pharmacist Deliveries JavaScript

const user = JSON.parse(localStorage.getItem('user') || '{}');
let allDeliveries = []; // <-- ADDED: Global store for deliveries

// --- ADDED: LKR Formatter ---
const lkrFormatter = new Intl.NumberFormat('si-LK', {
    style: 'currency',
    currency: 'LKR',
});

// --- ADDED: Modal Variables ---
const viewDeliveryModal = document.getElementById('view-delivery-modal');
const viewDeliveryModalContent = document.getElementById('delivery-details-content');
const cancelViewDeliveryBtn = document.getElementById('cancel-view-delivery-btn');

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

// --- UPDATED: Load Deliveries from Backend ---
async function loadDeliveries() {
    const tbody = document.getElementById('deliveries-table-body');

    try {
        const response = await apiRequest(API_CONFIG.ENDPOINTS.GET_DELIVERIES, {
            method: 'GET'
        });

        if (response.success && response.data.data) {
            allDeliveries = response.data.data; // <-- Store globally
            displayDeliveries(allDeliveries);
            updateStats(allDeliveries);
        } else {
            showAlert(response.error || 'Failed to load deliveries.', 'error');
            tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: red;">Error loading deliveries.</td></tr>`;
        }
    } catch (error) {
        console.error('Error fetching deliveries:', error);
        showAlert('A connection error occurred.', 'error');
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: red;">Connection error.</td></tr>`;
    }
}

// --- Display Deliveries in Table ---
function displayDeliveries(deliveries) {
    const tbody = document.getElementById('deliveries-table-body');

    if (deliveries.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 40px; color: #666;">
                    <i class="fas fa-truck" style="font-size: 48px; opacity: 0.3; margin-bottom: 15px;"></i>
                    <p>No deliveries found.</p>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = deliveries.map(delivery => {
        let statusClass = 'pending'; // PENDING
        if (delivery.status === 'DELIVERED') statusClass = 'completed';
        if (delivery.status === 'IN_TRANSIT') statusClass = 'processing';
        if (delivery.status === 'FAILED') statusClass = 'red';

        const driverName = delivery.driver ? `${delivery.driver.firstName} ${delivery.driver.lastName}` : (delivery.driverName || 'N/A');
        const orderId = delivery.order ? `#ORD-${String(delivery.order.id).padStart(3, '0')}` : 'N/A';

        if (delivery.status === 'FAILED') {
            statusClass = 'status" style="background: #ffebee; color: #c62828;';
        } else {
            statusClass = `status ${statusClass}`; // Ensure 'status' prefix is added
        }

        return `
            <tr>
                <td>#DEL-${String(delivery.id).padStart(3, '0')}</td>
                <td>${orderId}</td>
                <td><strong>${driverName}</strong></td>
                <td>${delivery.deliveryAddress || 'N/A'}</td>
                <td><span class="${statusClass}">${delivery.status}</span></td>
                <td>
                    <button class="quick-action-btn blue" style="padding: 6px 12px; font-size: 12px;" onclick="viewDelivery(${delivery.id})">
                        <i class="fas fa-eye"></i> View
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// --- Update Stat Cards ---
function updateStats(deliveries) {
    document.getElementById('total-deliveries-stat').textContent = deliveries.length;
    document.getElementById('pending-deliveries-stat').textContent = deliveries.filter(d => d.status === 'PENDING').length;
    document.getElementById('intransit-deliveries-stat').textContent = deliveries.filter(d => d.status === 'IN_TRANSIT').length;
    document.getElementById('delivered-deliveries-stat').textContent = deliveries.filter(d => d.status === 'DELIVERED').length;
}

// --- UPDATED: View button functionality ---
function viewDelivery(id) {
    const delivery = allDeliveries.find(d => d.id === id);
    if (!delivery) {
        showAlert('Could not find delivery details.', 'error');
        return;
    }

    const order = delivery.order;
    if (!order) {
        showAlert('Could not find associated order details.', 'error');
        return;
    }

    const customer = order.customer;
    const customerName = customer ? `${customer.firstName} ${customer.lastName}` : (order.customerName || 'N/A');
    const customerPhone = customer ? customer.phone : 'N/A';

    const driver = delivery.driver;
    const driverName = driver ? `${driver.firstName} ${driver.lastName}` : (delivery.driverName || 'N/A');
    const driverPhone = driver ? driver.phone : (delivery.driverPhone || 'N/A');
    const driverVehicle = driver ? driver.vehicleNumber : (delivery.vehicleNumber || 'N/A');

    // Build the item list HTML
    const itemsHtml = order.items.map(item => `
        <li style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee;">
            <span>
                <strong>${item.medicine.name}</strong><br>
                <small>${item.quantity} x ${lkrFormatter.format(item.price)}</small>
            </span>
            <strong style="padding-top: 8px;">${lkrFormatter.format(item.price * item.quantity)}</strong>
        </li>
    `).join('');

    // Populate the modal content
    viewDeliveryModalContent.innerHTML = `
        <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
            <div class="form-group">
                <label>Delivery ID</label>
                <input type="text" class="form-control" value="#DEL-${String(delivery.id).padStart(3, '0')}" readonly>
            </div>
            <div class="form-group">
                <label>Order ID</label>
                <input type="text" class="form-control" value="#ORD-${String(order.id).padStart(3, '0')}" readonly>
            </div>
        </div>
        <div class="form-group">
            <label>Status</label>
            <input type="text" class="form-control" value="${delivery.status}" readonly>
        </div>
        
        <h4 style="margin-top: 20px; border-bottom: 1px solid #eee; padding-bottom: 5px;">Driver Details</h4>
        <div class="form-group">
            <label>Driver</label>
            <input type="text" class="form-control" value="${driverName}" readonly>
        </div>
        <div class="form-group">
            <label>Driver Phone</label>
            <input type="text" class="form-control" value="${driverPhone}" readonly>
        </div>
        <div class="form-group">
            <label>Vehicle</label>
            <input type="text" class="form-control" value="${driverVehicle}" readonly>
        </div>

        <h4 style="margin-top: 20px; border-bottom: 1px solid #eee; padding-bottom: 5px;">Customer Details</h4>
         <div class="form-group">
            <label>Customer</label>
            <input type="text" class="form-control" value="${customerName}" readonly>
        </div>
        <div class="form-group">
            <label>Customer Phone</label>
            <input type="text" class="form-control" value="${customerPhone}" readonly>
        </div>
        <div class="form-group">
            <label>Delivery Address</label>
            <textarea class="form-control" rows="2" readonly>${delivery.deliveryAddress || 'N/A'}</textarea>
        </div>
        
        <h4 style="margin-top: 20px; border-bottom: 1px solid #eee; padding-bottom: 5px;">Order Items</h4>
        <ul style="list-style: none; padding: 0; margin-top: 10px;">
            ${itemsHtml}
        </ul>
        <h3 style="text-align: right; margin-top: 15px; color: #0288d1;">
            Total: ${lkrFormatter.format(order.totalAmount)}
        </h3>
    `;

    // Show the modal
    viewDeliveryModal.style.display = 'flex';
}

// --- ADDED: Close View Modal ---
cancelViewDeliveryBtn?.addEventListener('click', () => {
    viewDeliveryModal.style.display = 'none';
});

// --- UPDATED: Load on page load ---
window.addEventListener('DOMContentLoaded', () => {
    loadDeliveries(); // Call the new function to fetch data

    const darkMode = localStorage.getItem('darkMode');
    if (darkMode === 'enabled') {
        document.body.classList.add('dark-mode');
    }
});