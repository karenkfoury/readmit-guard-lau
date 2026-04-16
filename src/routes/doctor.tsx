import { createFileRoute, Link } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, AlertTriangle, Clock, CheckCircle, Search, LayoutGrid, List } from 'lucide-react';
import { LAUHeader } from '@/components/LAUHeader';
import { KPICard } from '@/components/KPICard';
import { PatientCard } from '@/components/PatientCard';
import { RiskBadge } from '@/components/RiskBadge';
import { Footer } from '@/components/layout/Footer';
import { useStore } from '@/store/useStore';
import { getRiskLevel } from '@/lib/riskEngine';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

export const Route = createFileRoute('/doctor')({
  component: DoctorDashboard,
});

function DoctorDashboard() {
  const setRole = useStore((s) => s.setRole);
  setRole('doctor');

  const patients = useStore((s) => s.patients);
  const followUps = useStore((s) => s.followUps);
  const [filter, setFilter] = useState<'all' | 'high' | 'moderate' | 'low' | 'followup'>('all');
  const [search, setSearch] = useState('');
  const [view, setView] = useState<'grid' | 'list'>('grid');

  const highRisk = patients.filter(p => p.riskScore > 70);
  const pendingFollowUps = followUps.filter(f => f.status === 'today');
  const checkInsThisWeek = patients.reduce((sum, p) => sum + p.checkIns.filter(c => c.status === 'completed').length, 0);

  const filtered = patients
    .filter(p => {
      if (filter === 'high') return getRiskLevel(p.riskScore) === 'high';
      if (filter === 'moderate') return getRiskLevel(p.riskScore) === 'moderate';
      if (filter === 'low') return getRiskLevel(p.riskScore) === 'low';
      if (filter === 'followup') return p.riskScore > 70;
      return true;
    })
    .filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.diagnosis.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => b.riskScore - a.riskScore);

  const dist = [
    { name: 'High', value: patients.filter(p => getRiskLevel(p.riskScore) === 'high').length, color: '#DC2626' },
    { name: 'Moderate', value: patients.filter(p => getRiskLevel(p.riskScore) === 'moderate').length, color: '#F59E0B' },
    { name: 'Low', value: patients.filter(p => getRiskLevel(p.riskScore) === 'low').length, color: '#16A34A' },
  ];

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault();
        document.getElementById('doc-search')?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <div className="min-h-screen bg-lau-bg flex flex-col">
      <LAUHeader />

      <main className="flex-1 max-w-[1280px] mx-auto px-6 md:px-8 py-6">
        {/* KPI Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <KPICard label="Patients Monitored" value={patients.length} icon={<Users className="h-6 w-6" strokeWidth={1.75} />} />
          <KPICard label="High Risk (>70%)" value={highRisk.length} icon={<AlertTriangle className="h-6 w-6" strokeWidth={1.75} />} />
          <KPICard label="Follow-Ups Today" value={pendingFollowUps.length} icon={<Clock className="h-6 w-6" strokeWidth={1.75} />} />
          <KPICard label="Check-Ins This Week" value={checkInsThisWeek} icon={<CheckCircle className="h-6 w-6" strokeWidth={1.75} />} />
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
              <div className="flex gap-1 flex-wrap">
                {(['all', 'high', 'moderate', 'low', 'followup'] as const).map(f => (
                  <button key={f} onClick={() => setFilter(f)}
                    className={`px-3 py-1.5 rounded-full text-xs font-heading font-semibold transition-all ${filter === f ? 'bg-primary text-primary-foreground' : 'bg-card border border-lau-border text-lau-anthracite hover:bg-lau-green-tint'}`}>
                    {f === 'followup' ? 'Needs Follow-Up' : f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 ml-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-lau-anthracite/50" strokeWidth={1.75} />
                  <input id="doc-search" value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Search patients (/)"
                    className="pl-9 pr-3 py-2 rounded-xl border border-lau-border bg-white text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary w-48 transition" />
                </div>
                <div className="flex border border-lau-border rounded-xl overflow-hidden">
                  <button onClick={() => setView('grid')} className={`p-2 ${view === 'grid' ? 'bg-primary text-primary-foreground' : 'bg-white text-lau-anthracite/50'}`}>
                    <LayoutGrid className="h-4 w-4" strokeWidth={1.75} />
                  </button>
                  <button onClick={() => setView('list')} className={`p-2 ${view === 'list' ? 'bg-primary text-primary-foreground' : 'bg-white text-lau-anthracite/50'}`}>
                    <List className="h-4 w-4" strokeWidth={1.75} />
                  </button>
                </div>
              </div>
            </div>

            <div className={view === 'grid' ? 'grid sm:grid-cols-2 gap-4' : 'space-y-3'}>
              {filtered.map((p, i) => (
                <PatientCard key={p.id} patient={p} index={i} />
              ))}
            </div>
          </div>

          <div className="w-full lg:w-80 space-y-4">
            <div className="rounded-2xl border border-lau-border bg-card p-6 shadow-sm">
              <h3 className="font-heading font-semibold text-lau-anthracite mb-4">Today's Action Queue</h3>
              <div className="space-y-3">
                {followUps.filter(f => f.status === 'today').map(f => (
                  <div key={f.id} className="p-3 rounded-xl bg-lau-bg border border-lau-border">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-heading font-semibold text-lau-anthracite">{f.patientName}</span>
                      <RiskBadge score={f.riskScore} size="sm" />
                    </div>
                    <p className="text-xs text-muted-foreground font-body mb-2">{f.reason}</p>
                    <div className="flex gap-2">
                      <button className="flex-1 text-xs py-1.5 rounded-full bg-primary text-primary-foreground font-semibold hover:bg-lau-green-dark transition-colors">Complete</button>
                      <button className="flex-1 text-xs py-1.5 rounded-full border border-lau-border text-lau-anthracite font-semibold hover:bg-lau-green-tint transition-colors">Reassign</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-lau-border bg-card p-6 shadow-sm">
              <h3 className="font-heading font-semibold text-lau-anthracite mb-4">Risk Distribution</h3>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={dist} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" strokeWidth={2} stroke="#fff">
                      {dist.map((d, i) => <Cell key={i} fill={d.color} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4 mt-2">
                {dist.map(d => (
                  <div key={d.name} className="flex items-center gap-1.5 text-xs font-body">
                    <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                    <span className="text-muted-foreground">{d.name} ({d.value})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      <motion.button
        initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1 }}
        className="fixed bottom-6 right-6 bg-primary text-primary-foreground px-5 py-3 rounded-full shadow-lg hover:bg-lau-green-dark hover:shadow-xl transition-all active:scale-[0.98] font-heading font-semibold flex items-center gap-2 z-50"
        onClick={() => {
          const sarah = document.querySelector('[href="/doctor/patient/p1"]');
          if (sarah) sarah.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }}
      >
        🎬 Start Demo Tour
      </motion.button>
    </div>
  );
}
