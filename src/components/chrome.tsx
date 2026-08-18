import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  KIND_LABEL, SUGGESTIONS, books, fatawa, khutab, lectures, rudad,
  searchIndex, seriesList, type Kind, type SearchItem,
} from "../data/content";
import { cx, hijriToday, normalizeAr, toAr, useInView, useScrolled, useScrollProgress } from "../lib/utils";
import { useFav, useUI } from "../state/store";
import { Flourish, Khatam, Mashrabiya } from "./ornament";

/* ═══════════ مخطوطة الاسم (البديل النصي الفاخر) ═══════════ */

export function NameMark({ compact = false }: { compact?: boolean }) {
  const [animate, setAnimate] = useState(false);
  useEffect(() => {
    try {
      if (!sessionStorage.getItem("sudai:seen")) {
        setAnimate(true);
        sessionStorage.setItem("sudai:seen", "1");
      }
    } catch { /* noop */ }
  }, []);

  const word = (w: string, i: number, cls?: string) => (
    <span
      key={i}
      className={cx("inline-block", cls)}
      style={
        animate
          ? { opacity: 0, animation: `rise 0.7s var(--ease-soft) ${0.15 + i * 0.12}s forwards` }
          : undefined
      }
    >
      {w}
    </span>
  );

  return (
    <div className={compact ? "leading-none" : "text-center md:text-right"}>
      <p className={cx("font-semibold tracking-[0.3em] text-mute", compact ? "text-[9px]" : "text-[11px] md:text-xs")}>
        {word("فضيلة الشيخ", 0)}
        <span className="mx-2 text-gold">✦</span>
        {word("أبو عمرو", 1)}
      </p>
      <h1 className={cx("font-khat font-bold text-ink", compact ? "text-xl md:text-2xl mt-1" : "text-4xl md:text-5xl mt-2")}>
        {word("نور", 2)}&nbsp;{word("الدين", 3)}&nbsp;
        <span className="text-gold">{word("السدعي", 4)}</span>
      </h1>
      <div
        className={cx("overflow-hidden", compact ? "mt-1 h-[10px]" : "mt-2 h-3")}
        style={animate ? { opacity: 0, animation: "fadein 0.6s var(--ease-soft) 0.9s forwards" } : undefined}
      >
        <Flourish className="mx-auto md:mx-0" />
      </div>
    </div>
  );
}

/* ═══════════ أيقونات SVG صغيرة ═══════════ */

export const I = {
  home: (c?: string) => (
    <svg className={c} width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h5v-6h4v6h5V9.5" />
    </svg>
  ),
  series: (c?: string) => (
    <svg className={c} width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5v14Z" /><path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5" /><path d="M9 7h7M9 11h5" />
    </svg>
  ),
  search: (c?: string) => (
    <svg className={c} width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true">
      <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
    </svg>
  ),
  library: (c?: string) => (
    <svg className={c} width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 3v18M9.5 3v18M14 3l4.5 1.5L16 21l-4.5-1.5" />
    </svg>
  ),
  user: (c?: string) => (
    <svg className={c} width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="8" r="4" /><path d="M4.5 21c1.2-3.6 4-5.5 7.5-5.5s6.3 1.9 7.5 5.5" />
    </svg>
  ),
  play: (c?: string) => (
    <svg className={c} width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M8 5.5v13c0 .8.9 1.3 1.6.9l10-6.5c.6-.4.6-1.4 0-1.8l-10-6.5c-.7-.4-1.6.1-1.6.9Z" />
    </svg>
  ),
  pause: (c?: string) => (
    <svg className={c} width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" />
    </svg>
  ),
  dl: (c?: string) => (
    <svg className={c} width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3v11m0 0 4-4m-4 4-4-4" /><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
    </svg>
  ),
  check: (c?: string) => (
    <svg className={c} width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m4.5 12.5 5 5 10-11" />
    </svg>
  ),
  close: (c?: string) => (
    <svg className={c} width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  ),
  heart: (filled: boolean, c?: string) => (
    <svg className={c} width="17" height="17" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 20.5s-7.5-4.6-9.3-9.2C1.5 8 3.4 4.9 6.6 4.9c2 0 3.5 1 4.4 2.4.4.6 1.6.6 2 0 .9-1.4 2.4-2.4 4.4-2.4 3.2 0 5.1 3.1 3.9 6.4-1.8 4.6-9.3 9.2-9.3 9.2Z" />
    </svg>
  ),
  chevron: (c?: string) => (
    <svg className={c} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m6 9 6 6 6-6" />
    </svg>
  ),
};

/* ═══════════ الرأس ═══════════ */

const NAV = [
  { label: "السلاسل", href: "#series" },
  { label: "الفتاوى", href: "#fatwa" },
  { label: "الردود", href: "#radd" },
  { label: "المقالات", href: "#articles" },
  { label: "المكتبة", href: "#library" },
  { label: "وثيقة P0", href: "#p0" },
];

export function Header() {
  const scrolled = useScrolled(40);
  const progress = useScrollProgress();
  const { favs } = useFav();
  const { setSearchOpen, setAccOpen, theme, setTheme } = useUI();

  return (
    <header
      className={cx(
        "fixed inset-x-0 top-0 z-40 transition-all duration-500",
        scrolled ? "bg-base/90 shadow-lg shadow-black/10 backdrop-blur-md" : "bg-transparent"
      )}
      style={{ animation: "rise 0.7s var(--ease-soft) both" }}
    >
      {/* خيط تقدم القراءة */}
      <div className="absolute inset-x-0 top-0 h-[2.5px] bg-transparent">
        <div className="h-full origin-right bg-gold transition-[width] duration-150" style={{ width: `${progress * 100}%` }} />
      </div>

      <div className={cx("mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 transition-all duration-500 md:px-8", scrolled ? "h-16" : "h-24")}>
        <a href="#top" className="shrink-0" aria-label="الرئيسية">
          <NameMark compact />
        </a>

        <nav className="hidden items-center gap-6 lg:flex" aria-label="التنقل الرئيسي">
          {NAV.map((n) => (
            <a key={n.href} href={n.href} className="link-line text-sm font-medium text-mute transition-colors hover:text-ink">
              {n.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSearchOpen(true)}
            className="btn-press flex items-center gap-2 rounded-full border border-line bg-card px-3 py-2 text-sm text-mute hover:border-gold/60 hover:text-ink"
            aria-label="فتح البحث"
          >
            {I.search("text-gold")}
            <span className="hidden sm:inline">ابحث…</span>
          </button>

          {/* مفتاح المقترحين البصريين أ / ب */}
          <button
            onClick={() => setTheme(theme === "a" ? "b" : "a")}
            className="btn-press flex items-center gap-1.5 rounded-full border border-line bg-card p-1.5"
            title={theme === "a" ? "المقترح ب: عاجي النهار" : "المقترح أ: حبر الليل"}
            aria-label="تبديل السمة البصرية"
          >
            <span className={cx("h-4 w-4 rounded-full border transition-all", theme === "a" ? "border-gold bg-[#0b1512] shadow-[0_0_0_2px_var(--glow)]" : "border-line bg-transparent")} aria-hidden="true" />
            <span className={cx("h-4 w-4 rounded-full border transition-all", theme === "b" ? "border-gold bg-[#f2ecdc] shadow-[0_0_0_2px_var(--glow)]" : "border-line bg-transparent")} aria-hidden="true" />
          </button>

          <button
            onClick={() => setAccOpen(true)}
            className="btn-press relative rounded-full border border-line bg-card p-2.5 text-mute hover:border-gold/60 hover:text-ink"
            aria-label="حسابي"
          >
            {I.user()}
            {favs.length > 0 && (
              <span className="num absolute -left-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-gold px-1 text-[10px] font-bold text-base" style={{ animation: "popin 0.4s var(--ease-snap)" }}>
                {toAr(favs.length)}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* الفاصل الزخرفي يُرسم عند التحميل */}
      <div className={cx("mx-auto max-w-7xl px-8 transition-opacity duration-500", scrolled ? "opacity-0" : "opacity-100")}>
        <div className="h-px bg-gradient-to-l from-transparent via-line to-transparent" />
      </div>
    </header>
  );
}

/* ═══════════ الشريط السفلي للجوال ═══════════ */

export function MobileBar() {
  const { setSearchOpen, setAccOpen } = useUI();
  const [active, setActive] = useState("home");
  const Item = ({ id, label, icon, href, onClick }: { id: string; label: string; icon: ReactNode; href?: string; onClick?: () => void }) => {
    const isA = active === id;
    const cls = cx(
      "btn-press relative flex min-h-12 flex-1 flex-col items-center justify-center gap-0.5 text-[10.5px] font-medium transition-colors",
      isA ? "text-gold" : "text-mute"
    );
    const inner = (
      <>
        {icon}
        <span>{label}</span>
        <span
          className={cx("absolute top-0 h-[2.5px] rounded-b-full bg-gold transition-all duration-500", isA ? "w-8 opacity-100" : "w-0 opacity-0")}
          aria-hidden="true"
        />
      </>
    );
    if (href) return <a href={href} onClick={() => setActive(id)} className={cls} aria-current={isA}>{inner}</a>;
    return <button onClick={() => { setActive(id); onClick?.(); }} className={cls} aria-current={isA}>{inner}</button>;
  };

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-base/95 backdrop-blur-md md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)", animation: "rise 0.6s var(--ease-soft) 0.3s both" }}
      aria-label="التنقل السريع"
    >
      <div className="flex">
        <Item id="home" label="الرئيسية" icon={I.home()} href="#top" />
        <Item id="series" label="السلاسل" icon={I.series()} href="#series" />
        <Item id="search" label="بحث" icon={I.search()} onClick={() => setSearchOpen(true)} />
        <Item id="library" label="المكتبة" icon={I.library()} href="#library" />
        <Item id="account" label="حسابي" icon={I.user()} onClick={() => setAccOpen(true)} />
      </div>
    </nav>
  );
}

/* ═══════════ ورقة سفلية عامة ═══════════ */

export function Sheet({ open, onClose, title, children, wide = false }: {
  open: boolean; onClose: () => void; title: string; children: ReactNode; wide?: boolean;
}) {
  const { ref, on } = useInView<HTMLDivElement>("0px");
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center" role="dialog" aria-modal="true" aria-label={title}>
      <button className="absolute inset-0 bg-black/65" style={{ animation: "fadein 0.3s both" }} onClick={onClose} aria-label="إغلاق" />
      <div
        ref={ref}
        className={cx(
          "rv on relative max-h-[88vh] w-full overflow-y-auto rounded-t-3xl border border-line bg-card shadow-2xl md:rounded-3xl",
          wide ? "md:max-w-3xl" : "md:max-w-xl"
        )}
        style={{ animation: "sheetup 0.45s var(--ease-soft) both" }}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-card/95 px-5 py-4 backdrop-blur">
          <h3 className="font-display text-xl font-bold text-ink">{title}</h3>
          <button onClick={onClose} className="btn-press rounded-full border border-line p-2 text-mute hover:text-ink" aria-label="إغلاق">
            {I.close()}
          </button>
        </div>
        <div className="px-5 py-5">{children}</div>
        <span className={cx("pointer-events-none absolute inset-x-0 bottom-2 mx-auto h-1 w-12 rounded-full bg-line", on ? "" : "")} />
      </div>
    </div>
  );
}

/* ═══════════ البحث الذكي ═══════════ */

const KIND_SECTION: Record<Kind, string> = {
  series: "series", lesson: "series", khutbah: "khutab", lecture: "lectures",
  article: "articles", radd: "radd", fatwa: "fatwa", diary: "diary", library: "library",
};

export function SearchOverlay() {
  const { searchOpen, setSearchOpen } = useUI();
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen) setTimeout(() => inputRef.current?.focus(), 80);
  }, [searchOpen]);

  const results = useMemo(() => {
    const nq = normalizeAr(q);
    if (nq.length < 2) return null;
    const hits = searchIndex.filter(
      (it) =>
        normalizeAr(it.title).includes(nq) ||
        normalizeAr(it.extra).includes(nq) ||
        it.tags.some((t) => normalizeAr(t).includes(nq))
    );
    const groups = new Map<Kind, SearchItem[]>();
    hits.forEach((h) => groups.set(h.kind, [...(groups.get(h.kind) || []), h]));
    return groups;
  }, [q]);

  if (!searchOpen) return null;

  const total = results ? [...results.values()].reduce((s, g) => s + g.length, 0) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto px-4 pt-[8vh]" role="dialog" aria-modal="true" aria-label="البحث">
      <button className="fixed inset-0 bg-black/70" style={{ animation: "fadein 0.3s both" }} onClick={() => setSearchOpen(false)} aria-label="إغلاق البحث" />
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-line bg-card shadow-2xl" style={{ animation: "rise 0.45s var(--ease-soft) both" }}>
        <div className="flex items-center gap-3 border-b border-line px-5 py-4">
          <span className="text-gold">{I.search()}</span>
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="ابحث في السلاسل والدروس والفتاوى والمتون…"
            className="flex-1 bg-transparent text-lg text-ink outline-none placeholder:text-faint"
            aria-label="نص البحث"
          />
          <button onClick={() => setSearchOpen(false)} className="btn-press rounded-full border border-line p-2 text-mute hover:text-ink" aria-label="إغلاق">
            {I.close()}
          </button>
        </div>

        <div className="max-h-[62vh] overflow-y-auto px-5 py-4">
          {!results && (
            <>
              <p className="mb-3 text-xs text-faint">عبارات شائعة</p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTIONS.map((s) => (
                  <button key={s} onClick={() => setQ(s)} className="btn-press rounded-full border border-line bg-card2 px-4 py-2 text-sm text-mute hover:border-gold/60 hover:text-ink">
                    {s}
                  </button>
                ))}
              </div>
              <p className="mt-6 flex items-center gap-2 rounded-xl border border-dashed border-line bg-card2/60 px-4 py-3 text-xs leading-relaxed text-mute">
                <Khatam size={22} progress={1} tone="var(--gold)" />
                البحث يطبّع النص العربي: يتجاهل التشكيل، ويوحّد الهمزات والتاء المربوطة والألف المقصورة — البحث عن «الايمان» يجد «الإيمَان».
              </p>
            </>
          )}

          {results && (
            <>
              <p className="mb-4 text-sm text-mute">
                <span className="num font-semibold text-gold">{toAr(total)}</span> نتيجة عن «{q}»
              </p>
              {total === 0 && (
                <div className="flex flex-col items-center gap-3 py-10 text-center">
                  <Khatam size={70} progress={0} draw on spin tone="var(--faint)" />
                  <p className="text-mute">لا نتائج مطابقة — جرّد الكلمة من التشكيل أو جرّب مرادفًا.</p>
                </div>
              )}
              {[...results.entries()].map(([kind, items]) => (
                <div key={kind} className="mb-4">
                  <p className="mb-2 flex items-center gap-2 text-xs font-semibold tracking-widest text-gold">
                    <span className="h-px w-5 bg-gold/50" />
                    {KIND_LABEL[kind]} <span className="num text-faint">({toAr(items.length)})</span>
                  </p>
                  <ul className="space-y-1.5">
                    {items.slice(0, 6).map((it) => (
                      <li key={it.id}>
                        <button
                          onClick={() => {
                            setSearchOpen(false);
                            setQ("");
                            document.getElementById(KIND_SECTION[it.kind])?.scrollIntoView({ behavior: "smooth" });
                          }}
                          className="btn-press group flex w-full items-start gap-3 rounded-xl border border-transparent bg-card2/50 px-3.5 py-2.5 text-right transition-colors hover:border-gold/40 hover:bg-card2"
                        >
                          <span className="mt-0.5 text-gold opacity-60 transition-opacity group-hover:opacity-100">✦</span>
                          <span>
                            <span className="block text-sm font-medium leading-relaxed text-ink">{it.title}</span>
                            <span className="block text-xs text-faint">{it.extra}</span>
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════ صفحة «حسابي» ═══════════ */

export function AccountSheet() {
  const { accOpen, setAccOpen, theme, setTheme, motion, setMotion, fontScale, setFontScale } = useUI();
  const { favs, toggle } = useFav();

  const favItems = useMemo(() => favs.map((id) => searchIndex.find((s) => s.id === id)).filter(Boolean) as SearchItem[], [favs]);

  return (
    <Sheet open={accOpen} onClose={() => setAccOpen(false)} title="حسابي" wide>
      <div className="grid gap-8 md:grid-cols-2">
        {/* المفضلة */}
        <section>
          <h4 className="mb-3 flex items-center gap-2 font-semibold text-ink">
            <span className="text-gold">{I.heart(true)}</span> المفضّلة <span className="num text-xs text-faint">({toAr(favItems.length)})</span>
          </h4>
          {favItems.length === 0 ? (
            <p className="rounded-xl border border-dashed border-line bg-card2/50 px-4 py-6 text-center text-sm text-mute">
              لم تحفظ شيئًا بعد — اضغط أيقونة القلب على أي مادة.
            </p>
          ) : (
            <ul className="space-y-2">
              {favItems.map((it) => (
                <li key={it.id} className="flex items-center justify-between gap-2 rounded-xl border border-line bg-card2/60 px-3.5 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">{it.title}</p>
                    <p className="text-[11px] text-faint">{KIND_LABEL[it.kind]}</p>
                  </div>
                  <button onClick={() => toggle(it.id)} className="btn-press shrink-0 rounded-full p-1.5 text-gold" aria-label="إزالة من المفضلة">
                    {I.heart(true)}
                  </button>
                </li>
              ))}
            </ul>
          )}

          {/* تقدم السلاسل */}
          <h4 className="mb-3 mt-8 font-semibold text-ink">تقدّمي في السلاسل</h4>
          <ul className="space-y-3">
            {seriesList.slice(0, 4).map((s) => (
              <li key={s.id}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="truncate font-medium text-mute">{s.title}</span>
                  <span className="num shrink-0 text-faint">{toAr(s.done)} / {toAr(s.total)}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-line">
                  <div className="h-full rounded-full bg-gold transition-[width] duration-1000" style={{ width: `${(s.done / s.total) * 100}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* التفضيلات */}
        <section>
          <h4 className="mb-3 font-semibold text-ink">تفضيلات القراءة</h4>

          <label className="mb-1.5 block text-xs text-mute">حجم الخط الأساس <span className="num text-gold">({toAr(fontScale)})</span></label>
          <input
            type="range" min={14} max={20} step={1} value={fontScale}
            onChange={(e) => setFontScale(Number(e.target.value))}
            className="seek w-full" style={{ ["--fill" as string]: `${((fontScale - 14) / 6) * 100}%` }}
            aria-label="حجم الخط"
          />

          <p className="mb-1.5 mt-6 text-xs text-mute">شدة الحركة</p>
          <div className="flex gap-1.5 rounded-xl border border-line bg-card2/50 p-1.5">
            {([["full", "كاملة"], ["light", "خفيفة"], ["off", "معطّلة"]] as const).map(([v, l]) => (
              <button
                key={v}
                onClick={() => setMotion(v)}
                className={cx("btn-press flex-1 rounded-lg py-2 text-xs font-semibold transition-colors", motion === v ? "bg-gold text-base" : "text-mute hover:text-ink")}
              >
                {l}
              </button>
            ))}
          </div>

          <p className="mb-1.5 mt-6 text-xs text-mute">المقترح البصري</p>
          <div className="flex gap-1.5 rounded-xl border border-line bg-card2/50 p-1.5">
            <button onClick={() => setTheme("a")} className={cx("btn-press flex-1 rounded-lg py-2 text-xs font-semibold transition-colors", theme === "a" ? "bg-gold text-base" : "text-mute hover:text-ink")}>
              أ — حبر الليل
            </button>
            <button onClick={() => setTheme("b")} className={cx("btn-press flex-1 rounded-lg py-2 text-xs font-semibold transition-colors", theme === "b" ? "bg-gold text-base" : "text-mute hover:text-ink")}>
              ب — عاجي النهار
            </button>
          </div>

          <div className="mt-8 rounded-2xl border border-gold/30 bg-card2/60 p-4">
            <p className="flex items-center gap-2 text-sm font-semibold text-ink"><span className="text-gold">✦</span> الاستئناف الذكي</p>
            <p className="mt-1.5 text-xs leading-relaxed text-mute">
              يُحفظ آخر موضع لك في كل مادة محليًا على هذا الجهاز، ويُزامَن تلقائيًا لحسابك فور تفعيل التسجيل في المرحلة القادمة.
            </p>
          </div>
        </section>
      </div>
    </Sheet>
  );
}

/* ═══════════ التذييل ═══════════ */

export function Footer() {
  return (
    <footer className="relative mt-24 overflow-hidden border-t border-line bg-card">
      <Mashrabiya opacity={0.35} />
      <div className="relative mx-auto max-w-7xl px-4 py-14 md:px-8">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <NameMark />
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-mute">
              منصة علمية تعنى بإيصال طالب العلم إلى المادة الصحيحة في أقل عدد نقرات،
              ثم إبقائه داخل السلسلة حتى يتمّها.
            </p>
          </div>
          <nav aria-label="أقسام الموقع">
            <p className="mb-3 text-xs font-bold tracking-[0.2em] text-gold">الأقسام</p>
            <ul className="space-y-2 text-sm text-mute">
              {NAV.map((n) => (
                <li key={n.href}><a className="link-line hover:text-ink" href={n.href}>{n.label}</a></li>
              ))}
              <li><a className="link-line hover:text-ink" href="#khutab">الخطب</a></li>
              <li><a className="link-line hover:text-ink" href="#diary">اليوميات</a></li>
            </ul>
          </nav>
          <div>
            <p className="mb-3 text-xs font-bold tracking-[0.2em] text-gold">التواصل</p>
            <ul className="space-y-2 text-sm text-mute">
              <li>البريد العلمي: ilm@sudai.example</li>
              <li>تغذية RSS الصوتية لكل سلسلة</li>
              <li>إرسال سؤال — يصل للشيخ كمسودة فتوى</li>
            </ul>
            <p className="mt-5 text-xs text-faint">{hijriToday()}</p>
          </div>
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-line pt-6 text-xs text-faint md:flex-row">
          <p>المنصة العلمية لفضيلة الشيخ أبي عمرو نور الدين السدعي — نسخة العرض التأسيسية P0</p>
          <p className="num">حقل التخريج ودرجة الحديث والحكم الشرعي تُملأ يدويًا من الشيخ فقط</p>
        </div>
      </div>
    </footer>
  );
}

/* عناصر مساعدة مشتركة تُستخدم في الأقسام */
export { books, fatawa, khutab, lectures, rudad };
