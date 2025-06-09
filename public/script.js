// =============================================
// CAPTCHA MANAGEMENT
// =============================================

// Generate a random CAPTCHA
function generateCaptcha() {
    const captchaDisplay = document.getElementById('captchaDisplay');
    const captcha = Math.random().toString(36).substring(2, 8).toUpperCase();
    captchaDisplay.textContent = captcha;
    return captcha;
}

// Initialize CAPTCHA when page loads
let currentCaptcha = generateCaptcha();

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



// Refresh CAPTCHA when refresh button is clicked
document.getElementById('refreshCaptcha').addEventListener('click', () => {
    currentCaptcha = generateCaptcha();
});

// =============================================
// FORM HANDLING
// =============================================

// Handle form submission with CAPTCHA validation
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();

        // CAPTCHA validation
        const userCaptcha = captchaInput.value.toUpperCase();
        if (userCaptcha !== currentCaptcha) {
            alert('Invalid CAPTCHA! Please try again.');
            currentCaptcha = generateCaptcha();
            captchaInput.value = '';
            return; // Stop here if CAPTCHA is wrong
        }

        // Login logic
        const philhealthId = document.getElementById('philhealthId').value;
        const password = document.getElementById('password').value;

        if (!philhealthId || !password) {
            alert('Please fill in all fields');
            return;
        }

        const loginData = {
            pin: philhealthId,
            password: password
        };

        fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(loginData)
        })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => {
                    throw new Error(`HTTP error! status: ${response.status}, message: ${text}`);
                });
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                localStorage.clear();
                sessionStorage.clear();
        
                const pin = data.pin;
                localStorage.setItem('memberPin', pin);
        
                // Fetch and wait for member info before redirecting
                fetch(`http://localhost:3000/api/member-info?pin=${encodeURIComponent(pin)}`)
                    .then(res => res.json())
                    .then(memberData => {
                        if (memberData && memberData.member) {
                            localStorage.setItem('memberInfo', JSON.stringify(memberData.member));
                        }
                        // Always redirect *after* the fetch is complete
                        window.location.href = `dashboard.html?pin=${encodeURIComponent(pin)}`;
                    })
                    .catch(error => {
                        console.error('Failed to fetch member info:', error);
                        // Still redirect, fallback mode
                        window.location.href = `dashboard.html?pin=${encodeURIComponent(pin)}`;
                    });
            } else {
                alert(data.error || 'Login failed. Please try again.');
            }
        })
        .catch(error => {
            console.error('Login error:', error);
            alert('An error occurred during login: ' + error.message);
        });
    });
}

// =============================================
// INPUT FORMATTING
// =============================================

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