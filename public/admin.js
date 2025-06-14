// Admin login and CAPTCHA functionality
function generateAdminCaptcha() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let captcha = '';
    for (let i = 0; i < 6; i++) {
        captcha += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    document.getElementById('adminCaptchaDisplay').textContent = captcha;
    return captcha;
}

let currentAdminCaptcha;
window.addEventListener('DOMContentLoaded', function() {
    currentAdminCaptcha = generateAdminCaptcha();
    document.getElementById('refreshAdminCaptcha').addEventListener('click', function() {
        currentAdminCaptcha = generateAdminCaptcha();
    });
    document.getElementById('adminLoginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const username = document.getElementById('adminUsername').value.trim();
        const password = document.getElementById('adminPassword').value.trim();
        const captchaInput = document.getElementById('adminCaptcha').value.trim().toUpperCase();
        if (username === 'admin' && password === 'admin' && captchaInput === currentAdminCaptcha) {
            window.location.href = 'admin-dashboard.html';
        } else {
            document.getElementById('adminLoginError').style.display = 'block';
            currentAdminCaptcha = generateAdminCaptcha();
        }
    });
});

// Add CAPTCHA input handling (format to uppercase, alphanumeric, max 6 chars)
const captchaInput = document.getElementById('adminCaptcha');
if (captchaInput) {
    captchaInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
        e.target.value = value.slice(0, 6);
    });
} 




