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

    // Dependent logic
    const depFullName = document.getElementById('depFullName');
    const depSex = document.getElementById('depSex');
    const depRelationship = document.getElementById('depRelationship');
    const depDob = document.getElementById('depDob');
    const depCitizenship = document.getElementById('depCitizenship');
    const depPWD = document.getElementById('depPWD');
    const addBtn = document.querySelector('.dependent-btns .login-btn:nth-child(1)');
    const clearBtn = document.querySelector('.dependent-btns .login-btn:nth-child(2)');
    const depTableBody = document.getElementById('dependentsTableBody');

    let dependents = [];

    function parseFullName(fullName) {
        // Try to split into Last, First, Extension, Middle (PhilHealth style: Last, First, Extension, Middle)
        // Accepts: LastName, FirstName, MiddleName, Extension (comma or space separated)
        let last = '', first = '', ext = '', middle = '';
        if (!fullName) return { last, first, ext, middle };
        let parts = fullName.split(',').map(s => s.trim());
        if (parts.length === 4) {
            [last, first, middle, ext] = parts;
        } else if (parts.length === 3) {
            [last, first, middle] = parts;
        } else if (parts.length === 2) {
            [last, first] = parts;
        } else if (parts.length === 1) {
            last = parts[0];
        }
        return { last, first, ext, middle };
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

    // Membership Type: required
    const memberType = document.getElementById('memberType');
    if (memberType) memberType.setAttribute('required', 'required');

    // Form submission: check all required fields
    document.getElementById('memberForm').addEventListener('submit', function(e) {
        // HTML5 validation will catch most issues, but you can add custom checks here if needed
        // Example: check email format
        if (email && email.value && !/^\S+@\S+\.\S+$/.test(email.value)) {
            alert('Please enter a valid email address.');
            email.focus();
            e.preventDefault();
            return false;
        }
    });
}); 