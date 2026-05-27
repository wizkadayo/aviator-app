import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Navbar          from './components/Navbar/Navbar';
import Footer          from './components/Footer/Footer';
import ProtectedRoute  from './components/ProtectedRoute/ProtectedRoute';
import Home            from './pages/Home/Home';
import Login           from './pages/Login/Login';
import Register        from './pages/Register/Register';
import ForgotPassword  from './pages/ForgotPassword/ForgotPassword';
import ResetPassword   from './pages/ResetPassword/ResetPassword';
import Play            from './pages/Play/Play';
import Deposit         from './pages/Deposit/Deposit';
import Withdraw        from './pages/Withdraw/Withdraw';
import Profile         from './pages/Profile/Profile';
import History         from './pages/History/History';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1a1a2e',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.1)',
            },
            duration: 4000,
          }}
        />
        <Navbar />
        <Routes>
          <Route path="/"                element={<Home />} />
          <Route path="/login"           element={<Login />} />
          <Route path="/register"        element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password"  element={<ResetPassword />} />
          <Route path="/play"     element={<ProtectedRoute><Play /></ProtectedRoute>} />
          <Route path="/deposit"  element={<ProtectedRoute><Deposit /></ProtectedRoute>} />
          <Route path="/withdraw" element={<ProtectedRoute><Withdraw /></ProtectedRoute>} />
          <Route path="/profile"  element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/history"  element={<ProtectedRoute><History /></ProtectedRoute>} />
          <Route path="*"         element={<Navigate to="/" />} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </AuthProvider>
  );
}