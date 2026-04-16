import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Phone, Mail, Calendar, CalendarPlus, MessageSquare, MoreHorizontal, Activity, Thermometer, Heart, Droplets, Wind, Weight, TrendingUp, TrendingDown, Minus, MapPin, User, Clock } from 'lucide-react';
import { LAUHeader } from '@/components/LAUHeader';
import { RiskGauge } from '@/components/RiskGauge';
import { RiskBadge, RiskTrendArrow } from '@/components/RiskBadge';
import { Footer } from '@/components/layout/Footer';
import { useStore } from '@/store/useStore';
import { useDoctorPatientDetail } from '@/hooks/useDoctorPatientDetail';
import { getRiskLevel, getRiskCategoryLabel, getNotificationTarget } from '@/lib/riskEngine';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, LineChart, Line, Tooltip, CartesianGrid, ReferenceLine } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

export const Route = createFileRoute('/doctor/patient/$id')({
  component: PatientDetail,
});

function PatientDetail() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const patient = useStore((s) => s.patients.find(p => p.id === id));
  const addFollowUp = useStore((s) => s.addFollowUp);

  // Supabase data for real patients
  const detail = useDoctorPatientDetail(id);

  const [tab, setTab] = useState<'overview' | 'checkins' | 'vitals' | 'medications' | 'chat' | 'notes'>('overview');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleDate, setScheduleDate] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [scheduleTime, setScheduleTime] = useState('10:00');
  const [scheduleDuration, setScheduleDuration] = useState(30);
  const [scheduleType, setScheduleType] = useState<'in_person' | 'telehealth' | 'phone_call'>('telehealth');
  const [scheduleReason, setScheduleReason] = useState('');
  const [scheduleNotes, setScheduleNotes] = useState('');
  const [scheduling, setScheduling] = useState(false);
  const [doctorNotes, setDoctorNotes] = useState('');

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

  const riskLevel = getRiskLevel(patient.riskScore);
  const riskCategoryLabel = getRiskCategoryLabel(patient.riskScore);
  const notificationTarget = getNotificationTarget(patient.riskScore);
  const topFactors = patient.riskFactors.slice(0, 5);
  const factorColors = (points: number) => points >= 15 ? '#DC2626' : points >= 10 ? '#F59E0B' : '#16A34A';

  const daysSinceDischarge = Math.ceil((Date.now() - new Date(patient.dischargeDate).getTime()) / 86400000);
  const latestCompleted = patient.checkIns.filter(c => c.status === 'completed').pop();

  // Risk trend data from mock + real
  const riskTrendData = detail.riskScores.length > 0
    ? detail.riskScores.slice(0, 14).reverse().map((rs: any) => ({
        date: new Date(rs.calculated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        score: Number(rs.score),
        source: rs.source,
      }))
    : patient.checkIns
        .filter(c => c.status === 'completed' && c.riskScoreAfter !== undefined)
        .map(c => ({
          date: `Day ${c.day}`,
          score: c.riskScoreAfter!,
          source: `checkin_day_${c.day}`,
        }));

  // Latest symptom log
  const latestSymptom = detail.latestSymptomLog;

  // Adherence
  const adherenceRate = detail.adherenceRate;

  // Latest vitals from Supabase
  const latestVital = detail.latestVital;

  const handleAddToSchedule = async () => {
    if (!scheduleDate || !user?.id) return;
    setScheduling(true);
    try {
      const scheduledAt = `${scheduleDate}T${scheduleTime}:00`;
      const reason = scheduleReason || `Post-discharge follow-up — ${patient.diagnosis}`;

      // Insert into appointments table
      await supabase.from('appointments').insert({
        patient_id: id,
        doctor_id: user.id,
        scheduled_at: scheduledAt,
        duration_minutes: scheduleDuration,
        reason,
        follow_up_type: scheduleType as any,
        created_by: 'doctor' as any,
        notes: scheduleNotes || null,
      });

      // Also add to Zustand store for immediate UI update
      addFollowUp({
        id: `f-new-${Date.now()}`,
        patientId: patient.id,
        patientName: patient.name,
        riskScore: patient.riskScore,
        reason,
        suggestedDate: scheduleDate,
        priority: riskLevel === 'high' ? 'urgent' : riskLevel === 'moderate' ? 'high' : 'medium',
        assignedClinician: 'Dr. Haddad',
        status: 'upcoming',
      });

      // Push notification to patient
      await supabase.from('notifications').insert({
        patient_id: id,
        title: `Follow-up scheduled for ${new Date(scheduledAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at ${scheduleTime}`,
        body: reason,
        type: 'care_team_message' as any,
      });

      toast.success('Added to schedule ✓');
      setShowScheduleModal(false);
      setScheduleReason('');
      setScheduleNotes('');
    } catch {
      toast.error('Failed to schedule — please try again');
    } finally {
      setScheduling(false);
    }
  };

  const sobLabel = (v: string) => v === 'none' ? 'None' : v === 'mild' ? 'Mild' : v === 'moderate' ? 'Moderate' : 'Severe';
  const feelingLabel = (v: number) => ['', 'Bad', 'Not great', 'Okay', 'Good', 'Great'][v] || '';

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'checkins', label: 'Check-Ins' },
    { key: 'vitals', label: 'Vitals' },
    { key: 'medications', label: 'Medications' },
    { key: 'chat', label: 'Chat History' },
    { key: 'notes', label: 'Notes' },
  ] as const;

  return (
    <div className="min-h-screen bg-lau-bg flex flex-col">
      <LAUHeader />

      <main className="flex-1 max-w-6xl mx-auto px-6 md:px-8 py-6 w-full">
        <Link to="/doctor" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary font-body mb-4">
          <ArrowLeft className="h-4 w-4" strokeWidth={1.75} /> Back to Dashboard
        </Link>

        {/* ═══ B5.1 HEADER BAND ═══ */}
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <div className="md:col-span-2 rounded-2xl border border-lau-border bg-card p-6 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-lau-green-tint flex items-center justify-center text-primary font-heading font-bold text-xl">
                  {patient.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h1 className="font-heading text-2xl md:text-3xl font-bold text-lau-anthracite">{patient.name}</h1>
                  <p className="text-muted-foreground font-body">{patient.age}yo · {patient.gender === 'M' ? 'Male' : 'Female'}</p>
                  <div className="flex gap-2 mt-1 flex-wrap">
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-body font-semibold">{patient.diagnosis}</span>
                    {patient.comorbidities.map(c => (
                      <span key={c} className="text-xs bg-lau-bg text-muted-foreground px-2 py-0.5 rounded-full font-body">{c}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => {
                  setScheduleReason(`Post-discharge follow-up — ${patient.diagnosis}`);
                  setShowScheduleModal(true);
                }} className="rounded-full gap-2">
                  <CalendarPlus className="h-4 w-4" /> Add to Schedule
                </Button>
                {patient.phone && (
                  <a href={`tel:${patient.phone}`}>
                    <Button variant="outline" className="rounded-full gap-2">
                      <Phone className="h-4 w-4" /> Call
                    </Button>
                  </a>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm font-body text-muted-foreground mb-4">
              <span>Discharged {patient.dischargeDate}</span>
              <span className="text-lau-anthracite font-semibold">{daysSinceDischarge} days post-discharge</span>
            </div>
          </div>

          {/* Risk Gauge */}
          <div className="rounded-2xl border border-lau-border bg-card p-6 shadow-sm flex flex-col items-center justify-center">
            <RiskGauge score={patient.riskScore} size={160} />
            <div className="flex items-center gap-2 mt-2">
              <span className={`text-xs font-heading font-bold uppercase tracking-wide ${
                riskLevel === 'high' ? 'text-risk-high' : riskLevel === 'moderate' ? 'text-risk-moderate' : 'text-risk-low'
              }`}>
                {riskCategoryLabel}
              </span>
              <RiskTrendArrow current={patient.riskScore} previous={patient.previousRiskScore} />
              {patient.previousRiskScore !== undefined && (
                <span className="text-xs text-muted-foreground font-body">
                  {patient.riskScore > patient.previousRiskScore ? '+' : ''}{patient.riskScore - patient.previousRiskScore} pts
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ═══ B5.2 CONTACT CARD ═══ */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-lau-border bg-card p-5 shadow-sm mb-6">
          <h3 className="font-heading font-semibold text-lau-anthracite mb-3 flex items-center gap-2">
            <User className="h-4 w-4 text-primary" /> Contact Information
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {patient.phone && (
              <a href={`tel:${patient.phone}`} className="flex items-center gap-2 text-sm font-body text-primary hover:underline">
                <Phone className="h-4 w-4" strokeWidth={1.75} /> {patient.phone}
              </a>
            )}
            {patient.email && (
              <a href={`mailto:${patient.email}`} className="flex items-center gap-2 text-sm font-body text-primary hover:underline">
                <Mail className="h-4 w-4" strokeWidth={1.75} /> {patient.email}
              </a>
            )}
            <div className="flex items-center gap-2 text-sm font-body text-muted-foreground">
              <MapPin className="h-4 w-4" strokeWidth={1.75} />
              {patient.livesAlone ? '⚠️ Lives alone' : 'Lives with family/support'}
            </div>
          </div>
        </motion.div>

        {/* ═══ TABS ═══ */}
        <div className="flex gap-1 mb-4 border-b border-lau-border overflow-x-auto">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-4 py-3 text-sm font-heading font-semibold transition-colors whitespace-nowrap ${
                tab === t.key ? 'text-primary border-b-2 border-primary' : 'text-lau-anthracite/50 hover:text-lau-anthracite'
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'overview' && (
          <div className="space-y-6">
            {/* ═══ B5.3 CLINICAL SECTIONS — 2-col grid ═══ */}
            <div className="grid md:grid-cols-2 gap-6">

              {/* CURRENT VITALS */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-lau-border bg-card p-6 shadow-sm">
                <h3 className="font-heading font-semibold text-lau-anthracite mb-4 flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" /> Current Vitals
                </h3>
                {latestVital ? (
                  <div className="grid grid-cols-2 gap-3">
                    {latestVital.weight_kg && (
                      <VitalItem label="Weight" value={`${latestVital.weight_kg} kg`} icon={<Weight className="h-4 w-4" />}
                        source={latestVital.source} time={latestVital.recorded_at} />
                    )}
                    {latestVital.blood_pressure_systolic && (
                      <VitalItem label="Blood Pressure" value={`${latestVital.blood_pressure_systolic}/${latestVital.blood_pressure_diastolic}`}
                        icon={<Heart className="h-4 w-4" />} source={latestVital.source} time={latestVital.recorded_at} />
                    )}
                    {latestVital.heart_rate_bpm && (
                      <VitalItem label="Heart Rate" value={`${latestVital.heart_rate_bpm} bpm`}
                        icon={<Heart className="h-4 w-4" />} source={latestVital.source} time={latestVital.recorded_at} />
                    )}
                    {latestVital.temperature_c && (
                      <VitalItem label="Temperature" value={`${latestVital.temperature_c}°C`}
                        icon={<Thermometer className="h-4 w-4" />} source={latestVital.source} time={latestVital.recorded_at} />
                    )}
                    {latestVital.oxygen_saturation && (
                      <VitalItem label="O₂ Sat" value={`${latestVital.oxygen_saturation}%`}
                        icon={<Droplets className="h-4 w-4" />} source={latestVital.source} time={latestVital.recorded_at}
                        alert={latestVital.oxygen_saturation < 95} />
                    )}
                    {latestVital.respiratory_rate && (
                      <VitalItem label="Resp. Rate" value={`${latestVital.respiratory_rate}/min`}
                        icon={<Wind className="h-4 w-4" />} source={latestVital.source} time={latestVital.recorded_at} />
                    )}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground font-body">
                    {/* Fallback to mock check-in data */}
                    {latestCompleted?.responses?.weight ? (
                      <div className="grid grid-cols-2 gap-3">
                        <VitalItem label="Weight" value={`${latestCompleted.responses.weight} kg`} icon={<Weight className="h-4 w-4" />} source="check-in" />
                        <VitalItem label="SOB" value={String(latestCompleted.responses.shortnessOfBreath || 'N/A')}
                          icon={<Wind className="h-4 w-4" />} source="check-in" />
                        <VitalItem label="Symptoms" value={String(latestCompleted.responses.symptomsStatus || 'N/A')}
                          icon={<Activity className="h-4 w-4" />} source="check-in" />
                      </div>
                    ) : 'No vitals recorded yet'}
                  </div>
                )}
              </motion.div>

              {/* SYMPTOM SUMMARY */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
                className="rounded-2xl border border-lau-border bg-card p-6 shadow-sm">
                <h3 className="font-heading font-semibold text-lau-anthracite mb-4 flex items-center gap-2">
                  <Thermometer className="h-5 w-5 text-primary" /> Symptom Summary
                </h3>
                {latestSymptom ? (
                  <div className="space-y-3">
                    <p className="text-sm font-body text-lau-anthracite">
                      Reports {sobLabel(latestSymptom.shortness_of_breath)} shortness of breath
                      {latestSymptom.swelling_fatigue_flags?.length > 0 && `, ${latestSymptom.swelling_fatigue_flags.join(', ').toLowerCase()}`}
                      {latestSymptom.felt_worse && ', and feeling worse than before'}.
                      {' '}Pain level {latestSymptom.pain_level}/10.
                      {' '}Overall feeling: {feelingLabel(latestSymptom.overall_feeling)}.
                    </p>
                    <p className="text-xs text-muted-foreground font-body">
                      Logged {new Date(latestSymptom.logged_at).toLocaleString()}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {latestSymptom.felt_worse && <FlagChip label="Feeling worse" variant="high" />}
                      {(latestSymptom.shortness_of_breath === 'moderate' || latestSymptom.shortness_of_breath === 'severe') &&
                        <FlagChip label={`SOB: ${sobLabel(latestSymptom.shortness_of_breath)}`} variant="moderate" />}
                      {latestSymptom.swelling_fatigue_flags?.map((f: string) => <FlagChip key={f} label={f} variant="low" />)}
                    </div>
                  </div>
                ) : latestCompleted ? (
                  <div className="space-y-3">
                    <p className="text-sm font-body text-lau-anthracite">
                      Day {latestCompleted.day} check-in: symptoms {latestCompleted.responses.symptomsStatus || 'N/A'},
                      SOB {latestCompleted.responses.shortnessOfBreath || 'N/A'}.
                    </p>
                    <p className="text-xs text-muted-foreground font-body">
                      From Day {latestCompleted.day} check-in
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground font-body">No symptom data yet</p>
                )}
              </motion.div>

              {/* MEDICATION ADHERENCE */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="rounded-2xl border border-lau-border bg-card p-6 shadow-sm">
                <h3 className="font-heading font-semibold text-lau-anthracite mb-4">Medication Adherence</h3>
                <div className="flex items-center gap-4 mb-4">
                  <span className={`text-4xl font-heading font-bold tabular-nums ${
                    adherenceRate !== null
                      ? adherenceRate >= 90 ? 'text-risk-low' : adherenceRate >= 70 ? 'text-risk-moderate' : 'text-risk-high'
                      : 'text-muted-foreground'
                  }`}>
                    {adherenceRate !== null ? `${adherenceRate}%` : '—'}
                  </span>
                  <span className="text-sm text-muted-foreground font-body">7-day adherence</span>
                </div>
                <div className="space-y-2">
                  {detail.medications.length > 0 ? detail.medications.map((med: any) => {
                    const medLogs = detail.medicationLogs.filter((l: any) => l.medication_id === med.id);
                    const last7 = medLogs.filter((l: any) => new Date(l.scheduled_at) > new Date(Date.now() - 7 * 86400000));
                    return (
                      <div key={med.id} className="flex items-center gap-2">
                        <span className="text-xs font-body text-lau-anthracite w-28 truncate">{med.name}</span>
                        <div className="flex gap-0.5 flex-1">
                          {Array.from({ length: 7 }).map((_, i) => {
                            const dayLogs = last7.filter((l: any) => {
                              const d = new Date(l.scheduled_at);
                              const target = new Date(Date.now() - (6 - i) * 86400000);
                              return d.toDateString() === target.toDateString();
                            });
                            const allTaken = dayLogs.length > 0 && dayLogs.every((l: any) => l.taken);
                            const partial = dayLogs.length > 0 && dayLogs.some((l: any) => l.taken) && !allTaken;
                            const missed = dayLogs.length > 0 && dayLogs.every((l: any) => !l.taken);
                            return (
                              <div key={i} className={`h-3 flex-1 rounded-sm ${
                                allTaken ? 'bg-risk-low' : partial ? 'bg-risk-moderate' : missed ? 'bg-risk-high' : 'bg-lau-border'
                              }`} />
                            );
                          })}
                        </div>
                      </div>
                    );
                  }) : (
                    // Fallback to mock data
                    <div className="text-sm font-body text-muted-foreground">
                      {patient.medications.map(m => (
                        <span key={m} className="text-xs bg-lau-green-tint text-primary px-2 py-0.5 rounded-full font-body mr-1">{m}</span>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>

              {/* RECENT CHECK-IN ANSWERS */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                className="rounded-2xl border border-lau-border bg-card p-6 shadow-sm">
                <h3 className="font-heading font-semibold text-lau-anthracite mb-4">Recent Check-In Answers</h3>
                <div className="space-y-4">
                  {patient.checkIns.filter(c => c.status === 'completed').map(c => (
                    <div key={c.day} className="bg-lau-bg rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-heading font-semibold text-sm text-lau-anthracite">Day {c.day}</span>
                        {c.riskScoreAfter !== undefined && <RiskBadge score={c.riskScoreAfter} size="sm" />}
                      </div>
                      {c.completedAt && <p className="text-[10px] text-muted-foreground font-body mb-2">{new Date(c.completedAt).toLocaleString()}</p>}
                      <div className="space-y-1">
                        {Object.entries(c.responses).filter(([_, v]) => v !== undefined && v !== '' && !(Array.isArray(v) && v.length === 0)).map(([k, v]) => (
                          <div key={k} className="flex justify-between text-xs font-body">
                            <span className="text-muted-foreground capitalize">{k.replace(/([A-Z])/g, ' $1')}</span>
                            <span className="text-lau-anthracite font-semibold">{Array.isArray(v) ? v.join(', ') : String(v)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  {patient.checkIns.filter(c => c.status === 'completed').length === 0 && (
                    <p className="text-sm text-muted-foreground font-body">No completed check-ins yet</p>
                  )}
                </div>
              </motion.div>
            </div>

            {/* TOP RISK FACTORS — full width */}
            {topFactors.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-lau-border bg-card p-6 shadow-sm">
                <h3 className="font-heading font-semibold text-lau-anthracite mb-1">What's driving this risk score</h3>
                <p className="text-xs text-muted-foreground font-body mb-4">Top contributing factors to the readmission risk assessment</p>
                <div className="h-48 mb-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topFactors} layout="vertical" margin={{ left: 10, right: 30 }}>
                      <XAxis type="number" domain={[0, 20]} hide />
                      <YAxis type="category" dataKey="label" width={220} tick={{ fontSize: 12, fontFamily: 'PT Sans' }} />
                      <Bar dataKey="points" radius={[0, 4, 4, 0]} barSize={20}>
                        {topFactors.map((f, i) => <Cell key={i} fill={factorColors(f.points)} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2">
                  {topFactors.map((f, i) => (
                    <div key={i} className="flex items-start gap-3 text-sm font-body">
                      <span className="font-bold text-lau-anthracite whitespace-nowrap tabular-nums">+{f.points} pts</span>
                      <span className="text-muted-foreground">{f.description}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* RISK TREND CHART — full width */}
            {riskTrendData.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-lau-border bg-card p-6 shadow-sm">
                <h3 className="font-heading font-semibold text-lau-anthracite mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" /> Risk Trend
                </h3>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={riskTrendData} margin={{ left: 0, right: 20, top: 10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#D9E3DF" />
                      <XAxis dataKey="date" tick={{ fontSize: 11, fontFamily: 'PT Sans' }} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 11, fontFamily: 'PT Sans' }} />
                      <Tooltip content={({ active, payload, label }) => {
                        if (!active || !payload?.length) return null;
                        const p = payload[0].payload;
                        return (
                          <div className="bg-card border border-lau-border rounded-xl p-3 shadow-md">
                            <p className="font-heading font-semibold text-sm">{label}</p>
                            <p className="text-sm font-body tabular-nums">{p.score}% risk</p>
                            <p className="text-xs text-muted-foreground font-body">{p.source.replace(/_/g, ' ')}</p>
                          </div>
                        );
                      }} />
                      {/* Zone bands */}
                      <ReferenceLine y={40} stroke="#16A34A" strokeDasharray="3 3" strokeOpacity={0.5} />
                      <ReferenceLine y={70} stroke="#DC2626" strokeDasharray="3 3" strokeOpacity={0.5} />
                      <Line type="monotone" dataKey="score" stroke="#006751" strokeWidth={2.5} dot={{ fill: '#006751', r: 4 }}
                        activeDot={{ fill: '#006751', r: 6, stroke: '#E8F4F0', strokeWidth: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex gap-4 mt-2 text-[10px] font-body text-muted-foreground">
                  <span className="flex items-center gap-1"><div className="w-3 h-0.5 bg-risk-low" /> Low (&lt;40)</span>
                  <span className="flex items-center gap-1"><div className="w-3 h-0.5 bg-risk-moderate" /> Intermediate (40-70)</span>
                  <span className="flex items-center gap-1"><div className="w-3 h-0.5 bg-risk-high" /> High (&gt;70)</span>
                </div>
              </motion.div>
            )}
          </div>
        )}

        {tab === 'checkins' && (
          <div className="rounded-2xl border border-lau-border bg-card p-6 shadow-sm space-y-6">
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

        {tab === 'vitals' && (
          <div className="rounded-2xl border border-lau-border bg-card p-6 shadow-sm">
            <h3 className="font-heading font-semibold text-lau-anthracite mb-4">All Vitals</h3>
            {detail.vitals.length > 0 ? (
              <div className="space-y-3">
                {detail.vitals.slice(0, 20).map((v: any) => (
                  <div key={v.id} className="bg-lau-bg rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-muted-foreground font-body">{new Date(v.recorded_at).toLocaleString()}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-lau-green-tint text-primary font-body">{v.source.replace(/_/g, ' ')}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm font-body">
                      {v.weight_kg && <span>Weight: <b>{v.weight_kg} kg</b></span>}
                      {v.blood_pressure_systolic && <span>BP: <b>{v.blood_pressure_systolic}/{v.blood_pressure_diastolic}</b></span>}
                      {v.heart_rate_bpm && <span>HR: <b>{v.heart_rate_bpm} bpm</b></span>}
                      {v.temperature_c && <span>Temp: <b>{v.temperature_c}°C</b></span>}
                      {v.oxygen_saturation && <span>O₂: <b>{v.oxygen_saturation}%</b></span>}
                      {v.pain_scale_0_10 !== null && <span>Pain: <b>{v.pain_scale_0_10}/10</b></span>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground font-body">No vitals recorded yet</p>
            )}
          </div>
        )}

        {tab === 'medications' && (
          <div className="rounded-2xl border border-lau-border bg-card p-6 shadow-sm">
            <h3 className="font-heading font-semibold text-lau-anthracite mb-4">Medications & Adherence</h3>
            <div className="space-y-3">
              {detail.medications.length > 0 ? detail.medications.map((med: any) => (
                <div key={med.id} className="bg-lau-bg rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-body font-semibold text-lau-anthracite">{med.name}</p>
                      <p className="text-xs text-muted-foreground font-body">{med.dosage} · {med.frequency}</p>
                    </div>
                    {med.active && <span className="text-[10px] bg-risk-low-bg text-risk-low px-2 py-0.5 rounded-full">Active</span>}
                  </div>
                </div>
              )) : (
                <div className="flex flex-wrap gap-2">
                  {patient.medications.map(m => (
                    <span key={m} className="text-xs bg-lau-green-tint text-primary px-2.5 py-1 rounded-full font-body">{m}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {tab === 'chat' && (
          <div className="rounded-2xl border border-lau-border bg-card p-6 shadow-sm">
            <h3 className="font-heading font-semibold text-lau-anthracite mb-4">Chat History</h3>
            {detail.chatMessages.length > 0 ? (
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {detail.chatMessages.map((msg: any) => (
                  <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm font-body ${
                      msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-lau-bg text-lau-anthracite'
                    }`}>
                      <p>{msg.content}</p>
                      <p className="text-[10px] opacity-60 mt-1">{new Date(msg.created_at).toLocaleTimeString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground font-body">No chat messages yet</p>
            )}
          </div>
        )}

        {tab === 'notes' && (
          <div className="rounded-2xl border border-lau-border bg-card p-6 shadow-sm">
            <h3 className="font-heading font-semibold text-lau-anthracite mb-4">Doctor Notes</h3>
            <Textarea value={doctorNotes} onChange={e => setDoctorNotes(e.target.value)}
              placeholder="Add private notes about this patient…"
              className="rounded-xl border-lau-border min-h-[200px]" />
            <p className="text-xs text-muted-foreground font-body mt-2">These notes are private and not shared with the patient.</p>
          </div>
        )}
      </main>

      {/* ADD TO SCHEDULE MODAL */}
      <Dialog open={showScheduleModal} onOpenChange={setShowScheduleModal}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl">Add to Schedule</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-body font-semibold text-lau-anthracite mb-1 block">Patient</label>
              <div className="px-4 py-2.5 rounded-xl bg-lau-bg border border-lau-border text-sm font-body text-lau-anthracite">{patient.name}</div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-body font-semibold text-lau-anthracite mb-1 block">Date</label>
                <input type="date" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-lau-border bg-white text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              </div>
              <div>
                <label className="text-sm font-body font-semibold text-lau-anthracite mb-1 block">Time</label>
                <input type="time" value={scheduleTime} onChange={e => setScheduleTime(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-lau-border bg-white text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              </div>
            </div>
            <div>
              <label className="text-sm font-body font-semibold text-lau-anthracite mb-1 block">Duration</label>
              <select value={scheduleDuration} onChange={e => setScheduleDuration(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl border border-lau-border bg-white text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/20">
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={45}>45 minutes</option>
                <option value={60}>60 minutes</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-body font-semibold text-lau-anthracite mb-2 block">Follow-up type</label>
              <div className="flex gap-2">
                {([['in_person', 'In-person'], ['telehealth', 'Telehealth'], ['phone_call', 'Phone']] as const).map(([val, label]) => (
                  <button key={val} onClick={() => setScheduleType(val)}
                    className={`px-4 py-2 rounded-full text-sm font-body font-semibold border transition-all ${
                      scheduleType === val ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-lau-border text-foreground hover:border-primary/40'
                    }`}>{label}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-body font-semibold text-lau-anthracite mb-1 block">Reason</label>
              <input type="text" value={scheduleReason} onChange={e => setScheduleReason(e.target.value)}
                placeholder={`Post-discharge follow-up — ${patient.diagnosis}`}
                className="w-full px-4 py-2.5 rounded-xl border border-lau-border bg-white text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
            </div>
            <div>
              <label className="text-sm font-body font-semibold text-lau-anthracite mb-1 block">Notes (optional)</label>
              <Textarea value={scheduleNotes} onChange={e => setScheduleNotes(e.target.value)}
                placeholder="Any additional notes…" className="rounded-xl border-lau-border" />
            </div>
            <div className="flex gap-2 pt-2">
              <Button onClick={handleAddToSchedule} disabled={!scheduleDate || scheduling} className="flex-1 rounded-full">
                {scheduling ? 'Scheduling…' : 'Confirm'}
              </Button>
              <Button variant="outline" onClick={() => setShowScheduleModal(false)} className="rounded-full">Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}

// ── Helper components ──

function VitalItem({ label, value, icon, source, time, alert: isAlert }: {
  label: string; value: string; icon: React.ReactNode; source?: string; time?: string; alert?: boolean;
}) {
  return (
    <div className={`bg-lau-bg rounded-xl p-3 ${isAlert ? 'ring-1 ring-risk-high/30' : ''}`}>
      <div className="flex items-center gap-1.5 mb-1">
        <span className="text-primary/60">{icon}</span>
        <span className="text-[10px] text-muted-foreground font-body">{label}</span>
      </div>
      <p className={`font-body font-semibold text-sm tabular-nums ${isAlert ? 'text-risk-high' : 'text-lau-anthracite'}`}>{value}</p>
      {source && <p className="text-[9px] text-muted-foreground font-body mt-0.5">{source.replace(/_/g, ' ')}</p>}
      {time && <p className="text-[9px] text-muted-foreground font-body">{timeAgo(time)}</p>}
    </div>
  );
}

function FlagChip({ label, variant }: { label: string; variant: 'high' | 'moderate' | 'low' }) {
  const styles = {
    high: 'bg-risk-high-bg text-risk-high',
    moderate: 'bg-risk-moderate-bg text-risk-moderate',
    low: 'bg-lau-green-tint text-primary',
  };
  return <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${styles[variant]}`}>{label}</span>;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}
