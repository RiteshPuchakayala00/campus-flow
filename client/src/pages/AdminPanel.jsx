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
            setVName(''); setVType('classroom'); setVCap(60); setVImageUrl(''); setVBranch(user?.branch || 'General');
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
            setUName(''); setUPass(''); setURole('faculty'); setUBranch(user?.branch || 'General');
            showToast(`User "${res.data.username}" added! ✓`, 'success');
        } catch (err) {
            showToast(err.response?.data?.message || 'Error adding user', 'error');
        } finally {
            setULoading(false);
        }
    };

    const isSysAdmin = user?.role === 'sysadmin';
    const filteredUsers = users.filter(u => isSysAdmin || u.branch === user?.branch);
    const filteredVenues = venues.filter(v => isSysAdmin || v.branch === user?.branch);

    const statCards = [
        { label: 'Total Users', value: filteredUsers.length, color: '#c084fc' },
        { label: 'Total Venues', value: filteredVenues.length, color: '#60a5fa' },
    ];

    // Initial branch effect
    useEffect(() => {
        if (user?.branch && !isSysAdmin) {
            setVBranch(user.branch);
            setUBranch(user.branch);
        }
    }, [user, isSysAdmin]);

    return (
        <div className="bg-app min-h-screen">
            <Toast toast={toast} onClose={closeToast} />
            <ConfirmationModal 
                isOpen={confirmDelete.isOpen} 
                onConfirm={handleConfirmDelete}
                onCancel={() => setConfirmDelete(prev => ({ ...prev, isOpen: false }))}
                title={confirmDelete.title}
                message={confirmDelete.message}
            />
            <ScheduleModal venue={scheduleModalVenue} onClose={() => setScheduleModalVenue(null)} />

            {/* Navbar */}
            <nav className="navbar px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
                    <span className="text-xl font-black gradient-text">Campus Flow</span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 uppercase tracking-widest">
                        {isSysAdmin ? 'Admin Portal' : `${user?.branch} Management`}
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate('/dashboard')} className="btn-glass text-sm font-semibold px-4 py-2 rounded-xl">
                        ← Back to Dashboard
                    </button>
                    <button onClick={toggle} className="p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
                        {isDark ? '☀️' : '🌙'}
                    </button>
                    <span className="text-sm text-gray-400">{user?.username}</span>
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
                            <select value={vBranch} onChange={e => setVBranch(e.target.value)} className="input-dark" disabled={!isSysAdmin}>
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
                                    <th className="text-left pb-3 text-gray-500 font-medium">Capacity</th>
                                    <th className="text-left pb-3 text-gray-500 font-medium">Branch</th>
                                    <th className="text-left pb-3 text-gray-500 font-medium">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                                {filteredVenues.map(v => (
                                    <tr key={v._id}>
                                        <td className="py-3 text-white font-medium">{v.name}</td>
                                        <td className="py-3 text-gray-400 capitalize">{v.type?.replace('_', ' ')}</td>
                                        <td className="py-3 text-gray-400">{v.capacity}</td>
                                        <td className="py-3">
                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">
                                                {v.branch || 'General'}
                                            </span>
                                        </td>
                                        <td className="py-3 text-right">
                                            <div className="flex justify-end gap-3">
                                                <button onClick={() => setScheduleModalVenue(v)}
                                                    className="text-purple-400 hover:text-purple-300">
                                                    Schedule
                                                </button>
                                                <button onClick={() => deleteVenue(v._id, v.name)}
                                                    className="text-red-400 hover:text-red-300">
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
                        <div className="flex-1 min-w-44">
                            <label className="block text-xs text-gray-400 mb-1">Role</label>
                            <select value={uRole} onChange={e => setURole(e.target.value)} className="input-dark">
                                <option value="faculty">Faculty</option>
                                <option value="cr">Class Representative</option>
                                <option value="event_organizer">Event Organizer</option>
                                {isSysAdmin && (
                                    <>
                                        <option value="classroom_admin">Classroom Admin</option>
                                        <option value="seminar_admin">Seminar Admin</option>
                                    </>
                                )}
                            </select>
                        </div>
                        <div className="flex-1 min-w-40">
                            <label className="block text-xs text-gray-400 mb-1">Password</label>
                            <input type="password" value={uPass} onChange={e => setUPass(e.target.value)}
                                className="input-dark" placeholder="password123" required minLength="6" />
                        </div>
                        <div className="w-32">
                            <label className="block text-xs text-gray-400 mb-1">Branch</label>
                            <select value={uBranch} onChange={e => setUBranch(e.target.value)} className="input-dark" disabled={!isSysAdmin}>
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
                    <h2 className="text-lg font-bold text-theme mb-4">👥 System Users ({filteredUsers.length})</h2>
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
                                {filteredUsers.map(u => (
                                    <tr key={u._id}>
                                        <td className="py-3 text-white font-medium">{u.username}</td>
                                        <td className="py-3 text-gray-400 capitalize">{u.role?.replace('_', ' ')}</td>
                                        <td className="py-3">
                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">
                                                {u.branch || 'General'}
                                            </span>
                                        </td>
                                        <td className="py-3">
                                            {u.username !== user?.username && (
                                                <button onClick={() => deleteUser(u._id, u.username)}
                                                    className="text-red-400 hover:text-red-300 transition-colors">
                                                    Delete
                                                </button>
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
