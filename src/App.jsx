import { lazy, Suspense, useCallback, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate, useParams } from "react-router-dom";
import { C } from "./constants/colours";
import SplashScreen from "./components/SplashScreen";
import BrowseScreen from "./screens/BrowseScreen";
import CareScreen from "./screens/CareScreen";
import LegalScreen from "./screens/LegalScreen";
import GlossaryScreen from "./screens/GlossaryScreen";
import SearchResults from "./screens/SearchResults";
import { useBetaAccess } from "./beta/betaAccess";
import { useAdminAccess } from "./beta/adminAccess";
import { accessFor, PUBLIC_SECTIONS } from "./constants/sections";
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

// Closed beta (D9): the ID screen and feedback card load as a separate chunk,
// fetched only once an invite code is verified, so the public bundle carries none of it.
const IdentifyScreen = lazy(() => import("./screens/IdentifyScreen"));
// Admin (interim, until D7): its own chunk, loaded only after /api/admin-check
// confirms an is_admin code. No tab points to it; it lives at /admin.
const AdminApp = lazy(() => import("./admin/AdminApp"));
// Photo credits (linked from the Glossary footer): its own small chunk.
const CreditsScreen = lazy(() => import("./screens/CreditsScreen"));


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

// Each tab belongs to a section (src/constants/sections.json). Before launch a
// tester sees only the sections the server gives them; the public build (no
// invite code) gets the public sections, and AI ID stays beta-only (D9).
const ALL_TABS = [
  { id: "browse",    icon: "🔍", label: "Browse",     path: "/",          section: "species"   },
  { id: "care",      icon: "📖", label: "Care",       path: "/care",      section: "care"      },
  { id: "licencing", icon: "⚖️", label: "Licencing",  path: "/licencing", section: "licensing" },
  { id: "identify",  icon: "📷", label: "ID Reptile", path: "/id",        section: "id"        },
  { id: "glossary",  icon: "📚", label: "Glossary",   path: "/glossary",  section: "glossary"  },
];
const PUBLIC_ACCESS = accessFor(PUBLIC_SECTIONS);

const FONT = "'DM Sans', system-ui, sans-serif";
// Bottom tab bar, sized explicitly so the spacer under the content matches it.
// The copyright line sits partly in the home-bar zone on notched iPhones.
const NAV = { top: 8, row: 48, footTop: 10, footLine: 12, footBottom: "max(4px, calc(env(safe-area-inset-bottom, 0px) - 15px))" };
const Blank = () => <div style={{ minHeight: "100vh", background: C.cream }} />;
const Notice = ({ title, children }) => (
  <div style={{ minHeight: "100vh", background: C.cream, fontFamily: FONT, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, boxSizing: "border-box" }}>
    <div style={{ maxWidth: 360, textAlign: "center" }}>
      <div style={{ fontSize: 17, fontWeight: 700, color: C.ink, marginBottom: 8 }}>{title}</div>
      <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.6 }}>{children}</div>
    </div>
  </div>
);
const SearchPrompt = () => <div style={{ padding: 40, textAlign: "center", fontSize: 13, color: C.muted, fontFamily: FONT }}>Type at least two letters to search.</div>;

// Detail page: renders the species / care guide for :slug, or sends unknown slugs home.
const DetailRoute = ({ table, onBack, home = "/" }) => {
  const { slug } = useParams();
  const entry = table[slug];
  if (!entry) return <Navigate to={home} replace />;
  const PageComponent = PAGE_MAP[entry.page];
  return <PageComponent onBack={onBack} />;
};

const AdminWait = () => <div style={{ padding: 24, fontSize: 13, color: "#888", fontFamily: "'DM Sans', system-ui, sans-serif" }}>Checking access…</div>;

// ─── App shell (layout + routes) ──────────────────────────────────
export function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname.replace(/\/+$/, "") || "/";
  const isAdminPath = pathname === "/admin" || pathname.startsWith("/admin/");
  // The admin tool skips the splash; the public app is unchanged.
  const [showSplash, setShowSplash] = useState(() => !isAdminPath);
  const [searchQuery, setSearchQuery] = useState("");
  // Taking ?invite= off the URL keeps the code out of history and screenshots.
  const beta = useBetaAccess(location.search, () => navigate("/id", { replace: true }));
  const betaOk = beta.status === "ok";
  // What this visitor can open. null while we don't know yet (checking, a failed
  // check, or a tester revoked mid-session while gated).
  const access = betaOk ? accessFor(beta.sections) : beta.status === "none" ? PUBLIC_ACCESS : null;
  const TABS = access ? ALL_TABS.filter(t => access.has(t.section)) : [];
  const TAB_FOR_PATH = Object.fromEntries(TABS.map(t => [t.path, t.id]));
  const home = access ? access.home : "/";
  const toHome = <Navigate to={home} replace />;
  const allow = (ok, element) => (ok ? element : toHome);
  // /id without a verified code: blank while a stored code is checked, then home.
  const idElement = betaOk && access.id
    ? <Suspense fallback={null}><IdentifyScreen inviteCode={beta.code} traitsBySpecies={beta.traits} canOpenCare={access.speciesPages} onRevoked={() => { beta.revoke(); navigate("/", { replace: true }); }} /></Suspense>
    : beta.status === "checking" ? null : toHome;

  // /admin: only for a verified beta code whose tester is an admin; anyone else goes home.
  const admin = useAdminAccess(beta.code, isAdminPath && betaOk);
  const denyAdmin = admin.deny;
  const leaveAdmin = useCallback(() => { denyAdmin(); navigate("/", { replace: true }); }, [denyAdmin, navigate]);
  const adminElement = betaOk && admin.status === "ok"
    ? <Suspense fallback={<AdminWait />}><AdminApp inviteCode={beta.code} adminId={admin.id} adminName={admin.name} gate={admin.gate} onForbidden={leaveAdmin} /></Suspense>
    : beta.status === "checking" || (betaOk && (admin.status === "checking" || admin.status === "idle")) ? <AdminWait /> : <Navigate to="/" replace />;

  // A detail page is any route that isn't one of the tab screens.
  const isTabPath = pathname in TAB_FOR_PATH;
  const isDetail = !isTabPath && /^\/(species|care)\/[^/]+$/.test(pathname);
  // Tabs highlight from the URL. Detail pages keep the tab they were opened from
  // (carried in history state); a cold deep link falls back to its section's tab.
  const activeTab = isTabPath
    ? TAB_FOR_PATH[pathname]
    : pathname === "/credits" ? "glossary"
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

  // The admin tool has its own header and no tab bar.
  if (isAdminPath) {
    return (
      <Routes>
        <Route path="/admin/*" element={adminElement} />
      </Routes>
    );
  }

  if (beta.status === "error") {
    return (
      <Notice title="Couldn't check your access">
        Check your connection and try again.
        <div><button type="button" onClick={beta.retry} style={{ marginTop: 14, background: C.green, color: "white", border: "none", borderRadius: 10, padding: "10px 20px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Try again</button></div>
      </Notice>
    );
  }
  if (!access) return <Blank />;
  if (access.sections.length === 0) {
    return <Notice title="Nothing to see yet">Your invite doesn't open any sections at the moment. We'll let you know when that changes.</Notice>;
  }
  // One section (e.g. ID-only testers): a single screen, no tab bar.
  const showNav = TABS.length > 1;

  return (
    <div style={{ display: "flex", flexDirection: "column", fontFamily: "'DM Sans', system-ui, sans-serif", minHeight: "100vh", background: C.cream }}>

        {!isDetail && (
          <div style={{ background: C.black, padding: "calc(env(safe-area-inset-top, 0px) + 10px) 20px 0" }}>
            <div style={{ marginBottom: 14, display: "flex", alignItems: "center" }}>
              <img src="/header-logo-dark.png" alt="All Things Reptile" onClick={() => { go(home); setSearchQuery(""); }} style={{ width: "100%", objectFit: "contain", cursor: "pointer" }} />
            </div>
            {access.search && <div style={{ background: "rgba(255,255,255,0.12)", border: "0.5px solid rgba(255,255,255,0.2)", borderRadius: 12, padding: "10px 14px", display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 14 }}>🔍</span>
              <input
                placeholder="Search species, care guides, glossary..."
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); if (pathname !== "/") navigate("/"); }}
                style={{ background: "none", border: "none", outline: "none", color: "white", fontSize: 14, width: "100%", fontFamily: "inherit" }}
              />
              {searchQuery && <button onClick={() => setSearchQuery("")} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.6)", cursor: "pointer", fontSize: 18, fontFamily: "inherit", lineHeight: 1 }}>×</button>}
            </div>}

          </div>
        )}

        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", background: "white" }}>
          <Routes>
            <Route path="/"              element={access.search && searchQuery.length >= 2
              ? <SearchResults query={searchQuery} show={{ species: access.speciesPages, care: access.careGuides, glossary: access.glossary }} onNavigate={(p) => { if (!URL_FOR_PAGE[p]) return; openPage(p); setSearchQuery(""); }} />
              : access.browse ? <BrowseScreen onSpecies={openPage} />
              : access.search ? <SearchPrompt /> : toHome} />
            <Route path="/care"          element={allow(access.careGuides, <CareScreen onGuide={openPage} />)} />
            <Route path="/licencing"     element={allow(access.licensing, <LegalScreen />)} />
            <Route path="/id"            element={idElement} />
            <Route path="/glossary"      element={allow(access.glossary, <GlossaryScreen showCredits={access.credits} />)} />
            <Route path="/credits"       element={allow(access.credits, <Suspense fallback={null}><CreditsScreen /></Suspense>)} />
            <Route path="/species/:slug" element={allow(access.speciesPages, <DetailRoute table={SPECIES_BY_SLUG} onBack={handleBack} home={home} />)} />
            <Route path="/care/:slug"    element={allow(access.careGuides, <DetailRoute table={GUIDES_BY_SLUG} onBack={handleBack} home={home} />)} />
            <Route path="*"              element={toHome} />
          </Routes>
        </div>

        {showNav && <>
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "white", borderTop: "0.5px solid #e8e8e4", display: "flex", flexDirection: "column", paddingTop: NAV.top, zIndex: 100 }}>
          <div style={{ display: "flex", width: "100%" }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => go(t.path)} aria-current={activeTab === t.id ? "page" : undefined} style={{ flex: 1, background: "none", border: "none", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3, cursor: "pointer", padding: 0, height: NAV.row, fontFamily: "inherit" }}>
                <span style={{ fontSize: 20, lineHeight: "24px" }}>{t.icon}</span>
                <span style={{ fontSize: 10, lineHeight: "13px", color: activeTab === t.id ? C.green : C.muted, fontWeight: activeTab === t.id ? 700 : 400 }}>{t.label}</span>
              </button>
            ))}
          </div>
          <div style={{ textAlign: "center", fontSize: 9, lineHeight: `${NAV.footLine}px`, color: "#ccc", padding: `${NAV.footTop}px 0 ${NAV.footBottom}` }}>© 2026 Amphibian Pty Ltd</div>
        </div>
        {/* Same height as the fixed bar, so the end of every screen clears it. */}
        <div style={{ height: `calc(${1 + NAV.top + NAV.row + NAV.footTop + NAV.footLine}px + ${NAV.footBottom})`, flexShrink: 0 }} />
        </>}
        {!showNav && <div style={{ textAlign: "center", fontSize: 9, color: "#ccc", padding: "10px 0 calc(env(safe-area-inset-bottom, 0px) + 10px)", background: "white" }}>© 2026 Amphibian Pty Ltd</div>}
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
