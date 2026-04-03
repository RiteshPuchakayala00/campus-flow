import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../api/axios';
import Toast, { useToast } from '../components/Toast';
import ConfirmationModal from '../components/ConfirmationModal';
import ScheduleModal from '../components/ScheduleModal';

const AdminPanel = () => {
    const { user, logout } = useContext(AuthContext);
    const { isDark, toggle } = useTheme();
    const navigate = useNavigate();
    const { toast, showToast, closeToast } = useToast();

    const [users, setUsers] = useState([]);
    const [venues, setVenues] = useState([]);

    // Safety Confirmation State
    const [confirmDelete, setConfirmDelete] = useState({
        isOpen: false,
        type: null, // 'user' or 'venue'
        id: null,
        title: '',
        message: ''
    });

    // Add venue form
    const [vName, setVName] = useState('');
    const [vType, setVType] = useState('classroom');
    const [vCap, setVCap] = useState(60);
    const [vImageUrl, setVImageUrl] = useState('');
    const [vBranch, setVBranch] = useState('General');
    const [vLoading, setVLoading] = useState(false);

    // Master schedule modal
    const [scheduleModalVenue, setScheduleModalVenue] = useState(null);

    // Add user form
    const [uName, setUName] = useState('');
    const [uPass, setUPass] = useState('');
    const [uRole, setURole] = useState('faculty');
    const [uBranch, setUBranch] = useState('General');
    const [uLoading, setULoading] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                const [u, v] = await Promise.all([api.get('/admin/users'), api.get('/venues')]);
                setUsers(u.data);
                setVenues(v.data);
            } catch {
                showToast('Failed to load data', 'error');
            }
        };
        load();
    }, []);

    const deleteUser = (id, name) => {
        setConfirmDelete({
            isOpen: true,
            type: 'user',
            id: id,
            title: 'Delete User?',
            message: `Are you sure you want to permanently delete user "${name}"? This action cannot be undone.`
        });
    };

    const deleteVenue = (id, name) => {
        setConfirmDelete({
            isOpen: true,
            type: 'venue',
            id: id,
            title: 'Delete Venue?',
            message: `Are you sure you want to permanently delete venue "${name}"? This will remove all associated data.`
        });
    };

    const handleConfirmDelete = async () => {
        const { type, id } = confirmDelete;
        setConfirmDelete(prev => ({ ...prev, isOpen: false }));
        
        try {
            if (type === 'user') {
                await api.delete(`/admin/users/${id}`);
                setUsers(prev => prev.filter(u => u._id !== id));
                showToast('User deleted', 'info');
            } else {
                await api.delete(`/admin/venues/${id}`);
                setVenues(prev => prev.filter(v => v._id !== id));
                showToast('Venue deleted', 'info');
            }
        } catch (err) {
            showToast(err.response?.data?.message || `Error deleting ${type}`, 'error');
        }
    };

    const addVenue = async (e) => {
        e.preventDefault();
        setVLoading(true);
        try {
            const res = await api.post('/admin/venues', { 
                name: vName, 
                type: vType, 
                capacity: Number(vCap), 
                imageUrl: vImageUrl, 
                branch: vBranch 
            });
            setVenues(prev => [...prev, res.data]);
            setVName(''); setVType('classroom'); setVCap(60); setVImageUrl(''); setVBranch('General');
            showToast(`Venue "${res.data.name}" added! ✓`, 'success');
        } catch (err) {
            showToast(err.response?.data?.message || 'Error adding venue', 'error');
        } finally {
            setVLoading(false);
        }
    };

    const addUser = async (e) => {
        e.preventDefault();
        setULoading(true);
        try {
            const res = await api.post('/admin/users', { 
                username: uName, 
                password: uPass, 
                role: uRole,
                branch: uBranch
            });
            setUsers(prev => [...prev, res.data]);
            setUName(''); setUPass(''); setURole('faculty'); setUBranch('General');
            showToast(`User "${res.data.username}" added! ✓`, 'success');
        } catch (err) {
            showToast(err.response?.data?.message || 'Error adding user', 'error');
        } finally {
            setULoading(false);
        }
    };

    const statCards = [
        { label: 'Total Users', value: users.length, color: '#c084fc' },
        { label: 'Total Venues', value: venues.length, color: '#60a5fa' },
        { label: 'Classrooms', value: venues.filter(v => v.type === 'classroom').length, color: '#4ade80' },
        { label: 'Seminar Halls', value: venues.filter(v => v.type === 'seminar_hall').length, color: '#f87171' },
    ];

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
                    <span className="text-xl font-black"
                        style={{ background: 'linear-gradient(90deg,#c084fc,#1a6ef5)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        ⚙️ System Admin Panel
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={toggle} className="p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
                        {isDark ? '☀️' : '🌙'}
                    </button>
                    <span className="text-sm text-gray-400">{user?.username}</span>
                    <button onClick={() => { logout(); navigate('/login'); }}
                        className="text-sm px-3 py-1.5 rounded-lg"
                        style={{ background: 'rgba(224,32,32,0.15)', color: '#f87171' }}>
                        Logout
                    </button>
                </div>
            </nav>

            <main className="max-w-5xl mx-auto px-4 py-8">

                {/* Stat Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                    {statCards.map(c => (
                        <div key={c.label} className="glass-card p-5 animate-fade-in-up">
                            <p className="text-xs text-gray-500 uppercase font-medium mb-1">{c.label}</p>
                            <p className="text-3xl font-black" style={{ color: c.color }}>{c.value}</p>
                        </div>
                    ))}
                </div>

                {/* Add Venue Form */}
                <div className="glass-card p-6 mb-8 animate-fade-in-up">
                    <h2 className="text-lg font-bold text-theme mb-5">➕ Add New Venue</h2>
                    <form onSubmit={addVenue} className="flex flex-wrap gap-3 items-end">
                        <div className="flex-1 min-w-40">
                            <label className="block text-xs text-gray-400 mb-1">Venue Name</label>
                            <input value={vName} onChange={e => setVName(e.target.value)}
                                className="input-dark" placeholder="e.g. Room 103" required />
                        </div>
                        <div className="w-36">
                            <label className="block text-xs text-gray-400 mb-1">Type</label>
                            <select value={vType} onChange={e => setVType(e.target.value)} className="input-dark">
                                <option value="classroom">Classroom</option>
                                <option value="seminar_hall">Seminar Hall</option>
                            </select>
                        </div>
                        <div className="w-28">
                            <label className="block text-xs text-gray-400 mb-1">Capacity</label>
                            <input type="number" value={vCap} onChange={e => setVCap(e.target.value)}
                                className="input-dark" min={1} required />
                        </div>
                        <div className="flex-1 min-w-48">
                            <label className="block text-xs text-gray-400 mb-1">Image URL (optional)</label>
                            <input value={vImageUrl} onChange={e => setVImageUrl(e.target.value)}
                                className="input-dark" placeholder="https://..." />
                        </div>
                        <div className="w-32">
                            <label className="block text-xs text-gray-400 mb-1">Branch</label>
                            <select value={vBranch} onChange={e => setVBranch(e.target.value)} className="input-dark">
                                <option value="General">General</option>
                                <option value="CSE">CSE</option>
                                <option value="ECE">ECE</option>
                                <option value="AIDS">AIDS</option>
                            </select>
                        </div>
                        <button type="submit" disabled={vLoading} className="btn-primary whitespace-nowrap">
                            {vLoading ? '⏳ Adding...' : '➕ Add Venue'}
                        </button>
                    </form>
                </div>

                {/* Venues Table */}
                <div className="glass-card p-6 mb-8 animate-fade-in-up">
                    <h2 className="text-lg font-bold text-theme mb-4">🏫 Venues ({venues.length})</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm table-dark">
                            <thead>
                                <tr>
                                    <th className="text-left pb-3 text-gray-500 font-medium">Name</th>
                                    <th className="text-left pb-3 text-gray-500 font-medium">Type</th>
                                    <th className="text-left pb-3 text-gray-500 font-medium">Branch</th>
                                    <th className="text-left pb-3 text-gray-500 font-medium">Capacity</th>
                                    <th className="text-left pb-3 text-gray-500 font-medium">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                                {venues.map(v => (
                                    <tr key={v._id}>
                                        <td className="py-3 text-theme font-medium">{v.name}</td>
                                        <td className="py-3">
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${v.type === 'classroom' ? 'badge-classroom' : 'badge-seminar'}`}>
                                                {v.type === 'classroom' ? 'Classroom' : 'Seminar Hall'}
                                            </span>
                                        </td>
                                        <td className="py-3">
                                            <span className="text-xs font-bold text-slate-500 uppercase">
                                                {v.branch || 'General'}
                                            </span>
                                        </td>
                                        <td className="py-3 text-gray-300">{v.capacity}</td>
                                        <td className="py-3">
                                            <div className="flex gap-2">
                                                <button onClick={() => setScheduleModalVenue(v)}
                                                    className="text-xs px-2 py-1 rounded-lg font-medium"
                                                    style={{ background: 'rgba(59,130,246,0.15)', color: '#60a5fa' }}>
                                                    Schedule
                                                </button>
                                                <button onClick={() => deleteVenue(v._id, v.name)}
                                                    className="text-xs px-2 py-1 rounded-lg font-medium"
                                                    style={{ background: 'rgba(224,32,32,0.15)', color: '#f87171' }}>
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Add User Form */}
                <div className="glass-card p-6 mb-8 animate-fade-in-up">
                    <h2 className="text-lg font-bold text-theme mb-5">➕ Add New User</h2>
                    <form onSubmit={addUser} className="flex flex-wrap gap-3 items-end">
                        <div className="flex-1 min-w-40">
                            <label className="block text-xs text-gray-400 mb-1">Username</label>
                            <input value={uName} onChange={e => setUName(e.target.value)}
                                className="input-dark" placeholder="e.g. faculty_john" required />
                        </div>
                        <div className="w-40">
                            <label className="block text-xs text-gray-400 mb-1">Role</label>
                            <select value={uRole} onChange={e => setURole(e.target.value)} className="input-dark">
                                <option value="faculty">Faculty</option>
                                <option value="cr">Class Representative</option>
                                <option value="classroom_admin">Classroom Admin</option>
                                <option value="seminar_admin">Seminar Admin</option>
                            </select>
                        </div>
                        <div className="flex-1 min-w-40">
                            <label className="block text-xs text-gray-400 mb-1">Password</label>
                            <input type="password" value={uPass} onChange={e => setUPass(e.target.value)}
                                className="input-dark" placeholder="password123" required minLength="6" />
                        </div>
                        <div className="w-32">
                            <label className="block text-xs text-gray-400 mb-1">Branch</label>
                            <select value={uBranch} onChange={e => setUBranch(e.target.value)} className="input-dark">
                                <option value="General">General</option>
                                <option value="CSE">CSE</option>
                                <option value="ECE">ECE</option>
                                <option value="AIDS">AIDS</option>
                            </select>
                        </div>
                        <button type="submit" disabled={uLoading} className="btn-primary whitespace-nowrap">
                            {uLoading ? '⏳ Adding...' : '➕ Add User'}
                        </button>
                    </form>
                </div>

                {/* Users Table */}
                <div className="glass-card p-6 animate-fade-in-up">
                    <h2 className="text-lg font-bold text-theme mb-4">👥 System Users ({users.length})</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm table-dark">
                            <thead>
                                <tr>
                                    <th className="text-left pb-3 text-gray-500 font-medium">Username</th>
                                    <th className="text-left pb-3 text-gray-500 font-medium">Role</th>
                                    <th className="text-left pb-3 text-gray-500 font-medium">Branch</th>
                                    <th className="text-left pb-3 text-gray-500 font-medium">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                                {users.map(u => (
                                    <tr key={u._id}>
                                        <td className="py-3 text-theme font-medium">{u.username}</td>
                                        <td className="py-3">
                                            <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                                                style={{
                                                    background: u.role === 'sysadmin' ? 'rgba(147,51,234,0.2)' : 'rgba(26,110,245,0.2)',
                                                    color: u.role === 'sysadmin' ? '#c084fc' : '#60a5fa',
                                                    border: u.role === 'sysadmin' ? '1px solid rgba(147,51,234,0.3)' : '1px solid rgba(26,110,245,0.3)'
                                                }}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="py-3">
                                            <span className="text-xs font-bold text-slate-500 uppercase">
                                                {u.branch || 'General'}
                                            </span>
                                        </td>
                                        <td className="py-3">
                                            {u.role !== 'sysadmin' ? (
                                                <button onClick={() => deleteUser(u._id, u.username)}
                                                    className="text-xs px-2 py-1 rounded-lg"
                                                    style={{ background: 'rgba(224,32,32,0.15)', color: '#f87171' }}>
                                                    Delete
                                                </button>
                                            ) : (
                                                <span className="text-xs text-gray-600">Protected</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <ConfirmationModal 
                    isOpen={confirmDelete.isOpen}
                    title={confirmDelete.title}
                    message={confirmDelete.message}
                    onConfirm={handleConfirmDelete}
                    onCancel={() => setConfirmDelete(prev => ({ ...prev, isOpen: false }))}
                    confirmText="Delete Permanently"
                />

                <ScheduleModal
                    isOpen={!!scheduleModalVenue}
                    venue={scheduleModalVenue}
                    onUpdateAlert={showToast}
                    onClose={(updatedVenue) => {
                        setScheduleModalVenue(null);
                        if (updatedVenue) {
                            setVenues(prev => prev.map(v => v._id === updatedVenue._id ? updatedVenue : v));
                        }
                    }}
                />

            </main>
        </div>
    );
};

export default AdminPanel;
