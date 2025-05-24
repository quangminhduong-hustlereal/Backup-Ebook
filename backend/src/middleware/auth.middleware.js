import jwt from 'jsonwebtoken';
import { prisma } from '../index.js';

export const authMiddleware = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded.user;
            next();
        } catch (error) {
            console.error('Token verification error:', error.message);
            if (error.name === 'JsonWebTokenError') {
                return res.status(401).json({ message: 'Invalid token.' });
            }
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ message: 'Token has expired.' });
            }
            return res.status(401).json({ message: 'Unauthorized.' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized, token not found.' });
    }
};
