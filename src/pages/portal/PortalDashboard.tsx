import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function PortalDashboard() {
  const { customer, logoutCustomer } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutCustomer();
    navigate('/portal/login');
  };

  return (
    <div className="min-h-screen bg-slate-900 font-display">
      <header className="bg-slate-800 border-b border-slate-700 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center p-1">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
          </div>
          <span className="font-black text-lg tracking-tight text-white">
            Deal<span className="text-brand-500">Flow</span>360
            <span className="ml-2 px-2 py-0.5 bg-slate-700 text-slate-300 text-xs rounded-full align-middle">PORTAL</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm font-medium text-slate-300">
            {customer?.firstName} {customer?.lastName} ({customer?.company?.name})
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-bold text-slate-300 hover:text-white bg-slate-700 hover:bg-slate-600 rounded-xl transition-all"
          >
            Log Out
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-12">
        <h1 className="text-3xl font-black text-white mb-2">Customer Dashboard</h1>
        <p className="text-slate-400 font-medium mb-8">Welcome back, {customer?.firstName}. View your company quotations here.</p>
        
        <div className="bg-slate-800 rounded-3xl p-8 border border-slate-700 shadow-xl">
          <p className="text-slate-300 font-medium">
            This customer portal dashboard will display the quotations for your company ({customer?.company?.name}). 
            Backend policies ensure you can only access your own data.
          </p>
        </div>
      </main>
    </div>
  );
}
