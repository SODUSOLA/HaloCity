import redis from '../../config/redis.js';

export async function generateReferenceCode() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const dateStr = `${y}${m}${d}`;

  const key = `incidents:seq:${dateStr}`;
  const seq = await redis.incr(key);
  await redis.expire(key, 86400);

  return `INC-${dateStr}-${String(seq).padStart(3, '0')}`;
}

const CRITICAL_KEYWORDS = {
  MEDICAL: ['unconscious', 'cardiac', 'bleeding', 'collapsed', 'seizure', 'breathing'],
  SECURITY: ['weapon', 'shooting', 'stampede', 'abduction', 'fight', 'threat'],
  TRAFFIC: ['blocked', 'gridlock', 'accident', 'stuck'],
  INFRASTRUCTURE: ['power', 'electricity', 'fire', 'explosion', 'collapse'],
};

const HIGH_KEYWORDS = {
  INFRASTRUCTURE: ['gate', 'road', 'barrier'],
};

export function classifySeverity(type, title, description) {
  const text = `${title} ${description || ''}`.toLowerCase();

  const criticalWords = CRITICAL_KEYWORDS[type] || [];
  for (const word of criticalWords) {
    if (text.includes(word)) {
      return 'CRITICAL';
    }
  }

  if (type === 'MEDICAL') return 'HIGH';
  if (type === 'SECURITY') return 'HIGH';

  const highWords = HIGH_KEYWORDS[type] || [];
  for (const word of highWords) {
    if (text.includes(word)) {
      return 'HIGH';
    }
  }

  if (type === 'TRAFFIC') return 'MEDIUM';
  if (type === 'INFRASTRUCTURE') return 'MEDIUM';

  return 'MEDIUM';
}

export const ALLOWED_TRANSITIONS = {
  PENDING: ['ACKNOWLEDGED', 'IN_PROGRESS'],
  ACKNOWLEDGED: ['IN_PROGRESS', 'RESOLVED'],
  IN_PROGRESS: ['RESOLVED'],
  ESCALATED: ['ACKNOWLEDGED', 'IN_PROGRESS'],
  RESOLVED: ['CLOSED'],
  CLOSED: [],
};
