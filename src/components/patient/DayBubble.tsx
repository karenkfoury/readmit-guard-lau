import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface DayBubbleProps {
  dayNumber: number;
  isCurrentDay: boolean;
  isCompleted: boolean;
}

export function DayBubble({ dayNumber, isCurrentDay, isCompleted }: DayBubbleProps) {
  if (isCurrentDay) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative flex flex-col items-center"
      >
        <div className="h-16 w-16 rounded-full bg-primary text-primary-foreground flex flex-col items-center justify-center shadow-md ring-4 ring-primary/20">
          <span className="text-[10px] font-body font-semibold uppercase tracking-wide leading-none">Day</span>
          <span className="text-xl font-heading font-bold leading-none">{dayNumber}</span>
        </div>
        <span className="mt-1.5 text-[10px] font-body font-semibold text-primary uppercase tracking-wider">Today</span>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <div className={`h-10 w-10 rounded-full border-2 flex flex-col items-center justify-center ${
        isCompleted
          ? 'border-primary/40 bg-primary/10 text-primary'
          : 'border-lau-border bg-lau-bg text-muted-foreground'
      }`}>
        {isCompleted ? (
          <Check className="h-4 w-4" />
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
