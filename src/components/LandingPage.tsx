import { motion } from 'framer-motion';
import {
  Shield,
  Heart,
  DollarSign,
  Hospital,
  ArrowRight,
  Activity,
  Users,
  Stethoscope,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { useStore } from '@/store/useStore';

function AnimatedCounter({
  target,
  suffix = '',
}: {
  target: number;
  suffix?: string;
}) {
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
  return (
    <span className="tabular-nums">
      {count}
      {suffix}
    </span>
  );
}

export function LandingPage() {
  const setRole = useStore((s) => s.setRole);

  const costCards = [
    {
      icon: <Heart className="h-8 w-8" />,
      title: 'For Patients',
      desc: 'Extended hospital stays, higher mortality risk, emotional toll, and disrupted recovery.',
    },
    {
      icon: <DollarSign className="h-8 w-8" />,
      title: 'For Hospitals',
      desc: '$26 billion annually in the US. CMS penalties reduce Medicare payments for high readmission rates.',
    },
    {
      icon: <Hospital className="h-8 w-8" />,
      title: 'For Healthcare',
      desc: 'Overwhelmed ERs, wasted resources, and preventable suffering that erodes public trust.',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-2.5">
            <Shield className="h-7 w-7" />
            <span className="font-heading text-lg font-bold tracking-tight">
              ReAdmit Guard
            </span>
            <span className="text-primary-foreground/70 text-xs font-body ml-1 hidden sm:inline">
              | LAU Health
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="bg-primary-foreground/20 text-primary-foreground text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider">
              Demo Mode
            </span>
            <Link to="/login" className="text-sm font-body hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </header>

      <section className="bg-lau-bg py-20 lg:py-28">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight"
          >
            Stop readmissions
            <br />
            <span className="text-primary">before they start.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 text-lg md:text-xl text-muted-foreground font-body max-w-2xl mx-auto"
          >
            <span className="text-3xl font-bold text-foreground font-heading">
              <AnimatedCounter target={1} /> in <AnimatedCounter target={5} />
            </span>{' '}
            discharged patients return within 30 days — often sicker than
            before. ReAdmit Guard uses explainable AI to catch the warning signs
            early.
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              to="/login"
              onClick={() => setRole('doctor')}
              className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-3 rounded-xl font-heading font-semibold text-lg hover:bg-lau-green-dark transition-colors shadow-lg"
            >
              See the Dashboard <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              to="/login"
              onClick={() => setRole('patient')}
              className="inline-flex items-center justify-center gap-2 border-2 border-primary text-primary px-8 py-3 rounded-xl font-heading font-semibold text-lg hover:bg-primary/5 transition-colors"
            >
              Try as Patient
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="font-heading text-3xl font-bold text-center text-foreground mb-12">
            The Real Cost of Readmissions
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {costCards.map((card, i) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i + 0.5 }}
                className="rounded-xl border border-lau-border bg-card p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                  {card.icon}
                </div>
                <h3 className="font-heading text-xl font-bold text-foreground mb-2">
                  {card.title}
                </h3>
                <p className="text-muted-foreground font-body text-sm leading-relaxed">
                  {card.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-lau-bg py-20">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-lau-border bg-card p-8 md:p-10 shadow-sm"
          >
            <div className="flex items-start gap-4 mb-6">
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                <Activity className="h-7 w-7" />
              </div>
              <div>
                <h3 className="font-heading text-2xl font-bold text-foreground">
                  Meet Sarah
                </h3>
                <p className="text-sm text-muted-foreground font-body">
                  68 years old · Heart Failure · Discharged last week
                </p>
              </div>
            </div>
            <p className="text-muted-foreground font-body leading-relaxed mb-6">
              Sarah did everything right. She took her medications, attended her
              follow-up, and rested at home. But no one noticed the 3 lbs she
              gained in 3 days, the creeping shortness of breath, or that she
              lived alone with no one to check on her. Three weeks later, she
              was back in the ER — sicker than before.
            </p>
            <p className="text-foreground font-body font-semibold mb-6">
              With ReAdmit Guard, her Day 3 check-in would have flagged the
              weight gain, the worsening symptoms, and her social isolation.
              Her doctor would have known in seconds — and one phone call could
              have prevented the readmission.
            </p>
            <Link
              to="/login"
              onClick={() => setRole('doctor')}
              className="inline-flex items-center gap-2 text-primary font-heading font-semibold hover:underline"
            >
              See how we would have caught this{' '}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="font-heading text-3xl font-bold text-center text-foreground mb-12">
            Choose Your View
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <Link to="/login" onClick={() => setRole('patient')}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="rounded-2xl border-2 border-lau-border bg-card p-8 text-center hover:border-primary transition-all cursor-pointer shadow-sm hover:shadow-lg group"
              >
                <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mx-auto mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Users className="h-8 w-8" />
                </div>
                <h3 className="font-heading text-xl font-bold text-foreground mb-2">
                  Continue as Patient
                </h3>
                <p className="text-sm text-muted-foreground font-body">
                  Experience the recovery journey, complete check-ins, and see
                  how your data helps your care team.
                </p>
              </motion.div>
            </Link>
            <Link to="/login" onClick={() => setRole('doctor')}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="rounded-2xl border-2 border-lau-border bg-card p-8 text-center hover:border-primary transition-all cursor-pointer shadow-sm hover:shadow-lg group"
              >
                <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mx-auto mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Stethoscope className="h-8 w-8" />
                </div>
                <h3 className="font-heading text-xl font-bold text-foreground mb-2">
                  Continue as Doctor
                </h3>
                <p className="text-sm text-muted-foreground font-body">
                  View the risk dashboard, explore patient details, and see the
                  AI risk engine in action.
                </p>
              </motion.div>
            </Link>
          </div>
        </div>
      </section>

      <footer className="bg-primary text-primary-foreground py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="font-body text-sm text-primary-foreground/70">
            ReAdmit Guard is a prototype developed as part of a Lebanese
            American University Health initiative.
          </p>
          <p className="text-xs text-primary-foreground/50 mt-2 font-body">
            © 2026 LAU Health — For demonstration purposes only
          </p>
        </div>
      </footer>
    </div>
  );
}
