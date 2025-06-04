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
    const captchaInput = document.getElementById('captcha').value;
    
    // Basic validation
    if (!philhealthId || !password || !captchaInput) {
        alert('Please fill in all fields');
        return;
    }
    
    // Validate CAPTCHA
    if (captchaInput.toUpperCase() !== currentCaptcha) {
        alert('Invalid CAPTCHA. Please try again.');
        currentCaptcha = generateCaptcha();
        document.getElementById('captcha').value = '';
        return;
    }
    
    // For demo purposes, show success message
    alert('Login successful! (This is a demo)');
    
    // Reset form
    e.target.reset();
    currentCaptcha = generateCaptcha();
});

// Auto-format PhilHealth Identification Number input
const philhealthInput = document.getElementById('philhealthId');
if (philhealthInput) {
    philhealthInput.addEventListener('input', function(e) {
        // Get the current value and remove any non-numeric characters
        let value = e.target.value.replace(/[^0-9]/g, '');
        
        // Format the value
        if (value.length > 0) {
            if (value.length > 2) {
                value = value.slice(0,2) + '-' + value.slice(2);
            }
            if (value.length > 11) {
                value = value.slice(0,11) + '-' + value.slice(11,12);
            }
            e.target.value = value.slice(0,13);
        }
    });
} 