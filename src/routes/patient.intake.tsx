import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, Shield, ClipboardCheck } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { recalculateRiskForPatient } from '@/lib/recalculateRisk';

export const Route = createFileRoute('/patient/intake')({
  component: IntakeWizard,
});

const steps = [
  { title: 'Hospital Data', desc: 'Confirm your imported medical record' },
  { title: 'Lifestyle', desc: 'Help us understand your daily habits' },
  { title: 'Social Support', desc: 'Your home environment and support system' },
  { title: 'Functional Status', desc: 'Your mobility and physical capability' },
  { title: 'Mental Health', desc: 'Your emotional wellbeing' },
  { title: 'Review & Submit', desc: 'Confirm your information' },
];

function IntakeWizard() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [initialScore, setInitialScore] = useState<number | null>(null);
  const [medRecord, setMedRecord] = useState<any>(null);

  // Form data
  const [form, setForm] = useState({
    smoking_status: '',
    alcohol_use: '',
    exercise_frequency: '',
    lives_alone: false,
    has_caregiver: false,
    mobility_level: '',
    recent_falls: false,
    mental_health_concerns: [] as string[],
    additional_notes: '',
    // For confirming hospital data
    dataConfirmed: false,
    dataIssues: '',
  });

  const update = (key: string, value: any) => setForm(prev => ({ ...prev, [key]: value }));

  // Load medical record on mount
  useState(() => {
    if (user) {
      supabase.from('medical_records').select('*').eq('patient_id', user.id).limit(1).single()
        .then(({ data }) => setMedRecord(data));
    }
  });

  const handleSubmit = async () => {
    if (!user) return;
    setSubmitting(true);
    
    const { error } = await supabase.from('ehr_intake_responses').insert({
      patient_id: user.id,
      smoking_status: form.smoking_status,
      alcohol_use: form.alcohol_use,
      exercise_frequency: form.exercise_frequency,
      lives_alone: form.lives_alone,
      has_caregiver: form.has_caregiver,
      mobility_level: form.mobility_level,
      recent_falls: form.recent_falls,
      mental_health_concerns: form.mental_health_concerns,
      additional_notes: form.additional_notes,
    });

    if (!error) {
      const result = await recalculateRiskForPatient(user.id, 'initial_ehr');
      setInitialScore(result.score);
      setSubmitted(true);
    }
    setSubmitting(false);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-lau-bg flex items-center justify-center p-4">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center max-w-sm">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }}
            className="h-20 w-20 rounded-full bg-primary mx-auto flex items-center justify-center mb-6">
            <ClipboardCheck className="h-10 w-10 text-primary-foreground" />
          </motion.div>
          <h1 className="font-heading text-2xl font-bold text-foreground mb-2">Intake Complete!</h1>
          <p className="text-muted-foreground font-body mb-4">Your initial risk assessment is ready.</p>
          {initialScore !== null && (
            <div className="bg-card rounded-xl border border-lau-border p-6 mb-6">
              <p className="text-sm text-muted-foreground font-body mb-2">Your Initial Risk Score</p>
              <p className={`text-4xl font-heading font-bold ${initialScore >= 50 ? 'text-risk-high' : initialScore >= 30 ? 'text-risk-moderate' : 'text-risk-low'}`}>
                {initialScore}%
              </p>
              <p className="text-xs text-muted-foreground font-body mt-2">
                {initialScore >= 50 ? 'Your care team will monitor you closely.' : initialScore >= 30 ? 'We\'ll keep a close eye on your recovery.' : 'Your recovery outlook is positive!'}
              </p>
            </div>
          )}
          <button onClick={() => navigate({ to: '/patient' })} className="bg-primary text-primary-foreground px-6 py-3 rounded-full font-heading font-semibold hover:bg-lau-green-dark transition-colors">
            Go to Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  const progress = ((step + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-lau-bg flex flex-col">
      <div className="bg-card border-b border-lau-border p-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <button onClick={() => step > 0 ? setStep(step - 1) : navigate({ to: '/patient' })} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            <span className="font-heading font-semibold text-sm text-foreground">EHR Intake</span>
          </div>
          <span className="text-xs text-muted-foreground font-body">{step + 1}/{steps.length}</span>
        </div>
        <div className="max-w-lg mx-auto mt-3">
          <div className="h-1.5 bg-lau-border rounded-full overflow-hidden">
            <motion.div className="h-full bg-primary rounded-full" animate={{ width: `${progress}%` }} transition={{ duration: 0.3 }} />
          </div>
          <p className="text-xs text-muted-foreground font-body mt-2 text-center">{steps[step].title} — {steps[step].desc}</p>
        </div>
      </div>

      <div className="flex-1 flex items-start justify-center p-4 pt-8">
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="w-full max-w-lg space-y-4">
            
            {step === 0 && (
              <div className="space-y-4">
                <h2 className="font-heading text-xl font-bold text-foreground">Confirm Hospital Data</h2>
                {medRecord ? (
                  <div className="rounded-xl border border-lau-border bg-card p-5 space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-sm font-body">
                      <div><span className="text-muted-foreground">Diagnosis:</span> <span className="font-semibold text-foreground">{medRecord.primary_diagnosis}</span></div>
                      <div><span className="text-muted-foreground">Discharged:</span> <span className="font-semibold text-foreground">{medRecord.discharge_date}</span></div>
                      <div><span className="text-muted-foreground">Prior Admissions:</span> <span className="font-semibold text-foreground">{medRecord.prior_admissions_12mo}</span></div>
                      <div><span className="text-muted-foreground">Physician:</span> <span className="font-semibold text-foreground">{medRecord.attending_physician}</span></div>
                    </div>
                    {medRecord.comorbidities?.length > 0 && (
                      <div><span className="text-sm text-muted-foreground font-body">Comorbidities: </span>
                        <span className="text-sm font-body font-semibold text-foreground">{medRecord.comorbidities.join(', ')}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="rounded-xl border border-lau-border bg-card p-5 text-center text-muted-foreground font-body">
                    No hospital record found. Your care team will update this.
                  </div>
                )}
                <label className="flex items-center gap-3 p-4 rounded-xl border border-lau-border bg-card cursor-pointer">
                  <input type="checkbox" checked={form.dataConfirmed} onChange={e => update('dataConfirmed', e.target.checked)} className="accent-primary h-5 w-5" />
                  <span className="text-sm font-body text-foreground">I confirm this information is correct</span>
                </label>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4">
                <h2 className="font-heading text-xl font-bold text-foreground">Lifestyle</h2>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-body font-semibold text-foreground mb-1 block">Smoking Status</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['never', 'former', 'current'].map(opt => (
                        <button key={opt} onClick={() => update('smoking_status', opt)}
                          className={`p-3 rounded-xl border-2 text-sm font-body capitalize transition-all ${form.smoking_status === opt ? 'border-primary bg-primary/5 text-primary font-semibold' : 'border-lau-border bg-card text-foreground'}`}>
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-body font-semibold text-foreground mb-1 block">Alcohol Use</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['none', 'occasional', 'regular'].map(opt => (
                        <button key={opt} onClick={() => update('alcohol_use', opt)}
                          className={`p-3 rounded-xl border-2 text-sm font-body capitalize transition-all ${form.alcohol_use === opt ? 'border-primary bg-primary/5 text-primary font-semibold' : 'border-lau-border bg-card text-foreground'}`}>
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-body font-semibold text-foreground mb-1 block">Exercise Frequency</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['sedentary', 'light', 'moderate', 'active'].map(opt => (
                        <button key={opt} onClick={() => update('exercise_frequency', opt)}
                          className={`p-3 rounded-xl border-2 text-sm font-body capitalize transition-all ${form.exercise_frequency === opt ? 'border-primary bg-primary/5 text-primary font-semibold' : 'border-lau-border bg-card text-foreground'}`}>
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <h2 className="font-heading text-xl font-bold text-foreground">Social Support</h2>
                <label className="flex items-center gap-3 p-4 rounded-xl border border-lau-border bg-card cursor-pointer">
                  <input type="checkbox" checked={form.lives_alone} onChange={e => update('lives_alone', e.target.checked)} className="accent-primary h-5 w-5" />
                  <span className="text-sm font-body text-foreground">I live alone</span>
                </label>
                <label className="flex items-center gap-3 p-4 rounded-xl border border-lau-border bg-card cursor-pointer">
                  <input type="checkbox" checked={form.has_caregiver} onChange={e => update('has_caregiver', e.target.checked)} className="accent-primary h-5 w-5" />
                  <span className="text-sm font-body text-foreground">I have a designated caregiver</span>
                </label>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <h2 className="font-heading text-xl font-bold text-foreground">Functional Status</h2>
                <div>
                  <label className="text-sm font-body font-semibold text-foreground mb-1 block">Mobility Level</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['independent', 'needs_assistance', 'limited', 'immobile'].map(opt => (
                      <button key={opt} onClick={() => update('mobility_level', opt)}
                        className={`p-3 rounded-xl border-2 text-sm font-body capitalize transition-all ${form.mobility_level === opt ? 'border-primary bg-primary/5 text-primary font-semibold' : 'border-lau-border bg-card text-foreground'}`}>
                        {opt.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>
                <label className="flex items-center gap-3 p-4 rounded-xl border border-lau-border bg-card cursor-pointer">
                  <input type="checkbox" checked={form.recent_falls} onChange={e => update('recent_falls', e.target.checked)} className="accent-primary h-5 w-5" />
                  <span className="text-sm font-body text-foreground">I have had falls in the past 3 months</span>
                </label>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4">
                <h2 className="font-heading text-xl font-bold text-foreground">Mental Health</h2>
                <p className="text-sm text-muted-foreground font-body">Select any that apply:</p>
                <div className="flex flex-wrap gap-2">
                  {['anxiety', 'depression', 'insomnia', 'stress', 'loneliness', 'grief'].map(opt => {
                    const selected = form.mental_health_concerns.includes(opt);
                    return (
                      <button key={opt} onClick={() => update('mental_health_concerns', selected ? form.mental_health_concerns.filter(x => x !== opt) : [...form.mental_health_concerns, opt])}
                        className={`px-4 py-2 rounded-full border-2 text-sm font-body capitalize transition-all ${selected ? 'border-primary bg-primary text-primary-foreground' : 'border-lau-border bg-card text-foreground'}`}>
                        {opt}
                      </button>
                    );
                  })}
                </div>
                <div>
                  <label className="text-sm font-body font-semibold text-foreground mb-1 block">Additional Notes (optional)</label>
                  <textarea value={form.additional_notes} onChange={e => update('additional_notes', e.target.value)}
                    className="w-full p-3 rounded-xl border border-lau-border bg-card font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none" rows={3} />
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-4">
                <h2 className="font-heading text-xl font-bold text-foreground">Review & Submit</h2>
                <div className="rounded-xl border border-lau-border bg-card p-5 space-y-3 text-sm font-body">
                  <div className="grid grid-cols-2 gap-2">
                    <div><span className="text-muted-foreground">Smoking:</span> <span className="font-semibold text-foreground capitalize">{form.smoking_status || 'Not set'}</span></div>
                    <div><span className="text-muted-foreground">Alcohol:</span> <span className="font-semibold text-foreground capitalize">{form.alcohol_use || 'Not set'}</span></div>
                    <div><span className="text-muted-foreground">Exercise:</span> <span className="font-semibold text-foreground capitalize">{form.exercise_frequency || 'Not set'}</span></div>
                    <div><span className="text-muted-foreground">Lives Alone:</span> <span className="font-semibold text-foreground">{form.lives_alone ? 'Yes' : 'No'}</span></div>
                    <div><span className="text-muted-foreground">Caregiver:</span> <span className="font-semibold text-foreground">{form.has_caregiver ? 'Yes' : 'No'}</span></div>
                    <div><span className="text-muted-foreground">Mobility:</span> <span className="font-semibold text-foreground capitalize">{form.mobility_level?.replace('_', ' ') || 'Not set'}</span></div>
                    <div><span className="text-muted-foreground">Recent Falls:</span> <span className="font-semibold text-foreground">{form.recent_falls ? 'Yes' : 'No'}</span></div>
                  </div>
                  {form.mental_health_concerns.length > 0 && (
                    <div><span className="text-muted-foreground">Mental Health:</span> <span className="font-semibold text-foreground capitalize">{form.mental_health_concerns.join(', ')}</span></div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="p-4 bg-card border-t border-lau-border">
        <div className="max-w-lg mx-auto">
          {step < 5 ? (
            <button onClick={() => setStep(step + 1)}
              className="w-full bg-primary text-primary-foreground py-3 rounded-full font-heading font-semibold text-lg hover:bg-lau-green-dark transition-colors flex items-center justify-center gap-2">
              Next <ArrowRight className="h-5 w-5" />
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={submitting}
              className="w-full bg-primary text-primary-foreground py-3 rounded-full font-heading font-semibold text-lg hover:bg-lau-green-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              {submitting ? 'Submitting...' : 'Submit Intake'} <Check className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
