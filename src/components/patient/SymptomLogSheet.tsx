import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { recalculateRiskForPatient } from '@/lib/recalculateRisk';
import { toast } from 'sonner';

interface SymptomLogSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId: string | undefined;
}

const feelingOptions = ['Great', 'Good', 'Okay', 'Not great', 'Bad'] as const;
const sobOptions = ['None', 'Mild', 'Moderate', 'Severe'] as const;
const swellingFatigueOptions = ['Swelling', 'Fatigue', 'Dizziness', 'Nausea'] as const;

export function SymptomLogSheet({ open, onOpenChange, patientId }: SymptomLogSheetProps) {
  const [feeling, setFeeling] = useState<string>('');
  const [pain, setPain] = useState<boolean | null>(null);
  const [sob, setSob] = useState<string>('');
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [worse, setWorse] = useState<boolean | null>(null);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const toggleSymptom = (s: string) => {
    setSymptoms(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };

  const reset = () => {
    setFeeling(''); setPain(null); setSob(''); setSymptoms([]); setWorse(null); setNotes('');
  };

  const handleSubmit = async () => {
    if (!patientId || !feeling) return;
    setSubmitting(true);
    try {
      const painScale = feeling === 'Bad' ? 8 : feeling === 'Not great' ? 6 : feeling === 'Okay' ? 4 : feeling === 'Good' ? 2 : 0;
      const notesPayload = JSON.stringify({ feeling, pain, shortness_of_breath: sob, symptoms, worse_today: worse, free_notes: notes });

      await supabase.from('vitals').insert({
        patient_id: patientId,
        source: 'patient_self_report',
        pain_scale_0_10: painScale,
        notes: notesPayload,
      });

      await recalculateRiskForPatient(patientId, 'manual');
      toast.success('Symptoms logged successfully');
      reset();
      onOpenChange(false);
    } catch {
      toast.error('Failed to log symptoms');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto rounded-t-2xl">
        <SheetHeader>
          <SheetTitle className="font-heading text-xl">Log Symptoms</SheetTitle>
        </SheetHeader>

        <div className="space-y-6 py-4">
          {/* Feeling */}
          <div>
            <p className="text-sm font-body font-semibold text-foreground mb-2">How are you feeling today?</p>
            <div className="flex flex-wrap gap-2">
              {feelingOptions.map(opt => (
                <button key={opt} onClick={() => setFeeling(opt)}
                  className={`px-4 py-2 rounded-full text-sm font-body font-semibold border transition-all ${
                    feeling === opt ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-lau-border text-foreground hover:border-primary/40'
                  }`}>{opt}</button>
              ))}
            </div>
          </div>

          {/* Pain */}
          <div>
            <p className="text-sm font-body font-semibold text-foreground mb-2">Any pain or discomfort?</p>
            <div className="flex gap-2">
              {[true, false].map(val => (
                <button key={String(val)} onClick={() => setPain(val)}
                  className={`px-6 py-2 rounded-full text-sm font-body font-semibold border transition-all ${
                    pain === val ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-lau-border text-foreground hover:border-primary/40'
                  }`}>{val ? 'Yes' : 'No'}</button>
              ))}
            </div>
          </div>

          {/* Shortness of breath */}
          <div>
            <p className="text-sm font-body font-semibold text-foreground mb-2">Any shortness of breath?</p>
            <div className="flex flex-wrap gap-2">
              {sobOptions.map(opt => (
                <button key={opt} onClick={() => setSob(opt)}
                  className={`px-4 py-2 rounded-full text-sm font-body font-semibold border transition-all ${
                    sob === opt ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-lau-border text-foreground hover:border-primary/40'
                  }`}>{opt}</button>
              ))}
            </div>
          </div>

          {/* Swelling/fatigue chips */}
          <div>
            <p className="text-sm font-body font-semibold text-foreground mb-2">Any swelling or fatigue?</p>
            <div className="flex flex-wrap gap-2">
              {swellingFatigueOptions.map(opt => (
                <button key={opt} onClick={() => toggleSymptom(opt)}
                  className={`px-4 py-2 rounded-full text-sm font-body font-semibold border transition-all ${
                    symptoms.includes(opt) ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-lau-border text-foreground hover:border-primary/40'
                  }`}>{opt}</button>
              ))}
            </div>
          </div>

          {/* Worse today */}
          <div>
            <p className="text-sm font-body font-semibold text-foreground mb-2">Did anything feel worse today?</p>
            <div className="flex gap-2">
              {[true, false].map(val => (
                <button key={String(val)} onClick={() => setWorse(val)}
                  className={`px-6 py-2 rounded-full text-sm font-body font-semibold border transition-all ${
                    worse === val ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-lau-border text-foreground hover:border-primary/40'
                  }`}>{val ? 'Yes' : 'No'}</button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <p className="text-sm font-body font-semibold text-foreground mb-2">Optional notes</p>
            <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Anything else you'd like to share..." className="rounded-xl border-lau-border" />
          </div>

          <Button onClick={handleSubmit} disabled={!feeling || submitting} className="w-full rounded-full">
            {submitting ? 'Submitting…' : 'Submit Symptoms'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
