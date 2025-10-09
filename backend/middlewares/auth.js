const {getUser} = require('../service/auth')

async function restrictToLoggedinUserOnly(req, res, next) {
    const userUid = req.cookies?.uid;
    
    console.log('Cookies received:', req.cookies); // Debug log
    console.log('userUid from cookie:', userUid); // Debug log
     
    if (!userUid) {
        console.log('No userUid cookie found');
        return res.status(401).json({ error: "Authentication required" }); // ✅ Use proper status code
    }
    
    const user = getUser(userUid);
    console.log('User from token:', user); // Debug log

    if (!user) {
        console.log('Invalid or expired token');
        return res.status(401).json({ error: "Invalid or expired token" }); // ✅ Use proper status code
    }
    
    req.user = user;
    console.log('USER authenticated:', req.user);
    next();
}

async function checkAuth(req, res, next) {
    const userUid = req.cookies?.uid;
    const user = getUser(userUid);
    req.user = user; // This can be null, that's fine for checkAuth
    next();
}

module.exports = {
    restrictToLoggedinUserOnly,
    checkAuth
};