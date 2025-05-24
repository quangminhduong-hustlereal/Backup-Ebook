import express from 'express';
import { check, body } from 'express-validator';
import { ERole } from '../generated/prisma/index.js';
import { register, login, getMe } from '../controllers/auth.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post(
    '/register',
    [
        check('name', 'Name must not be empty').not().isEmpty().trim().escape(),
        check('email', 'Please provide a valid email').isEmail().normalizeEmail(),
        check('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
        check('phoneNumber', 'Phone number must not be empty').not().isEmpty().trim().escape(),
        body('role').optional().isIn(Object.values(ERole)).withMessage('Invalid role'),
    ],
    register
);

router.post(
    '/login',
    [
        check('email', 'Please provide a valid email').isEmail().normalizeEmail(),
        check('password', 'Password must not be empty').exists(),
    ],
    login
);

router.get(
    '/me',
    authMiddleware,
    getMe
);

export default router;
