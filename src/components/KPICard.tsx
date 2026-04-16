import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export function KPICard({ label, value, icon, className }: { label: string; value: number; icon: React.ReactNode; className?: string }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const duration = 1200;
    const startTime = performance.now();
    function animate(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));
      if (progress < 1) requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
  }, [value]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        'rounded-2xl border border-lau-border bg-card p-5 shadow-sm',
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground font-body">{label}</p>
          <p className="text-3xl font-bold font-heading text-lau-anthracite tabular-nums mt-1">{display}</p>
        </div>
        <div className="h-12 w-12 rounded-full bg-lau-green-tint flex items-center justify-center text-primary">
          {icon}
        </div>
      </div>
    </motion.div>
  );
}
