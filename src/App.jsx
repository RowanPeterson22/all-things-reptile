import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate, useParams } from "react-router-dom";
import { C } from "./constants/colours";
import SplashScreen from "./components/SplashScreen";
import SearchField from "./components/SearchField";
import BrowseScreen from "./screens/BrowseScreen";
import CareScreen from "./screens/CareScreen";
import LegalScreen from "./screens/LegalScreen";
import GlossaryScreen from "./screens/GlossaryScreen";
import SearchResults from "./screens/SearchResults";
import HomeScreen from "./screens/HomeScreen";
import TabPage from "./screens/TabPage";
import ComingSoonScreen from "./screens/ComingSoonScreen";
import LearnNav from "./components/LearnNav";
import Icon from "./components/Icon";
import { useBetaAccess, usePublicLayout } from "./beta/betaAccess";
import { useAdminAccess } from "./beta/adminAccess";
import { accessFor } from "./constants/sections";
import { SECTIONS as ALL_SECTIONS, shellFor } from "./constants/appLayout";
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
// Old IDs and page keys (e.g. /species/blackheadedmonitor) → today's slug (D4),
// so links made before the hyphenated slugs still land on the right page.
const legacyMap = (list, table) => Object.fromEntries(list
  .filter(x => table[x.slug])
  .flatMap(x => [x.id, x.page].filter(k => k && k !== x.slug).map(k => [k, x.slug])));
const LEGACY_SPECIES = legacyMap(SPECIES, SPECIES_BY_SLUG);
const LEGACY_GUIDES  = legacyMap(CARE_GUIDES, GUIDES_BY_SLUG);
// Legacy page key (PAGE_MAP id) → URL, for screens that still report page keys.
const URL_FOR_PAGE = {
  ...Object.fromEntries(Object.values(SPECIES_BY_SLUG).map(s => [s.page, `/species/${s.slug}`])),
  ...Object.fromEntries(Object.values(GUIDES_BY_SLUG).map(g => [g.page, `/care/${g.slug}`])),
};

// ─── Tabs and sections ────────────────────────────────────────────
// Five bottom tabs, fixed in code (src/constants/sections.json): Home, Learn,
// ID, Community, My Profile. Sections sit inside them; who sees which, their
// titles, order and the featured card come from the server (/api/beta-check,
// edited in /admin → Sections) through the shared rules in
// src/constants/appLayout.js. Before launch a tester sees only what the server
// gives them; the public build (no invite code) gets the public layout, and
// AI ID stays beta-only (D9). A visitor who can open only one built section
// gets that screen alone, with no tab bar (e.g. ID-only testers).
const PLACEHOLDERS = ALL_SECTIONS.filter(s => !s.built);
const LEARN_PATHS = new Set(["/species", "/care", "/licencing", "/glossary"]);
const tabOfPath = (p) => (p === "/" ? "home"
  : p === "/id" ? "id"
    : p === "/community" || p.startsWith("/community/") ? "community"
      : p === "/profile" || p.startsWith("/profile/") ? "profile"
        : "learn");

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
const DetailRoute = ({ table, legacy = {}, base, onBack, home = "/" }) => {
  const { slug } = useParams();
  const entry = table[slug];
  if (!entry && legacy[slug]) return <Navigate to={`${base}/${legacy[slug]}`} replace />;
  if (!entry) return <Navigate to={home} replace />;
  const PageComponent = PAGE_MAP[entry.page];
  return <PageComponent onBack={onBack} />;
};

// Browser tab / history title for a path: "<page> · All Things Reptile".
// Default names (the admin titles only change what's on screen).
const SITE = "All Things Reptile";
const PATH_TITLES = {
  ...Object.fromEntries(ALL_SECTIONS.map(s => [s.path, s.key === "licensing" ? "Licencing" : s.title])),
  "/community": "Community",
  "/profile": "My Profile",
};
export const titleFor = (path) => {
  const [, first, second] = path.split("/");
  if (first === "species" && second) return SPECIES_BY_SLUG[second] ? `${SPECIES_BY_SLUG[second].name} · ${SITE}` : SITE;
  if (first === "care" && second) return GUIDES_BY_SLUG[second] ? `${GUIDES_BY_SLUG[second].title} · ${SITE}` : SITE;
  if (first === "admin") return `Admin · ${SITE}`;
  const name = PATH_TITLES[path];
  return name ? `${name} · ${SITE}` : SITE;
};

const AdminWait = () => <div style={{ padding: 24, fontSize: 13, color: "#888", fontFamily: "'DM Sans', system-ui, sans-serif" }}>Checking access…</div>;

// ─── App shell (layout + routes) ──────────────────────────────────
export function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname.replace(/\/+$/, "") || "/";
  const isAdminPath = pathname === "/admin" || pathname.startsWith("/admin/");
  useEffect(() => { document.title = titleFor(pathname); }, [pathname]);
  // The admin tool skips the splash; the public app is unchanged.
  const [showSplash, setShowSplash] = useState(() => !isAdminPath);
  const [searchQuery, setSearchQuery] = useState("");
  // Taking ?invite= off the URL keeps the code out of history and screenshots.
  const beta = useBetaAccess(location.search, () => navigate("/id", { replace: true }));
  const betaOk = beta.status === "ok";
  // No code: the public layout (one cached GET), or the built-in defaults.
  const pub = usePublicLayout(beta.status === "none" && !isAdminPath);
  // What this visitor can open and see. null while we don't know yet (checking,
  // a failed check, or a tester revoked mid-session while gated).
  const view = betaOk ? { sections: beta.sections, app: beta.app }
    : beta.status === "none" && pub.status === "ok" ? { sections: pub.sections, app: pub.app } : null;
  const access = view ? accessFor(view.sections) : null;
  const shell = view ? shellFor(view) : null;
  const home = shell && shell.landing ? shell.landing : "/";
  const toHome = <Navigate to={home} replace />;
  const allow = (ok, element) => (ok ? element : toHome);
  const tabByKey = shell ? Object.fromEntries(shell.tabs.map(t => [t.key, t])) : {};

  // Back from a page with no detail of its own: the previous entry if we came
  // from inside the app, else the given fallback.
  const backOr = (fallback) => () => {
    if (location.key !== "default") navigate(-1);
    else navigate(fallback, { replace: true });
  };
  const comingSoon = (item) => {
    const tab = tabByKey[item.tab];
    const backTo = tab && tab.key !== "learn" ? tab : tabByKey.home || { path: home, label: "Back" };
    return <ComingSoonScreen item={item} backLabel={backTo.label} onBack={backOr(backTo.path)} />;
  };
  // A built section: its screen if they can open it; its Coming soon page if
  // /admin → Sections has it set to Coming soon; otherwise home.
  const section = (key, ok, element) => {
    if (ok) return element;
    const item = shell && shell.byKey[key];
    return item && item.status !== "live" ? comingSoon(item) : toHome;
  };
  // /id without a verified code: blank while a stored code is checked, then home.
  const idElement = betaOk && access.id
    ? <Suspense fallback={null}><IdentifyScreen inviteCode={beta.code} traitsBySpecies={beta.traits} canOpenCare={access.speciesPages} onRevoked={() => { beta.revoke(); navigate("/", { replace: true }); }} /></Suspense>
    : beta.status === "checking" ? null : section("id", false, null);

  // /admin: only for a verified beta code whose tester is an admin; anyone else goes home.
  const admin = useAdminAccess(beta.code, isAdminPath && betaOk);
  const denyAdmin = admin.deny;
  const leaveAdmin = useCallback(() => { denyAdmin(); navigate("/", { replace: true }); }, [denyAdmin, navigate]);
  const adminElement = betaOk && admin.status === "ok"
    ? <Suspense fallback={<AdminWait />}><AdminApp inviteCode={beta.code} adminId={admin.id} adminName={admin.name} gate={admin.gate} onForbidden={leaveAdmin} /></Suspense>
    : beta.status === "checking" || (betaOk && (admin.status === "checking" || admin.status === "idle")) ? <AdminWait /> : <Navigate to="/" replace />;

  const isDetail = /^\/(species|care)\/[^/]+$/.test(pathname);
  // Tabs highlight from the URL. Detail pages keep the tab they were opened from
  // (carried in history state, e.g. a care guide opened from ID); otherwise Learn.
  const activeTab = (isDetail && location.state && location.state.tab) || tabOfPath(pathname);

  // Re-tapping the current tab is a no-op, as it was with setActiveTab/setPage(null).
  const go = (path) => { if (path !== pathname) navigate(path); };
  const openPage = (page) => {
    const url = URL_FOR_PAGE[page];
    if (url) navigate(url, { state: { tab: activeTab } });
  };
  // Equivalent of setPage(null): return to the screen underneath. If we got here
  // inside the app, that's the previous history entry; on a cold deep link there's
  // nothing to go back to, so replace with the section's index screen.
  const handleBack = () => {
    if (location.key !== "default") navigate(-1);
    else navigate(pathname.startsWith("/care/") && access && access.careGuides ? "/care" : access && access.browse ? "/species" : home, { replace: true });
  };
  const onQuery = (e) => { setSearchQuery(e.target.value); if (pathname !== "/search") navigate("/search"); };
  const clearQuery = () => setSearchQuery("");

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
  if (!shell.landing) {
    return <Notice title="Nothing to see yet">Your invite doesn't open any sections at the moment. We'll let you know when that changes.</Notice>;
  }
  const showNav = shell.tabs.length > 1;
  const onHome = pathname === "/" && shell.full;
  // Search sits in the header on the Learn screens (and on a single screen);
  // on Home it's one of the blocks.
  const showHeaderSearch = access.search && !onHome && (!shell.full || activeTab === "learn");
  const showLearnNav = shell.full && LEARN_PATHS.has(pathname) && shell.learnNav.length > 1;

  return (
    <div style={{ display: "flex", flexDirection: "column", fontFamily: "'DM Sans', system-ui, sans-serif", minHeight: "100vh", background: C.cream }}>

        {!isDetail && (
          <div style={{ background: C.black, padding: "calc(env(safe-area-inset-top, 0px) + 10px) 20px 0" }}>
            <div style={{ marginBottom: 14, display: "flex", alignItems: "center" }}>
              <img src="/header-logo-dark.png" alt="All Things Reptile" onClick={() => { go(home); setSearchQuery(""); }} style={{ width: "100%", objectFit: "contain", cursor: "pointer" }} />
            </div>
            {showHeaderSearch && <SearchField
              placeholder="Search species, care guides, glossary..."
              value={searchQuery}
              onChange={onQuery}
              onClear={clearQuery}
              autoFocus={pathname === "/search" && searchQuery.length > 0}
            />}
            {showLearnNav && <LearnNav items={shell.learnNav} active={pathname} onGo={go} />}
          </div>
        )}

        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", background: "white" }}>
          <Routes>
            <Route path="/"              element={shell.full
              ? <HomeScreen shell={shell} canSearch={access.search} query={searchQuery} onQuery={onQuery} onClearQuery={clearQuery} onOpen={go} profileTab={tabByKey.profile} />
              : toHome} />
            <Route path="/search"        element={allow(access.search, searchQuery.length >= 2
              ? <SearchResults query={searchQuery} show={{ species: access.speciesPages, care: access.careGuides, glossary: access.glossary }} onNavigate={(p) => { if (!URL_FOR_PAGE[p]) return; openPage(p); setSearchQuery(""); }} />
              : <SearchPrompt />)} />
            <Route path="/species"       element={section("species", access.browse, <BrowseScreen onSpecies={openPage} />)} />
            <Route path="/care"          element={section("care", access.careGuides, <CareScreen onGuide={openPage} />)} />
            <Route path="/licencing"     element={section("licensing", access.licensing, <LegalScreen />)} />
            <Route path="/id"            element={idElement} />
            <Route path="/glossary"      element={section("glossary", access.glossary, <GlossaryScreen showCredits={access.credits} />)} />
            <Route path="/credits"       element={allow(access.credits, <Suspense fallback={null}><CreditsScreen /></Suspense>)} />
            <Route path="/species/:slug" element={allow(access.speciesPages, <DetailRoute table={SPECIES_BY_SLUG} legacy={LEGACY_SPECIES} base="/species" onBack={handleBack} home={home} />)} />
            <Route path="/care/:slug"    element={allow(access.careGuides, <DetailRoute table={GUIDES_BY_SLUG} legacy={LEGACY_GUIDES} base="/care" onBack={handleBack} home={home} />)} />
            {["community", "profile"].map(k => (
              <Route key={k} path={`/${k}`} element={tabByKey[k]
                ? <TabPage tab={tabByKey[k]} items={shell.tiles.filter(i => i.tab === k)} onOpen={go} />
                : toHome} />
            ))}
            {PLACEHOLDERS.map(s => (
              <Route key={s.key} path={s.path} element={shell.byKey[s.key] ? comingSoon(shell.byKey[s.key]) : toHome} />
            ))}
            <Route path="*"              element={toHome} />
          </Routes>
        </div>

        {showNav && <>
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "white", borderTop: "0.5px solid #e8e8e4", display: "flex", flexDirection: "column", paddingTop: NAV.top, zIndex: 100 }}>
          <nav aria-label="Main" style={{ display: "flex", width: "100%" }}>
            {shell.tabs.map(t => (
              <button key={t.key} type="button" data-testid={`tab-${t.key}`} onClick={() => go(t.path)} aria-current={activeTab === t.key ? "page" : undefined} style={{ flex: 1, minWidth: 0, background: "none", border: "none", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3, cursor: "pointer", padding: 0, height: NAV.row, fontFamily: "inherit" }}>
                <span aria-hidden="true" style={{ height: 24, display: "flex", alignItems: "center", color: activeTab === t.key ? C.green : C.muted }}><Icon name={t.icon} size={22} strokeWidth={activeTab === t.key ? 2.1 : 1.8} /></span>
                <span style={{ fontSize: 10, lineHeight: "13px", color: activeTab === t.key ? C.green : C.muted, fontWeight: activeTab === t.key ? 700 : 400, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "100%" }}>{t.label}</span>
              </button>
            ))}
          </nav>
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
