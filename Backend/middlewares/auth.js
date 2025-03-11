const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    const authHeader = req.header("Authorization");

    if (!authHeader) return res.status(401).json({ message: "Access Denied" });

    // Ensure it's in "Bearer TOKEN" format
    const token = authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Invalid Token Format" });

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified; // Attach user data to request
        next();
    } catch (err) {
        res.status(400).json({ message: "Invalid Token" });
    }
};

module.exports = authMiddleware;
