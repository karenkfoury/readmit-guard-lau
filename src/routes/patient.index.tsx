import { createFileRoute } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { Link } from '@tanstack/react-router';
import { Calendar, Clock, Activity, Pill, MessageCircle, ClipboardList } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { usePatientData } from '@/hooks/usePatientData';

export const Route = createFileRoute('/patient/')({
  component: PatientDashboardIndex,
});

function PatientDashboardIndex() {
  const { user, profile } = useAuth();
  const { medicalRecord, checkIns, medications, medicationLogs, latestRisk, previousRisk, notifications, loading } = usePatientData(user?.id);

  const firstName = profile?.full_name?.split(' ')[0] || 'there';
  const riskScore = latestRisk?.score ?? null;
  const prevScore = previousRisk?.score ?? null;

  const daysSinceDischarge = medicalRecord?.discharge_date
    ? Math.ceil((Date.now() - new Date(medicalRecord.discharge_date).getTime()) / 86400000)
    : null;

  const nextCheckIn = checkIns.find((c: any) => c.status === 'pending' || c.status === 'upcoming');
  const today = new Date().toISOString().split('T')[0];
  const todayLogs = medicationLogs.filter((l: any) => l.scheduled_at?.startsWith(today) && l.taken);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-24 rounded-xl bg-card animate-pulse border border-lau-border" />)}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Greeting + Risk */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-heading text-2xl font-bold text-foreground">Welcome back, {firstName} 👋</h1>
        <p className="text-sm text-muted-foreground font-body mt-1">Your recovery is on track.</p>
      </motion.div>

      {riskScore !== null && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-xl border border-lau-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-body">Current Risk Score</p>
              <p className={`text-3xl font-heading font-bold ${riskScore >= 50 ? 'text-risk-high' : riskScore >= 30 ? 'text-risk-moderate' : 'text-risk-low'}`}>
                {riskScore}%
              </p>
              {prevScore !== null && prevScore !== riskScore && (
                <p className={`text-xs font-body ${riskScore > prevScore ? 'text-risk-high' : 'text-risk-low'}`}>
                  {riskScore > prevScore ? '↑' : '↓'} from {prevScore}%
                </p>
              )}
            </div>
            <div className={`h-14 w-14 rounded-full flex items-center justify-center ${riskScore >= 50 ? 'bg-risk-high/10' : riskScore >= 30 ? 'bg-risk-moderate/10' : 'bg-risk-low/10'}`}>
              <Activity className={`h-7 w-7 ${riskScore >= 50 ? 'text-risk-high' : riskScore >= 30 ? 'text-risk-moderate' : 'text-risk-low'}`} />
            </div>
          </div>
          {latestRisk?.calculated_at && (
            <p className="text-[10px] text-muted-foreground font-body mt-2">
              Updated {new Date(latestRisk.calculated_at).toLocaleString()}
            </p>
          )}
          {/* Dynamic reassurance */}
          <div className="mt-3 rounded-lg bg-primary/5 border border-primary/20 p-3">
            <p className="text-xs text-primary font-body font-semibold">
              {riskScore >= 50 ? '🩺 Your care team is closely monitoring your recovery and may reach out soon.' : '✅ Your recovery looks good. Keep taking your medications and logging vitals.'}
            </p>
          </div>
        </motion.div>
      )}

      {/* Recovery Stepper */}
      {checkIns.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="rounded-xl border border-lau-border bg-card p-5 shadow-sm">
          <h3 className="font-heading font-semibold text-foreground mb-3">Recovery Progress</h3>
          <div className="flex items-center justify-between">
            {checkIns.map((ci: any, i: number) => (
              <div key={ci.id} className="flex flex-col items-center flex-1">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  ci.status === 'completed' ? 'bg-primary text-primary-foreground' :
                  ci.status === 'pending' ? 'bg-risk-moderate/20 text-risk-moderate border-2 border-risk-moderate' :
                  'bg-muted text-muted-foreground'
                }`}>
                  {ci.status === 'completed' ? '✓' : ci.day_number}
                </div>
                <span className="text-[10px] text-muted-foreground font-body mt-1">Day {ci.day_number}</span>
                <span className={`text-[10px] font-body font-semibold ${
                  ci.status === 'completed' ? 'text-primary' : ci.status === 'pending' ? 'text-risk-moderate' : 'text-muted-foreground'
                }`}>{ci.status}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Action Tiles */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="grid grid-cols-2 gap-3">
        {nextCheckIn && (
          <Link to="/patient/checkin/$day" params={{ day: String(nextCheckIn.day_number) }}
            className="rounded-xl border-2 border-primary bg-primary/5 p-4 shadow-sm hover:shadow-md transition-all">
            <ClipboardList className="h-6 w-6 text-primary mb-2" />
            <p className="font-heading font-semibold text-sm text-primary">Check-In</p>
            <p className="text-xs text-muted-foreground font-body">Day {nextCheckIn.day_number} · {nextCheckIn.status === 'pending' ? 'Ready' : 'Upcoming'}</p>
          </Link>
        )}
        <Link to="/patient/medications" className="rounded-xl border border-lau-border bg-card p-4 shadow-sm hover:shadow-md transition-all">
          <Pill className="h-6 w-6 text-primary mb-2" />
          <p className="font-heading font-semibold text-sm text-foreground">Medications</p>
          <p className="text-xs text-muted-foreground font-body">{todayLogs.length} of {medications.length} taken</p>
        </Link>
        <Link to="/patient/vitals" className="rounded-xl border border-lau-border bg-card p-4 shadow-sm hover:shadow-md transition-all">
          <Activity className="h-6 w-6 text-primary mb-2" />
          <p className="font-heading font-semibold text-sm text-foreground">Log Vitals</p>
          <p className="text-xs text-muted-foreground font-body">Quick access</p>
        </Link>
        <Link to="/patient/chat" className="rounded-xl border border-lau-border bg-card p-4 shadow-sm hover:shadow-md transition-all">
          <MessageCircle className="h-6 w-6 text-primary mb-2" />
          <p className="font-heading font-semibold text-sm text-foreground">Chat Assistant</p>
          <p className="text-xs text-muted-foreground font-body">Ask anything</p>
        </Link>
      </motion.div>

      {/* Recent Notifications */}
      {notifications.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="rounded-xl border border-lau-border bg-card p-5 shadow-sm">
          <h3 className="font-heading font-semibold text-foreground mb-3">Notifications</h3>
          <div className="space-y-2">
            {notifications.slice(0, 5).map((n: any) => (
              <div key={n.id} className={`flex items-center gap-3 p-3 rounded-lg ${!n.read ? 'bg-primary/5 border border-primary/20' : 'bg-lau-bg'}`}>
                <div className={`${!n.read ? 'text-primary' : 'text-muted-foreground'}`}>
                  {n.type === 'medication_reminder' ? <Pill className="h-4 w-4" /> :
                   n.type === 'checkin_due' ? <ClipboardList className="h-4 w-4" /> :
                   n.type === 'risk_alert' ? <Activity className="h-4 w-4" /> :
                   <MessageCircle className="h-4 w-4" />}
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-body ${!n.read ? 'text-primary font-semibold' : 'text-foreground'}`}>{n.title}</p>
                  {n.body && <p className="text-xs text-muted-foreground font-body">{n.body}</p>}
                </div>
                <span className="text-[10px] text-muted-foreground font-body">{new Date(n.created_at).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {daysSinceDischarge !== null && (
        <div className="text-center">
          <p className="text-xs text-muted-foreground font-body">
            <Clock className="inline h-3 w-3 mr-1" />
            {daysSinceDischarge} days since discharge · {medicalRecord?.primary_diagnosis}
          </p>
        </div>
      )}
    </div>
  );
}
