import { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import api from '../api/axios';
import Toast, { useToast } from '../components/Toast';
import CalendarView from '../components/CalendarView';
import AnalyticsChart from '../components/AnalyticsChart';

/* ── Status badge ── */
const StatusBadge = ({ status }) => {
    const map = {
        pending: 'badge-pending',
        approved: 'badge-approved',
        rejected: 'badge-rejected',
        cancelled: 'badge-rejected',
        waitlisted: 'badge-waitlist',
    };
    return (
        <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${map[status] || 'badge-pending'}`}>
            {status?.charAt(0).toUpperCase() + status?.slice(1)}
        </span>
    );
};

/* ── Main Dashboard ── */
const Dashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const { isDark, toggle } = useTheme();
    const { toast, showToast, closeToast } = useToast();

    const [venues, setVenues] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [publicBookings, setPublicBookings] = useState([]); // For the calendar
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [busy, setBusy] = useState(true);

    const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'

    const notifRef = useRef(null);

    // Close notifications on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notifRef.current && !notifRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        };
        if (showNotifications) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showNotifications]);

    // Search & filter state
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [filterCap, setFilterCap] = useState('');

    const isAdmin = ['classroom_admin', 'seminar_admin', 'sysadmin'].includes(user?.role);
    const isUser = ['faculty', 'cr', 'event_organizer'].includes(user?.role);

    useEffect(() => {
        const load = async () => {
            try {
                const [v, b, n, pb] = await Promise.all([
                    api.get('/venues'),
                    api.get('/bookings'),
                    api.get('/notifications'),
                    api.get('/bookings/approved')
                ]);
                setVenues(v.data);
                setBookings(b.data);
                setNotifications(n.data);
                setPublicBookings(pb.data);
            } catch (err) {
                showToast('Failed to load data', 'error');
            } finally {
                setBusy(false);
            }
        };
        if (user) load();
    }, [user]);

    // Admin approve/reject
    const handleStatus = async (id, status) => {
        try {
            await api.put(`/bookings/${id}/status`, { status });
            setBookings(prev => prev.map(b => b._id === id ? { ...b, status } : b));
            showToast(`Booking ${status}! ✓`, status === 'approved' ? 'success' : 'info');
        } catch {
            showToast('Failed to update status', 'error');
        }
    };

    // Cancel booking
    const handleCancel = async (id) => {
        if (!window.confirm('Cancel this booking request?')) return;
        try {
            await api.patch(`/bookings/${id}/cancel`);
            setBookings(prev => prev.map(b => b._id === id ? { ...b, status: 'cancelled' } : b));
            showToast('Booking cancelled', 'info');
        } catch (err) {
            showToast(err.response?.data?.message || 'Cannot cancel', 'error');
        }
    };

    const handleLogout = () => { logout(); navigate('/login'); };

    const markNotificationRead = async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
        } catch (err) {
            console.error('Failed to mark read', err);
        }
    };

    const exportCSV = (dataToExport, filename) => {
        const headers = ['User', 'Venue', 'Date', 'Start Time', 'End Time', 'Status', 'Purpose'];
        const rows = dataToExport.map(b => [
            b.user?.username || b.user || 'Unknown',
            b.venue?.name || b.venue || 'Unknown',
            new Date(b.date).toLocaleDateString(),
            b.start_time || b.startTime,
            b.end_time || b.endTime,
            b.status,
            `"${(b.purpose || '').replace(/"/g, '""')}"`
        ]);
        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    // Filtered venues
    const filteredVenues = venues.filter(v => {
        const matchSearch = v.name.toLowerCase().includes(search.toLowerCase());
        const matchType = filterType === 'all' || v.type === filterType;
        const matchCap = !filterCap || v.capacity >= Number(filterCap);
        return matchSearch && matchType && matchCap;
    });

    // My bookings (for non-admin)
    const myBookings = bookings.filter(b => b.user?._id === user?.id || b.user === user?.id);

    // Pending for admin
    const pendingBookings = bookings.filter(b => b.status === 'pending');

    if (busy) return (
        <div className="bg-app flex h-screen items-center justify-center">
            <div className="text-center animate-fade-in-up">
                <div className="w-10 h-10 rounded-full border-4 border-blue-500 border-t-transparent animate-spin mx-auto mb-4" />
                <p className="text-slate-400 font-medium tracking-wide text-sm uppercase">Loading Dashboard</p>
            </div>
        </div>
    );

    return (
        <div className="bg-app min-h-screen">
            <Toast toast={toast} onClose={closeToast} />

            {/* ── Navbar ── */}
            <nav className="navbar px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center app-logo-bg">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    </div>
                    <span className="text-xl font-black gradient-text">Campus Flow</span>
                </div>

                <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-semibold text-theme">{user?.username}</p>
                        <p className="text-xs text-theme-muted uppercase tracking-wide">{user?.role?.replace('_', ' ')}</p>
                    </div>

                    {/* Dark mode */}
                    <button onClick={toggle} className="p-2 rounded-lg transition-colors btn-glass">
                        {isDark ? '☀️' : '🌙'}
                    </button>

                    <button onClick={() => navigate('/profile')} className="p-2 rounded-lg transition-colors hidden sm:block btn-glass"
                        title="My Profile">
                        👤
                    </button>

                    {/* Notifications */}
                    <div className="relative" ref={notifRef}>
                        <button onClick={() => setShowNotifications(!showNotifications)} className="p-2 rounded-lg transition-colors relative btn-glass">
                            🔔
                            {unreadCount > 0 && (
                                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-[var(--dark)]"></span>
                            )}
                        </button>

                        {/* Dropdown panel */}
                        {showNotifications && (
                            <div className="absolute right-0 mt-3 w-72 sm:w-80 glass-card shadow-2xl z-50 overflow-hidden animate-fade-in-up">
                                <div className="p-3 border-b border-theme flex justify-between items-center bg-glass">
                                    <h3 className="font-bold text-theme text-sm">Notifications</h3>
                                    {unreadCount > 0 && <span className="text-xs text-red-500">{unreadCount} new</span>}
                                </div>
                                <div className="max-h-72 overflow-y-auto scrollbar-hide">
                                    {notifications.length === 0 ? (
                                        <div className="p-4 text-center text-theme-muted text-sm">No notifications yet.</div>
                                    ) : (
                                        notifications.map(n => (
                                            <div key={n._id} onClick={() => markNotificationRead(n._id)}
                                                className={`p-3 border-b border-theme cursor-pointer transition-colors ${!n.isRead ? 'bg-red-500/10' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}>
                                                <div className="flex gap-2 items-start">
                                                    <span className="text-lg">{n.type === 'success' ? '✅' : n.type === 'error' ? '❌' : 'ℹ️'}</span>
                                                    <div>
                                                        <h4 className={`text-sm ${!n.isRead ? 'text-theme font-bold' : 'text-theme-muted'}`}>{n.title}</h4>
                                                        <p className="text-xs text-theme-muted mt-0.5">{n.message}</p>
                                                        <p className="text-[10px] text-theme-muted mt-1">{new Date(n.createdAt).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sysadmin shortcut */}
                    {user?.role === 'sysadmin' && (
                        <button onClick={() => navigate('/admin')}
                            className="text-sm font-semibold px-3 py-1.5 rounded-lg transition-colors btn-purple-ghost">
                            ⚙️ Manage System
                        </button>
                    )}

                    <button id="logout-btn" onClick={handleLogout}
                        className="text-sm font-semibold px-3 py-1.5 rounded-lg transition-colors btn-red-ghost">
                        Logout
                    </button>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

                {/* ── Hero Banner ── */}
                <div className="rounded-2xl p-6 mb-8 animate-fade-in-up hero-gradient shadow-xl border border-white/5">
                    <h1 className="text-2xl font-bold text-white tracking-tight">
                        Welcome, {user?.username}.
                    </h1>
                    <p className="text-slate-300 mt-1.5 text-sm font-medium">
                        {isUser ? 'Overview of your venue requests and system status.' : 'Management overview of venue requests and system status.'}
                    </p>
                </div>

                {/* ── ADMIN VIEW ── */}
                {isAdmin && (
                    <>
                        {/* Summary cards */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
                            {[
                                { label: 'Total Bookings', value: bookings.length, color: '#60a5fa' },
                                { label: 'Pending', value: pendingBookings.length, color: '#fbbf24' },
                                { label: 'Approved', value: bookings.filter(b => b.status === 'approved').length, color: '#4ade80' },
                            ].map(c => (
                                <div key={c.label} className="glass-card p-5">
                                    <p className="text-xs text-gray-400 uppercase font-medium mb-1">{c.label}</p>
                                    <p className="text-3xl font-black" style={{ color: c.color }}>{c.value}</p>
                                </div>
                            ))}
                        </div>

                        {/* Analytics Charts */}
                        <AnalyticsChart bookings={bookings} />

                        {/* Pending approvals */}
                        <div className="glass-card p-6 mb-8">
                            <h2 className="text-lg font-bold text-white mb-4">⏳ Pending Approvals</h2>
                            {pendingBookings.length === 0 ? (
                                <p className="text-gray-500 text-sm text-center py-4">No pending approvals. ✅</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm table-dark">
                                        <thead>
                                            <tr>
                                                <th className="text-left pb-3 text-gray-500 font-medium">User</th>
                                                <th className="text-left pb-3 text-gray-500 font-medium">Venue</th>
                                                <th className="text-left pb-3 text-gray-500 font-medium">Date</th>
                                                <th className="text-left pb-3 text-gray-500 font-medium">Purpose</th>
                                                <th className="text-left pb-3 text-gray-500 font-medium">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                                            {pendingBookings.map(b => (
                                                <tr key={b._id}>
                                                    <td className="py-3 text-white font-medium">{b.user?.username || b.user}</td>
                                                    <td className="py-3 text-gray-300">{b.venue?.name || b.venue}</td>
                                                    <td className="py-3 text-gray-300">{new Date(b.date).toLocaleDateString()}</td>
                                                    <td className="py-3 text-gray-400">{b.purpose?.slice(0, 30)}</td>
                                                    <td className="py-3">
                                                        <div className="flex gap-2">
                                                            <button onClick={() => handleStatus(b._id, 'approved')}
                                                                className="text-xs px-3 py-1 rounded-lg font-semibold"
                                                                style={{ background: 'rgba(34,197,94,0.2)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.3)' }}>
                                                                ✓ Approve
                                                            </button>
                                                            <button onClick={() => handleStatus(b._id, 'rejected')}
                                                                className="text-xs px-3 py-1 rounded-lg font-semibold"
                                                                style={{ background: 'rgba(239,68,68,0.2)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' }}>
                                                                ✗ Reject
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* All bookings history */}
                        <div className="glass-card p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-bold text-white">📋 All Booking History</h2>
                                <button onClick={() => exportCSV(bookings, 'all_bookings.csv')}
                                    className="btn-glass text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1">
                                    📥 Export CSV
                                </button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm table-dark">
                                    <thead>
                                        <tr>
                                            <th className="text-left pb-3 text-gray-500 font-medium">User</th>
                                            <th className="text-left pb-3 text-gray-500 font-medium">Venue</th>
                                            <th className="text-left pb-3 text-gray-500 font-medium">Date</th>
                                            <th className="text-left pb-3 text-gray-500 font-medium">Purpose</th>
                                            <th className="text-left pb-3 text-gray-500 font-medium">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                                        {bookings.map(b => (
                                            <tr key={b._id}>
                                                <td className="py-3 text-white font-medium">{b.user?.username || b.user}</td>
                                                <td className="py-3 text-gray-300">{b.venue?.name || b.venue}</td>
                                                <td className="py-3 text-gray-300">{new Date(b.date).toLocaleDateString()}</td>
                                                <td className="py-3 text-gray-400">{b.purpose?.slice(0, 30)}</td>
                                                <td className="py-3"><StatusBadge status={b.status} /></td>
                                            </tr>
                                        ))}
                                        {bookings.length === 0 && (
                                            <tr><td colSpan={5} className="py-6 text-center text-gray-500">No bookings found.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}

                {/* ── FACULTY/USER VIEW ── */}
                {isUser && (
                    <>
                        {/* View Tabs */}
                        <div className="flex gap-4 mb-6 border-b border-gray-800 pb-2">
                            <button onClick={() => setViewMode('list')}
                                className={`text-sm font-bold pb-2 border-b-2 transition-colors ${viewMode === 'list' ? 'border-red-500 text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}>
                                Venues & Requests
                            </button>
                            <button onClick={() => setViewMode('calendar')}
                                className={`text-sm font-bold pb-2 border-b-2 transition-colors ${viewMode === 'calendar' ? 'border-red-500 text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}>
                                Availability Calendar
                            </button>
                        </div>

                        {viewMode === 'calendar' ? (
                            <CalendarView bookings={publicBookings} venues={venues} />
                        ) : (
                            <>
                                {/* Search & Filter Bar */}
                                <div className="glass-card p-4 mb-6 flex flex-wrap gap-3 items-center animate-fade-in-up">
                                    <input value={search} onChange={e => setSearch(e.target.value)}
                                        placeholder="🔍 Search venues..."
                                        className="input-dark flex-1 min-w-40" style={{ padding: '0.5rem 1rem' }} />
                                    <select value={filterType} onChange={e => setFilterType(e.target.value)}
                                        className="input-dark w-40" style={{ padding: '0.5rem 1rem' }}>
                                        <option value="all">All Types</option>
                                        <option value="classroom">Classrooms</option>
                                        <option value="seminar_hall">Seminar Halls</option>
                                    </select>
                                    <input type="number" value={filterCap} onChange={e => setFilterCap(e.target.value)}
                                        placeholder="Min capacity"
                                        className="input-dark w-36" style={{ padding: '0.5rem 1rem' }} />
                                    {(search || filterType !== 'all' || filterCap) && (
                                        <button onClick={() => { setSearch(''); setFilterType('all'); setFilterCap(''); }}
                                            className="text-sm px-3 py-2 rounded-lg"
                                            style={{ background: 'rgba(224,32,32,0.2)', color: '#f87171' }}>
                                            Clear ✕
                                        </button>
                                    )}
                                </div>

                                {/* Available Venues Grid */}
                                <h2 className="text-xl font-bold text-white mb-4">🏫 Available Venues
                                    <span className="text-sm font-normal text-gray-400 ml-2">({filteredVenues.length} found)</span>
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
                                    {filteredVenues.map((v, i) => (
                                        <div key={v._id} className="venue-card animate-fade-in-up"
                                            style={{ animationDelay: `${i * 0.07}s` }}>
                                            {/* Venue image or gradient placeholder */}
                                            {v.imageUrl ? (
                                                <img src={v.imageUrl} alt={v.name}
                                                    className="w-full h-32 object-cover rounded-xl mb-3" />
                                            ) : (
                                                <div className="w-full h-32 rounded-xl mb-3 flex items-center justify-center text-4xl"
                                                    style={{
                                                        background: v.type === 'classroom'
                                                            ? 'linear-gradient(135deg, rgba(37,99,235,0.2), rgba(15,23,42,0.8))'
                                                            : 'linear-gradient(135deg, rgba(79,70,229,0.2), rgba(15,23,42,0.8))'
                                                    }}>
                                                    {v.type === 'classroom' ? '📚' : '🎤'}
                                                </div>
                                            )}

                                            <div className="flex items-start justify-between mb-2">
                                                <h3 className="font-bold text-white">{v.name}</h3>
                                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${v.type === 'classroom' ? 'badge-classroom' : 'badge-seminar'}`}>
                                                    {v.type === 'classroom' ? 'Classroom' : 'Seminar Hall'}
                                                </span>
                                            </div>
                                            <p className="text-gray-400 text-sm mb-3">👥 Capacity: {v.capacity}</p>
                                            <button onClick={() => navigate(`/book/${v._id}`)}
                                                className="btn-primary w-full text-center text-sm">
                                                Request Booking →
                                            </button>
                                        </div>
                                    ))}
                                    {filteredVenues.length === 0 && (
                                        <div className="col-span-3 text-center py-10 text-gray-500">
                                            No venues match your search.
                                        </div>
                                    )}
                                </div>

                                {/* My Booking Requests */}
                                <div className="glass-card p-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <h2 className="text-lg font-bold text-white">📋 My Booking Requests</h2>
                                        <button onClick={() => exportCSV(myBookings, 'my_bookings.csv')}
                                            className="btn-glass text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1">
                                            📥 Export CSV
                                        </button>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm table-dark">
                                            <thead>
                                                <tr>
                                                    <th className="text-left pb-3 text-gray-500 font-medium">Venue</th>
                                                    <th className="text-left pb-3 text-gray-500 font-medium">Date &amp; Time</th>
                                                    <th className="text-left pb-3 text-gray-500 font-medium">Purpose</th>
                                                    <th className="text-left pb-3 text-gray-500 font-medium">Status</th>
                                                    <th className="text-left pb-3 text-gray-500 font-medium">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                                                {bookings.map(b => (
                                                    <tr key={b._id}>
                                                        <td className="py-3 text-white font-medium">{b.venue?.name || b.venue}</td>
                                                        <td className="py-3 text-gray-300 text-xs">
                                                            {new Date(b.date).toLocaleDateString()}<br />
                                                            <span className="text-gray-500">{b.startTime} – {b.endTime}</span>
                                                        </td>
                                                        <td className="py-3 text-gray-400">{b.purpose?.slice(0, 30)}</td>
                                                        <td className="py-3"><StatusBadge status={b.status} /></td>
                                                        <td className="py-3">
                                                            {b.status === 'pending' && (
                                                                <button onClick={() => handleCancel(b._id)}
                                                                    className="text-xs px-2 py-1 rounded-lg font-medium"
                                                                    style={{ background: 'rgba(224,32,32,0.15)', color: '#f87171' }}>
                                                                    Cancel
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                                {bookings.length === 0 && (
                                                    <tr><td colSpan={5} className="py-6 text-center text-gray-500">No requests yet.</td></tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </>
                        )}
                    </>
                )}
            </main>
        </div>
    );
};

export default Dashboard;
