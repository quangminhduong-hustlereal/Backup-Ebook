import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../../prisma/.env') });

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587', 10),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    tls: {
       rejectUnauthorized: false
    }
});

export const sendEmail = async (to, subject, htmlContent) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: to,
            subject: subject,
            html: htmlContent,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: %s', info.messageId);
        return info;
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Could not send email.');
    }
};

export const sendOtpEmail = async (to, otp) => {
    const subject = 'Your Book-Nest Registration Verification Code';
    const htmlContent = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
            <h2>Welcome to Book-Nest!</h2>
            <p>Thank you for registering. Please use the OTP code below to complete your registration:</p>
            <p style="font-size: 24px; font-weight: bold; color: #4A90E2; letter-spacing: 2px;">${otp}</p>
            <p>This OTP will expire in 5 minutes.</p>
            <p>If you did not request this code, please ignore this email.</p>
            <br>
            <p>Best regards,</p>
            <p><strong>The Book-Nest Team</strong></p>
        </div>
    `;
    return sendEmail(to, subject, htmlContent);
};
