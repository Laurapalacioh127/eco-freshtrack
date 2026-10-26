type Tone = 'blue' | 'yellow' | 'rose';

const tones: Record<Tone, string> = {
  blue: 'bg-ops-soft',
  yellow: 'bg-sun',
  rose: 'bg-rose-soft',
};

interface StatCardProps {
  label: string;
  value: number | string;
  hint?: string;
  tone: Tone;
}

export const StatCard = ({ label, value, hint, tone }: StatCardProps) => (
  <div className={`rounded-2xl p-5 ${tones[tone]}`}>
    <p className="text-sm">{label}</p>
    <p className="mt-2 text-5xl font-light">{value}</p>
    {hint && <p className="mt-1 text-xs text-neutral-600">{hint}</p>}
  </div>
);