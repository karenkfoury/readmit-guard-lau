import { motion } from 'framer-motion';
import { Heart, DollarSign, Hospital, ArrowRight, Activity, Users, Stethoscope } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { useStore } from '@/store/useStore';
import { LAULogo, LAUHealthLockup } from '@/components/brand/LAULogo';
import { Footer } from '@/components/layout/Footer';

function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const duration = 2000;
    const start = performance.now();
    function tick(now: number) {
      const p = Math.min((now - start) / duration, 1);
      setCount(Math.round(p * target));
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [target]);
  return <span className="tabular-nums">{count}{suffix}</span>;
}

export function LandingPage() {
  const setRole = useStore((s) => s.setRole);

  const costCards = [
    { icon: <Heart className="h-8 w-8" strokeWidth={1.75} />, title: 'For Patients', desc: 'Extended hospital stays, higher mortality risk, emotional toll, and disrupted recovery.' },
    { icon: <DollarSign className="h-8 w-8" strokeWidth={1.75} />, title: 'For Hospitals', desc: '$26 billion annually in the US. CMS penalties reduce Medicare payments for high readmission rates.' },
    { icon: <Hospital className="h-8 w-8" strokeWidth={1.75} />, title: 'For Healthcare', desc: 'Overwhelmed ERs, wasted resources, and preventable suffering that erodes public trust.' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="bg-white border-b border-lau-border h-[72px] sticky top-0 z-50">
        <div className="max-w-[1280px] mx-auto px-6 h-full flex items-center justify-between">
          <LAUHealthLockup />
          <div className="flex items-center gap-4">
            <span className="bg-lau-green-tint text-primary text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
              Demo
            </span>
            <Link to="/login" className="text-sm font-body text-primary hover:text-lau-green-dark hover:underline transition-colors">
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-white py-24 md:py-32 relative overflow-hidden">
        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-lau-green-tint/40 blur-3xl -mr-48 pointer-events-none" />
        <div className="max-w-5xl mx-auto px-6 text-center relative">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <LAULogo size="lg" layout="stacked" variant="green" className="mx-auto mb-8" />
          </motion.div>

          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-xs font-body font-bold uppercase tracking-[0.08em] text-primary mb-6">
            LAU Health Initiative
          </motion.p>

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-lau-anthracite leading-[1.1] tracking-tight">
            Stop readmissions<br />
            <span className="text-primary">before they start.</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="mt-6 text-lg md:text-xl text-muted-foreground font-body max-w-2xl mx-auto leading-relaxed">
            <span className="text-3xl font-bold text-lau-anthracite font-heading">
              <AnimatedCounter target={1} /> in <AnimatedCounter target={5} />
            </span>{' '}
            discharged patients return within 30 days — often sicker than before. ReAdmit Guard uses explainable AI to catch the warning signs early.
          </motion.p>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/login" onClick={() => setRole('doctor')}
              className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-3 rounded-full font-heading font-semibold text-lg hover:bg-lau-green-dark hover:shadow-md transition-all active:scale-[0.98]">
              See the Dashboard <ArrowRight className="h-5 w-5" strokeWidth={1.75} />
            </Link>
            <Link to="/login" onClick={() => setRole('patient')}
              className="inline-flex items-center justify-center gap-2 border-2 border-primary text-primary px-8 py-3 rounded-full font-heading font-semibold text-lg hover:bg-lau-green-tint transition-all">
              Try as Patient
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Cost Section */}
      <section className="py-16 md:py-20">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-lau-anthracite tracking-tight">
              The Real Cost of Readmissions
            </h2>
            <div className="w-12 h-1 bg-primary rounded-full mx-auto mt-4" />
          </div>
          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {costCards.map((card, i) => (
              <motion.div key={card.title}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i + 0.5 }}
                className="rounded-2xl border border-lau-border bg-card p-6 md:p-8 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                <div className="h-12 w-12 rounded-full bg-lau-green-tint flex items-center justify-center text-primary mb-4">
                  {card.icon}
                </div>
                <h3 className="font-heading text-xl font-bold text-lau-anthracite mb-2">{card.title}</h3>
                <p className="text-muted-foreground font-body text-sm leading-relaxed">{card.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Sarah Story */}
      <section className="bg-lau-bg py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="rounded-2xl border border-lau-border bg-card p-8 md:p-10 shadow-sm">
            <div className="flex items-start gap-4 mb-6">
              <div className="h-12 w-12 rounded-full bg-lau-green-tint flex items-center justify-center text-primary flex-shrink-0">
                <Activity className="h-6 w-6" strokeWidth={1.75} />
              </div>
              <div>
                <h3 className="font-heading text-2xl font-bold text-lau-anthracite">Meet Sarah</h3>
                <p className="text-sm text-muted-foreground font-body">68 years old · Heart Failure · Discharged last week</p>
              </div>
            </div>
            <p className="text-muted-foreground font-body leading-relaxed mb-6">
              Sarah did everything right. She took her medications, attended her follow-up, and rested at home. But no one noticed the 3 lbs she gained in 3 days, the creeping shortness of breath, or that she lived alone with no one to check on her. Three weeks later, she was back in the ER — sicker than before.
            </p>
            <p className="text-lau-anthracite font-body font-semibold mb-6">
              With ReAdmit Guard, her Day 3 check-in would have flagged the weight gain, the worsening symptoms, and her social isolation. Her doctor would have known in seconds — and one phone call could have prevented the readmission.
            </p>
            <Link to="/login" onClick={() => setRole('doctor')}
              className="inline-flex items-center gap-2 text-primary font-heading font-semibold hover:underline">
              See how we would have caught this <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Role selection */}
      <section className="py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-lau-anthracite tracking-tight">Choose Your View</h2>
            <div className="w-12 h-1 bg-primary rounded-full mx-auto mt-4" />
          </div>
          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            <Link to="/login" onClick={() => setRole('patient')}>
              <motion.div whileHover={{ scale: 1.01 }}
                className="rounded-2xl border-2 border-lau-border bg-card p-8 text-center hover:border-primary transition-all cursor-pointer shadow-sm hover:shadow-md group">
                <div className="h-16 w-16 rounded-full bg-lau-green-tint flex items-center justify-center text-primary mx-auto mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Users className="h-8 w-8" strokeWidth={1.75} />
                </div>
                <h3 className="font-heading text-xl font-bold text-lau-anthracite mb-2">Continue as Patient</h3>
                <p className="text-sm text-muted-foreground font-body">Experience the recovery journey, complete check-ins, and see how your data helps your care team.</p>
              </motion.div>
            </Link>
            <Link to="/login" onClick={() => setRole('doctor')}>
              <motion.div whileHover={{ scale: 1.01 }}
                className="rounded-2xl border-2 border-lau-border bg-card p-8 text-center hover:border-primary transition-all cursor-pointer shadow-sm hover:shadow-md group">
                <div className="h-16 w-16 rounded-full bg-lau-green-tint flex items-center justify-center text-primary mx-auto mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Stethoscope className="h-8 w-8" strokeWidth={1.75} />
                </div>
                <h3 className="font-heading text-xl font-bold text-lau-anthracite mb-2">Continue as Doctor</h3>
                <p className="text-sm text-muted-foreground font-body">View the risk dashboard, explore patient details, and see the AI risk engine in action.</p>
              </motion.div>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
