// Shared authentication functions

function clearMemberData() {
    localStorage.removeItem('memberPin');
    localStorage.removeItem('memberInfo');
    localStorage.removeItem('memberDependents');
    localStorage.removeItem('accountInfo');
    sessionStorage.clear();
}

// Initialize logout functionality
document.addEventListener('DOMContentLoaded', function() {
    const logoutBtn = document.querySelector('.logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault(); // Prevent default link behavior
            clearMemberData();
            window.location.href = 'index.html';
        });
    }
}); 