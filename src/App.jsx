import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate, useParams } from "react-router-dom";
import { T, SIZE, NAV_BOTTOM, NAV_CLEARANCE } from "./constants/theme";
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
import SpeciesScreen from "./screens/SpeciesScreen";
import EnclosurePage from "./pages/care/EnclosurePage";
import TempPage from "./pages/care/TempPage";
import FeedingNutritionPage from "./pages/care/FeedingNutritionPage";
import HandlingPage from "./pages/care/HandlingPage";
import HealthPage from "./pages/care/HealthPage";
import SheddingPage from "./pages/care/SheddingPage";
import FeederGuidePage from "./pages/care/FeederGuidePage";
import { SPECIES } from "./data/species";
import { CARE_GUIDES } from "./data/careGuides";
import { BUNDLED, speciesBySlug, useSpeciesList } from "./data/speciesContent";

// Closed beta (D9): the ID screen and feedback card load as a separate chunk,
// fetched only once an invite code is verified, so the public bundle carries none of it.
const IdentifyScreen = lazy(() => import("./screens/IdentifyScreen"));
// Admin (interim, until D7): its own chunk, loaded only after /api/admin-check
// confirms an is_admin code. No tab points to it; it lives at /admin.
const AdminApp = lazy(() => import("./admin/AdminApp"));
// Photo credits (linked from the Glossary footer): its own small chunk.
const CreditsScreen = lazy(() => import("./screens/CreditsScreen"));


// ─── Page router map (care guides; species pages are data, D5) ────
const PAGE_MAP = {
  enclosure:   EnclosurePage,
  temp:         TempPage,
  feedingnutrition: FeedingNutritionPage,
  handling:     HandlingPage,
  health:       HealthPage,
  shedding:     SheddingPage,
  feeders:     FeederGuidePage,
};

// ─── Route tables (D4: routes use slug only) ──────────────────────
// Only entries with a page are routable (keeps the Browse "has a page" guard):
// a care guide needs its component, a species its content document.
const SPECIES_BY_SLUG = Object.fromEntries(SPECIES.filter(s => s.page && BUNDLED[s.slug]).map(s => [s.slug, s]));
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

const FONT = T.font;
// Screen-reader-only text (the tab labels: the bar shows icons, as designed).
const SR_ONLY = { position: "absolute", width: 1, height: 1, padding: 0, margin: -1, overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap", border: 0 };
const Blank = () => <div style={{ minHeight: "100vh", background: T.bg }} />;
const Notice = ({ title, children }) => (
  <div style={{ minHeight: "100vh", background: T.bg, color: T.text, fontFamily: FONT, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, boxSizing: "border-box" }}>
    <div style={{ maxWidth: 360, textAlign: "center" }}>
      <div style={{ fontSize: 18, fontWeight: 700, color: T.text, marginBottom: 8 }}>{title}</div>
      <div style={{ fontSize: 14, color: T.muted, lineHeight: 1.6 }}>{children}</div>
    </div>
  </div>
);
const SearchPrompt = () => <div style={{ padding: 40, textAlign: "center", fontSize: 14, color: T.muted, fontFamily: FONT }}>Type at least two letters to search.</div>;

// ─── Header pieces (the dark design) ──────────────────────────────
// Home: the small logo top left and a round search button (OptionC).
// Every other non-detail screen: a big bold page title instead of the old
// full-width logo band (Rowan: too big), then search / the Learn sub-nav.
const SAFE_TOP = "calc(env(safe-area-inset-top, 0px) + 12px)";
const HomeHeader = ({ canSearch, onSearch }) => (
  <header style={{ padding: `${SAFE_TOP} ${SIZE.pad}px 8px`, display: "flex", alignItems: "center", justifyContent: "space-between", minHeight: 44 }}>
    <img src="/header-logo-dark.png" alt="All Things Reptile" style={{ height: 26, width: "auto", display: "block", maxWidth: "70%" }} />
    {canSearch && (
      <button type="button" aria-label="Search" onClick={onSearch}
        style={{ width: 44, height: 44, borderRadius: 22, border: "none", background: T.field, color: T.text, display: "flex", alignItems: "center", justifyContent: "center", padding: 0, cursor: "pointer", flexShrink: 0 }}>
        <Icon name="search" size={20} strokeWidth={2} />
      </button>
    )}
  </header>
);
const PageTitle = ({ children }) => (
  <h1 style={{ margin: "0 0 14px", fontSize: "clamp(30px, 9vw, 34px)", fontWeight: 700, lineHeight: 1.1, letterSpacing: "-0.02em", color: T.text, overflowWrap: "break-word" }}>{children}</h1>
);

// Detail page: renders the species / care guide for :slug, or sends unknown slugs home.
const DetailRoute = ({ table, legacy = {}, base, onBack, home = "/" }) => {
  const { slug } = useParams();
  const entry = table[slug];
  if (!entry && legacy[slug]) return <Navigate to={`${base}/${legacy[slug]}`} replace />;
  if (!entry) return <Navigate to={home} replace />;
  if (base === "/species") return <SpeciesScreen key={slug} slug={slug} onBack={onBack} />;
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
  // The published name when we have it (D5), else the bundled one.
  if (first === "species" && second) return SPECIES_BY_SLUG[second] ? `${(speciesBySlug(second) || SPECIES_BY_SLUG[second]).name} · ${SITE}` : SITE;
  if (first === "care" && second) return GUIDES_BY_SLUG[second] ? `${GUIDES_BY_SLUG[second].title} · ${SITE}` : SITE;
  if (first === "admin") return `Admin · ${SITE}`;
  const name = PATH_TITLES[path];
  return name ? `${name} · ${SITE}` : SITE;
};

// /admin keeps its light look (internal tool): light colour-scheme, white page.
const AdminWait = () => <div style={{ padding: 24, fontSize: 13, color: "#666", background: "white", colorScheme: "light", minHeight: "100vh", fontFamily: FONT }}>Checking access…</div>;

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
  // No code: the public layout (one cached GET), or the built-in defaults.
  const pub = usePublicLayout(beta.status === "none" && !isAdminPath);
  // Published species names (D5) for testers, or for everyone once the site is public.
  const liveContent = betaOk || (pub.status === "ok" && pub.live === true);
  const speciesList = useSpeciesList(liveContent && !isAdminPath);
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

  // Re-titles when the published names arrive.
  useEffect(() => { document.title = titleFor(pathname); }, [pathname, speciesList]);

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
      <div style={{ colorScheme: "light", background: "white", color: "#111", minHeight: "100vh" }}>
        <Routes>
          <Route path="/admin/*" element={adminElement} />
        </Routes>
      </div>
    );
  }

  if (beta.status === "error") {
    return (
      <Notice title="Couldn't check your access">
        Check your connection and try again.
        <div><button type="button" onClick={beta.retry} style={{ marginTop: 16, background: T.accent, color: T.onAccent, border: "none", borderRadius: 14, padding: "10px 22px", minHeight: 48, fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Try again</button></div>
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

  // The big title on screens without their own header: the tab's name (Learn,
  // ID, Community, My Profile), "Search" on /search; a single-screen visitor
  // gets the section's name.
  const tabLabel = tabByKey[activeTab] && tabByKey[activeTab].label;
  const pageTitle = pathname === "/search" ? "Search" : (shell.full && tabLabel) || PATH_TITLES[pathname] || tabLabel || SITE;

  return (
    <div data-theme={T.name} style={{ display: "flex", flexDirection: "column", fontFamily: FONT, minHeight: "100vh", background: T.bg, color: T.text, colorScheme: T.scheme }}>

        {!isDetail && (onHome
          ? <HomeHeader canSearch={access.search} onSearch={() => go("/search")} />
          : (
          <header style={{ padding: `${SAFE_TOP} ${SIZE.pad}px 0` }}>
            <PageTitle>{pageTitle}</PageTitle>
            {showHeaderSearch && <SearchField
              placeholder="Search species, care guides, glossary..."
              value={searchQuery}
              onChange={onQuery}
              onClear={clearQuery}
              autoFocus={pathname === "/search"}
            />}
            {showLearnNav && <LearnNav items={shell.learnNav} active={pathname} onGo={go} />}
          </header>
        ))}

        <main style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          <Routes>
            <Route path="/"              element={shell.full
              ? <HomeScreen shell={shell} canSearch={access.search} query={searchQuery} onQuery={onQuery} onClearQuery={clearQuery} onOpen={go} profileTab={tabByKey.profile} />
              : toHome} />
            <Route path="/search"        element={allow(access.search, searchQuery.length >= 2
              ? <SearchResults query={searchQuery} live={liveContent} show={{ species: access.speciesPages, care: access.careGuides, glossary: access.glossary }} onNavigate={(p) => { if (!URL_FOR_PAGE[p]) return; openPage(p); setSearchQuery(""); }} />
              : <SearchPrompt />)} />
            <Route path="/species"       element={section("species", access.browse, <BrowseScreen onSpecies={openPage} live={liveContent} />)} />
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
        </main>

        <footer style={{ textAlign: "center", fontSize: 11, lineHeight: "16px", color: T.muted, padding: showNav ? "8px 0 0" : "12px 0 calc(env(safe-area-inset-bottom, 0px) + 12px)" }}>© 2026 Amphibian Pty Ltd</footer>

        {showNav && <>
        {/* Clearance for the floating bar: its height, its offset from the
            bottom (the home indicator's safe area) and a 16 px margin, so the
            end of every screen clears it. */}
        <div aria-hidden="true" data-testid="nav-clearance" style={{ height: NAV_CLEARANCE, flexShrink: 0 }} />
        <nav aria-label="Main" style={{ position: "fixed", left: "50%", transform: "translateX(-50%)", width: `min(calc(100% - ${SIZE.navSide * 2}px), 480px)`, bottom: NAV_BOTTOM, height: SIZE.navH, boxSizing: "border-box", background: T.nav, borderRadius: SIZE.navH / 2, boxShadow: T.navShadow, display: "grid", gridTemplateColumns: `repeat(${shell.tabs.length}, minmax(0, 1fr))`, alignItems: "center", padding: "0 6px", zIndex: 100 }}>
          {shell.tabs.map(t => {
            const on = activeTab === t.key;
            return (
              <button key={t.key} type="button" data-testid={`tab-${t.key}`} onClick={() => go(t.path)} aria-current={on ? "page" : undefined} title={t.label}
                style={{ position: "relative", height: SIZE.navH - 8, minWidth: 0, background: "none", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", padding: 0, fontFamily: "inherit", borderRadius: 26 }}>
                <span aria-hidden="true" style={{ width: 52, maxWidth: "100%", height: 44, borderRadius: 22, display: "flex", alignItems: "center", justifyContent: "center", background: on ? T.accent : "transparent", color: on ? T.onAccent : T.navIdle }}>
                  <Icon name={t.icon} size={22} strokeWidth={2} />
                </span>
                <span style={SR_ONLY}>{t.label}</span>
              </button>
            );
          })}
        </nav>
        </>}
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
