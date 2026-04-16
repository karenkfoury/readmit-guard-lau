import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';

interface TrendDataPoint {
  date: string;
  score: number;
  source: string;
}

interface RiskTrendChartProps {
  data: TrendDataPoint[];
}

export function RiskTrendChart({ data }: RiskTrendChartProps) {
  if (data.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-lau-border bg-card p-6 shadow-sm"
    >
      <h3 className="font-heading font-semibold text-lau-anthracite mb-4 flex items-center gap-2">
        <TrendingUp className="h-5 w-5 text-primary" /> Risk Trend
      </h3>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ left: 0, right: 20, top: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#D9E3DF" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fontFamily: 'PT Sans' }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 11, fontFamily: 'PT Sans' }} />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                const p = payload[0].payload;
                return (
                  <div className="bg-card border border-lau-border rounded-xl p-3 shadow-md">
                    <p className="font-heading font-semibold text-sm">{label}</p>
                    <p className="text-sm font-body tabular-nums">{p.score}% risk</p>
                    <p className="text-xs text-muted-foreground font-body">
                      {p.source.replace(/_/g, ' ')}
                    </p>
                  </div>
                );
              }}
            />
            <ReferenceLine y={40} stroke="#16A34A" strokeDasharray="3 3" strokeOpacity={0.5} />
            <ReferenceLine y={70} stroke="#DC2626" strokeDasharray="3 3" strokeOpacity={0.5} />
            <Line
              type="monotone"
              dataKey="score"
              stroke="#006751"
              strokeWidth={2.5}
              dot={{ fill: '#006751', r: 4 }}
              activeDot={{ fill: '#006751', r: 6, stroke: '#E8F4F0', strokeWidth: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="flex gap-4 mt-2 text-[10px] font-body text-muted-foreground">
        <span className="flex items-center gap-1">
          <div className="w-3 h-0.5 bg-risk-low" /> Low (&lt;40)
        </span>
        <span className="flex items-center gap-1">
          <div className="w-3 h-0.5 bg-risk-moderate" /> Intermediate (40-70)
        </span>
        <span className="flex items-center gap-1">
          <div className="w-3 h-0.5 bg-risk-high" /> High (&gt;70)
        </span>
      </div>
    </motion.div>
  );
}
