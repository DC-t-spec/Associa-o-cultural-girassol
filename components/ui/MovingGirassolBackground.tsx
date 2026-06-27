export function MovingGirassolBackground({ subtle = false }: { subtle?: boolean }) {
  const opacity = subtle ? 'opacity-[0.05]' : 'opacity-[0.09]';
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-night">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_5%,rgba(247,181,0,.28),transparent_30%),radial-gradient(circle_at_82%_12%,rgba(249,115,22,.2),transparent_32%),linear-gradient(180deg,rgba(5,5,5,.1),rgba(5,5,5,.95))]" />
      {[0, 1, 2].map((i) => (
        <svg key={i} viewBox="0 0 220 220" className={`girassol-float girassol-float-${i} absolute h-72 w-72 text-sun ${opacity}`}>
          <defs><radialGradient id={`g${i}`}><stop offset="0%" stopColor="#FFD166"/><stop offset="55%" stopColor="#F7B500"/><stop offset="100%" stopColor="#F97316"/></radialGradient></defs>
          <g fill={`url(#g${i})`} transform="translate(110 110)">{Array.from({ length: 18 }).map((_, p) => <ellipse key={p} rx="12" ry="46" transform={`rotate(${p * 20}) translate(0 -58)`} />)}<circle r="42" fill="#F97316"/><circle r="26" fill="#050505" opacity=".75"/><path d="M-55 58 C-18 42 25 48 58 72" fill="none" stroke="#FFD166" strokeWidth="10" strokeLinecap="round" opacity=".7"/></g>
        </svg>
      ))}
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-[radial-gradient(ellipse_at_center,rgba(247,181,0,.13),transparent_58%)] girassol-light" />
    </div>
  );
}
