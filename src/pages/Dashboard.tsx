import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutUser();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 font-display">
      <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center p-1">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
          </div>
          <span className="font-black text-lg tracking-tight text-slate-900">
            Deal<span className="text-brand-500">Flow</span>360
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm font-medium text-slate-600">
            {user?.fullName} ({user?.role})
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
          >
            Log Out
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-12">
        <h1 className="text-3xl font-black text-slate-900 mb-2">Internal Dashboard</h1>
        <p className="text-slate-500 font-medium mb-8">Welcome back, {user?.fullName}. This is a protected route.</p>
        
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
          <p className="text-slate-600 font-medium">
            This dashboard will contain the upcoming backend logic components for managing quotations, approvals, and deal flow.
          </p>
        </div>
      </main>
    </div>
  );
}
