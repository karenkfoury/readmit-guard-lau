import { supabase } from '@/integrations/supabase/client';
import { getRiskLevel } from './riskEngine';

interface NotificationCooldown {
  patientId: string;
  lastFiredAt: number;
  lastCategory: string;
  lastScore: number;
}

const cooldowns = new Map<string, NotificationCooldown>();
const COOLDOWN_MS = 6 * 60 * 60 * 1000; // 6 hours

type RiskCategory = 'low' | 'moderate' | 'high';

function getCategory(score: number): RiskCategory {
  if (score > 70) return 'high';
  if (score >= 40) return 'moderate';
  return 'low';
}

function categoryRank(cat: RiskCategory): number {
  return cat === 'high' ? 3 : cat === 'moderate' ? 2 : 1;
}

export function shouldFireNotification(
  patientId: string,
  currentScore: number,
  previousScore: number | undefined,
  urgencyFromLog?: 'low' | 'medium' | 'high',
): { fire: boolean; reason: string; tier: RiskCategory } {
  const currentCat = getCategory(currentScore);
  const previousCat = previousScore !== undefined ? getCategory(previousScore) : 'low';
  const cooldown = cooldowns.get(patientId);

  const crossedUp = categoryRank(currentCat) > categoryRank(previousCat);
  const spiked = previousScore !== undefined && (currentScore - previousScore) >= 15;
  const selfReportedHigh = urgencyFromLog === 'high';

  const shouldFire = crossedUp || spiked || selfReportedHigh;

  if (!shouldFire) {
    return { fire: false, reason: '', tier: currentCat };
  }

  if (cooldown && Date.now() - cooldown.lastFiredAt < COOLDOWN_MS) {
    if (currentScore <= cooldown.lastScore && currentCat === cooldown.lastCategory) {
      return { fire: false, reason: 'suppressed — cooldown active', tier: currentCat };
    }
  }

  let reason = '';
  if (crossedUp) reason = `crossed into ${currentCat.toUpperCase()} RISK (${currentScore}%)`;
  else if (spiked) reason = `score increased by ${currentScore - (previousScore ?? 0)} points in 24h`;
  else if (selfReportedHigh) reason = `patient self-reported serious deterioration`;

  return { fire: true, reason, tier: currentCat };
}

export function recordNotificationFired(patientId: string, score: number) {
  cooldowns.set(patientId, {
    patientId,
    lastFiredAt: Date.now(),
    lastCategory: getCategory(score),
    lastScore: score,
  });
}

export interface NotificationRoute {
  primaryRecipient: string;
  primaryMethod: 'toast' | 'in_app';
  secondaryRecipients: string[];
  secondaryMethod: 'in_app' | 'batched';
}

export function routeNotification(
  tier: RiskCategory,
  assignedDoctor?: string,
  assignedNurse?: string,
): NotificationRoute | null {
  if (tier === 'high') {
    return {
      primaryRecipient: assignedDoctor || 'Attending Doctor',
      primaryMethod: 'toast',
      secondaryRecipients: [assignedNurse || 'Care Coordinator'].filter(Boolean),
      secondaryMethod: 'in_app',
    };
  }
  if (tier === 'moderate') {
    return {
      primaryRecipient: assignedNurse || 'Monitoring Team',
      primaryMethod: 'in_app',
      secondaryRecipients: [],
      secondaryMethod: 'batched',
    };
  }
  return null;
}

export async function fireRiskNotification(
  patientId: string,
  patientName: string,
  currentScore: number,
  previousScore: number | undefined,
  urgencyFromLog?: 'low' | 'medium' | 'high',
  assignedDoctor?: string,
  assignedNurse?: string,
) {
  const { fire, reason, tier } = shouldFireNotification(
    patientId,
    currentScore,
    previousScore,
    urgencyFromLog,
  );

  if (!fire) return null;

  const route = routeNotification(tier, assignedDoctor, assignedNurse);
  if (!route) return null;

  recordNotificationFired(patientId, currentScore);

  const title = `${patientName} ${reason}`;
  const body = `Risk score: ${currentScore}%. ${route.primaryRecipient} notified.`;

  await supabase.from('notifications').insert({
    patient_id: patientId,
    title,
    body,
    type: 'risk_alert' as any,
  });

  return { title, body, route, tier };
}
