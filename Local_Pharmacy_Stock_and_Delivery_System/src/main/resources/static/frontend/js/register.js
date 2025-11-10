// Register Page JavaScript

// Password visibility toggle
document.querySelectorAll('.toggle-password').forEach(toggle => {
    toggle.addEventListener('click', function() {
        const input = this.previousElementSibling;
        const type = input.type === 'password' ? 'text' : 'password';
        input.type = type;
        this.classList.toggle('fa-eye');
        this.classList.toggle('fa-eye-slash');
    });
});

// Minimal Password Strength Check for feedback only
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

// Minimal field error/alert handling
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

// Set Loading State
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


// --- START OF FIX ---

// Updated validation
function validateForm() {
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim(); // <-- THIS IS NOW ADDED.
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const role = document.getElementById('role').value;
    const terms = document.getElementById('terms').checked;

    // This check now includes 'phone'
    if (!firstName || !lastName || !email || !phone || !password || !confirmPassword) {
        showAlert('Please fill all fields');
        return false;
    }
    if (password !== confirmPassword) {
        showAlert('Passwords do not match');
        return false;
    }
    if (password.length < 6) { // Added password length check
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
    return true; // If all checks pass
}

// Handle Registration Form Submit
document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            // The 'validateForm' function will now check for phone
            if (!validateForm()) {
                return; // Stop if validation fails
            }

            setLoading(true);

            const firstName = document.getElementById('firstName').value.trim();
            const lastName = document.getElementById('lastName').value.trim();
            const email = document.getElementById('email').value.trim();
            const phone = document.getElementById('phone').value.trim(); // <-- THIS IS NOW ADDED.
            const password = document.getElementById('password').value;
            const role = document.getElementById('role').value;

            // This object format now matches your updated RegisterDTO.java
            const userData = {
                firstName: firstName,
                lastName: lastName,
                email: email,
                phone: phone, // <-- THIS IS NOW ADDED.
                password: password,
                role: role
            };

            try {
                // This now uses the function from config.js
                const response = await apiRequest(API_CONFIG.ENDPOINTS.REGISTER, {
                    method: 'POST',
                    body: userData // apiRequest will stringify this
                });

                // This checks the 'success' flag from our new apiRequest function
                if (response.success && response.data.success) {
                    // --- START OF EDIT ---
                    // User wants to go to login page, not auto-login
                    showAlert('Registration successful! Redirecting to login...', 'success');
                    registerForm.reset();

                    setTimeout(() => {
                        window.location.href = 'login.html'; // Go to login page
                    }, 1500);
                    // --- END OF EDIT ---

                } else {
                    // Show a specific error from the backend (like "Email already registered")
                    let errorMsg = response.data?.message || response.error || 'Registration failed.';
                    if (response.data?.errors) {
                        errorMsg = Object.values(response.data.errors)[0]; // Show first validation error
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

    // Check if already logged in (in case user clicks back button)
    const token = localStorage.getItem('token');
    if (token) {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        // --- START OF FIX ---
        // Redirect based on role
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
        // --- END OF FIX ---
    }
});