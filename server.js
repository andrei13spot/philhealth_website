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
    connectTimeout: 10000,
    acquireTimeout: 10000,
    timeout: 10000,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
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
                dependents.forEach(dep => {
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
                });
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
        res.json({ success: true, message: 'Account created successfully' });
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

        if (dependentRows.length === 0) {
            return res.status(404).json({ error: 'Dependent not found' });
        }       

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

// Add a test endpoint to verify server is working
app.get('/test', (req, res) => {
    res.json({ message: 'Server is running' });
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