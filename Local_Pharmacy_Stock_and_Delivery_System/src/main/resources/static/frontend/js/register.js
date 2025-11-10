
document.querySelectorAll('.toggle-password').forEach(toggle => {
    toggle.addEventListener('click', function() {
        const input = this.previousElementSibling;
        const type = input.type === 'password' ? 'text' : 'password';
        input.type = type;
        this.classList.toggle('fa-eye');
        this.classList.toggle('fa-eye-slash');
    });
});


function checkPasswordStrength(password) {
    const strengthBar = document.querySelector('.password-strength-bar');
    const hint = document.querySelector('.password-hint');
    if (!strengthBar || !hint) return;
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    strengthBar.className = 'password-strength-bar';
    if (strength === 0 || password.length === 0) {
        strengthBar.style.width = '0%';
        hint.textContent = '';
    } else if (strength <= 2) {
        strengthBar.classList.add('strength-weak');
        strengthBar.style.width = '33%';
        hint.textContent = 'Weak password';
    } else if (strength === 3) {
        strengthBar.classList.add('strength-medium');
        strengthBar.style.width = '66%';
        hint.textContent = 'Medium strength';
    } else {
        strengthBar.classList.add('strength-strong');
        strengthBar.style.width = '100%';
        hint.textContent = 'Strong password';
    }
}
document.getElementById('password')?.addEventListener('input', function(e) {
    checkPasswordStrength(e.target.value);
});


function showAlert(message, type = 'error') {
    const alertBox = document.getElementById('alertBox');
    const alertMessage = document.getElementById('alertMessage');
    if (alertBox && alertMessage) {
        alertBox.className = `alert alert-${type} show`;
        alertMessage.textContent = message;
        setTimeout(() => {
            alertBox.classList.remove('show');
        }, 4000);
    } else {
        alert(message);
    }
}


function setLoading(isLoading) {
    const btn = document.getElementById('registerBtn');
    const btnText = document.getElementById('btnText');
    const btnIcon = document.getElementById('btnIcon');
    if (!btn) return;

    btn.disabled = isLoading;

    if (isLoading) {
        btnText.style.display = 'none';
        btnIcon.className = 'spinner';
    } else {
        btnText.style.display = 'inline';
        btnIcon.className = 'fas fa-arrow-right';
    }
}



function validateForm() {
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const role = document.getElementById('role').value;
    const terms = document.getElementById('terms').checked;


    if (!firstName || !lastName || !email || !phone || !password || !confirmPassword) {
        showAlert('Please fill all fields');
        return false;
    }
    if (password !== confirmPassword) {
        showAlert('Passwords do not match');
        return false;
    }
    if (password.length < 6) {
        showAlert('Password must be at least 6 characters');
        return false;
    }
    if (!role) {
        showAlert('Please select your account type');
        return false;
    }
    if (!terms) {
        showAlert('You must agree to the terms and conditions');
        return false;
    }
    return true;
}


document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();


            if (!validateForm()) {
                return;
            }

            setLoading(true);

            const firstName = document.getElementById('firstName').value.trim();
            const lastName = document.getElementById('lastName').value.trim();
            const email = document.getElementById('email').value.trim();
            const phone = document.getElementById('phone').value.trim();
            const password = document.getElementById('password').value;
            const role = document.getElementById('role').value;


            const userData = {
                firstName: firstName,
                lastName: lastName,
                email: email,
                phone: phone,
                password: password,
                role: role
            };

            try {

                const response = await apiRequest(API_CONFIG.ENDPOINTS.REGISTER, {
                    method: 'POST',
                    body: userData
                });


                if (response.success && response.data.success) {

                    showAlert('Registration successful! Redirecting to login...', 'success');
                    registerForm.reset();

                    setTimeout(() => {
                        window.location.href = 'login.html';
                    }, 1500);


                } else {

                    let errorMsg = response.data?.message || response.error || 'Registration failed.';
                    if (response.data?.errors) {
                        errorMsg = Object.values(response.data.errors)[0];
                    }
                    showAlert(errorMsg, 'error');
                    setLoading(false);
                }
            } catch (err) {
                console.error("Registration Error:", err);
                showAlert('Connection error. Please check your backend.', 'error');
                setLoading(false);
            }
        });
    }


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

    }
});