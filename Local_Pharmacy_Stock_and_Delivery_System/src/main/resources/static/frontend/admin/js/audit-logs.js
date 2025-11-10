
const user = JSON.parse(localStorage.getItem('user') || '{}');


let currentPage = 0;
let totalPages = 1;

let currentFilters = {
    search: '',
    action: '',
    date: ''
};


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


async function fetchLogs() {
    const tbody = document.getElementById('logs-table-body');
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center;">Loading logs...</td></tr>`;


    const params = new URLSearchParams({
        page: currentPage,
        size: 15,
        search: currentFilters.search,
        action: currentFilters.action,
        date: currentFilters.date
    });

    try {
        const response = await apiRequest(`${API_CONFIG.ENDPOINTS.ADMIN_AUDIT_LOGS}?${params.toString()}`, {
            method: 'GET'
        });

        if (response.success && response.data.data) {
            renderTable(response.data.data);
            updatePagination(response.data);
        } else {
            showAlert(response.error || 'Failed to load audit logs.', 'error');
            tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: red;">Error loading logs.</td></tr>`;
        }
    } catch (error) {
        console.error('Error fetching logs:', error);
        showAlert('A connection error occurred.', 'error');
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: red;">Connection error.</td></tr>`;
    }
}


function renderTable(logs) {
    const tbody = document.getElementById('logs-table-body');
    if (logs.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center;">No logs found matching your criteria.</td></tr>`;
        return;
    }

    tbody.innerHTML = logs.map(log => {
        const timestamp = new Date(log.timestamp).toLocaleString('en-US', {
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit', second: '2-digit'
        });

        let actionClass = 'processing';
        if (log.action.includes('LOGIN') || log.action.includes('REGISTER')) actionClass = 'completed';
        if (log.action.includes('DELETE')) actionClass = 'pending';

        let statusClass = 'processing';
        if (log.status === 'Success') statusClass = 'completed';
        if (log.status === 'Failed') statusClass = 'pending';

        return `
            <tr>
                <td>${timestamp}</td>
                <td>${log.username}</td>
                <td><span class="status ${actionClass}">${log.action}</span></td>
                <td>${log.resource}</td>
                <td>${log.ipAddress}</td>
                <td><span class="status ${statusClass}">${log.status}</span></td>
            </tr>
        `;
    }).join('');
}


function updatePagination(pageData) {
    currentPage = pageData.currentPage;
    totalPages = pageData.totalPages;

    document.getElementById('page-info').textContent = `Page ${currentPage + 1} of ${totalPages}`;

    const prevBtn = document.getElementById('prev-page-btn');
    const nextBtn = document.getElementById('next-page-btn');

    prevBtn.disabled = (currentPage === 0);
    nextBtn.disabled = (currentPage + 1 === totalPages);


    prevBtn.style.background = prevBtn.disabled ? '#ccc' : '#4fc3f7';
    nextBtn.style.background = nextBtn.disabled ? '#ccc' : '#4fc3f7';
}


document.addEventListener('DOMContentLoaded', () => {

    fetchLogs();


    document.getElementById('filter-form').addEventListener('submit', (e) => {
        e.preventDefault();
        currentFilters.search = document.getElementById('search-logs').value;
        currentFilters.action = document.getElementById('activity-filter').value;
        currentFilters.date = document.getElementById('date-filter').value;
        currentPage = 0;
        fetchLogs();
    });


    document.getElementById('prev-page-btn').addEventListener('click', () => {
        if (currentPage > 0) {
            currentPage--;
            fetchLogs();
        }
    });

    document.getElementById('next-page-btn').addEventListener('click', () => {
        if (currentPage + 1 < totalPages) {
            currentPage++;
            fetchLogs();
        }
    });


    const darkMode = localStorage.getItem('darkMode');
    if (darkMode === 'enabled') {
        document.body.classList.add('dark-mode');
    }
});