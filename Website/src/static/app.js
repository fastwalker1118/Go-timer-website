// App.js - Main application router
document.addEventListener('DOMContentLoaded', async () => {
    // Get current page path
    const currentPath = window.location.pathname;
    
    // If we're on timer.html, don't redirect - allow direct access
    if (currentPath.includes('timer.html')) {
        return;
    }
    
    // Check authentication status only for index.html
    if (currentPath === '/' || currentPath.includes('index.html')) {
        try {
            const response = await fetch('/api/auth/me', { credentials: 'include' });
            
            if (response.ok) {
                // User is authenticated, redirect to settings
                window.location.href = '/settings.html';
            } else {
                // User is not authenticated, redirect to login
                window.location.href = '/login.html';
            }
        } catch (error) {
            console.error('Error checking authentication:', error);
            // On error, redirect to login
            window.location.href = '/login.html';
        }
    }
});

