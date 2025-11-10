// Pharmacist Inventory JavaScript

const user = JSON.parse(localStorage.getItem('user') || '{}');
const REORDER_POINT = 50; // Define a global reorder point for all items

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

// --- NEW: Load Inventory Data (from Medicines endpoint) ---
async function loadInventory() {
    const tbody = document.getElementById('inventory-table-body');

    try {
        // We fetch ALL medicines, not just one page, to calculate stats
        // We use the GET_MEDICINES endpoint from config.js
        const response = await apiRequest(API_CONFIG.ENDPOINTS.GET_MEDICINES + "?size=2000", { // Ask for a large size to get all items
            method: 'GET'
        });

        if (response.success && response.data.data) {
            const medicines = response.data.data;
            displayInventoryTable(medicines);
            updateStats(medicines);
        } else {
            showAlert(response.error || 'Failed to load inventory.', 'error');
            tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: red;">Error loading inventory.</td></tr>`;
        }
    } catch (error) {
        console.error('Error fetching inventory:', error);
        showAlert('A connection error occurred.', 'error');
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: red;">Connection error.</td></tr>`;
    }
}

// --- NEW: Display Inventory in Table ---
function displayInventoryTable(medicines) {
    const tbody = document.getElementById('inventory-table-body');

    if (medicines.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 40px; color: #666;">
                    <i class="fas fa-warehouse" style="font-size: 48px; opacity: 0.3; margin-bottom: 15px;"></i>
                    <p>No inventory data found. Add medicines first.</p>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = medicines.map(med => {
        const stock = med.quantity || 0;
        let statusText = 'In Stock';
        let statusClass = 'completed';

        if (stock === 0) {
            statusText = 'Out of Stock';
            statusClass = 'red'; // Special case
        } else if (stock <= REORDER_POINT) {
            statusText = 'Low Stock';
            statusClass = 'pending';
        }

        // Special style for Out of Stock
        if (statusClass === 'red') {
            statusClass = 'status" style="background: #ffebee; color: #c62828;';
        }

        return `
            <tr>
                <td><strong>${med.name}</strong></td>
                <td>${med.category || 'N/A'}</td>
                <td>${stock} units</td>
                <td>${REORDER_POINT} units</td>
                <td><span class="status ${statusClass}">${statusText}</span></td>
            </tr>
        `;
    }).join('');
}

// --- NEW: Update Stat Cards ---
function updateStats(medicines) {
    let inStock = 0;
    let lowStock = 0;
    let outOfStock = 0;

    medicines.forEach(med => {
        const stock = med.quantity || 0;
        if (stock === 0) {
            outOfStock++;
        } else if (stock <= REORDER_POINT) {
            lowStock++;
            inStock++; // Low stock items are still "in stock"
        } else {
            inStock++;
        }
    });

    document.getElementById('total-items-stat').textContent = medicines.length;
    document.getElementById('instock-stat').textContent = inStock;
    document.getElementById('lowstock-stat').textContent = lowStock;
    document.getElementById('outofstock-stat').textContent = outOfStock;
}


// --- UPDATED: Load on page load ---
window.addEventListener('DOMContentLoaded', () => {
    loadInventory(); // Call the new function to fetch data

    const darkMode = localStorage.getItem('darkMode');
    if (darkMode === 'enabled') {
        document.body.classList.add('dark-mode');
    }
});