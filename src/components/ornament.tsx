import { useId } from "react";
import { cx, useInView } from "../lib/utils";

function useReveal() {
  return useInView<HTMLDivElement>();
}

/* ═══════════════════════════════════════════════════════
   الزخرفة الهندسية — العنصر المميّز (Signature)
   النجمة الثمانية «الخاتم» تُرسم ضلعًا ضلعًا،
   وتمتلئ أسافينها كلما أتمّ الطالب درسًا.
   ═══════════════════════════════════════════════════════ */

const polar = (cx: number, cy: number, r: number, deg: number) => {
  const a = ((deg - 90) * Math.PI) / 180;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as const;
};

export function Khatam({
  size = 200,
  progress = 0,
  draw = false,
  on = true,
  className,
  spin = false,
  tone = "var(--gold)",
}: {
  size?: number;
  progress?: number; // 0..1 — أسافين مكتملة
  draw?: boolean;
  on?: boolean;
  className?: string;
  spin?: boolean;
  tone?: string;
}) {
  const n = 8;
  const wedges = [];
  const lit = Math.round(progress * n);
  for (let k = 0; k < n; k++) {
    const [ax, ay] = polar(50, 50, 46, k * 45);
    const [bx, by] = polar(50, 50, 46, (k + 1) * 45);
    const [mx, my] = polar(50, 50, 22, k * 45 + 22.5);
    wedges.push(
      <path
        key={k}
        d={`M50 50 L${ax.toFixed(1)} ${ay.toFixed(1)} L${mx.toFixed(1)} ${my.toFixed(1)} L${bx.toFixed(1)} ${by.toFixed(1)} Z`}
        fill={k < lit ? tone : "none"}
        fillOpacity={k < lit ? 0.16 + (k / n) * 0.3 : 0}
        stroke="none"
        style={{ transition: "fill-opacity 0.9s var(--ease-soft), fill 0.9s" }}
      />
    );
  }
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={cx(draw && "draw", on && draw && "on", className)}
      style={spin && on ? { animation: "spinSlow 90s linear infinite" } : undefined}
      aria-hidden="true"
    >
      {wedges}
      {/* مربعان متقاطعان = نجمة ثمانية */}
      <path d="M50 4 L96 50 L50 96 L4 50 Z" fill="none" stroke={tone} strokeWidth="1.6" pathLength={1} style={{ ["--i" as string]: 0 }} />
      <path d="M17.5 17.5 H82.5 V82.5 H17.5 Z" fill="none" stroke={tone} strokeWidth="1.6" pathLength={1} style={{ ["--i" as string]: 1 }} />
      {/* أضلاع الربط الداخلية */}
      <path d="M50 4 L17.5 17.5 M96 50 L82.5 17.5 M50 96 L82.5 82.5 M4 50 L17.5 82.5 M50 4 L82.5 17.5 M96 50 L82.5 82.5 M50 96 L17.5 82.5 M4 50 L17.5 17.5" fill="none" stroke={tone} strokeWidth="0.9" strokeOpacity="0.7" pathLength={1} style={{ ["--i" as string]: 2 }} />
      <circle cx="50" cy="50" r="13" fill="none" stroke={tone} strokeWidth="1.4" pathLength={1} style={{ ["--i" as string]: 3 }} />
      <circle cx="50" cy="50" r="4" fill={tone} fillOpacity="0.9" stroke="none" />
    </svg>
  );
}

/* تقدم مصغّر حول النجمة — لحلقات السلاسل */
export function ProgressKhatam({ size = 56, progress, className }: { size?: number; progress: number; className?: string }) {
  const pct = Math.round(progress * 100);
  return (
    <div className={cx("relative grid place-items-center", className)} role="img" aria-label={`الإنجاز ${pct}٪`}>
      <svg width={size} height={size} viewBox="0 0 100 100" className="-rotate-90">
        <circle cx="50" cy="50" r="44" fill="none" stroke="var(--line)" strokeWidth="5" />
        <circle
          cx="50" cy="50" r="44" fill="none" stroke="var(--gold)" strokeWidth="5" strokeLinecap="round"
          strokeDasharray={`${progress * 276.46} 276.46`}
          style={{ transition: "stroke-dasharray 1s var(--ease-soft)" }}
        />
      </svg>
      <Khatam size={size * 0.52} progress={progress} tone="var(--gold)" />
      <span className="absolute -bottom-1 inset-x-0 text-center text-[10px] num text-mute">{pct}٪</span>
    </div>
  );
}

/* فاصل الجره بين الأقسام — يُرسم خطًّا خطًّا عند الظهور */
export function Girih({ className, delay = 0 }: { className?: string; delay?: number }) {
  const { ref, on } = useReveal();
  return (
    <div ref={ref} className={cx("flex items-center justify-center gap-4 py-10", className)} aria-hidden="true">
      <span className="h-px flex-1 max-w-56 bg-gradient-to-l from-transparent via-line to-transparent" />
      <svg width="190" height="26" viewBox="0 0 190 26" className={cx("draw shrink-0", on && "on")}>
        <path d="M2 13 H70" stroke="var(--line)" strokeWidth="1" pathLength={1} style={{ ["--i" as string]: 0 + delay }} />
        <path d="M120 13 H188" stroke="var(--line)" strokeWidth="1" pathLength={1} style={{ ["--i" as string]: 0 + delay }} />
        <path d="M95 2 L106 13 L95 24 L84 13 Z" fill="none" stroke="var(--gold)" strokeWidth="1.3" pathLength={1} style={{ ["--i" as string]: 1 + delay }} />
        <path d="M95 7.5 L100.5 13 L95 18.5 L89.5 13 Z" fill="none" stroke="var(--gold)" strokeWidth="1" pathLength={1} style={{ ["--i" as string]: 2 + delay }} />
        <circle cx="75" cy="13" r="2" fill="var(--gold)" stroke="none" />
        <circle cx="115" cy="13" r="2" fill="var(--gold)" stroke="none" />
      </svg>
      <span className="h-px flex-1 max-w-56 bg-gradient-to-r from-transparent via-line to-transparent" />
    </div>
  );
}

/* خلفية المشربية — شبكة قطرية خفيفة */
export function Mashrabiya({ className, opacity = 0.5 }: { className?: string; opacity?: number }) {
  const id = useId().replace(/[:]/g, "");
  return (
    <svg className={cx("pointer-events-none absolute inset-0 h-full w-full", className)} style={{ opacity }} aria-hidden="true">
      <defs>
        <pattern id={`msh${id}`} width="56" height="56" patternUnits="userSpaceOnUse">
          <path d="M28 0 L56 28 L28 56 L0 28 Z" fill="none" stroke="var(--line)" strokeWidth="0.7" />
          <circle cx="28" cy="28" r="3" fill="none" stroke="var(--gold)" strokeWidth="0.5" strokeOpacity="0.5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#msh${id})`} />
    </svg>
  );
}

/* زوايا الإطار المزخرف للوثائق والبطاقات المميزة */
export function Corners({ tone = "var(--gold)", className }: { tone?: string; className?: string }) {
  const C = ({ rotate }: { rotate: number }) => (
    <svg width="34" height="34" viewBox="0 0 34 34" style={{ transform: `rotate(${rotate}deg)` }} aria-hidden="true">
      <path d="M2 32 V10 Q2 2 10 2 H32" fill="none" stroke={tone} strokeWidth="1.6" />
      <path d="M2 32 V16 Q2 8 10 8" fill="none" stroke={tone} strokeWidth="0.8" strokeOpacity="0.6" />
      <circle cx="7" cy="7" r="1.8" fill={tone} />
    </svg>
  );
  return (
    <div className={cx("pointer-events-none absolute inset-0", className)} aria-hidden="true">
      <span className="absolute right-2 top-2"><C rotate={0} /></span>
      <span className="absolute left-2 top-2"><C rotate={90} /></span>
      <span className="absolute left-2 bottom-2"><C rotate={180} /></span>
      <span className="absolute right-2 bottom-2"><C rotate={270} /></span>
    </div>
  );
}

/* حلية خطية تحت العناوين */
export function Flourish({ className }: { className?: string }) {
  return (
    <svg width="132" height="12" viewBox="0 0 132 12" className={cx("block", className)} aria-hidden="true">
      <path d="M2 6 Q22 0 40 6 T76 6 Q94 12 130 6" fill="none" stroke="var(--gold)" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="66" cy="6" r="2.2" fill="var(--gold)" />
    </svg>
  );
}

/* رأس قسم موحّد: كنية + عنوان كبير + فاصل */
export function SectionHead({
  kicker, title, desc, id, count,
}: { kicker: string; title: string; desc?: string; id?: string; count?: string }) {
  const { ref, on } = useReveal();
  return (
    <div ref={ref} id={id} className="relative scroll-mt-28">
      <div className={cx("rv", on && "on")}>
        <div className="flex items-center gap-3 text-gold">
          <Khatam size={26} progress={1} tone="currentColor" />
          <span className="text-xs font-semibold tracking-[0.25em] text-mute">{kicker}</span>
          {count && <span className="text-xs num text-faint">({count})</span>}
        </div>
        <h2 className="mt-3 font-display text-3xl font-bold leading-snug text-ink md:text-[2.6rem]">{title}</h2>
        <div className="mt-3 flex items-center gap-4">
          <Flourish />
          {desc && <p className="max-w-xl text-sm leading-relaxed text-mute">{desc}</p>}
        </div>
      </div>
    </div>
  );
}

