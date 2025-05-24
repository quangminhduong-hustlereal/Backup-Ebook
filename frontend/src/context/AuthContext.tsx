import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import type { User, DecodedToken, AuthContextType } from '../types/auth';
import axios from 'axios';

const API_URL = 'http://localhost:8081/api/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        setIsLoading(false);
    };

    const fetchUserData = async (currentToken: string) => {
        setIsLoading(true);
        try {
            const response = await axios.get<User>(`${API_URL}/me`, {
                headers: { Authorization: `Bearer ${currentToken}` },
            });
            setUser(response.data);
            setToken(currentToken);
        } catch (error) {
            console.error('Failed to fetch user, logging out:', error);
            logout();
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            try {
                const decoded = jwtDecode<DecodedToken>(storedToken);
                if (decoded.exp * 1000 < Date.now()) {
                    console.log("Token expired, logging out.");
                    logout();
                } else {
                    fetchUserData(storedToken);
                }
            } catch (error) {
                console.error("Invalid token found, logging out:", error);
                logout();
            }
        } else {
            setIsLoading(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const login = (newToken: string, loggedInUser: User) => {
        localStorage.setItem('token', newToken);
        setToken(newToken);
        setUser(loggedInUser);
    };

    const isAuthenticated = !!token && !!user && !isLoading;

    const value = {
        token,
        user,
        isLoading,
        isAuthenticated,
        login,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
