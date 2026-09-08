import { TEAM_STYLE } from "@/lib/names";
import type { Team } from "@/lib/types";

/**
 * The scores, as a row of team chips. `current` gets the full-colour chip;
 * everyone else sits on their tint so the row reads at arm's length.
 */
export default function Scoreboard({
  teams,
  current,
  large = false,
}: {
  teams: Pick<Team, "name" | "color" | "score">[];
  current?: number;
  large?: boolean;
}) {
  return (
    <ul className={`grid gap-2 ${large ? "grid-cols-1" : teams.length === 3 ? "grid-cols-3" : "grid-cols-2"}`}>
      {teams.map((t, i) => {
        const s = TEAM_STYLE[t.color];
        const on = i === current;
        return (
          <li
            key={i}
            className={`flex items-center justify-between gap-2 rounded-2xl px-3 ${large ? "py-3" : "py-2"}`}
            style={{
              background: on ? s.color : s.tint,
              color: on ? "#fff" : "var(--ink)",
              boxShadow: on ? "var(--lift-sm)" : undefined,
            }}
          >
            <span className={`min-w-0 truncate font-display font-bold ${large ? "text-base" : "text-sm"}`}>{t.name}</span>
            <span className={`font-display font-extrabold tabular-nums ${large ? "text-2xl" : "text-lg"}`}>{t.score}</span>
          </li>
        );
      })}
    </ul>
  );
}
