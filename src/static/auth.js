document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const guestBtn = document.getElementById('guestBtn');
    const registerLink = document.getElementById('registerLink');
    const errorMessage = document.getElementById('errorMessage');

    let isLoginMode = true;

    // Handle guest mode
    guestBtn.addEventListener('click', async () => {
        try {
            const response = await fetch('/api/auth/guest', {
                method: 'POST',
                credentials: 'include'
            });

            if (response.ok) {
                window.location.href = '/settings.html';
            } else {
                const data = await response.json();
                showError(data.error || 'Failed to create guest session');
            }
        } catch (error) {
            showError('Network error. Please try again.');
        }
    });

    // Switch to register mode
    registerLink.addEventListener('click', (e) => {
        e.preventDefault();
        switchToRegister();
    });

    // Handle form submission
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (isLoginMode) {
            await handleLogin();
        } else {
            await handleRegister();
        }
    });

    async function handleLogin() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ username, password })
            });

            const result = await response.json();

            if (response.ok) {
                window.location.href = '/settings.html';
            } else {
                showError(result.error || 'Login failed');
            }
        } catch (error) {
            showError('Network error. Please try again.');
        }
    }

    async function handleRegister() {
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        if (!username || !email || !password) {
            showError('Please fill in all fields');
            return;
        }

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ username, email, password })
            });

            const result = await response.json();

            if (response.ok) {
                window.location.href = '/settings.html';
            } else {
                showError(result.error || 'Registration failed');
            }
        } catch (error) {
            showError('Network error. Please try again.');
        }
    }

    function switchToRegister() {
        isLoginMode = false;
        
        // Update title
        document.querySelector('.subtitle').textContent = 'Register';
        
        // Add email field
        const emailGroup = document.createElement('div');
        emailGroup.className = 'form-group';
        emailGroup.innerHTML = '<input type="email" id="email" class="form-control" placeholder="Email" required>';
        
        const passwordGroup = document.querySelector('#password').parentElement;
        passwordGroup.parentElement.insertBefore(emailGroup, passwordGroup);
        
        // Update button text
        document.querySelector('button[type="submit"]').textContent = 'Register';
        
        // Update link
        registerLink.textContent = 'Login';
        registerLink.parentElement.innerHTML = 'Already have an account? <a href="#" id="loginLink">Login</a>';
        
        // Add new event listener for login link
        document.getElementById('loginLink').addEventListener('click', (e) => {
            e.preventDefault();
            switchToLogin();
        });
    }

    function switchToLogin() {
        isLoginMode = true;
        
        // Update title
        document.querySelector('.subtitle').textContent = 'Login';
        
        // Remove email field
        const emailGroup = document.getElementById('email').parentElement;
        if (emailGroup) {
            emailGroup.remove();
        }
        
        // Update button text
        document.querySelector('button[type="submit"]').textContent = 'Login';
        
        // Update link
        document.querySelector('#loginLink').parentElement.innerHTML = 'Don\'t have an account? <a href="#" id="registerLink">Register</a>';
        
        // Add new event listener for register link
        document.getElementById('registerLink').addEventListener('click', (e) => {
            e.preventDefault();
            switchToRegister();
        });
    }

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
        setTimeout(() => {
            errorMessage.style.display = 'none';
        }, 5000);
    }
});

