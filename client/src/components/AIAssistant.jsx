import { useState, useEffect, useRef, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';

const AIAssistant = () => {
    const { user } = useContext(AuthContext);
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'ai', text: 'Hi! I am Campus AI 👋 How can I help you book a venue today?' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    // User can supply their own key in the UI if not set in backend
    const [showSettings, setShowSettings] = useState(false);
    const [apiKey, setApiKey] = useState(localStorage.getItem('gemini_api_key') || '');

    const messagesEndRef = useRef(null);
    const assistantRef = useRef(null);

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (assistantRef.current && !assistantRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isOpen]);

    // Don't show assistant if user is not logged in
    if (!user) return null;

    const saveSettings = () => {
        localStorage.setItem('gemini_api_key', apiKey);
        setShowSettings(false);
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = input.trim();
        setInput('');

        const newMessages = [...messages, { role: 'user', text: userMsg }];
        setMessages(newMessages);
        setLoading(true);

        try {
            const res = await api.post('/ai/chat', {
                messages: newMessages,
                apiKey: apiKey // send the key from localStorage if available
            });
            setMessages([...newMessages, { role: 'ai', text: res.data.reply }]);
        } catch (err) {
            if (err.response?.status === 401) {
                setShowSettings(true); // Prompt for key
                setMessages([...newMessages, { role: 'ai', text: 'Wait! We need a Gemini API Key to use Campus AI. Please add it in settings ⚙️' }]);
            } else {
                setMessages([...newMessages, { role: 'ai', text: 'Sorry, I ran into an error connecting to my brain. 🧠⚡' }]);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div ref={assistantRef} className="fixed bottom-6 right-6 z-50 flex flex-col items-end">

            {/* Chat Window */}
            {isOpen && (
                <div className="mb-4 w-80 sm:w-96 h-[500px] max-h-[70vh] flex flex-col overflow-hidden animate-fade-in-up rounded-2xl"
                    style={{ background: '#0d0d0d', border: '1px solid rgba(224,32,32,0.3)', boxShadow: '0 10px 40px rgba(0,0,0,0.5), 0 0 20px rgba(224,32,32,0.1)' }}>

                    {/* Header */}
                    <div className="p-4 flex items-center justify-between"
                        style={{ background: 'linear-gradient(135deg,rgba(224,32,32,0.2),rgba(123,13,13,0.4))', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">🤖</span>
                            <div>
                                <h3 className="font-bold text-white text-sm">Campus AI</h3>
                                <p className="text-[10px] text-gray-300">Powered by Gemini</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <button onClick={() => setShowSettings(!showSettings)} className="text-gray-400 hover:text-white p-1">⚙️</button>
                            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white p-1">✖️</button>
                        </div>
                    </div>

                    {/* API Key Settings Screen */}
                    {showSettings ? (
                        <div className="flex-1 p-5 flex flex-col bg-app">
                            <h4 className="text-white font-bold mb-2">AI Settings</h4>
                            <p className="text-xs text-gray-400 mb-4">
                                To use the AI Assistant, please provide your Google Gemini API Key. It is stored locally in your browser.
                            </p>
                            <input
                                type="password"
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                className="input-dark text-sm mb-3"
                                placeholder="AIzaSy..."
                            />
                            <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer"
                                className="text-xs text-blue-400 hover:underline mb-4 block">
                                Get a free key here ↗
                            </a>
                            <button onClick={saveSettings} className="btn-primary w-full py-2 text-sm">Save key & go back</button>
                        </div>
                    ) : (
                        <>
                            {/* Messages Area */}
                            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#0d0d0d] scrollbar-hide">
                                {messages.map((m, i) => (
                                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${m.role === 'user'
                                            ? 'bg-blue-600 outline-none text-white rounded-br-none'
                                            : 'text-gray-200 rounded-bl-none'
                                            }`}
                                            style={m.role === 'ai' ? { background: 'rgba(224,32,32,0.15)', border: '1px solid rgba(224,32,32,0.3)' } : {}}>
                                            {m.text}
                                        </div>
                                    </div>
                                ))}
                                {loading && (
                                    <div className="flex justify-start">
                                        <div className="max-w-[80%] rounded-2xl px-4 py-3 rounded-bl-none flex gap-1"
                                            style={{ background: 'rgba(224,32,32,0.15)', border: '1px solid rgba(224,32,32,0.3)' }}>
                                            <div className="w-1.5 h-1.5 bg-red-400 rounded-full animate-bounce"></div>
                                            <div className="w-1.5 h-1.5 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                            <div className="w-1.5 h-1.5 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input Area */}
                            <div className="p-3 bg-[#111]" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                                <form onSubmit={handleSend} className="relative flex items-center">
                                    <input
                                        type="text"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        placeholder="Ask about venues or bookings..."
                                        className="w-full bg-gray-900 text-white text-sm rounded-full pl-4 pr-10 py-3 outline-none focus:ring-1 focus:ring-red-500 transition-shadow"
                                        style={{ border: '1px solid rgba(255,255,255,0.1)' }}
                                    />
                                    <button type="submit" disabled={!input.trim() || loading}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center disabled:opacity-50 transition-colors bg-red-600 hover:bg-red-500 text-white">
                                        <svg className="w-4 h-4 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                        </svg>
                                    </button>
                                </form>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-xl transition-transform hover:scale-105"
                style={{
                    background: 'linear-gradient(135deg,#e02020,#1a6ef5)',
                    boxShadow: '0 4px 20px rgba(224,32,32,0.4)',
                    border: '2px solid rgba(255,255,255,0.1)'
                }}>
                {isOpen ? '💬' : '🤖'}
            </button>
        </div>
    );
};

export default AIAssistant;
