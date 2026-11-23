interface SettingsCardProps {
  title: string;
  description: string;
}

export const SettingsCard = ({ title, description }: SettingsCardProps) => (
  <article className="flex flex-col items-start gap-3 rounded-2xl border border-black/5 bg-white p-5">
    <h2 className="font-semibold">{title}</h2>
    <p className="text-sm text-neutral-600">{description}</p>
  </article>
);
