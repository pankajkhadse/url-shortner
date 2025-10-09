const { v4: uuidv4 } = require('uuid');
const User = require("../models/user")
const {setUser} = require('../service/auth')

async function handleUserSignup(req, res) {
    const { name, email, password } = req.body;

    // ✅ Validate required fields
    if (!name || !email || !password) {
        return res.status(400).json({ 
            success: false, 
            message: "All fields are required: name, email, password" 
        });
    }

    // ✅ Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ 
            success: false, 
            message: "Please enter a valid email address" 
        });
    }

    // ✅ Validate password length
    if (password.length < 6) {
        return res.status(400).json({ 
            success: false, 
            message: "Password must be at least 6 characters long" 
        });
    }

    try {
        // ✅ Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ // 409 Conflict
                success: false,
                message: "User already exists with this email address"
            });
        }

        // ✅ Create new user
        await User.create({
            name,
            email,
            password
        });

        // ✅ Success response
        res.status(201).json({
            success: true,
            message: "User registered successfully! You can now log in.",
            signup: "success"
        });

    } catch (error) {
        console.error("Signup error:", error);
        
        // ✅ Handle MongoDB duplicate key error (additional safety)
        if (error.code === 11000 || error.keyPattern?.email) {
            return res.status(409).json({
                success: false,
                message: "User already exists with this email address"
            });
        }

        // ✅ Handle other errors
        res.status(500).json({
            success: false,
            message: "Internal server error during registration"
        });
    }
}

async function handleUserSignin(req, res) {
  const { email, password } = req.body;
  const user = await User.findOne({ email, password });

  if (!user) {
    return res.status(401).json({ success: false, message: "User not found" });
  }

  const token = setUser(user);
  res.cookie("uid", token, { httpOnly: true });

  // ✅ Return the token and basic user info in response
  return res.json({
    success: true,
    message: "Login successful",
    token: token, // 🔥 this is what the frontend will store
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
  });
}

async function handleUserLogout(req, res) {
  try {
    // Clear the cookie
    res.clearCookie("uid", {
      httpOnly: true,
      sameSite: 'lax', // or 'none' if using cross-site
      secure: process.env.NODE_ENV === 'production' // use secure in production
    });
    
    return res.json({
      success: true,
      message: "Logout successful"
    });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({ success: false, message: "Logout failed" });
  }
}

module.exports = {
    handleUserSignup,
    handleUserSignin,
    handleUserLogout // ✅ Export the new function
}

