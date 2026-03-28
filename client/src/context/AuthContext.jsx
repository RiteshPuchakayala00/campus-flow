import { createContext, useState, useEffect } from 'react';
import api from '../api/axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // On mount, restore user from localStorage (remember me) OR sessionStorage (tab session)
    useEffect(() => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const role = localStorage.getItem('role') || sessionStorage.getItem('role');
        const username = localStorage.getItem('username') || sessionStorage.getItem('username');
        if (token && role && username) {
            setUser({ token, role, username });
            api.defaults.headers.common['x-auth-token'] = token;
        }
        setLoading(false);
    }, []);

    // rememberMe=true  → localStorage  (persists across browser restarts, 30 days)
    // rememberMe=false → sessionStorage (cleared when browser tab closes)
    const login = async (username, password, rememberMe = true) => {
        const res = await api.post('/auth/login', { username, password });
        const { token, role } = res.data;

        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem('token', token);
        storage.setItem('role', role);
        storage.setItem('username', username);

        api.defaults.headers.common['x-auth-token'] = token;
        setUser({ token, role, username });
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('username');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('role');
        sessionStorage.removeItem('username');
        delete api.defaults.headers.common['x-auth-token'];
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
