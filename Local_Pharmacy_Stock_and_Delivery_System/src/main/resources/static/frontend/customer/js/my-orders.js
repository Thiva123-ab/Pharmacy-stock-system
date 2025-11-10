

const user = JSON.parse(localStorage.getItem('user') || '{}');
let allMyOrders = [];


let unreadChatMap = {};
let allNotifications = [];



const lkrFormatter = new Intl.NumberFormat('si-LK', {
    style: 'currency',
    currency: 'LKR',
});


const chatModal = document.getElementById('chat-modal');
const chatModalTitle = document.getElementById('chat-modal-title');
const chatMessagesContainer = document.getElementById('chat-messages-container');
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const cancelChatBtn = document.getElementById('cancel-chat-btn');
let stompClient = null;
let currentChatOrderId = null;
let currentChatType = null;




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
        localStorage.removeItem('cart');
        window.location.href = '../index.html';
    }
});


function showAlert(message, type = 'success') {
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
        }, 5000);
    }, 5000);
}


async function loadUnreadChats() {
    unreadChatMap = {};
    const response = await apiRequest(API_CONFIG.ENDPOINTS.GET_NOTIFICATIONS, { method: 'GET' });
    if (response.success && response.data.data) {
        allNotifications = response.data.data;

        const unreadChatNotifications = allNotifications.filter(n => !n.read && n.link && n.link.startsWith('/chat/order/'));


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




async function loadMyOrders() {

    await loadUnreadChats();


    const tbody = document.getElementById('my-orders-table-body');
    if (!tbody) {
        console.error('Orders table body not found');
        return;
    }

    try {
        const response = await apiRequest(API_CONFIG.ENDPOINTS.MY_ORDERS, {
            method: 'GET'
        });

        if (response.success && response.data.data) {
            allMyOrders = response.data.data;
            displayOrders(allMyOrders); //
            updateStats(allMyOrders); //
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


function displayOrders(orders) {
    const tbody = document.getElementById('my-orders-table-body');

    if (orders.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 40px; color: #666;">
                    <i class="fas fa-shopping-cart" style="font-size: 48px; opacity: 0.3; margin-bottom: 15px;"></i>
                    <p>No orders found for this status.</p>
                </td>
            </tr>
        `;
        return;
    }


    tbody.innerHTML = orders.map(order => {
        let statusClass = 'pending';


        const unreadPharmacist = unreadChatMap[`${order.id}_PHARMACIST`] === true;
        const unreadDriver = unreadChatMap[`${order.id}_DELIVERY`] === true;



        const chatPharmacistButton = `
            <button id="chat_btn_${order.id}_PHARMACIST" class="quick-action-btn ${unreadPharmacist ? 'has-unread' : ''}" title="Chat with Pharmacist" style="padding: 6px 12px; font-size: 12px; background: #7b1fa2; width: 100%;" onclick="openChatModal(${order.id}, 'PHARMACIST')">
                <i class="fas fa-user-shield"></i> Chat Admin
            </button>
        `;


        const canChatDriver = order.status === 'PROCESSING' || order.status === 'IN_TRANSIT' || order.status === 'DELIVERED';
        const chatDriverButton = `
            <button id="chat_btn_${order.id}_DELIVERY" class="quick-action-btn ${unreadDriver ? 'has-unread' : ''}" 
                    style="padding: 6px 12px; font-size: 12px; background: #1e88e5; width: 100%; ${!canChatDriver ? 'opacity: 0.5; cursor: not-allowed;' : ''}" 
                    onclick="openChatModal(${order.id}, 'DELIVERY')"
                    ${!canChatDriver ? 'disabled title="Chat with driver (available after assigning)"' : 'title="Chat with Driver"'}>
                <i class="fas fa-truck"></i> Chat Driver
            </button>
        `;


        const canTrack = order.status === 'PENDING' || order.status === 'PROCESSING' || order.status === 'IN_TRANSIT' || order.status === 'DELIVERED';
        const buttonText = (order.status === 'IN_TRANSIT' || order.status === 'DELIVERED') ? 'Track' : 'View';
        const buttonIcon = (order.status === 'IN_TRANSIT' || order.status === 'DELIVERED') ? 'fa-map-marker-alt' : 'fa-eye';

        const trackViewButton = `
            <button class="quick-action-btn ${canTrack ? 'blue' : ''}" 
                    title="${buttonText} Order"
                    style="padding: 6px 12px; font-size: 12px; width: 100%; ${!canTrack ? 'background: #999; cursor: not-allowed;' : ''}" 
                    onclick="${canTrack ? `trackOrder(${order.id})` : ''}"
                    ${!canTrack ? 'disabled' : ''}>
                <i class="fas ${buttonIcon}"></i> ${buttonText}
            </button>
        `;


        let editCancelButtons = '';
        if (order.status === 'PENDING') {
            editCancelButtons = `
                <button class="quick-action-btn orange" 
                        title="Edit Order"
                        style="padding: 6px 12px; font-size: 12px; width: 100%;" 
                        onclick="editOrder(${order.id})">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="quick-action-btn" 
                        title="Cancel Order"
                        style="padding: 6px 12px; font-size: 12px; background: #f44336; width: 100%;" 
                        onclick="cancelOrder(${order.id})">
                    <i class="fas fa-times"></i> Cancel
                </button>
            `;
        }


        if (order.status === 'PENDING') statusClass = 'pending';
        else if (order.status === 'PROCESSING') statusClass = 'processing';
        else if (order.status === 'IN_TRANSIT') statusClass = 'processing';
        else if (order.status === 'COMPLETED' || order.status === 'DELIVERED') statusClass = 'completed';
        else statusClass = 'red';


        const orderDate = new Date(order.createdAt).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric'
        });
        const orderIdString = `#ORD-${String(order.id).padStart(3, '0')}`;


        const actionCellContent = `
            <td style="min-width: 170px;">
                <div style="display: flex; flex-direction: column; gap: 5px;">
                    ${chatPharmacistButton}
                    ${chatDriverButton}
                    ${trackViewButton}
                    ${editCancelButtons}
                </div>
            </td>
        `;


        if(statusClass === 'red') {
            return `
                <tr>
                    <td>${orderIdString}</td>
                    <td>${orderDate}</td>
                    <td>${order.items ? order.items.length : 0} items</td>
                    <td><strong>${lkrFormatter.format(order.totalAmount || 0)}</strong></td>
                    <td><span class="status" style="background: #ffebee; color: #c62828;">${order.status}</span></td>
                    ${actionCellContent}
                </tr>
            `;
        }

        return `
            <tr>
                <td>${orderIdString}</td>
                <td>${orderDate}</td>
                <td>${order.items ? order.items.length : 0} items</td>
                <td><strong>${lkrFormatter.format(order.totalAmount || 0)}</strong></td>
                <td><span class="status ${statusClass}">${order.status}</span></td>
                ${actionCellContent}
            </tr>
        `;
    }).join('');
}


function updateStats(orders) {
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.status === 'PENDING' || o.status === 'PROCESSING').length;
    const completedOrders = orders.filter(o => o.status === 'DELIVERED' || o.status === 'COMPLETED').length;
    const totalSpent = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

    const totalOrdersEl = document.getElementById('total-orders');
    const pendingOrdersEl = document.getElementById('pending-orders');
    const completedOrdersEl = document.getElementById('completed-orders');
    const totalSpentEl = document.getElementById('total-spent');

    if (totalOrdersEl) totalOrdersEl.textContent = totalOrders;
    if (pendingOrdersEl) pendingOrdersEl.textContent = pendingOrders;
    if (completedOrdersEl) completedOrdersEl.textContent = completedOrders;
    if (totalSpentEl) totalSpentEl.textContent = lkrFormatter.format(totalSpent);
}


function trackOrder(orderId) {
    window.location.href = `track-order.html?orderId=${orderId}`;
}




async function cancelOrder(orderId) {
    if (!confirm("Are you sure you want to cancel this order? This action cannot be undone.")) {
        return;
    }

    try {
        const response = await apiRequest(`${API_CONFIG.ENDPOINTS.CANCEL_MY_ORDER}/${orderId}`, {
            method: 'DELETE'
        });

        if (response.success) {
            showAlert(response.data.message || 'Order cancelled successfully!', 'success');
            loadMyOrders();
        } else {
            showAlert(response.error || 'Failed to cancel order.', 'error');
        }
    } catch (error) {
        showAlert('A connection error occurred.', 'error');
    }
}

async function editOrder(orderId) {
    if (!confirm("Are you sure you want to edit this order? This will cancel the existing order and add its items back to your cart.")) {
        return;
    }

    try {
        const response = await apiRequest(`${API_CONFIG.ENDPOINTS.CANCEL_MY_ORDER}/${orderId}`, {
            method: 'DELETE'
        });

        if (response.success) {
            showAlert('Order cancelled. Adding items back to cart...', 'success');


            const cancelledOrder = response.data.data;
            let cart = JSON.parse(localStorage.getItem('cart') || '[]');

            cancelledOrder.items.forEach(item => {
                const cartItem = {
                    id: item.medicine.id,
                    name: item.medicine.name,
                    price: item.price,
                    quantity: item.quantity
                };

                const existingItem = cart.find(i => i.id === cartItem.id);
                if (existingItem) {
                    existingItem.quantity += cartItem.quantity;
                } else {
                    cart.push(cartItem);
                }
            });

            localStorage.setItem('cart', JSON.stringify(cart));


            window.location.href = 'browse-medicines.html';

        } else {
            showAlert(response.error || 'Failed to edit order.', 'error');
        }
    } catch (error) {
        showAlert('A connection error occurred.', 'error');
    }
}







async function markChatAsRead(orderId, chatType) {
    const linkToFind = `/chat/order/${orderId}/${chatType}`;


    const notificationsToMark = allNotifications.filter(n =>
        !n.read && n.link === linkToFind
    );


    for (const notification of notificationsToMark) {
        await apiRequest(`${API_CONFIG.ENDPOINTS.MARK_NOTIFICATION_READ}/${notification.id}`, {
            method: 'PUT'
        });
    }


    delete unreadChatMap[`${orderId}_${chatType}`];
    allNotifications.forEach(n => {
        if (n.link === linkToFind) {
            n.read = true;
        }
    });
}


function openChatModal(orderId, chatType) {

    markChatAsRead(orderId, chatType);


    const btnId = `chat_btn_${orderId}_${chatType}`;
    document.getElementById(btnId)?.classList.remove('has-unread');


    currentChatOrderId = orderId;
    currentChatType = chatType;

    let title = (chatType === 'PHARMACIST') ? 'Chat with Pharmacist' : 'Chat with Driver';
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

    stompClient.subscribe(`/topic/order/${orderId}/${chatType}`, onMessageReceived);


    try {
        const response = await apiRequest(`${API_CONFIG.ENDPOINTS.GET_CHAT_HISTORY}/${orderId}/${chatType}`, { method: 'GET' });
        if (response.success && response.data.data) {
            chatMessagesContainer.innerHTML = '';
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
            chatType: currentChatType
        };


        stompClient.send(`/app/chat.sendMessage/${currentChatOrderId}`, {}, JSON.stringify(chatMessage));
        chatInput.value = '';
    }
}

function displayMessage(message) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('chat-message');


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


chatForm.addEventListener('submit', sendMessage);
cancelChatBtn.addEventListener('click', disconnectChat);




window.addEventListener('DOMContentLoaded', () => {
    loadMyOrders();


    document.getElementById('status-filter')?.addEventListener('change', () => {
        const filterValue = document.getElementById('status-filter').value;
        if (filterValue === "") {
            displayOrders(allMyOrders);
        } else {

            const filteredOrders = allMyOrders.filter(order => order.status === filterValue);
            displayOrders(filteredOrders);
        }
    });


    const darkMode = localStorage.getItem('darkMode');
    if (darkMode === 'enabled') {
        document.body.classList.add('dark-mode');
    }
});