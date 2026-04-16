import { Link, useLocation } from '@tanstack/react-router';
import { Bell } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { LAUHealthLockup } from '@/components/brand/LAULogo';

export function LAUHeader() {
  const role = useStore((s) => s.role);
  const alerts = useStore((s) => s.alerts);
  const unacknowledged = alerts.filter(a => !a.acknowledged).length;

  return (
    <header className="bg-white border-b border-lau-border sticky top-0 z-50 h-[72px]">
      <div className="max-w-[1280px] mx-auto px-6 h-full flex items-center justify-between">
        <Link to="/">
          <LAUHealthLockup />
        </Link>

        {role === 'doctor' && (
          <nav className="hidden md:flex items-center gap-1">
            {[
              { to: '/doctor' as const, label: 'Dashboard' },
              { to: '/doctor/schedule' as const, label: 'Schedule' },
              { to: '/doctor/alerts' as const, label: 'Alerts' },
            ].map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className="px-4 py-2 text-sm font-body font-medium text-lau-anthracite/70 hover:text-lau-anthracite transition-colors relative"
                activeProps={{ className: 'text-primary font-semibold after:absolute after:bottom-0 after:left-2 after:right-2 after:h-0.5 after:bg-primary after:rounded-full' }}
                activeOptions={{ exact: to === '/doctor' }}
              >
                {label}
              </Link>
            ))}
          </nav>
        )}

        <div className="flex items-center gap-3">
          <span className="bg-lau-green-tint text-primary text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
            Demo
          </span>

          {role === 'doctor' && (
            <>
              <Link
                to="/doctor/alerts"
                className="relative p-2 rounded-full hover:bg-lau-green-tint transition-colors"
              >
                <Bell className="h-5 w-5 text-lau-anthracite/70" strokeWidth={1.75} />
                {unacknowledged > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-risk-high text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                    {unacknowledged}
                  </span>
                )}
              </Link>
              <div className="flex items-center gap-2 bg-lau-green-tint rounded-full px-3 py-1.5">
                <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                  KH
                </div>
                <span className="text-sm font-body text-lau-anthracite hidden sm:inline">Dr. Haddad</span>
              </div>
            </>
          )}

          {role === 'patient' && (
            <div className="flex items-center gap-2 bg-lau-green-tint rounded-full px-3 py-1.5">
              <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                SC
              </div>
              <span className="text-sm font-body text-lau-anthracite hidden sm:inline">Sarah</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
