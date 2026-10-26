export const Logo = ({ light = false }: { light?: boolean }) => (
  <span className={`inline-flex items-center gap-2 text-sm font-semibold ${light ? 'text-white' : ''}`}>
    <span className={`h-5 w-5 rounded-full ${light ? 'bg-white' : 'bg-ink'}`} />
    FreshTrack
  </span>
);