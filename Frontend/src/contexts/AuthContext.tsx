import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

interface User {
    email: string;
}

interface AuthContextType {
    user: User | null;
    login: (token: string, email: string) => void;
    logout: () => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const email = localStorage.getItem('userEmail');
        if (token && email) {
            setUser({ email });
        }
        setLoading(false);
    }, []);

    const login = (token: string, email: string) => {
        localStorage.setItem('token', token);
        localStorage.setItem('userEmail', email);
        setUser({ email });
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userEmail');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
