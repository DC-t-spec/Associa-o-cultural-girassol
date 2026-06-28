import type { ThemeSettings } from '@/types/cms';

function toNumber(value: unknown, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function DynamicBackground({ settings, subtle = false }: { settings: ThemeSettings; subtle?: boolean }) {
  if (!settings.animated_background_enabled) {
    return <div aria-hidden className="pointer-events-none fixed inset-0 -z-10" style={{ background: settings.background_color }} />;
  }

  const overlay = Math.max(0, Math.min(1, toNumber(settings.overlay_opacity, 0.55)));
  const logoOpacity = Math.max(0.01, Math.min(0.18, toNumber(settings.animated_logo_opacity, 0.08) * (subtle ? 0.55 : 1)));
  const speed = Math.max(18, toNumber(settings.animated_logo_speed, 42));
  const primary = settings.primary_color || '#F7B500';
  const secondary = settings.secondary_color || '#F97316';
  const background = settings.background_color || '#050505';
  const stageLightsEnabled = settings.stage_lights_enabled ?? settings.stage_light_effect_enabled;
  const useGradient = settings.background_type !== 'none';
  const logoUrl = settings.animated_logo_url || settings.background_image_url;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      style={{
        background: useGradient
          ? `radial-gradient(circle at 16% 8%, ${primary}33, transparent 30%), radial-gradient(circle at 86% 12%, ${secondary}22, transparent 34%), linear-gradient(135deg, ${settings.gradient_from || primary}22, ${settings.gradient_to || background})`
          : background,
      }}
    >
      {settings.background_image_url && !settings.animated_logo_enabled && (
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${settings.background_image_url})`, opacity: 1 - overlay }} />
      )}
      {settings.background_video_url && (
        <video className="absolute inset-0 h-full w-full object-cover" src={settings.background_video_url} autoPlay muted loop playsInline style={{ opacity: 1 - overlay }} />
      )}
      {settings.animated_logo_enabled && (
        <>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`girassol-float girassol-float-${i} absolute h-72 w-72 sm:h-96 sm:w-96`}
              style={{ opacity: logoOpacity, animationDuration: `${speed + i * 9}s` }}
            >
              {logoUrl ? (
                <div className="h-full w-full bg-contain bg-center bg-no-repeat" style={{ backgroundImage: `url(${logoUrl})` }} />
              ) : (
                <svg viewBox="0 0 240 240" className="h-full w-full" role="img">
                  <defs>
                    <radialGradient id={`girassol-gradient-${i}`} cx="50%" cy="45%" r="55%">
                      <stop offset="0%" stopColor="#FFE08A" />
                      <stop offset="54%" stopColor={primary} />
                      <stop offset="100%" stopColor={secondary} />
                    </radialGradient>
                  </defs>
                  <g fill={`url(#girassol-gradient-${i})`} transform="translate(120 118)">
                    {Array.from({ length: 20 }).map((_, petal) => (
                      <ellipse key={petal} rx="12" ry="50" transform={`rotate(${petal * 18}) translate(0 -64)`} />
                    ))}
                    <circle r="45" fill={secondary} opacity="0.92" />
                    <path d="M-36 1 C-20 -19 20 -19 36 1 C20 23 -20 23 -36 1Z" fill={background} opacity="0.7" />
                    <circle cx="-15" cy="-3" r="5" fill="#FFE08A" opacity="0.85" />
                    <circle cx="15" cy="-3" r="5" fill="#FFE08A" opacity="0.85" />
                    <path d="M-58 58 C-22 40 20 46 62 72" fill="none" stroke="#FFE08A" strokeWidth="10" strokeLinecap="round" opacity="0.7" />
                  </g>
                </svg>
              )}
            </div>
          ))}
        </>
      )}
      {settings.particles_enabled &&
        Array.from({ length: subtle ? 10 : 18 }).map((_, i) => (
          <span key={i} className="absolute h-1 w-1 rounded-full" style={{ left: `${(i * 37) % 100}%`, top: `${(i * 19) % 100}%`, background: primary, opacity: subtle ? 0.14 : 0.25 }} />
        ))}
      {stageLightsEnabled && (
        <>
          <div className="girassol-light absolute -top-32 left-1/4 h-96 w-96 rounded-full blur-3xl" style={{ background: `${primary}1f` }} />
          <div className="girassol-light absolute -top-24 right-1/4 h-80 w-80 rounded-full blur-3xl" style={{ background: `${secondary}1f`, animationDelay: '-7s' }} />
        </>
      )}
      <div className="absolute inset-0 bg-black" style={{ opacity: overlay }} />
    </div>
  );
}
