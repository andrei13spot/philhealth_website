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
// UI INTERACTIONS
// =============================================

// Toggle chevron rotation
document.querySelectorAll('.btn-link').forEach(button => {
    // Set initial state for the member info section
    if (button.getAttribute('data-target') === '#collapseMemberInfo') {
        const chevron = button.querySelector('.chevron');
        chevron.classList.add('rotate');
    }

    button.addEventListener('click', function() {
        const chevron = this.querySelector('.chevron');
        chevron.classList.toggle('rotate');
    });
});

// Print functionality
document.querySelector('.print-btn').addEventListener('click', function() {
    window.print();
});

// =============================================
// DATA MANAGEMENT
// =============================================

// Load member info and dependents from localStorage
function loadMemberData() {
    const pin = localStorage.getItem('memberPin');
    const member = JSON.parse(localStorage.getItem('memberInfo') || 'null');
    const dependents = JSON.parse(localStorage.getItem('memberDependents') || '[]');
    return { pin, member, dependents };
}

function saveMemberData(pin, member, dependents) {
    localStorage.setItem('memberPin', pin);
    localStorage.setItem('memberInfo', JSON.stringify(member));
    localStorage.setItem('memberDependents', JSON.stringify(dependents || []));
}

// Fetch and display member information
async function fetchMemberInfo(forceRefresh = false) {
    const pin = localStorage.getItem('memberPin');

    if (!pin) {
        console.error('❌ No PIN provided');
        return;
    }

    // Always clear storage before fetching new data (for new login)
    localStorage.removeItem('memberInfo');
    localStorage.removeItem('memberDependents');

    // Fetch fresh data from server
    try {
        const response = await fetch(`http://localhost:3000/api/member-info?pin=${encodeURIComponent(pin)}`);
        const data = await response.json();

        console.log("✅ Server response:", data); // Check the shape

        if (response.ok && data.member) {
            const member = data.member;
            const dependents = data.dependents || [];

            saveMemberData(pin, member, dependents);
            displayMemberInfo(member, dependents);
        } else {
            console.error('❌ Error fetching member information:', data.error);
        }
    } catch (error) {
        console.error('❌ Fetch error:', error);
    }
}

// Helper to get member and dependents from localStorage
function getCurrentMember() {
    return JSON.parse(localStorage.getItem('memberInfo') || 'null');
}
function getCurrentDependents() {
    return JSON.parse(localStorage.getItem('memberDependents') || '[]');
}

// =============================================
// UI DISPLAY
// =============================================

function updateSidebar() {
    const member = getCurrentMember();
    const sidebarUser = document.querySelector('.sidebar-user');
    const sidebarId = document.querySelector('.sidebar-id');
    if (sidebarUser) sidebarUser.textContent = member?.fullName || '';
    if (sidebarId) sidebarId.textContent = member?.pin || '';
}

function displayMemberInfo(member, dependents) {
    updateSidebar();

    const memberInfoTable = document.querySelectorAll('.accordion-content .info-table')[0];
    memberInfoTable.innerHTML = `
        <tr><th>PIN</th><td>${member.pin}</td></tr>
        <tr><th>Full Name</th><td>${member.fullName}</td></tr>
        <tr><th>Sex</th><td>${member.sex}</td></tr>
        <tr><th>Date of Birth</th><td>${member.dateOfBirth}</td></tr>
        <tr><th>Citizenship</th><td>${member.citizenship}</td></tr>
        <tr><th>Civil Status</th><td>${member.civilStatus}</td></tr>
        <tr><th>PhilSys Card Number</th><td>${member.philsysId}</td></tr>
        <tr><th>TIN Number</th><td>${member.tin}</td></tr>
        <tr><th>Mother Full Name</th><td>${member.motherFullName}</td></tr>
        <tr><th>Spouse Full Name</th><td>${member.spouseFullName}</td></tr>
    `;

    const contactTable = document.querySelectorAll('.accordion-content .info-table')[1];
    contactTable.innerHTML = `
        <tr><th>Home Number</th><td>${member.homeNumber}</td></tr>
        <tr><th>Mobile Number</th><td>${member.mobileNumber}</td></tr>
        <tr><th>Email Address</th><td>${member.email}</td></tr>
        <tr><th>Permanent Address</th><td>${member.permanentAddress}</td></tr>
        <tr><th>Business DL</th><td>${member.businessDl}</td></tr>
        <tr><th>Mailing Address</th><td>${member.mailingAddress}</td></tr>
    `;

    const dependentsTable = document.querySelectorAll('.accordion-content .info-table')[2]?.querySelector('tbody');
    if (dependentsTable) {
        if (Array.isArray(dependents) && dependents.length > 0) {
            dependentsTable.innerHTML = dependents.map(dep => `
                <tr>
                    <td>${dep.relationship || ''}</td>
                    <td>${dep.fullName || ''}</td>
                    <td>${dep.dateOfBirth || ''}</td>
                    <td>${dep.citizenship || ''}</td>
                    <td>${dep.pwd || ''}</td>
                </tr>
            `).join('');
        } else {
            dependentsTable.innerHTML = '<tr><td colspan="5">No dependents found.</td></tr>';
        }
    }
}

// =============================================
// INITIALIZATION
// =============================================

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    fetchMemberInfo();
});

// Example: Refetch when navigating to user profile or member info
document.querySelectorAll('.nav a, .profile-link').forEach(link => {
    link.addEventListener('click', function(e) {
        // Optionally, check if the link is for user profile/member info
        // and force refresh if needed:
        // fetchMemberInfo(true);
        fetchMemberInfo();
    });
});