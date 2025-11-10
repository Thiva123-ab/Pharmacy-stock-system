
const user = JSON.parse(localStorage.getItem('user') || '{}');
let allOrders = []; // Global store for orders


let unreadChatMap = {};
let allNotifications = [];


const lkrFormatter = new Intl.NumberFormat('si-LK', {
    style: 'currency',
    currency: 'LKR',
});

const deliveryModal = document.getElementById('delivery-modal');
const deliveryForm = document.getElementById('delivery-form');
const cancelDeliveryBtn = document.getElementById('cancel-delivery-btn');

const viewModal = document.getElementById('view-order-modal');
const viewModalContent = document.getElementById('order-details-content');
const cancelViewBtn = document.getElementById('cancel-view-btn');

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


if (document.getElementById('user-name')) {
    document.getElementById('user-name').textContent = user.firstName ? `${user.firstName} ${user.lastName}` : 'Pharmacist';
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

// --- Load Orders from Backend (UPDATED) ---
async function loadOrders() {
    // 1. Load unread chats first
    await loadUnreadChats();

    // 2. Load orders
    const tbody = document.getElementById('orders-table-body');
    try {
        const response = await apiRequest(API_CONFIG.ENDPOINTS.GET_ORDERS, {
            method: 'GET'
        });
        if (response.success && response.data.data) {
            allOrders = response.data.data;
            displayOrders(allOrders);
            updateStats(allOrders);
        } else {
            showAlert(response.error || 'Failed to load orders.', 'error');
            tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: red;">Error loading orders.</td></tr>`;
        }
    } catch (error) {
        console.error('Error fetching orders:', error);
        showAlert('A connection error occurred.', 'error');
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: red;">Connection error.</td></tr>`;
    }
}

// --- UPDATED: Display Orders in Table (with actions) ---
function displayOrders(orders) {
    const tbody = document.getElementById('orders-table-body');
    if (orders.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 40px; color: #666;">
                    <i class="fas fa-shopping-cart" style="font-size: 48px; opacity: 0.3; margin-bottom: 15px;"></i>
                    <p>No orders found.</p>
                </td>
            </tr>
        `;
        return;
    }
    tbody.innerHTML = orders.map(order => {
        let statusClass = 'pending';
        let actionButtons = '';

        // --- START: UPDATED CHAT BUTTONS (Icon + Text) ---
        const unreadCustomer = unreadChatMap[`${order.id}_PHARMACIST`] === true;
        const unreadLogistics = unreadChatMap[`${order.id}_LOGISTICS`] === true;

        const viewButton = `
            <button class="quick-action-btn" style="padding: 6px 12px; font-size: 12px; background: #0288d1; width: 100%;" onclick="viewOrder(${order.id})" title="View Order">
                <i class="fas fa-eye"></i> View Order
            </button>
        `;
        // Button 1: Chat with Customer
        const chatCustomerButton = `
            <button id="chat_btn_${order.id}_PHARMACIST" class="quick-action-btn ${unreadCustomer ? 'has-unread' : ''}" style="padding: 6px 12px; font-size: 12px; background: #7b1fa2; width: 100%;" onclick="openChatModal(${order.id}, 'PHARMACIST')" title="Chat with Customer">
                <i class="fas fa-user"></i> Chat Customer
            </button>
        `;
        // Button 2: Chat with Driver (Only enable if assigned)
        const canChatDriver = order.status === 'PROCESSING' || order.status === 'IN_TRANSIT' || order.status === 'DELIVERED' || order.status === 'COMPLETED';
        const chatDriverButton = `
            <button id="chat_btn_${order.id}_LOGISTICS" class="quick-action-btn ${unreadLogistics ? 'has-unread' : ''}" 
                    style="padding: 6px 12px; font-size: 12px; background: #1e88e5; width: 100%; ${!canChatDriver ? 'opacity: 0.5; cursor: not-allowed;' : ''}" 
                    onclick="openChatModal(${order.id}, 'LOGISTICS')"
                    ${!canChatDriver ? 'disabled title="Chat with driver (available after assigning)"' : 'title="Chat with Driver"'}>
                <i class="fas fa-truck"></i> Chat Driver
            </button>
        `;
        // --- END: UPDATED CHAT BUTTONS ---

        if (order.status === 'PENDING') {
            statusClass = 'pending';
            actionButtons = `
                <button class="quick-action-btn blue" style="padding: 6px 12px; font-size: 12px; width: 100%;" onclick="openAssignModal(${order.id})">
                    <i class="fas fa-truck"></i> Assign
                </button>`;
        } else if (order.status === 'PROCESSING') {
            statusClass = 'processing';
            actionButtons = `<span style="color: #999; display: block; text-align: center; padding: 6px 0;">Assigned</span>`;
        } else if (order.status === 'COMPLETED' || order.status === 'DELIVERED') {
            statusClass = 'completed';
            actionButtons = `<span style="color: #2e7d32; display: block; text-align: center; padding: 6px 0;">Done</span>`;
        } else {
            statusClass = 'red';
            actionButtons = `<span style="color: #c62828; display: block; text-align: center; padding: 6px 0;">${order.status}</span>`;
        }

        const customerName = order.customer ? `${order.customer.firstName} ${order.customer.lastName}` : (order.customerName || 'N/A');

        // --- START: UPDATED HTML LAYOUT (STACKED) ---
        // Combine all action buttons in a stacked layout
        const allActionButtons = `
            <div style="display: flex; flex-direction: column; gap: 5px;">
                ${viewButton}
                ${chatCustomerButton}
                ${chatDriverButton}
                ${actionButtons}
            </div>
        `;
        // --- END: UPDATED HTML LAYOUT ---

        if(statusClass === 'red') {
            return `
                <tr>
                    <td>#ORD-${String(order.id).padStart(3, '0')}</td>
                    <td><strong>${customerName}</strong></td>
                    <td>${order.items ? order.items.length : 0}</td>
                    <td><strong>${lkrFormatter.format(order.totalAmount || 0)}</strong></td>
                    <td><span class="status" style="background: #ffebee; color: #c62828;">${order.status}</span></td>
                    <td style="min-width: 180px;">${allActionButtons}</td>
                </tr>
            `;
        }

        return `
            <tr>
                <td>#ORD-${String(order.id).padStart(3, '0')}</td>
                <td><strong>${customerName}</strong></td>
                <td>${order.items ? order.items.length : 0}</td>
                <td><strong>${lkrFormatter.format(order.totalAmount || 0)}</strong></td>
                <td><span class="status ${statusClass}">${order.status}</span></td>
                <td style="min-width: 180px;">${allActionButtons}</td>
            </tr>
        `;
    }).join('');
}

function updateStats(orders) {
    document.getElementById('total-orders-stat').textContent = orders.length;
    document.getElementById('pending-orders-stat').textContent = orders.filter(o => o.status === 'PENDING').length;
    document.getElementById('processing-orders-stat').textContent = orders.filter(o => o.status === 'PROCESSING').length;
    document.getElementById('completed-orders-stat').textContent = orders.filter(o => o.status === 'COMPLETED' || o.status === 'DELIVERED').length;
}

function viewOrder(orderId) {
    const order = allOrders.find(o => o.id === orderId);
    if (!order) {
        showAlert('Could not find order details.', 'error');
        return;
    }
    const itemsHtml = order.items.map(item => `
        <li style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee;">
            <span>
                <strong>${item.medicine.name}</strong><br>
                <small>${item.quantity} x ${lkrFormatter.format(item.price)}</small>
            </span>
            <strong style="padding-top: 8px;">${lkrFormatter.format(item.price * item.quantity)}</strong>
        </li>
    `).join('');
    const customerName = order.customer ? `${order.customer.firstName} ${order.customer.lastName}` : (order.customerName || 'N/A');
    const customerEmail = order.customer ? order.customer.email : 'N/A';
    const customerPhone = order.customer ? order.customer.phone : 'N/A';
    const deliveryAddress = order.deliveryAddress || 'No address provided';
    viewModalContent.innerHTML = `
        <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
            <div class="form-group">
                <label>Order ID</label>
                <input type="text" class="form-control" value="#ORD-${String(order.id).padStart(3, '0')}" readonly>
            </div>
            <div class="form-group">
                <label>Status</label>
                <input type="text" class="form-control" value="${order.status}" readonly>
            </div>
        </div>
        <div class="form-group">
            <label>Customer</label>
            <input type="text" class="form-control" value="${customerName}" readonly>
        </div>
        <div class="form-group">
            <label>Email</label>
            <input type="text" class="form-control" value="${customerEmail}" readonly>
        </div>
        <div class="form-group">
            <label>Phone</label>
            <input type="text" class="form-control" value="${customerPhone}" readonly>
        </div>
        <div class="form-group">
            <label>Delivery Address</label>
            <textarea class="form-control" rows="2" readonly>${deliveryAddress}</textarea>
        </div>
        <h4 style="margin-top: 20px; border-bottom: 1px solid #eee; padding-bottom: 5px;">Items</h4>
        <ul style="list-style: none; padding: 0; margin-top: 10px;">
            ${itemsHtml}
        </ul>
        <h3 style="text-align: right; margin-top: 15px; color: #0288d1;">
            Total: ${lkrFormatter.format(order.totalAmount)}
        </h3>
    `;
    viewModal.style.display = 'flex';
}
cancelViewBtn.addEventListener('click', () => {
    viewModal.style.display = 'none';
});

async function loadDrivers() {
    const driverSelect = document.getElementById('modal-driver-select');
    driverSelect.innerHTML = '<option value="">Loading drivers...</option>';
    try {
        const response = await apiRequest(API_CONFIG.ENDPOINTS.GET_DELIVERY_DRIVERS, { method: 'GET' });
        if (response.success && response.data.data) {
            const drivers = response.data.data;
            if (drivers.length === 0) {
                driverSelect.innerHTML = '<option value="">No drivers found</option>';
                return;
            }
            driverSelect.innerHTML = '<option value="">Select a driver</option>';
            drivers.forEach(driver => {
                const option = document.createElement('option');
                option.value = driver.id;
                option.textContent = `${driver.firstName} ${driver.lastName} (${driver.vehicleType || 'N/A'})`;
                driverSelect.appendChild(option);
            });
        } else {
            driverSelect.innerHTML = '<option value="">Error loading drivers</option>';
        }
    } catch (error) {
        driverSelect.innerHTML = '<option value="">Connection error</option>';
    }
}
function openAssignModal(orderId) {
    deliveryForm.reset();
    document.getElementById('modal-order-id').value = orderId;
    document.getElementById('modal-order-id-display').value = `#ORD-${String(orderId).padStart(3, '0')}`;
    document.getElementById('modal-schedule-date').value = new Date().toISOString().split('T')[0];
    loadDrivers();
    deliveryModal.style.display = 'flex';
}
cancelDeliveryBtn.addEventListener('click', () => {
    deliveryModal.style.display = 'none';
});
deliveryForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    btn.disabled = true;
    const data = {
        orderId: document.getElementById('modal-order-id').value,
        driverId: document.getElementById('modal-driver-select').value,
        scheduledDate: document.getElementById('modal-schedule-date').value,
        status: "ASSIGNED"
    };
    if (!data.driverId) {
        showAlert('Please select a driver.', 'error');
        btn.disabled = false;
        return;
    }
    try {
        const response = await apiRequest(API_CONFIG.ENDPOINTS.CREATE_DELIVERY, {
            method: 'POST',
            body: data
        });
        if (response.success) {
            showAlert('Delivery assigned successfully!', 'success');
            deliveryModal.style.display = 'none';
            loadOrders();
        } else {
            showAlert(response.error || 'Failed to assign delivery.', 'error');
        }
    } catch (error) {
        showAlert('A connection error occurred.', 'error');
    } finally {
        btn.disabled = false;
    }
});

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

    let title = (chatType === 'PHARMACIST') ? 'Chat with Customer' : 'Chat with Driver';
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
    // 'user' is the logged-in pharmacist
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


// --- Load on page load ---
window.addEventListener('DOMContentLoaded', () => {
    loadOrders();
    const darkMode = localStorage.getItem('darkMode');
    if (darkMode === 'enabled') {
        document.body.classList.add('dark-mode');
    }
});