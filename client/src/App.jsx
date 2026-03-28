import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { AnimatePresence, motion } from 'framer-motion';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import BookVenue from './pages/BookVenue';
import AdminPanel from './pages/AdminPanel';
import ProfilePage from './pages/ProfilePage';
import LandingPage from './pages/LandingPage';
import AIAssistant from './components/AIAssistant';
import Toast from './components/Toast';

// ProtectedRoute: blocks access to pages that require login
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return (
    <div className="flex h-screen items-center justify-center"
      style={{ background: '#0d0d0d', color: '#e02020' }}>
      <div className="text-center">
        <div className="w-10 h-10 rounded-full border-4 border-red-500 border-t-transparent animate-spin mx-auto mb-3" />
        <p className="text-gray-400 text-sm">Loading...</p>
      </div>
    </div>
  );
  if (!user) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/dashboard" />;
  return children;
};

// Animation settings
const pageVariants = {
  initial: { opacity: 0, y: 15 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, scale: 0.98 }
};
const pageTransition = {
  type: 'tween',
  ease: 'easeInOut',
  duration: 0.3
};

const AnimatedPage = ({ children }) => (
  <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition} className="min-h-screen">
    {children}
  </motion.div>
);

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<AnimatedPage><LandingPage /></AnimatedPage>} />
        <Route path="/login" element={<AnimatedPage><Login /></AnimatedPage>} />
        <Route path="/dashboard" element={<ProtectedRoute><AnimatedPage><Dashboard /></AnimatedPage></ProtectedRoute>} />
        <Route path="/book/:id" element={<ProtectedRoute allowedRoles={['faculty', 'cr', 'event_organizer']}><AnimatedPage><BookVenue /></AnimatedPage></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute allowedRoles={['sysadmin']}><AnimatedPage><AdminPanel /></AnimatedPage></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><AnimatedPage><ProfilePage /></AnimatedPage></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AnimatedRoutes />
          <AIAssistant />
          <Toast /> {/* Render react-hot-toast Toaster globally */}
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
