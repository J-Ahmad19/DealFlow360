import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import PortalLogin from './pages/portal/PortalLogin';
import PortalVerify from './pages/portal/PortalVerify';
import PortalDashboard from './pages/portal/PortalDashboard';
import { AuthProvider, useAuth } from './contexts/AuthContext';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return <>{children}</>;
}

function PortalProtectedRoute({ children }: { children: React.ReactNode }) {
  const { customer, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!customer) return <Navigate to="/portal/login" />;
  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Landing Page */}
          <Route path="/" element={<Landing />} />

          {/* Internal Auth */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />

          {/* Customer Portal Auth */}
          <Route path="/portal/login" element={<PortalLogin />} />
          <Route path="/portal/verify" element={<PortalVerify />} />
          <Route 
            path="/portal/dashboard" 
            element={
              <PortalProtectedRoute>
                <PortalDashboard />
              </PortalProtectedRoute>
            } 
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
