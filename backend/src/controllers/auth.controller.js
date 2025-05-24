import { prisma } from '../index.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import { ERole } from '../generated/prisma/index.js';
import { sendOtpEmail } from '../services/emailService.js';
import { generateOTP, generateOtpExpiry, isOtpExpired } from '../utils/otpHelper.js';

export const sendOtp = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, name, phoneNumber } = req.body;
    const lowerCaseEmail = email.toLowerCase();

    try {
        const existingUser = await prisma.user.findUnique({
            where: { email: lowerCaseEmail },
        });

        if (existingUser && existingUser.isEmailVerified) {
             if (existingUser.password) {
            return res.status(400).json({ message: 'This email has already been registered. Please log in.' });
             }
             return res.status(400).json({ message: 'This email has already been registered.' });
        }

        const otp = generateOTP();
        const otpExpiry = generateOtpExpiry();

        await prisma.user.upsert({
            where: { email: lowerCaseEmail },
            update: {
            otpCode: otp,
            otpExpiry: otpExpiry,
            name: name,
            phoneNumber: phoneNumber,
            },
            create: {
            email: lowerCaseEmail,
            name: name,
            phoneNumber: phoneNumber,
            otpCode: otp,
            otpExpiry: otpExpiry,
            role: ERole.Customer,
            status: true,
            isEmailVerified: false,
            }
        });

        await sendOtpEmail(lowerCaseEmail, otp);

        res.status(200).json({ message: 'OTP code has been sent to your email. Please check your inbox.' });

        } catch (error) {
        console.error('Error sending OTP:', error);
        if (error.message === 'Could not send email.') {
             return res.status(500).json({ message: 'Could not send OTP email. Please try again or contact support.' });
        }
        res.status(500).json({ message: 'Server error, please try again later.' });
    }
};

export const register = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, otp, password } = req.body;
    const lowerCaseEmail = email.toLowerCase();

    try {
        const user = await prisma.user.findUnique({
            where: { email: lowerCaseEmail },
        });

        if (!user) {
            return res.status(400).json({ message: 'This email has not requested an OTP. Please try step 1 again.' });
        }
        if (user.isEmailVerified) {
            return res.status(400).json({ message: 'This email has already been verified and registered.' });
        }

        if (!user.otpCode || !user.otpExpiry) {
            return res.status(400).json({ message: 'No OTP found for this email.' });
        }
        if (user.otpCode !== otp) {
            return res.status(400).json({ message: 'Incorrect OTP code.' });
        }
        if (isOtpExpired(user.otpExpiry)) {
            return res.status(400).json({ message: 'OTP code has expired. Please request a new code.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const updatedUser = await prisma.user.update({
            where: { email: lowerCaseEmail },
            data: {
                password: hashedPassword,
                isEmailVerified: true,
                otpCode: null,
                otpExpiry: null,
                status: true,
            },
            select: {
                id: true,
                name: true,
                email: true,
                phoneNumber: true,
                role: true,
                status: true,
                createdAt: true,
            }
        });

        const payload = {
            user: {
                id: updatedUser.id,
                email: updatedUser.email,
                role: updatedUser.role,
            },
        };
        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
        );

        res.status(201).json({
            message: "Registration successful!",
            token: token,
            user: updatedUser,
        });

    } catch (error) {
        console.error('Error completing registration:', error);
        res.status(500).json({ message: 'Server error, please try again later.' });
    }
};

export const login = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });

        if (!user) {
            return res.status(400).json({ message: 'Incorrect email or password.' });
        }

        if (!user.isEmailVerified && user.password) {
            return res.status(403).json({ message: 'Email is not verified. Please check your email for the OTP and complete registration.' });
        }

        if (!user.password) {
            return res.status(400).json({ message: 'Please login with Google or complete registration.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Incorrect email or password.' });
        }

        if (!user.status) {
            return res.status(403).json({ message: 'Your account has been disabled.' });
        }

        const payload = {
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
            },
        };

        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
        );

        res.json({
            message: "Login successful!",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phoneNumber: user.phoneNumber,
                role: user.role,
                status: user.status,
                createdAt: user.createdAt,
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error, please try again later.' });
    }
};

export const getMe = async (req, res, next) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: 'Unauthorized, user data missing.' });
        }

        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true,
                name: true,
                email: true,
                phoneNumber: true,
                role: true,
                status: true,
                createdAt: true,
            }
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        res.json(user);

    } catch (error) {
        console.error('Error getting user info:', error);
        res.status(500).json({ message: 'Server error, please try again later.' });
    }
};
