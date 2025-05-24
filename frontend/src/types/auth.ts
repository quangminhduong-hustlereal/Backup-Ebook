// Định nghĩa kiểu dữ liệu cho User dựa trên response từ API /me hoặc /login
export interface User {
    id: string;
    name: string;
    email: string;
    phoneNumber: string;
    role: string;
    status: boolean;
    createdAt: string;
}

// Định nghĩa kiểu dữ liệu cho payload được giải mã từ JWT
export interface DecodedToken {
    user: {
        id: string;
        email: string;
        role: string;
    };
    iat: number;
    exp: number;
}

// Định nghĩa kiểu dữ liệu cho AuthContext
export interface AuthContextType {
    token: string | null;
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (token: string, user: User) => void;
    logout: () => void;
}
