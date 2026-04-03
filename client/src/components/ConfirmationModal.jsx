import { motion, AnimatePresence } from 'framer-motion';

const ConfirmationModal = ({ isOpen, title, message, onConfirm, onCancel, confirmText = "Confirm", cancelText = "Cancel", type = "danger" }) => {
    if (!isOpen) return null;

    const colors = {
        danger: {
            bg: 'rgba(224,32,32,0.1)',
            border: 'rgba(224,32,32,0.3)',
            btn: 'btn-red',
            text: 'text-red-400'
        },
        warning: {
            bg: 'rgba(251,191,36,0.1)',
            border: 'rgba(251,191,36,0.3)',
            btn: 'btn-amber',
            text: 'text-amber-400'
        },
        info: {
            bg: 'rgba(59,130,246,0.1)',
            border: 'rgba(59,130,246,0.3)',
            btn: 'btn-primary',
            text: 'text-blue-400'
        }
    };

    const style = colors[type] || colors.danger;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onCancel}
                    className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                />

                {/* Modal */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="glass-card w-full max-w-sm overflow-hidden z-10 relative border"
                    style={{ borderColor: style.border }}
                >
                    <div className="p-6 text-center">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${style.text}`}
                            style={{ background: style.bg, border: `1px solid ${style.border}` }}>
                            {type === 'danger' ? (
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 15c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            ) : type === 'warning' ? (
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            ) : (
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            )}
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2">{title}</h2>
                        <p className="text-gray-400 text-sm mb-6">{message}</p>
                        
                        <div className="flex gap-3">
                            <button 
                                onClick={onCancel}
                                className="flex-1 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-sm font-semibold transition-all border border-white/10"
                            >
                                {cancelText}
                            </button>
                            <button 
                                onClick={onConfirm}
                                className={`flex-1 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all shadow-lg ${
                                    type === 'danger' ? 'bg-red-600 hover:bg-red-500 shadow-red-900/20' : 
                                    type === 'warning' ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-900/20' : 
                                    'bg-blue-600 hover:bg-blue-500 shadow-blue-900/20'
                                }`}
                            >
                                {confirmText}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ConfirmationModal;
