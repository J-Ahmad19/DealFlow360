import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface ModuleShellProps {
  title: string;
  category: string;
  description: string;
  icon: any;
  requiredPermission?: string;
  requiredRoles?: string[];
  stats?: { label: string; value: string; badge?: string }[];
}

export default function ModuleShellPlaceholder({
  title,
  category,
  description,
  icon: Icon,
  requiredPermission,
  requiredRoles,
  stats = [],
}: ModuleShellProps) {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="card-tactile bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-200/80 shadow-sm relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-extrabold text-xs mb-3">
            <span className="w-2 h-2 rounded-full bg-brand-500" />
            Category: {category}
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-brand-50 text-brand-600 border border-brand-200 shrink-0">
              <Icon size={26} />
            </div>
            {title}
          </h1>
          <p className="text-slate-500 font-bold text-sm mt-2 max-w-2xl">
            {description}
          </p>
        </div>

        <div className="shrink-0 flex items-center gap-3">
          <Link to="/app/dashboard" className="btn-tactile btn-secondary px-5 py-3 text-xs font-black">
            ← Return to Dashboard
          </Link>
        </div>
      </div>

      {/* Module Overview Cards Grid */}
      {stats.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {stats.map((stat, idx) => (
            <div key={idx} className="rounded-3xl p-6 bg-white border-2 border-slate-200/80 shadow-sm">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <p className="text-3xl font-black text-slate-900">{stat.value}</p>
              {stat.badge && (
                <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-brand-50 text-brand-700 border border-brand-200">
                  {stat.badge}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Shell Wireframe Metadata */}
      <div className="card-tactile bg-white rounded-3xl p-8 border-2 border-slate-200/80 shadow-sm text-center py-12">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 border-2 border-slate-200 flex items-center justify-center mx-auto mb-4 text-slate-700">
          <Icon size={32} />
        </div>
        <h3 className="text-xl font-black text-slate-900 mb-2">{title} Application Shell</h3>
        <p className="text-slate-500 font-bold text-sm max-w-md mx-auto mb-6">
          This shell route is protected and active. Access control is enforced for active role{' '}
          <span className="text-brand-600 font-black uppercase">{user?.role}</span>.
        </p>

        <div className="inline-flex flex-wrap items-center justify-center gap-2 text-xs font-bold text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-200 max-w-lg mx-auto">
          {requiredPermission && (
            <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-extrabold">
              Permission Required: {requiredPermission}
            </span>
          )}
          {requiredRoles && (
            <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 font-extrabold">
              Roles Allowed: {requiredRoles.join(', ')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
