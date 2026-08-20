import { Component, type ErrorInfo, type ReactNode } from "react";
import { AccountSheet, BackToTop, CursorGlow, Footer, Header, MobileBar, SearchOverlay } from "./components/chrome";
import { Girih } from "./components/ornament";
import { P0Doc } from "./components/p0doc";
import { PlayerBar } from "./components/player";
import { LatestTicker, Opening, RaddDocs, SeriesRail, SeriesSheet } from "./components/sections1";
import { ArticlesMag, DiaryGrid, FatwaAccordion, KhutabList, LecturesTimeline, LibraryShelf } from "./components/sections2";
import { AmbientDust, DriftingOrnaments, SparkTrail } from "./components/interactive";
import { AppProviders } from "./state/store";

/* ═══════════════════════════════════════════════════════
   المنصة العلمية — تركيب الصفحة
   الافتتاحية ← شريط الأحدث ← المسار ← الفتاوى والخطب ←
   الردود ← المقالات ← المكتبة ← المحاضرات ← اليوميات ← P0
   ═══════════════════════════════════════════════════════ */

/* حاجز أخطاء: يعرض رسالة عربية واضحة بدل الصفحة البيضاء */
class ErrorBoundary extends Component<{ children: ReactNode }, { err: Error | null }> {
  state = { err: null as Error | null };
  static getDerivedStateFromError(err: Error) {
    return { err };
  }
  componentDidCatch(err: Error, info: ErrorInfo) {
    console.error("خطأ في العرض:", err, info);
  }
  render() {
    if (this.state.err) {
      return (
        <div dir="rtl" style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#0b1512", color: "#eae3d2", fontFamily: "'IBM Plex Sans Arabic', sans-serif", padding: "2rem", textAlign: "center" }}>
          <div style={{ maxWidth: 34 }}>
            <svg width="56" height="56" viewBox="0 0 100 100" fill="none" stroke="#c7a45f" strokeWidth="3" style={{ margin: "0 auto 1.5rem" }}>
              <path d="M50 4 L96 50 L50 96 L4 50 Z" />
              <path d="M17.5 17.5 H82.5 V82.5 H17.5 Z" />
              <circle cx="50" cy="50" r="13" />
            </svg>
            <h1 style={{ fontSize: "1.6rem", fontWeight: 700, margin: "0 0 0.75rem" }}>حدث عارض في عرض الصفحة</h1>
            <p style={{ color: "#93a79a", lineHeight: 1.9, margin: "0 0 1.5rem", fontSize: "0.95rem" }}>
              نعتذر عن هذا الانقطاع — يمكنك إعادة تحميل المنصة، وستعود كل محفوظاتك (المفضلة ومواضع الاستماع) كما كانت.
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{ background: "#c7a45f", color: "#0b1512", border: "none", borderRadius: 999, padding: "0.8rem 2.2rem", fontSize: "0.95rem", fontWeight: 700, cursor: "pointer" }}
            >
              إعادة التحميل
            </button>
            <p style={{ color: "#5f7367", fontSize: "0.72rem", marginTop: "1.25rem", direction: "ltr" }}>{String(this.state.err)}</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppProviders>
        <AmbientDust />
        <DriftingOrnaments />
        <SparkTrail />
        <CursorGlow />
        <Header />

        <main className="relative z-[1] min-h-screen">
          <Opening />
          <LatestTicker />
          <Girih />
          <SeriesRail />
          <Girih />
          <FatwaAccordion />
          <KhutabList />
          <RaddDocs />
          <ArticlesMag />
          <Girih />
          <LibraryShelf />
          <LecturesTimeline />
          <Girih />
          <DiaryGrid />
          <Girih />
          <P0Doc />
        </main>

        <Footer />

        {/* فسحة للشريط السفلي الثابت في الجوال */}
        <div className="h-16 md:hidden" style={{ paddingBottom: "env(safe-area-inset-bottom)" }} aria-hidden="true" />

        <BackToTop />
        <MobileBar />
        <PlayerBar />
        <SearchOverlay />
        <AccountSheet />
        <SeriesSheet />
      </AppProviders>
    </ErrorBoundary>
  );
}
