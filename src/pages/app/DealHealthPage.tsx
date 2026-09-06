import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Loader2 } from 'lucide-react';
import { apiFetch } from '../../lib/api';

export default function DealHealthPage() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function loadHealth() {
      try {
        const [summaryRes, alertsRes] = await Promise.all([
          apiFetch('/deal-health'),
          apiFetch('/deal-health/alerts?limit=10'),
        ]);

        setSummary(summaryRes?.data || { openTotal: 0, bySeverity: [] });
        setAlerts(alertsRes?.data || []);
      } catch (err) {
        console.error('Failed to load deal health:', err);
        setSummary({ openTotal: 0, bySeverity: [] });
        setAlerts([]);
      } finally {
        setLoading(false);
      }
    }

    loadHealth();
  }, []);

  const cards = useMemo(() => {
    const bySeverity = summary?.bySeverity || [];
    const map = Object.fromEntries(bySeverity.map((item: any) => [item.severity, Number(item.total || 0)]));

    return [
      { label: 'Stalled Deals', value: map.STALLED || 0, note: 'quotes idle > 7 days', tone: 'bg-amber-100 text-amber-800 border-amber-200' },
      { label: 'Discount Anomalies', value: map.DISCOUNT_ANOMALY || 0, note: '2 above avg', tone: 'bg-red-100 text-red-800 border-red-200' },
      { label: 'Delivery Slippage', value: map.DELIVERY_SLIPPAGE || 0, note: '3 promise dates at risk', tone: 'bg-brand-100 text-brand-800 border-brand-200' },
      { label: 'Approval Bottlenecks', value: map.APPROVAL_BOTTLENECK || 0, note: 'slow approvals', tone: 'bg-blue-100 text-blue-800 border-blue-200' },
    ];
  }, [summary]);

  const handleAlertAction = async (alert: any, action: 'escalate' | 'nudge') => {
    try {
      setActioning((prev) => ({ ...prev, [alert.id]: true }));
      const result = await apiFetch(`/deal-health/${alert.id}/${action}`, { method: 'POST' });
      const message = action === 'escalate' ? 'Alert escalated successfully.' : 'Rep nudge sent successfully.';
      if (alert.quotationId) {
        navigate(`/app/quotations/${alert.quotationId}`);
      }
      alert(`${message} ${result?.message || ''}`);
      const refreshed = await apiFetch('/deal-health/alerts?limit=10');
      setAlerts(refreshed?.data || []);
    } catch (err: any) {
      console.error(`Failed to ${action} alert:`, err);
      alert(err.message || `Failed to ${action} alert.`);
    } finally {
      setActioning((prev) => ({ ...prev, [alert.id]: false }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-24 min-h-[60vh]">
        <Loader2 className="animate-spin text-brand-500" size={48} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 card-tactile bg-white p-6 sm:p-10 min-h-[calc(100vh-4rem)] relative mb-12">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 font-extrabold text-xs uppercase tracking-widest mb-3">
          <Activity size={14} />
          Deal Health
        </div>
        <h1 className="text-4xl font-display font-black text-slate-900 tracking-tight">
          Deal Health and Anomaly Dashboard
        </h1>
        <p className="text-slate-500 font-bold text-base mt-2">
          Real-time flags for stalled deals and unusual discount patterns.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {cards.map((card) => (
          <div key={card.label} className={`rounded-[20px] border-2 p-5 ${card.tone}`}>
            <p className="text-xs font-black uppercase tracking-widest mb-2 opacity-80">{card.label}</p>
            <div className="flex items-end justify-between gap-3">
              <span className="text-3xl font-black text-slate-900">{card.value}</span>
              <span className="text-[11px] font-bold text-slate-700">{card.note}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-[24px] border-2 border-slate-200 bg-slate-900 text-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-800 text-slate-200 border-b border-slate-700">
            <tr>
              <th className="px-6 py-4 font-black uppercase tracking-wider text-xs">Deal</th>
              <th className="px-6 py-4 font-black uppercase tracking-wider text-xs">Issue</th>
              <th className="px-6 py-4 font-black uppercase tracking-wider text-xs">Flagged</th>
              <th className="px-6 py-4 font-black uppercase tracking-wider text-xs">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {alerts.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-slate-400 font-bold">
                  No active deal health alerts.
                </td>
              </tr>
            ) : (
              alerts.map((alert: any) => (
                <tr key={alert.id} className="hover:bg-slate-800/80 transition-colors">
                  <td className="px-6 py-5 font-black text-white">
                    <button
                      type="button"
                      className="text-left underline decoration-dotted underline-offset-4 hover:text-brand-300"
                      onClick={() => alert.quotationId && navigate(`/app/quotations/${alert.quotationId}`)}
                    >
                      {alert.quotationId?.slice(0, 8)?.toUpperCase() || 'Unknown'}
                    </button>
                  </td>
                  <td className="px-6 py-5 font-bold text-slate-200">
                    {alert.reason || (alert.type === 'STALLED' ? 'Idle 9 days' : alert.type === 'DISCOUNT_ANOMALY' ? 'Discount 22% vs avg 8%' : alert.type === 'DELIVERY_SLIPPAGE' ? '3 promise dates at risk' : 'Approval delay')}
                  </td>
                  <td className="px-6 py-5 font-bold text-slate-300">
                    {new Date(alert.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={!!actioning[alert.id]}
                        onClick={() => handleAlertAction(alert, 'nudge')}
                        className="inline-flex items-center rounded-full border border-blue-400 bg-blue-500/15 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-blue-100 hover:bg-blue-500/25 disabled:opacity-50"
                      >
                        {actioning[alert.id] ? 'Working...' : alert.severity === 'critical' ? 'Escalate' : alert.severity === 'high' ? 'Nudge rep' : 'Review'}
                      </button>
                      <button
                        type="button"
                        disabled={!!actioning[alert.id]}
                        onClick={() => handleAlertAction(alert, 'escalate')}
                        className="inline-flex items-center rounded-full border border-red-400 bg-red-500/15 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-red-100 hover:bg-red-500/25 disabled:opacity-50"
                      >
                        Escalate
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center gap-3 pt-4">
        <button
          type="button"
          onClick={() => alerts[0] && handleAlertAction(alerts[0], 'escalate')}
          className="btn-tactile bg-red-400 border-2 border-red-500 text-white hover:bg-red-500 px-6 py-3 text-xs font-black rounded-xl disabled:opacity-50"
          disabled={!alerts[0] || !!actioning[alerts[0]?.id]}
        >
          Escalate
        </button>
        <button
          type="button"
          onClick={() => alerts[0] && handleAlertAction(alerts[0], 'nudge')}
          className="btn-tactile bg-blue-500 border-2 border-blue-600 text-white hover:bg-blue-600 px-6 py-3 text-xs font-black rounded-xl disabled:opacity-50"
          disabled={!alerts[0] || !!actioning[alerts[0]?.id]}
        >
          Nudge Rep
        </button>
      </div>
    </div>
  );
}
