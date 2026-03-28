import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../api/axios';
import Toast, { useToast } from '../components/Toast';

/* Status badge */
const StatusBadge = ({ status }) => {
    const map = { pending: 'badge-pending', approved: 'badge-approved', rejected: 'badge-rejected', cancelled: 'badge-rejected' };
    return <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${map[status] || 'badge-pending'}`}>
        {status?.charAt(0).toUpperCase() + status?.slice(1)}
    </span>;
};

const TABS = ['account', 'bookings', 'security'];

const ProfilePage = () => {
    const { user, logout } = useContext(AuthContext);
    const { isDark, toggle } = useTheme();
    const navigate = useNavigate();
    const { toast, showToast, closeToast } = useToast();

    const [tab, setTab] = useState('account');
    const [bookings, setBookings] = useState([]);
    const [bookLoading, setBookLoading] = useState(false);

    // Change password state
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [pwLoading, setPwLoading] = useState(false);
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    useEffect(() => {
        if (tab === 'bookings' && bookings.length === 0) {
            setBookLoading(true);
            api.get('/bookings').then(r => setBookings(r.data)).catch(() => showToast('Failed to load bookings', 'error')).finally(() => setBookLoading(false));
        }
    }, [tab]);

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) return showToast('New passwords do not match', 'error');
        if (newPassword.length < 6) return showToast('Password must be at least 6 characters', 'error');
        setPwLoading(true);
        try {
            const res = await api.put('/users/change-password', { currentPassword, newPassword });
            showToast(res.data.message, 'success');
            setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to change password', 'error');
        } finally {
            setPwLoading(false);
        }
    };

    const roleInfo = {
        faculty: { label: 'Faculty', color: '#60a5fa', bg: 'rgba(26,110,245,0.15)', icon: '🎓' },
        cr: { label: 'Class Rep', color: '#fbbf24', bg: 'rgba(245,165,0,0.15)', icon: '📋' },
        classroom_admin: { label: 'Classroom Admin', color: '#f87171', bg: 'rgba(224,32,32,0.15)', icon: '🛠️' },
        seminar_admin: { label: 'Seminar Admin', color: '#34d399', bg: 'rgba(16,185,129,0.15)', icon: '🏛️' },
        sysadmin: { label: 'System Admin', color: '#c084fc', bg: 'rgba(147,51,234,0.15)', icon: '👑' },
    };
    const ri = roleInfo[user?.role] || roleInfo.faculty;

    const pwStrength = (p) => {
        if (!p) return null;
        if (p.length < 6) return { label: 'Too short', color: '#f87171', width: '20%' };
        if (p.length < 8) return { label: 'Weak', color: '#fbbf24', width: '40%' };
        if (!/[A-Z]/.test(p) || !/[0-9]/.test(p)) return { label: 'Fair', color: '#fb923c', width: '60%' };
        if (p.length >= 12) return { label: 'Strong', color: '#4ade80', width: '100%' };
        return { label: 'Good', color: '#4ade80', width: '80%' };
    };
    const strength = pwStrength(newPassword);

    const tabStats = [
        { label: 'Total', value: bookings.length },
        { label: 'Approved', value: bookings.filter(b => b.status === 'approved').length },
        { label: 'Pending', value: bookings.filter(b => b.status === 'pending').length },
        { label: 'Rejected', value: bookings.filter(b => b.status === 'rejected').length },
    ];

    const PasswordInput = ({ label, val, setVal, show, setShow, placeholder }) => (
        <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#9ca3af' }}>{label}</label>
            <div className="relative">
                <input type={show ? 'text' : 'password'} value={val}
                    onChange={e => setVal(e.target.value)}
                    className="input-dark pr-12"
                    placeholder={placeholder} required />
                <button type="button" onClick={() => setShow(!show)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-theme transition-colors text-sm">
                    {show ? '🙈' : '👁️'}
                </button>
            </div>
        </div>
    );

    return (
        <div className="bg-app min-h-screen">
            <Toast toast={toast} onClose={closeToast} />

            {/* Navbar */}
            <nav className="navbar px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate('/dashboard')} className="text-gray-400 hover:text-red-400 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <span className="text-xl font-black gradient-text">My Profile</span>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={toggle} className="p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
                        {isDark ? '☀️' : '🌙'}
                    </button>
                    <button onClick={() => { logout(); navigate('/login'); }}
                        className="text-sm font-medium px-3 py-1.5 rounded-lg"
                        style={{ background: 'rgba(224,32,32,0.15)', color: '#f87171' }}>
                        Logout
                    </button>
                </div>
            </nav>

            <main className="max-w-3xl mx-auto px-4 py-8">

                {/* Profile card */}
                <div className="glass-card overflow-hidden mb-6 animate-fade-in-up">
                    {/* Cover strip */}
                    <div className="h-24 w-full" style={{ background: 'linear-gradient(135deg,#e02020,#7b0d0d 50%,#1a1a2e)' }} />
                    {/* Avatar */}
                    <div className="px-6 pb-6">
                        <div className="-mt-10 mb-3 w-20 h-20 rounded-full border-4 flex items-center justify-center text-3xl shadow-xl"
                            style={{ background: 'linear-gradient(135deg,#e02020,#7b0d0d)', borderColor: '#141414' }}>
                            {ri.icon}
                        </div>
                        <div className="flex items-end justify-between">
                            <div>
                                <h1 className="text-2xl font-black text-theme">{user?.username}</h1>
                                <span className="inline-block mt-1 px-3 py-0.5 rounded-full text-xs font-semibold"
                                    style={{ background: ri.bg, color: ri.color }}>
                                    {ri.label}
                                </span>
                            </div>
                            <button onClick={() => navigate('/dashboard')}
                                className="text-sm px-4 py-1.5 rounded-lg font-semibold"
                                style={{ background: 'rgba(255,255,255,0.08)', color: '#e2e8f0' }}>
                                Dashboard
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 mb-6 p-1 rounded-xl animate-fade-in-up" style={{ background: 'rgba(255,255,255,0.04)', animationDelay: '0.05s' }}>
                    {[['account', '👤 Account'], ['bookings', '📋 My Bookings'], ['security', '🔐 Security']].map(([t, label]) => (
                        <button key={t} onClick={() => setTab(t)}
                            className="flex-1 py-2 text-sm font-semibold rounded-lg transition-all"
                            style={tab === t
                                ? { background: 'linear-gradient(135deg,#e02020,#b01010)', color: 'white', boxShadow: '0 4px 12px rgba(224,32,32,0.3)' }
                                : { color: '#9ca3af' }}>
                            {label}
                        </button>
                    ))}
                </div>

                {/* ── ACCOUNT TAB ── */}
                {tab === 'account' && (
                    <div className="space-y-4 animate-fade-in-up">
                        <div className="glass-card p-6">
                            <h2 className="text-base font-bold text-theme mb-4">Account Information</h2>
                            <div className="space-y-3">
                                {[['Username', user?.username, '👤'], ['Role', ri.label, ri.icon], ['Session', 'Active (30-day JWT)', '🔑']].map(([k, v, ico]) => (
                                    <div key={k} className="flex items-center justify-between py-3 px-1"
                                        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                                        <span className="text-gray-400 text-sm">{ico} {k}</span>
                                        <span className="text-theme text-sm font-medium">{v}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="glass-card p-6">
                            <h2 className="text-base font-bold text-theme mb-4">⚙️ Preferences</h2>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-theme font-medium">Dark Mode</p>
                                    <p className="text-gray-500 text-sm">Toggle between dark and light theme</p>
                                </div>
                                <button onClick={toggle}
                                    className="relative w-12 h-6 rounded-full transition-colors duration-200 flex-shrink-0"
                                    style={{ background: isDark ? '#e02020' : '#374151' }}>
                                    <span className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200"
                                        style={{ transform: isDark ? 'translateX(26px)' : 'translateX(2px)' }} />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── BOOKINGS TAB ── */}
                {tab === 'bookings' && (
                    <div className="animate-fade-in-up">
                        {/* Stats */}
                        <div className="grid grid-cols-4 gap-3 mb-5">
                            {tabStats.map(s => (
                                <div key={s.label} className="glass-card p-3 text-center">
                                    <p className="text-2xl font-black text-theme">{s.value}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                                </div>
                            ))}
                        </div>

                        <div className="glass-card p-6">
                            <h2 className="text-base font-bold text-theme mb-4">Booking History</h2>
                            {bookLoading ? (
                                <div className="flex justify-center py-8">
                                    <div className="w-8 h-8 rounded-full border-4 border-red-500 border-t-transparent animate-spin" />
                                </div>
                            ) : bookings.length === 0 ? (
                                <div className="text-center py-10">
                                    <div className="text-5xl mb-3">📋</div>
                                    <p className="text-gray-500">No bookings yet.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {bookings.map(b => (
                                        <div key={b._id} className="flex items-center gap-4 p-3 rounded-xl"
                                            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                            <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-lg"
                                                style={{ background: 'rgba(224,32,32,0.15)' }}>
                                                🏫
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-theme font-semibold text-sm truncate">{b.venue?.name || 'Venue'}</p>
                                                <p className="text-gray-500 text-xs">{new Date(b.date).toLocaleDateString()} · {b.startTime}–{b.endTime}</p>
                                            </div>
                                            <StatusBadge status={b.status} />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ── SECURITY TAB ── */}
                {tab === 'security' && (
                    <div className="space-y-4 animate-fade-in-up">
                        {/* Security overview */}
                        <div className="glass-card p-6">
                            <h2 className="text-base font-bold text-theme mb-4">🔒 Security Overview</h2>
                            <div className="space-y-3">
                                {[
                                    ['Password', 'Last changed: Set on account creation', '🔑', '#4ade80'],
                                    ['Login Sessions', 'Remember Me active (30 days)', '📱', '#60a5fa'],
                                    ['Account Protection', 'Rate-limited: max 10 attempts/15min', '🛡️', '#4ade80'],
                                ].map(([k, v, ico, col]) => (
                                    <div key={k} className="flex items-center gap-3 py-3"
                                        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                                        <span className="text-xl">{ico}</span>
                                        <div className="flex-1">
                                            <p className="text-theme text-sm font-medium">{k}</p>
                                            <p className="text-gray-500 text-xs">{v}</p>
                                        </div>
                                        <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                                            style={{ background: `${col}20`, color: col }}>
                                            Active
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Change Password Card - Instagram/Facebook style */}
                        <div className="glass-card p-6" style={{ border: '1px solid rgba(224,32,32,0.2)' }}>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-full flex items-center justify-center"
                                    style={{ background: 'rgba(224,32,32,0.2)' }}>
                                    🔐
                                </div>
                                <div>
                                    <h2 className="text-base font-bold text-theme">Change Password</h2>
                                    <p className="text-gray-500 text-xs">Choose a strong password to protect your account</p>
                                </div>
                            </div>

                            <form onSubmit={handleChangePassword} className="space-y-4">
                                <PasswordInput label="Current Password" val={currentPassword} setVal={setCurrentPassword}
                                    show={showCurrent} setShow={setShowCurrent} placeholder="Enter your current password" />
                                <PasswordInput label="New Password" val={newPassword} setVal={setNewPassword}
                                    show={showNew} setShow={setShowNew} placeholder="Min 8 chars, uppercase + number recommended" />

                                {/* Password strength bar */}
                                {newPassword && strength && (
                                    <div>
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="text-gray-500">Password strength</span>
                                            <span style={{ color: strength.color }}>{strength.label}</span>
                                        </div>
                                        <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.1)' }}>
                                            <div className="h-full rounded-full transition-all duration-300"
                                                style={{ width: strength.width, background: strength.color }} />
                                        </div>
                                        <ul className="mt-2 text-xs text-gray-500 space-y-0.5">
                                            <li style={{ color: newPassword.length >= 8 ? '#4ade80' : '#6b7280' }}>
                                                {newPassword.length >= 8 ? '✓' : '○'} At least 8 characters
                                            </li>
                                            <li style={{ color: /[A-Z]/.test(newPassword) ? '#4ade80' : '#6b7280' }}>
                                                {/[A-Z]/.test(newPassword) ? '✓' : '○'} Uppercase letter
                                            </li>
                                            <li style={{ color: /[0-9]/.test(newPassword) ? '#4ade80' : '#6b7280' }}>
                                                {/[0-9]/.test(newPassword) ? '✓' : '○'} Number
                                            </li>
                                        </ul>
                                    </div>
                                )}

                                <PasswordInput label="Confirm New Password" val={confirmPassword} setVal={setConfirmPassword}
                                    show={showConfirm} setShow={setShowConfirm} placeholder="Repeat your new password" />

                                {/* Match indicator */}
                                {confirmPassword && (
                                    <p className="text-xs" style={{ color: newPassword === confirmPassword ? '#4ade80' : '#f87171' }}>
                                        {newPassword === confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                                    </p>
                                )}

                                <button type="submit" disabled={pwLoading}
                                    className="btn-primary w-full mt-2">
                                    {pwLoading ? '⏳ Updating...' : '🔐 Update Password'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default ProfilePage;
