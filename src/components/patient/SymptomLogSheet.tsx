import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { supabase } from '@/integrations/supabase/client';
import { recalculateRiskForPatient } from '@/lib/recalculateRisk';
import { toast } from 'sonner';

interface SymptomLogSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId: string | undefined;
}

const emojiScale = [
  { emoji: '😟', label: 'Bad', value: 1 },
  { emoji: '😕', label: 'Not great', value: 2 },
  { emoji: '😐', label: 'Okay', value: 3 },
  { emoji: '🙂', label: 'Good', value: 4 },
  { emoji: '😊', label: 'Great', value: 5 },
] as const;

const sobOptions = ['None', 'Mild', 'Moderate', 'Severe'] as const;
const swellingOptions = ['None', 'Leg swelling', 'Ankle swelling', 'Tired', 'Very fatigued'] as const;

export function SymptomLogSheet({ open, onOpenChange, patientId }: SymptomLogSheetProps) {
  const [feeling, setFeeling] = useState<number | null>(null);
  const [pain, setPain] = useState<number[]>([0]);
  const [sob, setSob] = useState<string>('');
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [worse, setWorse] = useState<boolean | null>(null);
  const [worseDesc, setWorseDesc] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const toggleSymptom = (s: string) => {
    if (s === 'None') {
      setSymptoms([]);
      return;
    }
    setSymptoms(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev.filter(x => x !== 'None'), s]);
  };

  const reset = () => {
    setFeeling(null); setPain([0]); setSob(''); setSymptoms([]); setWorse(null); setWorseDesc(''); setNotes('');
  };

  const handleSubmit = async () => {
    if (!patientId || feeling === null) return;
    setSubmitting(true);
    try {
      const sobMap: Record<string, string> = { 'None': 'none', 'Mild': 'mild', 'Moderate': 'moderate', 'Severe': 'severe' };
      const sobValue = sobMap[sob] || 'none';
      const flags = symptoms.filter(s => s !== 'None');

      // Determine urgency
      let urgency: 'low' | 'medium' | 'high' = 'low';
      if (feeling <= 2 || sob === 'Severe' || worse === true) urgency = 'high';
      else if (feeling <= 3 || sob === 'Moderate' || flags.length > 0) urgency = 'medium';

      const { error } = await supabase.from('symptom_logs').insert({
        patient_id: patientId,
        overall_feeling: feeling,
        pain_level: pain[0],
        shortness_of_breath: sobValue as any,
        swelling_fatigue_flags: flags,
        felt_worse: worse ?? false,
        worse_description: worse ? worseDesc || null : null,
        notes: notes || null,
        urgency: urgency as any,
      });

      if (error) throw error;

      // Recalculate risk
      await recalculateRiskForPatient(patientId, 'manual');

      toast.success('Logged ✓ — your care team has visibility');
      if (urgency === 'high') {
        setTimeout(() => toast('Your care team may reach out shortly', { duration: 4000 }), 1500);
      }

      reset();
      onOpenChange(false);
    } catch (err) {
      toast.error('Failed to log symptoms — please try again');
    } finally {
      setSubmitting(false);
    }
  };

  const dateStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto rounded-t-2xl">
        <SheetHeader>
          <SheetTitle className="font-heading text-xl">How are you doing today?</SheetTitle>
          <p className="text-sm text-muted-foreground font-body">{dateStr}</p>
        </SheetHeader>

        <div className="space-y-6 py-4">
          {/* Emoji feeling scale */}
          <div>
            <p className="text-sm font-body font-semibold text-foreground mb-3">How are you feeling overall?</p>
            <div className="flex justify-between gap-2">
              {emojiScale.map(opt => (
                <button key={opt.value} onClick={() => setFeeling(opt.value)}
                  className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all flex-1 min-w-0 ${
                    feeling === opt.value ? 'border-primary bg-lau-green-tint scale-105' : 'border-lau-border bg-card hover:border-primary/40'
                  }`}>
                  <span className="text-2xl">{opt.emoji}</span>
                  <span className="text-[10px] font-body text-muted-foreground">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Pain slider */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-body font-semibold text-foreground">Any pain or discomfort?</p>
              <span className="text-sm font-heading font-bold text-primary tabular-nums">{pain[0]}/10</span>
            </div>
            <Slider value={pain} onValueChange={setPain} min={0} max={10} step={1} className="py-2" />
            <div className="flex justify-between text-[10px] text-muted-foreground font-body mt-1">
              <span>None</span>
              <span>Severe</span>
            </div>
          </div>

          {/* Shortness of breath */}
          <div>
            <p className="text-sm font-body font-semibold text-foreground mb-2">Any shortness of breath?</p>
            <div className="flex flex-wrap gap-2">
              {sobOptions.map(opt => (
                <button key={opt} onClick={() => setSob(opt)}
                  className={`px-4 py-2.5 rounded-full text-sm font-body font-semibold border transition-all min-h-[44px] ${
                    sob === opt ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-lau-border text-foreground hover:border-primary/40'
                  }`}>{opt}</button>
              ))}
            </div>
          </div>

          {/* Swelling/Fatigue */}
          <div>
            <p className="text-sm font-body font-semibold text-foreground mb-2">Any swelling or fatigue?</p>
            <div className="flex flex-wrap gap-2">
              {swellingOptions.map(opt => (
                <button key={opt} onClick={() => toggleSymptom(opt)}
                  className={`px-4 py-2.5 rounded-full text-sm font-body font-semibold border transition-all min-h-[44px] ${
                    (opt === 'None' && symptoms.length === 0) || symptoms.includes(opt)
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-card border-lau-border text-foreground hover:border-primary/40'
                  }`}>{opt}</button>
              ))}
            </div>
          </div>

          {/* Worse today */}
          <div>
            <p className="text-sm font-body font-semibold text-foreground mb-2">Did anything feel worse today?</p>
            <div className="flex gap-2">
              {[{ val: true, label: 'Yes' }, { val: false, label: 'No' }].map(({ val, label }) => (
                <button key={label} onClick={() => setWorse(val)}
                  className={`px-6 py-2.5 rounded-full text-sm font-body font-semibold border transition-all min-h-[44px] ${
                    worse === val ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-lau-border text-foreground hover:border-primary/40'
                  }`}>{label}</button>
              ))}
            </div>
            {worse === true && (
              <Textarea value={worseDesc} onChange={e => setWorseDesc(e.target.value)}
                placeholder="What changed?"
                className="mt-3 rounded-xl border-lau-border" maxLength={500} />
            )}
          </div>

          {/* Notes */}
          <div>
            <p className="text-sm font-body font-semibold text-foreground mb-2">Anything else you want to share?</p>
            <Textarea value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="Optional notes…" className="rounded-xl border-lau-border" maxLength={500} />
          </div>

          <Button onClick={handleSubmit} disabled={feeling === null || submitting}
            className="w-full rounded-full h-12 text-base">
            {submitting ? 'Saving…' : 'Save log'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
