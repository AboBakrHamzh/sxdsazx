import {
  createContext, useCallback, useContext, useEffect, useMemo, useRef, useState,
  type ReactNode,
} from "react";
import type { Kind, Series } from "../data/content";
import { seriesList } from "../data/content";

/* ═══════════ المشغّل العام المستمر ═══════════ */

export interface Track {
  id: string;
  title: string;
  kind: Kind;
  from: string;
  duration: number;
  tone: number; // تردد النغمة التجريبية المولّدة
}

interface PlayerState {
  current: Track | null;
  queue: Track[];
  playing: boolean;
  progress: number;
  speed: number;
  volume: number;
  expanded: boolean;
  play: (t: Track, queue?: Track[]) => void;
  toggle: () => void;
  seek: (sec: number) => void;
  skip: (delta: number) => void;
  setSpeed: (s: number) => void;
  setVolume: (v: number) => void;
  next: () => void;
  close: () => void;
  setExpanded: (b: boolean) => void;
}

const PlayerCtx = createContext<PlayerState | null>(null);
export const usePlayer = () => {
  const c = useContext(PlayerCtx);
  if (!c) throw new Error("usePlayer خارج المزوّد");
  return c;
};

/* نغمة خلفية ناعمة مولّدة عبر WebAudio — تعمل كنغمة تجريبية للمادة */
let ac: AudioContext | null = null;
let padGain: GainNode | null = null;
let padOscs: OscillatorNode[] = [];

function startPad(vol: number, tone: number) {
  try {
    if (!ac) ac = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    if (ac.state === "suspended") void ac.resume();
    stopPad();
    padGain = ac.createGain();
    padGain.gain.value = 0;
    const filt = ac.createBiquadFilter();
    filt.type = "lowpass";
    filt.frequency.value = 760;
    padGain.connect(filt);
    filt.connect(ac.destination);
    const parts: [number, number][] = [[1, 0.5], [1.5, 0.26], [2.01, 0.14], [3.005, 0.07]];
    parts.forEach(([mul, amp]) => {
      const o = ac!.createOscillator();
      o.type = "sine";
      o.frequency.value = tone * mul;
      const g = ac!.createGain();
      g.gain.value = amp;
      o.connect(g);
      g.connect(padGain!);
      o.start();
      padOscs.push(o);
    });
    padGain.gain.linearRampToValueAtTime(Math.max(0.001, vol * 0.045), ac.currentTime + 0.5);
  } catch { /* الطرف الثالث معطّل: لا يؤثر على الوظيفة */ }
}

function stopPad() {
  if (padGain && ac) {
    try {
      padGain.gain.linearRampToValueAtTime(0.0001, ac.currentTime + 0.25);
      const oscs = padOscs;
      padOscs = [];
      setTimeout(() => oscs.forEach((o) => { try { o.stop(); } catch { /* noop */ } }), 350);
    } catch { /* noop */ }
  }
}

function PlayerProvider({ children }: { children: ReactNode }) {
  const [current, setCurrent] = useState<Track | null>(null);
  const [queue, setQueue] = useState<Track[]>([]);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [speed, setSpeedState] = useState(1);
  const [volume, setVolumeState] = useState(0.8);
  const [expanded, setExpanded] = useState(false);
  const ref = useRef({ progress: 0, duration: 0, speed: 1, playing: false });
  const playRef = useRef<(t: Track, q?: Track[]) => void>(() => {});
  const qRef = useRef<Track[]>([]);

  useEffect(() => {
    ref.current.playing = playing;
    ref.current.speed = speed;
    ref.current.progress = progress;
  });

  /* شريط التقدم — يحاكي الاستماع ويتابع حتى نهاية المقطع */
  useEffect(() => {
    if (!playing || !current) return;
    const id = window.setInterval(() => {
      setProgress((p) => {
        const np = p + 0.25 * ref.current.speed;
        if (np >= current.duration) {
          window.clearInterval(id);
          const idx = qRef.current.findIndex((t) => t.id === current.id);
          const nx = qRef.current[idx + 1];
          if (nx) {
            /* انتقال حيّ: لحظة سكون قصيرة ثم يبدأ المقطع التالي وحده */
            stopPad();
            setPlaying(false);
            window.setTimeout(() => playRef.current(nx, qRef.current), 700);
          } else {
            setPlaying(false);
            stopPad();
          }
          return current.duration;
        }
        return np;
      });
    }, 250);
    return () => window.clearInterval(id);
  }, [playing, current]);

  /* حفظ آخر موضع لكل مادة (الاستئناف من حيث توقفت) */
  useEffect(() => {
    if (!current) return;
    try { localStorage.setItem(`sawti:pos:${current.id}`, String(Math.floor(progress))); } catch { /* noop */ }
  }, [current, progress]);

  const play = useCallback((t: Track, q?: Track[]) => {
    setCurrent(t);
    if (q) setQueue(q);
    let start = 0;
    try { start = Math.min(Number(localStorage.getItem(`sawti:pos:${t.id}`)) || 0, t.duration - 5); if (start < 0) start = 0; } catch { /* noop */ }
    setProgress(start);
    setPlaying(true);
    setExpanded(true);
    startPad(volume, t.tone);
    try {
      if ("mediaSession" in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: t.title,
          artist: "الشيخ أبو عمرو نور الدين السدعي",
          album: t.from,
        });
        navigator.mediaSession.setActionHandler("play", () => setPlaying(true));
        navigator.mediaSession.setActionHandler("pause", () => { setPlaying(false); stopPad(); });
      }
    } catch { /* noop */ }
  }, [volume]);

  useEffect(() => { playRef.current = play; qRef.current = queue; });

  const toggle = useCallback(() => {
    if (!current) return;
    setPlaying((p) => {
      const np = !p;
      if (np) startPad(volume, current.tone);
      else stopPad();
      return np;
    });
  }, [current, volume]);

  const seek = useCallback((sec: number) => {
    if (current) setProgress(Math.max(0, Math.min(sec, current.duration)));
  }, [current]);

  const skip = useCallback((d: number) => {
    if (current) setProgress((p) => Math.max(0, Math.min(p + d, current.duration)));
  }, [current]);

  const setSpeed = useCallback((s: number) => setSpeedState(s), []);
  const setVolume = useCallback((v: number) => {
    setVolumeState(v);
    if (padGain && ac) {
      try { padGain.gain.linearRampToValueAtTime(Math.max(0.001, v * 0.045), ac.currentTime + 0.2); } catch { /* noop */ }
    }
  }, []);

  const next = useCallback(() => {
    if (!current) return;
    const idx = queue.findIndex((t) => t.id === current.id);
    const nx = queue[idx + 1];
    if (nx) play(nx, queue);
    else { setPlaying(false); stopPad(); }
  }, [current, queue, play]);

  const close = useCallback(() => {
    setPlaying(false);
    stopPad();
    setCurrent(null);
    setQueue([]);
    setProgress(0);
    setExpanded(false);
  }, []);

  const value = useMemo(
    () => ({ current, queue, playing, progress, speed, volume, expanded, play, toggle, seek, skip, setSpeed, setVolume, next, close, setExpanded }),
    [current, queue, playing, progress, speed, volume, expanded, play, toggle, seek, skip, setSpeed, setVolume, next, close]
  );

  return <PlayerCtx.Provider value={value}>{children}</PlayerCtx.Provider>;
}

/* ═══════════ المفضّلة ═══════════ */

interface FavState {
  favs: string[];
  has: (id: string) => boolean;
  toggle: (id: string) => void;
}
const FavCtx = createContext<FavState | null>(null);
export const useFav = () => {
  const c = useContext(FavCtx);
  if (!c) throw new Error("useFav خارج المزوّد");
  return c;
};

function FavProvider({ children }: { children: ReactNode }) {
  const [favs, setFavs] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem("sawti:favs") || "[]"); } catch { return []; }
  });
  useEffect(() => {
    try { localStorage.setItem("sawti:favs", JSON.stringify(favs)); } catch { /* noop */ }
  }, [favs]);
  const value = useMemo<FavState>(() => ({
    favs,
    has: (id) => favs.includes(id),
    toggle: (id) => setFavs((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id])),
  }), [favs]);
  return <FavCtx.Provider value={value}>{children}</FavCtx.Provider>;
}

/* ═══════════ حالة الواجهة (السمة، الأوراق) ═══════════ */

export type ThemeId = "a" | "b";

interface UIState {
  theme: ThemeId;
  setTheme: (t: ThemeId) => void;
  motion: "full" | "light" | "off";
  setMotion: (m: "full" | "light" | "off") => void;
  fontScale: number;
  setFontScale: (n: number) => void;
  searchOpen: boolean;
  setSearchOpen: (b: boolean) => void;
  accOpen: boolean;
  setAccOpen: (b: boolean) => void;
  activeSeries: Series | null;
  setActiveSeries: (s: Series | null) => void;
}

const UICtx = createContext<UIState | null>(null);
export const useUI = () => {
  const c = useContext(UICtx);
  if (!c) throw new Error("useUI خارج المزوّد");
  return c;
};

function UIProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeId>(() => {
    try { return (localStorage.getItem("sawti:theme") as ThemeId) || "a"; } catch { return "a"; }
  });
  const [motion, setMotion] = useState<"full" | "light" | "off">(() => {
    try { return (localStorage.getItem("sawti:motion") as "full" | "light" | "off") || "full"; } catch { return "full"; }
  });
  const [fontScale, setFontScaleState] = useState<number>(() => {
    try { return Number(localStorage.getItem("sawti:font")) || 16; } catch { return 16; }
  });
  const [searchOpen, setSearchOpen] = useState(false);
  const [accOpen, setAccOpen] = useState(false);
  const [activeSeries, setActiveSeries] = useState<Series | null>(null);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem("sawti:theme", theme); } catch { /* noop */ }
  }, [theme]);

  useEffect(() => {
    document.documentElement.dataset.motion = motion;
    try { localStorage.setItem("sawti:motion", motion); } catch { /* noop */ }
  }, [motion]);

  const setFontScale = useCallback((n: number) => {
    setFontScaleState(n);
    document.documentElement.style.fontSize = `${n}px`;
    try { localStorage.setItem("sawti:font", String(n)); } catch { /* noop */ }
  }, []);

  useEffect(() => {
    document.documentElement.style.fontSize = `${fontScale}px`;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* إغلاق الأوراق بمفتاح Escape */
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setSearchOpen(false); setAccOpen(false); setActiveSeries(null); }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);

  const value = useMemo<UIState>(() => ({
    theme, setTheme, motion, setMotion, fontScale, setFontScale,
    searchOpen, setSearchOpen, accOpen, setAccOpen, activeSeries, setActiveSeries,
  }), [theme, motion, fontScale, setFontScale, searchOpen, accOpen, activeSeries]);

  return <UICtx.Provider value={value}>{children}</UICtx.Provider>;
}

/* ═══════════ المزوّد الجامع ═══════════ */

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <UIProvider>
      <FavProvider>
        <PlayerProvider>{children}</PlayerProvider>
      </FavProvider>
    </UIProvider>
  );
}

/* ── مصنع مسارات صوتية من السلاسل والدروس ─────────── */

export function seriesQueue(s: Series): Track[] {
  return s.lessons.filter((l) => l.state !== "next").map((l) => ({
    id: `${s.id}-${l.n}`,
    title: `الدرس ${l.n}: ${l.title}`,
    kind: "lesson" as Kind,
    from: s.title,
    duration: l.dur,
    tone: 220 + l.n * 18,
  }));
}

export const featuredSeries = seriesList[0];
