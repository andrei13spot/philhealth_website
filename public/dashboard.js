// =============================================
// SIDEBAR MANAGEMENT
// =============================================
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

burgerBtn?.addEventListener('click', () => {
    sidebar?.classList.contains('open') ? closeSidebar() : openSidebar();
});

overlay?.addEventListener('click', closeSidebar);

document.querySelectorAll('.nav a').forEach(link => {
    link.addEventListener('click', closeSidebar);
});

// =============================================
// UI INTERACTIONS
// =============================================
document.querySelectorAll('.btn-link').forEach(button => {
    if (button.getAttribute('data-target') === '#collapseMemberInfo') {
        button.querySelector('.chevron')?.classList.add('rotate');
    }
    button.addEventListener('click', function () {
        this.querySelector('.chevron')?.classList.toggle('rotate');
    });
});

document.querySelector('.print-btn')?.addEventListener('click', () => {
    window.print();
});

// =============================================
// DATA MANAGEMENT
// =============================================
function fetchMemberInfo() {
    const pin = localStorage.getItem('memberPin');

    if (!pin) {
        console.error("No PIN found. User might not be logged in.");
        return;
    }

    const url = `http://localhost:3000/api/member-info?pin=${encodeURIComponent(pin)}`;
    console.log("Fetching member info from:", url);

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            if (!data || !data.member) {
                console.error('Invalid response format or missing member data.');
                return;
            }

            const member = data.member;
            const dependents = data.dependents || []; // fallback to empty array

            // Store in localStorage for other pages to use
            localStorage.setItem('memberInfo', JSON.stringify(member));
            localStorage.setItem('memberDependents', JSON.stringify(dependents));

            displayMemberInfo(member, dependents);
        })
        .catch(error => {
            console.error('Fetch error:', error);
        });
}

// =============================================
// UI DISPLAY
// =============================================
function updateSidebar(member) {
    document.querySelector('.sidebar-user').textContent = member?.fullName || 'Unknown User';
    document.querySelector('.sidebar-id').textContent = member?.pin || '---';
}

function displayMemberInfo(member, dependents) {
    updateSidebar(member);

    const tables = document.querySelectorAll('.accordion-content .info-table');
    if (tables.length < 3) {
        console.warn('Missing table containers for member data.');
        return;
    }

    tables[0].innerHTML = `
        <tr><th>PIN</th><td>${member.pin || ''}</td></tr>
        <tr><th>Full Name</th><td>${member.fullName || ''}</td></tr>
        <tr><th>Sex</th><td>${member.sex || ''}</td></tr>
        <tr><th>Date of Birth</th><td>${member.dateOfBirth || ''}</td></tr>
        <tr><th>Citizenship</th><td>${member.citizenship || ''}</td></tr>
        <tr><th>Civil Status</th><td>${member.civilStatus || ''}</td></tr>
        <tr><th>PhilSys Card Number</th><td>${member.philsysId || ''}</td></tr>
        <tr><th>TIN Number</th><td>${member.tin || ''}</td></tr>
        <tr><th>Mother Full Name</th><td>${member.motherFullName || ''}</td></tr>
        <tr><th>Spouse Full Name</th><td>${member.spouseFullName || ''}</td></tr>
    `;

    tables[1].innerHTML = `
        <tr><th>Home Number</th><td>${member.homeNumber || ''}</td></tr>
        <tr><th>Mobile Number</th><td>${member.mobileNumber || ''}</td></tr>
        <tr><th>Email Address</th><td>${member.email || ''}</td></tr>
        <tr><th>Permanent Address</th><td>${member.permanentAddress || ''}</td></tr>
        <tr><th>Business DL</th><td>${member.businessDl || ''}</td></tr>
        <tr><th>Mailing Address</th><td>${member.mailingAddress || ''}</td></tr>
    `;

    const dependentsTable = tables[2]?.querySelector('tbody');
    if (dependentsTable) {
        dependentsTable.innerHTML = dependents.length > 0
            ? dependents.map(dep => `
                <tr>
                    <td>${dep.relationship || ''}</td>
                    <td>${dep.fullName || ''}</td>
                    <td>${dep.dateOfBirth || ''}</td>
                    <td>${dep.citizenship || ''}</td>
                    <td>${dep.pwd || ''}</td>
                </tr>`).join('')
            : '<tr><td colspan="5">No dependents found.</td></tr>';
    }
}

// =============================================
// INITIALIZATION
// =============================================
document.addEventListener('DOMContentLoaded', () => {
    // Check if we have cached data first
    const cachedMember = localStorage.getItem('memberInfo');
    const cachedDependents = localStorage.getItem('memberDependents');
    
    if (cachedMember) {
        try {
            const member = JSON.parse(cachedMember);
            const dependents = JSON.parse(cachedDependents || '[]');
            displayMemberInfo(member, dependents);
        } catch (e) {
            console.error('Error parsing cached data:', e);
        }
    }
    
    // Always fetch fresh data
    fetchMemberInfo();
});

// Refresh data when navigating
document.querySelectorAll('.nav a, .profile-link').forEach(link => {
    link.addEventListener('click', () => {
        fetchMemberInfo();
    });
});
