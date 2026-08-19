import { AccountSheet, BackToTop, CursorGlow, Footer, Header, MobileBar, SearchOverlay } from "./components/chrome";
import { Girih } from "./components/ornament";
import { P0Doc } from "./components/p0doc";
import { PlayerBar } from "./components/player";
import { LatestTicker, Opening, RaddDocs, SeriesRail, SeriesSheet } from "./components/sections1";
import { ArticlesMag, DiaryGrid, FatwaAccordion, KhutabList, LecturesTimeline, LibraryShelf } from "./components/sections2";
import { AppProviders } from "./state/store";

/* ═══════════════════════════════════════════════════════
   المنصة العلمية — تركيب الصفحة
   الافتتاحية ← شريط الأحدث ← المسار ← الفتاوى والخطب ←
   الردود ← المقالات ← المكتبة ← المحاضرات ← اليوميات ← P0
   ═══════════════════════════════════════════════════════ */

export default function App() {
  return (
    <AppProviders>
      <CursorGlow />
      <Header />

      <main className="min-h-screen">
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
  );
}
