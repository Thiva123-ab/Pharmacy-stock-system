// Pharmacist Medicines JavaScript

const user = JSON.parse(localStorage.getItem('user') || '{}');

// --- Global state for medicines ---
let allMedicines = [];

// --- Price Formatter for LKR ---
const lkrFormatter = new Intl.NumberFormat('si-LK', {
    style: 'currency',
    currency: 'LKR',
});

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


async function loadMedicines() {
    const tbody = document.getElementById('medicine-table-body');
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center;">Loading medicines...</td></tr>`;

    try {

        const response = await apiRequest(API_CONFIG.ENDPOINTS.GET_MEDICINES, {
            method: 'GET'
        });

        if (response.success && response.data.data) {
            allMedicines = response.data.data;
            displayMedicines(allMedicines);
            updateStats(allMedicines);
        } else {
            showAlert(response.error || 'Failed to load medicines.', 'error');
            tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: red;">Error loading medicines.</td></tr>`;
        }
    } catch (error) {
        console.error('Error fetching medicines:', error);
        showAlert('A connection error occurred.', 'error');
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: red;">Connection error.</td></tr>`;
    }
}

// --- UPDATED: Display medicines ---
function displayMedicines(medicineList) {
    const tbody = document.getElementById('medicine-table-body');

    if (medicineList.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 40px; color: #666;">
                    <i class="fas fa-pills" style="font-size: 48px; opacity: 0.3; margin-bottom: 15px;"></i>
                    <p>No medicines found</p>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = medicineList.map(medicine => `
        <tr>
            <td><strong>${medicine.name}</strong></td>
            <td><span style="color: #4fc3f7;">${medicine.category || 'N/A'}</span></td>
            <td><strong>${lkrFormatter.format(medicine.priceLKR || 0)}</strong></td>
            <td>${medicine.quantity}</td>
            <td>${getStockStatus(medicine.quantity)}</td>
            <td>
                <button onclick="openModalForEdit(${medicine.id})" class="quick-action-btn green" style="padding: 8px 15px; font-size: 12px; margin-right: 5px;" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="deleteMedicine(${medicine.id}, '${medicine.name}')" class="quick-action-btn" style="padding: 8px 15px; font-size: 12px; background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// Get stock status
function getStockStatus(stock) {
    if (stock > 50) return '<span class="status completed">In Stock</span>';
    if (stock > 0) return '<span class="status pending">Low Stock</span>';
    return '<span class="status" style="background: #ffebee; color: #c62828;">Out of Stock</span>';
}

// --- UPDATED: Update statistics ---
function updateStats(medicines) {
    document.getElementById('total-medicines').textContent = medicines.length;
    document.getElementById('in-stock').textContent = medicines.filter(m => m.quantity > 50).length;
    document.getElementById('low-stock').textContent = medicines.filter(m => m.quantity > 0 && m.quantity <= 50).length;
    document.getElementById('out-of-stock').textContent = medicines.filter(m => m.quantity === 0).length;
}

// --- UPDATED: Search (Client-side) ---
document.getElementById('search-input')?.addEventListener('input', function(e) {
    const searchTerm = e.target.value.toLowerCase();
    const category = document.getElementById('category-filter').value;

    const filtered = allMedicines.filter(m =>
        (m.name.toLowerCase().includes(searchTerm) ||
            (m.genericName && m.genericName.toLowerCase().includes(searchTerm)) ||
            (m.brand && m.brand.toLowerCase().includes(searchTerm))) &&
        (category === "" || m.category === category)
    );
    displayMedicines(filtered);
});

// --- UPDATED: Category filter (Client-side) ---
document.getElementById('category-filter')?.addEventListener('change', function(e) {
    const category = e.target.value;
    const searchTerm = document.getElementById('search-input').value.toLowerCase();

    const filtered = allMedicines.filter(m =>
        (m.name.toLowerCase().includes(searchTerm) ||
            (m.genericName && m.genericName.toLowerCase().includes(searchTerm)) ||
            (m.brand && m.brand.toLowerCase().includes(searchTerm))) &&
        (category === "" || m.category === category)
    );
    displayMedicines(filtered);
});


// --- NEW: Modal Handling ---
const modal = document.getElementById('medicine-modal');
const modalTitle = document.getElementById('modal-title');
const medicineForm = document.getElementById('medicine-form');
const medicineIdInput = document.getElementById('modal-medicine-id');

// Open modal for adding
document.getElementById('add-medicine-btn')?.addEventListener('click', () => {
    medicineForm.reset();
    medicineIdInput.value = ""; // Clear ID
    modalTitle.innerHTML = '<i class="fas fa-plus-circle"></i> Add New Medicine';
    modal.style.display = 'flex';
});

// Open modal for editing
function openModalForEdit(id) {
    const medicine = allMedicines.find(m => m.id === id);
    if (!medicine) {
        showAlert('Could not find medicine details.', 'error');
        return;
    }

    // Populate the form
    medicineIdInput.value = medicine.id;
    document.getElementById('modal-name').value = medicine.name || '';
    document.getElementById('modal-brand').value = medicine.brand || '';
    document.getElementById('modal-generic-name').value = medicine.genericName || '';
    document.getElementById('modal-category').value = medicine.category || '';
    document.getElementById('modal-price').value = medicine.priceLKR || 0;
    document.getElementById('modal-quantity').value = medicine.quantity || 0;
    document.getElementById('modal-description').value = medicine.description || '';

    // Show the modal
    modalTitle.innerHTML = '<i class="fas fa-edit"></i> Edit Medicine';
    modal.style.display = 'flex';
}

// Close modal
document.getElementById('cancel-medicine-btn')?.addEventListener('click', () => {
    modal.style.display = 'none';
});

// --- NEW: Handle Form Submit (Add/Edit) ---
medicineForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    btn.disabled = true;

    const id = medicineIdInput.value;
    const isEditing = id !== "";

    const medicineData = {
        name: document.getElementById('modal-name').value,
        brand: document.getElementById('modal-brand').value,
        genericName: document.getElementById('modal-generic-name').value,
        category: document.getElementById('modal-category').value,
        priceLKR: parseFloat(document.getElementById('modal-price').value),
        quantity: parseInt(document.getElementById('modal-quantity').value),
        description: document.getElementById('modal-description').value
    };

    // Determine endpoint and method
    const method = isEditing ? 'PUT' : 'POST';
    const endpoint = isEditing
        ? `${API_CONFIG.ENDPOINTS.UPDATE_MEDICINE}/${id}`
        : API_CONFIG.ENDPOINTS.CREATE_MEDICINE;

    try {
        const response = await apiRequest(endpoint, {
            method: method,
            body: medicineData
        });

        if (response.success) {
            showAlert(isEditing ? 'Medicine updated successfully!' : 'Medicine added successfully!', 'success');
            modal.style.display = 'none';
            loadMedicines(); // Refresh the table
        } else {
            showAlert(response.error || 'Failed to save medicine.', 'error');
        }
    } catch (error) {
        console.error('Error saving medicine:', error);
        showAlert('A connection error occurred.', 'error');
    } finally {
        btn.disabled = false;
    }
});


// --- NEW: Delete medicine ---
async function deleteMedicine(id, name) {
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
        return;
    }

    try {
        const response = await apiRequest(`${API_CONFIG.ENDPOINTS.DELETE_MEDICINE}/${id}`, {
            method: 'DELETE'
        });

        if (response.success) {
            showAlert('Medicine deleted successfully!', 'success');
            loadMedicines(); // Refresh the table
        } else {
            showAlert(response.error || 'Failed to delete medicine.', 'error');
        }
    } catch (error) {
        console.error('Error deleting medicine:', error);
        showAlert('A connection error occurred.', 'error');
    }
}

// --- UPDATED: Load on page load ---
window.addEventListener('DOMContentLoaded', () => {
    loadMedicines();

    // Check and apply dark mode
    const darkMode = localStorage.getItem('darkMode');
    if (darkMode === 'enabled') {
        document.body.classList.add('dark-mode');
    }
});