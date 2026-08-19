import { useState } from "react";
import { KIND_LABEL } from "../data/content";
import { cx, downloadTrack, fmtClock, toAr } from "../lib/utils";
import { useFav, usePlayer, type Track } from "../state/store";
import { I } from "./chrome";

/* ═══════════ أعمدة المساواة (نبض التشغيل) ═══════════ */

export function Eq({ live, className }: { live: boolean; className?: string }) {
  const delays = [0, 0.15, 0.3, 0.1, 0.22];
  return (
    <span className={cx("eq flex h-4 items-end gap-[2.5px]", live && "live", className)} aria-hidden="true">
      {delays.map((d, i) => (
        <span key={i} style={{ animationDelay: `${d}s`, height: `${[100, 62, 88, 50, 74][i]}%` }} />
      ))}
    </span>
  );
}

/* ═══════════ زر المفضلة مع حركة تأكيد ═══════════ */

export function FavBtn({ id, className }: { id: string; className?: string }) {
  const { has, toggle } = useFav();
  const [burst, setBurst] = useState(0);
  const active = has(id);
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        toggle(id);
        if (!active) setBurst((b) => b + 1);
      }}
      className={cx("btn-press rounded-full border p-2 transition-colors", active ? "border-gold/70 bg-gold/15 text-gold" : "border-line bg-card/80 text-mute hover:text-gold", className)}
      aria-label={active ? "إزالة من المفضلة" : "إضافة إلى المفضلة"}
      aria-pressed={active}
    >
      <span key={burst} className="block" style={burst ? { animation: "popin 0.45s var(--ease-snap)" } : undefined}>
        {I.heart(active)}
      </span>
    </button>
  );
}

/* ═══════════ زر تنزيل بحالات متحركة ═══════════ */

export function DlBtn({ name, className }: { name: string; className?: string }) {
  const [st, setSt] = useState<"idle" | "busy" | "done">("idle");
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        if (st !== "idle") return;
        setSt("busy");
        setTimeout(() => {
          downloadTrack(name);
          setSt("done");
          setTimeout(() => setSt("idle"), 2200);
        }, 750);
      }}
      className={cx(
        "btn-press flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
        st === "done" ? "border-moss bg-moss/20 text-olive" : "border-line bg-card/80 text-mute hover:border-gold/60 hover:text-gold",
        className
      )}
      aria-label={`تحميل ${name}`}
    >
      {st === "idle" && <>{I.dl()} <span>تحميل</span></>}
      {st === "busy" && <><span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" /> <span>جارٍ التجهيز…</span></>}
      {st === "done" && <>{I.check()} <span>تمّ التحميل</span></>}
    </button>
  );
}

/* ═══════════ شريط تشغيل مصغّر داخل البطاقات ═══════════ */

export function MiniBar({ track, tone = 392 }: { track: Omit<Track, "tone"> & { tone?: number }; tone?: number }) {
  const { current, playing, progress, play, toggle } = usePlayer();
  const isCur = current?.id === track.id;
  const pct = isCur ? (progress / track.duration) * 100 : 0;
  const t: Track = { ...track, tone };

  return (
    <div className="flex items-center gap-2.5" onClick={(e) => e.stopPropagation()}>
      <button
        onClick={() => (isCur ? toggle() : play(t))}
        className="btn-press grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gold text-base shadow-md shadow-gold/20 transition-shadow hover:shadow-lg hover:shadow-gold/30"
        aria-label={isCur && playing ? "إيقاف مؤقت" : `تشغيل ${track.title}`}
      >
        {isCur && playing ? I.pause() : I.play("ms-0.5")}
      </button>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2 text-[11px] text-mute">
          {isCur ? <Eq live={playing} /> : <span className="num">{fmtClock(track.duration)}</span>}
          <span className="num">{isCur ? fmtClock(progress) : ""}</span>
        </div>
        <div className="mt-1 h-1 overflow-hidden rounded-full bg-line">
          <div className="h-full rounded-full bg-gold transition-[width] duration-300" style={{ width: `${pct}%` }} />
        </div>
      </div>
    </div>
  );
}

/* ═══════════ المشغّل الثابت أسفل الشاشة ═══════════ */

const SPEEDS: [number, string][] = [[0.75, "٠٫٧٥×"], [1, "١×"], [1.25, "١٫٢٥×"], [1.5, "١٫٥×"], [2, "٢×"]];

export function PlayerBar() {
  const { current, queue, playing, progress, speed, volume, expanded, play, toggle, seek, skip, setSpeed, setVolume, next, close, setExpanded } = usePlayer();
  const [volOpen, setVolOpen] = useState(false);

  if (!current) return null;

  const pct = (progress / current.duration) * 100;
  const qi = queue.findIndex((t) => t.id === current.id);

  return (
    <div className="fixed inset-x-0 bottom-14 z-40 md:bottom-0" style={{ animation: "sheetup 0.4s var(--ease-soft)" }}>
      {/* قائمة التشغيل الموسعة */}
      {expanded && queue.length > 0 && (
        <div className="mx-auto max-w-4xl border-x border-t border-line bg-card/97 px-4 shadow-2xl backdrop-blur-md md:rounded-t-2xl">
          <p className="border-b border-linesoft py-2.5 text-xs font-semibold tracking-widest text-gold">
            قائمة التشغيل <span className="num text-faint">— {toAr(queue.length)} مقاطع، الحالي رقم {toAr(qi + 1)}</span>
          </p>
          <ul className="max-h-52 overflow-y-auto py-2">
            {queue.map((t, i) => (
              <li key={t.id}>
                <button
                  onClick={() => play(t, queue)}
                  className={cx(
                    "btn-press flex w-full items-center gap-3 rounded-lg px-3 py-2 text-right text-sm transition-colors",
                    t.id === current.id ? "bg-gold/12 text-gold" : "text-mute hover:bg-card2 hover:text-ink"
                  )}
                >
                  <span className="num w-6 shrink-0 text-xs text-faint">{toAr(i + 1)}</span>
                  {t.id === current.id ? <Eq live={playing} /> : null}
                  <span className="truncate">{t.title}</span>
                  <span className="num ms-auto shrink-0 text-[11px] text-faint">{fmtClock(t.duration)}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* الشريط الرئيسي */}
      <div className="border-t border-line bg-card/97 shadow-[0_-10px_40px_rgba(0,0,0,0.25)] backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-3 py-2.5 md:gap-4 md:px-8">
          {/* التقدم فوق الشريط */}
          <div className="absolute inset-x-0 top-0 -translate-y-1/2 px-3 md:px-8">
            <div className="mx-auto max-w-7xl">
              <input
                type="range" min={0} max={current.duration} value={progress}
                onChange={(e) => seek(Number(e.target.value))}
                className="seek w-full"
                style={{ ["--fill" as string]: `${pct}%` }}
                aria-label="موضع التشغيل"
              />
            </div>
          </div>

          <Eq live={playing} className="hidden h-6 shrink-0 sm:flex" />

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-ink">{current.title}</p>
            <p className="truncate text-[11px] text-mute">
              {KIND_LABEL[current.kind]} · {current.from}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-1.5 md:gap-2">
            <button onClick={() => skip(-15)} className="btn-press rounded-full p-2 text-mute hover:text-ink" aria-label="رجوع ١٥ ثانية" title="رجوع ١٥ ثانية">
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                <path d="M11 17 5 12l6-5" /><path d="M18 17l-6-5 6-5" />
              </svg>
            </button>

            <button
              onClick={toggle}
              className="btn-press grid h-11 w-11 place-items-center rounded-full bg-gold text-base shadow-lg shadow-gold/25"
              aria-label={playing ? "إيقاف مؤقت" : "تشغيل"}
            >
              {playing ? I.pause() : I.play("ms-0.5")}
            </button>

            <button onClick={next} className="btn-press rounded-full p-2 text-mute hover:text-ink" aria-label="المقطع التالي" title="التالي">
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                <path d="m13 17 6-5-6-5" /><path d="m6 17 6-5-6-5" />
              </svg>
            </button>

            <button onClick={() => skip(30)} className="btn-press hidden rounded-full p-2 text-mute hover:text-ink sm:block" aria-label="تقديم ٣٠ ثانية" title="تقديم ٣٠ ثانية">
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                <path d="m13 17 6-5-6-5" /><path d="m6 17 6-5-6-5" />
              </svg>
            </button>
          </div>

          <div className="num hidden shrink-0 text-[11px] text-mute md:block">
            {fmtClock(progress)} / {fmtClock(current.duration)}
          </div>

          <button
            onClick={() => setSpeed(SPEEDS[(SPEEDS.findIndex(([v]) => v === speed) + 1) % SPEEDS.length][0])}
            className="btn-press num hidden shrink-0 rounded-full border border-line px-2.5 py-1.5 text-xs font-bold text-mute hover:border-gold/60 hover:text-gold sm:block"
            aria-label="سرعة التشغيل"
          >
            {SPEEDS.find(([v]) => v === speed)?.[1]}
          </button>

          {/* الصوت */}
          <div className="relative hidden shrink-0 items-center gap-2 md:flex">
            <button onClick={() => setVolOpen((v) => !v)} className="btn-press rounded-full p-2 text-mute hover:text-ink" aria-label="مستوى الصوت">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M4 9v6h4l5 4V5L8 9H4Z" /><path d="M16.5 8.5a5 5 0 0 1 0 7" />
              </svg>
            </button>
            <input
              type="range" min={0} max={1} step={0.05} value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className={cx("seek w-20 transition-all duration-300", volOpen ? "opacity-100" : "w-16 opacity-60")}
              style={{ ["--fill" as string]: `${volume * 100}%` }}
              aria-label="مستوى الصوت"
            />
          </div>

          <button onClick={() => setExpanded(!expanded)} className={cx("btn-press rounded-full p-2 text-mute hover:text-ink", expanded && "rotate-180")} aria-label="قائمة التشغيل" aria-expanded={expanded}>
            {I.chevron()}
          </button>

          <button onClick={close} className="btn-press rounded-full p-2 text-mute hover:text-ink" aria-label="إغلاق المشغل">
            {I.close()}
          </button>
        </div>
      </div>
    </div>
  );
}


