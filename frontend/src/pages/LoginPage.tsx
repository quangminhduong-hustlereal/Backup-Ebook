import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { loginUser } from '../services/authService';
import { useAuth } from '../context/AuthContext';

interface ApiError {
    message: string;
    errors?: { msg: string }[];
}

const LoginPage = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || "/";

    const { email, password } = formData;

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const response = await loginUser({ email, password });
            login(response.token, response.user);
            navigate(from, { replace: true });
        } catch (err: unknown) {
            let errorMessage = 'Login failed. Please check your credentials.';
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
                       Login to your account
                    </h2>
                </div>
                 {error && <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">{error}</div>}
                <form className="mt-8 space-y-6" onSubmit={onSubmit}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="email-address-login" className="sr-only">Email Address</label>
                            <input id="email-address-login" name="email" type="email" value={email} onChange={onChange} autoComplete="email" required
                                   className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                   placeholder="Email Address"/>
                        </div>
                        <div>
                            <label htmlFor="password-login" className="sr-only">Password</label>
                            <input id="password-login" name="password" type="password" value={password} onChange={onChange} autoComplete="current-password" required
                                   className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                   placeholder="Password"/>
                        </div>
                    </div>

                     <div className="flex items-center justify-between">
                        <div className="text-sm">
                            <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                                Forgot password?
                            </a>
                        </div>
                    </div>

                    <div>
                        <button type="submit" disabled={isLoading}
                                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed">
                             {isLoading ? 'Logging in...' : 'Login'}
                        </button>
                    </div>
                </form>
                <div className="text-sm text-center">
                    <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
                       Don't have an account? Register now
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
