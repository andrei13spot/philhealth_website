document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const dependentKey = urlParams.get('key');
    const isEditMode = urlParams.get('edit') === 'true';
    
    // Set max date for dateOfBirth input
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    document.getElementById('dateOfBirth').setAttribute('max', `${yyyy}-${mm}-${dd}`);

    if (dependentKey) {
        loadDependentDetails(dependentKey);
        if (isEditMode) {
            toggleEditMode();
        }
    } else {
        window.location.href = 'admin-dependents.html';
    }

    setupEventListeners();
});

function setupEventListeners() {
    const editBtn = document.getElementById('editBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const form = document.getElementById('dependentDetailsForm');

    editBtn.addEventListener('click', toggleEditMode);
    cancelBtn.addEventListener('click', cancelEdit);
    form.addEventListener('submit', saveChanges);
}

async function loadDependentDetails(dependentKey) {
    try {
        const response = await fetch(`http://localhost:3000/api/admin/dependents/${dependentKey}`);
        if (!response.ok) throw new Error('Failed to fetch dependent details');
        
        const dependent = await response.json();
        displayDependentDetails(dependent);
    } catch (error) {
        console.error('Error:', error);
        showError('Failed to load dependent details');
    }
}

function displayDependentDetails(dependent) {
    // Uneditable fields
    document.getElementById('memberName').value = dependent.member_full_name || 'N/A';
    document.getElementById('pin').value = dependent.pin || '';

    // Editable fields
    document.getElementById('dependentName').value = dependent.dependent_full_name || '';
    document.getElementById('relationship').value = dependent.dependent_relationship || '';
    document.getElementById('dateOfBirth').value = formatDateLocal(dependent.dependent_date_of_birth) || '';
    document.getElementById('citizenship').value = dependent.dependent_citizenship || '';
    document.getElementById('pwdStatus').value = dependent.dependent_pwd || '';
}

function toggleEditMode() {
    const form = document.getElementById('dependentDetailsForm');
    const viewActions = document.getElementById('viewActions');
    const editActions = document.getElementById('editActions');
    
    // Always keep these fields readonly/disabled
    document.getElementById('memberName').readOnly = true;
    document.getElementById('pin').readOnly = true;
    
    // Toggle editable fields
    const editableFields = [
        'dependentName',
        'relationship',
        'dateOfBirth',
        'citizenship',
        'pwdStatus'
    ];
    
    editableFields.forEach(fieldId => {
        const element = document.getElementById(fieldId);
        if (element.tagName === 'SELECT') {
            element.disabled = false;
        } else {
            element.readOnly = false;
        }
    });
    
    viewActions.style.display = 'none';
    editActions.style.display = 'flex';
}

function cancelEdit() {
    const form = document.getElementById('dependentDetailsForm');
    const viewActions = document.getElementById('viewActions');
    const editActions = document.getElementById('editActions');
    
    // Make all fields readonly/disabled
    const allFields = [
        'memberName',
        'dependentName',
        'pin',
        'relationship',
        'dateOfBirth',
        'citizenship',
        'pwdStatus'
    ];
    
    allFields.forEach(fieldId => {
        const element = document.getElementById(fieldId);
        if (element.tagName === 'SELECT') {
            element.disabled = true;
        } else {
            element.readOnly = true;
        }
    });
    
    // Reset form to original values
    form.reset();
    
    // Reload the data
    const urlParams = new URLSearchParams(window.location.search);
    const dependentKey = urlParams.get('key');
    if (dependentKey) {
        loadDependentDetails(dependentKey);
    }
    
    viewActions.style.display = 'flex';
    editActions.style.display = 'none';
}

async function saveChanges(event) {
    event.preventDefault();
    
    // Validate date of birth is not in the future
    const dob = document.getElementById('dateOfBirth').value;
    if (dob) {
        const selectedDate = new Date(dob);
        const today = new Date();
        today.setHours(0,0,0,0);
        if (selectedDate > today) {
            showError('Date of Birth cannot be in the future.');
            return;
        }
    }

    const urlParams = new URLSearchParams(window.location.search);
    const dependentKey = urlParams.get('key');
    
    if (!dependentKey) return;

    const updatedDependent = {
        dependent_full_name: document.getElementById('dependentName').value,
        dependent_relationship: document.getElementById('relationship').value,
        dependent_date_of_birth: document.getElementById('dateOfBirth').value,
        dependent_citizenship: document.getElementById('citizenship').value,
        dependent_pwd: document.getElementById('pwdStatus').value
    };

    try {
        const response = await fetch(`http://localhost:3000/api/admin/dependents/${dependentKey}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedDependent)
        });

        if (response.ok) {
            showSuccess('Dependent updated successfully');
            loadDependentDetails(dependentKey);
            cancelEdit();
        } else {
            const error = await response.json();
            showError(error.error || 'Failed to update dependent');
        }
    } catch (error) {
        console.error('Error:', error);
        showError('An error occurred while updating dependent');
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
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
} 