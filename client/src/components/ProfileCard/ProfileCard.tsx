import type { DonationSummary, User } from '@/types';
import { getInitials } from '@/utils/format';

interface ProfileCardProps {
  user: User;
  summary: DonationSummary | null;
}

export const ProfileCard = ({ user, summary }: ProfileCardProps) => (
  <section className="flex flex-col items-center gap-2 rounded-3xl bg-white p-8 text-center shadow-sm">
    <span className="flex h-16 w-16 items-center justify-center rounded-full bg-sun text-lg font-semibold">
      {getInitials(user.name)}
    </span>
    <p className="font-semibold">{user.name}</p>
    <p className="text-sm text-neutral-600">{user.email}</p>
    <p className="mt-2 text-sm">
      <strong>{summary?.totalDonations ?? 0}</strong> donaciones · <strong>{summary?.completedDonations ?? 0}</strong>{' '}
      entregadas
    </p>
  </section>
);
