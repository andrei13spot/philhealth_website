// Unified view/edit member details page

let originalData = {};

function setReadOnlyMode(isReadOnly) {
    const fields = [
        'member_full_name',
        'email_address',
        'mobile_no',
        'member_type',
        'civil_status',
        'citizenship'
    ];
    fields.forEach(id => {
        const el = document.getElementById(id);
        if (el.tagName === 'SELECT') {
            el.disabled = isReadOnly;
        } else {
            el.readOnly = isReadOnly;
        }
    });
    document.getElementById('editBtn').style.display = isReadOnly ? '' : 'none';
    document.getElementById('viewActions').style.display = isReadOnly ? '' : 'none';
    document.getElementById('editActions').style.display = isReadOnly ? 'none' : '';
}

async function fetchAndPopulateMember(pin) {
    try {
        const response = await fetch(`http://localhost:3000/api/admin/members/${pin}`);
        if (!response.ok) throw new Error('Failed to fetch member details');
        const data = await response.json();
        document.getElementById('pin').value = data.member.pin;
        document.getElementById('member_full_name').value = data.member.member_full_name;
        document.getElementById('email_address').value = data.member.email_address;
        document.getElementById('mobile_no').value = data.member.mobile_no;
        document.getElementById('member_type').value = data.member.member_type;
        document.getElementById('civil_status').value = data.member.civil_status;
        document.getElementById('citizenship').value = data.member.citizenship;
        // Save original data for cancel
        originalData = {
            member_full_name: data.member.member_full_name,
            email_address: data.member.email_address,
            mobile_no: data.member.mobile_no,
            member_type: data.member.member_type,
            civil_status: data.member.civil_status,
            citizenship: data.member.citizenship
        };
    } catch (error) {
        alert('Failed to load member details.');
        window.location.href = 'admin-members.html';
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const pin = urlParams.get('pin');
    const editMode = urlParams.get('edit');
    if (!pin) {
        alert('No member PIN provided.');
        window.location.href = 'admin-members.html';
        return;
    }
    await fetchAndPopulateMember(pin);
    setReadOnlyMode(!editMode);

    document.getElementById('editBtn').addEventListener('click', () => {
        setReadOnlyMode(false);
    });

    document.getElementById('cancelBtn').addEventListener('click', () => {
        // Revert to original data
        document.getElementById('member_full_name').value = originalData.member_full_name;
        document.getElementById('email_address').value = originalData.email_address;
        document.getElementById('mobile_no').value = originalData.mobile_no;
        document.getElementById('member_type').value = originalData.member_type;
        document.getElementById('civil_status').value = originalData.civil_status;
        document.getElementById('citizenship').value = originalData.citizenship;
        setReadOnlyMode(true);
    });

    document.getElementById('memberDetailsForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const updateData = {
            member_full_name: document.getElementById('member_full_name').value,
            email_address: document.getElementById('email_address').value,
            mobile_no: document.getElementById('mobile_no').value,
            member_type: document.getElementById('member_type').value,
            civil_status: document.getElementById('civil_status').value,
            citizenship: document.getElementById('citizenship').value
        };
        try {
            const response = await fetch(`http://localhost:3000/api/admin/members/${pin}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateData)
            });
            if (!response.ok) throw new Error('Failed to update member');
            alert('Member updated successfully!');
            // Refresh data and return to view mode
            await fetchAndPopulateMember(pin);
            setReadOnlyMode(true);
        } catch (error) {
            alert('Failed to update member.');
        }
    });
}); 