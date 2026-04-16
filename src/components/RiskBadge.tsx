import { getRiskLevel } from '@/lib/riskEngine';
import { cn } from '@/lib/utils';

export function RiskBadge({ score, size = 'default' }: { score: number; size?: 'sm' | 'default' | 'lg' }) {
  const level = getRiskLevel(score);
  const sizeClasses = { sm: 'text-xs px-2 py-0.5', default: 'text-xs px-3 py-1', lg: 'text-sm px-3.5 py-1' };
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 font-semibold rounded-full',
      sizeClasses[size],
      level === 'high' && 'bg-risk-high-bg text-risk-high',
      level === 'moderate' && 'bg-risk-moderate-bg text-risk-moderate',
      level === 'low' && 'bg-risk-low-bg text-risk-low',
    )}>
      <span className={cn(
        'h-1.5 w-1.5 rounded-full',
        level === 'high' && 'bg-risk-high',
        level === 'moderate' && 'bg-risk-moderate',
        level === 'low' && 'bg-risk-low',
      )} />
      {score}% <span className="capitalize">{level}</span>
    </span>
  );
}

export function RiskTrendArrow({ current, previous }: { current: number; previous?: number }) {
  if (previous === undefined) return <span className="text-muted-foreground text-xs">—</span>;
  const diff = current - previous;
  if (diff > 5) return <span className="text-risk-high text-sm">↑</span>;
  if (diff < -5) return <span className="text-risk-low text-sm">↓</span>;
  return <span className="text-muted-foreground text-sm">→</span>;
}
