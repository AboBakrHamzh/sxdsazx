import { useEffect, useRef, type RefObject } from "react";
import { usePrefersReducedMotion } from "../lib/utils";
import { useUI } from "../state/store";

/* ═══════════════════════════════════════════════════════
   سماء الافتتاحية الحيّة
   - رذاذ ذهبي يتساقط كالثلج (نقاط بطيئة) والمطر (خيوط سريعة)
   - جمرات ضوء تصعد من الأسفل وتومض
   - شهب تعبر السماء كل بضع ثوانٍ
   - انفجار شرر + حلقة ضوء عند كل نقرة داخل الافتتاحية
   - الجسيمات تنزاح عن مؤشر الفأرة (حقل تنافر)
   - يتوقف كليًا مع «معطّلة» أو تفضيل تقليل الحركة،
     ويخفّ مع «خفيفة»، ويتجمّد خارج الرؤية أو في تبويب خامل
   ═══════════════════════════════════════════════════════ */

type Palette = { fall: string[]; ember: string; spark: string; streak: string };

const PALETTES: Record<"a" | "b", Palette> = {
  a: { fall: ["229,205,146", "199,164,95", "239,230,207"], ember: "236,206,138", spark: "244,220,160", streak: "229,205,146" },
  b: { fall: ["150,118,58", "176,143,78", "110,88,44"], ember: "176,143,78", spark: "150,118,58", streak: "150,118,58" },
};

interface Dot { x: number; y: number; vy: number; depth: number; r: number; sway: number; phase: number; c: string; streaky: boolean }
interface Ember { x: number; y: number; vy: number; vx: number; r: number; phase: number; c: string }
interface Spark { x: number; y: number; vx: number; vy: number; life: number; max: number; r: number; c: string }
interface Ring { x: number; y: number; r: number; life: number }
interface Shoot { x: number; y: number; vx: number; vy: number; life: number; c: string }

const rnd = (a: number, b: number) => a + Math.random() * (b - a);

export function SkyCanvas({ host }: { host: RefObject<HTMLElement | null> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { motion, theme } = useUI();
  const prm = usePrefersReducedMotion();

  useEffect(() => {
    const cv = canvasRef.current;
    const el = host.current;
    if (!cv || !el || motion === "off" || prm) return;

    const ctx = cv.getContext("2d");
    if (!ctx) return;

    const pal = PALETTES[theme];
    const density = motion === "light" ? 0.45 : 1;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    let W = 0;
    let H = 0;

    const dots: Dot[] = [];
    const embers: Ember[] = [];
    const sparks: Spark[] = [];
    const rings: Ring[] = [];
    const shoots: Shoot[] = [];
    let shootTimer = rnd(2.5, 5);
    let t = Math.random() * 100;
    let raf = 0;
    let last = performance.now();
    let visible = true;
    let mx = -9999;
    let my = -9999;

    const seed = () => {
      dots.length = 0;
      embers.length = 0;
      const nDots = Math.min(110, Math.round(((W * H) / 16000) * density));
      for (let i = 0; i < nDots; i++) {
        const depth = rnd(0.35, 1);
        dots.push({
          x: rnd(0, W), y: rnd(0, H),
          vy: (14 + depth * 46) * (motion === "light" ? 0.8 : 1),
          depth, r: rnd(0.7, 2.1) * depth,
          sway: rnd(6, 26) * depth, phase: rnd(0, Math.PI * 2),
          c: pal.fall[i % pal.fall.length],
          streaky: depth > 0.72 && Math.random() < 0.5,
        });
      }
      const nEmb = Math.round(16 * density);
      for (let i = 0; i < nEmb; i++) {
        embers.push({
          x: rnd(0, W), y: rnd(H * 0.35, H),
          vy: -rnd(16, 46), vx: rnd(-7, 7),
          r: rnd(1, 2.4), phase: rnd(0, Math.PI * 2), c: pal.ember,
        });
      }
    };

    const resize = () => {
      const r = el.getBoundingClientRect();
      W = r.width;
      H = r.height;
      cv.width = Math.round(W * dpr);
      cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    };

    const burst = (x: number, y: number) => {
      const n = motion === "light" ? 14 : 26;
      for (let i = 0; i < n; i++) {
        const a = rnd(0, Math.PI * 2);
        const sp = rnd(60, 250);
        const life = rnd(0.5, 0.95);
        sparks.push({
          x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 40,
          life, max: life, r: rnd(1, 2.4), c: pal.spark,
        });
      }
      rings.push({ x, y, r: 6, life: 0.65 });
    };

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      mx = e.clientX - r.left;
      my = e.clientY - r.top;
    };
    const onLeave = () => { mx = -9999; my = -9999; };
    const onDown = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      burst(e.clientX - r.left, e.clientY - r.top);
    };

    const io = new IntersectionObserver((es) => { visible = es[0]?.isIntersecting ?? true; }, { threshold: 0 });
    io.observe(el);

    const ro = new ResizeObserver(resize);
    ro.observe(el);
    resize();

    el.addEventListener("pointermove", onMove, { passive: true });
    el.addEventListener("pointerleave", onLeave);
    el.addEventListener("pointerdown", onDown);

    const repel = (x: number, y: number, dt: number, k: number): [number, number] => {
      const dx = x - mx;
      const dy = y - my;
      const d = Math.hypot(dx, dy);
      if (d < 110 && d > 0.001) {
        const f = (1 - d / 110) * k * dt;
        return [x + (dx / d) * f, y + (dy / d) * f];
      }
      return [x, y];
    };

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!visible || document.hidden) { last = now; return; }
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      t += dt;

      ctx.clearRect(0, 0, W, H);
      const wind = Math.sin(t * 0.14) * 7;

      /* الشهب */
      if (motion === "full") {
        shootTimer -= dt;
        if (shootTimer <= 0) {
          shootTimer = rnd(5, 11);
          const sx = rnd(W * 0.15, W * 0.95);
          shoots.push({ x: sx, y: rnd(-20, H * 0.2), vx: -rnd(380, 560), vy: rnd(160, 260), life: rnd(0.7, 1), c: pal.streak });
        }
      }
      for (let i = shoots.length - 1; i >= 0; i--) {
        const sh = shoots[i];
        sh.x += sh.vx * dt;
        sh.y += sh.vy * dt;
        sh.life -= dt;
        if (sh.life <= 0 || sh.x < -60) { shoots.splice(i, 1); continue; }
        const a = Math.min(1, sh.life * 1.6) * 0.85;
        const tx = sh.x - sh.vx * 0.14;
        const ty = sh.y - sh.vy * 0.14;
        const g = ctx.createLinearGradient(sh.x, sh.y, tx, ty);
        g.addColorStop(0, `rgba(${sh.c},${a})`);
        g.addColorStop(1, `rgba(${sh.c},0)`);
        ctx.strokeStyle = g;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(sh.x, sh.y);
        ctx.lineTo(tx, ty);
        ctx.stroke();
      }

      /* الرذاذ المتساقط */
      for (const p of dots) {
        p.y += p.vy * dt;
        p.x += (Math.sin(t * 1.3 + p.phase) * p.sway * 0.06 + wind * p.depth) * dt * 8;
        [p.x, p.y] = repel(p.x, p.y, dt, 90);
        if (p.y > H + 12) { p.y = -10; p.x = rnd(0, W); }
        if (p.x > W + 20) p.x = -15;
        if (p.x < -20) p.x = W + 15;
        const a = (0.16 + p.depth * 0.42) * (0.75 + 0.25 * Math.sin(t * 2 + p.phase));
        if (p.streaky) {
          const len = Math.min(24, p.vy * 0.4);
          ctx.strokeStyle = `rgba(${p.c},${a * 0.8})`;
          ctx.lineWidth = p.r * 0.9;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y - len);
          ctx.lineTo(p.x, p.y);
          ctx.stroke();
        } else {
          ctx.fillStyle = `rgba(${p.c},${a})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      /* الجمرات الصاعدة */
      for (const e of embers) {
        e.y += e.vy * dt;
        e.x += (e.vx + Math.sin(t * 2.1 + e.phase) * 9) * dt;
        [e.x, e.y] = repel(e.x, e.y, dt, 60);
        if (e.y < -12 || e.x < -12 || e.x > W + 12) {
          e.y = H + rnd(4, 30);
          e.x = rnd(0, W);
        }
        const a = 0.22 + 0.3 * (0.5 + 0.5 * Math.sin(t * 3 + e.phase));
        ctx.fillStyle = `rgba(${e.c},${a * 0.28})`;
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.r * 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(${e.c},${a})`;
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
        ctx.fill();
      }

      /* شرر النقرات */
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.life -= dt;
        if (s.life <= 0) { sparks.splice(i, 1); continue; }
        s.vy += 300 * dt;
        s.vx *= 1 - 1.6 * dt;
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        const a = s.life / s.max;
        ctx.fillStyle = `rgba(${s.c},${a})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r * (0.5 + a * 0.7), 0, Math.PI * 2);
        ctx.fill();
      }

      /* حلقات النقرات */
      for (let i = rings.length - 1; i >= 0; i--) {
        const r = rings[i];
        r.life -= dt;
        if (r.life <= 0) { rings.splice(i, 1); continue; }
        const k = 1 - r.life / 0.65;
        ctx.strokeStyle = `rgba(${pal.spark},${(1 - k) * 0.7})`;
        ctx.lineWidth = 1.5 * (1 - k) + 0.4;
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.r + k * 90, 0, Math.PI * 2);
        ctx.stroke();
      }
    };

    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      el.removeEventListener("pointerdown", onDown);
    };
  }, [motion, theme, prm, host]);

  if (motion === "off" || prm) return null;
  return <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 z-[1] h-full w-full" aria-hidden="true" />;
}
