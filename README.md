# PhilHealth Member Portal

This project is a full-stack web application for managing PhilHealth member accounts, dependents, and login functionality. It features a MySQL database, a Node.js/Express backend, and a modern HTML/CSS/JS frontend. The system is designed to be robust, user-friendly, and secure, with real-time input validation and comprehensive CRUD operations.

## Features
- **Member Information Display**: View detailed member information including personal details and contact information.
- **Dependents Management**: Display and manage dependents associated with the member.
- **User Profile Management**: Update and manage user profile information.
- **Password Change**: Change account password with validation for security.
- **Account Deletion**: Option to delete the account with confirmation.
- **Member Registration**: Register new PhilHealth members with detailed information and dependents.
- **Account Creation**: Secure account creation with password hashing and validation.
- **Login System**: Login with email and password, with backend authentication.
- **CRUD Operations**: Full Create, Read, Update, Delete support for members, dependents, and accounts.
- **Input Validation**: Real-time validation for PhilHealth ID (auto-formatting, numeric-only), password strength, and CAPTCHA.
- **Health Check**: `/health` endpoint to monitor server and database status.
- **Modern UI**: Responsive, user-friendly HTML/CSS frontend.

## Setup
1. **Clone the Repository**: Clone the repository to your local machine.
2. **Install Dependencies**: Navigate to the project directory and run `npm install` to install the necessary dependencies.
3. **Database Configuration**: Ensure your MySQL database is set up and update the database configuration in `server.js` if necessary.
4. **Start the Server**: Run `node server.js` to start the server. The application will be available at `http://localhost:3000`.

## Usage
- **Login**: Use your PIN and password to log in to the dashboard.
- **View Member Information**: Navigate to the dashboard to view your member information.
- **Manage Dependents**: View and manage your dependents from the dashboard.
- **Change Password**: Use the user profile page to change your password.
- **Delete Account**: Use the delete account feature to remove your account from the system.

## Technologies Used
- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js, Express.js
- **Database**: MySQL
- **Other Libraries**: bcryptjs (password hashing), cors, node-fetch (for testing)

## Setup Instructions

### 1. Database Setup
- Import the `db.sql` file into your MySQL server to create the `philhealth_db` database and tables.
- Example:
  ```bash
  mysql -u root -p < db.sql
  ```

### 2. Install Dependencies
- Navigate to the project directory:
  ```bash
  cd philhealth-login
  ```
- Install Node.js dependencies:
  ```bash
  npm install
  ```

### 3. Configure Database Connection
- Edit `server.js` and update the MySQL connection settings if needed (default user: `root`, password: `password`).

### 4. Run the Server
- Start the backend server:
  ```bash
  node server.js
  ```
- You should see:
  ```
  Server running on port 3000
  Connected to MySQL successfully!
  Health check available at http://localhost:3000/health
  ```

### 5. Start the Server
- Open your browser and go to [http://localhost:3000/health](http://localhost:3000/health) to check server and database status.

## Usage

- Access the frontend via `public/index.html` or `public/create-account.html`.
- The PhilHealth ID input only accepts numbers and auto-formats as `XX-XXXXXXXX-X`.
- Passwords must be strong (see UI for requirements).
- CAPTCHA is required for registration and login.
- All backend endpoints are RESTful and return JSON.

## Project Structure

```
philhealth-login/
├── db.sql                # Database schema
├── crud_operations.sql   # Example CRUD SQL queries
├── server.js             # Express backend server
├── test_crud.js          # Node.js CRUD test script
├── test_server.js        # Node.js endpoint test script
├── package.json          # Node.js dependencies
├── public/               # Frontend HTML/CSS/JS
│   ├── index.html
│   ├── create-account.html
│   ├── register.js
│   ├── script.js
│   └── ...
└── README.md             # This file
```

## Notable Implementation Details

- **PhilHealth ID Input**: Only numbers allowed, auto-formats as you type, and validates format on blur.
- **CAPTCHA**: Randomly generated, case-insensitive, and required for form submission.
- **Health Check**: `/health` endpoint checks both server and database connectivity.
- **Error Handling**: Backend has robust error and connection handling, with retry logic for MySQL.
- **Security**: Passwords are hashed with bcryptjs before storing in the database.

## Troubleshooting

- If you see `ECONNREFUSED` errors, make sure the server is running and the database is accessible.
- Always start the server before running test scripts.
- Use the `/health` endpoint to verify server/database status.
- Check the console for detailed error logs if something goes wrong.

## Author
This project was built as a hands-on coding exercise, with step-by-step improvements, testing, and best practices applied throughout. If you have questions or want to extend the project, feel free to reach out!
