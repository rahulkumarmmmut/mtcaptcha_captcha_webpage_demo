// Remove dotenv - Vercel handles env vars automatically
const express = require("express");
const https = require("https");
const path = require("path");
const app = express();

// MTCaptcha Private Key - Vercel injects this directly
const MTCAPTCHA_PRIVATE_KEY = process.env.MTCAPTCHA_PRIVATE_KEY;

// In-memory user storage (for demonstration purposes)
const users = [];

// Middleware to parse JSON request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, "public")));

// Route to serve index.html explicitly
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/users", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "users.html"));
});

// Registration route (CAPTCHA validation enforced)
app.post("/register", (req, res) => {
  const { name, email, password, token } = req.body;

  // Quick check for missing fields
  if (!name || !email || !password || !token) {
    return res.json({ success: false, message: "Missing required fields or CAPTCHA token." });
  }

  // Log the token as soon as we know it exists
  console.log("Received token:", token);

  // Construct MTCaptcha verification URL
  const verifyUrl = `https://service.mtcaptcha.com/mtcv1/api/checktoken?privatekey=${MTCAPTCHA_PRIVATE_KEY}&token=${encodeURIComponent(token)}`;

  https.get(verifyUrl, (apiRes) => {
    let data = "";
    // Accumulate data from the MTCaptcha API
    apiRes.on("data", (chunk) => {
      data += chunk;
    });

    apiRes.on("end", () => {
      try {
        const result = JSON.parse(data);

        if (result.success) {
          // CAPTCHA verification succeeded
          const exists = users.find((u) => u.email === email);
          if (exists) {
            return res.json({ success: false, message: "Email is already registered." });
          }

          // Register the new user in memory
          users.push({ name, email, password });
          console.log(`New user registered: ${email}`);
          console.log("------------------------");

          return res.json({ success: true, message: "Registration successful." });
        } else {
          console.warn("CAPTCHA verification failed:", result.fail_codes || result);
          return res.json({ success: false, message: "CAPTCHA verification failed. Please try again." });
        }
      } catch (err) {
        console.error("Error parsing CAPTCHA verification response:", err);
        return res.json({ success: false, message: "Error verifying CAPTCHA. Please try again." });
      }
    });
  }).on("error", (err) => {
    console.error("Request error:", err);
    return res.json({ success: false, message: "Verification service error. Please try again later." });
  });
});

// Export for Vercel
module.exports = app;
