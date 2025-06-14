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

## Additional Functionality Overview

### Admin Features
- **Admin Dashboard**: View statistics (total members, dependents, active accounts) and recent activities.
- **Member Management**: Search, filter, view, edit, and generate reports for members. Supports pagination and advanced filtering (by PIN, name, email, mobile, type, status, citizenship).
- **Dependents Management**: Search, filter, view, edit, and generate reports for dependents. Supports filtering by dependent name, PIN, relationship, citizenship, and PWD status. Pagination included.
- **Account Management**: View and manage user accounts, including creation and deletion.
- **Reports**: Generate PDF reports for members and dependents, including all relevant details.
- **Documentation**: Access system documentation from the admin sidebar.

### Search, Filtering, and Pagination
- **Dynamic Search**: All management tables support dynamic search with multiple filters. Search is case-insensitive and supports partial matches.
- **Advanced Filtering**: Filter by relationship, citizenship, PWD status (dependents), and by type, status, citizenship (members).
- **Pagination**: All tables support pagination with navigation controls and current page display.

### CRUD Operations
- **Create**: Add new members and dependents during registration.
- **Read**: View detailed information for members and dependents, including all fields and relationships.
- **Update**: Edit member and dependent details with real-time validation and feedback.
- **Delete**: Remove accounts and dependents with confirmation dialogs.

### Validation and Error Handling
- **Input Validation**: All forms validate input in real-time (e.g., PhilHealth ID, email, password strength, date of birth not in the future).
- **Server-Side Validation**: Backend checks for duplicate PINs, valid dates, and required fields.
- **Error Handling**: User-friendly error messages for all failed operations, including database and network errors.

### Security
- **Password Hashing**: All passwords are hashed using bcryptjs before storage.
- **CAPTCHA**: Required for registration and login to prevent bots.
- **Session Management**: Secure login and logout flows.

### Reporting
- **PDF Generation**: Admins can generate PDF reports for members and dependents, including all relevant details and recent activities.
- **Downloadable Reports**: Reports are downloadable directly from the admin interface.

### UI/UX
- **Responsive Design**: All pages are mobile-friendly and adapt to different screen sizes.
- **Modern UI**: Clean, intuitive interface with clear navigation and feedback.
- **Sidebar Navigation**: Persistent sidebar for quick access to all admin features.
- **Accordion Sections**: Dashboard uses accordions for organized display of member, contact, and dependent information.

### Backend Endpoints (RESTful API)
- **/api/admin/members/search**: Search and filter members with pagination.
- **/api/admin/members/:pin**: Get, update, or report on a specific member.
- **/api/admin/dependents/search**: Search and filter dependents with pagination.
- **/api/admin/dependents/:dependent_key**: Get, update, or report on a specific dependent.
- **/api/admin/dashboard/stats**: Get dashboard statistics.
- **/api/admin/dashboard/activities**: Get recent activities.
- **/api/member-info**: Get member and dependents info for the logged-in user.
- **/api/user-profile**: Get user profile info.
- **/api/update-member-contact**: Update member contact details.
- **/api/update-dependents**: Update dependents for a member.
- **/api/check-pin**: Check if a PIN exists.
- **/api/check-account**: Check if an account exists for a PIN.
- **/health**: Health check for server and database.

### SQL Query Complexity
- **Simple**: Single-table queries (e.g., check PIN, get member by PIN).
- **Difficult**: Any query with a JOIN (e.g., admin dependents search, member search with dependent count, dependent details with member info).
- **All queries are parameterized to prevent SQL injection.**

### Miscellaneous
- **Graceful Shutdown**: Server handles SIGTERM and SIGINT for safe shutdown.
- **Robust Error Logging**: All errors are logged with details for easier debugging.
- **Extensible Structure**: Codebase is organized for easy extension and maintenance.

---

*This section was added to provide a comprehensive overview of all backend and frontend functionalities, including admin features, search, filtering, pagination, validation, error handling, and reporting, as implemented in the project codebase.*

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
