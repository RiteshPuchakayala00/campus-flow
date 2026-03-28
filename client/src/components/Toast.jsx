import { toast, Toaster } from 'react-hot-toast';

/* ─────────────────────────────────────────────
   useToast hook  –  call in any component
   const { toast, showToast } = useToast();
   showToast('Booking submitted!', 'success');
   ───────────────────────────────────────────── */
export const useToast = () => {
    const showToast = (message, type = 'success') => {
        const style = {
            background: 'linear-gradient(135deg, rgba(20,20,20,0.95), rgba(0,0,0,0.95))',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
            fontSize: '14px',
            padding: '12px 20px',
        };

        if (type === 'success') {
            toast.success(message, {
                style,
                iconTheme: { primary: '#4ade80', secondary: '#0d0d0d' }
            });
        } else if (type === 'error') {
            toast.error(message, {
                style: { ...style, border: '1px solid rgba(224,32,32,0.3)' },
                iconTheme: { primary: '#f87171', secondary: '#0d0d0d' }
            });
        } else {
            toast(message, {
                icon: 'ℹ️',
                style,
            });
        }
    };

    const closeToast = () => toast.dismiss();

    return { toast: null, showToast, closeToast }; // Return null to satisfy legacy usage
};

/* ─────────────────────────────────────────────
   Toast UI component wrapper around Toaster
   <Toast toast={toast} onClose={closeToast} />
   ───────────────────────────────────────────── */
const Toast = () => {
    return <Toaster position="bottom-right" reverseOrder={false} toastOptions={{ duration: 4000 }} />;
};

export default Toast;
