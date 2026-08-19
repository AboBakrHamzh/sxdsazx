import { AccountSheet, Footer, Header, MobileBar, SearchOverlay } from "./components/chrome";
import { Girih } from "./components/ornament";
import { P0Doc } from "./components/p0doc";
import { PlayerBar } from "./components/player";
import { Opening, RaddDocs, SeriesRail, SeriesSheet } from "./components/sections1";
import { ArticlesMag, DiaryGrid, FatwaAccordion, KhutabList, LecturesTimeline, LibraryShelf } from "./components/sections2";
import { AppProviders } from "./state/store";

/* ═══════════════════════════════════════════════════════
   المنصة العلمية — تركيب الصفحة
   الترتيب: الافتتاحية ← المسار ← الفتاوى والخطب ← الردود
   ← المقالات ← المكتبة ← المحاضرات ← اليوميات ← وثيقة P0
   ═══════════════════════════════════════════════════════ */

export default function App() {
  return (
    <AppProviders>
      <Header />

      <main className="min-h-screen">
        <Opening />
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

      <MobileBar />
      <PlayerBar />
      <SearchOverlay />
      <AccountSheet />
      <SeriesSheet />
    </AppProviders>
  );
}
