import { createFileRoute, Link } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { Calendar, Clock, Bell, Home, ClipboardList, History, User } from 'lucide-react';
import { LAUHeader } from '@/components/LAUHeader';
import { ProgressStepper } from '@/components/ProgressStepper';
import { useStore } from '@/store/useStore';

export const Route = createFileRoute('/patient')({
  component: PatientDashboard,
});

function PatientDashboard() {
  const setRole = useStore((s) => s.setRole);
  setRole('patient');

  const patient = useStore((s) => s.patients.find(p => p.id === 'p1'))!;
  const daysSinceDischarge = Math.ceil((Date.now() - new Date(patient.dischargeDate).getTime()) / 86400000);

  const nextCheckIn = patient.checkIns.find(c => c.status === 'pending');
  const nextDay = nextCheckIn?.day || patient.checkIns.find(c => c.status === 'upcoming')?.day;

  return (
    <div className="min-h-screen bg-lau-bg">
      <LAUHeader />

      <main className="max-w-lg mx-auto px-4 py-6 pb-24 space-y-5">
        {/* Greeting */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-heading text-2xl font-bold text-foreground">Welcome back, Sarah 👋</h1>
          <p className="text-sm text-muted-foreground font-body mt-1">Your recovery is on track. Here's your status.</p>
        </motion.div>

        {/* Profile Card */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-xl border border-lau-border bg-card p-5 shadow-sm"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-primary font-heading font-bold text-lg">SC</div>
            <div>
              <h2 className="font-heading font-bold text-foreground">{patient.name}</h2>
              <p className="text-sm text-muted-foreground font-body">{patient.age}yo · {patient.diagnosis}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="bg-lau-bg rounded-lg p-3">
              <Calendar className="h-4 w-4 text-primary mx-auto mb-1" />
              <p className="text-xs text-muted-foreground font-body">Discharged</p>
              <p className="text-sm font-semibold font-body text-foreground">{patient.dischargeDate}</p>
            </div>
            <div className="bg-lau-bg rounded-lg p-3">
              <Clock className="h-4 w-4 text-primary mx-auto mb-1" />
              <p className="text-xs text-muted-foreground font-body">Days Post-Discharge</p>
              <p className="text-sm font-semibold font-body text-foreground">{daysSinceDischarge} days</p>
            </div>
          </div>
        </motion.div>

        {/* Progress Stepper */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="rounded-xl border border-lau-border bg-card p-5 shadow-sm"
        >
          <h3 className="font-heading font-semibold text-foreground mb-4">Recovery Progress</h3>
          <ProgressStepper steps={patient.checkIns.map(c => ({ day: c.day, status: c.status, completedAt: c.completedAt }))} />
        </motion.div>

        {/* Next Check-In */}
        {nextDay && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Link to="/patient/checkin/$day" params={{ day: String(nextDay) }}>
              <div className="rounded-xl border-2 border-primary bg-primary/5 p-5 shadow-sm hover:shadow-md transition-all cursor-pointer">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-heading font-semibold text-primary">Next Check-In: Day {nextDay}</h3>
                  <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full font-semibold">
                    {nextCheckIn ? 'Ready' : 'Coming Soon'}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground font-body mb-4">Complete your check-in to help your care team monitor your recovery.</p>
                <button className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-heading font-semibold text-lg hover:bg-lau-green-dark transition-colors">
                  Start Check-In →
                </button>
              </div>
            </Link>
          </motion.div>
        )}

        {/* Reassurance */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="rounded-xl bg-primary/5 border border-primary/20 p-4 text-center"
        >
          <p className="text-sm text-primary font-body font-semibold">🩺 Your care team is monitoring your recovery.</p>
          <p className="text-xs text-muted-foreground font-body mt-1">We'll reach out if anything needs attention.</p>
        </motion.div>

        {/* Notifications */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="rounded-xl border border-lau-border bg-card p-5 shadow-sm"
        >
          <h3 className="font-heading font-semibold text-foreground mb-3">Notifications</h3>
          <div className="space-y-3">
            {[
              { icon: <ClipboardList className="h-4 w-4" />, text: 'Day 7 check-in is ready', time: 'Now', urgent: true },
              { icon: <Bell className="h-4 w-4" />, text: 'Medication reminder: Take Furosemide', time: '2h ago', urgent: false },
              { icon: <Bell className="h-4 w-4" />, text: 'Day 3 check-in completed ✓', time: '3 days ago', urgent: false },
            ].map((n, i) => (
              <div key={i} className={`flex items-center gap-3 p-3 rounded-lg ${n.urgent ? 'bg-primary/5 border border-primary/20' : 'bg-lau-bg'}`}>
                <div className={`${n.urgent ? 'text-primary' : 'text-muted-foreground'}`}>{n.icon}</div>
                <div className="flex-1">
                  <p className={`text-sm font-body ${n.urgent ? 'text-primary font-semibold' : 'text-foreground'}`}>{n.text}</p>
                </div>
                <span className="text-xs text-muted-foreground font-body">{n.time}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 inset-x-0 bg-card border-t border-lau-border py-2 z-50">
        <div className="max-w-lg mx-auto flex justify-around">
          {[
            { icon: <Home className="h-5 w-5" />, label: 'Home', to: '/patient' as const, active: true },
            { icon: <ClipboardList className="h-5 w-5" />, label: 'Check-Ins', to: '/patient' as const, active: false },
            { icon: <History className="h-5 w-5" />, label: 'History', to: '/patient/history' as const, active: false },
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
