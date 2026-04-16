import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AddToScheduleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId: string;
  patientName: string;
  patientDiagnosis: string;
  doctorId: string;
  onSuccess?: () => void;
}

export function AddToScheduleModal({
  open,
  onOpenChange,
  patientId,
  patientName,
  patientDiagnosis,
  doctorId,
  onSuccess,
}: AddToScheduleModalProps) {
  const [scheduleDate, setScheduleDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [scheduleTime, setScheduleTime] = useState('10:00');
  const [scheduleDuration, setScheduleDuration] = useState(30);
  const [scheduleType, setScheduleType] = useState<'in_person' | 'telehealth' | 'phone_call'>('telehealth');
  const [scheduleReason, setScheduleReason] = useState(`Post-discharge follow-up — ${patientDiagnosis}`);
  const [scheduleNotes, setScheduleNotes] = useState('');
  const [scheduling, setScheduling] = useState(false);

  const handleSubmit = async () => {
    if (!scheduleDate || !doctorId) return;
    setScheduling(true);
    try {
      const scheduledAt = `${scheduleDate}T${scheduleTime}:00`;
      const reason = scheduleReason || `Post-discharge follow-up — ${patientDiagnosis}`;

      await supabase.from('appointments').insert({
        patient_id: patientId,
        doctor_id: doctorId,
        scheduled_at: scheduledAt,
        duration_minutes: scheduleDuration,
        reason,
        follow_up_type: scheduleType as any,
        created_by: 'doctor' as any,
        notes: scheduleNotes || null,
      });

      await supabase.from('notifications').insert({
        patient_id: patientId,
        title: `Dr. scheduled a follow-up for ${new Date(scheduledAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at ${scheduleTime}`,
        body: reason,
        type: 'care_team_message' as any,
      });

      toast.success('Added to schedule ✓');
      onOpenChange(false);
      setScheduleNotes('');
      onSuccess?.();
    } catch {
      toast.error('Failed to schedule — please try again');
    } finally {
      setScheduling(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">Add to Schedule</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <label className="text-sm font-body font-semibold text-lau-anthracite mb-1 block">Patient</label>
            <div className="px-4 py-2.5 rounded-xl bg-lau-bg border border-lau-border text-sm font-body text-lau-anthracite">
              {patientName}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-body font-semibold text-lau-anthracite mb-1 block">Date</label>
              <input
                type="date"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-lau-border bg-white text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div>
              <label className="text-sm font-body font-semibold text-lau-anthracite mb-1 block">Time</label>
              <input
                type="time"
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-lau-border bg-white text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-body font-semibold text-lau-anthracite mb-1 block">Duration</label>
            <select
              value={scheduleDuration}
              onChange={(e) => setScheduleDuration(Number(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl border border-lau-border bg-white text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={45}>45 minutes</option>
              <option value={60}>60 minutes</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-body font-semibold text-lau-anthracite mb-2 block">Follow-up type</label>
            <div className="flex gap-2">
              {(
                [
                  ['in_person', 'In-person'],
                  ['telehealth', 'Telehealth'],
                  ['phone_call', 'Phone'],
                ] as const
              ).map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => setScheduleType(val)}
                  className={`px-4 py-2 rounded-full text-sm font-body font-semibold border transition-all ${
                    scheduleType === val
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-card border-lau-border text-foreground hover:border-primary/40'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-body font-semibold text-lau-anthracite mb-1 block">Reason</label>
            <input
              type="text"
              value={scheduleReason}
              onChange={(e) => setScheduleReason(e.target.value)}
              placeholder={`Post-discharge follow-up — ${patientDiagnosis}`}
              className="w-full px-4 py-2.5 rounded-xl border border-lau-border bg-white text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
          <div>
            <label className="text-sm font-body font-semibold text-lau-anthracite mb-1 block">Notes (optional)</label>
            <Textarea
              value={scheduleNotes}
              onChange={(e) => setScheduleNotes(e.target.value)}
              placeholder="Any additional notes…"
              className="rounded-xl border-lau-border"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <Button onClick={handleSubmit} disabled={!scheduleDate || scheduling} className="flex-1 rounded-full">
              {scheduling ? 'Scheduling…' : 'Confirm'}
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-full">
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
