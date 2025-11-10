const user = JSON.parse(localStorage.getItem('user') || '{}');
let dashboardData = { activeDeliveries: [] };

// --- START: NEW NOTIFICATION GLOBALS ---
let unreadChatMap = {};
let allNotifications = [];
// --- END: NEW NOTIFICATION GLOBALS ---

// --- Price Formatter for LKR ---
const lkrFormatter = new Intl.NumberFormat('si-LK', {
    style: 'currency',
    currency: 'LKR',
});

// --- START: CHAT MODAL VARIABLES ---
const chatModal = document.getElementById('chat-modal');
const chatModalTitle = document.getElementById('chat-modal-title');
const chatMessagesContainer = document.getElementById('chat-messages-container');
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const cancelChatBtn = document.getElementById('cancel-chat-btn');
let stompClient = null;
let currentChatOrderId = null;
let currentChatType = null;
// --- END: CHAT MODAL VARIABLES ---

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
        }, 5000);
    }, 5000);
}

// --- START: NEW - Load Unread Chat Notifications ---
async function loadUnreadChats() {
    unreadChatMap = {}; // Clear map
    const response = await apiRequest(API_CONFIG.ENDPOINTS.GET_NOTIFICATIONS, { method: 'GET' });
    if (response.success && response.data.data) {
        allNotifications = response.data.data; // Store all notifications

        const unreadChatNotifications = allNotifications.filter(n => !n.read && n.link && n.link.startsWith('/chat/order/'));

        // Populate the map
        unreadChatNotifications.forEach(n => {
            const parts = n.link.split('/');
            if (parts.length === 5) {
                const orderId = parts[3];
                const chatType = parts[4];
                const key = `${orderId}_${chatType}`;
                unreadChatMap[key] = true;
            }
        });
    }
}
// --- END: NEW - Load Unread Chat Notifications ---


// --- Load All Dashboard Data (Stats, Table, Activity) ---
async function loadDashboardData() {
    // 1. Load unread chats first
    await loadUnreadChats();

    // 2. Load dashboard data
    try {
        const response = await apiRequest(API_CONFIG.ENDPOINTS.GET_DELIVERY_DASHBOARD, {
            method: 'GET'
        });

        if (response.success && response.data.data) {
            dashboardData = response.data.data; // Store data globally
            renderStats();
            renderTable(dashboardData.activeDeliveries || []); // <-- Render full list initially
            renderActivity(dashboardData.activeDeliveries || []);
        } else {
            showAlert(response.error || 'Failed to load dashboard data.', 'error');
            displayErrorState();
        }
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showAlert('A connection error occurred.', 'error');
        displayErrorState();
    }
}

// --- Render Stat Cards (Unchanged) ---
function renderStats() {
    if (!dashboardData) return;
    document.getElementById('total-deliveries').textContent = dashboardData.totalDeliveriesThisMonth || 0;
    document.getElementById('pending-deliveries').textContent = dashboardData.pendingDeliveries || 0;
    document.getElementById('completed-deliveries').textContent = dashboardData.deliveredToday || 0;
    document.getElementById('total-distance').textContent = (dashboardData.totalDistanceThisMonth || 0).toFixed(1) + ' km';
}

// --- Render Deliveries Table (WITH UPDATED CHAT BUTTONS) ---
function renderTable(deliveries) {
    const tbody = document.getElementById('deliveries-table-body');
    if (!tbody) return;

    if (deliveries.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 40px; color: #666;">
                    <i class="fas fa-truck" style="font-size: 48px; opacity: 0.3; margin-bottom: 15px;"></i>
                    <p>No active deliveries found for this filter.</p>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = deliveries.map(delivery => {
        const order = delivery.order;
        if (!order) return '';

        const customer = order.customer;
        const customerName = customer ? `${customer.firstName} ${customer.lastName}` : 'N/A';
        const orderId = order.id;

        let statusBadge, actionButtons;

        // --- START: UPDATED CHAT BUTTONS ---
        const unreadCustomer = unreadChatMap[`${orderId}_DELIVERY`] === true;
        const unreadLogistics = unreadChatMap[`${orderId}_LOGISTICS`] === true;

        // Button 1: Chat with Customer
        const chatCustomerButton = `
            <button id="chat_btn_${orderId}_DELIVERY" class="quick-action-btn ${unreadCustomer ? 'has-unread' : ''}" style="padding: 6px 12px; font-size: 12px; background: #7b1fa2; width: 100%;" onclick="openChatModal(${orderId}, 'DELIVERY')" title="Chat with Customer">
                <i class="fas fa-user"></i> Chat Customer
            </button>
        `;
        // Button 2: Chat with Pharmacist
        const chatPharmacistButton = `
            <button id="chat_btn_${orderId}_LOGISTICS" class="quick-action-btn ${unreadLogistics ? 'has-unread' : ''}" style="padding: 6px 12px; font-size: 12px; background: #0288d1; width: 100%;" onclick="openChatModal(${orderId}, 'LOGISTICS')" title="Chat with Pharmacist/Admin">
                <i class="fas fa-user-shield"></i> Chat Pharmacist
            </button>
        `;
        // --- END: UPDATED CHAT BUTTONS ---

        if (delivery.status === 'ASSIGNED') {
            statusBadge = `<span class="status pending">Assigned</span>`;
            actionButtons = `
                <button class="quick-action-btn blue" style="padding: 6px 12px; font-size: 12px; width: 100%;" onclick="updateDeliveryStatus(${delivery.id}, 'IN_TRANSIT')">
                    <i class="fas fa-truck"></i> Start Delivery
                </button>
            `;
        } else { // IN_TRANSIT
            statusBadge = `<span class="status processing">In Transit</span>`;
            actionButtons = `
                <button class="quick-action-btn green" style="padding: 6px 12px; font-size: 12px; width: 100%;" onclick="updateDeliveryStatus(${delivery.id}, 'DELIVERED')">
                    <i class="fas fa-check"></i> Complete Delivery
                </button>
            `;
        }

        // --- START: UPDATED HTML LAYOUT (STACKED) ---
        // Combine all action buttons in a stacked layout
        const allActionButtons = `
            <div style="display: flex; flex-direction: column; gap: 5px;">
                ${chatCustomerButton}
                ${chatPharmacistButton}
                ${actionButtons}
            </div>
        `;
        // --- END: UPDATED HTML LAYOUT ---

        return `
            <tr>
                <td>#ORD-${String(orderId).padStart(3, '0')}</td>
                <td>${customerName}</td>
                <td>${delivery.deliveryAddress}</td>
                <td>${statusBadge}</td>
                <td style="min-width: 180px;">${allActionButtons}</td>
            </tr>
        `;
    }).join('');
}

// --- Render Activity Feed (Unchanged) ---
function renderActivity(deliveries) {
    const list = document.getElementById('recent-activity-list');
    if(!list) return;

    const timeAgo = (dateString) => {
        if (!dateString) return 'just now';
        const now = new Date();
        const past = new Date(dateString);
        const seconds = Math.floor((now - past) / 1000);
        let interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " hours ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " minutes ago";
        return Math.floor(seconds) + " seconds ago";
    };

    if (deliveries.length === 0) {
        list.innerHTML = `<div style="padding: 20px; text-align: center; color: #666;">No recent activity.</div>`;
        return;
    }

    list.innerHTML = deliveries.slice(0, 3).map(delivery => {
        let icon, iconClass, title, time;
        if (delivery.status === 'ASSIGNED') {
            icon = 'fa-box';
            iconClass = 'orange';
            title = 'New Assignment';
            time = timeAgo(delivery.order.createdAt);
        } else { // IN_TRANSIT
            icon = 'fa-truck';
            iconClass = 'blue';
            title = 'Started Delivery';
            time = 'Just now';
        }
        return `
            <div class="activity-item">
                <div class="activity-icon ${iconClass}">
                    <i class="fas ${icon}"></i>
                </div>
                <div class="activity-details">
                    <h4>${title}</h4>
                    <p>Order #DEL-${String(delivery.id).padStart(3, '0')} is ${delivery.status.toLowerCase()}</p>
                    <small>${time}</small>
                </div>
            </div>
        `;
    }).join('');
}


// --- Handle Status Updates (Unchanged) ---
function updateDeliveryStatus(id, newStatus) {
    if (newStatus === 'OUT_FOR_DELIVERY') newStatus = 'IN_TRANSIT';
    if (newStatus === 'FAILED_DELIVERY') newStatus = 'FAILED';

    if (confirm(`Are you sure you want to mark this delivery as "${newStatus}"?`)) {
        sendUpdate(id, newStatus);
    }
}

async function sendUpdate(id, newStatus) {
    try {
        const response = await apiRequest(`${API_CONFIG.ENDPOINTS.UPDATE_DELIVERY_STATUS}/${id}`, {
            method: 'PUT',
            body: { status: newStatus }
        });

        if (response.success) {
            showAlert(`Delivery status updated to ${newStatus}!`, 'success');
            loadDashboardData(); // Refresh all data
        } else {
            showAlert(response.error || `Failed to update status.`, 'error');
        }
    } catch (error) {
        console.error('Error updating status:', error);
        showAlert('A connection error occurred.', 'error');
    }
}

// --- Show error state on fail (Unchanged) ---
function displayErrorState() {
    document.getElementById('total-deliveries').textContent = 'N/A';
    document.getElementById('pending-deliveries').textContent = 'N/A';
    document.getElementById('completed-deliveries').textContent = 'N/A';
    document.getElementById('total-distance').textContent = 'N/A';
    document.getElementById('deliveries-table-body').innerHTML = `
        <tr>
            <td colspan="5" style="text-align: center; padding: 40px; color: red;">
                <i class="fas fa-exclamation-triangle" style="font-size: 48px; opacity: 0.3; margin-bottom: 15px;"></i>
                <p>Could not load delivery data.</p>
            </td>
        </tr>
    `;
    document.getElementById('recent-activity-list').innerHTML = `<div style="text-align: center; color: red; padding: 20px;">Could not load activity.</div>`;
}


// --- START: UPDATED CHAT FUNCTIONS ---

// --- NEW: Function to mark chat notifications as read ---
async function markChatAsRead(orderId, chatType) {
    const linkToFind = `/chat/order/${orderId}/${chatType}`;

    // Find all unread notifications that match this chat
    const notificationsToMark = allNotifications.filter(n =>
        !n.read && n.link === linkToFind
    );

    // Send a "mark as read" request for each one
    for (const notification of notificationsToMark) {
        await apiRequest(`${API_CONFIG.ENDPOINTS.MARK_NOTIFICATION_READ}/${notification.id}`, {
            method: 'PUT'
        });
    }

    // Update the global map and list
    delete unreadChatMap[`${orderId}_${chatType}`];
    allNotifications.forEach(n => {
        if (n.link === linkToFind) {
            n.read = true;
        }
    });
}

function openChatModal(orderId, chatType) {
    // --- START: MARK AS READ ---
    markChatAsRead(orderId, chatType);
    const btnId = `chat_btn_${orderId}_${chatType}`;
    document.getElementById(btnId)?.classList.remove('has-unread');
    // --- END: MARK AS READ ---

    currentChatOrderId = orderId;
    currentChatType = chatType; // <-- Store the chat type

    let title = (chatType === 'DELIVERY') ? 'Chat with Customer' : 'Chat with Pharmacist';
    chatModalTitle.innerHTML = `<i class="fas fa-comments"></i> ${title} (Order #${String(orderId).padStart(3, '0')})`;

    chatMessagesContainer.innerHTML = '<div class="spinner" style="margin: 20px auto;"></div>';
    chatModal.style.display = 'flex';
    connectToChat(orderId, chatType);
}

function connectToChat(orderId, chatType) {
    const token = localStorage.getItem('token');
    if (!token) {
        showAlert('You are not logged in.', 'error');
        return;
    }
    if (stompClient) {
        stompClient.disconnect();
    }
    const socket = new SockJS(`${API_CONFIG.BASE_URL}/ws`);
    stompClient = Stomp.over(socket);
    const headers = {
        'Authorization': `Bearer ${token}`
    };
    stompClient.connect(headers, () => onChatConnected(orderId, chatType), onChatError);
}

async function onChatConnected(orderId, chatType) {
    // Subscribe to the specific topic
    stompClient.subscribe(`/topic/order/${orderId}/${chatType}`, onMessageReceived);

    // Fetch message history from the specific endpoint
    try {
        const response = await apiRequest(`${API_CONFIG.ENDPOINTS.GET_CHAT_HISTORY}/${orderId}/${chatType}`, { method: 'GET' });
        if (response.success && response.data.data) {
            chatMessagesContainer.innerHTML = ''; // Clear spinner
            response.data.data.forEach(displayMessage);
        } else {
            chatMessagesContainer.innerHTML = '<p>Could not load history.</p>';
            showAlert(response.error || 'Failed to load chat history.', 'error');
        }
    } catch (error) {
        chatMessagesContainer.innerHTML = '<p>Connection error loading history.</p>';
        showAlert('Connection error. Could not load history.', 'error');
    }
}

function onChatError(error) {
    console.error('STOMP Error:', error);
    showAlert('Could not connect to chat service.', 'error');
    chatMessagesContainer.innerHTML = '<p style="color: red; text-align: center;">Chat connection failed.</p>';
}

function onMessageReceived(payload) {
    const message = JSON.parse(payload.body);
    displayMessage(message);
}

function sendMessage(event) {
    event.preventDefault();
    const messageContent = chatInput.value.trim();
    if (messageContent && stompClient) {
        const chatMessage = {
            content: messageContent,
            orderId: currentChatOrderId,
            chatType: currentChatType // <-- Send the chat type
        };
        stompClient.send(`/app/chat.sendMessage/${currentChatOrderId}`, {}, JSON.stringify(chatMessage));
        chatInput.value = '';
    }
}

function displayMessage(message) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('chat-message');
    // 'user' is the logged-in delivery driver
    if (message.senderId === user.id) {
        messageElement.classList.add('sender');
    } else {
        messageElement.classList.add('receiver');
    }
    const senderName = document.createElement('div');
    senderName.classList.add('sender-name');
    const role = (message.senderRole || 'USER').replace('ROLE_', '');
    senderName.textContent = `${message.senderName} (${role})`;
    const messageContent = document.createElement('p');
    messageContent.textContent = message.content;
    messageElement.appendChild(senderName);
    messageElement.appendChild(messageContent);
    chatMessagesContainer.appendChild(messageElement);
    chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
}

function disconnectChat() {
    if (stompClient) {
        stompClient.disconnect();
    }
    stompClient = null;
    currentChatOrderId = null;
    currentChatType = null;
    chatModal.style.display = 'none';
}

// Add event listeners for chat
chatForm.addEventListener('submit', sendMessage);
cancelChatBtn.addEventListener('click', disconnectChat);
// --- END: UPDATED CHAT FUNCTIONS ---


// Load on page load
window.addEventListener('DOMContentLoaded', () => {
    loadDashboardData();

    // --- START: ADDED FILTER LISTENER ---
    document.getElementById('status-filter')?.addEventListener('change', () => {
        const filterValue = document.getElementById('status-filter').value;
        if (filterValue === "") {
            // Show all active deliveries
            renderTable(dashboardData.activeDeliveries || []);
        } else {
            // Filter the list
            const filteredDeliveries = dashboardData.activeDeliveries.filter(d => d.status === filterValue);
            renderTable(filteredDeliveries);
        }
    });
    // --- END: ADDED FILTER LISTENER ---

    const darkMode = localStorage.getItem('darkMode');
    if (darkMode === 'enabled') {
        document.body.classList.add('dark-mode');
    }
});