import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../common/Badge';
import { LogOut, User as UserIcon, Shield, Menu } from 'lucide-react';
import { Role } from '../../types';

interface HeaderProps {
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { user, logout, login } = useAuth();

  const getRoleVariant = (role?: Role) => {
    switch (role) {
      case 'ADMIN':
        return 'danger';
      case 'SALES':
        return 'info';
      case 'WAREHOUSE':
        return 'warning';
      case 'ACCOUNTS':
        return 'purple';
      default:
        return 'default';
    }
  };

  const handleQuickSwitchRole = async (targetRole: Role) => {
    const roleCredentials: Record<Role, { email: string; pass: string }> = {
      ADMIN: { email: 'admin@operations.com', pass: 'Admin123!' },
      SALES: { email: 'sales@operations.com', pass: 'Sales123!' },
      WAREHOUSE: { email: 'warehouse@operations.com', pass: 'Warehouse123!' },
      ACCOUNTS: { email: 'accounts@operations.com', pass: 'Accounts123!' },
    };

    const creds = roleCredentials[targetRole];
    if (creds) {
      try {
        await login(creds.email, creds.pass);
      } catch (err) {
        console.error('Quick role switch failed', err);
      }
    }
  };

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-4 lg:px-8 no-print">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-lg shadow-cyan-500/20">
            ERP
          </div>
          <span className="font-bold text-lg text-white hidden sm:inline-block tracking-tight">
            Operations Portal
          </span>
        </div>
      </div>

      {/* Quick Demo Role Switcher Bar */}
      <div className="hidden xl:flex items-center gap-2 px-3 py-1 bg-slate-950/60 rounded-full border border-slate-800 text-xs">
        <span className="text-slate-400 font-medium flex items-center gap-1">
          <Shield className="w-3 h-3 text-cyan-400" /> Quick Demo Role Switch:
        </span>
        {(['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'] as Role[]).map((r) => (
          <button
            key={r}
            onClick={() => handleQuickSwitchRole(r)}
            className={`px-2 py-0.5 rounded-full transition-all text-xs font-semibold ${
              user?.role === r
                ? 'bg-cyan-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      {/* User Actions */}
      <div className="flex items-center gap-4">
        {user && (
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-semibold text-slate-100">{user.name}</span>
              <span className="text-xs text-slate-400">{user.email}</span>
            </div>

            <Badge label={user.role} variant={getRoleVariant(user.role)} size="md" />

            <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
              <UserIcon className="w-5 h-5" />
            </div>

            <button
              onClick={logout}
              title="Logout"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900 hover:bg-rose-950/50 hover:border-rose-700/50 text-slate-400 hover:text-rose-300 text-sm font-medium transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
