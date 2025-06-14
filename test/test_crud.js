const mysql = require('mysql2/promise');

async function testCRUD() {
    // Create connection
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'password', 
        database: 'philhealth_db'
    });

    try {
        console.log('Testing CRUD Operations...\n');

        // CREATE - Insert a new member
        console.log('1. Testing CREATE operation...');
        const insertMember = await connection.execute(`
            INSERT INTO member (
                pin, member_full_name, mother_full_name, date_of_birth, 
                place_of_birth, sex, civil_status, citizenship, 
                permanent_address, mailing_address, mobile_no, member_type
            ) VALUES (
                '12-12345678-9', 'John Doe', 'Jane Doe', '1990-01-01',
                'Manila', 'M', 'Single', 'Filipino',
                '123 Main St, Manila', '123 Main St, Manila', '09123456789', 'Direct Contributor'
            )
        `);
        console.log('Member created successfully!\n');

        // READ - Get the created member
        console.log('2. Testing READ operation...');
        const [members] = await connection.execute(`
            SELECT * FROM member WHERE pin = '12-12345678-9'
        `);
        console.log('Retrieved member:', members[0], '\n');

        // CREATE - Add a dependent
        console.log('3. Testing CREATE for dependent...');
        const insertDependent = await connection.execute(`
            INSERT INTO dependent (
                pin, dependent_full_name, dependent_relationship,
                dependent_date_of_birth, dependent_citizenship, dependent_pwd
            ) VALUES (
                '12-12345678-9', 'Junior Doe', 'Child',
                '2010-01-01', 'Filipino', 'no'
            )
        `);
        console.log('Dependent created successfully!\n');

        // CREATE - Add an account
        console.log('4. Testing CREATE for account...');
        const insertAccount = await connection.execute(`
            INSERT INTO account (
                pin, email, password_hash
            ) VALUES (
                '12-12345678-9', 'john.doe@email.com', 'hashed_password_123'
            )
        `);
        console.log('Account created successfully!\n');

        // READ - Get member with dependents and account
        console.log('5. Testing READ with JOIN...');
        const [memberWithDetails] = await connection.execute(`
            SELECT m.*, d.*, a.email, a.created_at
            FROM member m
            LEFT JOIN dependent d ON m.pin = d.pin
            LEFT JOIN account a ON m.pin = a.pin
            WHERE m.pin = '12-12345678-9'
        `);
        console.log('Member with details:', memberWithDetails[0], '\n');

        // UPDATE - Update member information
        console.log('6. Testing UPDATE operation...');
        const updateMember = await connection.execute(`
            UPDATE member 
            SET mobile_no = '09187654321',
                email_address = 'john.doe.updated@email.com'
            WHERE pin = '12-12345678-9'
        `);
        console.log('Member updated successfully!\n');

        // READ - Verify update
        const [updatedMember] = await connection.execute(`
            SELECT * FROM member WHERE pin = '12-12345678-9'
        `);
        console.log('Updated member:', updatedMember[0], '\n');

        // DELETE - Clean up test data
        console.log('7. Testing DELETE operation...');
        // Delete in correct order due to foreign key constraints
        await connection.execute(`DELETE FROM account WHERE pin = '12-12345678-9'`);
        await connection.execute(`DELETE FROM dependent WHERE pin = '12-12345678-9'`);
        await connection.execute(`DELETE FROM member WHERE pin = '12-12345678-9'`);
        console.log('Test data cleaned up successfully!\n');

        console.log('All CRUD operations completed successfully!');

    } catch (error) {
        console.error('Error during CRUD operations:', error);
    } finally {
        await connection.end();
    }
}

// Run the test
testCRUD(); 