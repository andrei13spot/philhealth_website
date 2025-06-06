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

    // Refresh CAPTCHA
    refreshCaptchaBtn.addEventListener('click', displayCaptcha);

    // Password validation
    function validatePassword(password) {
        const minLength = 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>~`\-_=+\[\]{}\\|;:'",<.>\/]/.test(password);
        return password.length >= minLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;
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
        if (!validatePassword(password)) {
            alert('Password does not meet the requirements. Please check the password requirements.');
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
                    window.location.href = 'account-success.html?pin=' + encodeURIComponent(pin);
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
        const isValid = validatePassword(password);
        this.style.borderColor = isValid ? '#28a745' : '#dc3545';
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
        // Prevent non-numeric input on keypress
        philhealthInput.addEventListener('keypress', function(e) {
            if (!/[\d]/.test(e.key)) {
                e.preventDefault();
            }
        });

        // Prevent non-numeric input on paste
        philhealthInput.addEventListener('paste', function(e) {
            e.preventDefault();
            const pastedText = (e.clipboardData || window.clipboardData).getData('text');
            const numericOnly = pastedText.replace(/[^0-9]/g, '');
            if (numericOnly) {
                const start = this.selectionStart;
                const end = this.selectionEnd;
                const value = this.value;
                this.value = value.substring(0, start) + numericOnly + value.substring(end);
            }
        });

        philhealthInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/[^0-9]/g, '');
            if (value.length > 0) {
                value = value.slice(0,2) + '-' + value.slice(2);
            }
            if (value.length > 12) {
                value = value.slice(0,12) + '-' + value.slice(12,13);
            }
            e.target.value = value.slice(0,14);
        });

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
});