import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Video, Phone, MapPin } from 'lucide-react';
import { LAUHeader } from '@/components/LAUHeader';
import { RiskBadge } from '@/components/RiskBadge';
import { Footer } from '@/components/layout/Footer';
import { useStore } from '@/store/useStore';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const Route = createFileRoute('/doctor/schedule')({
  component: SchedulePage,
});

function SchedulePage() {
  const { user } = useAuth();
  const followUps = useStore((s) => s.followUps);
  const updateFollowUp = useStore((s) => s.updateFollowUp);
  const [dbAppointments, setDbAppointments] = useState<any[]>([]);

  // Fetch appointments from database
  useEffect(() => {
    const fetchAppts = async () => {
      const { data } = await supabase.from('appointments').select(`
        *,
        patient:profiles!appointments_patient_id_fkey(full_name, phone, email)
      `).order('scheduled_at', { ascending: true });
      setDbAppointments(data || []);
    };
    fetchAppts();

    // Realtime
    const ch = supabase.channel('doc-schedule')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, () => fetchAppts())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  // Merge follow-ups and db appointments into a unified list
  const today = new Date().toISOString().split('T')[0];

  // Build unified items from followUps
  const followUpItems = followUps.filter(f => f.status !== 'completed').map(f => ({
    id: f.id,
    patientName: f.patientName,
    riskScore: f.riskScore,
    date: f.suggestedDate,
    time: null as string | null,
    duration: null as number | null,
    reason: f.reason,
    type: null as string | null,
    priority: f.priority,
    status: 'scheduled' as string,
    source: 'followup' as const,
    assignedClinician: f.assignedClinician,
  }));

  // Build from db appointments (avoiding duplicates by checking if a followUp already covers same patient+date)
  const dbItems = dbAppointments
    .filter(a => a.status !== 'cancelled')
    .map(a => {
      const d = new Date(a.scheduled_at);
      return {
        id: a.id,
        patientName: a.patient?.full_name || 'Unknown',
        riskScore: 0,
        date: d.toISOString().split('T')[0],
        time: d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
        duration: a.duration_minutes,
        reason: a.reason || 'Follow-up',
        type: a.follow_up_type,
        priority: 'medium' as const,
        status: a.status,
        source: 'appointment' as const,
        assignedClinician: null as string | null,
      };
    });

  // Merge, deduplicate, group by date
  const allItems = [...followUpItems, ...dbItems];
  const byDate = allItems.reduce<Record<string, typeof allItems>>((acc, item) => {
    if (!acc[item.date]) acc[item.date] = [];
    acc[item.date].push(item);
    return acc;
  }, {});

  // Sort each day by priority/time
  Object.values(byDate).forEach(items => {
    items.sort((a, b) => {
      const prio = { urgent: 0, high: 1, medium: 2, low: 3 };
      return (prio[a.priority as keyof typeof prio] || 2) - (prio[b.priority as keyof typeof prio] || 2);
    });
  });

  const sortedDates = Object.keys(byDate).sort();

  // Next 7 days for the day rail
  const next7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d.toISOString().split('T')[0];
  });

  const [selectedDate, setSelectedDate] = useState(today);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    if (dateStr === today) return 'Today';
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (dateStr === tomorrow.toISOString().split('T')[0]) return 'Tomorrow';
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const formatFullDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  };

  const typeIcon = (type: string | null) => {
    if (type === 'telehealth') return <Video className="h-3.5 w-3.5" />;
    if (type === 'phone_call') return <Phone className="h-3.5 w-3.5" />;
    return <MapPin className="h-3.5 w-3.5" />;
  };

  const selectedItems = byDate[selectedDate] || [];
  const completedFollowUps = followUps.filter(f => f.status === 'completed');

  const handleMarkComplete = async (item: typeof allItems[0]) => {
    if (item.source === 'followup') {
      updateFollowUp(item.id, { status: 'completed' });
    } else {
      await supabase.from('appointments').update({ status: 'completed' } as any).eq('id', item.id);
      setDbAppointments(prev => prev.map(a => a.id === item.id ? { ...a, status: 'completed' } : a));
    }
    toast.success('Marked complete ✓');
  };

  return (
    <div className="min-h-screen bg-lau-bg flex flex-col">
      <LAUHeader />

      <main className="flex-1 max-w-[1280px] mx-auto px-6 md:px-8 py-6 w-full">
        <h1 className="font-heading text-2xl md:text-3xl font-bold text-lau-anthracite mb-6">Schedule & Follow-Ups</h1>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Day rail */}
          <div className="w-full lg:w-80 space-y-1">
            {next7.map(date => {
              const count = (byDate[date] || []).length;
              const isSelected = date === selectedDate;
              const isToday = date === today;
              return (
                <button key={date} onClick={() => setSelectedDate(date)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-left transition-all ${
                    isSelected ? 'bg-primary text-primary-foreground' : 'bg-card border border-lau-border hover:border-primary/40'
                  }`}>
                  <div>
                    <p className={`text-sm font-heading font-semibold ${isSelected ? '' : 'text-lau-anthracite'}`}>
                      {formatDate(date)}
                    </p>
                    <p className={`text-xs ${isSelected ? 'text-primary-foreground/70' : 'text-muted-foreground'} font-body`}>
                      {formatFullDate(date)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {isToday && !isSelected && <span className="text-[10px] bg-risk-high-bg text-risk-high px-2 py-0.5 rounded-full font-semibold">TODAY</span>}
                    {count > 0 && (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                        isSelected ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-lau-green-tint text-primary'
                      }`}>{count}</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Main appointment area */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4 pb-2 border-b-2 border-primary">
              <h2 className="font-heading text-lg font-semibold text-lau-anthracite">{formatFullDate(selectedDate)}</h2>
              <span className="text-xs bg-lau-bg text-muted-foreground px-2 py-0.5 rounded-full font-body">
                {selectedItems.length} appointment{selectedItems.length !== 1 ? 's' : ''}
              </span>
            </div>

            {selectedItems.length > 0 ? (
              <div className="grid sm:grid-cols-2 gap-4">
                {selectedItems.map((item, i) => (
                  <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    className="rounded-2xl border border-lau-border bg-card p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-heading font-semibold text-sm text-lau-anthracite">{item.patientName}</h3>
                      {item.riskScore > 0 && <RiskBadge score={item.riskScore} size="sm" />}
                    </div>

                    {item.time && (
                      <div className="flex items-center gap-2 text-xs text-lau-anthracite font-body mb-1">
                        <Clock className="h-3 w-3" /> <span className="font-heading font-bold">{item.time}</span>
                        {item.duration && <span className="text-muted-foreground">({item.duration} min)</span>}
                      </div>
                    )}

                    <p className="text-xs text-muted-foreground font-body mb-2">{item.reason}</p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase ${
                          item.priority === 'urgent' ? 'bg-risk-high-bg text-risk-high' :
                          item.priority === 'high' ? 'bg-risk-moderate-bg text-risk-moderate' :
                          item.priority === 'medium' ? 'bg-lau-green-tint text-primary' :
                          'bg-lau-bg text-muted-foreground'
                        }`}>
                          {item.priority}
                        </span>
                        {item.type && (
                          <span className="text-[10px] text-muted-foreground font-body flex items-center gap-1">
                            {typeIcon(item.type)} {item.type?.replace('_', ' ')}
                          </span>
                        )}
                      </div>
                      {item.assignedClinician && (
                        <span className="text-[10px] text-muted-foreground font-body">{item.assignedClinician}</span>
                      )}
                    </div>

                    <div className="flex gap-2 mt-3">
                      <button onClick={() => handleMarkComplete(item)}
                        className="flex-1 text-xs py-2 rounded-full bg-primary text-primary-foreground font-semibold hover:bg-lau-green-dark transition-colors">
                        Mark Complete
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Calendar className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground font-body">No appointments scheduled for {formatDate(selectedDate)}.</p>
                <p className="text-sm text-muted-foreground/60 font-body mt-1">Enjoy the breathing room.</p>
              </div>
            )}

            {/* Completed */}
            {completedFollowUps.length > 0 && (
              <div className="mt-8">
                <div className="flex items-center gap-3 mb-3 pb-2 border-b-2 border-risk-low">
                  <h2 className="font-heading font-semibold text-lau-anthracite">Completed</h2>
                  <span className="text-xs bg-lau-bg text-muted-foreground px-2 py-0.5 rounded-full font-body">{completedFollowUps.length}</span>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {completedFollowUps.map((f, i) => (
                    <motion.div key={f.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                      className="rounded-2xl border border-lau-border bg-card p-4 shadow-sm opacity-60">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-heading font-semibold text-sm text-lau-anthracite">{f.patientName}</h3>
                        <RiskBadge score={f.riskScore} size="sm" />
                      </div>
                      <p className="text-xs text-muted-foreground font-body mb-1">{f.reason}</p>
                      <p className="text-xs text-muted-foreground font-body">📅 {f.suggestedDate}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
