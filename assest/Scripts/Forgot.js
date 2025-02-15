document.addEventListener("DOMContentLoaded", function () {
    const sendEmailBtn = document.getElementById("sent_btn");
    const emailSection = document.getElementById("Forget_box");
    const otpSection = document.getElementById("code-section");

    sendEmailBtn.addEventListener("click", function (event) {
        event.preventDefault(); // Prevent form submission

        // Hide email section with fade-out effect
        emailSection.classList.add("hidden");

        // Show OTP section after a slight delay for a smooth transition
        setTimeout(() => {
            otpSection.classList.remove("hidden");
            otpSection.classList.add("visible");
        }, 500); // Matches CSS transition duration
    });
});
