import express from 'express';
import { check, body } from 'express-validator';
import { register, login, getMe, sendOtp } from '../controllers/auth.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post(
    '/register',
    [
        check('email', 'Please provide a valid email').isEmail().normalizeEmail(),
        check('otp', 'OTP must be 6 digits').isLength({ min: 6, max: 6 }).isNumeric(),
        check('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
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

router.post(
    '/send-otp',
    [
        check('email', 'Please provide a valid email').isEmail().normalizeEmail(),
        check('name', 'Name must not be empty').not().isEmpty().trim().escape(),
        check('phoneNumber', 'Phone number must not be empty').not().isEmpty().trim().escape(),
    ],
    sendOtp
);

export default router;
