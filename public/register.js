document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('registerForm');
    const captchaDisplay = document.getElementById('captchaDisplay');
    const refreshCaptchaBtn = document.getElementById('refreshCaptcha');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    let currentCaptcha = '';

    // Generate random CAPTCHA (uppercase letters and numbers only)
    function generateCaptcha() {
        const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let captcha = '';
        for (let i = 0; i < 6; i++) {
            captcha += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return captcha;
    }

    // Display CAPTCHA
    function displayCaptcha() {
        currentCaptcha = generateCaptcha();
        captchaDisplay.textContent = currentCaptcha;
    }

    // Initial CAPTCHA display
    displayCaptcha();
    
    // Add CAPTCHA input handling
    const captchaInput = document.getElementById('captcha');
    if (captchaInput) {
        captchaInput.addEventListener('input', function(e) {
            // Convert to uppercase and remove any non-alphanumeric characters
            let value = e.target.value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
            // Limit to 6 characters
            e.target.value = value.slice(0, 6);
        });
    }

    // Refresh CAPTCHA
    refreshCaptchaBtn.addEventListener('click', displayCaptcha);

    // Password validation
    function validatePassword(password) {
        const errors = [];
        const minLength = 8;
        const maxLength = 32;
        if (password.length < minLength) {
            errors.push(`Password must be at least ${minLength} characters long`);
        }
        if (password.length > maxLength) {
            errors.push(`Password must not exceed ${maxLength} characters`);
        }
        if (!/[A-Z]/.test(password)) {
            errors.push('Password must contain at least one uppercase letter');
        }
        if (!/[a-z]/.test(password)) {
            errors.push('Password must contain at least one lowercase letter');
        }
        if (!/[0-9]/.test(password)) {
            errors.push('Password must contain at least one number');
        }
        if (!/[!@#$%^&*(),.?":{}|<>~`\-_=+\[\]{}\\|;:'",<.>\/]/.test(password)) {
            errors.push('Password must contain at least one special character');
        }
        return errors;
    }

    // Add numeric-only and maxlength formatting for number fields (to match form-format.js)
    ['homeNo', 'mobileNo', 'businessDl'].forEach(function(id) {
        const el = document.getElementById(id);
        if (el) {
            el.setAttribute('maxlength', 20);
            el.addEventListener('input', function() {
                this.value = this.value.replace(/[^0-9]/g, '').slice(0, 20);
            });
        }
    });

    // Form submission
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        const captchaInput = document.getElementById('captcha').value;

        // Validate password
        const passwordErrors = validatePassword(password);
        if (passwordErrors.length > 0) {
            alert(passwordErrors.join('\n'));
            return;
        }

        // Check if passwords match
        if (password !== confirmPassword) {
            alert('Passwords do not match!');
            return;
        }

        // Validate CAPTCHA
        if (captchaInput.toUpperCase() !== currentCaptcha) {
            alert('Invalid CAPTCHA! Please try again.');
            displayCaptcha();
            return;
        }

        // Collect form data
        const pin = document.getElementById('philhealthId').value;
        const fullName = document.getElementById('fullName').value;
        const dateOfBirth = document.getElementById('dateOfBirth').value;
        const sex = document.getElementById('sex').value;
        const email = document.getElementById('email').value;
        const mobileNo = document.getElementById('mobileNo').value;

        // 1. Check if PIN exists in member table
        fetch(`http://localhost:3000/api/check-pin?pin=${encodeURIComponent(pin)}`)
            .then(res => res.json())
            .then(data => {
                if (!data.exists) {
                    alert('PIN does not exist. Please register as a member first.');
                    throw new Error('PIN does not exist');
                }
                // 2. Check if account already exists for this PIN
                return fetch(`http://localhost:3000/api/check-account?pin=${encodeURIComponent(pin)}`);
            })
            .then(res => res.json())
            .then(data => {
                if (data.exists) {
                    alert('An account for this PIN already exists.');
                    throw new Error('Account already exists');
                }
                // 3. If all checks pass, create the account
                const formData = {
                    pin,
                    full_name: fullName,
                    date_of_birth: dateOfBirth,
                    sex,
                    email,
                    mobile_no: mobileNo,
                    password
                };
                return fetch('http://localhost:3000/create-account', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    window.location.href = 'account-success.html?pin=' + encodeURIComponent(data.pin);
                } else {
                    alert(data.error || 'Registration failed. Please try again.');
                }
            })
            .catch(error => {
                if (error.message !== 'PIN does not exist' && error.message !== 'Account already exists') {
                    alert('An error occurred during registration. Please try again.');
                }
            });
    });

    // Real-time password validation
    passwordInput.addEventListener('input', function() {
        const password = this.value;
        const errors = validatePassword(password);
        this.style.borderColor = errors.length === 0 ? '#28a745' : '#dc3545';
    });

    // Real-time password confirmation
    confirmPasswordInput.addEventListener('input', function() {
        const password = passwordInput.value;
        const confirmPassword = this.value;
        this.style.borderColor = password === confirmPassword ? '#28a745' : '#dc3545';
    });

  // Auto-format PhilHealth Identification Number input
const philhealthInput = document.getElementById('philhealthId');
if (philhealthInput) {
    // Prevent non-numeric input
    philhealthInput.addEventListener('keypress', function(e) {
        if (!/[\d]/.test(e.key)) {
            e.preventDefault();
        }
    });

    philhealthInput.addEventListener('input', function(e) {
        // Remove non-numeric characters
        let value = e.target.value.replace(/[^0-9]/g, '');

        // Format: 2 digits - 9 digits - 1 digit
        if (value.length > 2) {
            value = value.slice(0,2) + '-' + value.slice(2);
        }
        if (value.length > 12) {
            value = value.slice(0,12) + '-' + value.slice(12,13);
        }
        e.target.value = value.slice(0,14); // 2+1+9+1+1+1 = 14 chars with hyphens
    });
} 

        // Validate format on blur and check if PIN exists in the database
        philhealthInput.addEventListener('blur', function() {
            const value = this.value;
            const pattern = /^\d{2}-\d{9}-\d{1}$/;
            if (!pattern.test(value)) {
                this.setCustomValidity('Please enter a valid PhilHealth ID in the format: XX-XXXXXXXXX-X');
                return;
            }
            // Check with server if PIN exists
            fetch(`http://localhost:3000/api/check-pin?pin=${encodeURIComponent(value)}`)
                .then(res => res.json())
                .then(data => {
                    if (!data.exists) {
                        philhealthInput.setCustomValidity('PIN does not exist. Please create an account first or input the correct and existing PIN.');
                    } else {
                        philhealthInput.setCustomValidity('');
                    }
                })
                .catch(() => {
                    philhealthInput.setCustomValidity('Error checking PIN. Please try again.');
                });
        });
    }
); 