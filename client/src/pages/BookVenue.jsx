import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';
import Toast, { useToast } from '../components/Toast';

const BookVenue = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const { toast, showToast, closeToast } = useToast();

    const [venue, setVenue] = useState(null);
    const [date, setDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [purpose, setPurpose] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [canWaitlist, setCanWaitlist] = useState(false);

    useEffect(() => {
        api.get(`/venues`).then(r => {
            const v = r.data.find(v => v._id === id);
            setVenue(v || null);
        });
    }, [id]);

    const handleSubmit = async (e, isWaitlist = false) => {
        if (e) e.preventDefault();
        if (startTime >= endTime) {
            return showToast('End time must be after start time.', 'error');
        }
        setLoading(true);
        try {
            await api.post('/bookings', { venue: id, date, startTime, endTime, purpose, isWaitlist });
            setSuccess(true);
            showToast(isWaitlist ? 'Added to waitlist! ✓' : 'Booking request submitted! ✓', 'success');
            setTimeout(() => navigate('/dashboard'), 1800);
        } catch (err) {
            if (err.response?.status === 409 && err.response?.data?.canWaitlist) {
                setCanWaitlist(true);
                showToast(err.response.data.message, 'info');
            } else {
                showToast(err.response?.data?.message || 'Booking failed. Please try again.', 'error');
            }
        } finally {
            setLoading(false);
        }
    };

    if (!venue) return (
        <div className="bg-app flex h-screen items-center justify-center">
            <div className="w-10 h-10 rounded-full border-4 border-red-500 border-t-transparent animate-spin" />
        </div>
    );

    return (
        <div className="bg-app min-h-screen">
            <Toast toast={toast} onClose={closeToast} />

            {/* Navbar */}
            <nav className="navbar px-6 py-4 flex items-center gap-3">
                <button onClick={() => navigate('/dashboard')} className="text-gray-400 hover:text-red-400 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <span className="text-xl font-black gradient-text">Request Booking</span>
            </nav>

            <main className="max-w-xl mx-auto px-4 py-10">

                {/* Venue Hero */}
                <div className="rounded-2xl mb-6 overflow-hidden animate-fade-in-up">
                    {venue.imageUrl ? (
                        <img src={venue.imageUrl} alt={venue.name} className="w-full h-40 object-cover" />
                    ) : (
                        <div className="w-full h-40 flex items-center justify-center text-6xl"
                            style={{
                                background: venue.type === 'classroom'
                                    ? 'linear-gradient(135deg, rgba(26,110,245,0.4), #0d0d0d)'
                                    : 'linear-gradient(135deg, rgba(224,32,32,0.4), #0d0d0d)'
                            }}>
                            {venue.type === 'classroom' ? '📚' : '🎤'}
                        </div>
                    )}
                </div>

                {/* Venue info */}
                <div className="glass-card p-5 mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-xl font-black text-theme">{venue.name}</h1>
                            <p className="text-gray-400 text-sm mt-1">👥 Capacity: {venue.capacity}</p>
                        </div>
                        <span className={`text-xs px-3 py-1 rounded-full font-semibold ${venue.type === 'classroom' ? 'badge-classroom' : 'badge-seminar'}`}>
                            {venue.type === 'classroom' ? 'Classroom' : 'Seminar Hall'}
                        </span>
                    </div>
                </div>

                {/* Booking Form */}
                <div className="glass-card p-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                    <h2 className="text-lg font-bold text-theme mb-5">📝 Booking Details</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">Date</label>
                            <input type="date" value={date} onChange={e => setDate(e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                                className="input-dark" required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1.5">Start Time</label>
                                <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)}
                                    className="input-dark" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1.5">End Time</label>
                                <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)}
                                    className="input-dark" required />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">Purpose / Description</label>
                            <textarea value={purpose} onChange={e => setPurpose(e.target.value)}
                                rows={3} className="input-dark resize-none"
                                placeholder="e.g. CS101 extra class, Department seminar..." required />
                        </div>

                        {canWaitlist ? (
                            <div className="flex gap-3 mt-2">
                                <button type="button" onClick={() => handleSubmit(null, true)} disabled={loading || success}
                                    className="btn-primary flex-1" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
                                    {loading ? '⏳ Processing...' : '⏳ Join Waitlist'}
                                </button>
                                <button type="button" onClick={() => setCanWaitlist(false)} disabled={loading || success}
                                    className="btn-glass flex-1 rounded-lg font-medium text-sm">
                                    Cancel
                                </button>
                            </div>
                        ) : (
                            <button type="submit" disabled={loading || success}
                                className="btn-primary w-full mt-2">
                                {success ? '✓ Submitted! Redirecting...' : loading ? '⏳ Submitting...' : '🚀 Submit Booking Request'}
                            </button>
                        )}
                    </form>
                </div>
            </main>
        </div>
    );
};

export default BookVenue;
