import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Filter } from 'lucide-react';
import { apiFetch } from '../../lib/api';

export default function ApprovalsList() {
  const navigate = useNavigate();
  const [approvals, setApprovals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadApprovals() {
      try {
        const data = await apiFetch('/approvals');
        setApprovals(data || []);
      } catch (err) {
        console.error('Failed to load approvals:', err);
      } finally {
        setLoading(false);
      }
    }
    loadApprovals();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-24 min-h-[60vh]">
        <Loader2 className="animate-spin text-brand-500" size={48} />
      </div>
    );
  }

  // Stats calculation
  const pendingCount = approvals.filter(a => a.status === 'pending_approval').length;
  const returnedCount = approvals.filter(a => a.status === 'revision_required').length;
  const approvedCount = approvals.filter(a => a.status === 'approved' || a.status === 'confirmed').length;

  // --- Formatting Helpers to Match the Wireframe ---

  const renderStage = (app: any) => {
    if (app.status === 'approved' || app.status === 'confirmed') return 'Auto-Approved';
    if (app.status === 'pending_approval' || app.status === 'revision_required') {
      if (app.approverRole === 'sales_manager') return 'Sales Manager';
      if (app.approverRole === 'finance') return 'Finance';
      if (app.approverRole === 'admin') return 'System Admin';
    }
    // Fallback for draft, under_negotiation, etc.
    return app.status.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
  };

  const renderAssignedTo = (app: any) => {
    // If it's already approved, there is no one assigned to action it
    if (app.status === 'approved' || app.status === 'confirmed' || app.status === 'draft') return '-';
    
    // Wireframe Mock Mapping
    if (app.approverRole === 'sales_manager') return 'M. Shah';
    if (app.approverRole === 'finance') return 'R. Iyer';
    
    return app.ownerName || '-';
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 card-tactile bg-white p-6 sm:p-10 min-h-[calc(100vh-4rem)] relative mb-12">
      
      <div>
        <h1 className="text-4xl font-display font-black text-slate-900 tracking-tight">
          Approvals (List)
        </h1>
        <p className="text-slate-500 font-bold text-base mt-2">
          Every quotation that needed, needs, or is going through discount approval
        </p>
      </div>

      {/* Dynamic Status Badges */}
      <div className="flex flex-wrap items-center gap-4 pt-4">
        <div className="bg-[#e67e22] text-white font-black px-5 py-2.5 rounded-xl border-2 border-[#d35400] border-b-4 shadow-sm">
          {pendingCount} Pending
        </div>
        <div className="bg-[#ff7675] text-white font-black px-5 py-2.5 rounded-xl border-2 border-[#d63031] border-b-4 shadow-sm">
          {returnedCount} Returned
        </div>
        <div className="bg-brand-500 text-white font-black px-5 py-2.5 rounded-xl border-2 border-brand-600 border-b-4 shadow-sm">
          {approvedCount} Approved
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-3xl border-2 border-slate-200 overflow-hidden mt-6">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 border-b-2 border-slate-200">
            <tr>
              <th className="px-6 py-4 font-black uppercase tracking-wider text-xs">Quotation</th>
              <th className="px-6 py-4 font-black uppercase tracking-wider text-xs">Customer</th>
              <th className="px-6 py-4 font-black uppercase tracking-wider text-xs">Blended Risk</th>
              <th className="px-6 py-4 font-black uppercase tracking-wider text-xs">Stage</th>
              <th className="px-6 py-4 font-black uppercase tracking-wider text-xs">Assigned To</th>
            </tr>
          </thead>
          <tbody className="text-slate-900 divide-y-2 divide-slate-50">
            {approvals.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                  <span className="font-bold block mb-1">No approvals found in the queue.</span>
                  <span className="text-xs">Quotations submitted for approval will appear here.</span>
                </td>
              </tr>
            ) : (
              approvals.map((app) => (
                <tr 
                  key={app.id} 
                  onClick={() => navigate(`/app/approvals/${app.id}`)}
                  className="hover:bg-slate-50 transition-colors cursor-pointer group"
                >
                  <td className="px-6 py-5 font-black text-slate-700 group-hover:text-brand-500 transition-colors">
                    Q-{app.id.substring(0, 4).toUpperCase()}
                  </td>
                  <td className="px-6 py-5 font-bold">{app.customerName || 'Unknown Customer'}</td>
                  <td className="px-6 py-5 font-black">
                    <span className={`${
                      app.riskScore > 60 ? 'text-[#d63031]' : app.riskScore > 30 ? 'text-[#e67e22]' : 'text-brand-500'
                    }`}>
                      {app.riskScore > 60 ? 'HIGH' : app.riskScore > 30 ? 'MEDIUM' : 'LOW'}
                    </span>
                  </td>
                  
                  {/* Updated Stage to show Role */}
                  <td className="px-6 py-5 font-bold text-slate-600">
                    {renderStage(app)}
                  </td>
                  
                  {/* Updated Assigned To with Mocked Names */}
                  <td className="px-6 py-5 font-bold text-slate-600">
                    {renderAssignedTo(app)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Info Box */}
      <div className="bg-[#322c1d] border-2 border-[#524424] rounded-2xl p-5 shadow-sm flex items-start gap-3 mt-6">
        <p className="text-[#e1b12c] font-bold text-sm leading-relaxed">
          Click any row to open its full approval detail, risk breakdown, and audit trail.
        </p>
      </div>

      <div className="pt-4">
        <button className="btn-tactile bg-slate-900 border-2 border-slate-950 text-white hover:bg-slate-800 px-6 py-3 text-sm flex items-center gap-2 rounded-xl font-black">
          <Filter size={16} />
          Filter: Pending Only
        </button>
      </div>
    </div>
  );
}