import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { prisma } from '../index.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { ERole } from '../generated/prisma/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../../prisma/.env') });

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL,
            scope: ['profile', 'email'],
        },
        async (accessToken, refreshToken, profile, done) => {
            console.log('Google Profile:', profile);

            const googleId = profile.id;
            const email = profile.emails && profile.emails[0] ? profile.emails[0].value.toLowerCase() : null;
            const name = profile.displayName;

            if (!email) {
                return done(new Error('Could not get email from Google.'), null);
            }

            try {
                let user = await prisma.user.findUnique({
                    where: { googleId: googleId },
                });

                if (user) {
                    console.log('User found by Google ID:', user.email);
                    return done(null, user);
                }

                user = await prisma.user.findUnique({
                    where: { email: email },
                });

                if (user) {
                    console.log('User found by Email, linking Google ID:', user.email);
                    user = await prisma.user.update({
                        where: { email: email },
                        data: {
                            googleId: googleId,
                            isEmailVerified: true,
                        },
                    });
                    return done(null, user);
                }

                console.log('User not found, creating new user:', email);
                user = await prisma.user.create({
                    data: {
                        googleId: googleId,
                        email: email,
                        name: name,
                        isEmailVerified: true,
                        status: true,
                        role: ERole.Customer,
                    },
                });
                return done(null, user);

            } catch (error) {
                console.error('Error processing Passport Google:', error);
                return done(error, null);
            }
        }
    )
);
