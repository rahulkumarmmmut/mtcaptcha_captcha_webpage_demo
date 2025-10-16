document.addEventListener("DOMContentLoaded", () => {
    const registerForm = document.getElementById("registerForm");
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const name = document.getElementById("registerName").value.trim();
      const email = document.getElementById("registerEmail").value.trim();
      const password = document.getElementById("registerPassword").value;
      const confirmPassword = document.getElementById("registerConfirmPassword").value;
      
      if (!name || !email || !password) {
        alert("Please fill out all required fields.");
        return;
      }
      
      if (password !== confirmPassword) {
        alert("Passwords do not match. Please try again.");
        return;
      }
      
      const captchaField = document.querySelector('input[name="mtcaptcha-verifiedtoken"]');
      if (!captchaField || !captchaField.value) {
        alert("Please complete the CAPTCHA verification.");
        return;
      }
      
      const captchaToken = captchaField.value;
      const data = { name, email, password, token: captchaToken };
      
      try {
        const response = await fetch("/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        
        const result = await response.json();
        
        if (result.success) {
          alert("Registration successful!");
        } else {
          alert("Registration failed: " + (result.message || "Unknown error."));
        }
      } catch (error) {
        console.error("Error during registration:", error);
        alert("An error occurred. Please try again.");
      }
    });
});
