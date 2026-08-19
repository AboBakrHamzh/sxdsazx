import { useEffect, useRef, useState } from "react";

/* ── الأرقام والصيغ ───────────────────────────────── */

export const toAr = (n: number | string): string =>
  typeof n === "number" ? n.toLocaleString("ar-EG") : n.replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[+d]);

export const fmtDur = (sec: number): string => {
  const m = Math.round(sec / 60);
  if (m < 60) return `${toAr(m)} د`;
  const h = Math.floor(m / 60);
  return `${toAr(h)} س ${toAr(m % 60)} د`;
};

export const fmtClock = (sec: number): string => {
  const s = Math.max(0, Math.floor(sec));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  const mm = h > 0 ? `${m.toString().padStart(2, "0")}` : `${m}`;
  return toAr(h > 0 ? `${h}:${mm}:${ss.toString().padStart(2, "0")}` : `${mm}:${ss.toString().padStart(2, "0")}`);
};

export const hijriToday = (): string => {
  try {
    return new Intl.DateTimeFormat("ar-SA-u-ca-islamic-umalqura", {
      weekday: "long", day: "numeric", month: "long", year: "numeric",
    }).format(new Date());
  } catch {
    return "";
  }
};

/* ── تطبيع النص العربي (القسم ١٢ من البريف) ───────── */

export const normalizeAr = (s: string): string =>
  s
    .replace(/[\u064B-\u0652\u0670\u0640]/g, "") // التشكيل والتطويل
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/ء/g, "ا")
    .toLowerCase()
    .trim();

/* ── الهوكس ───────────────────────────────────────── */

export function useInView<T extends HTMLElement>(margin = "-60px") {
  const ref = useRef<T | null>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") { setOn(true); return; }
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => { if (e.isIntersecting) { setOn(true); io.disconnect(); } }),
      { rootMargin: margin, threshold: 0.12 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [margin]);
  return { ref, on };
}

export function usePrefersReducedMotion(): boolean {
  const [prm, setPrm] = useState(
    () => typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  );
  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!mq) return;
    const fn = (e: MediaQueryListEvent) => setPrm(e.matches);
    mq.addEventListener?.("change", fn);
    return () => mq.removeEventListener?.("change", fn);
  }, []);
  return prm;
}

export function useScrolled(threshold = 30): boolean {
  const [sc, setSc] = useState(false);
  useEffect(() => {
    const fn = () => setSc(window.scrollY > threshold);
    fn();
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, [threshold]);
  return sc;
}

export function useScrollProgress(): number {
  const [p, setP] = useState(0);
  useEffect(() => {
    const fn = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      setP(max > 0 ? h.scrollTop / max : 0);
    };
    fn();
    window.addEventListener("scroll", fn, { passive: true });
    window.addEventListener("resize", fn);
    return () => { window.removeEventListener("scroll", fn); window.removeEventListener("resize", fn); };
  }, []);
  return p;
}

export function useCountUp(target: number, start: boolean, dur = 1400): number {
  const [v, setV] = useState(0);
  const prm = usePrefersReducedMotion();
  useEffect(() => {
    if (!start) return;
    if (prm) { setV(target); return; }
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const k = Math.min(1, (t - t0) / dur);
      setV(Math.round(target * (1 - Math.pow(1 - k, 3))));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [start, target, dur, prm]);
  return v;
}

/* ── تنزيل فعلي (ملف صوتي تجريبي مولّد) ───────────── */

export function downloadTrack(name: string, freq = 392, secs = 2.2): void {
  const sr = 22050;
  const n = Math.floor(sr * secs);
  const buf = new ArrayBuffer(44 + n * 2);
  const v = new DataView(buf);
  const ws = (o: number, s: string) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
  ws(0, "RIFF"); v.setUint32(4, 36 + n * 2, true); ws(8, "WAVE"); ws(12, "fmt ");
  v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
  v.setUint32(24, sr, true); v.setUint32(28, sr * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true);
  ws(36, "data"); v.setUint32(40, n * 2, true);
  for (let i = 0; i < n; i++) {
    const t = i / sr;
    const env = Math.min(1, t * 10) * Math.exp(-t * 1.6);
    const s =
      Math.sin(2 * Math.PI * freq * t) * 0.55 +
      Math.sin(2 * Math.PI * freq * 2.005 * t) * 0.22 +
      Math.sin(2 * Math.PI * freq * 3.01 * t) * 0.1;
    v.setInt16(44 + i * 2, s * env * 32767 * 0.55, true);
  }
  const url = URL.createObjectURL(new Blob([buf], { type: "audio/wav" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `${name.replace(/[^\u0600-\u06FF\s]/g, "").trim() || "مادة"}.wav`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

/* ── انزياح الطبقات مع المؤشر (بارالاكس_pointer) ─────── */

/* يثبت متغيّري ‎--px / --py (بين -1 و 1) على العنصر،
   والطبقات الداخلية تتحرك عبر calc(var(--px)*Npx) بلا إعادة تصيير */
export function usePointerParallax<T extends HTMLElement>(enabled: boolean) {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;
    if (typeof window === "undefined" || !window.matchMedia?.("(pointer: fine)").matches) return;
    let raf = 0;
    const mv = (e: PointerEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        const x = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width - 0.5) * 2));
        const y = Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height - 0.5) * 2));
        el.style.setProperty("--px", x.toFixed(3));
        el.style.setProperty("--py", y.toFixed(3));
      });
    };
    const leave = () => {
      el.style.setProperty("--px", "0");
      el.style.setProperty("--py", "0");
    };
    el.addEventListener("pointermove", mv, { passive: true });
    el.addEventListener("pointerleave", leave);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointermove", mv);
      el.removeEventListener("pointerleave", leave);
    };
  }, [enabled]);
  return ref;
}

export const cx = (...c: (string | false | null | undefined)[]): string => c.filter(Boolean).join(" ");

/* ── هوكس الحيوية (الدفعة الثانية) ─────────────────── */

export function useScrollY(): number {
  const [y, setY] = useState(0);
  useEffect(() => {
    let raf = 0;
    const fn = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setY(window.scrollY));
    };
    fn();
    window.addEventListener("scroll", fn, { passive: true });
    return () => { cancelAnimationFrame(raf); window.removeEventListener("scroll", fn); };
  }, []);
  return y;
}

/* تتبع القسم النشط أثناء التمرير (Scroll-spy) */
export function useActiveSection(ids: string[]): string {
  const [active, setActive] = useState("");
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (es) => {
        const vis = es.filter((e) => e.isIntersecting);
        if (vis.length) {
          vis.sort((a, b) => b.intersectionRatio - a.intersectionRatio);
          setActive(vis[0].target.id);
        }
      },
      { rootMargin: "-36% 0px -54% 0px", threshold: [0, 0.12, 0.35] }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids.join(",")]);
  return active;
}
