import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).send({ 
            message: 'Token missing' 
        });
    }

    try {
        const secret = process.env.JWT_SECRET;
        const decoded = jwt.verify(token, secret);
        
        req.user = decoded;
        req.userId = decoded?.id;
        req.userRole = decoded?.role;
        
        next(); 
    } catch (error) {
        return res.status(403).send({
            message: 'Invalid or expired token' 
        });
    }
};
