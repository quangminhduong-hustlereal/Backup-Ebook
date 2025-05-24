import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser, type RegisterData } from '../services/authService';

interface ApiError {
    message: string;
    errors?: { msg: string }[];
}

const RegisterPage = () => {
    const [formData, setFormData] = useState<RegisterData & { password2: string }>({
        name: '',
        email: '',
        password: '',
        password2: '',
        phoneNumber: '',
        role: "Customer",
    });
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const { name, email, password, password2, phoneNumber, role } = formData;

    const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setIsLoading(true);

        if (password !== password2) {
            setError('Passwords do not match!');
            setIsLoading(false);
            return;
        }

        try {
            const response = await registerUser({ name, email, password, phoneNumber, role });
            setSuccess(response.message + " You will be redirected to the login page.");
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err: unknown) {
            let errorMessage = 'Registration failed. Please try again.';
            const apiError = err as ApiError;
            if (apiError && typeof apiError === 'object') {
                if (apiError.errors && Array.isArray(apiError.errors) && apiError.errors.length > 0) {
                    errorMessage = apiError.errors.map((e) => e.msg).join(' ');
                } else if (apiError.message) {
                    errorMessage = apiError.message;
                }
            }
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 p-10 bg-white shadow-xl rounded-lg">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Create a new account
                    </h2>
                </div>
                {error && <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">{error}</div>}
                {success && <div className="p-4 mb-4 text-sm text-green-700 bg-green-100 rounded-lg" role="alert">{success}</div>}
                <form className="mt-8 space-y-6" onSubmit={onSubmit}>
                    <div>
                        <label htmlFor="name" className="sr-only">Full Name</label>
                        <input id="name" name="name" type="text" value={name} onChange={onChange} required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="Full Name"/>
                    </div>
                    <div>
                        <label htmlFor="email-address" className="sr-only">Email Address</label>
                        <input id="email-address" name="email" type="email" value={email} onChange={onChange} autoComplete="email" required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="Email Address"/>
                    </div>
                    <div>
                        <label htmlFor="phoneNumber" className="sr-only">Phone Number</label>
                        <input id="phoneNumber" name="phoneNumber" type="tel" value={phoneNumber} onChange={onChange} required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="Phone Number"/>
                    </div>
                    <div>
                        <label htmlFor="password_register" className="sr-only">Password</label>
                        <input id="password_register" name="password" type="password" value={password} onChange={onChange} autoComplete="new-password" required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="Password"/>
                    </div>
                    <div>
                        <label htmlFor="password2" className="sr-only">Confirm Password</label>
                        <input id="password2" name="password2" type="password" value={password2} onChange={onChange} required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="Confirm Password"/>
                    </div>
                    <div>
                        <label htmlFor="role" className="block text-sm font-medium text-gray-700 mt-3 mb-1 ml-1">Register as:</label>
                        <select id="role" name="role" value={role} onChange={onChange}
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm">
                            <option value="Customer">Customer</option>
                            <option value="Seller">Seller</option>
                        </select>
                    </div>
                    <div>
                        <button type="submit" disabled={isLoading}
                                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed">
                            {isLoading ? 'Processing...' : 'Register'}
                        </button>
                    </div>
                </form>
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
