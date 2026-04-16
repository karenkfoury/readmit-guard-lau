import { createFileRoute } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { Shield, Bell, CheckCircle } from 'lucide-react';
import { LAUHeader } from '@/components/LAUHeader';
import { RiskBadge } from '@/components/RiskBadge';
import { useStore } from '@/store/useStore';

export const Route = createFileRoute('/doctor/alerts')({
  component: AlertsPage,
});

function AlertsPage() {
  const alerts = useStore((s) => s.alerts);
  const acknowledgeAlert = useStore((s) => s.acknowledgeAlert);
  const unacknowledged = alerts.filter(a => !a.acknowledged);
  const total = alerts.length;

  return (
    <div className="min-h-screen bg-lau-bg">
      <LAUHeader />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        {/* Anti-alert-fatigue banner */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-xl bg-primary/5 border border-primary/20 p-4 mb-6 flex items-center gap-3"
        >
          <Shield className="h-5 w-5 text-primary flex-shrink-0" />
          <div>
            <p className="text-sm font-heading font-semibold text-primary">Anti-Alert-Fatigue Mode Active</p>
            <p className="text-xs text-muted-foreground font-body">
              Showing only material changes — <span className="font-semibold text-foreground">{total} alerts today, not 47</span>. 
              Quiet Mode filters noise so you focus on what matters.
            </p>
          </div>
        </motion.div>

        <h1 className="font-heading text-2xl font-bold text-foreground mb-6">Alerts & Tasks</h1>

        <div className="space-y-4">
          {alerts.map((a, i) => (
            <motion.div key={a.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className={`rounded-xl border bg-card p-5 shadow-sm transition-all ${a.acknowledged ? 'border-lau-border opacity-60' : 'border-l-4 border-l-risk-high border-lau-border'}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center ${a.acknowledged ? 'bg-risk-low/10 text-risk-low' : 'bg-risk-high/10 text-risk-high'}`}>
                    {a.acknowledged ? <CheckCircle className="h-5 w-5" /> : <Bell className="h-5 w-5" />}
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold text-foreground">{a.patientName}</h3>
                    <span className="text-xs text-muted-foreground font-body">
                      {a.type === 'threshold_crossed' ? '⚠️ Threshold Crossed' : a.type === 'significant_increase' ? '📈 Significant Increase' : '🗣 Self-Reported'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <RiskBadge score={a.riskScore} />
                  <span className="text-xs text-muted-foreground font-body">{new Date(a.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>

              <p className="text-sm text-muted-foreground font-body mb-3">{a.message}</p>

              <div className="flex items-center justify-between">
                <span className="text-xs font-body text-muted-foreground">
                  Suggested: <span className="font-semibold text-foreground">{a.suggestedAssignee}</span> ({a.suggestedRole})
                </span>
                {!a.acknowledged && (
                  <div className="flex gap-2">
                    <button onClick={() => acknowledgeAlert(a.id)}
                      className="text-xs px-3 py-1.5 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-lau-green-dark transition-colors"
                    >
                      Acknowledge
                    </button>
                    <button className="text-xs px-3 py-1.5 rounded-lg border border-lau-border text-foreground font-semibold hover:bg-accent transition-colors">
                      Take Action
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {alerts.length === 0 && (
          <div className="text-center py-16">
            <CheckCircle className="h-12 w-12 text-risk-low mx-auto mb-4" />
            <h2 className="font-heading text-xl font-bold text-foreground mb-2">All patients stable</h2>
            <p className="text-muted-foreground font-body">No urgent follow-ups right now ✓</p>
          </div>
        )}
      </main>
    </div>
  );
}
