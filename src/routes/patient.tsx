import { createFileRoute, Link, Outlet, useNavigate } from '@tanstack/react-router';
import { Home, Pill, Activity, MessageCircle, History, Bell, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { usePatientData } from '@/hooks/usePatientData';
import { useEffect } from 'react';

export const Route = createFileRoute('/patient')({
  component: PatientLayout,
});

function PatientLayout() {
  const { user, profile, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const { ehrIntake, notifications, loading: dataLoading } = usePatientData(user?.id);

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
      <header className="fixed top-0 inset-x-0 bg-white border-b border-lau-border z-50 h-[72px]">
        <div className="max-w-lg mx-auto px-6 flex items-center justify-between h-full">
          <Link to="/patient" className="flex items-center gap-2">
            <span className="font-heading font-extrabold text-xl text-primary">LAU</span>
            <div className="w-px h-5 bg-lau-border" />
            <span className="font-heading text-sm font-bold text-lau-anthracite">ReAdmit Guard</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/patient" className="relative p-2 rounded-full hover:bg-lau-green-tint transition-colors">
              <Bell className="h-5 w-5 text-lau-anthracite/70" strokeWidth={1.75} />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-risk-high text-[10px] text-white flex items-center justify-center font-bold">
                  {unreadCount}
                </span>
              )}
            </Link>
            <button onClick={signOut} className="p-2 rounded-full text-lau-anthracite/70 hover:bg-lau-green-tint hover:text-lau-anthracite transition-colors">
              <LogOut className="h-4 w-4" strokeWidth={1.75} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-6 py-6 pt-24 pb-28">
        <Outlet />
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-lau-border py-2 z-50">
        <div className="max-w-lg mx-auto flex justify-around">
          {[
            { icon: <Home className="h-5 w-5" strokeWidth={1.75} />, label: 'Home', to: '/patient' as const },
            { icon: <Activity className="h-5 w-5" strokeWidth={1.75} />, label: 'Vitals', to: '/patient/vitals' as const },
            { icon: <Pill className="h-5 w-5" strokeWidth={1.75} />, label: 'Meds', to: '/patient/medications' as const },
            { icon: <MessageCircle className="h-5 w-5" strokeWidth={1.75} />, label: 'Chat', to: '/patient/chat' as const },
            { icon: <History className="h-5 w-5" strokeWidth={1.75} />, label: 'History', to: '/patient/history' as const },
          ].map((item) => (
            <Link key={item.label} to={item.to}
              activeProps={{ className: 'text-primary' }}
              inactiveProps={{ className: 'text-lau-anthracite/50' }}
              className="flex flex-col items-center gap-0.5 px-3 py-1">
              {item.icon}
              <span className="text-[10px] font-body font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
