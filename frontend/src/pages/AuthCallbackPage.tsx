import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMe } from '../services/authService';
import Footer from '../components/Footer';

const AuthCallbackPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { login, logout } = useAuth();

    useEffect(() => {
        const token = searchParams.get('token');
        const error = searchParams.get('error');

        const processLogin = async (authToken: string) => {
            try {
                const user = await getMe(authToken);
                login(authToken, user);
                navigate('/', { replace: true });
            } catch (fetchError) {
                console.error("Error fetching user after callback:", fetchError);
                logout();
                navigate('/login?error=fetch_failed', { replace: true });
            }
        };

        if (error) {
            console.error("Google login error:", error);
            navigate('/login?error=google_login_failed', { replace: true });
        } else if (token) {
            processLogin(token);
        } else {
            console.error("No token or error found in callback.");
            navigate('/login?error=callback_issue', { replace: true });
        }
    }, [searchParams, navigate, login, logout]);

    return (
        <div className="h-screen flex flex-col justify-between">
            <div className="flex-1 flex flex-col items-center justify-center px-6">
                <div className="w-full max-w-md text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
                        Processing Login...
                    </h2>
                    <div className="flex justify-center mb-4">
                        <svg className="animate-spin h-10 w-10 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </div>
                    <p className="text-gray-600">
                        You will be redirected automatically.
                    </p>
                </div>
            </div>
            <Footer type="login" />
        </div>
    );
};

export default AuthCallbackPage;
