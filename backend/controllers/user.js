const User = require("../models/user");
const { setUser } = require('../service/auth');
const bcrypt = require('bcrypt'); // <-- Import bcrypt

// --- SIGN UP ---
async function handleUserSignup(req, res) {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }
    // You can keep your other validations (email format, password length) here...

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: "User with this email already exists" });
        }

        // 🔒 1. Hash the password before saving
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await User.create({
            name,
            email,
            password: hashedPassword, // Store the hashed password
        });

        return res.status(201).json({ message: "User registered successfully!" });

    } catch (error) {
        console.error("Signup error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}


// --- SIGN IN ---
async function handleUserSignin(req, res) {
    const { email, password } = req.body;

    // 🔒 2. Find user by email only
    const user = await User.findOne({ email });
    if (!user) {
        // Use a generic message to prevent attackers from knowing which emails are registered
        return res.status(401).json({ message: "Invalid email or password" });
    }

    // 🔒 3. Compare the provided password with the stored hash
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = setUser(user);

    // 🍪 4. Set the cookie with correct cross-origin attributes
    res.cookie("uid", token, {
        httpOnly: true,   // Protects against XSS attacks
        secure: true,     // REQUIRED for cross-site cookies
        sameSite: "None"  // Allows cross-origin requests
    });

    return res.json({
        success: true,
        message: "Login successful",
        token: token, // It's fine to send the token for frontend state management
    });
}


// --- LOGOUT ---
async function handleUserLogout(req, res) {
    try {
        // 🍪 5. Clear the cookie using the SAME attributes it was set with
        res.clearCookie("uid", {
            httpOnly: true,
            secure: true,
            sameSite: "None"
        });
        
        return res.json({ success: true, message: "Logout successful" });
    } catch (error) {
        console.error("Logout error:", error);
        return res.status(500).json({ success: false, message: "Logout failed" });
    }
}

module.exports = {
    handleUserSignup,
    handleUserSignin,
    handleUserLogout
};