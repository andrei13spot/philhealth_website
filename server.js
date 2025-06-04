const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const app = express();
app.use(express.json());
app.use(cors());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'yourpassword', // Change this to your MySQL root password
  database: 'philhealth_db'
});

db.connect(err => {
  if (err) throw err;
  console.log('Connected to MySQL');
});

// Registration endpoint (member + dependents)
app.post('/register', (req, res) => {
  const { member, dependents } = req.body;
  db.query('INSERT INTO member SET ?', member, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    if (dependents && dependents.length > 0) {
      const depValues = dependents.map(dep => [
        member.pin,
        dep.fullName,
        dep.relationship,
        dep.dob,
        dep.citizenship,
        dep.pwd
      ]);
      db.query(
        'INSERT INTO dependent (pin, dependent_full_name, dependent_relationship, dependent_date_of_birth, dependent_citizenship, dependent_pwd) VALUES ?',
        [depValues],
        (err2) => {
          if (err2) return res.status(500).json({ error: err2.message });
          res.json({ success: true });
        }
      );
    } else {
      res.json({ success: true });
    }
  });
});

// Account creation endpoint
app.post('/create-account', async (req, res) => {
  const { pin, email, password } = req.body;
  if (!pin || !email || !password) return res.status(400).json({ error: 'Missing fields' });
  const hash = await bcrypt.hash(password, 10);
  db.query(
    'INSERT INTO account (pin, email, password_hash) VALUES (?, ?, ?)',
    [pin, email, hash],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    }
  );
});

// Login endpoint
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Missing fields' });
  db.query('SELECT * FROM account WHERE email = ?', [email], async (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(401).json({ error: 'Invalid credentials' });
    const account = results[0];
    const match = await bcrypt.compare(password, account.password_hash);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });
    res.json({ success: true, pin: account.pin });
  });
});

app.listen(3000, () => console.log('Server running on port 3000')); 