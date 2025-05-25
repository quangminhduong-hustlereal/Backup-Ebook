import express from 'express';
import { check, body } from 'express-validator';
import { register, login, getMe, sendOtp } from '../controllers/auth.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import passport from 'passport';
import jwt from 'jsonwebtoken';

const router = express.Router();

router.get(
    '/google',
    passport.authenticate('google', {
        scope: ['profile', 'email'],
        session: false,
        prompt: 'select_account'
    })
);

router.get(
    '/google/callback',
    passport.authenticate('google', {
        failureRedirect: `${process.env.FRONTEND_URL}/login?error=google_failed`,
        session: false,
    }),
    (req, res) => {
        if (!req.user) {
            return res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
        }

        const payload = {
            user: {
                id: req.user.id,
                email: req.user.email,
                role: req.user.role,
            },
        };

        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
        );

        res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
    }
);

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
