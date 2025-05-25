import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { sendOtpRequest, verifyAndRegisterUser } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import { FiUser, FiMail, FiPhone, FiKey, FiShield, FiLogIn, FiAlertCircle, FiCheckCircle, FiArrowLeft } from 'react-icons/fi';
import type { User } from '../types/auth';
import Footer from '../components/Footer';

interface ApiError {
    message: string;
    errors?: { msg: string }[];
}

interface SendOtpResponse {
    message: string;
}

interface VerifyAndRegisterResponse {
    message: string;
    token: string;
    user: User;
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
        setError(null);
        setSuccess(null);
    };

    const handleSendOtp = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setIsLoading(true);

        try {
            const response = await sendOtpRequest({ name, email, phoneNumber }) as SendOtpResponse;
            setSuccess(response.message || "OTP sent successfully. Please check your email.");
            setStep(2);
        } catch (err: unknown) {
            const apiError = err as ApiError;
            setError(apiError?.message || 'Failed to send OTP. Please try again.');
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
        if (password.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }
        setIsLoading(true);

        try {
            const response = await verifyAndRegisterUser({ email, otp, password }) as VerifyAndRegisterResponse;
            setSuccess(response.message + " Logging in...");
            if (response.token && response.user) {
                login(response.token, response.user);
                setTimeout(() => {
                    navigate('/');
                }, 2000);
            } else {
                setError("Registration successful, but failed to log in automatically. Please log in manually.");
            }
        } catch (err: unknown) {
            const apiError = err as ApiError;
            setError(apiError?.message || 'OTP verification or registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const renderStep1 = () => (
        <>
            <div>
                <h2 className="text-2xl font-bold text-center text-gray-900">
                    Create your Account (Step 1/2)
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Enter your details to get an OTP.
                </p>
            </div>
            <form className="mt-8 space-y-6" onSubmit={handleSendOtp}>
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FiUser className="h-5 w-5 text-gray-400" />
                        </div>
                        <input id="name" name="name" type="text" value={name} onChange={onChange} required
                               className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                               placeholder="John Doe"/>
                    </div>
                </div>
                <div>
                    <label htmlFor="email-register" className="block text-sm font-medium text-gray-700">Email Address</label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FiMail className="h-5 w-5 text-gray-400" />
                        </div>
                        <input id="email-register" name="email" type="email" value={email} onChange={onChange} autoComplete="email" required
                               className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                               placeholder="you@example.com"/>
                    </div>
                </div>
                <div>
                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">Phone Number</label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FiPhone className="h-5 w-5 text-gray-400" />
                        </div>
                        <input id="phoneNumber" name="phoneNumber" type="tel" value={phoneNumber} onChange={onChange} required
                               className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                               placeholder="+84xxxxxxxxx"/>
                    </div>
                </div>
                <div>
                    <button type="submit" disabled={isLoading}
                            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-150">
                        {isLoading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Sending OTP...
                            </>
                        ) : 'Send OTP'}
                    </button>
                </div>
            </form>
        </>
    );

    const renderStep2 = () => (
        <>
            <div>
                <h2 className="text-2xl font-bold text-center text-gray-900">
                    Verify OTP (Step 2/2)
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Enter OTP sent to <span className="font-medium">{email}</span> and set your password.
                </p>
            </div>
            <form className="mt-8 space-y-6" onSubmit={handleRegister}>
                <div>
                    <label htmlFor="otp" className="block text-sm font-medium text-gray-700">OTP Code</label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FiShield className="h-5 w-5 text-gray-400" />
                        </div>
                        <input id="otp" name="otp" type="text" value={otp} onChange={onChange} required maxLength={6}
                               className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                               placeholder="6-digit OTP"/>
                    </div>
                </div>
                <div>
                    <label htmlFor="password-register" className="block text-sm font-medium text-gray-700">New Password</label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FiKey className="h-5 w-5 text-gray-400" />
                        </div>
                        <input id="password-register" name="password" type="password" value={password} onChange={onChange} required
                               className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                               placeholder="Min. 6 characters"/>
                    </div>
                </div>
                <div>
                    <label htmlFor="password2" className="block text-sm font-medium text-gray-700">Confirm Password</label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                         <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FiKey className="h-5 w-5 text-gray-400" />
                        </div>
                        <input id="password2" name="password2" type="password" value={password2} onChange={onChange} required
                               className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                               placeholder="Confirm new password"/>
                    </div>
                </div>
                <div className="space-y-3">
                    <button type="submit" disabled={isLoading}
                            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-150">
                        {isLoading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Registering...
                            </>
                        ) : (
                            <>
                                <FiLogIn className="mr-2 h-5 w-5" />
                                Complete Registration
                            </>
                        )}
                    </button>
                    <button type="button" onClick={() => setStep(1)} disabled={isLoading}
                            className="w-full flex justify-center items-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-150">
                        <FiArrowLeft className="mr-2 h-5 w-5" />
                        Back
                    </button>
                </div>
            </form>
        </>
    );

    return (
        <div className="h-screen flex flex-col justify-between">
            {/* Main content container */}
            <div className="flex-1 flex flex-col items-center justify-center px-6">
                <div className="w-full max-w-md">
                    <div className="bg-white py-8 px-4 shadow-2xl rounded-xl sm:px-10">
                        {error && (
                            <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200">
                                <div className="flex items-center">
                                    <FiAlertCircle className="h-5 w-5 text-red-400 mr-2" />
                                    <p className="text-sm text-red-700">{error}</p>
                                </div>
                            </div>
                        )}
                        {success && (
                             <div className="mb-4 p-3 rounded-md bg-green-50 border border-green-200">
                                <div className="flex items-center">
                                    <FiCheckCircle className="h-5 w-5 text-green-400 mr-2" />
                                    <p className="text-sm text-green-700">{success}</p>
                                </div>
                            </div>
                        )}
                        {step === 1 ? renderStep1() : renderStep2()}
                    </div>
                    <p className="mt-6 text-center text-sm text-gray-600">
                        Already have an account?{' '}
                        <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                            Login here
                        </Link>
                    </p>
                </div>
            </div>

            <Footer type="register" />
        </div>
    );
};

export default RegisterPage;
