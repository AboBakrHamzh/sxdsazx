import { useState } from "react";
import { articles, books, diary, fatawa, khutab, lectures } from "../data/content";
import { cx, fmtDur, toAr, useInView } from "../lib/utils";
import { I } from "./chrome";
import { TiltCard, useSpotlight } from "./interactive";
import { Corners, Khatam, Mashrabiya, SectionHead } from "./ornament";
import { DlBtn, FavBtn, MiniBar } from "./player";

/* ═══════════ ٥) الفتاوى — سؤال وجواب قابل للطي ═══════════ */

export function FatwaAccordion() {
  const [open, setOpen] = useState<string | null>(fatawa[0].id);
  const [copied, setCopied] = useState<string | null>(null);
  const { ref, on } = useInView<HTMLDivElement>();

  const copyAnswer = (id: string, text: string) => {
    const done = () => {
      setCopied(id);
      window.setTimeout(() => setCopied(null), 1800);
    };
    try {
      if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).then(done).catch(done);
      else done();
    } catch { done(); }
  };

  return (
    <section id="fatwa" className="relative scroll-mt-24">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <SectionHead
          kicker="سؤال وجواب"
          title="الفتاوى والأسئلة"
          desc="تُفتح داخل الصفحة — الجواب كامل بلا مغادرة موضعك."
          count={toAr(fatawa.length)}
        />

        <div ref={ref} className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
          <div className="space-y-3">
            {fatawa.map((f, i) => {
              const isOpen = open === f.id;
              return (
                <div key={f.id} className={cx("rv", on && "on")} style={{ ["--d" as string]: `${i * 80}ms` }}>
                  <div className={cx("overflow-hidden rounded-2xl border bg-card transition-colors duration-400", isOpen ? "border-gold/50" : "border-line")}>
                    <button
                      onClick={() => setOpen(isOpen ? null : f.id)}
                      className="flex w-full items-center gap-4 px-5 py-4 text-right"
                      aria-expanded={isOpen}
                    >
                      <span className={cx(
                        "grid h-9 w-9 shrink-0 place-items-center rounded-full border text-gold transition-all duration-500",
                        isOpen ? "rotate-180 border-gold bg-gold/10" : "border-line"
                      )} style={{ transitionTimingFunction: "var(--ease-soft)" }}>
                        {I.chevron()}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-display text-lg font-bold leading-relaxed text-ink">{f.question}</span>
                        <span className="mt-0.5 block text-[11px] text-faint">
                          {f.topic} · {f.hijri} {f.asker && <>· السائل: {f.asker}</>}
                        </span>
                      </span>
                      <FavBtn id={f.id} className="hidden shrink-0 sm:grid" />
                    </button>
                    <div className={cx("grid transition-[grid-template-rows] duration-500", isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]")} style={{ transitionTimingFunction: "var(--ease-soft)" }}>
                      <div className="overflow-hidden">
                        <div className="border-t border-linesoft px-5 py-4 pr-[4.5rem]">
                          <p className="text-[14.5px] leading-loose text-mute">
                            <span className="float-right mr-[-1.4rem] mt-1 font-display text-2xl text-gold">﴿</span>
                            {f.answer}
                            <span className="font-display text-2xl text-gold">﴾</span>
                          </p>
                          <div className="mt-4 flex items-center gap-3">
                            <button
                              onClick={() => copyAnswer(f.id, f.answer)}
                              className={cx(
                                "btn-press flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-semibold transition-colors",
                                copied === f.id ? "border-moss bg-moss/20 text-olive" : "border-line text-mute hover:border-gold/60 hover:text-gold"
                              )}
                              aria-label="نسخ الجواب"
                            >
                              {copied === f.id ? I.check() : (
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                  <rect x="9" y="9" width="12" height="12" rx="2" />
                                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                                </svg>
                              )}
                              {copied === f.id ? "نُسخ الجواب" : "نسخ الجواب"}
                            </button>
                            <span className="num text-[10.5px] text-faint">صدرت في {f.hijri}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* أرسل سؤالك */}
          <aside className={cx("rv h-fit rounded-2xl border border-line bg-card p-6 lg:sticky lg:top-28", on && "on")} style={{ ["--d" as string]: "200ms" }}>
            <Khatam size={44} progress={1} draw on tone="var(--gold)" />
            <h3 className="mt-4 font-display text-xl font-bold text-ink">أرسل سؤالك</h3>
            <p className="mt-2 text-sm leading-relaxed text-mute">
              يصل سؤالك إلى الشيخ كمسودة فتوى — تُراجع وتُنشر إن كانت مما يعمّ به البلوى.
            </p>
            <AskForm />
            <p className="mt-3 text-[11px] leading-relaxed text-faint">
              يُفضَّل ذكر البلد وحالة السؤال. الأسئلة الطبية تُحال لأهل الاختصاص أولًا.
            </p>
          </aside>
        </div>
      </div>
    </section>
  );
}

/* ═══════════ ٦) الخطب — بطاقات عريضة بتشغيل وتحميل ═══════════ */

export function KhutabList() {
  const { ref, on } = useInView<HTMLDivElement>();
  return (
    <section id="khutab" className="relative scroll-mt-24">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <SectionHead
          kicker="منبر الجمعة"
          title="الخطب"
          desc="تشغيل فوري من البطاقة، أو تحميل — بلا فتح المادة."
          count={toAr(khutab.length)}
        />
        <div ref={ref} className="mt-8 space-y-4">
          {khutab.map((k, i) => (
            <KhutabCard key={k.id} k={k} i={i} on={on} />
          ))}
        </div>
      </div>
    </section>
  );
}

function KhutabCard({ k, i, on }: { k: (typeof khutab)[number]; i: number; on: boolean }) {
  const spotRef = useSpotlight<HTMLElement>();
  return (
    <div className={cx("rv", on && "on")} style={{ ["--d" as string]: `${i * 100}ms` }}>
      <article ref={spotRef} className="card-lift spotlight group relative overflow-hidden rounded-2xl border border-line bg-card p-5 md:p-6">
                <div className="pointer-events-none absolute -left-10 top-1/2 -translate-y-1/2 opacity-[0.05] transition-opacity duration-500 group-hover:opacity-[0.1]" aria-hidden="true">
                  <Khatam size={200} progress={1} tone="var(--gold)" />
                </div>
                <div className="relative grid gap-4 md:grid-cols-[1fr_290px] md:items-center md:gap-8">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-[11px]">
                      <span className="rounded-full bg-gold/12 px-2.5 py-1 font-bold text-gold">{k.occasion}</span>
                      <span className="text-faint">{k.mosque}</span>
                      <span className="num text-faint">· {k.hijri}</span>
                    </div>
                    <h3 className="mt-2.5 font-display text-2xl font-bold leading-snug text-ink transition-colors group-hover:text-gold">
                      {k.title}
                    </h3>
                    <p className="mt-1.5 max-w-xl text-[13px] leading-relaxed text-mute">{k.summary}</p>
                  </div>
                  <div className="flex flex-col gap-3">
                    <MiniBar track={{ id: k.id, title: k.title, kind: "khutbah", from: `خطب ${k.mosque}`, duration: k.dur }} tone={300 + i * 30} />
                    <div className="flex items-center gap-2">
                      <DlBtn name={k.title} />
                      <FavBtn id={k.id} />
                      <span className="num ms-auto text-[11px] text-faint">{fmtDur(k.dur)}</span>
                    </div>
                  </div>
                </div>
      </article>
    </div>
  );
}

/* ═══════════ ٧) المقالات — تخطيط مجلّة ═══════════ */

export function ArticlesMag() {
  const { ref, on } = useInView<HTMLDivElement>();
  const [featured, ...rest] = articles;
  return (
    <section id="articles" className="relative scroll-mt-24">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <SectionHead kicker="كلمة مكتوبة" title="المقالات" count={toAr(articles.length)} />

        <div ref={ref} className="mt-8 grid gap-8 lg:grid-cols-[7fr_5fr]">
          {/* المقال الرئيس */}
          <TiltCard max={4.5} className={cx("rv group", on && "on")}>
          <article className="card-lift relative h-full overflow-hidden rounded-3xl border border-line bg-card p-7 md:p-9">
            <Mashrabiya opacity={0.3} className="opacity-40 transition-opacity duration-700 group-hover:opacity-70" />
            <Corners />
            <div className="relative">
              <div className="flex items-center gap-2 text-[11px]">
                <span className="rounded-full bg-gold/12 px-2.5 py-1 font-bold text-gold">{featured.topic}</span>
                <span className="num text-faint">{featured.hijri} · {toAr(featured.minutes)} دقيقة قراءة</span>
              </div>
              <h3 className="mt-4 max-w-lg font-display text-3xl font-bold leading-[1.4] text-ink transition-colors group-hover:text-gold md:text-4xl md:leading-[1.35]">
                {featured.title}
              </h3>
              <p className="mt-4 max-w-xl text-[14.5px] leading-loose text-mute">{featured.excerpt}</p>
              <div className="mt-6 flex items-center gap-3">
                <button className="btn-press flex items-center gap-2 rounded-full bg-gold px-5 py-2.5 text-sm font-bold text-base shadow-md shadow-gold/20">
                  قراءة المقال
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="-scale-x-100 transition-transform group-hover:-translate-x-1" aria-hidden="true">
                    <path d="m9 5 7 7-7 7" />
                  </svg>
                </button>
                <FavBtn id={featured.id} />
              </div>
            </div>
          </article>
          </TiltCard>

          {/* القائمة المرقّمة */}
          <ol className="flex flex-col">
            {rest.map((a, i) => (
              <li key={a.id} className={cx("rv", on && "on")} style={{ ["--d" as string]: `${120 + i * 90}ms` }}>
                <article className="group flex cursor-pointer items-start gap-5 border-b border-linesoft py-5 transition-colors last:border-0 hover:bg-card/60">
                  <span className="num font-display text-4xl font-bold leading-none text-line transition-colors duration-300 group-hover:text-gold" aria-hidden="true">
                    {toAr(i + 1).padStart(2, "٠")}
                  </span>
                  <div className="min-w-0">
                    <h4 className="font-display text-lg font-bold leading-relaxed text-ink transition-colors group-hover:text-gold">{a.title}</h4>
                    <p className="mt-1 line-clamp-2 text-[12.5px] leading-relaxed text-mute">{a.excerpt}</p>
                    <p className="num mt-2 text-[11px] text-faint">{a.topic} · {toAr(a.minutes)} د</p>
                  </div>
                  <FavBtn id={a.id} className="ms-auto shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
                </article>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

/* ═══════════ ٨) المكتبة — رفّ كتب ═══════════ */

const COVER_STYLE: Record<string, { bg: string; border: string; text: string }> = {
  olive: { bg: "linear-gradient(160deg,#2e4a3b,#1d3328)", border: "#c7a45f", text: "#efe6cf" },
  night: { bg: "linear-gradient(160deg,#16261f,#0b1512)", border: "#c7a45f", text: "#efe6cf" },
  brass: { bg: "linear-gradient(160deg,#8f7339,#5d4a24)", border: "#efe6cf", text: "#f7f0dd" },
};

export function LibraryShelf() {
  const { ref, on } = useInView<HTMLDivElement>();
  return (
    <section id="library" className="relative scroll-mt-24">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <SectionHead
          kicker="مؤلفات وتحقيقات"
          title="المكتبة"
          desc="أغلفة بأبعاد كتاب حقيقية — مرّر لرفع الكتاب من الرف."
          count={toAr(books.length)}
        />
      </div>

      <div ref={ref} className="rail mt-10 flex snap-x items-end gap-7 overflow-x-auto px-4 pb-2 md:px-[max(2rem,calc((100vw-80rem)/2+2rem))]">
        {books.map((b, i) => {
          const cs = COVER_STYLE[b.cover];
          return (
            <div key={b.id} className={cx("rv w-44 shrink-0 snap-start md:w-48", on && "on")} style={{ ["--d" as string]: `${(i % 5) * 90}ms` }}>
              <div className="group">
                {/* الغلاف */}
                <TiltCard
                  max={12}
                  className="relative aspect-[3/4] w-full origin-bottom overflow-hidden rounded-md border border-black/20 shadow-lg shadow-black/30"
                >
                <div
                  className="relative h-full w-full overflow-hidden rounded-md"
                  style={{ background: cs.bg, transitionTimingFunction: "var(--ease-soft)" }}
                  role="img"
                  aria-label={`غلاف ${b.title}`}
                >
                  <div className="absolute inset-2 rounded-sm border" style={{ borderColor: `${cs.border}66` }} aria-hidden="true" />
                  <div className="absolute inset-0 grid place-items-center opacity-25" aria-hidden="true">
                    <Khatam size={120} progress={1} tone={cs.border} />
                  </div>
                  <div className="absolute inset-x-3 top-1/2 -translate-y-1/2 text-center">
                    <p className="font-khat text-lg font-bold leading-relaxed" style={{ color: cs.text }}>{b.title}</p>
                    <div className="mx-auto mt-2 h-px w-10" style={{ background: `${cs.border}99` }} aria-hidden="true" />
                    <p className="mt-2 text-[9px] tracking-widest" style={{ color: `${cs.text}aa` }}>أبو عمرو نور الدين السدعي</p>
                  </div>
                  <p className="num absolute bottom-2.5 inset-x-0 text-center text-[9px]" style={{ color: `${cs.text}88` }}>{b.year}هـ</p>
                  {/* كعب الكتاب */}
                  <div className="absolute inset-y-0 right-0 w-1.5 bg-black/25" aria-hidden="true" />
                </div>
                </TiltCard>

                {/* بيانات الكتاب */}
                <div className="mt-3.5 rounded-xl border border-line bg-card p-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-full bg-card2 px-2 py-0.5 text-[10px] font-semibold text-mute">{b.type}</span>
                    <span className={cx(
                      "rounded-full px-2 py-0.5 text-[10px] font-bold",
                      b.status === "مطبوع" && "bg-moss/25 text-olive",
                      b.status === "تحت الطبع" && "bg-gold/15 text-gold",
                      b.status === "مخطوط" && "bg-card2 text-faint"
                    )}>
                      {b.status}
                    </span>
                  </div>
                  <p className="num mt-2 text-[10.5px] text-faint">{toAr(b.pages)} صفحة · {b.formats.join(" · ")}</p>
                  <div className="mt-2.5 flex items-center gap-1.5">
                    <DlBtn name={b.title} className="flex-1 justify-center !px-2" />
                    <FavBtn id={b.id} className="!p-1.5" />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {/* خشبة الرف */}
      <div className="mx-auto mt-0 h-2.5 max-w-7xl rounded-full bg-gradient-to-l from-moss/60 via-olive/40 to-moss/60 md:mx-[max(2rem,calc((100vw-80rem)/2+2rem))]" aria-hidden="true" />
    </section>
  );
}

/* ═══════════ ٩) المحاضرات — خط زمني هجري ═══════════ */

export function LecturesTimeline() {
  const { ref, on } = useInView<HTMLDivElement>();
  return (
    <section id="lectures" className="relative scroll-mt-24">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <SectionHead kicker="لقاءات ومجالس" title="المحاضرات" desc="خط زمني بالتاريخ الهجري." count={toAr(lectures.length)} />

        <div ref={ref} className="relative mt-10 mr-3 border-r-2 border-line pr-8 md:mr-6 md:pr-12">
          {lectures.map((l, i) => (
            <div key={l.id} className={cx("rv relative pb-10 last:pb-0", on && "on")} style={{ ["--d" as string]: `${i * 110}ms` }}>
              {/* عقدة النقش على الخط */}
              <span className="absolute -right-[2.85rem] top-0 grid h-9 w-9 place-items-center rounded-full border border-line bg-base md:-right-[3.85rem]">
                <Khatam size={22} progress={1} tone="var(--gold)" />
              </span>
              <article className="card-lift max-w-2xl rounded-2xl border border-line bg-card p-5">
                <div className="flex flex-wrap items-center gap-2 text-[11px]">
                  <span className="num rounded-full bg-gold/12 px-2.5 py-1 font-bold text-gold">{l.hijri}</span>
                  <span className="text-faint">{l.org}</span>
                  <span className="text-faint">· {l.place}</span>
                </div>
                <h3 className="mt-2.5 font-display text-xl font-bold text-ink">{l.title}</h3>
                <div className="mt-3.5 flex items-center gap-2">
                  <div className="flex-1">
                    <MiniBar track={{ id: l.id, title: l.title, kind: "lecture", from: l.org, duration: l.dur }} tone={330 + i * 22} />
                  </div>
                  <DlBtn name={l.title} className="hidden sm:flex" />
                </div>
              </article>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════ ١٠) اليوميات — بطاقات نصية كثيفة ═══════════ */

export function DiaryGrid() {
  const { ref, on } = useInView<HTMLDivElement>();
  return (
    <section id="diary" className="relative scroll-mt-24">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <SectionHead kicker="من دفتر الشيخ" title="اليوميات" desc="خواطر قصيرة وتعليقات على الأحداث — نص فقط، كما تُكتب." count={toAr(diary.length)} />
        <div ref={ref} className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {diary.map((d, i) => (
            <div key={d.id} className={cx("rv", on && "on")} style={{ ["--d" as string]: `${(i % 3) * 100}ms` }}>
              <article className="card-lift group h-full rounded-2xl border border-line bg-card p-5">
                <div className="flex items-center justify-between">
                  <span className="num text-[11px] font-semibold text-gold">{d.hijri}</span>
                  <span className="rounded-full border border-line px-2.5 py-0.5 text-[10px] text-faint transition-colors group-hover:border-gold/50 group-hover:text-gold">{d.tag}</span>
                </div>
                <p className="mt-3 text-[13.5px] leading-[1.9] text-mute transition-colors group-hover:text-ink">{d.text}</p>
              </article>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════ نموذج السؤال — بحالات حية وارتجاع فوري ═══════════ */

function AskForm() {
  const [text, setText] = useState("");
  const [phase, setPhase] = useState<"idle" | "sending" | "sent">("idle");
  const [shake, setShake] = useState(0);
  const [touched, setTouched] = useState(false);

  const short = text.trim().length < 12;

  const send = () => {
    if (phase !== "idle") return;
    if (short) {
      setTouched(true);
      setShake((s) => s + 1);
      return;
    }
    setPhase("sending");
    window.setTimeout(() => {
      setPhase("sent");
      setText("");
      setTouched(false);
    }, 950);
  };

  if (phase === "sent") {
    return (
      <div className="mt-4 rounded-xl border border-moss/50 bg-moss/15 px-4 py-5 text-center" style={{ animation: "rise 0.5s var(--ease-soft) both" }}>
        <span className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-moss/25 text-olive" style={{ animation: "popin 0.5s var(--ease-snap) both" }}>
          {I.check()}
        </span>
        <p className="mt-2.5 text-sm font-semibold text-ink">وصل سؤالك إلى مكتب الشيخ</p>
        <p className="mt-1 text-[11px] leading-relaxed text-mute">يُراجَع في مجلس الفتوى، وتُنشر الخلاصة إن كان مما يعمّ به البلوى.</p>
        <button
          onClick={() => setPhase("idle")}
          className="btn-press mt-3.5 rounded-full border border-line px-4 py-1.5 text-[11px] font-semibold text-mute transition-colors hover:border-gold/60 hover:text-gold"
        >
          إرسال سؤال آخر
        </button>
      </div>
    );
  }

  return (
    <div>
      <div key={shake} className={cx(shake > 0 && touched && short && "shake")}>
        <textarea
          rows={4}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            if (touched && e.target.value.trim().length >= 12) setTouched(false);
          }}
          placeholder="اكتب سؤالك هنا… (اثنا عشر حرفًا على الأقل)"
          className={cx(
            "mt-4 w-full resize-none rounded-xl border bg-card2/60 px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-faint",
            touched && short ? "border-gold/70" : "border-line focus:border-gold/60"
          )}
          aria-label="نص السؤال"
        />
      </div>
      {touched && short && (
        <p className="mt-1.5 text-[11px] font-medium text-gold" style={{ animation: "fadein 0.4s both" }}>
          أطل السؤال قليلًا ليُفهم مرادك — اثنا عشر حرفًا على الأقل.
        </p>
      )}
      <button
        onClick={send}
        disabled={phase === "sending"}
        className="btn-press sheen mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-gold py-3 text-sm font-bold text-base shadow-md shadow-gold/20 disabled:opacity-80"
      >
        {phase === "sending" ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" />
            جارٍ الإرسال…
          </>
        ) : (
          "إرسال إلى مكتب الشيخ"
        )}
      </button>
    </div>
  );
}
