import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import AppLayout from './pages/app/AppLayout';
import PortalLogin from './pages/portal/PortalLogin';
import PortalSignup from './pages/portal/PortalSignup';
import PortalVerify from './pages/portal/PortalVerify';
import PortalDashboard from './pages/portal/PortalDashboard';
import PortalQuotationNegotiationPage from './pages/portal/PortalQuotationNegotiationPage';
import { AuthProvider, useAuth, type UserRole } from './contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: UserRole[];
}

function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
  const { user, loading, hasRole } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 font-display">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Authenticating Session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  if (roles && !hasRole(roles)) {
    return <Navigate to="/app/dashboard" replace />;
  }

  return <>{children}</>;
}

function PortalProtectedRoute({ children }: { children: React.ReactNode }) {
  const { customer, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 font-display">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-secondary-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Loading Customer Portal...</p>
        </div>
      </div>
    );
  }

  if (!customer) {
    return <Navigate to="/portal/login" replace />;
  }

  return <>{children}</>;
}

function RedirectLegacyQuotationsRoute() {
  const { id } = useParams();

  return <Navigate to={id ? `/app/quotations/${id}` : '/app/quotations'} replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Landing Page */}
          <Route path="/" element={<Landing />} />

          {/* Internal Authentication Routes */}
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/signup" element={<Navigate to="/auth/login" replace />} />

          {/* Customer Portal Authentication Routes */}
          <Route path="/portal/login" element={<PortalLogin />} />
          <Route path="/portal/signup" element={<PortalSignup />} />
          <Route path="/portal/verify" element={<PortalVerify />} />

          {/* Legacy quotation URLs that were previously used without the /app prefix */}
          <Route path="/quotations" element={<Navigate to="/app/quotations" replace />} />
          <Route path="/quotations/new" element={<Navigate to="/app/quotations/new" replace />} />
          <Route path="/quotations/:id" element={<RedirectLegacyQuotationsRoute />} />

          {/* Internal Protected Application Workspace */}
          <Route
            path="/app/*"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          />

          {/* Restricted Customer Portal Workspace */}
          <Route
            path="/portal/dashboard"
            element={
              <PortalProtectedRoute>
                <PortalDashboard />
              </PortalProtectedRoute>
            }
          />
          <Route
            path="/portal/quotations/:id"
            element={
              <PortalProtectedRoute>
                <PortalQuotationNegotiationPage />
              </PortalProtectedRoute>
            }
          />

          {/* Legacy & Shortcut Redirects */}
          <Route path="/login" element={<Navigate to="/auth/login" replace />} />
          <Route path="/signup" element={<Navigate to="/auth/login" replace />} />
          <Route path="/dashboard" element={<Navigate to="/app/dashboard" replace />} />

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
