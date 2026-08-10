import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Lock, Mail, ShieldAlert, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Role } from '../types';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { login } = useAuth();
  const { showSuccess } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      const user = await login(email, password);
      showSuccess('Welcome back!', `Logged in successfully as ${user.name} (${user.role})`);
      navigate('/dashboard');
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed. Please check credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (role: Role) => {
    const roleCredentials: Record<Role, { email: string; pass: string }> = {
      ADMIN: { email: 'admin@operations.com', pass: 'Admin123!' },
      SALES: { email: 'sales@operations.com', pass: 'Sales123!' },
      WAREHOUSE: { email: 'warehouse@operations.com', pass: 'Warehouse123!' },
      ACCOUNTS: { email: 'accounts@operations.com', pass: 'Accounts123!' },
    };

    const creds = roleCredentials[role];
    if (creds) {
      setEmail(creds.email);
      setPassword(creds.pass);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md z-10 space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-xl shadow-cyan-500/20 text-white font-extrabold text-2xl mb-2">
            ERP
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Operations Portal</h1>
          <p className="text-sm text-slate-400">Mini ERP + CRM Wholesale System</p>
        </div>

        {/* Login Glass Card */}
        <div className="glass-panel rounded-2xl p-8 shadow-2xl space-y-6">
          {errorMsg && (
            <div className="p-3 bg-rose-950/80 border border-rose-500/40 rounded-xl text-rose-200 text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@operations.com"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold rounded-xl text-sm shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
            >
              {isLoading ? (
                'Authenticating...'
              ) : (
                <>
                  <span>Sign In to Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Switcher Box */}
          <div className="pt-4 border-t border-slate-800/80 space-y-3">
            <span className="text-xs font-semibold text-slate-400 block text-center">
              1-Click Demo Login Credentials:
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickLogin('ADMIN')}
                className="p-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 text-left transition-colors flex items-center justify-between"
              >
                <div>
                  <span className="font-bold text-rose-400 block">Admin</span>
                  <span className="text-[10px] text-slate-500">Full Access</span>
                </div>
                <CheckCircle2 className="w-3.5 h-3.5 text-slate-600" />
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('SALES')}
                className="p-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 text-left transition-colors flex items-center justify-between"
              >
                <div>
                  <span className="font-bold text-sky-400 block">Sales</span>
                  <span className="text-[10px] text-slate-500">CRM & Challans</span>
                </div>
                <CheckCircle2 className="w-3.5 h-3.5 text-slate-600" />
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('WAREHOUSE')}
                className="p-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 text-left transition-colors flex items-center justify-between"
              >
                <div>
                  <span className="font-bold text-amber-400 block">Warehouse</span>
                  <span className="text-[10px] text-slate-500">Stock IN/OUT</span>
                </div>
                <CheckCircle2 className="w-3.5 h-3.5 text-slate-600" />
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('ACCOUNTS')}
                className="p-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 text-left transition-colors flex items-center justify-between"
              >
                <div>
                  <span className="font-bold text-purple-400 block">Accounts</span>
                  <span className="text-[10px] text-slate-500">View Only</span>
                </div>
                <CheckCircle2 className="w-3.5 h-3.5 text-slate-600" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
