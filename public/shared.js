// Shared state management
const state = {
    memberData: null,
    userData: null,
    pin: null
};

// Initialize state from localStorage if available
function initializeState() {
    const savedState = localStorage.getItem('philhealthState');
    if (savedState) {
        Object.assign(state, JSON.parse(savedState));
    }
}

// Save state to localStorage
function saveState() {
    localStorage.setItem('philhealthState', JSON.stringify(state));
}

// Fetch member information
async function fetchMemberInfo() {
    try {
        const params = new URLSearchParams(window.location.search);
        const pin = params.get('pin');
        
        if (!pin) {
            console.error('No PIN provided');
            return;
        }

        // Store PIN in state
        state.pin = pin;
        saveState();

        const response = await fetch(`http://localhost:3000/api/member-info?pin=${encodeURIComponent(pin)}`);
        const data = await response.json();

        if (response.ok) {
            state.memberData = data;
            saveState();
            return data;
        } else {
            console.error('Error fetching member information:', data.error);
            return null;
        }
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

// Fetch user profile information
async function fetchUserProfile() {
    try {
        if (!state.pin) {
            console.error('No PIN available');
            return;
        }

        const response = await fetch(`http://localhost:3000/api/user-profile?pin=${encodeURIComponent(state.pin)}`);
        const data = await response.json();

        if (response.ok) {
            state.userData = data;
            saveState();
            return data;
        } else {
            console.error('Error fetching user profile:', data.error);
            return null;
        }
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

// Change password
async function changePassword(oldPassword, newPassword) {
    try {
        if (!state.pin) {
            throw new Error('No PIN available');
        }

        const response = await fetch('http://localhost:3000/api/change-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                pin: state.pin,
                oldPassword,
                newPassword
            })
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error changing password:', error);
        throw error;
    }
}

// Initialize state when the script loads
initializeState(); 