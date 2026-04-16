import { createFileRoute, Link, Outlet, useNavigate } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { Home, Pill, Activity, MessageCircle, History, Bell, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { usePatientData } from '@/hooks/usePatientData';
import { useEffect } from 'react';
import { LAUHeader } from '@/components/LAUHeader';

export const Route = createFileRoute('/patient')({
  component: PatientLayout,
});

function PatientLayout() {
  const { user, profile, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const { ehrIntake, latestRisk, notifications, loading: dataLoading } = usePatientData(user?.id);

  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: '/login' });
    }
  }, [loading, user]);

  useEffect(() => {
    if (!loading && !dataLoading && user && !ehrIntake) {
      navigate({ to: '/patient/intake' });
    }
  }, [loading, dataLoading, user, ehrIntake]);

  if (loading) {
    return (
      <div className="min-h-screen bg-lau-bg flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const unreadCount = notifications.filter((n: any) => !n.read).length;

  return (
    <div className="min-h-screen bg-lau-bg">
      {/* Top Nav */}
      <header className="fixed top-0 inset-x-0 bg-card border-b border-lau-border z-50">
        <div className="max-w-lg mx-auto px-4 flex items-center justify-between h-14">
          <Link to="/patient" className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-full bg-primary flex items-center justify-center">
              <Activity className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-heading text-sm font-bold text-foreground">ReAdmit Guard</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/patient" className="relative">
              <Bell className="h-5 w-5 text-muted-foreground" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-risk-high text-[10px] text-primary-foreground flex items-center justify-center font-bold">
                  {unreadCount}
                </span>
              )}
            </Link>
            <button onClick={signOut} className="text-muted-foreground hover:text-foreground">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 pt-20 pb-24">
        <Outlet />
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 inset-x-0 bg-card border-t border-lau-border py-2 z-50">
        <div className="max-w-lg mx-auto flex justify-around">
          {[
            { icon: <Home className="h-5 w-5" />, label: 'Home', to: '/patient' as const },
            { icon: <Activity className="h-5 w-5" />, label: 'Vitals', to: '/patient/vitals' as const },
            { icon: <Pill className="h-5 w-5" />, label: 'Meds', to: '/patient/medications' as const },
            { icon: <MessageCircle className="h-5 w-5" />, label: 'Chat', to: '/patient/chat' as const },
            { icon: <History className="h-5 w-5" />, label: 'History', to: '/patient/history' as const },
          ].map((item) => (
            <Link key={item.label} to={item.to}
              activeProps={{ className: 'text-primary' }}
              inactiveProps={{ className: 'text-muted-foreground' }}
              className="flex flex-col items-center gap-0.5 px-3 py-1">
              {item.icon}
              <span className="text-[10px] font-body">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
