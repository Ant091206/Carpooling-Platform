/**
 * Temporary Mock Authentication Middleware
 * This will be replaced by the actual JWT authentication middleware
 * when Module 1 (Authentication) is completed.
 */
const mockAuth = (req, res, next) => {
    req.user = {
        id: 1 // Hardcoded user ID for testing Vehicle Management independently
    };
    next();
};

module.exports = mockAuth;
