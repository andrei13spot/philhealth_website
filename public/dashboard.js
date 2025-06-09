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
// EDIT/UPDATE FUNCTIONALITY
// =============================================

function createEditButton(section, onEdit) {
    const btn = document.createElement('button');
    btn.className = 'edit-btn';
    btn.textContent = 'Edit';
    btn.style.float = 'right';
    btn.style.marginBottom = '8px';
    btn.onclick = onEdit;
    section.insertBefore(btn, section.firstChild);
    return btn;
}

function createActionButtons(onConfirm, onCancel) {
    const container = document.createElement('div');
    container.className = 'edit-actions';
    container.style.marginTop = '12px';
    container.style.textAlign = 'right';

    const confirmBtn = document.createElement('button');
    confirmBtn.className = 'btn btn-success';
    confirmBtn.textContent = 'Confirm';
    confirmBtn.style.marginRight = '8px';
    confirmBtn.onclick = onConfirm;

    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'btn btn-cancel';
    cancelBtn.textContent = 'Cancel';
    cancelBtn.onclick = onCancel;

    container.appendChild(confirmBtn);
    container.appendChild(cancelBtn);
    return container;
}

function makeSectionEditable(section, fields, originalData, onSave, isContactDetails) {
    if (section.querySelector('.edit-actions') || section.parentElement.querySelector('.edit-actions')) return;
    const rows = section.querySelectorAll('tr');
    rows.forEach((row, i) => {
        const th = row.querySelector('th');
        const td = row.querySelector('td');
        const field = fields[i];
        const key = field.key;
        const placeholder = field.placeholder || '';
        let input;
        if (isContactDetails) {
            input = document.createElement('input');
            input.type = field.type || 'text';
            input.value = originalData[key] || '';
            input.placeholder = placeholder;
            input.className = 'form-control';
            if (field.maxlength) input.maxLength = field.maxlength;
            if (field.numeric) {
                input.addEventListener('input', function() {
                    this.value = this.value.replace(/[^0-9]/g, '').slice(0, field.maxlength);
                });
            }
        } else {
            input = document.createElement('input');
            input.type = 'text';
            input.value = originalData[key] || '';
            input.placeholder = placeholder;
            input.className = 'form-control';
        }
        td.innerHTML = '';
        td.appendChild(input);
    });
    const actions = createActionButtons(
        () => {
            const newData = {};
            rows.forEach((row, i) => {
                const key = fields[i].key;
                newData[key] = row.querySelector('input').value;
            });
            onSave(newData);
            // Hide both Confirm and Cancel buttons after clicking Confirm
            if (isContactDetails) {
                actions.remove();
                const editBtn = section.querySelector('.edit-btn');
                if (editBtn) {
                    editBtn.style.display = '';
                    editBtn.disabled = false;
                }
            }
        },
        () => {
            rows.forEach((row, i) => {
                const key = fields[i].key;
                row.querySelector('td').textContent = originalData[key] || '';
            });
            actions.remove();
            const editBtn = section.querySelector('.edit-btn');
            if (editBtn) {
                editBtn.style.display = '';
                editBtn.disabled = false;
            }
        }
    );
    if (isContactDetails) {
        section.parentElement.appendChild(actions);
    } else {
        section.appendChild(actions);
    }
    const editBtn = section.querySelector('.edit-btn');
    if (editBtn) {
        editBtn.style.display = 'none';
        editBtn.disabled = true;
    }
}

function updateMemberInfoUI(member) {
    // Update the UI with new member info
    displayMemberInfo(member, JSON.parse(localStorage.getItem('memberDependents') || '[]'));
}

function updateContactDetailsUI(member) {
    // Update the UI with new contact info
    displayMemberInfo(member, JSON.parse(localStorage.getItem('memberDependents') || '[]'));
}

function updateDependentsUI(dependents) {
    // Update the UI with new dependents
    displayMemberInfo(JSON.parse(localStorage.getItem('memberInfo') || '{}'), dependents);
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

    setTimeout(() => { // Wait for displayMemberInfo to render tables
        const tables = document.querySelectorAll('.accordion-content .info-table');
        if (tables.length < 3) return;
        // Contact Details
        createEditButton(tables[1].parentElement, () => {
            const member = JSON.parse(localStorage.getItem('memberInfo') || '{}');
            makeSectionEditable(
                tables[1],
                [
                    { key: 'homeNumber', placeholder: 'Home Number', type: 'text', maxlength: 20, numeric: true },
                    { key: 'mobileNumber', placeholder: 'Mobile Number', type: 'text', maxlength: 20, numeric: true },
                    { key: 'email', placeholder: 'Email Address', type: 'email', maxlength: 50 },
                    { key: 'permanentAddress', placeholder: 'Permanent Address', type: 'text', maxlength: 100 },
                    { key: 'businessDl', placeholder: 'Business DL', type: 'text', maxlength: 20, numeric: true },
                    { key: 'mailingAddress', placeholder: 'Mailing Address', type: 'text', maxlength: 100 }
                ],
                member,
                (newData) => {
                    fetch('http://localhost:3000/api/update-member-contact', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ pin: member.pin, ...newData })
                    })
                    .then(res => res.json())
                    .then(data => {
                        if (data.success) {
                            localStorage.setItem('memberInfo', JSON.stringify(data.member));
                            updateContactDetailsUI(data.member);
                            showSuccessMessage('Contact details updated successfully!');
                            // Refresh the page after successful update
                            fetchMemberInfo();
                            // Remove actions and show edit button
                            const actions = tables[1].parentElement.querySelector('.edit-actions');
                            if (actions) actions.remove();
                            const editBtn = tables[1].parentElement.querySelector('.edit-btn');
                            if (editBtn) {
                                editBtn.style.display = '';
                                editBtn.disabled = false;
                            }
                        } else {
                            alert(data.error || 'Failed to update contact details');
                        }
                    });
                },
                true // pass true for contact details for custom input rendering
            );
        });
        // Dependents
        const dependents = JSON.parse(localStorage.getItem('memberDependents') || '[]');
        createEditButton(tables[2].parentElement, () => {
            // For dependents, allow editing each row
            const tbody = tables[2].querySelector('tbody');
            if (!tbody) return;
            const originalDependents = dependents.map(dep => ({ ...dep }));
            const rows = Array.from(tbody.querySelectorAll('tr'));

            // Dropdown options (should match registration form)
            const relationshipOptions = [
                'Select Relationship    ', 'Spouse', 'Child', 'Parent', 'Sibling', 'Other'
            ];
            const citizenshipOptions = [
                'Select Citizenship', 'Filipino', 'Dual Citizen', 'Foreigner'
            ];
            const pwdOptions = [
                'Select PWD', 'No', 'Yes'
            ];

            function renderEditableDependents(deps) {
                tbody.innerHTML = '';
                deps.forEach((dep, i) => {
                    const tr = document.createElement('tr');
                    // Relationship (dropdown)
                    const tdRel = document.createElement('td');
                    const selRel = document.createElement('select');
                    selRel.className = 'form-control';
                    relationshipOptions.forEach(opt => {
                        const option = document.createElement('option');
                        option.value = opt;
                        option.textContent = opt;
                        if (dep.relationship === opt) option.selected = true;
                        selRel.appendChild(option);
                    });
                    tdRel.appendChild(selRel);
                    tr.appendChild(tdRel);
                    // Full Name (text)
                    const tdName = document.createElement('td');
                    const inputName = document.createElement('input');
                    inputName.type = 'text';
                    inputName.value = dep.fullName || '';
                    inputName.className = 'form-control';
                    inputName.maxLength = 50;
                    tdName.appendChild(inputName);
                    tr.appendChild(tdName);
                    // Date of Birth (date)
                    const tdDob = document.createElement('td');
                    const inputDob = document.createElement('input');
                    inputDob.type = 'date';
                    // Format the date for the input field (YYYY-MM-DD)
                    if (dep.dateOfBirth) {
                        const date = new Date(dep.dateOfBirth);
                        if (!isNaN(date.getTime())) {
                            const year = date.getFullYear();
                            const month = String(date.getMonth() + 1).padStart(2, '0');
                            const day = String(date.getDate()).padStart(2, '0');
                            inputDob.value = `${year}-${month}-${day}`;
                        }
                    }
                    inputDob.className = 'form-control';
                    tdDob.appendChild(inputDob);
                    tr.appendChild(tdDob);
                    // Citizenship (dropdown)
                    const tdCit = document.createElement('td');
                    const selCit = document.createElement('select');
                    selCit.className = 'form-control';
                    citizenshipOptions.forEach(opt => {
                        const option = document.createElement('option');
                        option.value = opt;
                        option.textContent = opt;
                        if (dep.citizenship === opt) option.selected = true;
                        selCit.appendChild(option);
                    });
                    tdCit.appendChild(selCit);
                    tr.appendChild(tdCit);
                    // PWD (dropdown)
                    const tdPwd = document.createElement('td');
                    const selPwd = document.createElement('select');
                    selPwd.className = 'form-control';
                    pwdOptions.forEach(opt => {
                        const option = document.createElement('option');
                        option.value = opt;
                        option.textContent = opt;
                        if (dep.pwd === opt) option.selected = true;
                        selPwd.appendChild(option);
                    });
                    tdPwd.appendChild(selPwd);
                    tr.appendChild(tdPwd);
                    // Delete button
                    const tdDelete = document.createElement('td');
                    const delBtn = document.createElement('button');
                    delBtn.className = 'btn btn-danger btn-sm';
                    delBtn.textContent = 'Delete';
                    delBtn.onclick = () => {
                        editableDependents.splice(i, 1);
                        renderEditableDependents(editableDependents);
                    };
                    tdDelete.appendChild(delBtn);
                    tr.appendChild(tdDelete);
                    tbody.appendChild(tr);
                });
            }

            let editableDependents = dependents.map(dep => ({ ...dep }));
            const addBtn = document.createElement('button');
            addBtn.className = 'btn btn-success';
            addBtn.textContent = 'Add Dependent';
            addBtn.style.marginBottom = '10px';
            addBtn.onclick = () => {
                editableDependents.push({ relationship: '', fullName: '', dateOfBirth: '', citizenship: '', pwd: '' });
                renderEditableDependents(editableDependents);
            };
            tables[2].parentElement.insertBefore(addBtn, tables[2]);

            // Add header for delete column if not present
            const thead = tables[2].querySelector('thead');
            if (thead && thead.querySelectorAll('th').length === 5) {
                const th = document.createElement('th');
                th.textContent = 'Action';
                thead.querySelector('tr').appendChild(th);
            }

            renderEditableDependents(editableDependents);

            const actions = createActionButtons(
                () => {
                    // Gather new dependents data
                    const newDependents = Array.from(tbody.querySelectorAll('tr')).map(row => {
                        const cells = row.querySelectorAll('td');
                        return {
                            relationship: cells[0].querySelector('select').value,
                            fullName: cells[1].querySelector('input').value,
                            dateOfBirth: cells[2].querySelector('input').value,
                            citizenship: cells[3].querySelector('select').value,
                            pwd: cells[4].querySelector('select').value
                        };
                    }).filter(dep => dep.fullName.trim() !== '');
                    fetch('http://localhost:3000/api/update-dependents', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ pin: localStorage.getItem('memberPin'), dependents: newDependents })
                    })
                    .then(res => res.json())
                    .then(data => {
                        if (data.success) {
                            localStorage.setItem('memberDependents', JSON.stringify(data.dependents));
                            updateDependentsUI(data.dependents);
                            showSuccessMessage('Dependents updated successfully!');
                            // Refresh the page after successful update
                            fetchMemberInfo();
                            // Remove actions and show edit button
                            actions.remove();
                            addBtn.remove();
                            const editBtn = tables[2].parentElement.querySelector('.edit-btn');
                            if (editBtn) {
                                editBtn.style.display = '';
                                editBtn.disabled = false;
                            }
                            // Remove the Action column from thead
                            const thead = tables[2].querySelector('thead');
                            if (thead && thead.querySelectorAll('th').length === 6) {
                                thead.querySelector('tr').removeChild(thead.querySelectorAll('th')[5]);
                            }
                        } else {
                            alert(data.error || 'Failed to update dependents');
                        }
                    });
                },
                () => {
                    updateDependentsUI(originalDependents);
                    actions.remove();
                    addBtn.remove();
                    const editBtn = tables[2].parentElement.querySelector('.edit-btn');
                    if (editBtn) {
                        editBtn.style.display = '';
                        editBtn.disabled = false;
                    }
                    // Remove the Action column from thead
                    const thead = tables[2].querySelector('thead');
                    if (thead && thead.querySelectorAll('th').length === 6) {
                        thead.querySelector('tr').removeChild(thead.querySelectorAll('th')[5]);
                    }
                }
            );
            tables[2].parentElement.appendChild(actions);
            tables[2].parentElement.querySelector('.edit-btn').style.display = 'none';
        });
    }, 500);
});

// Refresh data when navigating
document.querySelectorAll('.nav a, .profile-link').forEach(link => {
    link.addEventListener('click', () => {
        fetchMemberInfo();
    });
});

function showSuccessMessage(message) {
    let msgDiv = document.getElementById('dashboardSuccessMsg');
    if (!msgDiv) {
        msgDiv = document.createElement('div');
        msgDiv.id = 'dashboardSuccessMsg';
        msgDiv.style.position = 'fixed';
        msgDiv.style.top = '80px';
        msgDiv.style.right = '40px';
        msgDiv.style.zIndex = '9999';
        msgDiv.style.background = '#43a047';
        msgDiv.style.color = '#fff';
        msgDiv.style.padding = '16px 32px';
        msgDiv.style.borderRadius = '6px';
        msgDiv.style.fontSize = '1.1em';
        msgDiv.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
        msgDiv.style.transition = 'opacity 0.3s';
        document.body.appendChild(msgDiv);
    }
    msgDiv.textContent = message;
    msgDiv.style.opacity = '1';
    msgDiv.style.display = 'block';
    setTimeout(() => {
        msgDiv.style.opacity = '0';
        setTimeout(() => { msgDiv.style.display = 'none'; }, 400);
    }, 2000);
}
