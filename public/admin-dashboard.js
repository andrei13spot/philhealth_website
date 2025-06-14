// Fetch dashboard statistics
async function fetchDashboardStats() {
    try {
        const response = await fetch('http://localhost:3000/api/admin/dashboard/stats');
        const data = await response.json();
        document.getElementById('totalMembers').textContent = data.totalMembers;
        document.getElementById('totalDependents').textContent = data.totalDependents;
        document.getElementById('activeAccounts').textContent = data.activeAccounts;
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
    }
}

// Fetch recent activities
async function fetchRecentActivities() {
    try {
        const response = await fetch('http://localhost:3000/api/admin/dashboard/activities');
        const activities = await response.json();
        const activityList = document.getElementById('activityList');
        activityList.innerHTML = '';
        activities.forEach(activity => {
            const li = document.createElement('li');
            li.className = 'activity-item';
            const icon = document.createElement('i');
            icon.className = getActivityIcon(activity.type);
            const content = document.createElement('div');
            content.className = 'activity-content';
            const description = document.createElement('p');
            description.textContent = activity.description;
            content.appendChild(description);
            li.appendChild(icon);
            li.appendChild(content);
            activityList.appendChild(li);
        });
    } catch (error) {
        console.error('Error fetching recent activities:', error);
    }
}

// Get activity icon based on type
function getActivityIcon(type) {
    switch (type) {
        case 'dependent_add':
            return 'fas fa-user-friends';
        case 'account_add':
            return 'fas fa-user-plus';
        default:
            return 'fas fa-info-circle';
    }
}

// Add event listeners for quick action buttons
document.getElementById('addMemberBtn').addEventListener('click', () => {
    // Redirect to member registration page
    window.location.href = 'register.html';
});

document.getElementById('generateReportBtn').addEventListener('click', async () => {
    try {
        const response = await fetch('http://localhost:3000/api/admin/generate-report', {
            method: 'POST'
        });
        
        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'philhealth-report.pdf';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();
        } else {
            console.error('Error generating report');
        }
    } catch (error) {
        console.error('Error generating report:', error);
    }
});

// Check system status
async function checkSystemStatus() {
    try {
        // Show loading state
        document.getElementById('dbStatus').className = 'status-indicator loading';
        document.getElementById('apiStatus').className = 'status-indicator loading';
        
        const response = await fetch('http://localhost:3000/api/admin/system-status');
        if (!response.ok) {
            throw new Error('Failed to check system status');
        }
        
        const status = await response.json();
        
        // Update status indicators
        document.getElementById('dbStatus').className = `status-indicator ${status.database ? 'online' : 'offline'}`;
        document.getElementById('apiStatus').className = `status-indicator ${status.apiServices ? 'online' : 'offline'}`;
        
        // Update status text
        document.getElementById('dbStatus').textContent = status.database ? 'Online' : 'Offline';
        document.getElementById('apiStatus').textContent = status.apiServices ? 'Online' : 'Offline';
    } catch (error) {
        console.error('Error checking system status:', error);
        // Set both indicators to offline if there's an error
        document.getElementById('dbStatus').className = 'status-indicator offline';
        document.getElementById('apiStatus').className = 'status-indicator offline';
        document.getElementById('dbStatus').textContent = 'Offline';
        document.getElementById('apiStatus').textContent = 'Offline';
    }
}

// Initialize dashboard
function initializeDashboard() {
    fetchDashboardStats();
    fetchRecentActivities();
    checkSystemStatus();
    
    // Check system status every 30 seconds
    setInterval(checkSystemStatus, 30000);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeDashboard); 