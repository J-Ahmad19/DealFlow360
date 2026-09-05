import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, type UserRole } from '../../contexts/AuthContext';
import { LogOut, ChevronDown, ShieldCheck, UserCheck } from 'lucide-react';

const roleBadges: Record<UserRole, { label: string; style: string }> = {
  admin: { label: 'Administrator', style: 'bg-red-500/10 text-red-700 border-red-200' },
  sales_manager: { label: 'Sales Manager', style: 'bg-amber-500/10 text-amber-700 border-amber-200' },
  finance: { label: 'Finance & Ops', style: 'bg-blue-500/10 text-blue-700 border-blue-200' },
  sales_rep: { label: 'Sales Rep', style: 'bg-brand-500/10 text-brand-700 border-brand-200' },
};

const rolesList: { role: UserRole; name: string }[] = [
  { role: 'sales_rep', name: 'Sales Representative' },
  { role: 'sales_manager', name: 'Sales Manager' },
  { role: 'finance', name: 'Finance & Governance' },
  { role: 'admin', name: 'System Administrator' },
];

export default function UserMenu() {
  const { user, logoutUser, switchRole } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logoutUser();
    navigate('/auth/login');
  };

  if (!user) return null;

  const activeRoleInfo = roleBadges[user.role as UserRole] || {
    label: user.role,
    style: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Menu Trigger Button */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2.5 p-1.5 pl-2.5 rounded-2xl bg-white hover:bg-slate-50 border-2 border-slate-200 shadow-sm transition-all text-left"
        aria-expanded={open}
        aria-haspopup="true"
      >
        <div className="w-8 h-8 rounded-xl bg-brand-500 text-white font-black text-xs flex items-center justify-center shadow-inner">
          {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
        </div>

        <div className="hidden md:block">
          <p className="text-xs font-black text-slate-900 leading-none">{user.fullName}</p>
          <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border mt-0.5 ${activeRoleInfo.style}`}>
            {activeRoleInfo.label}
          </span>
        </div>

        <ChevronDown size={14} className="text-slate-400 shrink-0" />
      </button>

      {/* Dropdown Menu */}
      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-3xl shadow-2xl border-2 border-slate-200 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          {/* User Profile Header */}
          <div className="px-5 py-3 border-b border-slate-100">
            <p className="text-sm font-black text-slate-900">{user.fullName}</p>
            <p className="text-xs font-bold text-slate-400 truncate">{user.email}</p>
            <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider border border-slate-200 bg-slate-50 text-slate-700">
              <ShieldCheck size={12} className="text-brand-500" />
              <span>Role: {activeRoleInfo.label}</span>
            </div>
          </div>

          {/* Interactive Role Switcher for Demo / Testing */}
          <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50/50">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
              <UserCheck size={12} />
              Simulate Role View
            </p>
            <div className="space-y-1">
              {rolesList.map((item) => (
                <button
                  key={item.role}
                  onClick={() => {
                    switchRole(item.role);
                    setOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-extrabold flex items-center justify-between transition-colors ${
                    user.role === item.role
                      ? 'bg-brand-500 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-200/70'
                  }`}
                >
                  <span>{item.name}</span>
                  {user.role === item.role && <span className="text-[10px] uppercase font-black tracking-widest bg-white/20 px-1.5 py-0.5 rounded">Active</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-1 px-2">
            <button
              onClick={handleLogout}
              className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-black text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
            >
              <LogOut size={16} />
              Log Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
