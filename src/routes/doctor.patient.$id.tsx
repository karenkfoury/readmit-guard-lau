import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Phone, Mail, Calendar, UserCheck, MessageSquare, Plus, Activity, Thermometer, Heart } from 'lucide-react';
import { LAUHeader } from '@/components/LAUHeader';
import { RiskGauge } from '@/components/RiskGauge';
import { RiskBadge } from '@/components/RiskBadge';
import { Footer } from '@/components/layout/Footer';
import { useStore } from '@/store/useStore';
import { getRiskLevel } from '@/lib/riskEngine';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';
import { toast } from 'sonner';

export const Route = createFileRoute('/doctor/patient/$id')({
  component: PatientDetail,
});

function PatientDetail() {
  const { id } = Route.useParams();
  const patient = useStore((s) => s.patients.find(p => p.id === id));
  const updateFollowUp = useStore((s) => s.updateFollowUp);
  const incrementPrevented = useStore((s) => s.incrementPrevented);
  const addFollowUp = useStore((s) => s.addFollowUp);
  const followUps = useStore((s) => s.followUps);
  const [tab, setTab] = useState<'overview' | 'timeline' | 'surveys' | 'careplan'>('overview');
  const [scheduled, setScheduled] = useState(false);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleReason, setScheduleReason] = useState('');

  if (!patient) {
    return (
      <div className="min-h-screen bg-lau-bg flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-heading text-2xl font-bold text-lau-anthracite">Patient not found</h1>
          <Link to="/doctor" className="text-primary hover:underline mt-2 block font-body">Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  const topFactors = patient.riskFactors.slice(0, 5);
  const factorColors = (points: number) => points >= 15 ? '#DC2626' : points >= 10 ? '#F59E0B' : '#16A34A';
  const riskLevel = getRiskLevel(patient.riskScore);

  const handleSchedule = () => {
    const fu = followUps.find(f => f.patientId === patient.id && f.status !== 'completed');
    if (fu) updateFollowUp(fu.id, { status: 'completed' });
    incrementPrevented();
    setScheduled(true);
  };

  const handleAddToSchedule = () => {
    if (!scheduleDate) return;
    const newFollowUp = {
      id: `f-new-${Date.now()}`,
      patientId: patient.id,
      patientName: patient.name,
      riskScore: patient.riskScore,
      reason: scheduleReason || 'Doctor-scheduled follow-up',
      suggestedDate: scheduleDate,
      priority: riskLevel === 'high' ? 'urgent' as const : riskLevel === 'moderate' ? 'high' as const : 'medium' as const,
      assignedClinician: 'Dr. Karim Haddad',
      status: 'upcoming' as const,
    };
    addFollowUp(newFollowUp);
    toast.success(`${patient.name} added to schedule for ${scheduleDate}`);
    setShowScheduleForm(false);
    setScheduleDate('');
    setScheduleReason('');
  };

  // Latest check-in data for vitals summary
  const latestCompleted = patient.checkIns.filter(c => c.status === 'completed').pop();
  const latestResponses = latestCompleted?.responses || {};

  return (
    <div className="min-h-screen bg-lau-bg flex flex-col">
      <LAUHeader />

      <main className="flex-1 max-w-5xl mx-auto px-6 md:px-8 py-6">
        <Link to="/doctor" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary font-body mb-4">
          <ArrowLeft className="h-4 w-4" strokeWidth={1.75} /> Back to Dashboard
        </Link>

        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <div className="md:col-span-2 rounded-2xl border border-lau-border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-16 w-16 rounded-full bg-lau-green-tint flex items-center justify-center text-primary font-heading font-bold text-xl">
                {patient.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <h1 className="font-heading text-2xl font-bold text-lau-anthracite">{patient.name}</h1>
                <p className="text-muted-foreground font-body">{patient.age}yo · {patient.gender === 'M' ? 'Male' : 'Female'} · {patient.diagnosis}</p>
                <div className="flex gap-2 mt-1 flex-wrap">
                  {patient.comorbidities.map(c => (
                    <span key={c} className="text-xs bg-lau-bg text-muted-foreground px-2 py-0.5 rounded-full font-body">{c}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="flex flex-wrap gap-4 mb-4 p-3 rounded-xl bg-lau-bg border border-lau-border">
              {patient.phone && (
                <a href={`tel:${patient.phone}`} className="inline-flex items-center gap-2 text-sm font-body text-primary hover:underline">
                  <Phone className="h-4 w-4" strokeWidth={1.75} /> {patient.phone}
                </a>
              )}
              {patient.email && (
                <a href={`mailto:${patient.email}`} className="inline-flex items-center gap-2 text-sm font-body text-primary hover:underline">
                  <Mail className="h-4 w-4" strokeWidth={1.75} /> {patient.email}
                </a>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-lau-bg rounded-xl p-3"><p className="text-xs text-muted-foreground font-body">Discharged</p><p className="font-semibold text-sm font-body text-lau-anthracite">{patient.dischargeDate}</p></div>
              <div className="bg-lau-bg rounded-xl p-3"><p className="text-xs text-muted-foreground font-body">Prior Admissions</p><p className="font-semibold text-sm font-body text-lau-anthracite">{patient.priorAdmissions}</p></div>
              <div className="bg-lau-bg rounded-xl p-3"><p className="text-xs text-muted-foreground font-body">Medications</p><p className="font-semibold text-sm font-body text-lau-anthracite">{patient.medications.length}</p></div>
            </div>
          </div>

          <div className="rounded-2xl border border-lau-border bg-card p-6 shadow-sm flex flex-col items-center justify-center">
            <RiskGauge score={patient.riskScore} size={180} />
            <div className={`mt-2 text-xs font-heading font-bold uppercase tracking-wide ${
              riskLevel === 'high' ? 'text-risk-high' : riskLevel === 'moderate' ? 'text-risk-moderate' : 'text-risk-low'
            }`}>
              {riskLevel} risk
            </div>
          </div>
        </div>

        {/* Latest Vitals / Status Summary */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-lau-border bg-card p-6 shadow-sm mb-6">
          <h2 className="font-heading text-lg font-bold text-lau-anthracite mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" strokeWidth={1.75} /> Current Status
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-lau-bg rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Thermometer className="h-4 w-4 text-primary/60" strokeWidth={1.75} />
                <p className="text-xs text-muted-foreground font-body">Symptoms</p>
              </div>
              <p className="font-body font-semibold text-sm text-lau-anthracite capitalize">
                {(latestResponses.symptomsStatus as string) || 'No data'}
              </p>
            </div>
            <div className="bg-lau-bg rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Heart className="h-4 w-4 text-primary/60" strokeWidth={1.75} />
                <p className="text-xs text-muted-foreground font-body">Shortness of Breath</p>
              </div>
              <p className="font-body font-semibold text-sm text-lau-anthracite capitalize">
                {(latestResponses.shortnessOfBreath as string) || 'No data'}
              </p>
            </div>
            <div className="bg-lau-bg rounded-xl p-4">
              <p className="text-xs text-muted-foreground font-body mb-1">Weight (kg)</p>
              <p className="font-body font-semibold text-sm text-lau-anthracite tabular-nums">
                {latestResponses.weight ? `${latestResponses.weight} kg` : 'No data'}
              </p>
            </div>
            <div className="bg-lau-bg rounded-xl p-4">
              <p className="text-xs text-muted-foreground font-body mb-1">Latest Check-In</p>
              <p className="font-body font-semibold text-sm text-lau-anthracite">
                {latestCompleted ? `Day ${latestCompleted.day}` : 'None yet'}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Add to Schedule */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="rounded-2xl border border-lau-border bg-card p-6 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-lg font-bold text-lau-anthracite flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" strokeWidth={1.75} /> Schedule
            </h2>
            {!showScheduleForm && (
              <button onClick={() => setShowScheduleForm(true)}
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-heading font-semibold hover:bg-lau-green-dark transition-all active:scale-[0.98]">
                <Plus className="h-4 w-4" strokeWidth={1.75} /> Add to Schedule
              </button>
            )}
          </div>

          {showScheduleForm && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
              className="space-y-3 p-4 rounded-xl bg-lau-bg border border-lau-border mb-4">
              <div>
                <label className="text-sm font-body font-semibold text-lau-anthracite mb-1 block">Date</label>
                <input type="date" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-lau-border bg-white text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              </div>
              <div>
                <label className="text-sm font-body font-semibold text-lau-anthracite mb-1 block">Reason (optional)</label>
                <input type="text" value={scheduleReason} onChange={e => setScheduleReason(e.target.value)}
                  placeholder="e.g. Follow-up review"
                  className="w-full px-4 py-2 rounded-xl border border-lau-border bg-white text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              </div>
              <div className="flex gap-2">
                <button onClick={handleAddToSchedule} disabled={!scheduleDate}
                  className="bg-primary text-primary-foreground px-5 py-2 rounded-full text-sm font-heading font-semibold hover:bg-lau-green-dark transition-all disabled:opacity-50">
                  Confirm
                </button>
                <button onClick={() => setShowScheduleForm(false)}
                  className="border border-lau-border px-4 py-2 rounded-full text-sm font-body text-lau-anthracite hover:bg-lau-green-tint transition-colors">
                  Cancel
                </button>
              </div>
            </motion.div>
          )}

          {/* Existing follow-ups for this patient */}
          {followUps.filter(f => f.patientId === patient.id).length > 0 ? (
            <div className="space-y-2">
              {followUps.filter(f => f.patientId === patient.id).map(f => (
                <div key={f.id} className={`flex items-center justify-between p-3 rounded-xl border border-lau-border ${f.status === 'completed' ? 'opacity-50' : ''}`}>
                  <div>
                    <p className="text-sm font-body font-semibold text-lau-anthracite">{f.reason}</p>
                    <p className="text-xs text-muted-foreground font-body">📅 {f.suggestedDate} · {f.assignedClinician}</p>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase ${
                    f.status === 'completed' ? 'bg-risk-low-bg text-risk-low' :
                    f.priority === 'urgent' ? 'bg-risk-high-bg text-risk-high' :
                    'bg-lau-green-tint text-primary'
                  }`}>
                    {f.status === 'completed' ? 'Done' : f.priority}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground font-body">No follow-ups scheduled</p>
          )}
        </motion.div>

        {topFactors.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-lau-border bg-card p-6 shadow-sm mb-6">
            <h2 className="font-heading text-lg font-bold text-lau-anthracite mb-4">Why This Patient is {riskLevel === 'high' ? 'High' : 'At'} Risk</h2>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topFactors} layout="vertical" margin={{ left: 10, right: 30 }}>
                  <XAxis type="number" domain={[0, 20]} hide />
                  <YAxis type="category" dataKey="label" width={200} tick={{ fontSize: 12, fontFamily: 'PT Sans' }} />
                  <Bar dataKey="points" radius={[0, 4, 4, 0]} barSize={20}>
                    {topFactors.map((f, i) => <Cell key={i} fill={factorColors(f.points)} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-4">
              {topFactors.map((f, i) => (
                <div key={i} className="flex items-start gap-3 text-sm font-body">
                  <span className="font-bold text-lau-anthracite whitespace-nowrap">+{f.points} pts</span>
                  <span className="text-muted-foreground">{f.description}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mb-4 border-b border-lau-border">
          {(['overview', 'timeline', 'surveys', 'careplan'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-3 text-sm font-heading font-semibold transition-colors ${tab === t ? 'text-primary border-b-2 border-primary' : 'text-lau-anthracite/50 hover:text-lau-anthracite'}`}>
              {t === 'careplan' ? 'Care Plan' : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        <div className="rounded-2xl border border-lau-border bg-card p-6 shadow-sm min-h-[300px]">
          {tab === 'overview' && (
            <div className="space-y-4">
              <h3 className="font-heading font-semibold text-lau-anthracite">Patient Overview</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground font-body mb-1">Living Situation</p>
                  <p className="font-body font-semibold text-lau-anthracite">{patient.livesAlone ? '⚠️ Lives alone' : '✓ Lives with family/support'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-body mb-1">Discharge Day</p>
                  <p className="font-body font-semibold text-lau-anthracite">{patient.weekendDischarge ? '⚠️ Weekend discharge' : '✓ Weekday discharge'}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-body mb-2">Current Medications</p>
                <div className="flex flex-wrap gap-2">
                  {patient.medications.map(m => (
                    <span key={m} className="text-xs bg-lau-green-tint text-primary px-2.5 py-1 rounded-full font-body">{m}</span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === 'timeline' && (
            <div className="space-y-6">
              <h3 className="font-heading font-semibold text-lau-anthracite">Check-In Timeline</h3>
              {patient.checkIns.map((c) => (
                <div key={c.day} className="relative pl-8 pb-6 border-l-2 border-lau-border last:border-l-0">
                  <div className={`absolute left-[-9px] top-0 h-4 w-4 rounded-full border-2 ${c.status === 'completed' ? 'bg-primary border-primary' : 'bg-card border-lau-border'}`} />
                  <div className="mb-1">
                    <span className="font-heading font-semibold text-lau-anthracite">Day {c.day}</span>
                    <span className={`ml-2 text-xs px-2 py-0.5 rounded-full font-semibold ${c.status === 'completed' ? 'bg-lau-green-tint text-primary' : c.status === 'pending' ? 'bg-risk-moderate-bg text-risk-moderate' : 'bg-lau-bg text-muted-foreground'}`}>
                      {c.status}
                    </span>
                  </div>
                  {c.completedAt && <p className="text-xs text-muted-foreground font-body">{new Date(c.completedAt).toLocaleString()}</p>}
                  {c.riskScoreAfter !== undefined && <p className="text-sm font-body mt-1">Risk after: <RiskBadge score={c.riskScoreAfter} size="sm" /></p>}
                  {c.status === 'completed' && Object.keys(c.responses).length > 0 && (
                    <div className="mt-2 bg-lau-bg rounded-xl p-3 space-y-1">
                      {Object.entries(c.responses).filter(([_, v]) => v !== undefined && v !== '' && !(Array.isArray(v) && v.length === 0)).map(([k, v]) => (
                        <div key={k} className="flex justify-between text-xs font-body">
                          <span className="text-muted-foreground capitalize">{k.replace(/([A-Z])/g, ' $1')}</span>
                          <span className="text-lau-anthracite font-semibold">{Array.isArray(v) ? v.join(', ') : String(v)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {tab === 'surveys' && (
            <div className="space-y-4">
              <h3 className="font-heading font-semibold text-lau-anthracite">Survey Responses</h3>
              {patient.checkIns.filter(c => c.status === 'completed').map(c => (
                <div key={c.day} className="bg-lau-bg rounded-xl p-4">
                  <h4 className="font-heading font-semibold text-lau-anthracite mb-2">Day {c.day}</h4>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {Object.entries(c.responses).filter(([_, v]) => v !== undefined && v !== '').map(([k, v]) => (
                      <div key={k} className="text-sm font-body">
                        <span className="text-muted-foreground capitalize">{k.replace(/([A-Z])/g, ' $1')}: </span>
                        <span className="text-lau-anthracite font-semibold">{Array.isArray(v) ? v.join(', ') : String(v)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'careplan' && (
            <div className="space-y-4">
              <h3 className="font-heading font-semibold text-lau-anthracite">Recommended Care Plan</h3>
              {patient.carePlan ? (
                <div className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="bg-lau-bg rounded-xl p-4">
                      <p className="text-xs text-muted-foreground font-body mb-1">Suggested Assignee</p>
                      <p className="font-heading font-semibold text-lau-anthracite">{patient.carePlan.suggestedAssignee}</p>
                      <span className="text-xs bg-lau-green-tint text-primary px-2 py-0.5 rounded-full capitalize font-body">{patient.carePlan.suggestedRole.replace('_', ' ')}</span>
                    </div>
                    <div className="bg-lau-bg rounded-xl p-4">
                      <p className="text-xs text-muted-foreground font-body mb-1">Suggested Action</p>
                      <p className="font-heading font-semibold text-lau-anthracite">{patient.carePlan.suggestedAction}</p>
                    </div>
                  </div>
                  <div className="bg-lau-bg rounded-xl p-4">
                    <p className="text-xs text-muted-foreground font-body mb-1">Reason</p>
                    <p className="font-body text-lau-anthracite">{patient.carePlan.reason}</p>
                  </div>

                  {/* Notification routing info */}
                  <div className="bg-lau-green-tint rounded-xl p-4 border border-primary/20">
                    <p className="text-xs font-heading font-semibold text-primary mb-1">
                      {riskLevel === 'high' ? '🔴 High Risk — Doctor notified immediately' :
                       riskLevel === 'moderate' ? '🟡 Intermediate Risk — Staff assigned for monitoring' :
                       '🟢 Low Risk — Passive monitoring only'}
                    </p>
                    <p className="text-xs text-muted-foreground font-body">
                      {riskLevel === 'high' ? `${patient.carePlan.suggestedAssignee} and supporting staff have been alerted.` :
                       riskLevel === 'moderate' ? `${patient.carePlan.suggestedAssignee} is monitoring this patient.` :
                       'No urgent action needed. Patient visible on dashboard.'}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3 pt-2">
                    {!scheduled ? (
                      <button onClick={handleSchedule} className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-full font-heading font-semibold hover:bg-lau-green-dark hover:shadow-md transition-all active:scale-[0.98]">
                        <Calendar className="h-4 w-4" strokeWidth={1.75} /> Mark Follow-Up Scheduled
                      </button>
                    ) : (
                      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                        className="inline-flex items-center gap-2 bg-risk-low-bg text-risk-low px-5 py-2.5 rounded-full font-heading font-semibold">
                        <UserCheck className="h-4 w-4" strokeWidth={1.75} /> ✓ Follow-Up Scheduled — Readmission Prevented!
                      </motion.div>
                    )}
                    {patient.phone && (
                      <a href={`tel:${patient.phone}`} className="inline-flex items-center gap-2 border border-lau-border px-4 py-2 rounded-full font-body text-sm text-lau-anthracite hover:bg-lau-green-tint transition-colors">
                        <Phone className="h-4 w-4" strokeWidth={1.75} /> Call Patient
                      </a>
                    )}
                    <button className="inline-flex items-center gap-2 border border-lau-border px-4 py-2 rounded-full font-body text-sm text-lau-anthracite hover:bg-lau-green-tint transition-colors">
                      <MessageSquare className="h-4 w-4" strokeWidth={1.75} /> Add Note
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground font-body">No care plan generated — patient is at low risk. ✓</p>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
