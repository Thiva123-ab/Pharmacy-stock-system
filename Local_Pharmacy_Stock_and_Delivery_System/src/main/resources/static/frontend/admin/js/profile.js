
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


function loadProfileData() {
    if (user) {
        document.getElementById('profile-first-name').value = user.firstName || '';
        document.getElementById('profile-last-name').value = user.lastName || '';
        document.getElementById('profile-email').value = user.email || '';
        document.getElementById('profile-phone').value = user.phone || '';


        const fullAddress = user.address || '';

        const parts = fullAddress.split(',');
        let address = fullAddress;
        let city = '';

        if (parts.length > 1) {
            city = parts.pop().trim();
            address = parts.join(',').trim();
        }

        document.getElementById('profile-address').value = address;
        document.getElementById('profile-city').value = city;
    }
}


document.getElementById('profile-form')?.addEventListener('submit', async function(e) {
    e.preventDefault();


    const address = document.getElementById('profile-address').value;
    const city = document.getElementById('profile-city').value;
    const fullAddress = city ? `${address}, ${city}` : address;

    const profileData = {
        firstName: document.getElementById('profile-first-name').value,
        lastName: document.getElementById('profile-last-name').value,
        email: document.getElementById('profile-email').value,
        phone: document.getElementById('profile-phone').value,
        address: fullAddress,
    };


    try {
        const response = await apiRequest(API_CONFIG.ENDPOINTS.USER_PROFILE, {
            method: 'PUT',
            body: profileData
        });

        if (response.success && response.data.success) {
            showAlert('Profile updated successfully!', 'success');


            const updatedUser = {
                ...user,
                firstName: profileData.firstName,
                lastName: profileData.lastName,
                phone: profileData.phone,
                address: profileData.address
            };
            localStorage.setItem('user', JSON.stringify(updatedUser));


            document.getElementById('user-name').textContent = `${profileData.firstName} ${profileData.lastName}`;

        } else {
            showAlert(response.error || 'Failed to update profile.', 'error');
        }
    } catch (error) {
        console.error('Profile update error:', error);
        showAlert('A connection error occurred.', 'error');
    }

});


window.addEventListener('DOMContentLoaded', () => {
    loadProfileData();


    const darkMode = localStorage.getItem('darkMode');
    if (darkMode === 'enabled') {
        document.body.classList.add('dark-mode');
    }
});