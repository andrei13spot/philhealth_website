// =============================================
// SERVER CONFIGURATION AND SETUP
// =============================================
const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const path = require('path');
const app = express();

// =============================================
// MIDDLEWARE CONFIGURATION
// =============================================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));
app.use(express.static(path.join(__dirname, 'public')));

// =============================================
// DATABASE CONFIGURATION
// =============================================
const db = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'password',
    database: 'philhealth_db',
    port: 3306,
    connectTimeout: 10000
});

// =============================================
// DATABASE CONNECTION MANAGEMENT
// =============================================
function connectWithRetry(attempts = 0) {
    const maxAttempts = 3;
    
    if (attempts >= maxAttempts) {
        console.error('Failed to connect to MySQL after', maxAttempts, 'attempts');
        process.exit(1);
    }

    console.log(`Attempting to connect to MySQL (attempt ${attempts + 1}/${maxAttempts})...`);
    
    db.connect((err) => {
        if (err) {
            console.error('Error connecting to MySQL:', err);
            console.log('Retrying connection in 3 seconds...');
            setTimeout(() => connectWithRetry(attempts + 1), 3000);
            return;
        }
        console.log('Connected to MySQL successfully!');
    });
}

// Initial connection attempt
connectWithRetry();

// Error handling for database connection
db.on('error', (err) => {
    console.error('MySQL error:', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
        console.log('Connection lost. Attempting to reconnect...');
        connectWithRetry();
    } else {
        throw err;
    }
});

// =============================================
// HELPER FUNCTIONS
// =============================================
function generatePin(callback) {
    function randDigits(n) {
        let s = '';
        for (let i = 0; i < n; i++) s += Math.floor(Math.random() * 10);
        return s;
    }
    const tryPin = () => {
        const pin = randDigits(2) + '-' + randDigits(9) + '-' + randDigits(1);
        db.query('SELECT pin FROM member WHERE pin = ?', [pin], (err, results) => {
            if (err) return callback(err);
            if (results.length > 0) {
                return tryPin();
            }
            callback(null, pin);
        });
    };
    tryPin();
}

// Format date to MM/DD/YYYY
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString; // Return original if invalid date
    
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    
    return `${month}/${day}/${year}`;
}

// Helper to check if a date is in the future
function isFutureDate(dateString) {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0,0,0,0);
    return date > today;
}

// =============================================
// API ENDPOINTS
// =============================================

// Health Check Endpoint
app.get('/health', (req, res) => {
    db.query('SELECT 1', (err) => {
        if (err) {
            res.status(500).json({ 
                status: 'error', 
                message: 'Database connection failed',
                timestamp: new Date().toISOString()
            });
        } else {
            res.json({ 
                status: 'ok', 
                message: 'Server and database are healthy',
                timestamp: new Date().toISOString()
            });
        }
    });
});

// Registration Endpoint
app.post('/register', (req, res) => {
    console.log('Registration request received:', JSON.stringify(req.body, null, 2));
    const { member, dependents } = req.body;
    
    if (!member) {
        console.error('No member data received');
        return res.status(400).json({ error: 'Invalid member data' });
    }

    // Log member data
    console.log('Member data:', JSON.stringify(member, null, 2));

    // Generate unique PIN
    generatePin((err, pin) => {
        if (err) {
            console.error('PIN generation error:', err);
            return res.status(500).json({ error: 'Failed to generate unique PIN' });
        }
        console.log('Generated PIN:', pin);
        member.pin = pin;
        
        // Log the SQL query
        console.log('Inserting member with data:', JSON.stringify(member, null, 2));
        
        if (member.date_of_birth && isFutureDate(member.date_of_birth)) {
            return res.status(400).json({ error: 'Date of Birth cannot be in the future.' });
        }
        
        db.query('INSERT INTO member SET ?', member, (err) => {
            if (err) {
                console.error('Registration error:', err);
                console.error('Error details:', {
                    code: err.code,
                    errno: err.errno,
                    sqlMessage: err.sqlMessage,
                    sqlState: err.sqlState
                });
                return res.status(500).json({ error: err.message });
            }

            if (dependents && dependents.length > 0) {
                // Insert dependents one by one to ensure proper key generation
                let completed = 0;
                if (dependents.length === 0) {
                    return res.json({ success: true, message: 'Registration successful', pin });
                }
                for (const dep of dependents) {
                    if (dep.dob && isFutureDate(dep.dob)) {
                        return res.status(400).json({ error: 'Dependent Date of Birth cannot be in the future.' });
                    }
                    const depData = {
                        pin: member.pin,
                        dependent_full_name: dep.fullName,
                        dependent_relationship: dep.relationship,
                        dependent_date_of_birth: dep.dob,
                        dependent_citizenship: dep.citizenship,
                        dependent_pwd: dep.pwd
                    };

                    db.query('INSERT INTO dependent SET ?', depData, (err2) => {
                        if (err2) {
                            console.error('Dependent registration error:', err2);
                            return res.status(500).json({ error: err2.message });
                        }
                        completed++;
                        if (completed === dependents.length) {
                            res.json({ success: true, message: 'Registration successful', pin });
                        }
                    });
                }
            } else {
                res.json({ success: true, message: 'Registration successful', pin });
            }
        });
    });
});

// PIN Check Endpoint
app.get('/api/check-pin', (req, res) => {
    const pin = req.query.pin;
    if (!pin) return res.status(400).json({ exists: false, error: 'No PIN provided' });
    db.query('SELECT pin FROM member WHERE pin = ?', [pin], (err, results) => {
        if (err) return res.status(500).json({ exists: false, error: 'Database error' });
        res.json({ exists: results.length > 0 });
    });
});

// Account Check Endpoint
app.get('/api/check-account', (req, res) => {
    const pin = req.query.pin;
    if (!pin) return res.status(400).json({ exists: false, error: 'No PIN provided' });
    db.query('SELECT pin FROM account WHERE pin = ?', [pin], (err, results) => {
        if (err) return res.status(500).json({ exists: false, error: 'Database error' });
        res.json({ exists: results.length > 0 });
    });
});

// Create Account Endpoint
app.post('/create-account', async (req, res) => {
    try {
        const { pin, email, password } = req.body;
        if (!pin || !email || !password) {
            return res.status(400).json({ success: false, error: 'PIN, email, and password are required' });
        }
        // Check if PIN exists in member
        const [memberRows] = await db.promise().query('SELECT pin FROM member WHERE pin = ?', [pin]);
        if (memberRows.length === 0) {
            return res.status(400).json({ success: false, error: 'PIN does not exist. Please register as a member first.' });
        }
        // Check if account already exists
        const [accountRows] = await db.promise().query('SELECT pin FROM account WHERE pin = ?', [pin]);
        if (accountRows.length > 0) {
            return res.status(400).json({ success: false, error: 'An account for this PIN already exists.' });
        }
        // Hash password
        const bcrypt = require('bcryptjs');
        const password_hash = await bcrypt.hash(password, 10);
        // Insert account
        await db.promise().query(
            'INSERT INTO account (pin, email, password_hash) VALUES (?, ?, ?)',
            [pin, email, password_hash]
        );
        res.json({ success: true, message: 'Account created successfully', pin: pin });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Login Endpoint
app.post('/login', (req, res) => {
    console.log('Login request received');
    console.log('Request body:', req.body);
    console.log('Request headers:', req.headers);
    
    const { pin, password } = req.body;
    
    if (!pin || !password) {
        console.log('Missing credentials:', { pin: !!pin, password: !!password });
        return res.status(400).json({ error: 'Missing credentials' });
    }

    // First check if PIN exists in member table
    db.query('SELECT pin FROM member WHERE pin = ?', [pin], (err, memberResults) => {
        if (err) {
            console.error('Member check error:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        if (memberResults.length === 0) {
            return res.status(401).json({ error: 'Invalid PIN' });
        }

        // If PIN exists in member table, check account credentials
        db.query('SELECT * FROM account WHERE pin = ?', [pin], async (err, accountResults) => {
            if (err) {
                console.error('Account check error:', err);
                return res.status(500).json({ error: 'Database error' });
            }

            if (accountResults.length === 0) {
                return res.status(401).json({ error: 'No account found for this PIN' });
            }

            try {
                const account = accountResults[0];
                const match = await bcrypt.compare(password, account.password_hash);
                
                if (!match) {
                    return res.status(401).json({ error: 'Invalid password' });
                }
                
                res.json({ success: true, pin: account.pin });
            } catch (error) {
                console.error('Password comparison error:', error);
                res.status(500).json({ error: 'Error during login' });
            }
        });
    });
});

// Endpoint to fetch member information
app.get('/api/member-info', async (req, res) => {
    const pin = req.query.pin;
    if (!pin) {
        return res.status(400).json({ error: 'PIN is required' });
    }

    try {
        // Fetch member information
        const [memberRows] = await db.promise().query(
            'SELECT * FROM member WHERE pin = ?',
            [pin]
        );

        if (memberRows.length === 0) {
            return res.status(404).json({ error: 'Member not found' });
        }

        const member = memberRows[0];

        // Fetch dependents
        const [dependentRows] = await db.promise().query(
            'SELECT * FROM dependent WHERE pin = ?',
            [pin]
        );

        // Format the response
        const response = {
            member: {
                pin: member.pin,
                fullName: member.member_full_name || '',
                sex: member.sex || '',
                dateOfBirth: formatDate(member.date_of_birth) || '',
                citizenship: member.citizenship || '',
                civilStatus: member.civil_status || '',
                philsysId: member.philsys_id || '',
                tin: member.tin || '',
                motherFullName: member.mother_full_name || '',
                spouseFullName: member.spouse_full_name || '',
                homeNumber: member.home_no || '',
                mobileNumber: member.mobile_no || '',
                email: member.email_address || '',
                permanentAddress: member.permanent_address || '',
                businessDl: member.business_dl || '',
                mailingAddress: member.mailing_address || ''
            },
            dependents: dependentRows.map(dep => ({
                fullName: dep.dependent_full_name || '',
                dateOfBirth: formatDate(dep.dependent_date_of_birth) || '',
                relationship: dep.dependent_relationship || '',
                citizenship: dep.dependent_citizenship || '',
                pwd: dep.dependent_pwd || ''
            }))
        };

        res.json(response);
    } catch (error) {
        console.error('Error fetching member information:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

// Get user profile info
app.get('/api/user-profile', async (req, res) => {
    const pin = req.query.pin;
    if (!pin) {
        return res.status(400).json({ error: 'PIN is required' });
    }

    try {
        // Fetch account information
        const [accountRows] = await db.promise().query(
            'SELECT a.*, m.mobile_no FROM account a JOIN member m ON a.pin = m.pin WHERE a.pin = ?',
            [pin]
        );

        if (accountRows.length === 0) {
            return res.status(404).json({ error: 'Account not found' });
        }

        const account = accountRows[0];
        res.json({
            pin: account.pin,
            email: account.email,
            mobileNumber: account.mobile_no
        });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

// Change password
app.post('/api/change-password', async (req, res) => {
    const { pin, oldPassword, newPassword } = req.body;
    
    if (!pin || !oldPassword || !newPassword) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        // Get current password hash
        const [accountRows] = await db.promise().query(
            'SELECT password_hash FROM account WHERE pin = ?',
            [pin]
        );

        if (accountRows.length === 0) {
            return res.status(404).json({ error: 'Account not found' });
        }

        const account = accountRows[0];
        
        // Verify old password
        const match = await bcrypt.compare(oldPassword, account.password_hash);
        if (!match) {
            return res.status(401).json({ error: 'Current password is incorrect' });
        }

        // Hash new password
        const saltRounds = 10;
        const newHash = await bcrypt.hash(newPassword, saltRounds);

        // Update password
        await db.promise().query(
            'UPDATE account SET password_hash = ? WHERE pin = ?',
            [newHash, pin]
        );

        res.json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

// Delete account endpoint
app.post('/api/delete-account', async (req, res) => {
    const { pin } = req.body;
    if (!pin) return res.status(400).json({ success: false, error: 'PIN is required' });
    try {
        // Delete from dependents first (foreign key constraint)
        await db.promise().query('DELETE FROM dependent WHERE pin = ?', [pin]);
        // Delete from account
        await db.promise().query('DELETE FROM account WHERE pin = ?', [pin]);
        // Delete from member
        await db.promise().query('DELETE FROM member WHERE pin = ?', [pin]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update contact details
app.post('/api/update-member-contact', async (req, res) => {
    const { pin, homeNumber, mobileNumber, email, permanentAddress, businessDl, mailingAddress } = req.body;
    if (!pin) return res.status(400).json({ success: false, error: 'PIN is required' });
    try {
        await db.promise().query(
            `UPDATE member SET home_no=?, mobile_no=?, email_address=?, permanent_address=?, business_dl=?, mailing_address=? WHERE pin=?`,
            [homeNumber, mobileNumber, email, permanentAddress, businessDl, mailingAddress, pin]
        );
        const [rows] = await db.promise().query('SELECT * FROM member WHERE pin=?', [pin]);
        res.json({ success: true, member: rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update dependents
app.post('/api/update-dependents', async (req, res) => {
    const { pin, dependents } = req.body;
    if (!pin) return res.status(400).json({ success: false, error: 'PIN is required' });
    try {
        // Remove all existing dependents for this pin
        await db.promise().query('DELETE FROM dependent WHERE pin=?', [pin]);
        // Insert new dependents
        for (const dep of dependents) {
            if (dep.fullName) { // Only insert if fullName is provided
                if (dep.dob && isFutureDate(dep.dob)) {
                    return res.status(400).json({ error: 'Dependent Date of Birth cannot be in the future.' });
                }
                await db.promise().query(
                    'INSERT INTO dependent (pin, dependent_full_name, dependent_relationship, dependent_date_of_birth, dependent_citizenship, dependent_pwd) VALUES (?, ?, ?, ?, ?, ?)',
                    [pin, dep.fullName, dep.relationship, dep.dateOfBirth, dep.citizenship, dep.pwd]
                );
            }
        }
        // Return updated dependents
        const [rows] = await db.promise().query('SELECT * FROM dependent WHERE pin=?', [pin]);
        res.json({ success: true, dependents: rows });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Add a test endpoint to verify server is working
app.get('/test', (req, res) => {
    res.json({ message: 'Server is running' });
});

// =============================================
// ADMIN DASHBOARD ENDPOINTS
// =============================================

// Get dashboard statistics
app.get('/api/admin/dashboard/stats', (req, res) => {
    // Get total members
    db.query('SELECT COUNT(*) as count FROM member', (err, membersResult) => {
        if (err) {
            console.error('Error fetching total members:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }

        // Get total dependents
        db.query('SELECT COUNT(*) as count FROM dependent', (err, dependentsResult) => {
            if (err) {
                console.error('Error fetching total dependents:', err);
                return res.status(500).json({ error: 'Internal server error' });
            }

            // Get active accounts (number of created accounts)
            db.query('SELECT COUNT(*) as count FROM account', (err, activeAccountsResult) => {
                if (err) {
                    console.error('Error fetching active accounts:', err);
                    return res.status(500).json({ error: 'Internal server error' });
                }

                res.json({
                    totalMembers: membersResult[0].count,
                    totalDependents: dependentsResult[0].count,
                    activeAccounts: activeAccountsResult[0].count
                });
            });
        });
    });
});

// Get recent activities
app.get('/api/admin/dashboard/activities', (req, res) => {
    // Fetch 5 most recent dependents only
    db.query(
        "SELECT 'dependent_add' as type, CONCAT('New dependent added: ', dependent_full_name) as description FROM dependent ORDER BY dependent_key DESC LIMIT 5",
        (err, dependentResults) => {
            if (err) {
                console.error('Error fetching recent dependent activities:', err);
                return res.status(500).json({ error: 'Internal server error' });
            }
            res.json(dependentResults);
        }
    );
});

// Generate report
app.post('/api/admin/generate-report', (req, res) => {
    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=philhealth-report.pdf');
    doc.pipe(res);

    doc.fontSize(25).text('PhilHealth Report', { align: 'center' });
    doc.moveDown();

    db.query(`
        SELECT 
            (SELECT COUNT(*) FROM member) as total_members,
            (SELECT COUNT(*) FROM dependent) as total_dependents,
            (SELECT COUNT(*) FROM account) as active_accounts
    `, (err, stats) => {
        if (err) {
            console.error('Error generating report:', err);
            doc.fontSize(14).fillColor('red').text('Error generating report.');
            doc.end();
            return;
        }

        doc.fontSize(14).fillColor('black').text('Statistics', { underline: true });
        doc.moveDown();
        doc.fontSize(12).text(`Total Members: ${stats[0].total_members}`);
        doc.text(`Total Dependents: ${stats[0].total_dependents}`);
        doc.text(`Active Accounts: ${stats[0].active_accounts}`);
        doc.moveDown();
        
        // Get recent dependents only
        db.query(`
            SELECT CONCAT('Dependent: ', dependent_full_name) as description
            FROM dependent
            ORDER BY dependent_key DESC
            LIMIT 10
        `, (err, activities) => {
            if (err) {
                console.error('Error generating report:', err);
                return res.status(500).json({ error: 'Internal server error' });
            }

            // Add activities to PDF
            doc.fontSize(14).text('Recent Dependents', { underline: true });
            doc.moveDown();
            activities.forEach(activity => {
                doc.fontSize(12).text(activity.description);
            });
            
            // Finalize PDF
            doc.end();
        });
    });
});

// Check system status
app.get('/api/admin/system-status', (req, res) => {
    // Check database connection with a timeout
    const timeout = setTimeout(() => {
        res.json({
            database: false,
            apiServices: true
        });
    }, 5000); // 5 second timeout

    db.query('SELECT 1', (err) => {
        clearTimeout(timeout); // Clear the timeout if query completes
        
        if (err) {
            console.error('Database connection error:', err);
            res.json({
                database: false,
                apiServices: true
            });
        } else {
            res.json({
                database: true,
                apiServices: true
            });
        }
    });
});

// Member search endpoint
app.get('/api/admin/members/search', async (req, res) => {
    try {
        const {
            searchTerm,
            memberType,
            civilStatus,
            citizenship,
            page = 1,
            limit = 10
        } = req.query;

        const offset = (page - 1) * limit;
        const params = [];
        let whereClause = '';
        let whereKeyword = '';

        // Build search conditions
        if (searchTerm) {
            whereClause += `m.pin LIKE ? OR m.member_full_name LIKE ? OR m.email_address LIKE ? OR m.mobile_no LIKE ?`;
            const searchPattern = `%${searchTerm}%`;
            params.push(searchPattern, searchPattern, searchPattern, searchPattern);
        }
        if (memberType) {
            if (whereClause) whereClause += ' AND ';
            whereClause += 'm.member_type = ?';
            params.push(memberType);
        }
        if (civilStatus) {
            if (whereClause) whereClause += ' AND ';
            whereClause += 'm.civil_status = ?';
            params.push(civilStatus);
        }
        if (citizenship) {
            if (whereClause) whereClause += ' AND ';
            whereClause += 'm.citizenship = ?';
            params.push(citizenship);
        }
        if (whereClause) {
            whereKeyword = 'WHERE ';
        }

        // Get total count for pagination
        const [countResult] = await db.promise().query(
            `SELECT COUNT(*) as total 
             FROM member m 
             ${whereKeyword}${whereClause}`,
            params
        );
        const total = countResult[0].total;
        const totalPages = Math.ceil(total / limit);

        // Get members with pagination
        const [members] = await db.promise().query(
            `SELECT 
                m.*, 
                COUNT(d.pin) as dependentCount
             FROM member m
             LEFT JOIN dependent d ON d.pin = m.pin
             ${whereKeyword}${whereClause}
             GROUP BY m.pin
             ORDER BY m.member_full_name
             LIMIT ? OFFSET ?`,
            [...params, parseInt(limit), offset]
        );  

        res.json({
            members,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages
            }
        });
    } catch (error) {
        console.error('Error searching members:', error);
        res.status(500).json({ error: 'Failed to search members' });
    }
});

// Get member details with dependents
app.get('/api/admin/members/:pin', async (req, res) => {
    const { pin } = req.params;

    try {
        // Get member details
        const [memberRows] = await db.promise().query(
            'SELECT * FROM member WHERE pin = ?',
            [pin]
        );

        if (memberRows.length === 0) {
            return res.status(404).json({ error: 'Member not found' });
        }

        const member = memberRows[0];

        // Get dependents
        const [dependents] = await db.promise().query(
            'SELECT * FROM dependent WHERE pin = ?',
            [pin]
        );

        // Get account status
        const [accountRows] = await db.promise().query(
            'SELECT email, created_at FROM account WHERE pin = ?',
            [pin]
        );

        res.json({
            member,
            dependents,
            account: accountRows[0] || null
        });
    } catch (error) {
        console.error('Error fetching member details:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update member information
app.put('/api/admin/members/:pin', async (req, res) => {
    const { pin } = req.params;
    const updateData = req.body;

    try {
        // Remove any fields that shouldn't be updated
        delete updateData.pin;
        delete updateData.created_at;

        if (updateData.date_of_birth && isFutureDate(updateData.date_of_birth)) {
            return res.status(400).json({ error: 'Date of Birth cannot be in the future.' });
        }

        await db.promise().query(
            'UPDATE member SET ? WHERE pin = ?',
            [updateData, pin]
        );

        // Get updated member data
        const [memberRows] = await db.promise().query(
            'SELECT * FROM member WHERE pin = ?',
            [pin]
        );

        res.json({
            success: true,
            member: memberRows[0]
        });
    } catch (error) {
        console.error('Error updating member:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Generate member report
app.get('/api/admin/members/:pin/report', async (req, res) => {
    const { pin } = req.params;
    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=member-${pin}-report.pdf`);
    doc.pipe(res);

    try {
        // Get member details
        const [memberRows] = await db.promise().query(
            'SELECT * FROM member WHERE pin = ?',
            [pin]
        );

        if (memberRows.length === 0) {
            doc.fontSize(14).fillColor('red').text('Member not found');
            doc.end();
            return;
        }

        const member = memberRows[0];

        // Get dependents
        const [dependents] = await db.promise().query(
            'SELECT * FROM dependent WHERE pin = ?',
            [pin]
        );

        // Generate PDF
        doc.fontSize(25).text('Member Report', { align: 'center' });
        doc.moveDown();

        // Member Information
        doc.fontSize(14).text('Member Information', { underline: true });
        doc.moveDown();
        doc.fontSize(12).text(`PIN: ${member.pin}`);
        doc.text(`Name: ${member.member_full_name}`);
        doc.text(`Member Type: ${member.member_type}`);
        doc.text(`Civil Status: ${member.civil_status}`);
        doc.text(`Citizenship: ${member.citizenship}`);
        doc.moveDown();

        // Contact Information
        doc.fontSize(14).text('Contact Information', { underline: true });
        doc.moveDown();
        doc.fontSize(12).text(`Email: ${member.email_address || 'N/A'}`);
        doc.text(`Mobile: ${member.mobile_no}`);
        doc.text(`Home: ${member.home_no || 'N/A'}`);
        doc.moveDown();

        // Dependents
        doc.fontSize(14).text('Dependents', { underline: true });
        doc.moveDown();
        if (dependents.length > 0) {
            dependents.forEach(dep => {
                doc.fontSize(12).text(`Name: ${dep.dependent_full_name}`);
                doc.text(`Relationship: ${dep.dependent_relationship}`);
                doc.text(`Date of Birth: ${formatDate(dep.dependent_date_of_birth)}`);
                doc.text(`Citizenship: ${dep.dependent_citizenship}`);
                doc.text(`PWD: ${dep.dependent_pwd}`);
                doc.moveDown();
            });
        } else {
            doc.fontSize(12).text('No dependents registered');
        }

        doc.end();
    } catch (error) {
        console.error('Error generating member report:', error);
        doc.fontSize(14).fillColor('red').text('Error generating report');
        doc.end();
    }
});

// =============================================
// ADMIN DEPENDENTS MANAGEMENT ENDPOINTS
// =============================================

/**
 * Search dependents for admin management table (with pagination and filters)
 * GET /api/admin/dependents/search
 * Query params: searchTerm, relationship, citizenship, pwd, page, limit
 * Returns: List of dependents (with member name) and pagination info
 */
app.get('/api/admin/dependents/search', async (req, res) => {
    try {
        const {
            searchTerm,
            relationship,
            citizenship,
            pwd,
            page = 1,
            limit = 10
        } = req.query;

        const offset = (page - 1) * limit;
        const params = [];
        let whereClause = '';
        let whereKeyword = '';

        // Build search conditions
        if (searchTerm) {
            whereClause += `d.dependent_full_name LIKE ? OR d.pin LIKE ?`;
            const searchPattern = `%${searchTerm}%`;
            params.push(searchPattern, searchPattern);
        }
        if (relationship) {
            if (whereClause) whereClause += ' AND ';
            whereClause += 'd.dependent_relationship = ?';
            params.push(relationship);
        }
        if (citizenship) {
            if (whereClause) whereClause += ' AND ';
            whereClause += 'd.dependent_citizenship = ?';
            params.push(citizenship);
        }
        if (pwd) {
            if (whereClause) whereClause += ' AND ';
            whereClause += 'd.dependent_pwd = ?';
            params.push(pwd);
        }
        if (whereClause) {
            whereKeyword = 'WHERE ';
        }

        // Get total count for pagination
        const [countResult] = await db.promise().query(
            `SELECT COUNT(*) as total 
            FROM dependent d 
            ${whereKeyword}${whereClause}`,
            params
        );
        const total = countResult[0].total;
        const totalPages = Math.ceil(total / limit);

        // Get dependents with pagination and explicit aliases for all fields
        const [dependents] = await db.promise().query(
            `SELECT 
                m.member_full_name,
                d.dependent_full_name,
                d.pin,
                d.dependent_relationship,
                d.dependent_date_of_birth,
                d.dependent_citizenship,
                d.dependent_pwd,
                d.dependent_key
            FROM dependent d
            JOIN member m ON d.pin = m.pin
            ${whereKeyword}${whereClause}
            ORDER BY m.member_full_name
             LIMIT ? OFFSET ?`,
            [...params, parseInt(limit), offset]
        );

        res.json({
            dependents,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages
            }
        });
    } catch (error) {
        console.error('Error searching dependents:', error);
        res.status(500).json({ error: 'Failed to search dependents' });
    }
});

/**
 * Get a single dependent's details for admin view/edit modal
 * GET /api/admin/dependents/:dependent_key
 * Params: dependent_key
 * Returns: Dependent object (fields for modal)
 */
app.get('/api/admin/dependents/:dependent_key', async (req, res) => {
    const { dependent_key } = req.params;
    try {
        const [rows] = await db.promise().query(
            `SELECT 
                m.member_full_name,
                d.dependent_full_name,
                d.pin,
                d.dependent_relationship,
                d.dependent_date_of_birth,
                d.dependent_citizenship,
                d.dependent_pwd,
                d.dependent_key
            FROM dependent d
            JOIN member m ON d.pin = m.pin
            WHERE d.dependent_key = ?`,
            [dependent_key]
        );
        if (rows.length === 0) return res.status(404).json({ error: 'Dependent not found' });
        res.json(rows[0]);
    } catch (err) {
        console.error('Error fetching dependent details:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

/**
 * Update a single dependent's details (admin edit modal)
 * PUT /api/admin/dependents/:dependent_key
 * Params: dependent_key
 * Body: dependent_full_name, dependent_relationship, dependent_date_of_birth, dependent_citizenship, dependent_pwd
 * Returns: { success: true }
 */
app.put('/api/admin/dependents/:dependent_key', async (req, res) => {
    const { dependent_key } = req.params;
    const { dependent_full_name, dependent_relationship, dependent_date_of_birth, dependent_citizenship, dependent_pwd } = req.body;
    try {
        await db.promise().query(
            `UPDATE dependent SET 
                dependent_full_name = ?, 
                dependent_relationship = ?, 
                dependent_date_of_birth = ?, 
                dependent_citizenship = ?, 
                dependent_pwd = ?
            WHERE dependent_key = ?`,
            [dependent_full_name, dependent_relationship, dependent_date_of_birth, dependent_citizenship, dependent_pwd, dependent_key]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});

/**
 * Generate a PDF report for a dependent (admin action)
 * GET /api/admin/dependents/:dependent_key/report
 * Params: dependent_key
 * Returns: PDF file (application/pdf)
 */
app.get('/api/admin/dependents/:dependent_key/report', async (req, res) => {
    const { dependent_key } = req.params;
    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=dependent-${dependent_key}-report.pdf`);
    doc.pipe(res);

    try {
        // Get dependent details
        const [dependentRows] = await db.promise().query(
            'SELECT * FROM dependent WHERE dependent_key = ?',
            [dependent_key]
        );

        if (dependentRows.length === 0) {
            doc.fontSize(14).fillColor('red').text('Dependent not found');
            doc.end();
            return;
        }

        const dependent = dependentRows[0];

        // Generate PDF
        doc.fontSize(25).text('Dependent Report', { align: 'center' });
        doc.moveDown();

        // Dependent Information
        doc.fontSize(14).text('Dependent Information', { underline: true });
        doc.moveDown();
        doc.fontSize(12).text(`PIN: ${dependent.pin}`);
        doc.text(`Name: ${dependent.dependent_full_name}`);
        doc.text(`Relationship: ${dependent.dependent_relationship}`);
        doc.text(`Date of Birth: ${formatDate(dependent.dependent_date_of_birth)}`);
        doc.text(`Citizenship: ${dependent.dependent_citizenship}`);
        doc.text(`PWD: ${dependent.dependent_pwd}`);
        doc.moveDown();

        doc.end();
    } catch (error) {
        console.error('Error generating dependent report:', error);
        doc.fontSize(14).fillColor('red').text('Error generating report');
        doc.end();
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// =============================================
// SERVER STARTUP AND SHUTDOWN
// =============================================
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Health check available at http://localhost:${PORT}/health`);
});

function gracefulShutdown(signal) {
    console.log(`\n${signal} received. Starting graceful shutdown...`);
    server.close(() => {
        console.log('HTTP server closed');
        db.end((err) => {
            if (err) {
                console.error('Error closing database connection:', err);
            } else {
                console.log('Database connection closed.');
            }
            process.exit(0);
        });
    });
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));