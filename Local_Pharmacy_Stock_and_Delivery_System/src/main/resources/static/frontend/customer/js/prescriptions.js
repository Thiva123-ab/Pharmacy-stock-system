

const user = JSON.parse(localStorage.getItem('user') || '{}');


if (document.getElementById('user-name')) {
    document.getElementById('user-name').textContent = user.firstName ? `${user.firstName} ${user.lastName}` : 'Customer';
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


async function loadPrescriptions() {
    const tbody = document.getElementById('prescriptions-table');
    if (!tbody) return;
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center;">Loading...</td></tr>`;

    try {
        const response = await apiRequest(API_CONFIG.ENDPOINTS.MY_PRESCRIPTIONS, {
            method: 'GET'
        });

        if (response.success && response.data.data) {
            const prescriptions = response.data.data;
            displayPrescriptions(prescriptions);
            updateStats(prescriptions);
        } else {
            showAlert(response.error || 'Failed to load prescriptions.', 'error');
            tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: red;">${response.error}</td></tr>`;
        }
    } catch (error) {
        console.error('Error fetching prescriptions:', error);
        showAlert('A connection error occurred.', 'error');
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: red;">Connection error.</td></tr>`;
    }
}


function displayPrescriptions(prescriptions) {
    const tbody = document.getElementById('prescriptions-table');
    if (prescriptions.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 40px; color: #666;">
                    <i class="fas fa-file-prescription" style="font-size: 48px; opacity: 0.3; margin-bottom: 15px;"></i>
                    <p>No prescriptions found. Upload one to get started!</p>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = prescriptions.map(p => {
        const issueDate = p.issueDate ? new Date(p.issueDate).toLocaleDateString('en-CA') : 'N/A';
        const expiryDate = p.expiryDate ? new Date(p.expiryDate).toLocaleDateString('en-CA') : 'N/A';
        const isPending = p.status === 'PENDING';

        return `
            <tr>
                <td>#RX-${String(p.id).padStart(3, '0')}</td>
                <td>${p.doctorName || 'N/A'}</td>
                <td>${issueDate}</td>
                <td>${expiryDate}</td>
                <td>${getStatusBadge(p.status)}</td>
                <td>
                    <button class="quick-action-btn blue" style="padding: 8px 15px; font-size: 12px;" onclick="viewPrescription('${p.fileUrl}')">
                        <i class="fas fa-eye"></i> View
                    </button>
                    <!-- Only allow deleting if status is PENDING -->
                    ${isPending ? `
                    <button class="quick-action-btn" style="padding: 8px 15px; font-size: 12px; background: #f44336;" onclick="deletePrescription(${p.id})">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                    ` : ''}
                </td>
            </tr>
        `;
    }).join('');
}


function getStatusBadge(status) {
    let statusClass = 'pending';
    let statusText = status || 'PENDING';

    if (status === 'APPROVED' || status === 'DISPENSED') {
        statusClass = 'completed';
    } else if (status === 'REJECTED') {
        statusClass = 'red';
    }

    if (statusClass === 'red') {
        return `<span class="status" style="background: #ffebee; color: #c62828;">${statusText}</span>`;
    }

    return `<span class="status ${statusClass}">${statusText}</span>`;
}


function updateStats(prescriptions) {
    const total = prescriptions.length;
    const active = prescriptions.filter(p => p.status === 'APPROVED').length; // 'Active' means approved
    const pending = prescriptions.filter(p => p.status === 'PENDING').length;


    const today = new Date().toISOString().split('T')[0];
    const expired = prescriptions.filter(p => p.expiryDate && p.expiryDate < today && p.status !== 'DISPENSED').length;

    document.getElementById('total-prescriptions').textContent = total;
    document.getElementById('active-prescriptions').textContent = active;
    document.getElementById('pending-prescriptions').textContent = pending;
    document.getElementById('expired-prescriptions').textContent = expired;
}


const modal = document.getElementById('upload-modal');
const uploadBtn = document.getElementById('upload-prescription-btn');
const cancelBtn = document.getElementById('cancel-upload-btn');
const uploadForm = document.getElementById('upload-form');

uploadBtn?.addEventListener('click', () => {
    uploadForm.reset();

    document.getElementById('modal-patient-name').value = `${user.firstName} ${user.lastName}`;
    modal.style.display = 'flex';
});

cancelBtn?.addEventListener('click', () => {
    modal.style.display = 'none';
});


uploadForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    const btnOriginalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';

    const prescriptionData = {
        patientName: document.getElementById('modal-patient-name').value,
        patientAge: parseInt(document.getElementById('modal-patient-age').value),
        doctorName: document.getElementById('modal-doctor-name').value,
        diagnosis: document.getElementById('modal-diagnosis').value,
        medicines: document.getElementById('modal-medicines').value,
        dosageInstructions: document.getElementById('modal-dosage').value,
        issueDate: document.getElementById('modal-issue-date').value,
        expiryDate: document.getElementById('modal-expiry-date').value || null,
        fileUrl: document.getElementById('modal-file-url').value,
    };

    try {
        const response = await apiRequest(API_CONFIG.ENDPOINTS.CREATE_PRESCRIPTION, {
            method: 'POST',
            body: prescriptionData
        });

        if (response.success && response.data.success) {
            showAlert('Prescription uploaded successfully! A pharmacist will review it.', 'success');
            modal.style.display = 'none';
            loadPrescriptions();
        } else {
            showAlert(response.error || 'Failed to upload prescription.', 'error');
        }
    } catch (error) {
        console.error('Error uploading prescription:', error);
        showAlert('A connection error occurred.', 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = btnOriginalText;
    }
});


function viewPrescription(fileUrl) {
    if (!fileUrl) {
        showAlert('No image URL provided for this prescription.', 'error');
        return;
    }

    window.open(fileUrl, '_blank');
}


async function deletePrescription(id) {
    if (!confirm('Are you sure you want to delete this pending prescription?')) {
        return;
    }

    try {
        const response = await apiRequest(`${API_CONFIG.ENDPOINTS.DELETE_PRESCRIPTION}/${id}`, {
            method: 'DELETE'
        });

        if (response.success && response.data.success) {
            showAlert('Prescription deleted successfully!', 'success');
            loadPrescriptions();
        } else {
            showAlert(response.error || 'Failed to delete prescription.', 'error');
        }
    } catch (error) {
        console.error('Error deleting prescription:', error);
        showAlert('A connection error occurred.', 'error');
    }
}



window.addEventListener('DOMContentLoaded', () => {
    loadPrescriptions();


    const darkMode = localStorage.getItem('darkMode');
    if (darkMode === 'enabled') {
        document.body.classList.add('dark-mode');
    }
});