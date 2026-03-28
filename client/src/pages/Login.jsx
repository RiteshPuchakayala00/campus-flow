import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(true);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(username, password, rememberMe);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #0d0d0d 0%, #1a0a0a 40%, #0d1117 100%)' }}>

            {/* Glowing orbs background */}
            <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl pointer-events-none"
                style={{ background: 'radial-gradient(circle, #e02020, transparent)' }} />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl pointer-events-none"
                style={{ background: 'radial-gradient(circle, #1a6ef5, transparent)' }} />

            <div className="w-full max-w-md animate-fade-in-up relative z-10">

                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-4 shadow-2xl animate-pulse-red"
                        style={{ background: 'linear-gradient(135deg, #e02020, #7b0d0d)' }}>
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    </div>
                    <h1 className="text-4xl font-black gradient-text">Campus Flow</h1>
                    <p className="text-gray-400 mt-2 text-sm">Smart Class &amp; Halls Booking System</p>
                </div>

                {/* Card */}
                <div className="glass-card p-8 shadow-2xl">
                    <h2 className="text-xl font-bold text-theme mb-6">Sign in to your account</h2>

                    {error && (
                        <div className="flex items-center gap-2 rounded-xl mb-5 text-sm p-3"
                            style={{ background: 'rgba(224,32,32,0.15)', border: '1px solid rgba(224,32,32,0.3)', color: '#f87171' }}>
                            <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">Username</label>
                            <input id="username" type="text" value={username}
                                onChange={e => setUsername(e.target.value)}
                                className="input-dark" placeholder="Enter your username" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
                            <input id="password" type="password" value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="input-dark" placeholder="Enter your password" required />
                        </div>
                        <div className="flex items-center gap-2">
                            <input id="remember-me" type="checkbox" checked={rememberMe}
                                onChange={e => setRememberMe(e.target.checked)}
                                className="w-4 h-4 rounded cursor-pointer accent-red-500" />
                            <label htmlFor="remember-me" className="text-sm text-gray-400 cursor-pointer select-none">
                                Remember me for 30 days
                            </label>
                        </div>
                        <button id="sign-in-btn" type="submit" disabled={loading}
                            className="btn-primary w-full text-center">
                            {loading ? '⏳ Signing in...' : 'Sign In →'}
                        </button>
                    </form>

                </div>
            </div>
        </div>
    );
};

export default Login;
