import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate, useParams } from "react-router-dom";
import { C } from "./constants/colours";
import SplashScreen from "./components/SplashScreen";
import BrowseScreen from "./screens/BrowseScreen";
import CareScreen from "./screens/CareScreen";
import LegalScreen from "./screens/LegalScreen";
import IdentifyScreen from "./screens/IdentifyScreen";
import GlossaryScreen from "./screens/GlossaryScreen";
import SearchResults from "./screens/SearchResults";
import ChildrensPythonPage from "./pages/species/snakes/ChildrensPythonPage";
import StimsonsPythonPage from "./pages/species/snakes/StimsonsPythonPage";
import SpottedPythonPage from "./pages/species/snakes/SpottedPythonPage";
import CarpetPythonPage from "./pages/species/snakes/CarpetPythonPage";
import BredliPage from "./pages/species/snakes/BredliPage";
import DiamondPythonPage from "./pages/species/snakes/DiamondPythonPage";
import WomaPythonPage from "./pages/species/snakes/WomaPythonPage";
import BlackHeadedPythonPage from "./pages/species/snakes/BlackHeadedPythonPage";
import OlivePythonPage from "./pages/species/snakes/OlivePythonPage";
import PygmyPythonPage from "./pages/species/snakes/PygmyPythonPage";
import JungleCarpetPage from "./pages/species/snakes/JungleCarpetPage";
import WaterPythonPage from "./pages/species/snakes/WaterPythonPage";
import AmethystinePage from "./pages/species/snakes/AmethystinePage";
import RoughScaledPythonPage from "./pages/species/snakes/RoughScaledPythonPage";
import GreenTreePythonPage from "./pages/species/snakes/GreenTreePythonPage";
import BlueTonguePage from "./pages/species/lizards/BlueTonguePage";
import BeardiePage from "./pages/species/lizards/BeardiePage";
import EasternBeardedDragonPage from "./pages/species/lizards/EasternBeardedDragonPage";
import RankinsDragonPage from "./pages/species/lizards/RankinsDragonPage";
import FrilledLizardPage from "./pages/species/lizards/FrilledLizardPage";
import WaterDragonPage from "./pages/species/lizards/WaterDragonPage";
import NorthernBlueTonguePage from "./pages/species/lizards/NorthernBlueTonguePage";
import BlotchedBlueTonguePage from "./pages/species/lizards/BlotchedBlueTonguePage";
import ShinglebackPage from "./pages/species/lizards/ShinglebackPage";
import KnobTailedGeckoPage from "./pages/species/geckos/KnobTailedGeckoPage";
import ThickTailedGeckoPage from "./pages/species/geckos/ThickTailedGeckoPage";
import MarbledVelvetGeckoPage from "./pages/species/geckos/MarbledVelvetGeckoPage";
import LeafTailGeckoPage from "./pages/species/geckos/LeafTailGeckoPage";
import SpinyTailGeckoPage from "./pages/species/geckos/SpinyTailGeckoPage";
import GoldenTailGeckoPage from "./pages/species/geckos/GoldenTailGeckoPage";
import AckieMonitorPage from "./pages/species/monitors/AckieMonitorPage";
import PygmyMulgaPage from "./pages/species/monitors/PygmyMulgaPage";
import BlackHeadedMonitorPage from "./pages/species/monitors/BlackHeadedMonitorPage";
import RidgeTailedMonitorPage from "./pages/species/monitors/RidgeTailedMonitorPage";
import SandMonitorPage from "./pages/species/monitors/SandMonitorPage";
import LaceMonitorPage from "./pages/species/monitors/LaceMonitorPage";
import EasternLongNeckPage from "./pages/species/turtles/EasternLongNeckPage";
import BroadShellTurtlePage from "./pages/species/turtles/BroadShellTurtlePage";
import MurrayRiverTurtlePage from "./pages/species/turtles/MurrayRiverTurtlePage";
import SawShellTurtlePage from "./pages/species/turtles/SawShellTurtlePage";
import GreenTreeFrogPage from "./pages/species/frogs/GreenTreeFrogPage";
import WhiteLippedFrogPage from "./pages/species/frogs/WhiteLippedFrogPage";
import StripedMarshFrogPage from "./pages/species/frogs/StripedMarshFrogPage";
import EasternDwarfFrogPage from "./pages/species/frogs/EasternDwarfFrogPage";
import PeronsFrogPage from "./pages/species/frogs/PeronsFrogPage";
import MagnificentFrogPage from "./pages/species/frogs/MagnificentFrogPage";
import EnclosurePage from "./pages/care/EnclosurePage";
import TempPage from "./pages/care/TempPage";
import FeedingNutritionPage from "./pages/care/FeedingNutritionPage";
import HandlingPage from "./pages/care/HandlingPage";
import HealthPage from "./pages/care/HealthPage";
import SheddingPage from "./pages/care/SheddingPage";
import FeederGuidePage from "./pages/care/FeederGuidePage";
import { SPECIES } from "./data/species";
import { CARE_GUIDES } from "./data/careGuides";


// ─── Page router map ──────────────────────────────────────────────
const PAGE_MAP = {
  bluetongue:  BlueTonguePage,
  beardie:     BeardiePage,
  childrens:   ChildrensPythonPage,
  stimsons:    StimsonsPythonPage,
  spotted:     SpottedPythonPage,
  carpet:      CarpetPythonPage,
  bredli:      BredliPage,
  diamond:     DiamondPythonPage,
  woma:        WomaPythonPage,
  blackheaded: BlackHeadedPythonPage,
  olive:       OlivePythonPage,
  pygmy:       PygmyPythonPage,
  jungle:      JungleCarpetPage,
  water:       WaterPythonPage,
  amethystine: AmethystinePage,
  roughscaled: RoughScaledPythonPage,
  knobtail:    KnobTailedGeckoPage,
  thicktail:   ThickTailedGeckoPage,
  marbled:     MarbledVelvetGeckoPage,
  eastbeardie: EasternBeardedDragonPage,
  rankins:     RankinsDragonPage,
  frilled:     FrilledLizardPage,
  waterdragon: WaterDragonPage,
  greentree:   GreenTreePythonPage,
  turtle:      EasternLongNeckPage,
  broadshell:  BroadShellTurtlePage,
  murray:      MurrayRiverTurtlePage,
  sawshell:    SawShellTurtlePage,
  leaftail:    LeafTailGeckoPage,
  spinytail:   SpinyTailGeckoPage,
  goldentail:  GoldenTailGeckoPage,
  northernbt:  NorthernBlueTonguePage,
  blotchedbt:  BlotchedBlueTonguePage,
  shingleback: ShinglebackPage,
  greentreefrog: GreenTreeFrogPage,
  whitelipped:  WhiteLippedFrogPage,
  stripedmarsh: StripedMarshFrogPage,
  dwarftree:    EasternDwarfFrogPage,
  perons:       PeronsFrogPage,
  magnificent:  MagnificentFrogPage,
  ackie:            AckieMonitorPage,
  pygmymulga:       PygmyMulgaPage,
  blackheadedmonitor: BlackHeadedMonitorPage,
  ridgetailed:      RidgeTailedMonitorPage,
  sandmonitor:      SandMonitorPage,
  lacemonitor:      LaceMonitorPage,
  enclosure:   EnclosurePage,
  temp:         TempPage,
  feedingnutrition: FeedingNutritionPage,
  handling:     HandlingPage,
  health:       HealthPage,
  shedding:     SheddingPage,
  feeders:     FeederGuidePage,
};

// ─── Route tables (D4: routes use slug only) ──────────────────────
// Only entries with a built page are routable (keeps the Browse "has a page" guard).
const SPECIES_BY_SLUG = Object.fromEntries(SPECIES.filter(s => s.page && PAGE_MAP[s.page]).map(s => [s.slug, s]));
const GUIDES_BY_SLUG  = Object.fromEntries(CARE_GUIDES.filter(g => g.page && PAGE_MAP[g.page]).map(g => [g.slug, g]));
// Legacy page key (PAGE_MAP id) → URL, for screens that still report page keys.
const URL_FOR_PAGE = {
  ...Object.fromEntries(Object.values(SPECIES_BY_SLUG).map(s => [s.page, `/species/${s.slug}`])),
  ...Object.fromEntries(Object.values(GUIDES_BY_SLUG).map(g => [g.page, `/care/${g.slug}`])),
};

const TABS = [
  { id: "browse",    icon: "🔍", label: "Browse",     path: "/"          },
  { id: "care",      icon: "📖", label: "Care",       path: "/care"      },
  { id: "licencing", icon: "⚖️", label: "Licencing",  path: "/licencing" },
  { id: "identify",  icon: "📷", label: "ID Reptile", path: "/id"        },
  { id: "glossary",  icon: "📚", label: "Glossary",   path: "/glossary"  },
];
const TAB_FOR_PATH = Object.fromEntries(TABS.map(t => [t.path, t.id]));

// Detail page: renders the species / care guide for :slug, or sends unknown slugs home.
const DetailRoute = ({ table, onBack }) => {
  const { slug } = useParams();
  const entry = table[slug];
  if (!entry) return <Navigate to="/" replace />;
  const PageComponent = PAGE_MAP[entry.page];
  return <PageComponent onBack={onBack} />;
};

// ─── App shell (layout + routes) ──────────────────────────────────
export function AppShell() {
  const [showSplash, setShowSplash] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname.replace(/\/+$/, "") || "/";

  // A detail page is any route that isn't one of the five tab screens.
  const isTabPath = pathname in TAB_FOR_PATH;
  const isDetail = !isTabPath && /^\/(species|care)\/[^/]+$/.test(pathname);
  // Tabs highlight from the URL. Detail pages keep the tab they were opened from
  // (carried in history state); a cold deep link falls back to its section's tab.
  const activeTab = isTabPath
    ? TAB_FOR_PATH[pathname]
    : (location.state && location.state.tab) || (pathname.startsWith("/care/") ? "care" : "browse");

  // Re-tapping the current tab is a no-op, as it was with setActiveTab/setPage(null).
  const go = (path) => { if (path !== pathname) navigate(path); };
  const openPage = (page) => {
    const url = URL_FOR_PAGE[page];
    if (url) navigate(url, { state: { tab: activeTab } });
  };
  // Equivalent of setPage(null): return to the screen underneath. If we got here
  // inside the app, that's the previous history entry; on a cold deep link there's
  // nothing to go back to, so replace with the section's tab screen.
  const handleBack = () => {
    if (location.key !== "default") navigate(-1);
    else navigate(activeTab === "care" ? "/care" : "/", { replace: true });
  };

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", fontFamily: "'DM Sans', system-ui, sans-serif", minHeight: "100vh", background: C.cream }}>

        {!isDetail && (
          <div style={{ background: C.green, padding: "calc(env(safe-area-inset-top, 0px) + 10px) 20px 0" }}>
            <div style={{ marginBottom: 14, display: "flex", alignItems: "center" }}>
              <img src="/AllThingsReptile_Logo.png" alt="All Things Reptile" onClick={() => { go("/"); setSearchQuery(""); }} style={{ width: "100%", objectFit: "contain", cursor: "pointer" }} />
            </div>
            <div style={{ background: "rgba(255,255,255,0.12)", border: "0.5px solid rgba(255,255,255,0.2)", borderRadius: 12, padding: "10px 14px", display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 14 }}>🔍</span>
              <input
                placeholder="Search species, care guides, glossary..."
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); if (pathname !== "/") navigate("/"); }}
                style={{ background: "none", border: "none", outline: "none", color: "white", fontSize: 14, width: "100%", fontFamily: "inherit" }}
              />
              {searchQuery && <button onClick={() => setSearchQuery("")} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.6)", cursor: "pointer", fontSize: 18, fontFamily: "inherit", lineHeight: 1 }}>×</button>}
            </div>

          </div>
        )}

        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", background: "white" }}>
          <Routes>
            <Route path="/"              element={searchQuery.length >= 2 ? <SearchResults query={searchQuery} onNavigate={(p) => { if (!URL_FOR_PAGE[p]) return; openPage(p); setSearchQuery(""); }} /> : <BrowseScreen onSpecies={openPage} />} />
            <Route path="/care"          element={<CareScreen onGuide={openPage} />} />
            <Route path="/licencing"     element={<LegalScreen />} />
            <Route path="/id"            element={<IdentifyScreen />} />
            <Route path="/glossary"      element={<GlossaryScreen />} />
            <Route path="/species/:slug" element={<DetailRoute table={SPECIES_BY_SLUG} onBack={handleBack} />} />
            <Route path="/care/:slug"    element={<DetailRoute table={GUIDES_BY_SLUG} onBack={handleBack} />} />
            <Route path="*"              element={<Navigate to="/" replace />} />
          </Routes>
        </div>

        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "white", borderTop: "0.5px solid #e8e8e4", display: "flex", flexDirection: "column", paddingTop: 8, zIndex: 100 }}>
          <div style={{ display: "flex", width: "100%" }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => go(t.path)} style={{ flex: 1, background: "none", border: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, cursor: "pointer", padding: "4px 0", fontFamily: "inherit" }}>
                <span style={{ fontSize: 20 }}>{t.icon}</span>
                <span style={{ fontSize: 10, color: activeTab === t.id ? C.green : "#aaa", fontWeight: activeTab === t.id ? 700 : 400 }}>{t.label}</span>
              </button>
            ))}
          </div>
          <div style={{ textAlign: "center", fontSize: 9, color: "#ccc", padding: "10px 0 calc(env(safe-area-inset-bottom, 0px) - 15px)" }}>© 2026 Amphibian Pty Ltd</div>
        </div>
        <div style={{ height: "calc(60px + env(safe-area-inset-bottom, 0px))" }} />
    </div>
  );
}

// ─── Root app ─────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}

export { PAGE_MAP, SPECIES_BY_SLUG, GUIDES_BY_SLUG, URL_FOR_PAGE };
