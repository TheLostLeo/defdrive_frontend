document.addEventListener('DOMContentLoaded', () => {
    const authButton = document.getElementById('authButton');
    const startSharingBtn = document.querySelector('.cta-button'); // The "Start Sharing Now" button
    let isLoggedIn = false;
    if (sessionStorage.getItem("username")) {
       isLoggedIn = true;
   } 
   else {
      isLoggedIn = false;
       }

    // Update the nav button (Login or Share Files)
    if (authButton) {
        authButton.textContent = isLoggedIn ? "Share Files" : "Login";
        authButton.onclick = () => window.location.href = isLoggedIn ? "pages/share.html" : "pages/login.html";
    }

    // Update "Start Sharing Now" button behavior
    if (startSharingBtn) {
        startSharingBtn.onclick = () => {
            window.location.href = isLoggedIn ? "pages/share.html" : "pages/login.html";
        };
    }
});

