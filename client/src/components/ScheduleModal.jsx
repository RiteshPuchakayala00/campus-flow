import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';

const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const ScheduleModal = ({ isOpen, onClose, venue, onUpdateAlert }) => {
    const [schedule, setSchedule] = useState([]);
    const [day, setDay] = useState(1);
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [label, setLabel] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (venue) setSchedule(venue.weekly_schedule || []);
    }, [venue]);

    if (!isOpen || !venue) return null;

    const handleAdd = () => {
        if (!startTime || !endTime || !label) {
            return onUpdateAlert('Please fill all fields', 'error');
        }
        if (startTime >= endTime) {
            return onUpdateAlert('End time must be after start time', 'error');
        }

        const newBlock = { day, start_time: startTime, end_time: endTime, label };
        setSchedule(prev => [...prev, newBlock].sort((a,b) => a.day - b.day || a.start_time.localeCompare(b.start_time)));
        
        setStartTime('');
        setEndTime('');
        setLabel('');
    };

    const handleRemove = (index) => {
        setSchedule(prev => prev.filter((_, i) => i !== index));
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const res = await api.put(`/admin/venues/${venue._id}/schedule`, { weekly_schedule: schedule });
            onUpdateAlert('Master schedule saved!', 'success');
            onClose(res.data); // Pass updated venue back
        } catch (err) {
            onUpdateAlert(err.response?.data?.message || 'Failed to save', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => onClose()} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
                
                <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="glass-card w-full max-w-2xl overflow-hidden z-10 relative flex flex-col max-h-[90vh]">
                    
                    <div className="p-6 border-b border-white/10 flex justify-between items-center bg-black/20">
                        <div>
                            <h2 className="text-xl font-bold text-white">📅 Master Schedule</h2>
                            <p className="text-sm text-gray-400">Lock timeslots for "{venue.name}"</p>
                        </div>
                        <button onClick={() => onClose()} className="text-gray-400 hover:text-white px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">✕</button>
                    </div>

                    <div className="p-6 overflow-y-auto" style={{ maxHeight: '60vh' }}>
                        {/* Add Form */}
                        <div className="flex flex-wrap gap-3 items-end mb-6 p-4 rounded-xl shadow-inner bg-black/20" style={{ border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div className="w-32">
                                <label className="block text-xs text-gray-400 mb-1">Day</label>
                                <select value={day} onChange={e => setDay(Number(e.target.value))} className="input-dark text-sm" style={{ padding: '0.4rem' }}>
                                    {days.map((d, i) => (
                                        <option key={i} value={i}>{d}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs text-gray-400 mb-1">Start</label>
                                <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="input-dark text-sm" style={{ padding: '0.4rem' }} />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-400 mb-1">End</label>
                                <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className="input-dark text-sm" style={{ padding: '0.4rem' }} />
                            </div>
                            <div className="flex-1 min-w-[150px]">
                                <label className="block text-xs text-gray-400 mb-1">Class/Event Label</label>
                                <input type="text" value={label} onChange={e => setLabel(e.target.value)} className="input-dark text-sm" style={{ padding: '0.4rem' }} placeholder="e.g. CS101 Lecture" />
                            </div>
                            <button onClick={handleAdd} className="btn-primary py-1.5 px-4 text-sm font-semibold whitespace-nowrap shadow-blue-500/20">Add Block</button>
                        </div>

                        {/* Schedule List */}
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="font-bold text-sm text-gray-300">Current Locked Slots ({schedule.length})</h3>
                            <span className="text-xs text-gray-500 italic">No one can book these slots</span>
                        </div>
                        
                        <div className="space-y-2">
                            {schedule.length === 0 ? (
                                <p className="text-gray-500 text-sm text-center py-4 bg-black/10 rounded-lg border border-white/5 border-dashed">No recurring classes scheduled yet.</p>
                            ) : null}
                            
                            {schedule.map((block, index) => (
                                <div key={index} className="flex justify-between items-center p-3 rounded-lg hover:bg-white/5 transition-colors group" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div className="flex items-center gap-4">
                                        <span className="w-24 text-sm font-bold text-blue-400">{days[block.day]}</span>
                                        <span className="text-sm font-mono text-gray-300 bg-white/5 px-2 py-0.5 rounded shadow-inner">{block.start_time} - {block.end_time}</span>
                                        <span className="text-sm text-white font-medium ml-2">{block.label}</span>
                                    </div>
                                    <button onClick={() => handleRemove(index)} className="text-red-400 hover:text-red-300 hover:bg-red-400/20 text-xs font-semibold px-2 py-1 bg-red-400/10 rounded transition-colors opacity-80 group-hover:opacity-100">Remove</button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="p-5 border-t border-white/10 flex justify-end gap-3 bg-black/40 backdrop-blur-md">
                        <button onClick={() => onClose()} className="px-5 py-2 rounded-xl text-sm font-semibold text-gray-300 bg-white/5 hover:bg-white/10 transition-colors">Discard</button>
                        <button onClick={handleSave} disabled={loading} className="btn-primary px-6 py-2 text-sm shadow-blue-500/30">
                            {loading ? 'Saving...' : 'Save Master Schedule'}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ScheduleModal;
