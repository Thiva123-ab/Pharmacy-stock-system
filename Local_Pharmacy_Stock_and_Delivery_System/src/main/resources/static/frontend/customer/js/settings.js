

const user = JSON.parse(localStorage.getItem('user') || '{}');


const settingsMap = {

    'email-order': 'notifyEmailOrder',
    'email-delivery': 'notifyEmailDelivery',
    'email-promo': 'notifyEmailPromo',
    'email-reminders': 'notifyEmailReminders',
    'sms-status': 'notifySmsStatus',
    'sms-delivery': 'notifySmsDelivery',

    'pref-dark-mode': 'preferredDarkMode',
    'pref-language': 'preferredLanguage',
    'pref-currency': 'preferredCurrency',

    'privacy-data': 'privacyDataCollection',
    'privacy-health': 'privacyShareHealth',
    'privacy-marketing': 'privacyMarketing'
};


if (document.getElementById('user-name')) {
    document.getElementById('user-name').textContent = user.firstName ? `${user.firstName} ${user.lastName}` : 'Customer';
}


const dateElement = document.getElementById('current-date');
if (dateElement) {
    const today = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateElement.textContent = today.toLocaleDateString('en-US', options);
}


function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '../index.html';
}


document.querySelector('.logout-btn')?.addEventListener('click', () => {
    if (confirm('Are you sure you want to logout?')) {
        handleLogout();
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
    }, 3000);
}


document.querySelectorAll('.tab-btn').forEach(button => {
    button.addEventListener('click', function() {
        const tabName = this.getAttribute('data-tab');

        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

        this.classList.add('active');
        document.getElementById(`${tabName}-tab`).classList.add('active');
    });
});


function loadSettings() {
    if (!user) return;

    for (const [elementId, userKey] of Object.entries(settingsMap)) {
        const element = document.getElementById(elementId);
        if (element) {
            const userValue = user[userKey];
            if (element.type === 'checkbox') {

                let defaultValue = (userKey.startsWith('notify') || userKey === 'privacy-data');
                element.checked = (userValue !== null && userValue !== undefined) ? userValue : defaultValue;
            } else {
                element.value = userValue || '';
            }
        }
    }


    const headerDarkMode = document.getElementById('dark-mode-header');
    if (headerDarkMode) {
        headerDarkMode.checked = user.preferredDarkMode === true;
    }
}


async function handleSettingChange(event) {
    const element = event.target;
    const userKey = settingsMap[element.id];
    if (!userKey) return;

    const value = (element.type === 'checkbox') ? element.checked : element.value;


    if (userKey === 'preferredDarkMode') {
        const otherToggleId = (element.id === 'pref-dark-mode') ? 'dark-mode-header' : 'pref-dark-mode';
        const otherToggle = document.getElementById(otherToggleId);
        if (otherToggle) otherToggle.checked = value;

        if (value) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    }


    const payload = {};
    payload[userKey] = value;

    try {
        const response = await apiRequest(API_CONFIG.ENDPOINTS.USER_PROFILE, {
            method: 'PUT',
            body: payload
        });

        if (response.success && response.data.success) {
            showAlert('Setting saved!', 'success');

            user[userKey] = value;
            localStorage.setItem('user', JSON.stringify(user));
        } else {
            showAlert(response.error || 'Failed to save setting.', 'error');
        }
    } catch (error) {
        showAlert('Connection error. Could not save setting.', 'error');
    }
}


document.getElementById('password-form')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    const btn = this.querySelector('button[type="submit"]');
    btn.disabled = true;

    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (!currentPassword || !newPassword || !confirmPassword) {
        showAlert('Please fill in all password fields', 'error');
        btn.disabled = false;
        return;
    }
    if (newPassword !== confirmPassword) {
        showAlert('New passwords do not match', 'error');
        btn.disabled = false;
        return;
    }
    if (newPassword.length < 6) {
        showAlert('Password must be at least 6 characters', 'error');
        btn.disabled = false;
        return;
    }

    try {
        const response = await apiRequest(API_CONFIG.ENDPOINTS.CHANGE_PASSWORD, {
            method: 'PUT',
            body: { currentPassword, newPassword }
        });

        if (response.success && response.data.success) {
            showAlert('Password updated successfully! Please log in again.', 'success');
            this.reset();
            setTimeout(handleLogout, 2000);
        } else {
            showAlert(response.error || 'Failed to update password. Check current password.', 'error');
        }
    } catch (error) {
        showAlert(error.message || 'Error communicating with the server.', 'error');
    } finally {
        btn.disabled = false;
    }
});


document.getElementById('delete-account-btn')?.addEventListener('click', async () => {
    const confirmation = prompt('This action cannot be undone. You will lose all your order and prescription history. To confirm, please type "DELETE" in the box below.');

    if (confirmation !== 'DELETE') {
        showAlert('Account deletion cancelled.', 'success');
        return;
    }

    try {
        const response = await apiRequest(API_CONFIG.ENDPOINTS.DELETE_USER_PROFILE, {
            method: 'DELETE'
        });

        if (response.success && response.data.success) {
            alert('Your account has been deleted. You will now be logged out.');
            handleLogout();
        } else {
            showAlert(response.error || 'Failed to delete account.', 'error');
        }
    } catch (error) {
        showAlert('A connection error occurred.', 'error');
    }
});


document.getElementById('download-data-btn')?.addEventListener('click', () => {
    showAlert('Generating your data... This feature is not yet implemented.', 'success');
});



window.addEventListener('DOMContentLoaded', () => {
    loadSettings();


    for (const elementId of Object.keys(settingsMap)) {
        const element = document.getElementById(elementId);
        if (element) {
            element.addEventListener('change', handleSettingChange);
        }
    }


    const headerDarkMode = document.getElementById('dark-mode-header');
    if (headerDarkMode) {
        headerDarkMode.checked = user.preferredDarkMode === true;
        headerDarkMode.addEventListener('change', (e) => {

            const prefToggle = document.getElementById('pref-dark-mode');
            if (prefToggle) {
                prefToggle.checked = e.target.checked;

                prefToggle.dispatchEvent(new Event('change'));
            }
        });
    }
});