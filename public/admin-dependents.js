// Dependents Management Page JS
// Handles searching, filtering, displaying, and actions for dependents

// Current page state
let currentPage = 1;
const itemsPerPage = 10;

// Initialize the page and set up event listeners
// On page load, fetch and display dependents
// Also set up filter and search event listeners
document.addEventListener('DOMContentLoaded', () => {
    searchDependents();
    setupEventListeners();
});

// Set up event listeners for search/filter inputs
function setupEventListeners() {
    document.getElementById('searchTerm').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchDependents();
        }
    });
    // Search on filter change
    ['relationship', 'citizenship', 'pwd'].forEach(id => {
        document.getElementById(id).addEventListener('change', searchDependents);
    });
}

async function searchDependents() {
    try {
        const searchTerm = document.getElementById('searchTerm').value;
        const relationship = document.getElementById('relationship').value;
        const citizenship = document.getElementById('citizenship').value;
        const pwd = document.getElementById('pwd').value;

        const queryParams = new URLSearchParams({
            page: currentPage,
            limit: itemsPerPage,
            ...(searchTerm && { searchTerm }),
            ...(relationship && { relationship }),
            ...(citizenship && { citizenship }),
            ...(pwd && { pwd })
        });

        // Fetch dependents from backend
        const response = await fetch(`http://localhost:3000/api/admin/dependents/search?${queryParams}`);
        if (!response.ok) throw new Error('Failed to fetch dependents');

        const data = await response.json();
        displayDependents(data.dependents);
        updatePagination(data.pagination);
    } catch (error) {
        console.error('Error searching dependents:', error);
        showError('Failed to load dependents. Please try again.');
    }
}

// Render dependents in the table
function displayDependents(dependents) {
    const tbody = document.getElementById('dependentsTableBody');
    tbody.innerHTML = '';

    // Show message if no dependents found
    if (dependents.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center">No dependents found</td>
            </tr>
        `;
        return;
    }

    // Render each dependent row
    dependents.forEach(dep => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${dep.member_full_name}</td>
            <td>${dep.dependent_full_name}</td>
            <td>${dep.pin}</td>
            <td>${dep.dependent_relationship}</td>
            <td>${formatDateLocal(dep.dependent_date_of_birth)}</td>
            <td>${dep.dependent_citizenship}</td>
            <td>${dep.dependent_pwd}</td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn view-btn" onclick="window.location.href='admin-dependent-details.html?key=${dep.dependent_key}'">
                        <i class="fas fa-eye"></i> View
                    </button>
                    <button class="action-btn admin-edit-btn" onclick="window.location.href='admin-dependent-details.html?key=${dep.dependent_key}&edit=true'">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="action-btn report-btn" onclick="generateReport('${dep.dependent_key}')">
                        <i class="fas fa-file-pdf"></i> Report
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

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

function changePage(page) {
    currentPage = page;
    searchDependents();
}

function resetFilters() {
    document.getElementById('searchTerm').value = '';
    document.getElementById('relationship').value = '';
    document.getElementById('citizenship').value = '';
    document.getElementById('pwd').value = '';
    currentPage = 1;
    searchDependents();
}

async function generateReport(dependentKey) {
    try {
        const response = await fetch(`http://localhost:3000/api/admin/dependents/${dependentKey}/report`);
        if (!response.ok) throw new Error('Failed to generate report');
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `dependent-${dependentKey}-report.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
    } catch (error) {
        showError('Failed to generate report. Please try again.');
    }
}

function showError(message) {
    alert(message);
}

function showSuccess(message) {
    alert(message);
}

function formatDateLocal(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    // Get local date parts
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
} 