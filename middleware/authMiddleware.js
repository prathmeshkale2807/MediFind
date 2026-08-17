export const adminOnly = (req, res, next) => {

    // authenticateToken must run before this middleware

    if (!req.user) {
        return res.status(401).json({
            message: "Authentication required. Please login."
        });
    }

    if (req.user.role !== "admin") {
        return res.status(403).json({
            message: "Access denied. Admin privileges required."
        });
    }

    next();
};