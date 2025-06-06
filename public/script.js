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

// Handle form submission
document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const philhealthId = document.getElementById('philhealthId').value;
    const password = document.getElementById('password').value;
    
    console.log('Form values:', {
        philhealthId: philhealthId,
        password: password
    });
    
    // Basic validation
    if (!philhealthId || !password) {
        alert('Please fill in all fields');
        return;
    }
    
    // Send login request to server
    const loginData = {
        pin: philhealthId,
        password: password
    };
    console.log('Sending login data:', loginData);
    console.log('Stringified data:', JSON.stringify(loginData));
    
    fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(loginData)
    })
    .then(response => {
        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);
        if (!response.ok) {
            return response.text().then(text => {
                console.log('Error response text:', text);
                throw new Error(`HTTP error! status: ${response.status}, message: ${text}`);
            });
        }
        return response.json();
    })
    .then(data => {
        console.log('Response data:', data);
        if (data.success) {
            window.location.href = `dashboard.html?pin=${encodeURIComponent(data.pin)}`;
        } else {
            alert(data.error || 'Login failed. Please try again.');
        }
    })
    .catch(error => {
        console.error('Login error:', error);
        alert('An error occurred during login: ' + error.message);
    });
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