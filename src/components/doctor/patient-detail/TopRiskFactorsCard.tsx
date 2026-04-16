import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';
import type { RiskFactor } from '@/types';

interface TopRiskFactorsCardProps {
  factors: RiskFactor[];
}

function factorColors(points: number): string {
  if (points >= 15) return '#DC2626';
  if (points >= 10) return '#F59E0B';
  return '#16A34A';
}

export function TopRiskFactorsCard({ factors }: TopRiskFactorsCardProps) {
  const topFactors = factors.slice(0, 5);
  if (topFactors.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-lau-border bg-card p-6 shadow-sm"
    >
      <h3 className="font-heading font-semibold text-lau-anthracite mb-1">
        What's driving this risk score
      </h3>
      <p className="text-xs text-muted-foreground font-body mb-4">
        Top contributing factors to the readmission risk assessment
      </p>
      <div className="h-48 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={topFactors} layout="vertical" margin={{ left: 10, right: 30 }}>
            <XAxis type="number" domain={[0, 20]} hide />
            <YAxis
              type="category"
              dataKey="label"
              width={220}
              tick={{ fontSize: 12, fontFamily: 'PT Sans' }}
            />
            <Bar dataKey="points" radius={[0, 4, 4, 0]} barSize={20}>
              {topFactors.map((f, i) => (
                <Cell key={i} fill={factorColors(f.points)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="space-y-2">
        {topFactors.map((f, i) => (
          <div key={i} className="flex items-start gap-3 text-sm font-body">
            <span className="font-bold text-lau-anthracite whitespace-nowrap tabular-nums">+{f.points} pts</span>
            <span className="text-muted-foreground">{f.description}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
