import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const UnauthorizedPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 space-y-4 animate-fade-in">
      <div className="w-16 h-16 rounded-2xl bg-rose-950/80 border border-rose-500/40 text-rose-400 flex items-center justify-center shadow-xl">
        <ShieldAlert className="w-8 h-8" />
      </div>

      <h1 className="text-3xl font-bold text-white">403 — Access Restricted</h1>
      <p className="text-slate-400 max-w-md text-sm leading-relaxed">
        Your current account role (<span className="font-semibold text-rose-400">{user?.role}</span>) does not have permission to access or perform write actions on this resource.
      </p>

      <div className="pt-4">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 hover:text-white font-semibold text-sm transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </Link>
      </div>
    </div>
  );
};
