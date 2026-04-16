import { createFileRoute, Link } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { LAUHeader } from '@/components/LAUHeader';
import { useStore } from '@/store/useStore';
import { Home, ClipboardList, History, User } from 'lucide-react';

export const Route = createFileRoute('/patient/history')({
  component: PatientHistory,
});

function PatientHistory() {
  const patient = useStore((s) => s.patients.find(p => p.id === 'p1'))!;
  const completed = patient.checkIns.filter(c => c.status === 'completed');

  return (
    <div className="min-h-screen bg-lau-bg">
      <LAUHeader />
      <main className="max-w-lg mx-auto px-4 py-6 pb-24 space-y-5">
        <h1 className="font-heading text-2xl font-bold text-foreground">Check-In History</h1>

        {completed.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground font-body">No check-ins completed yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {completed.map((c, i) => (
              <motion.div key={c.day} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className="rounded-xl border border-lau-border bg-card p-5 shadow-sm"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-heading font-semibold text-foreground">Day {c.day} Check-In</h3>
                  <span className="text-xs text-muted-foreground font-body">
                    {c.completedAt ? new Date(c.completedAt).toLocaleDateString() : ''}
                  </span>
                </div>
                {c.riskScoreAfter !== undefined && (
                  <p className="text-sm font-body text-muted-foreground mb-3">
                    Risk score after: <span className="font-semibold text-foreground">{c.riskScoreAfter}%</span>
                  </p>
                )}
                <div className="space-y-2">
                  {Object.entries(c.responses).filter(([_, v]) => v !== undefined && v !== '' && !(Array.isArray(v) && v.length === 0)).map(([key, val]) => (
                    <div key={key} className="flex justify-between text-sm font-body">
                      <span className="text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                      <span className="text-foreground font-semibold">{Array.isArray(val) ? val.join(', ') : String(val)}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 inset-x-0 bg-card border-t border-lau-border py-2 z-50">
        <div className="max-w-lg mx-auto flex justify-around">
          {[
            { icon: <Home className="h-5 w-5" />, label: 'Home', to: '/patient' as const, active: false },
            { icon: <ClipboardList className="h-5 w-5" />, label: 'Check-Ins', to: '/patient' as const, active: false },
            { icon: <History className="h-5 w-5" />, label: 'History', to: '/patient/history' as const, active: true },
            { icon: <User className="h-5 w-5" />, label: 'Profile', to: '/patient' as const, active: false },
          ].map((item) => (
            <Link key={item.label} to={item.to} className={`flex flex-col items-center gap-0.5 px-3 py-1 ${item.active ? 'text-primary' : 'text-muted-foreground'}`}>
              {item.icon}
              <span className="text-[10px] font-body">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
