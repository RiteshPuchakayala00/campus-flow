import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const features = [
    { icon: '🏫', title: 'Book Classrooms', desc: 'Reserve any classroom or seminar hall in seconds, no paperwork needed.' },
    { icon: '✅', title: 'Instant Approvals', desc: 'Admins approve or reject requests in real time — you get notified immediately.' },
    { icon: '🔐', title: 'Role-Based Access', desc: 'Faculty, Class Reps, and Admins each have tailored dashboards and permissions.' },
    { icon: '📊', title: 'Live Availability', desc: 'See which rooms are free right now and filter by capacity or type.' },
    { icon: '🌙', title: 'Dark Mode', desc: 'Easy on the eyes at any hour — switch between dark and light theme instantly.' },
    { icon: '📱', title: 'Mobile Friendly', desc: 'Access the system from your phone, tablet, or laptop anywhere on campus.' },
];

const LandingPage = () => {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    return (
        <div className="bg-app min-h-screen overflow-x-hidden">

            {/* ── Navbar ── */}
            <nav className="navbar px-8 py-4 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)' }}>
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    </div>
                    <span className="text-xl font-black gradient-text">Campus Flow</span>
                </div>
                <div className="flex items-center gap-3">
                    {user ? (
                        <button onClick={() => navigate('/dashboard')} className="btn-primary text-sm">
                            Go to Dashboard →
                        </button>
                    ) : (
                        <button onClick={() => navigate('/login')} className="btn-primary text-sm">
                            Sign In →
                        </button>
                    )}
                </div>
            </nav>

            {/* ── Hero ── */}
            <section className="relative overflow-hidden px-6 pt-24 pb-32 text-center">
                {/* Glowing orbs */}
                <div className="absolute -top-20 left-1/3 w-[500px] h-[500px] rounded-full opacity-10 blur-3xl pointer-events-none"
                    style={{ background: 'radial-gradient(circle,#2563eb,transparent)' }} />
                <div className="absolute top-10 right-1/4 w-80 h-80 rounded-full opacity-10 blur-3xl pointer-events-none"
                    style={{ background: 'radial-gradient(circle,#1a6ef5,transparent)' }} />

                <div className="relative z-10 max-w-4xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-6"
                        style={{ background: 'rgba(37,99,235,0.15)', color: '#60a5fa', border: '1px solid rgba(37,99,235,0.3)' }}>
                        🎓 Built for Campus Use
                    </div>
                    <h1 className="text-5xl sm:text-7xl font-black text-theme leading-tight mb-6">
                        Smart <span className="gradient-text">Venue Booking</span><br />for Your Campus
                    </h1>
                    <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                        Campus Flow lets faculty and class representatives instantly request classrooms and seminar halls, while admins manage approvals in real time — all from one beautiful dashboard.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button onClick={() => navigate('/login')} className="btn-primary text-base px-8 py-3">
                            🚀 Get Started — Sign In
                        </button>
                        <button onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
                            className="text-base px-8 py-3 rounded-xl font-semibold transition-all"
                            style={{ background: 'rgba(255,255,255,0.06)', color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.1)' }}>
                            Learn More ↓
                        </button>
                    </div>
                </div>
            </section>

            {/* ── Stats Bar ── */}
            <section className="px-6 py-10" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="max-w-4xl mx-auto grid grid-cols-3 gap-6 text-center">
                    {[['4+', 'Venues Available'], ['3', 'User Roles'], ['24/7', 'Access Anytime']].map(([val, label]) => (
                        <div key={label}>
                            <p className="text-4xl font-black gradient-text">{val}</p>
                            <p className="text-gray-400 text-sm mt-1">{label}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── Features ── */}
            <section id="features" className="px-6 py-20 max-w-6xl mx-auto">
                <div className="text-center mb-14">
                    <h2 className="text-4xl font-black text-theme mb-3">Everything You Need</h2>
                    <p className="text-gray-400">Powerful features built for modern campus management</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((f, i) => (
                        <div key={f.title} className="glass-card p-6 bg-card-hover animate-fade-in-up"
                            style={{ animationDelay: `${i * 0.08}s` }}>
                            <div className="text-3xl mb-4">{f.icon}</div>
                            <h3 className="text-theme font-bold text-lg mb-2">{f.title}</h3>
                            <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── How it works ── */}
            <section className="px-6 py-20 text-center"
                style={{ background: 'linear-gradient(135deg,rgba(37,99,235,0.06),rgba(79,70,229,0.04))' }}>
                <h2 className="text-4xl font-black text-theme mb-14">How It Works</h2>
                <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8">
                    {[
                        { step: '01', title: 'Sign In', desc: 'Login with your campus credentials — your role is automatically detected.' },
                        { step: '02', title: 'Pick a Venue', desc: 'Browse available classrooms and seminar halls, filter by size or type.' },
                        { step: '03', title: 'Get Approved', desc: 'Submit your request — admins review and approve it in real time.' },
                    ].map(s => (
                        <div key={s.step} className="glass-card p-6">
                            <div className="text-5xl font-black mb-3 gradient-text">{s.step}</div>
                            <h3 className="text-theme font-bold text-lg mb-2">{s.title}</h3>
                            <p className="text-gray-400 text-sm">{s.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── CTA ── */}
            <section className="px-6 py-24 text-center">
                <h2 className="text-4xl font-black text-theme mb-4">Ready to Get Started?</h2>
                <p className="text-gray-400 mb-8">Join your campus on Campus Flow today.</p>
                <button onClick={() => navigate('/login')} className="btn-primary text-lg px-10 py-4">
                    🚀 Sign In to Campus Flow
                </button>
            </section>

            {/* ── Footer ── */}
            <footer className="px-6 py-8 text-center text-gray-600 text-sm"
                style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                © 2026 Campus Flow · Smart Class & Halls Booking System · Group 15
            </footer>
        </div>
    );
};

export default LandingPage;
