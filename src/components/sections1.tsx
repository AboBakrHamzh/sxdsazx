import { useMemo } from "react";
import { KIND_LABEL, articles, diary, seriesList } from "../data/content";
import { cx, fmtClock, fmtDur, hijriToday, toAr, useInView } from "../lib/utils";
import { featuredSeries, seriesQueue, useFav, usePlayer, useUI } from "../state/store";
import { Sheet, I } from "./chrome";
import { Corners, Girih, Khatam, Mashrabiya, ProgressKhatam, SectionHead } from "./ornament";
import { DlBtn, Eq, FavBtn, MiniBar } from "./player";

/* ═══════════ ١) الواجهة الافتتاحية ═══════════ */

export function Opening() {
  const { ref: starRef, on: starOn } = useInView<HTMLDivElement>("-40px");
  const { ref: statRef, on: statOn } = useInView<HTMLDivElement>();
  const { setActiveSeries } = useUI();
  const { play } = usePlayer();
  const s = featuredSeries;
  const lastLesson = s.lessons.find((l) => l.state === "current") || s.lessons[s.done - 1];
  const queue = useMemo(() => seriesQueue(s), [s]);

  let resumePos = 812;
  try { resumePos = Number(localStorage.getItem(`sawti:pos:s1-${lastLesson.n}`)) || 812; } catch { /* noop */ }

  const track = {
    id: `s1-${lastLesson.n}`,
    title: `الدرس ${toAr(lastLesson.n)}: ${lastLesson.title}`,
    kind: "lesson" as const,
    from: s.title,
    duration: lastLesson.dur,
    tone: 220 + lastLesson.n * 18,
  };

  return (
    <section id="top" className="relative overflow-hidden pb-6 pt-32 md:pt-40">
      {/* طبقات الخلفية: مشربية + توهج + نقش جانبي بمنظور خفيف */}
      <Mashrabiya opacity={0.5} />
      <div className="pointer-events-none absolute -top-40 right-[-10%] h-[34rem] w-[34rem] rounded-full opacity-70 blur-3xl" style={{ background: "radial-gradient(circle, var(--glow), transparent 65%)" }} aria-hidden="true" />
      <div className="pointer-events-none absolute left-[-8%] top-24 h-[26rem] w-[26rem] rounded-full opacity-60 blur-3xl" style={{ background: "radial-gradient(circle, color-mix(in srgb, var(--olive) 18%, transparent), transparent 70%)" }} aria-hidden="true" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:px-8">
        {/* النقش المميّز: نجمة تكتمل أسافينها مع تقدم السلسلة */}
        <div ref={starRef} className="relative mx-auto hidden md:block">
          <div className="absolute inset-0 grid place-items-center">
            <div className="h-72 w-72 rounded-full border border-dashed border-line" style={{ animation: starOn ? "spinSlow 120s linear infinite" : undefined }} aria-hidden="true" />
          </div>
          <Khatam size={330} progress={s.done / s.total} draw on={starOn} spin tone="var(--gold)" />
          <div className="absolute inset-0 grid place-items-center">
            <div className="mt-2 text-center" style={starOn ? { animation: "rise 0.8s var(--ease-soft) 1.2s both" } : { opacity: 0 }}>
              <p className="font-display text-4xl font-bold text-ink">{toAr(s.done)}<span className="text-lg text-faint"> / {toAr(s.total)}</span></p>
              <p className="mt-1 text-xs tracking-widest text-mute">درسًا من كتاب الطهارة</p>
            </div>
          </div>
          <p className="mt-4 text-center text-[11px] text-faint">الخاتم: يكتمل ضلعًا فضلعًا كلما أتممت درسًا</p>
        </div>

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
              شرح بلوغ المرام
              <span className="mt-1 block text-2xl font-normal text-gold md:text-3xl">كتاب الطهارة — ابن حجر العسقلاني</span>
            </h2>

            <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-mute">{s.desc}</p>

            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs text-mute">
              <span>المستوى: <b className="text-ink">{s.level}</b></span>
              <span className="num">{toAr(s.total)} درسًا</span>
              <span className="num">≈ {toAr(s.hours)} ساعة</span>
              <span>{s.kind} تأصيلي</span>
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
                className="btn-press flex items-center gap-2.5 rounded-full bg-gold px-6 py-3.5 text-sm font-bold text-base shadow-lg shadow-gold/25"
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
                  توقفت عند <span className="num text-gold">{fmtClock(resumePos)}</span> · بقي <span className="num">{fmtClock(track.duration - resumePos)}</span>
                </p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-line">
                  <div className="h-full rounded-full bg-olive" style={{ width: `${(resumePos / track.duration) * 100}%` }} />
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
      </div>

      {/* عدادات المنصة */}
      <div ref={statRef} className="relative mx-auto mt-16 grid max-w-5xl grid-cols-2 gap-3 px-4 md:grid-cols-4 md:px-8">
        {STATS.map((st, i) => (
          <Stat key={st.label} {...st} on={statOn} i={i} />
        ))}
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
      <div className="card-lift rounded-2xl border border-line bg-card/70 px-5 py-4 text-center backdrop-blur">
        <p className="num font-display text-3xl font-bold text-gold md:text-4xl">{toAr(v)}</p>
        <p className="mt-1 text-xs text-mute">{label}</p>
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
          i % 3 === 0 && "md:translate-y-4 md:rotate-[0.6deg]",
          i % 3 === 1 && "md:-translate-y-1 md:rotate-[-0.5deg]",
          i % 3 === 2 && "md:translate-y-7 md:rotate-[0.4deg]"
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
