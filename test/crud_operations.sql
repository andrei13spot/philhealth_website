-- CRUD Operations for Member Table
-- Create (Insert) a new member
INSERT INTO member (
    pin, member_full_name, mother_full_name, date_of_birth, 
    place_of_birth, sex, civil_status, citizenship, 
    permanent_address, mailing_address, mobile_no, member_type
) VALUES (
    '123456789012', 'Juan Dela Cruz', 'Maria Dela Cruz', '1990-01-01',
    'Manila', 'M', 'Single', 'Filipino',
    '123 Main St, Manila', '123 Main St, Manila', '09123456789', 'Direct Contributor'
);

-- Read (Select) member information
SELECT * FROM member WHERE pin = '123456789012';
SELECT * FROM member WHERE member_full_name LIKE '%Cruz%';
SELECT * FROM member WHERE member_type = 'Direct Contributor';

-- Update member information
UPDATE member 
SET mobile_no = '09187654321',
    email_address = 'juan.delacruz@email.com'
WHERE pin = '123456789012';

-- Delete member (Note: This will fail if there are dependent records due to foreign key constraint)
DELETE FROM member WHERE pin = '123456789012';

-- CRUD Operations for Dependent Table
-- Create (Insert) a new dependent
INSERT INTO dependent (
    pin, dependent_full_name, dependent_relationship,
    dependent_date_of_birth, dependent_citizenship, dependent_pwd
) VALUES (
    '123456789012', 'Maria Dela Cruz Jr', 'Child',
    '2010-01-01', 'Filipino', 'no'
);

-- Read (Select) dependent information
SELECT * FROM dependent WHERE pin = '123456789012';
SELECT * FROM dependent WHERE dependent_relationship = 'Child';

-- Update dependent information
UPDATE dependent 
SET dependent_full_name = 'Maria Dela Cruz Jr II',
    dependent_pwd = 'yes'
WHERE dependent_key = 1;

-- Delete dependent
DELETE FROM dependent WHERE dependent_key = 1;

-- CRUD Operations for Account Table
-- Create (Insert) a new account
INSERT INTO account (
    pin, email, password_hash
) VALUES (
    '123456789012', 'juan.delacruz@email.com', 'hashed_password_here'
);

-- Read (Select) account information
SELECT * FROM account WHERE pin = '123456789012';
SELECT * FROM account WHERE email = 'juan.delacruz@email.com';

-- Update account information
UPDATE account 
SET password_hash = 'new_hashed_password_here'
WHERE account_id = 1;

-- Delete account
DELETE FROM account WHERE account_id = 1;

-- Additional Useful Queries
-- Get member with all their dependents
SELECT m.*, d.*
FROM member m
LEFT JOIN dependent d ON m.pin = d.pin
WHERE m.pin = '123456789012';

-- Modify email_address to explicitly allow NULL
ALTER TABLE member MODIFY COLUMN email_address VARCHAR(50) NULL UNIQUE;

-- Get member with their account information
SELECT m.*, a.email, a.created_at
FROM member m
LEFT JOIN account a ON m.pin = a.pin
WHERE m.pin = '123456789012';

-- Search members by various criteria
SELECT * FROM member
WHERE member_type = 'Direct Contributor'
AND civil_status = 'Single'
AND citizenship = 'Filipino';

-- Count dependents per member
SELECT m.pin, m.member_full_name, COUNT(d.dependent_key) as dependent_count
FROM member m
LEFT JOIN dependent d ON m.pin = d.pin
GROUP BY m.pin, m.member_full_name; 