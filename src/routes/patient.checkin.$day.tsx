import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, Shield } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { recalculateRiskForPatient } from '@/lib/recalculateRisk';

export const Route = createFileRoute('/patient/checkin/$day')({
  component: CheckInSurvey,
});

interface Question {
  id: string;
  label: string;
  type: 'number' | 'yesno' | 'slider' | 'cards' | 'chips' | 'text';
  options?: string[];
  min?: number;
  max?: number;
}

const surveysByDay: Record<string, Question[]> = {
  '3': [
    { id: 'weight', label: 'What is your current weight (kg)?', type: 'number' },
    { id: 'weightGainReported', label: 'Has your weight increased since discharge?', type: 'cards', options: ['yes', 'no', 'not_sure'] },
    { id: 'shortnessOfBreath', label: 'Are you experiencing shortness of breath?', type: 'cards', options: ['none', 'mild', 'moderate', 'severe'] },
    { id: 'symptomsStatus', label: 'How are your symptoms overall?', type: 'cards', options: ['improving', 'same', 'worsening'] },
    { id: 'additionalSymptoms', label: 'Any of the following?', type: 'chips', options: ['swelling', 'fatigue', 'discomfort', 'chest pain', 'dizziness', 'nausea'] },
  ],
  '7': [
    { id: 'medicationsAsPresribed', label: 'Are you taking all medications as prescribed?', type: 'cards', options: ['yes', 'mostly', 'no'] },
    { id: 'missedDoses', label: 'Have you missed any doses this week?', type: 'cards', options: ['none', '1-2', '3+'] },
    { id: 'sideEffects', label: 'Any side effects?', type: 'chips', options: ['nausea', 'dizziness', 'headaches', 'fatigue', 'constipation', 'other'] },
    { id: 'troubleObtaining', label: 'Trouble obtaining or understanding your medications?', type: 'cards', options: ['yes', 'no'] },
  ],
  '14': [
    { id: 'overallRating', label: 'Rate your overall condition (1-10)', type: 'slider', min: 1, max: 10 },
    { id: 'symptomsImproved', label: 'Have your symptoms improved?', type: 'cards', options: ['yes', 'somewhat', 'no'] },
    { id: 'needsMedicalAttention', label: 'Do you feel you need medical attention?', type: 'cards', options: ['yes', 'no', 'unsure'] },
    { id: 'requestFollowUp', label: 'Want to request a follow-up appointment?', type: 'cards', options: ['yes', 'no'] },
    { id: 'unresolvedConcerns', label: 'Any unresolved concerns? (optional)', type: 'text' },
  ],
};

function CheckInSurvey() {
  const { day } = Route.useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const questions = surveysByDay[day] || surveysByDay['3'];
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const current = questions[step];
  const isLast = step === questions.length - 1;
  const progress = ((step + 1) / questions.length) * 100;

  const setAnswer = (val: any) => setAnswers(prev => ({ ...prev, [current.id]: val }));

  const handleSubmit = async () => {
    if (!user) return;
    setSubmitting(true);
    const dayNum = parseInt(day);
    const source = `checkin_day_${dayNum}` as 'checkin_day_3' | 'checkin_day_7' | 'checkin_day_14';

    // Update check-in status
    const { data: existing } = await supabase.from('check_ins').select('id').eq('patient_id', user.id).eq('day_number', dayNum).single();
    if (existing) {
      await supabase.from('check_ins').update({
        status: 'completed' as const,
        completed_at: new Date().toISOString(),
        responses: answers,
      }).eq('id', existing.id);
    } else {
      await supabase.from('check_ins').insert({
        patient_id: user.id,
        day_number: dayNum,
        status: 'completed' as const,
        completed_at: new Date().toISOString(),
        responses: answers,
      });
    }

    // If weight was entered, log vitals
    if (answers.weight) {
      await supabase.from('vitals').insert({
        patient_id: user.id,
        source: 'patient_self_report' as const,
        weight_kg: answers.weight,
      });
    }

    // Recalculate risk
    await recalculateRiskForPatient(user.id, source);
    setSubmitting(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-lau-bg flex items-center justify-center p-4 -mt-20">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center max-w-sm">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }}
            className="h-20 w-20 rounded-full bg-primary mx-auto flex items-center justify-center mb-6">
            <Check className="h-10 w-10 text-primary-foreground" />
          </motion.div>
          <h1 className="font-heading text-2xl font-bold text-foreground mb-2">Check-In Complete!</h1>
          <p className="text-muted-foreground font-body mb-6">Your care team has received your Day {day} check-in.</p>
          <button onClick={() => navigate({ to: '/patient' })} className="bg-primary text-primary-foreground px-6 py-3 rounded-full font-heading font-semibold hover:bg-lau-green-dark transition-colors">
            Back to Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col -mx-4 -mt-6 min-h-[calc(100vh-8rem)]">
      <div className="bg-card border-b border-lau-border p-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <button onClick={() => step > 0 ? setStep(step - 1) : navigate({ to: '/patient' })} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            <span className="font-heading font-semibold text-sm text-foreground">Day {day} Check-In</span>
          </div>
          <span className="text-xs text-muted-foreground font-body">{step + 1}/{questions.length}</span>
        </div>
        <div className="max-w-lg mx-auto mt-3">
          <div className="h-1.5 bg-lau-border rounded-full overflow-hidden">
            <motion.div className="h-full bg-primary rounded-full" animate={{ width: `${progress}%` }} transition={{ duration: 0.3 }} />
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="w-full max-w-lg">
            <h2 className="font-heading text-xl font-bold text-foreground mb-6 text-center">{current.label}</h2>

            {current.type === 'number' && (
              <input type="number" value={answers[current.id] || ''} onChange={e => setAnswer(Number(e.target.value))}
                className="w-full text-center text-3xl font-heading font-bold py-4 border-2 border-lau-border rounded-xl bg-card focus:outline-none focus:border-primary" placeholder="0" />
            )}
            {current.type === 'cards' && (
              <div className="grid grid-cols-1 gap-3">
                {current.options?.map(opt => (
                  <button key={opt} onClick={() => setAnswer(opt)}
                    className={`p-4 rounded-xl border-2 text-left font-body font-semibold capitalize transition-all ${answers[current.id] === opt ? 'border-primary bg-primary/5 text-primary' : 'border-lau-border bg-card text-foreground hover:border-primary/50'}`}>
                    {opt.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>
            )}
            {current.type === 'chips' && (
              <div className="flex flex-wrap gap-2 justify-center">
                {current.options?.map(opt => {
                  const selected = (answers[current.id] || []).includes(opt);
                  return (
                    <button key={opt} onClick={() => {
                      const prev = answers[current.id] || [];
                      setAnswer(selected ? prev.filter((x: string) => x !== opt) : [...prev, opt]);
                    }}
                      className={`px-4 py-2 rounded-full border-2 font-body text-sm capitalize transition-all ${selected ? 'border-primary bg-primary text-primary-foreground' : 'border-lau-border bg-card text-foreground hover:border-primary/50'}`}>
                      {opt}
                    </button>
                  );
                })}
              </div>
            )}
            {current.type === 'slider' && (
              <div className="space-y-4">
                <input type="range" min={current.min} max={current.max} value={answers[current.id] || 5}
                  onChange={e => setAnswer(Number(e.target.value))} className="w-full accent-primary" />
                <p className="text-center text-3xl font-heading font-bold text-primary">{answers[current.id] || 5}</p>
              </div>
            )}
            {current.type === 'text' && (
              <textarea value={answers[current.id] || ''} onChange={e => setAnswer(e.target.value)}
                className="w-full p-4 border-2 border-lau-border rounded-xl bg-card font-body focus:outline-none focus:border-primary resize-none" rows={4} placeholder="Type here (optional)..." />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="p-4 bg-card border-t border-lau-border">
        <div className="max-w-lg mx-auto">
          <button onClick={() => isLast ? handleSubmit() : setStep(step + 1)} disabled={submitting}
            className="w-full bg-primary text-primary-foreground py-3 rounded-full font-heading font-semibold text-lg hover:bg-lau-green-dark transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
            {submitting ? 'Submitting...' : isLast ? 'Submit Check-In' : 'Next'} {!isLast && !submitting && <ArrowRight className="h-5 w-5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
