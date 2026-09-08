import { BrowserRouter, Navigate, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { ReservationProvider } from './context/ReservationContext.jsx';

import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';

import LandingPage from './pages/LandingPage.jsx';
import RegistrationPage from './pages/RegistrationPage.jsx';
import GuestAccessLogin from './pages/GuestAccessLogin.jsx';
import PassPage from './pages/PassPage.jsx';
import StatusCheckPage from './pages/StatusCheckPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';

import './App.css';

function GuestProtectedRoute({ children }) {
  // Token validity and expiry are enforced by the API. This synchronous check
  // prevents unauthenticated visitors from rendering the registration form.
  if (!sessionStorage.getItem('kas_guest_access_token')) {
    return <Navigate to="/guest-access" replace />;
  }

  return children;
}

function AppLayout() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {!isAdminRoute && <Navbar />}
      
      <div style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/guest-access" element={<GuestAccessLogin />} />
          <Route path="/register" element={<GuestProtectedRoute><RegistrationPage /></GuestProtectedRoute>} />
          <Route path="/pass/:passId" element={<PassPage />} />
          <Route path="/status" element={<StatusCheckPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="*" element={<LandingPage />} />
        </Routes>
      </div>

      {!isAdminRoute && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ReservationProvider>
          <AppLayout />
        </ReservationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
