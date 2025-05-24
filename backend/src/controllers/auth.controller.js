import { prisma } from '../index.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import { ERole } from '../generated/prisma/index.js';

export const register = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, phoneNumber, role } = req.body;

    try {
        const existingUser = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });

        if (existingUser) {
            return res.status(400).json({ message: 'This email is already in use.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const userRole = role && Object.values(ERole).includes(role) ? role : ERole.Customer;

        const newUser = await prisma.user.create({
            data: {
                name,
                email: email.toLowerCase(),
                password: hashedPassword,
                phoneNumber,
                role: userRole,
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

        res.status(201).json({
            message: "Registration successful!",
            user: newUser,
        });

    } catch (error) {
        console.error('Registration error:', error);
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
