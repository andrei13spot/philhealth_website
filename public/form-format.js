document.addEventListener('DOMContentLoaded', function() {
    // Member Full Name: max 50 chars
    const memberFullName = document.getElementById('memberFullName');
    memberFullName.setAttribute('maxlength', 50);

    // PhilSys Card Number: auto-format 0000-0000-0000-0000
    const philsysId = document.getElementById('philsysId');
    philsysId.setAttribute('maxlength', 19);
    philsysId.addEventListener('input', function() {
        let value = this.value.replace(/[^0-9]/g, '').slice(0, 16);
        let formatted = '';
        for (let i = 0; i < value.length; i++) {
            if (i > 0 && i % 4 === 0) formatted += '-';
            formatted += value[i];
        }
        this.value = formatted;
    });

    // TIN: auto-format 000-000-000
    const tin = document.getElementById('tin');
    tin.setAttribute('maxlength', 11);
    tin.addEventListener('input', function() {
        let value = this.value.replace(/[^0-9]/g, '').slice(0, 9);
        let formatted = '';
        for (let i = 0; i < value.length; i++) {
            if (i > 0 && i % 3 === 0) formatted += '-';
            formatted += value[i];
        }
        this.value = formatted;
    });

    // Home No, Mobile No, Business DL: numbers only, max 20
    ['homeNo', 'mobileNo', 'businessDl'].forEach(function(id) {
        const el = document.getElementById(id);
        if (el) {
            el.setAttribute('maxlength', 20);
            el.addEventListener('input', function() {
                this.value = this.value.replace(/[^0-9]/g, '').slice(0, 20);
            });
        }
    });

    // Email: max 50, type=email handles validation
    const email = document.getElementById('email');
    if (email) email.setAttribute('maxlength', 50);

    // Mailing Address: max 100
    const mailingAddress = document.getElementById('mailingAddress');
    if (mailingAddress) mailingAddress.setAttribute('maxlength', 100);

    // Checkbox disables mailing address input
    const sameAsPermanent = document.getElementById('sameAsPermanent');
    if (sameAsPermanent && mailingAddress) {
        sameAsPermanent.addEventListener('change', function() {
            if (this.checked) {
                mailingAddress.value = document.getElementById('permanentAddress').value;
                mailingAddress.disabled = true;
            } else {
                mailingAddress.disabled = false;
                mailingAddress.value = '';
            }
        });
    }

    // Dependent Yes/No logic
    const addDependentsYes = document.getElementById('addDependentsYes');
    const addDependentsNo = document.getElementById('addDependentsNo');
    const dependentFields = document.getElementById('dependentFields');
    const depFullName = document.getElementById('depFullName');
    const depSex = document.getElementById('depSex');
    const depRelationship = document.getElementById('depRelationship');
    const depDob = document.getElementById('depDob');
    const depCitizenship = document.getElementById('depCitizenship');
    const depPWD = document.getElementById('depPWD');
    const addBtn = document.getElementById('addDependentBtn');
    const clearBtn = document.getElementById('clearDependentBtn');
    const depTableBody = document.getElementById('dependentsTableBody');

    let dependents = [];

    function setDependentFieldsRequired(required) {
        [depFullName, depSex, depRelationship, depDob, depCitizenship, depPWD].forEach(field => {
            if (required) {
                field.setAttribute('required', 'required');
            } else {
                field.removeAttribute('required');
            }
        });
    }

    function renderDependentsTable() {
        depTableBody.innerHTML = '';
        if (dependents.length === 0) {
            depTableBody.innerHTML = '<tr><td colspan="6" style="text-align:left;padding:8px 10px;">No records found.</td></tr>';
            return;
        }
        dependents.forEach((dep, idx) => {
            depTableBody.innerHTML += `<tr>
                <td style='border:1px solid #bfc9d1;padding:6px 8px;'>${dep.relationship}</td>
                <td style='border:1px solid #bfc9d1;padding:6px 8px;'>${dep.fullName}</td>
                <td style='border:1px solid #bfc9d1;padding:6px 8px;'>${dep.dob}</td>
                <td style='border:1px solid #bfc9d1;padding:6px 8px;'>${dep.sex}</td>
                <td style='border:1px solid #bfc9d1;padding:6px 8px;'>${dep.citizenship}</td>
                <td style='border:1px solid #bfc9d1;padding:6px 8px;'>${dep.pwd}</td>
            </tr>`;
        });
    }

    addBtn.addEventListener('click', function() {
        if (dependents.length >= 10) {
            alert('Maximum of 10 dependents only.');
            return;
        }
        if (!depFullName.value || !depSex.value || !depRelationship.value || !depDob.value || !depCitizenship.value || !depPWD.value) {
            alert('Please fill out all required dependent fields.');
            return;
        }
        let sexValue = depSex.options[depSex.selectedIndex].text;
        sexValue = sexValue === 'Male' ? 'M' : sexValue === 'Female' ? 'F' : '';
        dependents.push({
            relationship: depRelationship.options[depRelationship.selectedIndex].text,
            fullName: depFullName.value,
            dob: depDob.value,
            sex: sexValue,
            citizenship: depCitizenship.options[depCitizenship.selectedIndex].text,
            pwd: depPWD.options[depPWD.selectedIndex].text
        });
        renderDependentsTable();
        depFullName.value = '';
        depSex.value = '';
        depRelationship.value = '';
        depDob.value = '';
        depCitizenship.value = '';
        depPWD.value = '';
    });

    clearBtn.addEventListener('click', function() {
        dependents = [];
        renderDependentsTable();
        depFullName.value = '';
        depSex.value = '';
        depRelationship.value = '';
        depDob.value = '';
        depCitizenship.value = '';
        depPWD.value = '';
    });

    renderDependentsTable();

    // Show/hide and require/unrequire dependent fields based on Yes/No
    function updateDependentSection() {
        const depAsterisks = document.querySelectorAll('.asterisk-dependent');
        if (addDependentsYes.checked) {
            dependentFields.style.display = '';
            setDependentFieldsRequired(true);
            depAsterisks.forEach(el => el.style.display = 'inline');
        } else {
            dependentFields.style.display = 'none';
            setDependentFieldsRequired(false);
            depAsterisks.forEach(el => el.style.display = 'none');
        }
    }
    addDependentsYes.addEventListener('change', updateDependentSection);
    addDependentsNo.addEventListener('change', updateDependentSection);
    // Default: hide dependent fields
    dependentFields.style.display = 'none';
    setDependentFieldsRequired(false);

    // Membership Type: required
    const memberType = document.getElementById('member_type');
    if (memberType) {
        memberType.setAttribute('required', 'required');
    }

    // Modal logic
    const openWarningModalBtn = document.getElementById('openWarningModalBtn');
    const warningModal = document.getElementById('warningModal');
    const confirmCheckbox = document.getElementById('confirmCheckbox');
    const finalSubmitBtn = document.getElementById('finalSubmitBtn');
    const cancelModalBtn = document.getElementById('cancelModalBtn');
    const memberForm = document.getElementById('memberForm');

    // Helper: Validate member fields (no HTML5)
    function validateMemberFields() {
        let valid = true;
        let firstInvalid = null;
        // List of required member field IDs
        const requiredFields = [
            'member_type', 'memberFullName', 'sex', 'dateOfBirth', 'placeOfBirth', 'citizenship', 'civilStatus',
            'motherFullName', 'mobileNo', 'permanentAddress', 'mailingAddress'
        ];
        requiredFields.forEach(id => {
            const el = document.getElementById(id);
            if (el && (!el.value || el.value.trim() === '')) {
                valid = false;
                if (!firstInvalid) firstInvalid = el;
                el.style.borderColor = '#e53935';
            } else if (el) {
                el.style.borderColor = '';
            }
        });
        // Email: if present, must be valid
        const email = document.getElementById('email');
        if (email && email.value && !/^\S+@\S+\.\S+$/.test(email.value)) {
            valid = false;
            if (!firstInvalid) firstInvalid = email;
            email.style.borderColor = '#e53935';
        } else if (email) {
            email.style.borderColor = '';
        }
        if (!valid && firstInvalid) firstInvalid.focus();
        return valid;
    }

    // Helper: Validate dependents if required
    function validateDependents() {
        if (addDependentsYes.checked && dependents.length === 0) {
            alert('You must add at least one dependent.');
            return false;
        }
        return true;
    }

    // Open modal on submit button click
    openWarningModalBtn.addEventListener('click', function() {
        // Validate member fields
        if (!validateMemberFields()) {
            alert('Please fill out all required member fields correctly.');
            return;
        }
        // Validate dependents if needed
        if (!validateDependents()) {
            return;
        }
        // Show modal
        warningModal.style.display = 'flex';
        confirmCheckbox.checked = false;
        finalSubmitBtn.disabled = true;
    });

    // Enable Confirm & Submit only if checkbox is checked
    confirmCheckbox.addEventListener('change', function() {
        finalSubmitBtn.disabled = !this.checked;
    });

    // Cancel modal
    cancelModalBtn.addEventListener('click', function() {
        warningModal.style.display = 'none';
    });

    // Final submit
    finalSubmitBtn.addEventListener('click', async function() {
        warningModal.style.display = 'none';
        
        // Get TIN and PhilSys values
        const tin = document.getElementById('tin').value;
        const philsysId = document.getElementById('philsysId').value;
        
        // Check if TIN exists
        if (tin) {
            const tinExists = await checkTinExists(tin);
            if (tinExists) {
                alert('This TIN number is already registered in the system.');
                return;
            }
        }
        
        // Check if PhilSys ID exists
        if (philsysId) {
            const philsysExists = await checkPhilSysExists(philsysId);
            if (philsysExists) {
                alert('This PhilSys ID is already registered in the system.');
                return;
            }
        }

        // Continue with existing registration logic...
        const member = {};
        // Collect all member fields
        [
            'member_type', 'memberFullName', 'sex', 'dateOfBirth', 'placeOfBirth', 'citizenship', 'civilStatus',
            'philsysId', 'tin', 'motherFullName', 'spouseFullName', 'homeNo', 'mobileNo', 'email', 'permanentAddress', 'businessDl', 'mailingAddress'
        ].forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                // Map form fields to exact database column names
                const fieldMap = {
                    'memberFullName': 'member_full_name',
                    'dateOfBirth': 'date_of_birth',
                    'placeOfBirth': 'place_of_birth',
                    'civilStatus': 'civil_status',
                    'philsysId': 'philsys_id',
                    'motherFullName': 'mother_full_name',
                    'spouseFullName': 'spouse_full_name',
                    'homeNo': 'home_no',
                    'mobileNo': 'mobile_no',
                    'email': 'email_address',
                    'permanentAddress': 'permanent_address',
                    'businessDl': 'business_dl',
                    'mailingAddress': 'mailing_address'
                };
                const dbField = fieldMap[id] || id;
                // Set empty strings to null for optional fields
                if (el.value.trim() === '') {
                    member[dbField] = null;
                } else {
                    member[dbField] = el.value;
                }
            }
        });
        // Prepare dependents array
        const dependentsToSend = (addDependentsYes.checked) ? dependents : [];
        
        // Log the data being sent
        console.log('Sending registration data:', {
            member: member,
            dependents: dependentsToSend
        });

        fetch('http://localhost:3000/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ member, dependents: dependentsToSend })
        })
        .then(res => {
            console.log('Response status:', res.status);
            return res.json();
        })
        .then(data => {
            console.log('Response data:', data);
            if (data.success && data.pin) {
                window.location.href = 'confirmation.html?pin=' + encodeURIComponent(data.pin);
            } else {
                alert(data.error || 'Registration failed. Please try again.');
            }
        })
        .catch(err => {
            console.error('Registration error:', err);
            alert('An error occurred during registration. Please try again.');
        });
    });

    // Helper: Validate date of birth is not in the future
    function isFutureDate(dateString) {
        const date = new Date(dateString);
        const today = new Date();
        today.setHours(0,0,0,0);
        return date > today;
    }

    // Add to memberForm submit logic
    if (memberForm) {
        memberForm.addEventListener('submit', function(e) {
            // Validate member date of birth
            const dobInput = document.getElementById('dateOfBirth');
            if (dobInput && dobInput.value && isFutureDate(dobInput.value)) {
                alert('Date of Birth cannot be in the future.');
                dobInput.focus();
                e.preventDefault();
                return;
            }
            // Validate dependents' DOBs
            if (dependents && dependents.length > 0) {
                for (const dep of dependents) {
                    if (!dep.dob || isFutureDate(dep.dob)) {
                        alert('Cannot add dependent: Date of Birth is missing or in the future.');
                        e.preventDefault();
                        return;
                    }
                }
            }
        }, true);
    }

    // When adding a dependent, prevent adding if DOB is missing or in the future
    function addDependent(dep) {
        if (!dep.dob || isFutureDate(dep.dob)) {
            alert('Cannot add dependent: Date of Birth is missing or in the future.');
            return false;
        }
        // ...existing logic to add dependent...
        return true;
    }

    async function checkTinExists(tin) {
        try {
            const response = await fetch(`http://localhost:3000/api/check-tin?tin=${encodeURIComponent(tin)}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            return data.exists;
        } catch (error) {
            console.error('Error checking TIN:', error);
            return false;
        }
    }

    async function checkPhilSysExists(philsysId) {
        try {
            const response = await fetch(`http://localhost:3000/api/check-philsys?philsysId=${encodeURIComponent(philsysId)}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            return data.exists;
        } catch (error) {
            console.error('Error checking PhilSys ID:', error);
            return false;
        }
    }

    // Real-time TIN validation
    if (tin) {
        tin.addEventListener('blur', async function() {
            if (this.value) {
                const exists = await checkTinExists(this.value);
                if (exists) {
                    this.style.borderColor = '#e53935';
                    alert('This TIN number is already registered in the system.');
                } else {
                    this.style.borderColor = '';
                }
            }
        });
    }

    // Real-time PhilSys validation
    if (philsysId) {
        philsysId.addEventListener('blur', async function() {
            if (this.value) {
                const exists = await checkPhilSysExists(this.value);
                if (exists) {
                    this.style.borderColor = '#e53935';
                    alert('This PhilSys ID is already registered in the system.');
                } else {
                    this.style.borderColor = '';
                }
            }
        });
    }
});