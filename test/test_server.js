const fetch = require('node-fetch');

async function testServer() {
    const baseUrl = 'http://localhost:3000';
    
    console.log('Testing Server Endpoints...\n');

    try {
        // Test 1: Check if server is running
        console.log('1. Testing server availability...');
        const response = await fetch(baseUrl);
        console.log('Server is running! Status:', response.status, '\n');

        // Test 2: Test registration endpoint
        console.log('2. Testing registration endpoint...');
        const registerData = {
            member: {
                pin: '12-12345678-9',
                member_full_name: 'Test User',
                mother_full_name: 'Mother User',
                date_of_birth: '1990-01-01',
                place_of_birth: 'Manila',
                sex: 'M',
                civil_status: 'Single',
                citizenship: 'Filipino',
                permanent_address: '123 Test St',
                mailing_address: '123 Test St',
                mobile_no: '09123456789',
                member_type: 'Direct Contributor'
            },
            dependents: [{
                fullName: 'Child User',
                relationship: 'Child',
                dob: '2010-01-01',
                citizenship: 'Filipino',
                pwd: 'no'
            }]
        };

        const registerResponse = await fetch(`${baseUrl}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(registerData)
        });
        console.log('Registration response:', await registerResponse.json(), '\n');

        // Test 3: Test account creation
        console.log('3. Testing account creation...');
        const accountData = {
            pin: '12-12345678-9',
            email: 'test@example.com',
            password: 'Test123!@#'
        };

        const accountResponse = await fetch(`${baseUrl}/create-account`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(accountData)
        });
        console.log('Account creation response:', await accountResponse.json(), '\n');

        // Test 4: Test login
        console.log('4. Testing login...');
        const loginData = {
            email: 'test@example.com',
            password: 'Test123!@#'
        };

        const loginResponse = await fetch(`${baseUrl}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(loginData)
        });
        console.log('Login response:', await loginResponse.json(), '\n');

        console.log('All server tests completed!');

    } catch (error) {
        console.error('Error testing server:', error);
    }
}

// Run the tests
testServer(); 