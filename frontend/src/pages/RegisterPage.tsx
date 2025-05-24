import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { sendOtpRequest, verifyAndRegisterUser } from '../services/authService';
import { useAuth } from '../context/AuthContext';

interface ApiError {
    message: string;
    errors?: { msg: string }[];
}

const RegisterPage = () => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phoneNumber: '',
        otp: '',
        password: '',
        password2: '',
    });
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const { name, email, phoneNumber, otp, password, password2 } = formData;

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSendOtp = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setIsLoading(true);

        try {
            const response = await sendOtpRequest({ name, email, phoneNumber });
            setSuccess(response.message);
            setStep(2);
        } catch (err: unknown) {
            const apiError = err as ApiError;
            setError(apiError?.message || 'Failed to send OTP.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (password !== password2) {
            setError('Passwords do not match!');
            return;
        }
        setIsLoading(true);

        try {
            const response = await verifyAndRegisterUser({ email, otp, password });
            setSuccess(response.message + " Logging in...");
            login(response.token, response.user);
            setTimeout(() => {
                navigate('/');
            }, 2000);
        } catch (err: unknown) {
            const apiError = err as ApiError;
            setError(apiError?.message || 'Verification or registration failed.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 p-10 bg-white shadow-xl rounded-lg">
                {error && <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">{error}</div>}
                {success && <div className="p-4 mb-4 text-sm text-green-700 bg-green-100 rounded-lg" role="alert">{success}</div>}

                {step === 1 && (
                    <div>
                        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                            Register - Step 1/2
                        </h2>
                        <p className="mt-2 text-center text-sm text-gray-600">
                            Enter your information to receive an OTP via Email.
                        </p>
                        <form className="mt-8 space-y-6" onSubmit={handleSendOtp}>
                            <div>
                                <label htmlFor="name" className="sr-only">Full Name</label>
                                <input id="name" name="name" type="text" value={name} onChange={onChange} required
                                       className="input input-bordered w-full mb-3" placeholder="Full Name"/>
                            </div>
                            <div>
                                <label htmlFor="email-address" className="sr-only">Email Address</label>
                                <input id="email-address" name="email" type="email" value={email} onChange={onChange} autoComplete="email" required
                                       className="input input-bordered w-full mb-3" placeholder="Email Address"/>
                            </div>
                            <div>
                                <label htmlFor="phoneNumber" className="sr-only">Phone Number</label>
                                <input id="phoneNumber" name="phoneNumber" type="tel" value={phoneNumber} onChange={onChange} required
                                       className="input input-bordered w-full mb-4" placeholder="Phone Number"/>
                            </div>
                            <div>
                                <button type="submit" disabled={isLoading} className="btn btn-primary w-full">
                                    {isLoading ? <span className="loading loading-spinner"></span> : 'Send OTP'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {step === 2 && (
                    <div>
                        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                            Register - Step 2/2
                        </h2>
                        <p className="mt-2 text-center text-sm text-gray-600">
                            Enter the OTP sent to <span className="font-medium">{email}</span> and set your password.
                        </p>
                        <form className="mt-8 space-y-6" onSubmit={handleRegister}>
                            <div>
                                <label htmlFor="otp" className="sr-only">OTP</label>
                                <input id="otp" name="otp" type="text" value={otp} onChange={onChange} required maxLength={6}
                                       className="input input-bordered w-full mb-3" placeholder="OTP (6 digits)"/>
                            </div>
                            <div>
                                <label htmlFor="password_register" className="sr-only">Password</label>
                                <input id="password_register" name="password" type="password" value={password} onChange={onChange} required
                                       className="input input-bordered w-full mb-3" placeholder="Password (at least 6 characters)"/>
                            </div>
                            <div>
                                <label htmlFor="password2" className="sr-only">Confirm Password</label>
                                <input id="password2" name="password2" type="password" value={password2} onChange={onChange} required
                                       className="input input-bordered w-full mb-4" placeholder="Confirm Password"/>
                            </div>
                            <div>
                                <button type="submit" disabled={isLoading} className="btn btn-primary w-full">
                                    {isLoading ? <span className="loading loading-spinner"></span> : 'Complete Registration'}
                                </button>
                                <button type="button" onClick={() => setStep(1)} disabled={isLoading}
                                        className="btn btn-ghost w-full mt-3">
                                    Back
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="text-sm text-center">
                    <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                        Already have an account? Login now
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
