
const user = JSON.parse(localStorage.getItem('user') || '{}');
let allUsers = [];


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



async function loadUsers() {
    const tbody = document.getElementById('user-table-body');
    if (!tbody) return;

    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center;">Loading users...</td></tr>`;

    try {
        const response = await apiRequest(API_CONFIG.ENDPOINTS.GET_ALL_USERS, { method: 'GET' });

        if (response.success && response.data && Array.isArray(response.data.data)) {
            allUsers = response.data.data;
            displayUsers();
            updateStats();
        } else {
            console.error('Failed to load users:', response.error || 'Unexpected response format.');
            showAlert('Failed to load users from the server.', 'error');
            tbody.innerHTML = `<tr><td colspan="7" style="text-align: center;">Error loading users.</td></tr>`;
        }
    } catch (error) {
        console.error('Error loading users:', error);
        showAlert('Connection error. Could not load users.', 'error');
        tbody.innerHTML = `<tr><td colspan="7" style="text-align: center;">Connection error.</td></tr>`;
    }
}


function displayUsers() {
    const tbody = document.getElementById('user-table-body');
    if (!tbody) return;


    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const roleFilter = document.getElementById('role-filter').value;
    const statusFilter = document.getElementById('status-filter').value;


    const filteredUsers = allUsers.filter(user => {
        const nameMatch = (user.firstName.toLowerCase() + ' ' + user.lastName.toLowerCase()).includes(searchTerm);
        const emailMatch = user.email.toLowerCase().includes(searchTerm);
        const roleMatch = (roleFilter === "") || (user.role === roleFilter);
        const statusMatch = (statusFilter === "") || (user.status === statusFilter);

        return (nameMatch || emailMatch) && roleMatch && statusMatch;
    });

    if (filteredUsers.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align: center;">No users match your criteria.</td></tr>`;
        return;
    }

    tbody.innerHTML = filteredUsers.map(user => {
        const isUserActive = (user.status === 'ACTIVE' || !user.status);

        const statusBadge = isUserActive ?
            '<span class="status completed">Active</span>' :
            `<span class="status pending">${user.status || 'Inactive'}</span>`;

        const roleName = (user.role || 'N/A').replace('ROLE_', '');
        let roleClass = 'processing';
        if (roleName === 'CUSTOMER') roleClass = 'completed';
        if (roleName === 'ADMIN') roleClass = 'pending';


        const safeName = (user.firstName + ' ' + user.lastName).replace(/'/g, "\\'");


        const statusButtonText = isUserActive ? 'Suspend' : 'Activate';
        const statusButtonIcon = isUserActive ? 'fa-ban' : 'fa-check';
        const newStatus = isUserActive ? 'INACTIVE' : 'ACTIVE';

        return `
            <tr>
                <td>#U${String(user.id).padStart(3, '0')}</td>
                <td>${user.firstName || 'N/A'} ${user.lastName || ''}</td>
                <td>${user.email || 'N/A'}</td>
                <td>${user.phone || 'N/A'}</td>
                <td><span class="status ${roleClass}">${roleName}</span></td>
                <td>${statusBadge}</td>
                <td class="action-buttons" style="display: flex; gap: 5px;">
                    <button onclick="editUser(${user.id})" class="quick-action-btn blue" style="padding: 6px 12px; font-size: 12px;" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    
                    <button onclick="changeUserStatus(${user.id}, '${newStatus}', '${safeName}')" class="quick-action-btn orange" style="padding: 6px 12px; font-size: 12px;" title="${statusButtonText}">
                        <i class="fas ${statusButtonIcon}"></i>
                    </button>
                    <button onclick="deleteUser(${user.id}, '${safeName}')" class="quick-action-btn red" style="padding: 6px 12px; font-size: 12px;" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function updateStats() {
    document.getElementById('total-users-stat').textContent = allUsers.length.toString();
    document.getElementById('active-users-stat').textContent = allUsers.filter(u => u.status === 'ACTIVE').length.toString();
    document.getElementById('admin-users-stat').textContent = allUsers.filter(u => u.role === 'ROLE_ADMIN').length.toString();
    document.getElementById('pharmacist-users-stat').textContent = allUsers.filter(u => u.role === 'ROLE_PHARMACIST').length.toString();
}


const userModal = document.getElementById('user-modal');
const addUserBtn = document.getElementById('add-user-btn');
const cancelUserBtn = document.getElementById('cancel-user-btn');
const userForm = document.getElementById('user-form');
const modalTitle = document.getElementById('modal-title');
const modalUserId = document.getElementById('modal-user-id');
const modalPasswordField = document.getElementById('modal-password');


addUserBtn?.addEventListener('click', () => {
    userForm.reset();
    modalUserId.value = "";
    modalTitle.innerHTML = '<i class="fas fa-user-plus"></i> Add New User';
    modalPasswordField.placeholder = "Create a password (min 6 characters)";
    modalPasswordField.required = true;
    document.getElementById('modal-phone').required = true;
    userModal.style.display = 'flex';
});


cancelUserBtn?.addEventListener('click', () => {
    userModal.style.display = 'none';
});


userForm?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const idToUpdate = modalUserId.value;


    const userData = {
        firstName: document.getElementById('modal-firstName').value,
        lastName: document.getElementById('modal-lastName').value,
        email: document.getElementById('modal-email').value,
        phone: document.getElementById('modal-phone').value,
        password: modalPasswordField.value,
        role: document.getElementById('modal-user-role').value
    };


    if (!userData.firstName || !userData.lastName || !userData.email || !userData.phone) {
        showAlert('Please fill in First Name, Last Name, Email, and Phone.', 'error');
        return;
    }


    if (!idToUpdate && !userData.password) {
        showAlert('Password is required for new users.', 'error');
        return;
    }

    if (userData.password && userData.password.length < 6) {
        showAlert('Password must be at least 6 characters.', 'error');
        return;
    }


    let endpoint;
    let method;
    let successMessage;

    if (idToUpdate) {

        endpoint = `${API_CONFIG.ENDPOINTS.UPDATE_USER}/${idToUpdate}`;
        method = 'PUT';
        successMessage = 'User updated successfully!';

        if (!userData.password) {
            delete userData.password;
        }
    } else {

        endpoint = API_CONFIG.ENDPOINTS.CREATE_USER;
        method = 'POST';
        successMessage = 'User created successfully!';
    }

    try {
        const response = await apiRequest(endpoint, {
            method: method,
            body: userData
        });

        if (response.success) {
            showAlert(successMessage, 'success');
            userModal.style.display = 'none';
            loadUsers();
        } else {
            showAlert(response.error || 'Failed to save user.', 'error');
        }
    } catch (error) {
        console.error('Error saving user:', error);
        showAlert('A connection error occurred.', 'error');
    }
});



async function deleteUser(id, name) {
    if (user.email === allUsers.find(u => u.id === id)?.email) {
        showAlert("You cannot delete your own account from this panel.", "error");
        return;
    }

    if (!confirm(`Are you sure you want to permanently delete user: ${name}? This action cannot be undone.`)) {
        return;
    }

    try {
        const response = await apiRequest(`${API_CONFIG.ENDPOINTS.DELETE_USER}/${id}`, {
            method: 'DELETE'
        });

        if (response.success) {
            showAlert('User deleted successfully!', 'success');
            loadUsers();
        } else {
            showAlert(response.error || 'Failed to delete user.', 'error');
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        showAlert('A connection error occurred.', 'error');
    }
}



function editUser(id) {
    const userToEdit = allUsers.find(u => u.id === id);
    if (!userToEdit) {
        showAlert('Could not find user to edit.', 'error');
        return;
    }


    modalUserId.value = userToEdit.id;
    document.getElementById('modal-firstName').value = userToEdit.firstName;
    document.getElementById('modal-lastName').value = userToEdit.lastName;
    document.getElementById('modal-email').value = userToEdit.email;
    document.getElementById('modal-phone').value = userToEdit.phone || '';
    document.getElementById('modal-user-role').value = userToEdit.role;


    modalPasswordField.value = "";
    modalPasswordField.placeholder = "Leave blank to keep unchanged";
    modalPasswordField.required = false;
    document.getElementById('modal-phone').required = true;


    modalTitle.innerHTML = '<i class="fas fa-user-edit"></i> Edit User';


    userModal.style.display = 'flex';
}


async function changeUserStatus(id, newStatus, name) {
    if (user.email === allUsers.find(u => u.id === id)?.email) {
        showAlert("You cannot change your own status.", "error");
        return;
    }

    if (!confirm(`Are you sure you want to set user ${name} to ${newStatus}?`)) {
        return;
    }

    try {
        const response = await apiRequest(`${API_CONFIG.ENDPOINTS.UPDATE_USER_STATUS}/${id}`, {
            method: 'PUT',
            body: { status: newStatus }
        });

        if (response.success) {
            showAlert('User status updated!', 'success');
            loadUsers();
        } else {
            showAlert(response.error || 'Failed to update status.', 'error');
        }
    } catch (error) {
        console.error('Error updating status:', error);
        showAlert('A connection error occurred.', 'error');
    }
}


window.addEventListener('DOMContentLoaded', () => {
    loadUsers();


    document.getElementById('search-input').addEventListener('input', () => displayUsers());
    document.getElementById('role-filter').addEventListener('change', () => displayUsers());
    document.getElementById('status-filter').addEventListener('change', () => displayUsers());


    const darkMode = localStorage.getItem('darkMode');
    if (darkMode === 'enabled') {
        document.body.classList.add('dark-mode');
    }
});