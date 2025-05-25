import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from './generated/prisma/index.js';
import authRoutes from './routes/auth.route.js';
import path from 'path';
import { fileURLToPath } from 'url';
import passport from 'passport';
import './config/passportSetup.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../prisma/.env') });

const app = express();

export const prisma = new PrismaClient({
});

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Passport setup
app.use(passport.initialize());

// Routes
app.get('/api', (req, res) => {
  res.status(200).json({ message: 'Welcome to Book-Nest API!' });
});
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5001;

// Start server
const startServer = async () => {
    try {
        console.log("Connecting to the database...");
        await prisma.$connect();
        console.log("Database connection successful!");

        app.listen(PORT, () => {
            console.log(`Backend server is running at: http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("Unable to connect to the database or start the server:", error);
        await prisma.$disconnect();
        process.exit(1);
    }
};

startServer();

process.on('SIGINT', async () => {
    await prisma.$disconnect();
    process.exit(0);
});
