// Member Management Page JS
// Handles searching, filtering, displaying, and actions for members

// Current page state
let currentPage = 1;
const itemsPerPage = 10;

// Initialize the page and set up event listeners
// On page load, fetch and display members
// Also set up filter and search event listeners
document.addEventListener('DOMContentLoaded', () => {
    searchMembers();
    setupEventListeners();
});

// Set up event listeners for search/filter inputs
function setupEventListeners() {
    // Search on Enter key in search box
    document.getElementById('searchTerm').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchMembers();
        }
    });
    // Search on filter change
    ['memberType', 'civilStatus', 'citizenship'].forEach(id => {
        document.getElementById(id).addEventListener('change', searchMembers);
    });
}

// Fetch and display members based on current filters and page
async function searchMembers() {
    try {
        // Get filter values
        const searchTerm = document.getElementById('searchTerm').value;
        const memberType = document.getElementById('memberType').value;
        const civilStatus = document.getElementById('civilStatus').value;
        const citizenship = document.getElementById('citizenship').value;

        // Build query params
        const queryParams = new URLSearchParams({
            page: currentPage,
            limit: itemsPerPage,
            ...(searchTerm && { searchTerm }),
            ...(memberType && { memberType }),
            ...(civilStatus && { civilStatus }),
            ...(citizenship && { citizenship })
        });

        // Fetch members from backend
        const response = await fetch(`http://localhost:3000/api/admin/members/search?${queryParams}`);
        if (!response.ok) throw new Error('Failed to fetch members');

        const data = await response.json();
        displayMembers(data.members);
        updatePagination(data.pagination);
    } catch (error) {
        console.error('Error searching members:', error);
        showError('Failed to load members. Please try again.');
    }
}

// Render members in the table
function displayMembers(members) {
    const tbody = document.getElementById('membersTableBody');
    tbody.innerHTML = '';

    // Show message if no members found
    if (members.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" class="text-center">No members found</td>
            </tr>
        `;
        return;
    }

    // Render each member row
    members.forEach(member => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="pin-col">${member.pin}</td>
            <td>${member.member_full_name}</td>
            <td>${member.email_address || ''}</td>
            <td>${member.mobile_no || ''}</td>
            <td>${member.member_type}</td>
            <td>${member.civil_status}</td>
            <td>${member.dependentCount || 0}</td>
            <td>${member.citizenship || ''}</td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn view-btn" onclick="viewMember('${member.pin}')">
                        <i class="fas fa-eye"></i> View
                    </button>
                    <button class="action-btn admin-edit-btn" onclick="editMember('${member.pin}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="action-btn report-btn" onclick="generateReport('${member.pin}')">
                        <i class="fas fa-file-pdf"></i> Report
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Update pagination controls at the bottom of the table
function updatePagination(pagination) {
    const paginationContainer = document.getElementById('pagination');
    const { total, page, limit, totalPages } = pagination;

    let html = `
        <button onclick="changePage(1)" ${page === 1 ? 'disabled' : ''}>
            <i class="fas fa-angle-double-left"></i>
        </button>
        <button onclick="changePage(${page - 1})" ${page === 1 ? 'disabled' : ''}>
            <i class="fas fa-angle-left"></i>
        </button>
        <span class="current-page">Page ${page} of ${totalPages}</span>
        <button onclick="changePage(${page + 1})" ${page === totalPages ? 'disabled' : ''}>
            <i class="fas fa-angle-right"></i>
        </button>
        <button onclick="changePage(${totalPages})" ${page === totalPages ? 'disabled' : ''}>
            <i class="fas fa-angle-double-right"></i>
        </button>
    `;

    paginationContainer.innerHTML = html;
}

// Change the current page and fetch members
function changePage(page) {
    currentPage = page;
    searchMembers();
}

// Reset all filters and reload members
function resetFilters() {
    document.getElementById('searchTerm').value = '';
    document.getElementById('memberType').value = '';
    document.getElementById('civilStatus').value = '';
    document.getElementById('citizenship').value = '';
    currentPage = 1;
    searchMembers();
}

// Redirect to view member details page
function viewMember(pin) {
    window.location.href = `admin-member-details.html?pin=${pin}`;
}

// Redirect to edit member details page (edit mode)
function editMember(pin) {
    window.location.href = `admin-member-details.html?pin=${pin}&edit=1`;
}

// Generate and download member report as PDF
async function generateReport(pin) {
    try {
        const response = await fetch(`http://localhost:3000/api/admin/members/${pin}/report`);
        if (!response.ok) throw new Error('Failed to generate report');

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `member-${pin}-report.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
    } catch (error) {
        console.error('Error generating report:', error);
        showError('Failed to generate report. Please try again.');
    }
}

// Show error message (can be replaced with a toast/alert system)
function showError(message) {
    alert(message);
} 