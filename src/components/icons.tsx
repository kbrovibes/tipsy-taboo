import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement> & { size?: number };

function base({ size = 24, ...rest }: P) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2.2,
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

/** A pass: the card slides away to the left. */
export const IconPass = (p: P) => (
  <svg {...base(p)}>
    <path d="M19.5 12h-14M11 6.5 4.5 12l6.5 5.5" />
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

export const IconSun = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2.6v2.2M12 19.2v2.2M2.6 12h2.2M19.2 12h2.2M5.4 5.4 7 7M17 17l1.6 1.6M5.4 18.6 7 17M17 7l1.6-1.6" />
  </svg>
);

export const IconMoon = (p: P) => (
  <svg {...base(p)}>
    <path d="M20 14.4A8.4 8.4 0 0 1 9.6 4a8.4 8.4 0 1 0 10.4 10.4Z" />
  </svg>
);

export const IconDevice = (p: P) => (
  <svg {...base(p)}>
    <rect x="2.6" y="4.4" width="18.8" height="12.4" rx="2.2" />
    <path d="M8.5 20.6h7" />
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
    <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="3.2" />
    <path d="M5.8 5.8 18.2 18.2" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" />
  </svg>
);

/**
 * The app mark: a speech bubble with the word redacted out of it. Two bars,
 * one of them lime, so the shape still reads at 16px in a browser tab.
 */
export function IconLogo({ size = 64, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className} aria-hidden>
      <defs>
        <linearGradient id="ttg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#7c5cff" />
          <stop offset="1" stopColor="#4c2ee0" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" rx="26" fill="url(#ttg)" />
      <path
        d="M24 34c0-5 4-9 9-9h34c5 0 9 4 9 9v22c0 5-4 9-9 9H49L33 78V65c-5 0-9-4-9-9V34Z"
        fill="#fff"
      />
      <rect x="33" y="35.5" width="34" height="8.5" rx="4.25" fill="#15121f" />
      <rect x="33" y="49" width="21" height="8.5" rx="4.25" fill="#15121f" />
      <rect x="58" y="49" width="9" height="8.5" rx="4.25" fill="#c9f542" />
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
