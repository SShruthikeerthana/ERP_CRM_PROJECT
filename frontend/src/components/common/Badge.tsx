import React from 'react';

interface BadgeProps {
  label: string;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ label, variant = 'default', size = 'sm' }) => {
  const sizeClasses = size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm';

  const variantMap: Record<string, string> = {
    default: 'bg-slate-800 text-slate-300 border-slate-700',
    success: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40',
    warning: 'bg-amber-950/80 text-amber-300 border-amber-500/40',
    danger: 'bg-rose-950/80 text-rose-300 border-rose-500/40',
    info: 'bg-sky-950/80 text-sky-300 border-sky-500/40',
    purple: 'bg-purple-950/80 text-purple-300 border-purple-500/40',
  };

  const styleClass = variantMap[variant] || variantMap.default;

  return (
    <span className={`inline-flex items-center font-medium rounded-full border ${sizeClasses} ${styleClass}`}>
      {label}
    </span>
  );
};
