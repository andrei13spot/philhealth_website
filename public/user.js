// =============================================
// SIDEBAR MANAGEMENT
// =============================================

// Sidebar elements
const burgerBtn = document.getElementById('burgerBtn');
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('sidebarOverlay');
const mainContent = document.querySelector('.main-content');

// Sidebar open/close functions
function openSidebar() {
    sidebar.classList.add('open');
    overlay.classList.add('show');
    mainContent.classList.add('shifted');
}

function closeSidebar() {
    sidebar.classList.remove('open');
    overlay.classList.remove('show');
    mainContent.classList.remove('shifted');
}

// Sidebar event listeners
burgerBtn.addEventListener('click', function() {
    if (sidebar.classList.contains('open')) {
        closeSidebar();
    } else {
        openSidebar();
    }
});

overlay.addEventListener('click', closeSidebar);

// Close sidebar on navigation
document.querySelectorAll('.nav a').forEach(link => {
    link.addEventListener('click', closeSidebar);
});

// =============================================
// ACCOUNT DATA MANAGEMENT (localStorage helper)
// =============================================
function loadAccountData() {
    const pin = localStorage.getItem('memberPin');
    const account = JSON.parse(localStorage.getItem('accountInfo') || 'null');
    return { pin, account };
}

// =============================================
// FETCH AND DISPLAY ACCOUNT INFO
// =============================================
async function fetchAccountInfo(forceRefresh = false) {
    const pin = localStorage.getItem('memberPin');
    if (!pin) {
        showProfileMessage('No PIN found. Please log in again.', true);
        return;
    }

    // If not force refresh and data exists in localStorage, use it
    if (!forceRefresh && localStorage.getItem('accountInfo')) {
        const { account } = loadAccountData();
        displayAccountInfo(account);
        return;
    }

    // Otherwise, fetch from server
    try {
        const response = await fetch(`http://localhost:3000/api/user-profile?pin=${encodeURIComponent(pin)}`);
        const data = await response.json();
        if (response.ok && data) {
            localStorage.setItem('accountInfo', JSON.stringify(data));
            displayAccountInfo(data);
        } else {
            showProfileMessage('Account data not found.', true);
        }
    } catch (err) {
        showProfileMessage('Error loading account info.', true);
        console.error(err);
    }
}

// Helper to get current member/account info from localStorage
function getCurrentMember() {
    return JSON.parse(localStorage.getItem('memberInfo') || 'null');
}
function getCurrentAccount() {
    return JSON.parse(localStorage.getItem('accountInfo') || 'null');
}

function updateSidebar() {
    const member = getCurrentMember();
    const sidebarUser = document.querySelector('.sidebar-user');
    const sidebarId = document.querySelector('.sidebar-id');
    if (sidebarUser) sidebarUser.textContent = member?.fullName || '';
    if (sidebarId) sidebarId.textContent = member?.pin || '';
}

function displayAccountInfo(account) {
    updateSidebar();
    // Update profile fields
    if (document.getElementById('userID')) {
        document.getElementById('userID').textContent = account?.pin || '';
    }
    if (document.getElementById('userEmail')) {
        document.getElementById('userEmail').textContent = account?.email || '';
    }
    if (document.getElementById('userMobileNumber')) {
        document.getElementById('userMobileNumber').textContent = account?.mobileNumber || '';
    }
}

// =============================================
// PASSWORD CHANGE LOGIC
// =============================================

// Password validation rules
const passwordRules = {
    minLength: 8,
    maxLength: 32,
    requireUppercase: true,
    requireLowercase: true,
    requireNumber: true,
    requireSpecial: true
};

// Password validation function
function validatePassword(password) {
    const errors = [];
    
    if (password.length < passwordRules.minLength) {
        errors.push(`Password must be at least ${passwordRules.minLength} characters long`);
    }
    if (password.length > passwordRules.maxLength) {
        errors.push(`Password must not exceed ${passwordRules.maxLength} characters`);
    }
    if (passwordRules.requireUppercase && !/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    }
    if (passwordRules.requireLowercase && !/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    }
    if (passwordRules.requireNumber && !/[0-9]/.test(password)) {
        errors.push('Password must contain at least one number');
    }
    if (passwordRules.requireSpecial && !/[`~!@#$%^&*()-_=+\[\]{}|;:'",.<>/?]/.test(password)) {
        errors.push('Password must contain at least one special character');
    }
    
    return errors;
}

// Show validation errors
function showValidationErrors(errors) {
    let errorDiv = document.getElementById('passwordErrors');
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.id = 'passwordErrors';
        errorDiv.className = 'alert alert-danger mt-3';
        document.querySelector('.change-password-form').insertBefore(errorDiv, document.querySelector('.text-center'));
    }
    
    errorDiv.innerHTML = errors.map(error => `<p class="mb-1">${error}</p>`).join('');
    errorDiv.style.display = 'block';
}

// Clear validation errors
function clearValidationErrors() {
    const errorDiv = document.getElementById('passwordErrors');
    if (errorDiv) {
        errorDiv.style.display = 'none';
        errorDiv.innerHTML = '';
    }
}

// Handle form submission
document.getElementById('changePasswordForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    clearValidationErrors();
    
    const oldPassword = document.getElementById('oldPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmNewPassword').value;
    
    // Validate new password
    const passwordErrors = validatePassword(newPassword);
    if (passwordErrors.length > 0) {
        showValidationErrors(passwordErrors);
        return;
    }
    
    // Check if passwords match
    if (newPassword !== confirmPassword) {
        showValidationErrors(['New password and confirm password do not match']);
        return;
    }
    
    try {
        const pin = localStorage.getItem('memberPin');
        const response = await fetch('http://localhost:3000/api/change-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                pin,
                oldPassword,
                newPassword
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Show success message
            const successDiv = document.createElement('div');
            successDiv.className = 'alert alert-success mt-3';
            successDiv.textContent = 'Password changed successfully!';
            document.querySelector('.change-password-form').insertBefore(successDiv, document.querySelector('.text-center'));
            
            // Clear form
            document.getElementById('changePasswordForm').reset();
            
            // Redirect after 2 seconds
            setTimeout(() => {
                window.location.href = 'user.html';
            }, 2000);
        } else {
            // Show error message
            showValidationErrors([data.message || 'Failed to change password. Please input the correct old password.']);
        }
    } catch (error) {
        showValidationErrors(['An error occurred. Please try again.']);
    }
});

// Real-time password validation
document.getElementById('newPassword').addEventListener('input', function() {
    const password = this.value;
    if (password) {
        const errors = validatePassword(password);
        if (errors.length > 0) {
            showValidationErrors(errors);
        } else {
            clearValidationErrors();
        }
    } else {
        clearValidationErrors();
    }
});

// Confirm password validation
document.getElementById('confirmNewPassword').addEventListener('input', function() {
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = this.value;
    
    if (confirmPassword && newPassword !== confirmPassword) {
        showValidationErrors(['Passwords do not match']);
    } else {
        clearValidationErrors();
    }
});

// =============================================
// INITIALIZATION
// =============================================

document.addEventListener('DOMContentLoaded', function() {
    updateSidebar();
    const pin = localStorage.getItem('memberPin');
    if (pin) {
        fetch(`http://localhost:3000/api/user-profile?pin=${encodeURIComponent(pin)}`)
            .then(res => res.json())
            .then(accountData => {
                if (accountData) {
                    localStorage.setItem('accountInfo', JSON.stringify(accountData));
                    displayAccountInfo(accountData);
                }
            });
    }

    // Attach password change handler if form exists
    const passwordForm = document.getElementById('changePasswordForm');
    if (passwordForm) {
        passwordForm.addEventListener('submit', handlePasswordChange);
    }

    // Optionally, re-fetch profile info when user clicks profile nav link
    const profileNav = document.querySelector('.nav a[href*="profile"], .nav a.user-profile-link');
    if (profileNav) {
        profileNav.addEventListener('click', fetchAccountInfo);
    }

    // SPA-like routing for profile and change password
    const userProfileCard = document.getElementById('userProfileCard');
    const changePasswordCard = document.getElementById('changePasswordCard');
    const showChangePasswordBtn = document.getElementById('showChangePassword');
    const cancelChangePasswordBtn = document.getElementById('cancelChangePassword');

    function showProfilePage() {
        if (userProfileCard) userProfileCard.style.display = '';
        if (changePasswordCard) changePasswordCard.style.display = 'none';
        window.location.hash = '#profile';
    }
    function showChangePasswordPage() {
        if (userProfileCard) userProfileCard.style.display = 'none';
        if (changePasswordCard) changePasswordCard.style.display = '';
        window.location.hash = '#change-password';
    }

    if (showChangePasswordBtn) {
        showChangePasswordBtn.addEventListener('click', showChangePasswordPage);
    }
    if (cancelChangePasswordBtn) {
        cancelChangePasswordBtn.addEventListener('click', showProfilePage);
    }

    // Handle browser navigation (hashchange)
    window.addEventListener('hashchange', function() {
        if (window.location.hash === '#change-password') {
            showChangePasswordPage();
        } else {
            showProfilePage();
        }
    });

    // On initial load, show correct view
    if (window.location.hash === '#change-password') {
        showChangePasswordPage();
    } else {
        showProfilePage();
    }

    // Logout handler: clear localStorage and redirect to login
    const logoutBtn = document.querySelector('.logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            localStorage.clear();
            sessionStorage.clear();
            window.location.href = 'index.html';
        });
    }
});