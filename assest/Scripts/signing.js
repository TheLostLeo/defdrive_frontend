document.addEventListener("DOMContentLoaded", () => {
    const mainBody = document.querySelector(".Main_body");
    const showSignup = document.getElementById("showSignup");
    const showLogin = document.getElementById("showLogin");

    const loginForm = document.getElementById("Login_form");
    const signupForm = document.getElementById("Signup_form");

    const forgotPasswordPopup = document.getElementById("forgotPasswordPopup");
    const forgotPasswordLink = document.querySelector("#Rem_forgot_box a");
    const closePopup = document.querySelector(".close-popup");

    // Ensure popup is hidden on page load
    forgotPasswordPopup.classList.remove("active");

    // Toggle Between Login & Signup
    showSignup.addEventListener("click", () => {
        mainBody.classList.add("signup-mode"); // Moves image to the left
    });

    showLogin.addEventListener("click", () => {
        mainBody.classList.remove("signup-mode"); // Moves image back
    });

    // Forgot Password Popup
    forgotPasswordLink.addEventListener("click", (e) => {
        e.preventDefault();
        forgotPasswordPopup.classList.add("active");
    });

    closePopup.addEventListener("click", () => {
        forgotPasswordPopup.classList.remove("active");
    });

    // Close popup when clicking outside the box
    forgotPasswordPopup.addEventListener("click", (e) => {
        if (e.target === forgotPasswordPopup) {
            forgotPasswordPopup.classList.remove("active");
        }
    });

    // Form Validation & API Calls
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const username = loginForm.querySelector("input[type='text']").value.trim();
        const password = loginForm.querySelector("input[type='password']").value.trim();

        if (!username || !password) {
            showErrorMessage(loginForm, "Username and password are required.");
            return;
        }

        try {
            const response = await fetch("https://your-backend.com/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password })
            });

            const result = await response.json();
            if (response.ok) {
                sessionStorage.setItem("token", result.token);
                sessionStorage.setItem("username", result.username);
                window.location.href = "dashboard.html";
            } else {
                showErrorMessage(loginForm, result.message);
            }
        } catch (error) {
            showErrorMessage(loginForm, "Network error. Please try again.");
        }
    });

    signupForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const name = signupForm.querySelector("input[placeholder='Name']").value.trim();
        const email = signupForm.querySelector("input[type='email']").value.trim();
        const username = signupForm.querySelector("input[placeholder='Username']").value.trim();
        const password = signupForm.querySelector("input[type='password']").value.trim();
        const confirmPassword = signupForm.querySelector("input[placeholder='Confirm Password']").value.trim();

        if (!name || !email || !username || !password || !confirmPassword) {
            showErrorMessage(signupForm, "All fields are required.");
            return;
        }

        if (!validateEmail(email)) {
            showErrorMessage(signupForm, "Invalid email format.");
            return;
        }

        if (password.length < 8) {
            showErrorMessage(signupForm, "Password must be at least 8 characters long.");
            return;
        }

        if (password !== confirmPassword) {
            showErrorMessage(signupForm, "Passwords do not match.");
            return;
        }

        try {
            const response = await fetch("https://your-backend.com/api/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, username, password })
            });

            const result = await response.json();
            if (response.ok) {
                showSuccessMessage(signupForm, "Signup successful! Redirecting...");
                setTimeout(() => {
                    mainBody.classList.remove("signup-mode"); // Switch back to login
                }, 2000);
            } else {
                showErrorMessage(signupForm, result.message);
            }
        } catch (error) {
            showErrorMessage(signupForm, "Network error. Please try again.");
        }
    });

    function showErrorMessage(form, message) {
        removeExistingMessages(form);
        const errorMessage = document.createElement("p");
        errorMessage.className = "error-message";
        errorMessage.textContent = message;
        errorMessage.style.color = "red";
        form.appendChild(errorMessage);
    }

    function showSuccessMessage(form, message) {
        removeExistingMessages(form);
        const successMessage = document.createElement("p");
        successMessage.className = "success-message";
        successMessage.textContent = message;
        successMessage.style.color = "green";
        form.appendChild(successMessage);
    }

    function removeExistingMessages(form) {
        const existingMessage = form.querySelector(".error-message, .success-message");
        if (existingMessage) existingMessage.remove();
    }

    function validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
});



