import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement> & { size?: number };

function base({ size = 24, ...rest }: P) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2.4,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    ...rest,
  };
}

export const IconCheck = (p: P) => (
  <svg {...base(p)}>
    <path d="M4.5 12.5 9.5 17.5 19.5 6.8" />
  </svg>
);

export const IconX = (p: P) => (
  <svg {...base(p)}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);

/** a flat "stop" hand — the referee's buzzer */
export const IconHand = (p: P) => (
  <svg {...base(p)}>
    <path d="M7.5 11.5V5.8a1.5 1.5 0 0 1 3 0v5.2" />
    <path d="M10.5 10.5V4.3a1.5 1.5 0 0 1 3 0v6.7" />
    <path d="M13.5 10.6V5.6a1.5 1.5 0 0 1 3 0v7.2" />
    <path d="M16.5 12.4V8.9a1.5 1.5 0 0 1 3 0v5.4c0 4.3-2.8 7.2-6.8 7.2-2.6 0-4.4-1.1-5.7-3L4.2 14.6a1.6 1.6 0 0 1 2.5-2l.8 1.1" />
  </svg>
);

export const IconPause = (p: P) => (
  <svg {...base(p)}>
    <path d="M8.5 5.5v13M15.5 5.5v13" />
  </svg>
);

export const IconPlay = (p: P) => (
  <svg {...base(p)}>
    <path d="M7.5 5.2v13.6l11-6.8-11-6.8Z" fill="currentColor" stroke="none" />
  </svg>
);

export const IconGear = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="3.2" />
    <path d="M12 2.8v2.4M12 18.8v2.4M2.8 12h2.4M18.8 12h2.4M5.5 5.5l1.7 1.7M16.8 16.8l1.7 1.7M5.5 18.5l1.7-1.7M16.8 7.2l1.7-1.7" />
  </svg>
);

export const IconVolume = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 9.5v5h3l4.5 3.6V5.9L7 9.5H4Z" />
    <path d="M15.5 9a4.2 4.2 0 0 1 0 6M18.3 6.5a8 8 0 0 1 0 11" />
  </svg>
);

export const IconVolumeOff = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 9.5v5h3l4.5 3.6V5.9L7 9.5H4Z" />
    <path d="m16 9.5 5 5M21 9.5l-5 5" />
  </svg>
);

export const IconBack = (p: P) => (
  <svg {...base(p)}>
    <path d="M14.5 5.5 8 12l6.5 6.5" />
  </svg>
);

export const IconShare = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 3.5v11M8.2 7.2 12 3.4l3.8 3.8" />
    <path d="M5.5 12.5v6.2a1.8 1.8 0 0 0 1.8 1.8h9.4a1.8 1.8 0 0 0 1.8-1.8v-6.2" />
  </svg>
);

export const IconQr = (p: P) => (
  <svg {...base(p)} strokeWidth={2}>
    <rect x="3.5" y="3.5" width="6.5" height="6.5" rx="1.2" />
    <rect x="14" y="3.5" width="6.5" height="6.5" rx="1.2" />
    <rect x="3.5" y="14" width="6.5" height="6.5" rx="1.2" />
    <path d="M14 14h2.5v2.5H14zM18 14h2.5M14 20.5h2.5M18 18h2.5v2.5" />
  </svg>
);

export const IconTrophy = (p: P) => (
  <svg {...base(p)}>
    <path d="M7 4.5h10v4.3a5 5 0 0 1-10 0V4.5Z" />
    <path d="M7 6.5H4.5a2.5 2.5 0 0 0 2.6 2.5M17 6.5h2.5a2.5 2.5 0 0 1-2.6 2.5" />
    <path d="M12 13.8v3M8.5 19.5h7M10 16.8h4" />
  </svg>
);

export const IconRefresh = (p: P) => (
  <svg {...base(p)}>
    <path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3" />
    <path d="M19.8 3.8v4.4h-4.4" />
  </svg>
);

export const IconEye = (p: P) => (
  <svg {...base(p)}>
    <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
    <circle cx="12" cy="12" r="2.8" />
  </svg>
);

export const IconPhone = (p: P) => (
  <svg {...base(p)}>
    <rect x="6" y="2.5" width="12" height="19" rx="2.6" />
    <path d="M10.6 5.4h2.8M11 18.6h2" />
  </svg>
);

export const IconArrowRight = (p: P) => (
  <svg {...base(p)}>
    <path d="M4.5 12h14M13 6.5l6 5.5-6 5.5" />
  </svg>
);

/** The "no" sign that stands in for the last O of TABOO. */
export const NoSign = ({ size = 24, ...rest }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden {...rest}>
    <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="3.4" />
    <path d="M5.8 5.8 18.2 18.2" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" />
  </svg>
);

/** App glyph: a speech bubble that has been told to stop. */
export function IconLogo({ size = 64, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className} aria-hidden>
      <rect width="100" height="100" rx="24" fill="var(--lime, #d2f56f)" />
      <path
        d="M22 30c0-6.6 5.4-12 12-12h32c6.6 0 12 5.4 12 12v20c0 6.6-5.4 12-12 12H45l-13 11v-11h0c-5.5-.5-10-5.7-10-12V30Z"
        fill="#fff"
        stroke="var(--ink, #2a1b2e)"
        strokeWidth="4.5"
        strokeLinejoin="round"
      />
      <circle cx="38" cy="40" r="4.4" fill="var(--ink, #2a1b2e)" />
      <circle cx="50" cy="40" r="4.4" fill="var(--ink, #2a1b2e)" />
      <circle cx="62" cy="40" r="4.4" fill="var(--ink, #2a1b2e)" />
      <circle cx="70" cy="68" r="15" fill="var(--berry, #b8235a)" stroke="#fff" strokeWidth="4" />
      <path d="M61.5 59.5 78.5 76.5" stroke="#fff" strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
}

/** TIPSY sways a little; the last O of TABOO is a "no" sign. */
export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`font-display font-extrabold tracking-tight ${className}`}>
      <span className="wm-tipsy text-ink">
        {"TIPSY".split("").map((c, i) => (
          <span key={i}>{c}</span>
        ))}
      </span>{" "}
      <span className="text-berry whitespace-nowrap">
        TAB
        <span className="inline-block align-baseline">O</span>
        <span className="wm-no inline-block align-[-0.08em]" style={{ width: "0.86em", height: "0.86em" }}>
          <NoSign size={0 as unknown as number} style={{ width: "100%", height: "100%" }} />
        </span>
      </span>
    </span>
  );
}
