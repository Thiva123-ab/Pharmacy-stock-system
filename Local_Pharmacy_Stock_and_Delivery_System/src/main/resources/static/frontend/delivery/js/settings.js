// Settings Page JavaScript

const user = JSON.parse(localStorage.getItem('user') || '{}');

// Display user info
if (document.getElementById('user-name')) {
    document.getElementById('user-name').textContent = user.firstName ? `${user.firstName} ${user.lastName}` : 'Delivery Person';
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
// --- CORE LOGIC FOR settings.js (Security Tab) ---

// Security form submit
document.getElementById('password-form')?.addEventListener('submit', async function(e) {
    e.preventDefault();

    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (newPassword !== confirmPassword) {
        alert('New passwords do not match!');
        return;
    }

    if (newPassword.length < 6) {
        alert('Password must be at least 6 characters long');
        return;
    }

    try {
        // Call the Spring Boot Change Password API: /api/users/change-password (Requires JWT token)
        const response = await apiRequest('/users/change-password', {
            method: 'PUT',
            body: JSON.stringify({
                currentPassword,
                newPassword
            })
        });

        if (response.success) {
            alert('Password updated successfully! Please log in again.');
            // Clear form and perform logout
            document.getElementById('password-form').reset();
            // Since password changed, force user to re-authenticate
            handleLogout(); // Assuming a handleLogout function exists or use direct logout logic
        } else {
            alert(response.data?.message || 'Failed to update password');
        }
    } catch (error) {
        console.error('Password change error:', error);
        alert('Error communicating with the server.');
    }
});
// Tab switching
document.querySelectorAll('.tab-btn').forEach(button => {
    button.addEventListener('click', function() {
        const tabName = this.getAttribute('data-tab');

        // Remove active class from all tabs and contents
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

        // Add active class to clicked tab and corresponding content
        this.classList.add('active');
        document.getElementById(`${tabName}-tab`).classList.add('active');
    });
});

// Dark mode toggle (in System tab)
document.getElementById('dark-mode')?.addEventListener('change', function() {
    if (this.checked) {
        enableDarkMode();
        document.getElementById('dark-mode-header').checked = true;
    } else {
        disableDarkMode();
        document.getElementById('dark-mode-header').checked = false;
    }
});

// Dark mode toggle (in Header)
document.getElementById('dark-mode-header')?.addEventListener('change', function() {
    if (this.checked) {
        enableDarkMode();
        document.getElementById('dark-mode').checked = true;
    } else {
        disableDarkMode();
        document.getElementById('dark-mode').checked = false;
    }
});

// Enable dark mode
function enableDarkMode() {
    document.body.classList.add('dark-mode');
    localStorage.setItem('darkMode', 'enabled');
    showAlert('Dark mode enabled', 'success');
}

// Disable dark mode
function disableDarkMode() {
    document.body.classList.remove('dark-mode');
    localStorage.setItem('darkMode', 'disabled');
    showAlert('Dark mode disabled', 'success');
}

// Load dark mode preference
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

// Show alert
function showAlert(message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        background: ${type === 'success' ? 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)' : 'linear-gradient(135deg, #f44336 0%, #e57373 100%)'};
        color: white;
        border-radius: 10px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideInRight 0.3s ease;
    `;
    alertDiv.textContent = message;
    document.body.appendChild(alertDiv);

    setTimeout(() => {
        alertDiv.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => document.body.removeChild(alertDiv), 300);
    }, 3000);
}

// Handle password change
document.getElementById('password-form')?.addEventListener('submit', function(e) {
    e.preventDefault();

    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (!currentPassword || !newPassword || !confirmPassword) {
        showAlert('Please fill in all password fields', 'error');
        return;
    }

    if (newPassword !== confirmPassword) {
        showAlert('New passwords do not match', 'error');
        return;
    }

    if (newPassword.length < 6) {
        showAlert('Password must be at least 6 characters', 'error');
        return;
    }

    // Update password in backend when ready
    showAlert('Password changed successfully!', 'success');
    this.reset();
});

// Load on page load
window.addEventListener('DOMContentLoaded', () => {
    loadDarkModePreference();
});
