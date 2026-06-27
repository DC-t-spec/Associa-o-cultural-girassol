import { cn } from '@/lib/utils';

type FitiLogoProps = {
  compact?: boolean;
  className?: string;
};

export function FitiLogo({ compact = false, className }: FitiLogoProps) {
  return (
    <div className={cn('relative inline-flex items-center gap-4 overflow-hidden rounded-3xl border border-ember/30 bg-black/50 px-5 py-4 shadow-glow backdrop-blur', className)} aria-label="FITI – Festival Internacional Teatro de Inverno">
      <span className="absolute -left-8 top-0 h-20 w-20 rotate-45 bg-sun/10" />
      <span className="absolute -right-6 bottom-0 h-16 w-16 rotate-12 bg-ember/15" />
      <div className="relative flex h-16 w-16 items-end justify-center gap-1 rounded-2xl border border-white/10 bg-gradient-to-b from-zinc-900 to-black p-2">
        <span className="h-9 w-3 rounded-t-full bg-sun" />
        <span className="h-12 w-3 rounded-t-full bg-ember" />
        <span className="h-7 w-3 rounded-t-full bg-white" />
      </div>
      <div className="relative leading-none">
        <p className="font-display text-5xl font-black tracking-tight text-white">FITI</p>
        {!compact && <p className="mt-1 max-w-52 text-xs font-semibold uppercase tracking-[0.22em] text-sun">Festival Internacional Teatro de Inverno</p>}
      </div>
    </div>
  );
}
