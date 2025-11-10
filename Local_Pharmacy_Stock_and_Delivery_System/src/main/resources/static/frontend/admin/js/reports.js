
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


function triggerCsvDownload(csvData, fileName) {
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}


async function handleReportDownload(reportType, fileName, buttonElement) {
    const originalText = buttonElement.innerHTML;
    buttonElement.disabled = true;
    buttonElement.innerHTML = `<i class="fas fa-spinner fa-spin"></i> <span>Generating...</span>`;

    try {

        const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.GENERATE_REPORT}/${reportType}`;
        const token = localStorage.getItem('token');

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`Server error: ${response.statusText}`);
        }

        const csvData = await response.text();

        if (csvData) {
            triggerCsvDownload(csvData, fileName);
            showAlert('Report generated successfully!', 'success');
        } else {
            throw new Error('Received empty report data.');
        }

    } catch (error) {
        console.error('Error generating report:', error);
        showAlert(`Error generating report: ${error.message}`, 'error');
    } finally {

        buttonElement.disabled = false;
        buttonElement.innerHTML = originalText;
    }
}



window.addEventListener('DOMContentLoaded', () => {

    document.getElementById('btn-sales-report')?.addEventListener('click', (e) => {
        handleReportDownload('sales', 'sales_report.csv', e.currentTarget);
    });

    document.getElementById('btn-user-report')?.addEventListener('click', (e) => {
        handleReportDownload('user', 'user_report.csv', e.currentTarget);
    });

    document.getElementById('btn-inventory-report')?.addEventListener('click', (e) => {
        handleReportDownload('inventory', 'inventory_report.csv', e.currentTarget);
    });

    document.getElementById('btn-delivery-report')?.addEventListener('click', (e) => {
        handleReportDownload('delivery', 'delivery_report.csv', e.currentTarget);
    });


    const darkMode = localStorage.getItem('darkMode');
    if (darkMode === 'enabled') {
        document.body.classList.add('dark-mode');
    }
});