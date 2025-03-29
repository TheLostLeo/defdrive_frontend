const API_BASE_URL = "https://defdb.wlan0.in/api/";
document.addEventListener("DOMContentLoaded", () => {
    // Get references to key elements
    const mainBody = document.querySelector(".Main_body");
    const showSignup = document.getElementById("showSignup");
    const showLogin = document.getElementById("showLogin");
  
    const loginForm = document.getElementById("Login_form");
    const signupForm = document.getElementById("Signup_form");
  
    const forgotPasswordPopup = document.getElementById("forgotPasswordPopup");
    const forgotPasswordLink = document.querySelector("#Rem_forgot_box a");
    const closePopup = document.querySelector(".close-popup");
  
    // Hide forgot password popup on page load
    forgotPasswordPopup.classList.remove("active");
  
    // ----- Toggle Between Login & Signup -----
    showSignup.addEventListener("click", () => {
      mainBody.classList.add("signup-mode");
    });
  
    showLogin.addEventListener("click", () => {
      mainBody.classList.remove("signup-mode");
    });
  
    // ----- Forgot Password Popup -----
    forgotPasswordLink.addEventListener("click", (e) => {
      e.preventDefault();
      forgotPasswordPopup.classList.add("active");
    });
  
    closePopup.addEventListener("click", () => {
      forgotPasswordPopup.classList.remove("active");
    });
  
    forgotPasswordPopup.addEventListener("click", (e) => {
      if (e.target === forgotPasswordPopup) {
        forgotPasswordPopup.classList.remove("active");
      }
    });
  
    // ----- Signup Form Submission -----
    signupForm.addEventListener("submit", async (e) => {
      e.preventDefault();
  
      const name = signupForm.querySelector("input[placeholder='Name']").value.trim();
      const email = signupForm.querySelector("input[type='email']").value.trim();
      const username = signupForm.querySelector("input[placeholder='Username']").value.trim();
      const password = signupForm.querySelector("input[type='password']").value.trim();
      const confirmPassword = signupForm.querySelector("input[placeholder='Confirm Password']").value.trim();
  
      // Validate required fields
      if (!name || !email || !username || !password || !confirmPassword) {
        showErrorMessage(signupForm, "All fields are required.");
        return;
      }
  
      // Validate name: only letters and spaces allowed
      if (!/^[A-Za-z\s]+$/.test(name)) {
        showErrorMessage(signupForm, "Name should only contain letters and spaces.");
        return;
      }
  
      // Validate email format
      if (!validateEmail(email)) {
        showErrorMessage(signupForm, "Invalid email format.");
        return;
      }
  
      // Validate password constraints
      const requirements = [
        { regex: /.{8,}/, message: "At least 8+ characters" },
        { regex: /[A-Z]/, message: ",1 Uppercase letter" },
        { regex: /[0-9]/, message: ",1 number" },
        { regex: /[!@#$%^&*(),.?":{}|<>]/, message: ", 1 special character" },
      ];
  
      const unmetRequirements = requirements.filter((req) => !req.regex.test(password));
      if (unmetRequirements.length > 0) {
        const unmetMessages = unmetRequirements.map((req) => req.message).join(", ");
        showErrorMessage(signupForm, `Password must have: ${unmetMessages}`);
        return;
      }
  
      // Validate password confirmation
      if (password !== confirmPassword) {
        showErrorMessage(signupForm, "Passwords do not match.");
        return;
      }
  
      // JSON payload for signup:
      // {
      //   "name": "John Doe",
      //   "email": "john.doe@example.com",
      //   "username": "johndoe",
      //   "password": "password123"
      // }
      try {
        const response = await fetch(`${API_BASE_URL}signup`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, username, password })
        });
  
        const result = await response.json();
        if (response.ok) {
          showSuccessMessage(signupForm, "Signup successful! Redirecting...");
          setTimeout(() => {
            mainBody.classList.remove("signup-mode");
          }, 2000);
        } else {
          // Display error message from API (handles both 400 and 500 errors)
          showErrorMessage(signupForm, result.error || result.message);
        }
      } catch (error) {
        showErrorMessage(signupForm, "Network error. Please try again.");
      }
    });
  
    // ----- Login Form Submission -----
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
  
      const username = loginForm.querySelector("#loginUsername").value.trim();
      const password = loginForm.querySelector("#loginPassword").value.trim();
  
      if (!username || !password) {
        showErrorMessage(loginForm, "Username and password are required.");
        return;
      }
  
      try {
        const response = await fetch(`${API_BASE_URL}login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password })
        });
  
        const result = await response.json();
        if (response.ok) {
          // Save token and username in sessionStorage
          sessionStorage.setItem("token", result.token);
          sessionStorage.setItem("username", result.user.username);
          sessionStorage.setItem("loggedin", "yes");
          // Redirect to share page
          window.location.href = "./share.html";
        } else {
          showErrorMessage(loginForm, result.error || result.message);
        }
      } catch (error) {
        showErrorMessage(loginForm, "Network error. Please try again.");
      }
    });
  
    // ----- Helper Functions -----
    function showErrorMessage(form, message) {
      removeExistingMessages(form);
      const errorMessage = document.createElement("p");
      errorMessage.className = "error-message";
      errorMessage.textContent = message;
      errorMessage.style.color = "red";
      errorMessage.style.fontSize = "12px"; // Make the font size smaller
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








