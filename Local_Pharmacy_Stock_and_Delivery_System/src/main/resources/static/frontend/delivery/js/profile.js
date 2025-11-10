// Profile Page JavaScript

const user = JSON.parse(localStorage.getItem('user') || '{}');

// --- Price Formatter for LKR ---
const lkrFormatter = new Intl.NumberFormat('si-LK', {
    style: 'currency',
    currency: 'LKR',
});

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

// --- NEW: Show Alert Message ---
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


// Load profile data
function loadProfileData() {
    if (user) {
        document.getElementById('profile-first-name').value = user.firstName || '';
        document.getElementById('profile-last-name').value = user.lastName || '';
        document.getElementById('profile-email').value = user.email || '';
        document.getElementById('profile-phone').value = user.phone || '';
        document.getElementById('profile-address').value = user.address || '';
        document.getElementById('vehicle-type').value = user.vehicleType || '';
        document.getElementById('vehicle-number').value = user.vehicleNumber || '';
    }
}

// --- NEW: Load Performance Stats ---
async function loadPerformanceStats() {
    try {
        const response = await apiRequest(API_CONFIG.ENDPOINTS.GET_DELIVERY_DASHBOARD, {
            method: 'GET'
        });

        if (response.success && response.data.data) {
            const data = response.data.data;

            // On-Time Rate is complex, so we'll hardcode 'N/A' as it's not in the DB
            document.getElementById('stat-on-time').textContent = 'N/A';
            document.getElementById('stat-rating').textContent = (data.averageRating || 0.0).toFixed(1) + '/5';
            document.getElementById('stat-total-deliveries').textContent = data.totalCompletedAllTime || 0;
            document.getElementById('stat-total-earnings').textContent = lkrFormatter.format(data.totalEarningsAllTime || 0);

        } else {
            showAlert(response.error || 'Failed to load performance stats.', 'error');
        }
    } catch (error) {
        console.error('Error loading performance stats:', error);
        showAlert('A connection error occurred.', 'error');
    }
}


// Handle profile form submit
document.getElementById('profile-form')?.addEventListener('submit', async function(e) {
    e.preventDefault();

    const profileData = {
        firstName: document.getElementById('profile-first-name').value,
        lastName: document.getElementById('profile-last-name').value,
        email: document.getElementById('profile-email').value, // read-only, but good to send
        phone: document.getElementById('profile-phone').value,
        address: document.getElementById('profile-address').value,
        vehicleType: document.getElementById('vehicle-type').value,
        vehicleNumber: document.getElementById('vehicle-number').value
    };

    try {
        // Use the /api/users/profile endpoint
        const response = await apiRequest(API_CONFIG.ENDPOINTS.USER_PROFILE, {
            method: 'PUT',
            body: profileData // apiRequest will stringify this
        });

        if (response.success && response.data.success) {
            // Update local storage
            const updatedUser = { ...user, ...profileData };
            localStorage.setItem('user', JSON.stringify(updatedUser));

            // Update sidebar name
            document.getElementById('user-name').textContent = `${profileData.firstName} ${profileData.lastName}`;

            showAlert('Profile updated successfully!', 'success'); // Use new alert
        } else {
            showAlert(response.error || 'Failed to update profile.', 'error'); // Use new alert
        }
    } catch (error) {
        console.error('Profile update error:', error);
        showAlert('Connection error. Could not update profile.', 'error'); // Use new alert
    }
});

// Load on page load
window.addEventListener('DOMContentLoaded', () => {
    loadProfileData();
    loadPerformanceStats(); // --- NEW: Load stats on page load ---

    // Check and apply dark mode
    const darkMode = localStorage.getItem('darkMode');
    if (darkMode === 'enabled') {
        document.body.classList.add('dark-mode');
    }
});