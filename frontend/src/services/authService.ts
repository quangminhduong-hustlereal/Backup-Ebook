import axios, { isAxiosError } from 'axios';
import type { User } from '../types/auth';

const API_URL = 'http://localhost:8081/api/auth';

interface ApiErrorData {
    message: string;
    errors?: { msg: string }[];
}

// --- Send OTP ---
export interface SendOtpData {
    name: string;
    email: string;
    phoneNumber: string;
}
interface SendOtpResponse {
    message: string;
}
export const sendOtpRequest = async (otpData: SendOtpData): Promise<SendOtpResponse> => {
    try {
        const response = await axios.post<SendOtpResponse>(`${API_URL}/send-otp`, otpData);
        return response.data;
    } catch (error: unknown) {
        if (isAxiosError<ApiErrorData>(error) && error.response) {
            throw error.response.data;
        }
        throw { message: 'An error occurred while sending OTP.' };
    }
};

// --- Verify OTP & Register ---
export interface VerifyRegisterData {
    email: string;
    otp: string;
    password: string;
}
interface VerifyRegisterResponse {
    message: string;
    token: string;
    user: User;
}
export const verifyAndRegisterUser = async (verifyData: VerifyRegisterData): Promise<VerifyRegisterResponse> => {
    try {
        const response = await axios.post<VerifyRegisterResponse>(`${API_URL}/register`, verifyData);
        return response.data;
    } catch (error: unknown) {
        if (isAxiosError<ApiErrorData>(error) && error.response) {
            throw error.response.data;
        }
        throw { message: 'An error occurred during verification and registration.' };
    }
}

export interface RegisterData {
    name: string;
    email: string;
    password: string;
    phoneNumber: string;
    role?: string;
}

interface RegisterResponse {
    message: string;
    user: User;
}

export const registerUser = async (userData: RegisterData): Promise<RegisterResponse> => {
    try {
        const response = await axios.post<RegisterResponse>(`${API_URL}/register`, userData);
        return response.data;
    } catch (error: unknown) {
        if (isAxiosError<ApiErrorData>(error) && error.response) {
            throw error.response.data;
        }
        throw { message: 'An unknown error occurred.' };
    }
}

export interface LoginData {
    email: string;
    password: string;
}

interface LoginResponse {
    message: string;
    token: string;
    user: User;
}

export const loginUser = async (loginData: LoginData): Promise<LoginResponse> => {
    try {
        const response = await axios.post<LoginResponse>(`${API_URL}/login`, loginData);
        return response.data;
    } catch (error: unknown) {
        if (isAxiosError<ApiErrorData>(error) && error.response) {
            throw error.response.data;
        }
        throw { message: 'An unknown error occurred during login.' };
    }
};

export const getMe = async (token: string): Promise<User> => {
     try {
        const response = await axios.get<User>(`${API_URL}/me`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error: unknown) {
         if (isAxiosError<ApiErrorData>(error) && error.response) {
            throw error.response.data;
        }
        throw { message: 'Unable to fetch user information.' };
    }
};
