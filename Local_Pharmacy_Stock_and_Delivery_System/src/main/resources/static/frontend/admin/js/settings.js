
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


const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '../index.html';
};


document.querySelector('.logout-btn')?.addEventListener('click', () => {
    if (confirm('Are you sure you want to logout?')) {
        handleLogout();
    }
});


document.querySelectorAll('.tab-btn').forEach(button => {
    button.addEventListener('click', function() {
        const tabName = this.getAttribute('data-tab');

        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

        this.classList.add('active');
        document.getElementById(`${tabName}-tab`).classList.add('active');
    });
});


document.getElementById('dark-mode')?.addEventListener('change', function() {
    if (this.checked) {
        enableDarkMode();
        if (document.getElementById('dark-mode-header')) {
            document.getElementById('dark-mode-header').checked = true;
        }
    } else {
        disableDarkMode();
        if (document.getElementById('dark-mode-header')) {
            document.getElementById('dark-mode-header').checked = false;
        }
    }
});


document.getElementById('dark-mode-header')?.addEventListener('change', function() {
    if (this.checked) {
        enableDarkMode();
        if (document.getElementById('dark-mode')) {
            document.getElementById('dark-mode').checked = true;
        }
    } else {
        disableDarkMode();
        if (document.getElementById('dark-mode')) {
            document.getElementById('dark-mode').checked = false;
        }
    }
});


function enableDarkMode() {
    document.body.classList.add('dark-mode');
    localStorage.setItem('darkMode', 'enabled');
    showAlert('Dark mode enabled', 'success');
}

function disableDarkMode() {
    document.body.classList.remove('dark-mode');
    localStorage.setItem('darkMode', 'disabled');
    showAlert('Dark mode disabled', 'success');
}


function loadDarkModePreference() {
    const darkMode = localStorage.getItem('darkMode');
    if (darkMode === 'enabled') {
        document.body.classList.add('dark-mode');
        if (document.getElementById('dark-mode')) {
            document.getElementById('dark-mode').checked = true;
        }
        if (document.getElementById('dark-mode-header')) {
            document.getElementById('dark-mode-header').checked = true;
        }
    }
}


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
            body: {
                currentPassword: currentPassword,
                newPassword: newPassword
            }
        });

        if (response.success && response.data.success) {
            showAlert('Password updated successfully! Please log in again.', 'success');
            this.reset();
            setTimeout(handleLogout, 2000); // Wait 2 seconds before logging out
        } else {
            showAlert(response.error || 'Failed to update password.', 'error');
        }
    } catch (error) {
        console.error('Password change error:', error);
        showAlert(error.message || 'Error communicating with the server.', 'error');
    } finally {
        btn.disabled = false;
    }
});


async function loadPreferences() {
    try {
        const response = await apiRequest(API_CONFIG.ENDPOINTS.GET_SETTINGS, { method: 'GET' });
        if (response.success && response.data.data) {
            const settings = response.data.data;


            if (settings.language) {
                document.getElementById('pref-language').value = settings.language;
            }


            const savedFormat = localStorage.getItem('adminDateFormat');
            if (savedFormat) {
                document.getElementById('pref-date-format').value = savedFormat;
            }
        } else {
            showAlert(response.error || 'Could not load preferences.', 'error');
        }
    } catch (error) {
        showAlert('Connection error loading preferences.', 'error');
    }
}


document.getElementById('pref-form')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    const btn = this.querySelector('button[type="submit"]');
    btn.disabled = true;

    const language = document.getElementById('pref-language').value;
    const dateFormat = document.getElementById('pref-date-format').value;

    try {

        const response = await apiRequest(API_CONFIG.ENDPOINTS.UPDATE_SETTINGS, {
            method: 'PUT',
            body: { language: language }
        });

        if (response.success && response.data.success) {

            localStorage.setItem('adminDateFormat', dateFormat);
            showAlert('Preferences saved successfully!', 'success');
        } else {
            showAlert(response.error || 'Failed to save preferences.', 'error');
        }
    } catch (error) {
        showAlert('A connection error occurred.', 'error');
    } finally {
        btn.disabled = false;
    }
});



window.addEventListener('DOMContentLoaded', () => {
    loadDarkModePreference();
    loadPreferences();
});