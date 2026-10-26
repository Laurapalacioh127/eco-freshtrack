export const Thumb = ({ name }: { name: string }) => (
  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sun text-sm font-semibold">
    {name[0]}
  </span>
);