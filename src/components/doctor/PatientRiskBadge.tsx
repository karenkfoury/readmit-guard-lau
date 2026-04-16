import { getRiskLevel } from '@/lib/riskEngine';
import { cn } from '@/lib/utils';

interface PatientRiskBadgeProps {
  score: number;
  size?: 'sm' | 'default' | 'lg';
  showScore?: boolean;
  pulse?: boolean;
}

export function PatientRiskBadge({ score, size = 'default', showScore = true, pulse = false }: PatientRiskBadgeProps) {
  const level = getRiskLevel(score);
  const label = level === 'high' ? 'HIGH RISK' : level === 'moderate' ? 'INTERMEDIATE' : 'LOW RISK';

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5',
    default: 'text-xs px-3 py-1',
    lg: 'text-sm px-3.5 py-1',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-semibold rounded-full font-heading uppercase tracking-wide',
        sizeClasses[size],
        level === 'high' && 'bg-risk-high-bg text-risk-high',
        level === 'moderate' && 'bg-risk-moderate-bg text-risk-moderate',
        level === 'low' && 'bg-risk-low-bg text-risk-low',
        pulse && 'animate-pulse',
      )}
    >
      <span
        className={cn(
          'h-1.5 w-1.5 rounded-full',
          level === 'high' && 'bg-risk-high',
          level === 'moderate' && 'bg-risk-moderate',
          level === 'low' && 'bg-risk-low',
        )}
      />
      {showScore && <span className="tabular-nums">{score}%</span>}
      {label}
    </span>
  );
}
