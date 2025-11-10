

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
    alert(message);
}


async function loadNotifications() {
    const list = document.getElementById('notification-list');
    if (!list) return;

    try {
        const response = await apiRequest(API_CONFIG.ENDPOINTS.GET_NOTIFICATIONS, { method: 'GET' });
        if (response.success && response.data.data) {
            renderNotifications(response.data.data);
        } else {
            showAlert(response.error || 'Failed to load notifications.', 'error');
            list.innerHTML = `<p style="text-align: center; color: red; padding: 20px;">${response.error}</p>`;
        }
    } catch (error) {
        showAlert('Connection error.', 'error');
        list.innerHTML = `<p style="text-align: center; color: red; padding: 20px;">Connection Error</p>`;
    }
}


function renderNotifications(notifications) {
    const list = document.getElementById('notification-list');
    if (notifications.length === 0) {
        list.innerHTML = `
            <div style="text-align: center; padding: 50px; color: #666;">
                <i class="fas fa-bell-slash" style="font-size: 48px; opacity: 0.3; margin-bottom: 15px;"></i>
                <p>You have no notifications.</p>
            </div>
        `;
        return;
    }

    list.innerHTML = notifications.map(n => {
        let icon = 'fa-bell';
        let iconClass = 'blue';

        if (n.message.includes('APPROVED')) {
            icon = 'fa-check';
            iconClass = 'green';
        } else if (n.message.includes('REJECTED') || n.message.includes('failed')) {
            icon = 'fa-times';
            iconClass = 'red';
        } else if (n.message.includes('assigned') || n.message.includes('out for delivery')) {
            icon = 'fa-truck';
            iconClass = 'blue';
        }

        const timeAgo = formatTimeAgo(n.createdAt);

        return `
        <div class="notification-item ${n.read ? '' : 'unread'}" onclick="handleNotificationClick(${n.id}, '${n.link}')">
            <div class="notification-icon ${iconClass}">
                <i class="fas ${icon}"></i>
            </div>
            <div class="notification-content">
                <p>${n.message}</p>
                <small>${timeAgo}</small>
            </div>
        </div>
        `;
    }).join('');
}


async function handleNotificationClick(id, link) {

    try {
        await apiRequest(`${API_CONFIG.ENDPOINTS.MARK_NOTIFICATION_READ}/${id}/read`, {
            method: 'PUT'
        });


        loadNotifications();


        if (link && link !== 'null') {
            window.location.href = link;
        }

    } catch (error) {
        console.error("Failed to mark as read:", error);
        if (link && link !== 'null') {
            window.location.href = link;
        }
    }
}


function formatTimeAgo(dateString) {
    const now = new Date();
    const past = new Date(dateString);
    const seconds = Math.floor((now - past) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
}


window.addEventListener('DOMContentLoaded', () => {
    loadNotifications();


    const darkMode = localStorage.getItem('darkMode');
    if (darkMode === 'enabled') {
        document.body.classList.add('dark-mode');
    }
});