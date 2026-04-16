import { useEffect, useRef } from 'react';
import { getRiskLevel } from '@/lib/riskEngine';

export function RiskGauge({ score, size = 200 }: { score: number; size?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const level = getRiskLevel(score);
  const color = level === 'high' ? '#DC2626' : level === 'moderate' ? '#F59E0B' : '#16A34A';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const cx = size / 2;
    const cy = size / 2;
    const radius = size / 2 - 16;
    const lineWidth = 12;
    const startAngle = 0.75 * Math.PI;
    const endAngle = 2.25 * Math.PI;

    // Background arc
    ctx.beginPath();
    ctx.arc(cx, cy, radius, startAngle, endAngle);
    ctx.strokeStyle = '#D9E3DF';
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Value arc
    const progress = score / 100;
    const progressAngle = startAngle + progress * (endAngle - startAngle);
    ctx.beginPath();
    ctx.arc(cx, cy, radius, startAngle, progressAngle);
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Score text
    ctx.fillStyle = '#3A3E3F';
    ctx.font = `bold ${size / 4}px Raleway, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${score}%`, cx, cy - 8);

    // Label
    ctx.font = `${size / 12}px PT Sans, sans-serif`;
    ctx.fillStyle = '#6B7280';
    ctx.fillText('Risk Score', cx, cy + size / 6);
  }, [score, size, color]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: size, height: size }}
      className="mx-auto"
    />
  );
}
