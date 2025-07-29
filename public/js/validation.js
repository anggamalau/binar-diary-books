// Client-side form validation
document.addEventListener('DOMContentLoaded', function() {
    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    // Password validation
    const validatePassword = (password) => {
        return password.length >= 6;
    };
    
    // Name validation
    const validateName = (name) => {
        return name.trim().length >= 2;
    };
    
    // Real-time validation for registration form
    const registerForm = document.querySelector('form[action="/auth/register"]');
    if (registerForm) {
        const nameInput = registerForm.querySelector('#name');
        const emailInput = registerForm.querySelector('#email');
        const passwordInput = registerForm.querySelector('#password');
        const confirmPasswordInput = registerForm.querySelector('#confirmPassword');
        
        // Name validation
        if (nameInput) {
            nameInput.addEventListener('blur', function() {
                if (!validateName(this.value)) {
                    this.classList.add('is-invalid');
                    showError(this, 'Name must be at least 2 characters long');
                } else {
                    this.classList.remove('is-invalid');
                    this.classList.add('is-valid');
                    hideError(this);
                }
            });
        }
        
        // Email validation
        if (emailInput) {
            emailInput.addEventListener('blur', function() {
                if (!emailRegex.test(this.value)) {
                    this.classList.add('is-invalid');
                    showError(this, 'Please enter a valid email address');
                } else {
                    this.classList.remove('is-invalid');
                    this.classList.add('is-valid');
                    hideError(this);
                }
            });
        }
        
        // Password validation
        if (passwordInput) {
            passwordInput.addEventListener('blur', function() {
                if (!validatePassword(this.value)) {
                    this.classList.add('is-invalid');
                    showError(this, 'Password must be at least 6 characters long');
                } else {
                    this.classList.remove('is-invalid');
                    this.classList.add('is-valid');
                    hideError(this);
                }
                
                // Check confirm password if it has value
                if (confirmPasswordInput && confirmPasswordInput.value) {
                    confirmPasswordInput.dispatchEvent(new Event('blur'));
                }
            });
        }
        
        // Confirm password validation
        if (confirmPasswordInput) {
            confirmPasswordInput.addEventListener('blur', function() {
                if (this.value !== passwordInput.value) {
                    this.classList.add('is-invalid');
                    showError(this, 'Passwords do not match');
                } else if (this.value) {
                    this.classList.remove('is-invalid');
                    this.classList.add('is-valid');
                    hideError(this);
                }
            });
        }
    }
    
    // Real-time validation for login form
    const loginForm = document.querySelector('form[action="/auth/login"]');
    if (loginForm) {
        const emailInput = loginForm.querySelector('#email');
        const passwordInput = loginForm.querySelector('#password');
        
        if (emailInput) {
            emailInput.addEventListener('blur', function() {
                if (!emailRegex.test(this.value)) {
                    this.classList.add('is-invalid');
                    showError(this, 'Please enter a valid email address');
                } else {
                    this.classList.remove('is-invalid');
                    this.classList.add('is-valid');
                    hideError(this);
                }
            });
        }
        
        if (passwordInput) {
            passwordInput.addEventListener('blur', function() {
                if (!this.value) {
                    this.classList.add('is-invalid');
                    showError(this, 'Password is required');
                } else {
                    this.classList.remove('is-invalid');
                    this.classList.add('is-valid');
                    hideError(this);
                }
            });
        }
    }
    
    // Entry form validation
    const entryForms = document.querySelectorAll('form[action*="/entries/"]');
    entryForms.forEach(function(form) {
        const titleInput = form.querySelector('#title');
        
        if (titleInput) {
            titleInput.addEventListener('blur', function() {
                if (!this.value.trim()) {
                    this.classList.add('is-invalid');
                    showError(this, 'Title is required');
                } else {
                    this.classList.remove('is-invalid');
                    this.classList.add('is-valid');
                    hideError(this);
                }
            });
        }
    });
    
    // Helper functions
    function showError(input, message) {
        let feedback = input.nextElementSibling;
        if (!feedback || !feedback.classList.contains('invalid-feedback')) {
            feedback = document.createElement('div');
            feedback.className = 'invalid-feedback';
            input.parentNode.insertBefore(feedback, input.nextSibling);
        }
        feedback.textContent = message;
    }
    
    function hideError(input) {
        const feedback = input.nextElementSibling;
        if (feedback && feedback.classList.contains('invalid-feedback')) {
            feedback.remove();
        }
    }
    
    // Clear validation classes on input
    document.querySelectorAll('.form-control').forEach(function(input) {
        input.addEventListener('input', function() {
            this.classList.remove('is-invalid', 'is-valid');
        });
    });
});