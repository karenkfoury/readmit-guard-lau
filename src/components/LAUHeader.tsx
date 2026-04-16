import { Link, useLocation } from '@tanstack/react-router';
import { Bell, Shield } from 'lucide-react';
import { useStore } from '@/store/useStore';

export function LAUHeader() {
  const role = useStore((s) => s.role);
  const alerts = useStore((s) => s.alerts);
  const unacknowledged = alerts.filter(a => !a.acknowledged).length;
  const location = useLocation();

  return (
    <header className="bg-primary text-primary-foreground sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5">
            <Shield className="h-7 w-7" />
            <div>
              <span className="font-heading text-lg font-bold tracking-tight">ReAdmit Guard</span>
              <span className="hidden sm:inline text-primary-foreground/70 text-xs ml-2 font-body">LAU Health</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            <span className="text-xs text-primary-foreground/60 font-body">Lebanese American University</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Demo mode pill */}
            <span className="bg-primary-foreground/20 text-primary-foreground text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider">
              Demo Mode
            </span>

            {role === 'doctor' && (
              <>
                <Link
                  to="/doctor/alerts"
                  className="relative p-2 rounded-lg hover:bg-primary-foreground/10 transition-colors"
                >
                  <Bell className="h-5 w-5" />
                  {unacknowledged > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-risk-high text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                      {unacknowledged}
                    </span>
                  )}
                </Link>
                <div className="flex items-center gap-2 bg-primary-foreground/10 rounded-lg px-3 py-1.5">
                  <div className="h-7 w-7 rounded-full bg-primary-foreground/20 flex items-center justify-center text-xs font-bold">
                    KH
                  </div>
                  <span className="text-sm font-body hidden sm:inline">Dr. Haddad</span>
                </div>
              </>
            )}

            {role === 'patient' && (
              <div className="flex items-center gap-2 bg-primary-foreground/10 rounded-lg px-3 py-1.5">
                <div className="h-7 w-7 rounded-full bg-primary-foreground/20 flex items-center justify-center text-xs font-bold">
                  SC
                </div>
                <span className="text-sm font-body hidden sm:inline">Sarah</span>
              </div>
            )}
          </div>
        </div>

        {role === 'doctor' && (
          <nav className="flex gap-1 pb-2 -mb-px overflow-x-auto">
            {[
              { to: '/doctor' as const, label: 'Dashboard' },
              { to: '/doctor/schedule' as const, label: 'Schedule' },
              { to: '/doctor/alerts' as const, label: 'Alerts' },
            ].map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className="px-3 py-1.5 text-sm font-body rounded-md transition-colors"
                activeProps={{ className: 'bg-primary-foreground/20 font-semibold' }}
                inactiveProps={{ className: 'text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10' }}
                activeOptions={{ exact: to === '/doctor' }}
              >
                {label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
