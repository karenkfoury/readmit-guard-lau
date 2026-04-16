import { cn } from '@/lib/utils';
import { Check, Circle } from 'lucide-react';

interface Step {
  day: number;
  status: 'completed' | 'pending' | 'upcoming';
  completedAt?: string;
}

export function ProgressStepper({ steps }: { steps: Step[] }) {
  return (
    <div className="flex items-center justify-between w-full">
      {steps.map((step, i) => (
        <div key={step.day} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center">
            <div className={cn(
              'h-10 w-10 rounded-full flex items-center justify-center border-2 transition-all',
              step.status === 'completed' && 'bg-primary border-primary text-primary-foreground',
              step.status === 'pending' && 'border-primary text-primary bg-primary/10',
              step.status === 'upcoming' && 'border-lau-border text-muted-foreground bg-card',
            )}>
              {step.status === 'completed' ? <Check className="h-5 w-5" /> : <span className="text-sm font-bold font-heading">{step.day}</span>}
            </div>
            <span className="text-xs mt-1.5 font-body text-muted-foreground">
              Day {step.day}
            </span>
            <span className={cn(
              'text-[10px] font-semibold uppercase tracking-wider',
              step.status === 'completed' && 'text-primary',
              step.status === 'pending' && 'text-risk-moderate',
              step.status === 'upcoming' && 'text-muted-foreground',
            )}>
              {step.status === 'completed' ? '✓ Done' : step.status === 'pending' ? '● Pending' : '○ Upcoming'}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={cn(
              'flex-1 h-0.5 mx-3',
              step.status === 'completed' ? 'bg-primary' : 'bg-lau-border',
            )} />
          )}
        </div>
      ))}
    </div>
  );
}
