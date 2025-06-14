CREATE DATABASE IF NOT EXISTS philhealth_db;
USE philhealth_db;

CREATE TABLE member (
    pin VARCHAR(20) PRIMARY KEY NOT NULL,
    member_full_name VARCHAR(50) NOT NULL,
    mother_full_name VARCHAR(50) NOT NULL,
    spouse_full_name VARCHAR(50),
    date_of_birth DATE NOT NULL,
    place_of_birth VARCHAR(50) NOT NULL,
    sex CHAR(1) NOT NULL CHECK (sex IN ('M', 'F')),
    civil_status VARCHAR(20) NOT NULL CHECK (civil_status IN (
        'Single', 'Married', 'Annulled', 'Widow/er', 'Legally Separated'
    )),
    citizenship VARCHAR(50) NOT NULL CHECK (citizenship IN (
        'Filipino', 'Dual Citizen', 'Foreign National'
    )),
    philsys_id VARCHAR(20) UNIQUE,
    tin VARCHAR(20) UNIQUE, 
    permanent_address VARCHAR(100) NOT NULL,
    mailing_address VARCHAR(100) NOT NULL,
    home_no VARCHAR(20),
    mobile_no VARCHAR(20) NOT NULL UNIQUE,
    business_dl VARCHAR(20),
    email_address VARCHAR(50) NULL UNIQUE,
    member_type VARCHAR(50) NOT NULL CHECK (member_type IN (
        'Direct Contributor', 'Indirect Contributor'
    ))
);

CREATE TABLE dependent (
    dependent_key INT AUTO_INCREMENT PRIMARY KEY, -- changed from varchar to int
    pin VARCHAR(20),
    dependent_full_name VARCHAR(50) NOT NULL,
    dependent_relationship VARCHAR(25) NOT NULL CHECK (dependent_relationship IN (
        'Spouse', 'Child', 'Parent', 'Other'
    )),
    dependent_date_of_birth DATE NOT NULL,
    dependent_citizenship VARCHAR(50) NOT NULL,
    dependent_pwd VARCHAR(3) NOT NULL CHECK (dependent_pwd IN ('yes', 'no')),
    FOREIGN KEY(pin) REFERENCES member(pin) ON DELETE CASCADE
);

-- Created account table for login credentials
CREATE TABLE account (
    account_id INT AUTO_INCREMENT PRIMARY KEY,
    pin VARCHAR(20) NOT NULL,
    email VARCHAR(50) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(pin) REFERENCES member(pin) ON DELETE CASCADE,
    UNIQUE(email)
); 


