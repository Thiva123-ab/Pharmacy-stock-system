
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

// Function to load settings from the backend
async function loadSettings() {
    try {
        const response = await apiRequest(API_CONFIG.ENDPOINTS.GET_SETTINGS, { method: 'GET' });
        if (response.success && response.data.data) {
            const settings = response.data.data;

            // Populate General Settings
            document.getElementById('system-name').value = settings.pharmacyName || '';
            document.getElementById('system-email').value = settings.systemEmail || '';
            document.getElementById('contact-phone').value = settings.phone || '';
            document.getElementById('time-zone').value = settings.timezone || 'Asia/Colombo';

            // Populate Email Settings
            document.getElementById('smtp-host').value = settings.smtpHost || '';
            document.getElementById('smtp-port').value = settings.smtpPort || '587';
            document.getElementById('smtp-username').value = settings.smtpUsername || '';
            // Do not populate the password field
            document.getElementById('smtp-password').placeholder = "Leave blank to keep unchanged";

        } else {
            showAlert(response.error || 'Could not load system settings.', 'error');
        }
    } catch (error) {
        showAlert('Connection error while loading settings.', 'error');
        console.error("Error loading settings:", error);
    }
}

// Handle General Settings Form Submit
document.getElementById('general-settings-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    btn.disabled = true;

    const data = {
        pharmacyName: document.getElementById('system-name').value,
        systemEmail: document.getElementById('system-email').value,
        phone: document.getElementById('contact-phone').value,
        timezone: document.getElementById('time-zone').value,
    };

    try {
        const response = await apiRequest(API_CONFIG.ENDPOINTS.UPDATE_SETTINGS, {
            method: 'PUT',
            body: data
        });

        if (response.success) {
            showAlert('General settings updated successfully!', 'success');
        } else {
            showAlert(response.error || 'Failed to update settings.', 'error');
        }
    } catch (error) {
        showAlert('A connection error occurred.', 'error');
    } finally {
        btn.disabled = false;
    }
});


document.getElementById('email-settings-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    btn.disabled = true;

    const data = {
        smtpHost: document.getElementById('smtp-host').value,
        smtpPort: document.getElementById('smtp-port').value,
        smtpUsername: document.getElementById('smtp-username').value,
        smtpPassword: document.getElementById('smtp-password').value // Send this field
    };

    if (!data.smtpPassword || data.smtpPassword.trim() === '') {
        delete data.smtpPassword;
    }

    try {
        const response = await apiRequest(API_CONFIG.ENDPOINTS.UPDATE_SETTINGS, {
            method: 'PUT',
            body: data
        });

        if (response.success) {
            showAlert('Email settings updated successfully!', 'success');
            document.getElementById('smtp-password').value = ''; // Clear password field
        } else {
            showAlert(response.error || 'Failed to update settings.', 'error');
        }
    } catch (error) {
        showAlert('A connection error occurred.', 'error');
    } finally {
        btn.disabled = false;
    }
});



window.addEventListener('DOMContentLoaded', () => {
    loadSettings();

    const darkMode = localStorage.getItem('darkMode');
    if (darkMode === 'enabled') {
        document.body.classList.add('dark-mode');
    }
});