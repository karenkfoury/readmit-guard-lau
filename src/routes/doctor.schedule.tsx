import { createFileRoute } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { LAUHeader } from '@/components/LAUHeader';
import { RiskBadge } from '@/components/RiskBadge';
import { Footer } from '@/components/layout/Footer';
import { useStore } from '@/store/useStore';

export const Route = createFileRoute('/doctor/schedule')({
  component: SchedulePage,
});

function SchedulePage() {
  const followUps = useStore((s) => s.followUps);
  const updateFollowUp = useStore((s) => s.updateFollowUp);

  // Group non-completed follow-ups by date
  const active = followUps.filter(f => f.status !== 'completed');
  const completed = followUps.filter(f => f.status === 'completed');

  const byDate = active.reduce<Record<string, typeof active>>((acc, f) => {
    const date = f.suggestedDate;
    if (!acc[date]) acc[date] = [];
    acc[date].push(f);
    return acc;
  }, {});

  const sortedDates = Object.keys(byDate).sort();
  const today = new Date().toISOString().split('T')[0];

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    if (dateStr === today) return 'Today';
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (dateStr === tomorrow.toISOString().split('T')[0]) return 'Tomorrow';
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-lau-bg flex flex-col">
      <LAUHeader />

      <main className="flex-1 max-w-[1280px] mx-auto px-6 md:px-8 py-6">
        <h1 className="font-heading text-2xl md:text-3xl font-bold text-lau-anthracite mb-6">Schedule & Follow-Ups</h1>

        <div className="space-y-8">
          {sortedDates.map(date => {
            const items = byDate[date].sort((a, b) => {
              const prio = { urgent: 0, high: 1, medium: 2, low: 3 };
              return prio[a.priority] - prio[b.priority];
            });
            const isToday = date === today;

            return (
              <div key={date}>
                <div className={`flex items-center gap-3 mb-3 pb-2 border-b-2 ${isToday ? 'border-risk-high' : 'border-primary'}`}>
                  <h2 className="font-heading font-semibold text-lau-anthracite">{formatDate(date)}</h2>
                  <span className="text-xs bg-lau-bg text-muted-foreground px-2 py-0.5 rounded-full font-body">{items.length} appointment{items.length > 1 ? 's' : ''}</span>
                  {isToday && <span className="text-xs bg-risk-high-bg text-risk-high px-2 py-0.5 rounded-full font-semibold">TODAY</span>}
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {items.map((f, i) => (
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
                      <button onClick={() => updateFollowUp(f.id, { status: 'completed' })}
                        className="w-full mt-3 text-xs py-2 rounded-full bg-primary text-primary-foreground font-semibold hover:bg-lau-green-dark transition-colors">
                        Mark Complete
                      </button>
                    </motion.div>
                  ))}
                </div>
              </div>
            );
          })}

          {sortedDates.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground font-body">No upcoming appointments ✓</p>
            </div>
          )}

          {completed.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-3 pb-2 border-b-2 border-risk-low">
                <h2 className="font-heading font-semibold text-lau-anthracite">Completed</h2>
                <span className="text-xs bg-lau-bg text-muted-foreground px-2 py-0.5 rounded-full font-body">{completed.length}</span>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {completed.map((f, i) => (
                  <motion.div key={f.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    className="rounded-2xl border border-lau-border bg-card p-4 shadow-sm opacity-60">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-heading font-semibold text-sm text-lau-anthracite">{f.patientName}</h3>
                      <RiskBadge score={f.riskScore} size="sm" />
                    </div>
                    <p className="text-xs text-muted-foreground font-body mb-1">{f.reason}</p>
                    <p className="text-xs text-muted-foreground font-body">📅 {f.suggestedDate}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
