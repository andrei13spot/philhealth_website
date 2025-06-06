// Sidebar functionality
const burgerBtn = document.getElementById('burgerBtn');
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('sidebarOverlay');
const mainContent = document.querySelector('.main-content');

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

// Toggle chevron rotation
document.querySelectorAll('.btn-link').forEach(button => {
    button.addEventListener('click', function() {
        const chevron = this.querySelector('.chevron');
        chevron.classList.toggle('rotate');
    });
});

// Print functionality
document.querySelector('.print-btn').addEventListener('click', function() {
    window.print();
});

// Fetch and display member information
async function fetchMemberInfo() {
    try {
        // Get PIN from URL query parameter
        const params = new URLSearchParams(window.location.search);
        const pin = params.get('pin');
        
        if (!pin) {
            console.error('No PIN provided');
            return;
        }

        const response = await fetch(`http://localhost:3000/api/member-info?pin=${encodeURIComponent(pin)}`);
        const data = await response.json();

        if (response.ok) {
            const { member, dependents } = data;

            // Update sidebar information
            document.querySelector('.sidebar-user').textContent = member.fullName;
            document.querySelector('.sidebar-id').textContent = member.pin;

            // Update member information section
            const memberInfoTable = document.querySelector('#collapseMemberInfo .info-table');
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

            // Update contact details section
            const contactTable = document.querySelector('#collapseContactDetails .info-table');
            contactTable.innerHTML = `
                <tr><th>Home Number</th><td>${member.homeNumber}</td></tr>
                <tr><th>Mobile Number</th><td>${member.mobileNumber}</td></tr>
                <tr><th>Email Address</th><td>${member.email}</td></tr>
                <tr><th>Permanent Address</th><td>${member.permanentAddress}</td></tr>
                <tr><th>Business DL</th><td>${member.businessDl}</td></tr>
                <tr><th>Mailing Address</th><td>${member.mailingAddress}</td></tr>
            `;

            // Update dependents section
            const dependentsTable = document.querySelector('#collapseDependents .info-table tbody');
            if (dependents && dependents.length > 0) {
                dependentsTable.innerHTML = dependents.map(dep => `
                    <tr>
                        <td>${dep.relationship}</td>
                        <td>${dep.fullName}</td>
                        <td>${dep.dateOfBirth}</td>
                        <td>${dep.sex}</td>
                        <td>${dep.citizenship}</td>
                        <td>${dep.pwd}</td>
                    </tr>
                `).join('');
            } else {
                dependentsTable.innerHTML = '';
            }
        } else {
            console.error('Error fetching member information:', data.error);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    fetchMemberInfo();
});