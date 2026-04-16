import { getRiskLevel } from '@/lib/riskEngine';
import { cn } from '@/lib/utils';

export function RiskBadge({ score, size = 'default' }: { score: number; size?: 'sm' | 'default' | 'lg' }) {
  const level = getRiskLevel(score);
  const sizeClasses = { sm: 'text-xs px-1.5 py-0.5', default: 'text-xs px-2 py-0.5', lg: 'text-sm px-3 py-1' };
  return (
    <span className={cn(
      'inline-flex items-center font-semibold rounded-full',
      sizeClasses[size],
      level === 'high' && 'bg-risk-high/10 text-risk-high',
      level === 'moderate' && 'bg-risk-moderate/10 text-risk-moderate',
      level === 'low' && 'bg-risk-low/10 text-risk-low',
    )}>
      {score}%{' '}
      <span className="ml-1 capitalize">{level}</span>
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
