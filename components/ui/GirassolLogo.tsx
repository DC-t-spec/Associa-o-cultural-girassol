import { cn } from '@/lib/utils';

type GirassolLogoProps = {
  compact?: boolean;
  className?: string;
};

export function GirassolLogo({ compact = false, className }: GirassolLogoProps) {
  return (
    <div className={cn('inline-flex items-center gap-3 rounded-3xl border border-white/10 bg-black/35 p-2 backdrop-blur', className)} aria-label="Associação Cultural Girassol">
      <div className="relative grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-sun/25 to-ember/20 shadow-glow">
        <span className="absolute h-10 w-10 rounded-full border-2 border-sun/80" />
        <span className="absolute h-6 w-6 rounded-full bg-gradient-to-br from-sun to-ember" />
        <span className="absolute -right-1 top-2 h-4 w-7 rotate-45 rounded-full border border-ember/80" />
        <span className="absolute -left-1 bottom-2 h-4 w-7 -rotate-45 rounded-full border border-sun/70" />
      </div>
      {!compact && (
        <div className="leading-tight">
          <p className="text-xs font-bold uppercase tracking-[0.26em] text-sun">Associação Cultural</p>
          <p className="font-display text-xl font-black text-white">Girassol</p>
        </div>
      )}
    </div>
  );
}
