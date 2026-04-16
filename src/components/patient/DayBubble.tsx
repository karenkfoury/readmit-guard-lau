import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface DayBubbleProps {
  dayNumber: number;
  isCurrentDay: boolean;
  isCompleted: boolean;
}

export function DayBubble({ dayNumber, isCurrentDay, isCompleted }: DayBubbleProps) {
  if (dayNumber === 0) {
    return (
      <div className="flex flex-col items-center">
        <div className="h-14 w-14 rounded-full border-2 border-primary/40 bg-primary/10 text-primary flex flex-col items-center justify-center">
          <span className="text-[8px] font-body font-semibold uppercase leading-none">Disc.</span>
          <span className="text-xs font-heading font-bold leading-none">Day</span>
        </div>
      </div>
    );
  }

  if (isCurrentDay) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative flex flex-col items-center"
        aria-current="true"
      >
        <div className="h-[88px] w-[88px] rounded-full bg-primary text-primary-foreground flex flex-col items-center justify-center shadow-lg ring-4 ring-primary/20"
          style={{ boxShadow: '0 0 24px rgba(0, 103, 81, 0.3)' }}>
          <span className="text-xs font-body font-semibold uppercase tracking-wide leading-none">Day</span>
          <span className="text-3xl font-heading font-bold leading-none">{dayNumber}</span>
        </div>
        <span className="mt-1.5 text-[10px] font-body font-semibold text-primary uppercase tracking-wider">Today</span>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <div className={`h-14 w-14 rounded-full border-2 flex flex-col items-center justify-center ${
        isCompleted
          ? 'border-primary/40 bg-primary/10 text-primary'
          : 'border-lau-border bg-lau-bg text-muted-foreground'
      }`}>
        {isCompleted ? (
          <>
            <span className="text-[7px] font-body font-semibold uppercase leading-none">Day</span>
            <span className="text-sm font-heading font-bold leading-none">{dayNumber}</span>
            <Check className="h-3 w-3 absolute -bottom-0.5 -right-0.5 bg-primary text-white rounded-full p-0.5" />
          </>
        ) : (
          <>
            <span className="text-[7px] font-body font-semibold uppercase leading-none">Day</span>
            <span className="text-sm font-heading font-bold leading-none">{dayNumber}</span>
          </>
        )}
      </div>
    </div>
  );
}
