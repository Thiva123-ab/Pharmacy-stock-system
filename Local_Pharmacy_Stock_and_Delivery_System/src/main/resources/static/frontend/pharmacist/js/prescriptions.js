

const user = JSON.parse(localStorage.getItem('user') || '{}');
let allPrescriptions = [];

// --- Price Formatter (if needed, good to have) ---
const lkrFormatter = new Intl.NumberFormat('si-LK', {
    style: 'currency',
    currency: 'LKR',
});


const prescriptionModal = document.getElementById('prescription-modal');
const prescriptionDetailsContent = document.getElementById('prescription-details-content');
const cancelModalBtn = document.getElementById('cancel-modal-btn');


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


-
    async function loadPrescriptions() {
        const tbody = document.getElementById('prescriptions-table-body');

        try {
            const response = await apiRequest(API_CONFIG.ENDPOINTS.GET_PRESCRIPTIONS, {
                method: 'GET'
            });

            if (response.success && response.data.data) {
                allPrescriptions = response.data.data;
                displayPrescriptions(allPrescriptions);
                updateStats(allPrescriptions);
            } else {
                showAlert(response.error || 'Failed to load prescriptions.', 'error');
                tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: red;">Error loading prescriptions.</td></tr>`;
            }
        } catch (error) {
            console.error('Error fetching prescriptions:', error);
            showAlert('A connection error occurred.', 'error');
            tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: red;">Connection error.</td></tr>`;
        }
    }

// --- Display Prescriptions in Table (With Action Buttons) ---
function displayPrescriptions(prescriptions) {
    const tbody = document.getElementById('prescriptions-table-body');

    if (prescriptions.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 40px; color: #666;">
                    <i class="fas fa-file-prescription" style="font-size: 48px; opacity: 0.3; margin-bottom: 15px;"></i>
                    <p>No prescriptions found.</p>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = prescriptions.map(p => {
        // --- START: UPDATED BUTTON LOGIC ---
        // Always show the View button
        let actionButtons = `
            <button class="quick-action-btn blue" style="padding: 6px 12px; font-size: 12px;" onclick="viewPrescription(${p.id})">
                <i class="fas fa-eye"></i> View
            </button>
        `;

        if (p.status === 'PENDING') {
            actionButtons += `
                <button class="quick-action-btn green" style="padding: 6px 12px; font-size: 12px; margin-left: 5px;" onclick="updatePrescriptionStatus(${p.id}, 'APPROVED')">
                    <i class="fas fa-check"></i> Approve
                </button>
                <button class="quick-action-btn" style="padding: 6px 12px; font-size: 12px; background: #f44336; margin-left: 5px;" onclick="updatePrescriptionStatus(${p.id}, 'REJECTED')">
                    <i class="fas fa-times"></i> Reject
                </button>
            `;
        } else if (p.status === 'APPROVED') {
            actionButtons += `
                <button class="quick-action-btn purple" style="padding: 6px 12px; font-size: 12px; margin-left: 5px;" onclick="updatePrescriptionStatus(${p.id}, 'DISPENSED')">
                    <i class="fas fa-box"></i> Dispense
                </button>
            `;
        } else {
            // For DISPENSED or REJECTED, only the "View" button will show
            if (actionButtons.includes('View')) {
                actionButtons += `<span style="color: #666; margin-left: 5px;">(Action complete)</span>`;
            } else {
                actionButtons = `<span style="color: #666; margin-left: 5px;">(Action complete)</span>`;
            }

        }
        // --- END: UPDATED BUTTON LOGIC ---

        return `
            <tr>
                <td>#RX-${String(p.id).padStart(3, '0')}</td>
                <td><strong>${p.patientName || 'N/A'}</strong></td>
                <td>${p.doctorName || 'N/A'}</td>
                <td>${p.medicines ? p.medicines.split(',').length : 0} items</td>
                <td>${getStatusBadge(p.status)}</td>
                <td style="min-width: 250px;">${actionButtons}</td>
            </tr>
        `;
    }).join('');
}

// --- Get Status Badge ---
function getStatusBadge(status) {
    let statusClass = 'pending'; // Default
    if (status === 'APPROVED' || status === 'DISPENSED') statusClass = 'completed';
    if (status === 'REJECTED') statusClass = 'red';

    if (status === 'REJECTED') {
        return `<span class="status" style="background: #ffebee; color: #c62828;">${status}</span>`;
    }
    if (status === 'APPROVED') {
        return `<span class="status" style="background: #e8f5e9; color: #2e7d32;">${status}</span>`;
    }
    if (status === 'DISPENSED') {
        return `<span class="status" style="background: #e1f5fe; color: #0277bd;">${status}</span>`;
    }

    return `<span class="status ${statusClass}">${status}</span>`;
}

// --- Update Stat Cards ---
function updateStats(prescriptions) {
    document.getElementById('total-prescriptions-stat').textContent = prescriptions.length;
    document.getElementById('pending-prescriptions-stat').textContent = prescriptions.filter(p => p.status === 'PENDING').length;
    document.getElementById('approved-prescriptions-stat').textContent = prescriptions.filter(p => p.status === 'APPROVED').length;
    document.getElementById('dispensed-prescriptions-stat').textContent = prescriptions.filter(p => p.status === 'DISPENSED').length;
}

// --- Function to Approve/Reject a prescription ---
async function updatePrescriptionStatus(id, newStatus) {
    if (!confirm(`Are you sure you want to ${newStatus.toLowerCase()} this prescription?`)) {
        return;
    }

    try {
        const response = await apiRequest(`${API_CONFIG.ENDPOINTS.UPDATE_PRESCRIPTION_STATUS}/${id}`, {
            method: 'PUT',
            body: { status: newStatus }
        });

        if (response.success && response.data.success) {
            showAlert(`Prescription status updated to ${newStatus}!`, 'success');
            loadPrescriptions(); // Refresh the table
        } else {
            showAlert(response.error || 'Failed to update status.', 'error');
        }
    } catch (error) {
        console.error('Error updating status:', error);
        showAlert('A connection error occurred.', 'error');
    }
}


// --- START: NEW VIEW PRESCRIPTION FUNCTION ---
function viewPrescription(id) {
    const p = allPrescriptions.find(p => p.id === id);
    if (!p) {
        showAlert('Could not find prescription details.', 'error');
        return;
    }

    // Populate modal content
    if(prescriptionDetailsContent) {
        prescriptionDetailsContent.innerHTML = `
            <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <div class="form-group">
                    <label>Patient Name</label>
                    <input type="text" class="form-control" value="${p.patientName || ''}" readonly>
                </div>
                <div class="form-group">
                    <label>Patient Age</label>
                    <input type="text" class="form-control" value="${p.patientAge || 'N/A'}" readonly>
                </div>
            </div>
            <div class="form-group">
                <label>Doctor Name</label>
                <input type="text" class="form-control" value="${p.doctorName || ''}" readonly>
            </div>
            <div class="form-group">
                <label>Diagnosis</label>
                <input type="text" class="form-control" value="${p.diagnosis || ''}" readonly>
            </div>
            <div class="form-group">
                <label>Medicines</label>
                <textarea class="form-control" rows="3" readonly>${p.medicines || ''}</textarea>
            </div>
            <div class="form-group">
                <label>Notes</label>
                <textarea class="form-control" rows="2" readonly>${p.notes || 'No notes.'}</textarea>
            </div>
            <div class="form-group">
                <label>Prescription Image</label>
                <div style="border: 1px solid #ddd; border-radius: 10px; padding: 10px; background: #f9f9f9;">
                    <img src="${p.fileUrl}" alt="Prescription Image" style="width: 100%; height: auto; border-radius: 5px;">
                </div>
            </div>
        `;
    }

    // Show the modal
    if(prescriptionModal) {
        prescriptionModal.style.display = 'flex';
    }
}

// --- ADDED: Close modal ---
cancelModalBtn?.addEventListener('click', () => {
    if(prescriptionModal) {
        prescriptionModal.style.display = 'none';
    }
});
// --- END: NEW VIEW PRESCRIPTION FUNCTION ---


// --- Load on page load ---
window.addEventListener('DOMContentLoaded', () => {
    loadPrescriptions();

    const darkMode = localStorage.getItem('darkMode');
    if (darkMode === 'enabled') {
        document.body.classList.add('dark-mode');
    }
});