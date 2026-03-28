import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const AnalyticsChart = ({ bookings }) => {
    // 1. Process data for Bar Chart (Bookings per Day)
    const bookingsByDate = bookings.reduce((acc, current) => {
        const dateStr = new Date(current.date).toLocaleDateString();
        acc[dateStr] = (acc[dateStr] || 0) + 1;
        return acc;
    }, {});

    const barData = Object.keys(bookingsByDate).map(date => ({
        date,
        count: bookingsByDate[date]
    })).sort((a, b) => new Date(a.date) - new Date(b.date)).slice(-7); // Last 7 days

    // 2. Process data for Pie Chart (Status Distribution)
    const statusCounts = bookings.reduce((acc, current) => {
        acc[current.status] = (acc[current.status] || 0) + 1;
        return acc;
    }, { pending: 0, approved: 0, rejected: 0, cancelled: 0 });

    const pieData = Object.keys(statusCounts)
        .filter(key => statusCounts[key] > 0)
        .map(key => ({
            name: key.charAt(0).toUpperCase() + key.slice(1),
            value: statusCounts[key]
        }));

    const COLORS = {
        Pending: '#fbbf24',    // yellow
        Approved: '#4ade80',   // green
        Rejected: '#f87171',   // red
        Cancelled: '#9ca3af'   // gray
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Bar Chart: Bookings over Time */}
            <div className="glass-card p-6">
                <h3 className="text-lg font-bold text-white mb-6">📈 Booking Requests (Last 7 Active Days)</h3>
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                            <Tooltip
                                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#f8fafc' }}
                            />
                            <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Pie Chart: Status Distribution */}
            <div className="glass-card p-6">
                <h3 className="text-lg font-bold text-white mb-6">📊 Request Status Distribution</h3>
                <div className="h-64 w-full flex items-center justify-center">
                    {pieData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={90}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#3b82f6'} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#f8fafc' }}
                                />
                                <Legend wrapperStyle={{ fontSize: '12px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <p className="text-slate-500 text-sm">No bookings data to display</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AnalyticsChart;
