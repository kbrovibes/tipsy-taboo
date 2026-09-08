"use client";

import { IconDevice, IconMoon, IconSun } from "@/components/icons";
import { useAppearance, type Appearance } from "@/lib/appearance";

const OPTIONS: { v: Appearance; label: string; Icon: typeof IconSun }[] = [
  { v: "light", label: "Light", Icon: IconSun },
  { v: "system", label: "Auto", Icon: IconDevice },
  { v: "dark", label: "Dark", Icon: IconMoon },
];

/**
 * Light / Auto / Dark. Auto is the default and follows the phone, which is
 * what almost everybody wants: the app is dark when their phone is dark.
 */
export default function AppearanceToggle({ compact = false }: { compact?: boolean }) {
  const [pref, setPref] = useAppearance();

  return (
    <div
      className="flex gap-1 rounded-xl bg-well p-1"
      role="radiogroup"
      aria-label="Appearance"
    >
      {OPTIONS.map(({ v, label, Icon }) => {
        const on = pref === v;
        return (
          <button
            key={v}
            role="radio"
            aria-checked={on}
            onClick={() => setPref(v)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition-all ${
              on ? "bg-white text-ink shadow-clay" : "text-ink/55 hover:text-ink"
            }`}
          >
            <Icon size={15} />
            {!compact && label}
          </button>
        );
      })}
    </div>
  );
}
