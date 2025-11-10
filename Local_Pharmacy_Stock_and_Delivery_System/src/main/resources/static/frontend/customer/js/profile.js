

const user = JSON.parse(localStorage.getItem('user') || '{}');


const lkrFormatter = new Intl.NumberFormat('si-LK', {
    style: 'currency',
    currency: 'LKR',
});


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
    if (!user) return;


    document.getElementById('first-name').value = user.firstName || '';
    document.getElementById('last-name').value = user.lastName || '';
    document.getElementById('email').value = user.email || '';
    document.getElementById('phone').value = user.phone || '';
    document.getElementById('dob').value = user.dateOfBirth || '';
    document.getElementById('address').value = user.address || '';


    document.getElementById('blood-group').value = user.bloodGroup || '';
    document.getElementById('allergies').value = user.allergies || '';
    document.getElementById('conditions').value = user.medicalConditions || '';


    document.getElementById('total-orders-stat').textContent = `${user.totalOrders || 0} orders placed`;

}


async function loadAccountStats() {
    try {
        const response = await apiRequest(API_CONFIG.ENDPOINTS.MY_ORDERS, { method: 'GET' });
        if (response.success && response.data.data) {
            const orders = response.data.data;


            const totalSpent = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
            document.getElementById('total-spent-stat').textContent = `${lkrFormatter.format(totalSpent)} all time`;


            if (orders.length > 0) {
                const firstOrder = orders[orders.length - 1];
                const memberSince = new Date(firstOrder.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                document.getElementById('member-since-stat').textContent = memberSince;
            } else {
                document.getElementById('member-since-stat').textContent = 'N/A';
            }
        } else {
            document.getElementById('total-spent-stat').textContent = 'Error';
            document.getElementById('member-since-stat').textContent = 'Error';
        }
    } catch (error) {
        console.error("Error loading stats:", error);
        document.getElementById('total-spent-stat').textContent = 'Error';
        document.getElementById('member-since-stat').textContent = 'Error';
    }
}


async function handleProfileUpdate(event, formType) {
    event.preventDefault();


    const profileData = {

        firstName: document.getElementById('first-name').value,
        lastName: document.getElementById('last-name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        dateOfBirth: document.getElementById('dob').value,
        address: document.getElementById('address').value,


        bloodGroup: document.getElementById('blood-group').value,
        allergies: document.getElementById('allergies').value,
        medicalConditions: document.getElementById('conditions').value
    };

    try {
        const response = await apiRequest(API_CONFIG.ENDPOINTS.USER_PROFILE, {
            method: 'PUT',
            body: profileData
        });

        if (response.success && response.data.success) {
            showAlert(`${formType} updated successfully!`, 'success');


            const updatedUser = {
                ...user,
                ...profileData
            };
            localStorage.setItem('user', JSON.stringify(updatedUser));


            document.getElementById('user-name').textContent = `${profileData.firstName} ${profileData.lastName}`;

        } else {
            showAlert(response.error || `Failed to update ${formType.toLowerCase()}.`, 'error');
        }
    } catch (error) {
        console.error('Profile update error:', error);
        showAlert('A connection error occurred.', 'error');
    }
}


document.getElementById('profile-form')?.addEventListener('submit', (e) => {
    handleProfileUpdate(e, 'Personal Information');
});

document.getElementById('health-form')?.addEventListener('submit', (e) => {
    handleProfileUpdate(e, 'Health Information');
});


window.addEventListener('DOMContentLoaded', () => {
    loadProfileData();
    loadAccountStats();


    const darkMode = localStorage.getItem('darkMode');
    if (darkMode === 'enabled') {
        document.body.classList.add('dark-mode');
    }
});