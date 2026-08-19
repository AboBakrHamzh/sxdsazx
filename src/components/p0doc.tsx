import { useEffect, useState } from "react";
import { cx, toAr, useInView } from "../lib/utils";
import { I } from "./chrome";
import { Corners, Khatam, SectionHead } from "./ornament";

/* ═══════════ ١١) وثيقة P0 — سجل القرارات المؤسسة ═══════════ */

interface Row { t: string; d: string }

const ROWS: Row[] = [
  {
    t: "أقل عدد نقرات",
    d: "التشغيل يبدأ من البطاقة نفسها، ومن نتيجة البحث مباشرة — لا صفحة وسيطة للمادة، ولا نافذة تعترض المستمع.",
  },
  {
    t: "الاستئناف الذكي",
    d: "آخر موضع في كل مادة يُحفظ محليًا على الجهاز، ويُعرض في الافتتاحية شريط «تابع من حيث توقفت» ببقية الزمن محسوبة.",
  },
  {
    t: "الخاتم مقياسًا للتقدم",
    d: "النجمة الثمانية تملأ أسافينها كلما أتم الطالب درسًا — التقدم يُرى بعينه، لا برقم مجرد في زاوية.",
  },
  {
    t: "مشغل مستمر",
    d: "شريط سفلي ثابت بقائمة تشغيل وسرعات ومستوى صوت، لا ينقطع بالتنقل بين الأقسام ولا بإغلاق الأوراق.",
  },
  {
    t: "تحميل حقيقي",
    d: "زر التحميل يولّد ملفًا صوتيًا فعليًا في المتصفح وينزّله — الحالة تمر بتجهيز ثم تأكيد، لا نقرة صامتة.",
  },
  {
    t: "بحث عربي متسامح",
    d: "تطبيع كامل للنص: تجاهل التشكيل، وتوحيد الهمزات والتاء المربوطة والألف المقصورة — البحث عن كلمة مجرّدة يجد مشكولة.",
  },
  {
    t: "مقترحان وحركة مضبوطة",
    d: "سمتان بصريتان تُبدّلان فوريًا، وثلاث درجات لكثافة الحركة مع احترام تفضيل النظام تلقائيًا.",
  },
  {
    t: "التحرير بيد الشيخ وحده",
    d: "لا يُنشر تخريج حديث ولا حكم شرعي آليًا — الحقول الحساسة تنتظر قلمه، والمنصة تعرض ما اعتمده فقط.",
  },
];

export function P0Doc() {
  const { ref, on } = useInView<HTMLDivElement>();
  const [step, setStep] = useState(0);
  const [ran, setRan] = useState(false);

  /* فحص المنجز: يضيء البنود واحدًا واحدًا عند الظهور */
  useEffect(() => {
    if (!on || !ran || step >= ROWS.length) return;
    const t = window.setTimeout(() => setStep((s) => s + 1), step === 0 ? 420 : 340);
    return () => window.clearTimeout(t);
  }, [on, ran, step]);

  useEffect(() => {
    if (on && !ran) {
      const t = window.setTimeout(() => setRan(true), 500);
      return () => window.clearTimeout(t);
    }
  }, [on, ran]);

  const replay = () => {
    setStep(0);
    setRan(false);
    window.setTimeout(() => setRan(true), 60);
  };

  const done = step >= ROWS.length;

  return (
    <section id="p0" className="relative scroll-mt-24 overflow-hidden">
      <div className="pointer-events-none absolute -left-32 top-10 h-96 w-96 rounded-full opacity-50 blur-3xl" style={{ background: "radial-gradient(circle, var(--glow), transparent 70%)" }} aria-hidden="true" />
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <SectionHead
          kicker="وثيقة العرض التأسيسية"
          title="قرارات P0 الثمانية"
          desc="ما التزمت به هذه النسخة منذ يومها الأول — وكل بند فيها منفّذ وتراه يعمل في الصفحة نفسها."
          count={toAr(ROWS.length)}
        />

        <div ref={ref} className="mt-10 grid gap-8 lg:grid-cols-[330px_1fr]">
          {/* لوحة الفحص */}
          <aside className={cx("rv h-fit lg:sticky lg:top-28", on && "on")}>
            <div className="doc-paper relative rounded-sm p-6">
              <Corners tone="rgba(143,115,57,0.85)" />
              <div className="flex items-center gap-3">
                <Khatam size={46} progress={step / ROWS.length} draw on tone="rgba(143,115,57,0.9)" />
                <div>
                  <p className="font-display text-lg font-bold leading-tight text-[#182720]">فحص المنجز</p>
                  <p className="num text-[11px] text-[#22302a]/60">
                    {toAr(Math.min(step, ROWS.length))} من {toAr(ROWS.length)} بنود
                  </p>
                </div>
              </div>

              {/* شرائح التقدم — ثمانية أسافين أفقية */}
              <div className="mt-5 flex gap-1" aria-hidden="true">
                {ROWS.map((_, i) => (
                  <span
                    key={i}
                    className="h-2 flex-1 rounded-sm transition-all duration-500"
                    style={{
                      background: i < step ? "rgba(143,115,57,0.85)" : "rgba(34,48,42,0.14)",
                      transitionTimingFunction: "var(--ease-soft)",
                      transitionDelay: `${i * 40}ms`,
                    }}
                  />
                ))}
              </div>

              <p className="mt-5 text-[13px] leading-[1.9] text-[#22302a]/80">
                هذه النسخة تُعرض على الشيخ قبل ربطها بأي خادم؛ كل ما تراه يعمل محليًا في المتصفح:
                التشغيل، والمواضع المحفوظة، والمفضلة، والتحميلات، والسمتان، وكثافة الحركة.
              </p>

              <button
                onClick={replay}
                className={cx(
                  "btn-press mt-5 flex w-full items-center justify-center gap-2 rounded-full py-3 text-sm font-bold transition-colors",
                  done ? "bg-[#2e4a3b] text-[#efe6cf]" : "bg-[#8f7339] text-[#f7f0dd]"
                )}
              >
                {done ? I.check() : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M20 12a8 8 0 1 1-2.3-5.6" /><path d="M20 3v4h-4" />
                  </svg>
                )}
                {done ? "اكتمل الفحص — إعادة" : "تشغيل فحص المنجز"}
              </button>
            </div>
          </aside>

          {/* البنود */}
          <ol className="space-y-3">
            {ROWS.map((r, i) => {
              const checked = i < step;
              return (
                <li key={r.t} className={cx("rv", on && "on")} style={{ ["--d" as string]: `${i * 70}ms` }}>
                  <div
                    className={cx(
                      "group flex items-start gap-4 rounded-2xl border bg-card p-5 transition-all duration-500 md:items-center",
                      checked ? "border-gold/45" : "border-line"
                    )}
                    style={{ transitionTimingFunction: "var(--ease-soft)" }}
                  >
                    <span
                      className={cx(
                        "num shrink-0 font-display text-3xl font-bold leading-none transition-colors duration-500 md:text-4xl",
                        checked ? "text-gold" : "text-line group-hover:text-faint"
                      )}
                      aria-hidden="true"
                    >
                      {toAr(i + 1).padStart(2, "٠")}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className={cx("font-display text-lg font-bold transition-colors duration-500", checked ? "text-ink" : "text-mute")}>
                        {r.t}
                      </h3>
                      <p className="mt-1 text-[13px] leading-relaxed text-mute">{r.d}</p>
                    </div>
                    <span
                      className={cx(
                        "grid h-8 w-8 shrink-0 place-items-center rounded-full border transition-all duration-500",
                        checked ? "border-moss bg-moss/25 text-olive" : "border-line text-transparent"
                      )}
                    >
                      <span key={checked ? `y${i}` : `n${i}`} className="block" style={checked ? { animation: "popin 0.45s var(--ease-snap)" } : undefined}>
                        {I.check()}
                      </span>
                    </span>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
