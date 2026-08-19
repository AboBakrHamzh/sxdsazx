import {
  useEffect, useRef, useState,
  type CSSProperties, type MouseEvent as RMouseEvent, type ReactNode, type RefObject,
} from "react";
import { cx, usePrefersReducedMotion } from "../lib/utils";
import { useUI } from "../state/store";

/* ═══════════════════════════════════════════════════════
   طبقات التفاعل مع المؤشر + الحركات الدائمة في الخلفية
   - TiltCard : بطاقة تميل ثلاثي الأبعاد نحو المؤشر مع توهج يتبعه
   - Magnetic : زر ينجذب مغناطيسيًا للمؤشر عند الاقتراب
   - SparkTrail : شرر ذهبي يتناثر مع حركة الفأرة + انفجار عند النقر
   - AmbientDust : غبار ذهبي دائم يطفو خلف كل الصفحة
   ═══════════════════════════════════════════════════════ */

const finePointer = () =>
  typeof window !== "undefined" && !!window.matchMedia?.("(pointer: fine)").matches;

/* ═══════════ بطاقة تميل نحو المؤشر مع توهج ═══════════ */

export function TiltCard({
  children, className, max = 7, glow = true,
}: { children: ReactNode; className?: string; max?: number; glow?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const prm = usePrefersReducedMotion();
  const { motion } = useUI();
  const enabled = motion !== "off" && !prm && finePointer();
  const [style, setStyle] = useState<CSSProperties>({});

  const onMove = (e: RMouseEvent<HTMLDivElement>) => {
    if (!enabled || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width; // 0..1
    const py = (e.clientY - r.top) / r.height;
    const rx = (0.5 - py) * max; // دوران حول المحور الأفقي
    const ry = (px - 0.5) * max; // دوران حول المحور العمودي
    setStyle({
      transform: `perspective(900px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) translateZ(0)`,
      ...(glow
        ? { ["--gx" as string]: `${(px * 100).toFixed(1)}%`, ["--gy" as string]: `${(py * 100).toFixed(1)}%` }
        : {}),
    });
  };

  const onLeave = () => setStyle({});

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={cx("tilt-card", glow && "tilt-glow", className)}
      style={{ ...style, transition: "transform 0.35s var(--ease-soft)" }}
    >
      {children}
    </div>
  );
}

/* ═══════════ زر مغناطيسي ينجذب للمؤشر ═══════════ */

export function Magnetic({
  children, className, strength = 0.35, radius = 90,
}: { children: ReactNode; className?: string; strength?: number; radius?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const prm = usePrefersReducedMotion();
  const { motion } = useUI();
  const enabled = motion !== "off" && !prm && finePointer();
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!enabled) return;
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const mv = (e: PointerEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        const cxp = r.left + r.width / 2;
        const cyp = r.top + r.height / 2;
        const dx = e.clientX - cxp;
        const dy = e.clientY - cyp;
        const dist = Math.hypot(dx, dy);
        if (dist < radius) {
          const pull = 1 - dist / radius; // أقرب = أقوى
          setOffset({ x: dx * strength * pull, y: dy * strength * pull });
        } else if (offset.x !== 0 || offset.y !== 0) {
          setOffset({ x: 0, y: 0 });
        }
      });
    };
    window.addEventListener("pointermove", mv, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", mv);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, strength, radius]);

  return (
    <div
      ref={ref}
      className={cx("magnetic", className)}
      style={{
        transform: `translate3d(${offset.x.toFixed(1)}px, ${offset.y.toFixed(1)}px, 0)`,
        transition: "transform 0.3s var(--ease-snap)",
        display: "inline-block",
      }}
    >
      {children}
    </div>
  );
}

/* ═══════════ شرر يتبع الفأرة + انفجار عند النقر ═══════════ */

interface Spark {
  x: number; y: number; vx: number; vy: number;
  life: number; decay: number; size: number; hue: number;
}

export function SparkTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prm = usePrefersReducedMotion();
  const { motion } = useUI();
  const enabled = motion === "full" && !prm && finePointer();
  const sparks = useRef<Spark[]>([]);
  const last = useRef({ x: 0, y: 0, t: 0 });

  useEffect(() => {
    if (!enabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let running = true;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const spawn = (x: number, y: number, n: number, power: number) => {
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2;
        const sp = (0.4 + Math.random() * 1.6) * power;
        sparks.current.push({
          x, y,
          vx: Math.cos(a) * sp,
          vy: Math.sin(a) * sp - 0.6 * power,
          life: 1,
          decay: 0.02 + Math.random() * 0.03,
          size: 1 + Math.random() * 2.2,
          hue: 38 + Math.random() * 18, // ذهبي دافئ
        });
      }
    };

    const onMove = (e: PointerEvent) => {
      const now = performance.now();
      const dx = e.clientX - last.current.x;
      const dy = e.clientY - last.current.y;
      const dist = Math.hypot(dx, dy);
      const dt = now - last.current.t;
      // نثر شرر حسب سرعة الحركة
      if (dist > 2 && dt > 16) {
        const speed = dist / Math.max(dt, 1);
        const n = Math.min(3, Math.floor(speed * 2));
        if (n > 0) spawn(e.clientX, e.clientY, n, 0.7);
        last.current = { x: e.clientX, y: e.clientY, t: now };
      }
    };

    const onClick = (e: PointerEvent) => spawn(e.clientX, e.clientY, 22, 2.4);

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onClick);

    const tick = () => {
      if (!running) return;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      const arr = sparks.current;
      for (let i = arr.length - 1; i >= 0; i--) {
        const s = arr[i];
        s.x += s.vx;
        s.y += s.vy;
        s.vy += 0.05; // جاذبية خفيفة
        s.vx *= 0.97;
        s.vy *= 0.97;
        s.life -= s.decay;
        if (s.life <= 0) { arr.splice(i, 1); continue; }
        ctx.globalAlpha = s.life;
        ctx.fillStyle = `hsl(${s.hue}, 82%, ${58 + s.life * 14}%)`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size * s.life, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onClick);
    };
  }, [enabled]);

  if (!enabled) return null;
  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[60]"
      aria-hidden="true"
    />
  );
}

/* ═══════════ غبار ذهبي دائم خلف كل الصفحة ═══════════ */

export function AmbientDust({ count = 26 }: { count?: number }) {
  const prm = usePrefersReducedMotion();
  const { motion } = useUI();
  const enabled = motion !== "off" && !prm;
  if (!enabled) return null;

  const motes = Array.from({ length: count }, (_, i) => ({
    id: i,
    left: (i * 37 + 13) % 100,
    size: 2 + ((i * 7) % 4),
    dur: 14 + ((i * 5) % 16),
    delay: -((i * 3) % 20),
    drift: ((i % 2 === 0 ? 1 : -1) * (20 + ((i * 11) % 40))),
    opacity: 0.18 + ((i * 13) % 30) / 100,
  }));

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      {motes.map((m) => (
        <span
          key={m.id}
          className="ambient-mote"
          style={{
            left: `${m.left}%`,
            width: m.size, height: m.size,
            opacity: m.opacity,
            animationDuration: `${m.dur}s`,
            animationDelay: `${m.delay}s`,
            ["--drift" as string]: `${m.drift}px`,
          }}
        />
      ))}
    </div>
  );
}

/* ═══════════ نجوم هندسية تنجرف ببطء خلف الصفحة كلها ═══════════ */

export function DriftingOrnaments() {
  const prm = usePrefersReducedMotion();
  const { motion } = useUI();
  const enabled = motion === "full" && !prm;
  if (!enabled) return null;

  const stars = [
    { top: "12%", right: "6%", size: 120, dur: 60, delay: 0, op: 0.05 },
    { top: "34%", right: "88%", size: 90, dur: 75, delay: -20, op: 0.045 },
    { top: "58%", right: "12%", size: 150, dur: 90, delay: -40, op: 0.04 },
    { top: "78%", right: "80%", size: 100, dur: 68, delay: -10, op: 0.05 },
    { top: "22%", right: "46%", size: 70, dur: 82, delay: -55, op: 0.035 },
  ];

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      {stars.map((st, i) => (
        <span
          key={i}
          className="drift-star absolute"
          style={{
            top: st.top, right: st.right, width: st.size, height: st.size,
            opacity: st.op,
            animationDuration: `${st.dur}s`,
            animationDelay: `${st.delay}s`,
          }}
        >
          <svg viewBox="0 0 100 100" width="100%" height="100%" fill="none" stroke="var(--gold)" strokeWidth="1.2">
            <path d="M50 4 L96 50 L50 96 L4 50 Z" />
            <path d="M17.5 17.5 H82.5 V82.5 H17.5 Z" />
            <circle cx="50" cy="50" r="13" />
          </svg>
        </span>
      ))}
    </div>
  );
}

/* ═══════════ هالة تتحرك مع المؤشر فوق البطاقات ═══════════ */

/* غلاف يضيف هالة تتبع المؤشر فوق أي بطاقة */
export function Spotlight({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useSpotlight<HTMLDivElement>();
  const prm = usePrefersReducedMotion();
  const { motion } = useUI();
  const enabled = motion !== "off" && !prm && finePointer();
  return (
    <div ref={ref} className={cx(enabled && "spotlight", className)}>
      {children}
    </div>
  );
}

export function useSpotlight<T extends HTMLElement>(): RefObject<T> {
  const ref = useRef<T>(null);
  const prm = usePrefersReducedMotion();
  const { motion } = useUI();
  useEffect(() => {
    const el = ref.current;
    if (!el || motion === "off" || prm || !finePointer()) return;
    const mv = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--sx", `${e.clientX - r.left}px`);
      el.style.setProperty("--sy", `${e.clientY - r.top}px`);
    };
    el.addEventListener("pointermove", mv, { passive: true });
    return () => el.removeEventListener("pointermove", mv);
  }, [motion, prm]);
  return ref;
}
