import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft, CheckCircle, RotateCcw, XCircle } from 'lucide-react';
import { apiFetch } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';

export default function ApprovalDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  
  const [approval, setApproval] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadDetail() {
      try {
        const data = await apiFetch(`/approvals/${id}`);
        setApproval(data);
      } catch (err) {
        console.error('Failed to load approval detail:', err);
      } finally {
        setLoading(false);
      }
    }
    if (id) loadDetail();
  }, [id]);

  const handleAction = async (action: 'approve' | 'revise' | 'reject') => {
    if (!id) return;

    setActionLoading(true);
    setStatusMessage(null);
    try {
      const result = await apiFetch(`/approvals/${id}/action`, {
        method: 'POST',
        body: JSON.stringify({ action, note: `Reviewed by ${hasRole(['admin']) ? 'admin' : 'approver'} via approval screen.` })
      });

      const payload = result?.data || result;
      setStatusMessage(payload?.message || `Approval ${action} recorded successfully.`);

      const refreshed = await apiFetch(`/approvals/${id}`);
      setApproval(refreshed);

      setTimeout(() => {
        navigate('/app/approvals');
      }, 1200);
    } catch (err: any) {
      console.error('Failed action:', err);
      setStatusMessage(err.message || 'Unable to complete approval action.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-24 min-h-[60vh]">
        <Loader2 className="animate-spin text-brand-500" size={48} />
      </div>
    );
  }

  if (!approval) {
    return (
      <div className="max-w-6xl mx-auto card-tactile bg-white p-8 text-center mt-12">
        <h2 className="text-2xl font-black text-slate-900">Approval not found</h2>
        <button onClick={() => navigate('/app/approvals')} className="btn-tactile btn-primary px-6 py-3 mt-6">
          Return to Queue
        </button>
      </div>
    );
  }

  const quoteId = String(approval?.id || '').substring(0, 4).toUpperCase();
  const customerName = approval?.customerName || 'Unknown Customer';
  const riskScore = Number(approval?.riskScore ?? 0);
  const isHighRisk = riskScore > 60;
  const isMediumRisk = riskScore > 30 && riskScore <= 60;
  const canApprove = hasRole(['admin', 'sales_manager', 'finance']);
  const approvalSteps = [
    { label: 'Sales Manager', active: riskScore > 0 || !!approval?.lines?.length },
    { label: 'Finance', active: riskScore > 50 },
  ].filter((step) => step.active || step.label === 'Sales Manager');

  return (
    <div className="max-w-5xl mx-auto space-y-8 card-tactile bg-white p-6 sm:p-10 min-h-[calc(100vh-4rem)] relative mb-12">
      
      {/* Header Section */}
      <div>
        <button
          onClick={() => navigate('/app/approvals')}
          className="flex items-center gap-1.5 text-slate-400 hover:text-brand-500 text-xs font-black uppercase tracking-widest mb-4 transition-colors"
        >
          <ArrowLeft size={16} /> Back to Approvals
        </button>
        <h1 className="text-4xl font-display font-black text-slate-900 tracking-tight">
          Approval Detail: Q-{quoteId} ({customerName})
        </h1>
        <p className="text-slate-500 font-bold text-base mt-2">
          Opened by clicking a row on the Approvals list
        </p>
      </div>

      {/* Badges */}
      <div className="flex gap-4">
        <div className={`px-5 py-2.5 rounded-xl border-2 border-b-4 font-black uppercase tracking-wider text-sm ${
          isHighRisk ? 'bg-red-50 border-red-200 text-red-600' :
          isMediumRisk ? 'bg-amber-50 border-amber-200 text-amber-600' :
          'bg-brand-50 border-brand-200 text-brand-600'
        }`}>
          Blended Risk: {riskScore}% {isHighRisk ? 'HIGH' : isMediumRisk ? 'MEDIUM' : 'LOW'}
        </div>
        <div className="bg-blue-50 border-blue-200 text-blue-600 border-2 border-b-4 px-5 py-2.5 rounded-xl font-black uppercase tracking-wider text-sm">
          Customer Tier: Gold
        </div>
      </div>

      {/* Flagged Reasons Table */}
      <div className="pt-4">
        <h3 className="text-xl font-black text-blue-500 mb-4">Why This Quote Was Flagged</h3>
        <div className="bg-white rounded-3xl border-2 border-slate-200 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 border-b-2 border-slate-200">
              <tr>
                <th className="px-6 py-4 font-black uppercase tracking-wider text-xs">Line</th>
                <th className="px-6 py-4 font-black uppercase tracking-wider text-xs">Discount Given</th>
                <th className="px-6 py-4 font-black uppercase tracking-wider text-xs">Limit Allowed</th>
                <th className="px-6 py-4 font-black uppercase tracking-wider text-xs">Over By</th>
              </tr>
            </thead>
            <tbody className="text-slate-900 divide-y-2 divide-slate-50">
              {approval.lines?.map((line: any) => {
                const limit = line.limit || 15; // fallback
                const overBy = line.discount > limit ? line.discount - limit : 0;
                return (
                  <tr key={line.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-5 font-bold">{line.productNameSnapshot}</td>
                    <td className="px-6 py-5 font-black">{line.discount}%</td>
                    <td className="px-6 py-5 font-bold text-slate-500">{limit}%</td>
                    <td className={`px-6 py-5 font-black ${overBy > 0 ? 'text-red-500' : 'text-brand-500'}`}>
                      {overBy > 0 ? `${overBy} pt OVER` : '0 pt - OK'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Warning Box */}
      <div className="bg-[#322c1d] border-2 border-[#524424] rounded-2xl p-5 shadow-sm mt-6">
        <p className="text-[#e1b12c] font-bold text-sm leading-relaxed">
          Worst single line (8pt over) plus overall pattern across the order sets the blended score. One bad line is enough to require approval.
        </p>
      </div>

      {/* Progress Tracker Flow */}
      <div className="py-10 my-8 flex items-center justify-between relative px-4">
        <div className="absolute left-10 right-10 top-1/2 -translate-y-1/2 h-1 bg-slate-200 z-0"></div>

        <div className="relative z-10 flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-brand-500 text-white flex items-center justify-center border-4 border-white shadow-sm">
            <CheckCircle size={20} />
          </div>
          <span className="text-xs font-black uppercase tracking-widest text-slate-900 bg-white px-2">Submitted</span>
        </div>

        {approvalSteps.map((step, index) => (
          <div key={step.label} className="relative z-10 flex flex-col items-center gap-3">
            <div className={`w-12 h-12 rounded-full ${index === 0 ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-400'} flex items-center justify-center border-4 border-white shadow-sm`}>
              <div className={`w-4 h-4 rounded-full ${index === 0 ? 'bg-white' : 'bg-slate-400'}`} />
            </div>
            <span className={`text-xs font-black uppercase tracking-widest bg-white px-2 ${index === 0 ? 'text-slate-900' : 'text-slate-400'}`}>
              {step.label}
            </span>
          </div>
        ))}

        <div className="relative z-10 flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center border-4 border-white"></div>
          <span className="text-xs font-black uppercase tracking-widest text-slate-400 bg-white px-2">Confirmed</span>
        </div>
      </div>

      {/* Audit Trail Table */}
      <div className="pt-4">
        <h3 className="text-xl font-black text-slate-900 mb-4">Audit Trail</h3>
        <div className="bg-white rounded-3xl border-2 border-slate-200 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 border-b-2 border-slate-200">
              <tr>
                <th className="px-6 py-4 font-black uppercase tracking-wider text-xs">User</th>
                <th className="px-6 py-4 font-black uppercase tracking-wider text-xs">Action</th>
                <th className="px-6 py-4 font-black uppercase tracking-wider text-xs">Date</th>
                <th className="px-6 py-4 font-black uppercase tracking-wider text-xs">Note</th>
              </tr>
            </thead>
            <tbody className="text-slate-900 divide-y-2 divide-slate-50">
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-5 font-bold">{approval.ownerName || 'System'}</td>
                <td className="px-6 py-5 font-black text-slate-900">Submitted</td>
                <td className="px-6 py-5 font-bold text-slate-500">
                  {approval.createdAt ? new Date(approval.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '—'}
                </td>
                <td className="px-6 py-5 font-bold text-slate-500">{approval.title || 'Submitted for review'}</td>
              </tr>
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-5 font-bold">Approver</td>
                <td className="px-6 py-5 font-black text-slate-900">{statusMessage ? 'Reviewed' : 'Pending'}</td>
                <td className="px-6 py-5 font-bold text-slate-500">{new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</td>
                <td className="px-6 py-5 font-bold text-slate-500">{statusMessage || 'Awaiting decision'}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Buttons */}
      {statusMessage && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
          {statusMessage}
        </div>
      )}

      {canApprove && (
        <div className="flex flex-wrap items-center gap-4 pt-8 mt-8 border-t-2 border-slate-100">
          <button
            onClick={() => handleAction('approve')}
            disabled={actionLoading}
            className="btn-tactile btn-primary px-8 py-4 text-base flex items-center justify-center gap-2 rounded-2xl font-black"
          >
            <CheckCircle size={20} />
            {actionLoading ? 'Processing...' : 'Approve'}
          </button>

          <button
            onClick={() => handleAction('revise')}
            disabled={actionLoading}
            className="btn-tactile bg-[#e67e22] border-b-4 border-[#d35400] text-white hover:bg-[#f39c12] px-8 py-4 text-base flex items-center justify-center gap-2 rounded-2xl font-black transition-all"
          >
            <RotateCcw size={20} />
            {actionLoading ? 'Processing...' : 'Return for Revision'}
          </button>

          <button
            onClick={() => handleAction('reject')}
            disabled={actionLoading}
            className="btn-tactile bg-[#ff7675] border-b-4 border-[#d63031] text-white hover:bg-[#ff9f43] px-8 py-4 text-base flex items-center justify-center gap-2 rounded-2xl font-black transition-all"
          >
            <XCircle size={20} />
            {actionLoading ? 'Processing...' : 'Reject'}
          </button>
        </div>
      )}
    </div>
  );
}