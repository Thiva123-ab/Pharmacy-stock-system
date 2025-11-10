
document.getElementById('togglePassword')?.addEventListener('click', function() {
    const passwordInput = document.getElementById('password');
    const type = passwordInput.type === 'password' ? 'text' : 'password';
    passwordInput.type = type;
    this.classList.toggle('fa-eye');
    this.classList.toggle('fa-eye-slash');
});


function showAlert(message, type = 'error') {
    const alertBox = document.getElementById('alertBox');
    const alertMessage = document.getElementById('alertMessage');

    alertBox.className = `alert alert-${type} show`;
    alertMessage.textContent = message;

    setTimeout(() => {
        alertBox.classList.remove('show');
    }, 5000);
}


function setLoading(isLoading) {
    const btn = document.getElementById('loginBtn');
    const btnText = document.getElementById('btnText');
    const btnIcon = document.getElementById('btnIcon');

    btn.disabled = isLoading;

    if (isLoading) {
        btnText.style.display = 'none';
        btnIcon.className = 'spinner';
    } else {
        btnText.style.display = 'inline';
        btnIcon.className = 'fas fa-arrow-right';
    }
}


document.getElementById('loginForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const remember = document.getElementById('remember')?.checked;


    if (!email || !password) {
        showAlert('Please enter both email and password', 'error');
        return;
    }

    setLoading(true);

    try {

        const response = await apiRequest(API_CONFIG.ENDPOINTS.LOGIN, {
            method: 'POST',
            body: { email, password }
        });

        if (response.success && response.data.success) {
            const { token, user } = response.data;


            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));

            if (remember) {
                localStorage.setItem('remember', 'true');
            }

            showAlert('Login successful! Redirecting to dashboard...', 'success');


            setTimeout(() => {
                switch(user.role) {
                    case 'ROLE_CUSTOMER':
                        window.location.href = 'customer/dashboard.html';
                        break;
                    case 'ROLE_DELIVERY':
                        window.location.href = 'delivery/dashboard.html';
                        break;
                    case 'ROLE_PHARMACIST':

                        window.location.href = 'pharmacist/dashboard.html';
                        break;
                    case 'ROLE_ADMIN':

                        window.location.href = 'admin/dashboard.html';
                        break;
                    default:

                        window.location.href = 'pharmacist/dashboard.html';
                        break;
                }
            }, 1000);


        } else {

            showAlert(response.data?.message || response.error || 'Invalid email or password', 'error');
            setLoading(false);
        }
    } catch (error) {
        console.error('Login error:', error);
        showAlert('Connection error. Please make sure the backend server is running.', 'error');
        setLoading(false);
    }
});


window.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('token');
    if (token) {
        const user = JSON.parse(localStorage.getItem('user') || '{}');


        switch(user.role) {
            case 'ROLE_CUSTOMER':
                window.location.href = 'customer/dashboard.html';
                break;
            case 'ROLE_DELIVERY':
                window.location.href = 'delivery/dashboard.html';
                break;
            case 'ROLE_PHARMACIST':
                window.location.href = 'pharmacist/dashboard.html';
                break;
            case 'ROLE_ADMIN':
                window.location.href = 'admin/dashboard.html';
                break;
            default:

                if (user.role) {
                    window.location.href = 'pharmacist/dashboard.html';
                }
                break;
        }

        return;
    }


    const darkModeLogin = localStorage.getItem('darkMode');
    if (darkModeLogin === 'enabled') {
        document.body.classList.add('dark-mode');
    }
});