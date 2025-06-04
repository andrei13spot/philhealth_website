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

        // If all validations pass, you can submit the form
        // Here you would typically send the data to your server
        alert('Registration successful!');
        window.location.href = 'register.html';
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
}); 