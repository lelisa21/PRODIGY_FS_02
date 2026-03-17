const roleMiddleware = (...roles) => {
    return (req, res, next) => {
        const userRole = req.user.role; 
        if (!roles.includes(userRole)) {
           throw new AppError("Forbidden: You don't have permission to access this resource", 403);
        }
        next();
    };
};

export default roleMiddleware;
