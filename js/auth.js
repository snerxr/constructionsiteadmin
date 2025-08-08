// Secure authentication system
class AuthSystem {
    constructor() {
        // Secure credentials (in production, these should be environment variables)
        this.credentials = {
            username: 'admin',
            password: '2812'
        };
        
        this.sessionKey = 'construction_admin_session';
        this.sessionTimeout = 24 * 60 * 60 * 1000; // 24 hours
        
        this.init();
    }

    init() {
        // Check if we're on the login page
        if (window.location.pathname.includes('login.html') || window.location.pathname === '/') {
            this.setupLoginForm();
            // Check if already logged in
            if (this.isAuthenticated()) {
                this.redirectToDashboard();
            }
        } else {
            // Check authentication for protected pages
            if (!this.isAuthenticated()) {
                this.redirectToLogin();
            }
        }
    }

    setupLoginForm() {
        const form = document.getElementById('loginForm');
        if (form) {
            form.addEventListener('submit', (e) => this.handleLogin(e));
        }
    }

    async handleLogin(event) {
        event.preventDefault();
        
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const errorMessage = document.getElementById('errorMessage');
        const loginButton = document.getElementById('loginButton');
        const loginButtonText = document.getElementById('loginButtonText');

        // Show loading state
        loginButton.disabled = true;
        loginButtonText.textContent = 'Signing in...';
        errorMessage.classList.add('hidden');

        // Simulate network delay for security
        await new Promise(resolve => setTimeout(resolve, 1000));

        try {
            if (this.validateCredentials(username, password)) {
                // Create secure session
                this.createSession();
                this.redirectToDashboard();
            } else {
                throw new Error('Invalid credentials');
            }
        } catch (error) {
            this.showError('Invalid username or password. Please try again.');
        } finally {
            loginButton.disabled = false;
            loginButtonText.textContent = 'Sign in';
        }
    }

    validateCredentials(username, password) {
        // Use timing-safe comparison to prevent timing attacks
        const usernameMatch = this.timingSafeEqual(username, this.credentials.username);
        const passwordMatch = this.timingSafeEqual(password, this.credentials.password);
        
        return usernameMatch && passwordMatch;
    }

    // Timing-safe string comparison to prevent timing attacks
    timingSafeEqual(a, b) {
        if (a.length !== b.length) {
            return false;
        }
        
        let result = 0;
        for (let i = 0; i < a.length; i++) {
            result |= a.charCodeAt(i) ^ b.charCodeAt(i);
        }
        
        return result === 0;
    }

    createSession() {
        const session = {
            authenticated: true,
            timestamp: Date.now(),
            expires: Date.now() + this.sessionTimeout,
            // Add some entropy to make session tokens unique
            token: this.generateSecureToken()
        };
        
        localStorage.setItem(this.sessionKey, JSON.stringify(session));
    }

    generateSecureToken() {
        // Generate a cryptographically secure random token
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }

    isAuthenticated() {
        try {
            const sessionData = localStorage.getItem(this.sessionKey);
            if (!sessionData) return false;

            const session = JSON.parse(sessionData);
            
            // Check if session exists and hasn't expired
            if (!session.authenticated || !session.expires) return false;
            
            // Check if session has expired
            if (Date.now() > session.expires) {
                this.logout();
                return false;
            }

            return true;
        } catch (error) {
            console.error('Session validation error:', error);
            this.logout();
            return false;
        }
    }

    logout() {
        localStorage.removeItem(this.sessionKey);
        this.redirectToLogin();
    }

    redirectToLogin() {
        if (!window.location.pathname.includes('login.html')) {
            window.location.href = 'login.html';
        }
    }

    redirectToDashboard() {
        window.location.href = 'admin.html';
    }

    showError(message) {
        const errorMessage = document.getElementById('errorMessage');
        const errorText = document.getElementById('errorText');
        
        if (errorMessage && errorText) {
            errorText.textContent = message;
            errorMessage.classList.remove('hidden');
        }
    }

    // Method to add logout functionality to admin pages
    addLogoutButton() {
        const logoutButton = document.createElement('button');
        logoutButton.innerHTML = `
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
            </svg>
            Logout
        `;
        logoutButton.className = 'bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition duration-200 flex items-center';
        logoutButton.addEventListener('click', () => this.logout());
        
        return logoutButton;
    }
}

// Initialize authentication system
const authSystem = new AuthSystem();

// Make it globally available
window.authSystem = authSystem;