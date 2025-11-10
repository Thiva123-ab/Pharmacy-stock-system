// Pharmacist Settings JavaScript

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

// Handle logout (Helper function for clarity)
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

// --- NEW: Load Profile Data ---
function loadProfileData() {
    if (user) {
        document.getElementById('profile-first-name').value = user.firstName || '';
        document.getElementById('profile-last-name').value = user.lastName || '';
        document.getElementById('profile-email').value = user.email || '';
        document.getElementById('profile-phone').value = user.phone || '';
    }
}

// --- NEW: Handle Profile Form Submit ---
document.getElementById('profile-form')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    const btn = this.querySelector('button[type="submit"]');
    btn.disabled = true;

    const profileData = {
        firstName: document.getElementById('profile-first-name').value,
        lastName: document.getElementById('profile-last-name').value,
        email: document.getElementById('profile-email').value, // Email is read-only but required by DTO
        phone: document.getElementById('profile-phone').value,
        // The DTO also accepts address, vehicleType, etc., but they are not on this form
        // They will be sent as 'undefined' and ignored by the backend service
    };

    try {
        const response = await apiRequest(API_CONFIG.ENDPOINTS.USER_PROFILE, {
            method: 'PUT',
            body: profileData
        });

        if (response.success && response.data.success) {
            showAlert('Profile updated successfully!', 'success');

            // Update local storage
            const updatedUser = { ...user, ...profileData };
            localStorage.setItem('user', JSON.stringify(updatedUser));

            // Update sidebar name
            document.getElementById('user-name').textContent = `${profileData.firstName} ${profileData.lastName}`;
        } else {
            showAlert(response.error || 'Failed to update profile.', 'error');
        }
    } catch (error) {
        console.error('Profile update error:', error);
        showAlert('A connection error occurred.', 'error');
    } finally {
        btn.disabled = false;
    }
});

// --- NEW: Handle Password Change Form Submit ---
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
            setTimeout(handleLogout, 2000); // Force logout
        } else {
            showAlert(response.error || 'Failed to update password. Check current password.', 'error');
        }
    } catch (error) {
        console.error('Password change error:', error);
        showAlert(error.message || 'Error communicating with the server.', 'error');
    } finally {
        btn.disabled = false;
    }
});


// --- Dark Mode Logic (existing) ---
document.getElementById('dark-mode')?.addEventListener('change', function() {
    if (this.checked) {
        document.body.classList.add('dark-mode');
        localStorage.setItem('darkMode', 'enabled');
    } else {
        document.body.classList.remove('dark-mode');
        localStorage.setItem('darkMode', 'disabled');
    }
});

window.addEventListener('DOMContentLoaded', () => {
    loadProfileData(); // --- NEW: Load profile data on page load ---

    const darkMode = localStorage.getItem('darkMode');
    if (darkMode === 'enabled') {
        document.body.classList.add('dark-mode');
        if (document.getElementById('dark-mode')) {
            document.getElementById('dark-mode').checked = true;
        }
    }
});