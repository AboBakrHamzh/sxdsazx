import { useMemo } from "react";
import { KIND_LABEL, articles, diary, fatawa, khutab, seriesList, type Series } from "../data/content";
import { cx, fmtClock, fmtDur, hijriToday, toAr, useInView, usePointerParallax, usePrefersReducedMotion, useScrollY } from "../lib/utils";
import { featuredSeries, seriesQueue, usePlayer, useUI } from "../state/store";
import { Sheet, I } from "./chrome";
import { SkyCanvas } from "./sky";
import { Corners, Flourish, Girih, Khatam, Mashrabiya, ProgressKhatam, SectionHead } from "./ornament";
import { DlBtn, FavBtn } from "./player";

/* مواضع الذرّات الذهبية السابحة في الافتتاحية */
const DUST = [
  { x: 6, y: 24, s: 4, t: 8.5, dl: 0, dx: 20, o: 0.55 },
  { x: 13, y: 66, s: 3, t: 7, dl: 1.2, dx: -14, o: 0.4 },
  { x: 21, y: 38, s: 5, t: 9.5, dl: 0.6, dx: 16, o: 0.6 },
  { x: 29, y: 80, s: 3, t: 6.5, dl: 2.1, dx: -18, o: 0.45 },
  { x: 37, y: 18, s: 4, t: 8, dl: 1.7, dx: 12, o: 0.5 },
  { x: 45, y: 55, s: 3, t: 7.5, dl: 0.3, dx: -12, o: 0.4 },
  { x: 53, y: 30, s: 5, t: 10, dl: 2.6, dx: 22, o: 0.55 },
  { x: 61, y: 72, s: 3, t: 6.8, dl: 1.4, dx: -16, o: 0.45 },
  { x: 68, y: 22, s: 4, t: 8.8, dl: 0.9, dx: 14, o: 0.5 },
  { x: 76, y: 48, s: 3, t: 7.2, dl: 2.9, dx: -20, o: 0.4 },
  { x: 83, y: 84, s: 5, t: 9.2, dl: 0.2, dx: 18, o: 0.6 },
  { x: 89, y: 34, s: 3, t: 6.6, dl: 1.9, dx: -12, o: 0.45 },
  { x: 94, y: 62, s: 4, t: 8.2, dl: 2.4, dx: 16, o: 0.5 },
  { x: 49, y: 90, s: 3, t: 7.8, dl: 3.2, dx: -14, o: 0.4 },
];

/* ═══════════ عناصر الافتتاحية المساعدة ═══════════ */

/* الخاتم الكبير — نجمة التقدم في قلب واجهة المخطوطة */
function Medallion({ s }: { s: Series }) {
  const { ref, on } = useInView<HTMLDivElement>("-60px");
  const prm = usePrefersReducedMotion();
  const spin = on && !prm;
  const axes = s.axes.slice(0, 5);
  const spots = [
    "right-[-12%] top-[10%]",
    "left-[-14%] top-[32%]",
    "right-[-16%] bottom-[20%]",
    "left-[-10%] bottom-[6%]",
    "left-[36%] top-[-8%]",
  ];
  return (
    <div ref={ref} className="group relative mx-auto w-64 transition-transform duration-700 hover:scale-[1.035] sm:w-72 lg:mt-0 lg:w-full lg:max-w-[26rem]" style={{ transitionTimingFunction: "var(--ease-soft)" }}>
      {/* نجوم تومض حول المدار */}
      <span className="twinkle absolute -top-3 right-8 text-sm text-gold" aria-hidden="true">✦</span>
      <span className="twinkle absolute left-0 top-1/3 text-xs text-gold/80" style={{ animationDelay: "1.1s" }} aria-hidden="true">✦</span>
      <span className="twinkle absolute -bottom-2 right-1/4 text-[10px] text-brass" style={{ animationDelay: "2.2s" }} aria-hidden="true">✦</span>
      <span className="twinkle absolute -left-4 bottom-10 text-sm text-gold/70" style={{ animationDelay: "0.6s" }} aria-hidden="true">✦</span>

      <div className="relative mx-auto aspect-square w-full drop-shadow-[0_0_28px_var(--glow)] transition-[filter] duration-700 group-hover:drop-shadow-[0_0_44px_var(--glow)]">
        {/* حلقات مدارية دوّارة */}
        <div className="absolute inset-0 rounded-full border border-dashed border-gold/40" style={{ animation: spin ? "spinSlow 70s linear infinite" : undefined }} aria-hidden="true" />
        <div className="absolute inset-5 rounded-full border border-line/80" style={{ animation: spin ? "spinSlow 100s linear infinite reverse" : undefined }} aria-hidden="true" />
        {/* نقاط على المدار */}
        <span className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold shadow-[0_0_10px_var(--glow)]" aria-hidden="true" />
        <span className="absolute bottom-0 left-1/2 h-2 w-2 -translate-x-1/2 translate-y-1/2 rounded-full bg-gold shadow-[0_0_10px_var(--glow)]" aria-hidden="true" />
        <span className="absolute left-0 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold shadow-[0_0_10px_var(--glow)]" aria-hidden="true" />
        <span className="absolute right-0 top-1/2 h-2 w-2 -translate-y-1/2 translate-x-1/2 rounded-full bg-gold shadow-[0_0_10px_var(--glow)]" aria-hidden="true" />

        {/* الخاتم نفسه */}
        <div className="absolute inset-9 grid place-items-center">
          <Khatam size="100%" progress={s.done / s.total} draw on={on} tone="var(--gold)" />
        </div>

        {/* عدّاد الإنجاز في المركز */}
        <div className="absolute inset-0 grid place-items-center">
          <div className="text-center" style={on ? { animation: "rise 0.8s var(--ease-soft) 0.9s both" } : { opacity: 0 }}>
            <p className="num font-display text-4xl font-bold leading-none text-ink">
              {toAr(s.done)}<span className="text-base text-faint"> / {toAr(s.total)}</span>
            </p>
            <p className="mt-1.5 text-[10px] tracking-[0.25em] text-mute">درسًا مكتملًا</p>
          </div>
        </div>

        {/* محاور السلسلة عائمة حول الخاتم */}
        <div className="pointer-events-none absolute inset-0 hidden lg:block" aria-hidden="true">
          {axes.map((a, i) => (
            <span
              key={a}
              className={cx("absolute rounded-full border border-gold/30 bg-card/90 px-3 py-1 text-[10.5px] text-mute shadow-md backdrop-blur", spots[i % spots.length])}
              style={{ ["--rot" as string]: `${i % 2 ? 1.6 : -1.6}deg`, animation: spin ? `floaty ${5 + i}s ease-in-out ${i * 0.5}s infinite` : undefined }}
            >
              {a}
            </span>
          ))}
        </div>
      </div>
      <p className="mt-5 text-center text-[11px] text-faint">الخاتم: يكتمل ضلعًا فضلعًا كلما أتممت درسًا</p>
    </div>
  );
}

/* آية العلم — فاصل قرآني تحت الواجهة */
function AyahDivider() {
  const { ref, on } = useInView<HTMLDivElement>();
  return (
    <div ref={ref} className={cx("rv mt-14 text-center", on && "on")}>
      <div className="flex items-center justify-center gap-4 md:gap-6">
        <Flourish className="hidden opacity-70 sm:block" />
        <p className="font-khat text-2xl leading-loose text-gold md:text-4xl">﴿ وَقُل رَّبِّ زِدْنِي عِلْمًا ﴾</p>
        <Flourish className="hidden -scale-x-100 opacity-70 sm:block" />
      </div>
      <p className="num mt-3 text-[11px] tracking-[0.35em] text-faint">طه · ١١٤</p>
    </div>
  );
}

/* مؤشر التمرير */
function ScrollCue() {
  return (
    <div className="mt-12 flex justify-center">
      <a href="#series" className="group flex flex-col items-center gap-2 text-faint transition-colors hover:text-gold" aria-label="الانتقال إلى السلاسل">
        <span className="text-[10px] tracking-[0.35em]">تابِع</span>
        <span className="grid h-9 w-6 place-items-center rounded-full border border-current">
          <span className="h-2 w-1 rounded-full bg-current" style={{ animation: "scrollDot 1.8s ease-in-out infinite" }} aria-hidden="true" />
        </span>
      </a>
    </div>
  );
}

/* ═══════════ ١) الواجهة الافتتاحية ═══════════ */

export function Opening() {
  const { ref: statRef, on: statOn } = useInView<HTMLDivElement>();
  const { setActiveSeries, motion } = useUI();
  const { play } = usePlayer();
  const s = featuredSeries;
  const lastLesson = s.lessons.find((l) => l.state === "current") || s.lessons[s.done - 1];
  const queue = useMemo(() => seriesQueue(s), [s]);

  let resumePos = 0;
  try { resumePos = Number(localStorage.getItem(`sawti:pos:s1-${lastLesson.n}`)) || 0; } catch { /* noop */ }
  const started = resumePos > 20;
  const y = useScrollY();
  const prm = usePrefersReducedMotion();
  const alive = motion === "full" && !prm;
  /* طبقات تنزاح مع مؤشر الفأرة بعمق مختلف */
  const secRef = usePointerParallax<HTMLElement>(alive);

  const track = {
    id: `s1-${lastLesson.n}`,
    title: `الدرس ${toAr(lastLesson.n)}: ${lastLesson.title}`,
    kind: "lesson" as const,
    from: s.title,
    duration: lastLesson.dur,
    tone: 220 + lastLesson.n * 18,
  };

  return (
    <section ref={secRef} id="top" className="relative overflow-hidden pt-28 md:pt-32">
      {/* سماء الافتتاحية: تدرّج متنفّس ← مشربية ← ضباب منجرف ← ذرّات ← رذاذ الكانفس ← خاتم مائي */}
      <div className="opening-grad absolute inset-0" aria-hidden="true" />
      <Mashrabiya opacity={0.35} />
      <div className="pointer-events-none absolute inset-0" style={alive ? { transform: "translate3d(calc(var(--px,0)*-14px), calc(var(--py,0)*-10px), 0)" } : undefined} aria-hidden="true">
        <div className="mist mist-a" />
      </div>
      <div className="pointer-events-none absolute inset-0" style={alive ? { transform: "translate3d(calc(var(--px,0)*-22px), calc(var(--py,0)*-14px), 0)" } : undefined} aria-hidden="true">
        <div className="mist mist-b" />
      </div>
      <div
        className="dust pointer-events-none absolute inset-0"
        style={alive ? { transform: "translate3d(calc(var(--px,0)*16px), calc(var(--py,0)*11px), 0)" } : undefined}
        aria-hidden="true"
      >
        {DUST.map((d, i) => (
          <i
            key={i}
            style={{
              right: `${d.x}%`, top: `${d.y}%`, width: d.s, height: d.s,
              ["--t" as string]: `${d.t}s`, ["--dl" as string]: `${d.dl}s`,
              ["--dx" as string]: `${d.dx}px`, ["--o" as string]: d.o,
            }}
          />
        ))}
      </div>
      {/* الرذاذ الحي: يتساقط ويتطاير وينفجر عند النقر وينزاح عن المؤشر */}
      <SkyCanvas host={secRef} />
      <div className="pointer-events-none absolute -bottom-28 -left-28 opacity-[0.05]" style={{ transform: `translateY(${y * -0.06}px)` }} aria-hidden="true">
        <Khatam size={520} progress={1} tone="var(--gold)" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 md:px-8">
        {/* البسملة */}
        <p className="mb-7 text-center font-khat text-xl leading-relaxed text-gold/90 md:text-2xl" style={{ animation: "fadein 1.2s var(--ease-soft) 0.15s both" }}>
          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
        </p>

        {/* واجهة المخطوطة — إطار مذهّب مزدوج */}
        <div className="relative overflow-hidden rounded-[2.2rem] border border-line bg-card/45 px-6 py-9 shadow-[var(--shadow)] backdrop-blur-sm md:rounded-[2.6rem] md:px-14 md:py-12">
          <div className="pointer-events-none absolute inset-3 rounded-[1.7rem] border border-gold/20" aria-hidden="true" />
          <Corners tone="var(--gold)" className="opacity-70" />
          <Mashrabiya opacity={0.16} />
          <div className="pointer-events-none absolute -top-24 left-1/2 h-64 w-[38rem] -translate-x-1/2 rounded-full opacity-60 blur-3xl" style={{ background: "radial-gradient(circle, var(--glow), transparent 60%)" }} aria-hidden="true" />

          <div className="relative grid items-center gap-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-10">
            {/* السلسلة الجارية */}
        <div>
          <div className="rv on" style={{ animation: "rise 0.8s var(--ease-soft) 0.1s both" }}>
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-2 rounded-full border border-gold/50 bg-gold/10 px-3.5 py-1.5 text-xs font-bold text-gold">
                <span className="relative flex h-2 w-2">
                  <span className="absolute h-full w-full rounded-full bg-gold" style={{ animation: "breathe 2s ease-in-out infinite" }} />
                </span>
                السلسلة الجارية الآن
              </span>
              <span className="rounded-full border border-line px-3 py-1.5 text-[11px] text-mute">{hijriToday()}</span>
            </div>

            <h2 className="mt-5 font-display text-4xl font-bold leading-[1.25] text-ink md:text-6xl md:leading-[1.2]">
              {["شرح", "بلوغ", "المرام"].map((w, i) => (
                <span key={w} className="inline-block" style={{ animation: `rise 0.85s var(--ease-soft) ${0.25 + i * 0.13}s both` }}>
                  {w}&nbsp;
                </span>
              ))}
              <span className="mt-1 block text-2xl font-normal text-gold md:text-3xl">
                {["كتاب", "الطهارة", "—", "ابن", "حجر", "العسقلاني"].map((w, i) => (
                  <span key={i} className="inline-block" style={{ animation: `rise 0.85s var(--ease-soft) ${0.66 + i * 0.09}s both` }}>
                    {w}&nbsp;
                  </span>
                ))}
              </span>
            </h2>

            <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-mute">{s.desc}</p>

            <div className="mt-6 flex flex-wrap items-center gap-x-2.5 gap-y-2.5 text-[11.5px]">
              {[
                ["المستوى", s.level],
                ["الدروس", toAr(s.total)],
                ["المدة", `≈ ${toAr(s.hours)} ساعة`],
                ["المنهج", `${s.kind} تأصيلي`],
              ].map(([k, v], i) => (
                <span key={k} className="flex items-center gap-2.5">
                  {i > 0 && <span className="text-[8px] text-gold/60" aria-hidden="true">◆</span>}
                  <span className="rounded-full border border-line bg-card/60 px-3 py-1.5 text-mute transition-colors hover:border-gold/40">
                    {k}: <b className="text-ink">{v}</b>
                  </span>
                </span>
              ))}
            </div>

            <div className="mt-5 max-w-xl">
              <div className="mb-1.5 flex items-center justify-between text-xs">
                <span className="text-mute">إنجاز السلسلة</span>
                <span className="num font-semibold text-gold">{toAr(Math.round((s.done / s.total) * 100))}٪</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-line">
                <div className="h-full rounded-full bg-gradient-to-l from-gold to-golddeep transition-[width] duration-[1.6s]" style={{ width: `${(s.done / s.total) * 100}%`, transitionTimingFunction: "var(--ease-soft)" }} />
              </div>
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <button
                onClick={() => play(track, queue)}
                className="btn-press sheen flex items-center gap-2.5 rounded-full bg-gold px-6 py-3.5 text-sm font-bold text-base shadow-lg shadow-gold/25"
              >
                {I.play("ms-0.5")} تشغيل الدرس {toAr(lastLesson.n)} فورًا
              </button>
              <button
                onClick={() => setActiveSeries(s)}
                className="btn-press flex items-center gap-2 rounded-full border border-line bg-card px-6 py-3.5 text-sm font-semibold text-ink hover:border-gold/60"
              >
                منهج السلسلة الكامل
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="-scale-x-100">
                  <path d="m9 5 7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* تابع من حيث توقفت — يُقرأ بعد الكاش من التخزين المحلي */}
          <div className="mt-8 max-w-xl rounded-2xl border border-line bg-card/80 p-4 backdrop-blur" style={{ animation: "rise 0.8s var(--ease-soft) 0.5s both" }}>
            <p className="mb-3 flex items-center gap-2 text-xs font-bold tracking-widest text-gold">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                <path d="M12 7v5l3.5 2" /><circle cx="12" cy="12" r="9" />
              </svg>
              تابع من حيث توقفت
            </p>
            <div className="flex items-center gap-4">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-ink">{track.title}</p>
                <p className="mt-0.5 text-[11px] text-mute">
                  {started ? (
                    <>
                      توقفت عند <span className="num text-gold">{fmtClock(resumePos)}</span> · بقي <span className="num">{fmtClock(track.duration - resumePos)}</span>
                    </>
                  ) : (
                    <>
                      أول استماع — المدة <span className="num">{fmtClock(track.duration)}</span> · يُحفظ موضعك تلقائيًا
                    </>
                  )}
                </p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-line">
                  <div
                    className="h-full rounded-full bg-olive transition-[width] duration-700"
                    style={{ width: `${started ? (resumePos / track.duration) * 100 : 0}%`, transitionTimingFunction: "var(--ease-soft)" }}
                  />
                </div>
              </div>
              <button
                onClick={() => play(track, queue)}
                className="btn-press grid h-11 w-11 shrink-0 place-items-center rounded-full border-2 border-gold text-gold hover:bg-gold hover:text-base"
                aria-label="استئناف الاستماع"
              >
                {I.play("ms-0.5")}
              </button>
            </div>
          </div>
        </div>

            <div style={alive ? { transform: "translate3d(calc(var(--px,0)*22px), calc(var(--py,0)*15px), 0)" } : undefined}>
              <Medallion s={s} />
            </div>
          </div>
        </div>

        <AyahDivider />

        {/* عدادات المنصة */}
        <div ref={statRef} className="relative mx-auto mt-4 grid max-w-5xl grid-cols-2 gap-3 md:grid-cols-4">
          {STATS.map((st, i) => (
            <Stat key={st.label} {...st} on={statOn} i={i} />
          ))}
        </div>

        <ScrollCue />
      </div>
    </section>
  );
}

import { STATS } from "../data/content";
import { useCountUp } from "../lib/utils";

function Stat({ label, value, on, i }: { label: string; value: number; on: boolean; i: number }) {
  const v = useCountUp(value, on);
  return (
    <div className={cx("rv", on && "on")} style={{ ["--d" as string]: `${i * 90}ms` }}>
      <div className="card-lift relative overflow-hidden rounded-2xl border border-line bg-card/70 px-5 py-5 text-center backdrop-blur">
        <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-l from-transparent via-gold/70 to-transparent" aria-hidden="true" />
        <p className="num font-display text-4xl font-bold leading-none text-gold md:text-5xl">{toAr(v)}</p>
        <div className="mx-auto my-2.5 h-px w-8 bg-gold/40" aria-hidden="true" />
        <p className="text-xs text-mute">{label}</p>
      </div>
    </div>
  );
}

/* ═══════════ ٣) مسار السلاسل والدورات ═══════════ */

export function SeriesRail() {
  const { setActiveSeries } = useUI();
  const { ref, on } = useInView<HTMLDivElement>();

  return (
    <section id="series" className="relative scroll-mt-24">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <SectionHead
          kicker="المسار التعليمي"
          title="السلاسل والدورات"
          desc="اسحب أفقيًا — كل بطاقة تفتح منهج السلسلة الكامل بدروسه ومحاوره."
          count={toAr(seriesList.length)}
        />
      </div>

      <div ref={ref} className="rail mt-8 flex snap-x gap-5 overflow-x-auto px-4 pb-6 md:px-[max(2rem,calc((100vw-80rem)/2+2rem))]">
        {seriesList.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setActiveSeries(s)}
            className={cx("rv card-lift group relative w-[280px] shrink-0 snap-start overflow-hidden rounded-2xl border border-line bg-card p-5 text-right md:w-[320px]", on && "on")}
            style={{ ["--d" as string]: `${(i % 4) * 100}ms` }}
          >
            <div className="pointer-events-none absolute -left-6 -top-6 opacity-[0.07] transition-opacity duration-500 group-hover:opacity-[0.14]" aria-hidden="true">
              <Khatam size={150} progress={1} tone="var(--gold)" />
            </div>

            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={cx(
                    "rounded-full px-2.5 py-0.5 text-[10.5px] font-bold",
                    s.status === "جارية" && "bg-gold/15 text-gold",
                    s.status === "مكتملة" && "bg-moss/25 text-olive",
                    s.status === "لم تبدأ" && "bg-card2 text-faint"
                  )}>
                    {s.status}
                  </span>
                  <span className="rounded-full border border-line px-2.5 py-0.5 text-[10.5px] text-mute">{s.kind}</span>
                </div>
                <h3 className="mt-3 font-display text-xl font-bold leading-snug text-ink">{s.title}</h3>
                <p className="mt-1 truncate text-xs text-faint">{s.book}</p>
              </div>
              <ProgressKhatam size={58} progress={s.done / s.total} className="shrink-0" />
            </div>

            <div className="mt-4 flex items-center justify-between text-[11.5px] text-mute">
              <span className="num">{toAr(s.total)} درسًا · {toAr(s.hours)} ساعة</span>
              <span className="rounded-full bg-card2 px-2 py-0.5 text-[10.5px] text-faint">{s.level}</span>
            </div>

            <div className="mt-3 h-1 overflow-hidden rounded-full bg-line">
              <div className="h-full rounded-full bg-gold transition-[width] duration-1000" style={{ width: `${(s.done / s.total) * 100}%` }} />
            </div>

            <span className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-gold opacity-80 transition-opacity group-hover:opacity-100">
              عرض المنهج
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="-scale-x-100 transition-transform group-hover:-translate-x-1" aria-hidden="true">
                <path d="m9 5 7 7-7 7" />
              </svg>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

/* ═══════════ ورقة منهج السلسلة ═══════════ */

export function SeriesSheet() {
  const { activeSeries: s, setActiveSeries } = useUI();
  const { play } = usePlayer();

  if (!s) return null;
  const queue = seriesQueue(s);
  const nextLesson = s.lessons.find((l) => l.state === "current") || s.lessons[0];
  const startBtn = s.done === 0 ? "ابدأ السلسلة" : `تابع من الدرس ${toAr(nextLesson?.n ?? 1)}`;

  return (
    <Sheet open onClose={() => setActiveSeries(null)} title={s.title} wide>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-md">
          <p className="text-sm leading-relaxed text-mute">{s.desc}</p>
          <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
            <div><dt className="text-faint">الكتاب المشروح</dt><dd className="mt-0.5 font-medium text-ink">{s.book}</dd></div>
            <div><dt className="text-faint">المستوى</dt><dd className="mt-0.5 font-medium text-ink">{s.level}</dd></div>
            <div className="num"><dt className="text-faint">الحجم</dt><dd className="mt-0.5 font-medium text-ink">{toAr(s.total)} درسًا · ≈ {toAr(s.hours)} ساعة</dd></div>
            {s.prereq && <div><dt className="text-faint">شرط مسبق</dt><dd className="mt-0.5 font-medium text-ink">{s.prereq}</dd></div>}
          </dl>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {s.axes.map((a) => (
              <span key={a} className="rounded-full border border-line bg-card2 px-3 py-1 text-[11px] text-mute">{a}</span>
            ))}
          </div>
        </div>
        <div className="flex flex-col items-center gap-2">
          <ProgressKhatam size={92} progress={s.done / s.total} />
          <button
            onClick={() => {
              if (queue.length) play(queue[Math.min(nextLesson ? nextLesson.n - 1 : 0, queue.length - 1)], queue);
              setActiveSeries(null);
            }}
            className="btn-press mt-2 flex items-center gap-2 rounded-full bg-gold px-5 py-3 text-sm font-bold text-base shadow-lg shadow-gold/25"
          >
            {I.play("ms-0.5")} {startBtn}
          </button>
        </div>
      </div>

      {s.lessons.length > 0 ? (
        <>
          <h4 className="mb-3 mt-8 flex items-center gap-2 text-sm font-bold text-ink">
            <span className="text-gold">✦</span> قائمة الدروس <span className="num text-xs font-normal text-faint">({toAr(s.lessons.length)} من {toAr(s.total)})</span>
          </h4>
          <ol className="space-y-1.5">
            {s.lessons.map((l) => (
              <li key={l.n}>
                <div className="group flex items-center gap-3 rounded-xl border border-line bg-card2/50 px-4 py-3 transition-colors hover:border-gold/40 hover:bg-card2">
                  <span className={cx(
                    "num grid h-8 w-8 shrink-0 place-items-center rounded-full border text-xs font-bold",
                    l.state === "done" && "border-moss bg-moss/20 text-olive",
                    l.state === "current" && "border-gold bg-gold/15 text-gold",
                    l.state === "next" && "border-line text-faint"
                  )}>
                    {l.state === "done" ? I.check("h-3.5 w-3.5") : toAr(l.n)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className={cx("truncate text-sm", l.state === "next" ? "text-faint" : "font-medium text-ink")}>{l.title}</p>
                    <p className="num mt-0.5 text-[11px] text-faint">
                      {fmtDur(l.dur)} {l.attachments > 0 && <>· {toAr(l.attachments)} ملحقات</>}
                      {l.state === "current" && <span className="mr-2 text-gold">— موضعك الآن</span>}
                    </p>
                  </div>
                  {l.state !== "next" && (
                    <button
                      onClick={() => play({ id: `s1-${l.n}`, title: `الدرس ${l.n}: ${l.title}`, kind: "lesson", from: s.title, duration: l.dur, tone: 220 + l.n * 18 }, queue)}
                      className="btn-press grid h-9 w-9 shrink-0 place-items-center rounded-full border border-line text-mute opacity-70 transition-all hover:border-gold hover:text-gold group-hover:opacity-100"
                      aria-label={`تشغيل ${l.title}`}
                    >
                      {I.play("ms-0.5")}
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </>
      ) : (
        <p className="mt-8 rounded-xl border border-dashed border-line bg-card2/50 px-4 py-5 text-center text-sm text-mute">
          تُنشر دروس هذه السلسلة تباعًا — أضفها للمفضلة ليصلك إشعار أول درس.
        </p>
      )}

      <p className="mt-6 rounded-xl border border-gold/25 bg-gold/8 px-4 py-3 text-[11.5px] leading-relaxed text-mute">
        <b className="text-gold">الملحقات:</b> لكل درس لوحة ملحقات مستقلة (متون، تفريغات، جداول فوائد) تُعرض ملازمة للمادة، مع زر «تحميل كل الملحقات» مضغوطة.
      </p>
    </Sheet>
  );
}

/* ═══════════ ٤) الردود العلمية — هيئة الوثيقة ═══════════ */

export function RaddDocs() {
  return (
    <section id="radd" className="relative scroll-mt-24 overflow-hidden bg-[#0d1915] py-16 text-[#eae3d2]">
      <Mashrabiya opacity={0.25} />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-l from-transparent via-gold/50 to-transparent" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-l from-transparent via-gold/50 to-transparent" aria-hidden="true" />

      <div className="relative mx-auto max-w-7xl px-4 md:px-8">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 text-gold">
              <Khatam size={26} progress={1} tone="currentColor" />
              <span className="text-xs font-semibold tracking-[0.25em] text-[#93a79a]">وثائق علمية</span>
            </div>
            <h2 className="mt-3 font-display text-3xl font-bold md:text-[2.6rem]">الردود العلمية</h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#93a79a]">
              الدعوى في سطر، والرد في سطر — بتأنٍّ وإنصاف، وعلى منهج أهل العلم في الرد.
            </p>
          </div>
          <span className="rounded-full border border-gold/40 px-4 py-1.5 text-xs text-gold">حقل التخريج والحكم: بانتظار قلم الشيخ</span>
        </div>

        <div className="grid gap-8 md:grid-cols-3 md:gap-6">
          {RADD_DATA.map((r, i) => (
            <RaddCard key={r.id} r={r} i={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

import { rudad } from "../data/content";
import type { Radd } from "../data/content";

const RADD_DATA = rudad;

function RaddCard({ r, i }: { r: Radd; i: number }) {
  const { ref, on } = useInView<HTMLDivElement>();
  return (
    <div ref={ref} className={cx("rv", on && "on")} style={{ ["--d" as string]: `${i * 140}ms` }}>
      <article
        className={cx(
          "doc-paper group relative h-full rounded-sm p-6 transition-transform duration-500",
          i % 3 === 0 && "md:translate-y-4 md:rotate-[0.6deg] md:hover:translate-y-0 md:hover:rotate-0",
          i % 3 === 1 && "md:-translate-y-1 md:rotate-[-0.5deg] md:hover:translate-y-0 md:hover:rotate-0",
          i % 3 === 2 && "md:translate-y-7 md:rotate-[0.4deg] md:hover:translate-y-2 md:hover:rotate-0"
        )}
        style={{ transitionTimingFunction: "var(--ease-soft)" }}
      >
        <Corners tone="rgba(143,115,57,0.85)" />

        <div className="flex items-center justify-between">
          <span className={cx(
            "rounded-sm px-2.5 py-1 text-[10.5px] font-bold tracking-wider",
            r.status === "مفصّل" && "bg-[#8f7339]/20 text-[#6d5527]",
            r.status === "تعقيب" && "bg-[#2e4a3b]/15 text-[#2e4a3b]",
            r.status === "أولي" && "bg-black/10 text-[#22302a]"
          )}>
            رد {r.status}
          </span>
          <span className="num text-[11px] text-[#22302a]/60">{r.hijri} · {toAr(r.pages)} صفحة</span>
        </div>

        <p className="mt-5 border-r-2 border-[#8f7339] pr-3 font-display text-[15px] font-bold leading-relaxed text-[#22302a]">
          الدعوى: {r.claim}
        </p>

        <h3 className="mt-4 font-display text-2xl font-bold leading-snug text-[#182720]">{r.title}</h3>
        <p className="mt-1 text-[11px] font-medium text-[#22302a]/55">{r.claimant}</p>

        <p className="mt-3 text-[13px] leading-relaxed text-[#22302a]/85">{r.summary}</p>

        <div className="mt-5 flex items-center justify-between border-t border-[#8f7339]/30 pt-4">
          <DlBtn name={r.title} className="!bg-transparent !text-[#6d5527] !border-[#8f7339]/50 hover:!bg-[#8f7339]/10" />
          <span className="flex items-center gap-1 text-[11px] font-semibold text-[#6d5527]">
            <FavBtn id={r.id} className="!border-[#8f7339]/50 !bg-transparent !text-[#6d5527]" />
          </span>
        </div>
      </article>
    </div>
  );
}

export { Girih, KIND_LABEL, articles, diary };

/* ═══════════ ٢) شريط أحدث المواد — يتحرك بلا نهاية ويتوقف عند المرور ═══════════ */

const TICKER = [
  ...seriesList[0].lessons
    .filter((l) => l.state !== "next")
    .slice(-3)
    .map((l) => ({ id: `s1-${l.n}`, kind: "درس", title: `الدرس ${l.n}: ${l.title}`, sec: "series" })),
  ...khutab.slice(0, 3).map((k) => ({ id: k.id, kind: "خطبة", title: k.title, sec: "khutab" })),
  ...articles.slice(0, 3).map((a) => ({ id: a.id, kind: "مقال", title: a.title, sec: "articles" })),
  ...fatawa.slice(0, 2).map((f) => ({ id: f.id, kind: "فتوى", title: f.question, sec: "fatwa" })),
];

export function LatestTicker() {
  return (
    <div className="ticker relative mt-16 overflow-hidden border-y border-line bg-card/60" aria-label="أحدث المواد">
      {/* تلاشي الحواف */}
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-base to-transparent" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-base to-transparent" aria-hidden="true" />

      <div className="ticker-track items-center py-3">
        {[0, 1].map((copy) => (
          <div key={copy} className="flex shrink-0 items-center" aria-hidden={copy === 1}>
            {TICKER.map((t) => (
              <button
                key={`${copy}-${t.id}`}
                tabIndex={copy === 1 ? -1 : 0}
                onClick={() => document.getElementById(t.sec)?.scrollIntoView({ behavior: "smooth" })}
                className="btn-press group mx-4 flex items-center gap-2.5 whitespace-nowrap text-[12.5px] text-mute transition-colors hover:text-ink md:mx-6"
              >
                <span className="text-gold opacity-60 transition-opacity group-hover:opacity-100" aria-hidden="true">✦</span>
                <span className="rounded-full border border-line px-2 py-0.5 text-[10px] font-bold text-gold transition-colors group-hover:border-gold/50">
                  {t.kind}
                </span>
                <span className="max-w-80 truncate">{t.title}</span>
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
