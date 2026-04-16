import { createFileRoute } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { LAUHeader } from '@/components/LAUHeader';
import { RiskBadge } from '@/components/RiskBadge';
import { Footer } from '@/components/layout/Footer';
import { useStore } from '@/store/useStore';

export const Route = createFileRoute('/doctor/schedule')({
  component: SchedulePage,
});

const columns = [
  { key: 'today' as const, label: 'Today', color: 'border-risk-high' },
  { key: 'this_week' as const, label: 'This Week', color: 'border-risk-moderate' },
  { key: 'upcoming' as const, label: 'Upcoming', color: 'border-primary' },
  { key: 'completed' as const, label: 'Completed', color: 'border-risk-low' },
];

function SchedulePage() {
  const followUps = useStore((s) => s.followUps);
  const updateFollowUp = useStore((s) => s.updateFollowUp);

  const grouped = {
    today: followUps.filter(f => f.status === 'today'),
    this_week: followUps.filter(f => f.status === 'this_week'),
    upcoming: followUps.filter(f => f.status === 'upcoming'),
    completed: followUps.filter(f => f.status === 'completed'),
  };

  return (
    <div className="min-h-screen bg-lau-bg flex flex-col">
      <LAUHeader />

      <main className="flex-1 max-w-[1280px] mx-auto px-6 md:px-8 py-6">
        <h1 className="font-heading text-2xl md:text-3xl font-bold text-lau-anthracite mb-6">Schedule & Follow-Ups</h1>

        <div className="grid md:grid-cols-4 gap-4">
          {columns.map(col => (
            <div key={col.key}>
              <div className={`mb-3 flex items-center gap-2 pb-2 border-b-2 ${col.color}`}>
                <h2 className="font-heading font-semibold text-lau-anthracite">{col.label}</h2>
                <span className="text-xs bg-lau-bg text-muted-foreground px-2 py-0.5 rounded-full font-body">{grouped[col.key].length}</span>
              </div>
              <div className="space-y-3">
                {grouped[col.key].map((f, i) => (
                  <motion.div key={f.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    className="rounded-2xl border border-lau-border bg-card p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-heading font-semibold text-sm text-lau-anthracite">{f.patientName}</h3>
                      <RiskBadge score={f.riskScore} size="sm" />
                    </div>
                    <p className="text-xs text-muted-foreground font-body mb-1">{f.reason}</p>
                    <p className="text-xs text-muted-foreground font-body mb-2">📅 {f.suggestedDate}</p>
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase ${
                        f.priority === 'urgent' ? 'bg-risk-high-bg text-risk-high' :
                        f.priority === 'high' ? 'bg-risk-moderate-bg text-risk-moderate' :
                        f.priority === 'medium' ? 'bg-lau-green-tint text-primary' :
                        'bg-lau-bg text-muted-foreground'
                      }`}>
                        {f.priority}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-body">{f.assignedClinician}</span>
                    </div>
                    {col.key !== 'completed' && (
                      <button onClick={() => updateFollowUp(f.id, { status: 'completed' })}
                        className="w-full mt-3 text-xs py-2 rounded-full bg-primary text-primary-foreground font-semibold hover:bg-lau-green-dark transition-colors">
                        Mark Complete
                      </button>
                    )}
                  </motion.div>
                ))}
                {grouped[col.key].length === 0 && (
                  <p className="text-xs text-muted-foreground font-body text-center py-6">No items ✓</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
