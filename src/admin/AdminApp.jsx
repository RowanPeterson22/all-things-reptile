import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { NavLink, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { C } from "../constants/colours";
import { makeApi } from "./api";
import { searchText } from "./species";
import { N } from "./ui";
import LibraryScreen from "./LibraryScreen";
import SpeciesPhotosScreen from "./SpeciesPhotosScreen";
import AddPhotoScreen from "./AddPhotoScreen";
import FeedbackScreen from "./FeedbackScreen";
import TestersScreen from "./TestersScreen";
import SectionsScreen from "./SectionsScreen";
import IndexScreen from "./IndexScreen";
import MorphsScreen from "./MorphsScreen";
import CategoriesScreen from "./CategoriesScreen";
import ScrollRow from "../components/ScrollRow";

// ─── ATR admin (interim access: an is_admin beta tester, until D7) ─
// Loaded as its own chunk, only after /api/admin-check says yes, so the public
// bundle carries none of it. No tab points here: Rowan bookmarks /admin.
// Every read and write goes through an api/admin-* route that re-checks access.

const NAV = [
  { to: "/admin", label: "Photos", end: true },
  { to: "/admin/add", label: "Add photo" },
  { to: "/admin/categories", label: "Categories" },
  { to: "/admin/morphs", label: "Morphs" },
  { to: "/admin/feedback", label: "Feedback" },
  { to: "/admin/testers", label: "Testers" },
  { to: "/admin/sections", label: "Sections" },
  { to: "/admin/index", label: "Species index" },
];

const navStyle = ({ isActive }) => ({
  color: isActive ? "white" : "rgba(255,255,255,0.85)", fontWeight: isActive ? 700 : 500, fontSize: 13,
  textDecoration: "none", padding: "11px 2px 12px", borderBottom: `2px solid ${isActive ? "white" : "transparent"}`, whiteSpace: "nowrap",
});

// Gated or public, as the server reports it (api/admin-check). Shown on every
// admin screen so nobody forgets which state the live site is in.
export const GateBanner = ({ gate }) => {
  const known = Boolean(gate);
  const isPublic = known && gate.public;
  const noSecret = known && !gate.public && !gate.secretSet;
  const bg = !known ? N.wash : isPublic ? C.redPale : noSecret ? C.goldLight : C.greenPale;
  const fg = !known ? N.muted : isPublic ? C.red : noSecret ? C.gold : C.green;
  const text = !known ? "Couldn't read the site's gate status from the server."
    : isPublic ? "Site is PUBLIC: ATR_PUBLIC=true, anyone can open the app."
    : noSecret ? "Site is GATED, but ATR_GATE_SECRET isn't set: everyone, testers included, gets the holding page."
    : "Site is GATED: only invited testers get past the holding page.";
  return <div role="status" data-testid="gate-banner" style={{ background: bg, color: fg, fontSize: 12, fontWeight: 700, padding: "8px 16px", textAlign: "center" }}>{text}</div>;
};

const AdminApp = ({ inviteCode, adminId, adminName, gate, onForbidden }) => {
  const navigate = useNavigate();
  // A ref keeps the client stable across renders, so screens don't reload when the parent re-renders.
  const forbiddenRef = useRef(onForbidden);
  forbiddenRef.current = onForbidden;
  const api = useMemo(() => makeApi(inviteCode, () => forbiddenRef.current && forbiddenRef.current()), [inviteCode]);
  const [data, setData] = useState(null); // { species, counts, morphs (catalogue), morphSource }
  const [err, setErr] = useState("");

  useEffect(() => {
    let live = true;
    api("admin-species")
      .then(d => { if (live) setData({ ...d, species: d.species.map(r => ({ ...r, _q: searchText(r) })) }); })
      .catch(e => { if (live) setErr(e.message); });
    return () => { live = false; };
  }, [api]);

  const refreshCounts = useCallback(() => {
    api("admin-species", { query: { only: "counts" } })
      .then(d => setData(cur => (cur ? { ...cur, counts: d.counts } : cur)))
      .catch(() => { /* counts refresh on the next load */ });
  }, [api]);

  // Every morph write returns the whole catalogue; screens hand it back here.
  const setMorphs = useCallback((morphs) => setData(cur => (cur ? { ...cur, morphs, morphSource: "db" } : cur)), []);

  const species = data ? data.species : null;
  const bySlug = useMemo(() => (species ? Object.fromEntries(species.map(r => [r.slug, r])) : {}), [species]);
  const shared = data ? {
    api, species: data.species, bySlug, counts: data.counts, refreshCounts,
    catalogue: Array.isArray(data.morphs) ? data.morphs : [], setMorphs, morphsReadOnly: data.morphSource !== "db",
  } : null;

  return (
    <div style={{ minHeight: "100vh", background: C.cream, fontFamily: "'DM Sans', system-ui, sans-serif", color: N.ink }}>
      <div style={{ background: C.green, padding: "calc(env(safe-area-inset-top, 0px) + 10px) 16px 0", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, maxWidth: 960, margin: "0 auto" }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 17, fontWeight: 700, color: "white" }}>ATR Admin</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.9)" }}>{adminName ? `Signed in as ${adminName}` : "Private"}</div>
          </div>
          <button type="button" onClick={() => navigate("/")} style={{ background: "rgba(255,255,255,0.15)", border: "none", color: "white", borderRadius: 8, padding: "6px 12px", minHeight: 40, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Back to app</button>
        </div>
        <ScrollRow tone="dark" style={{ display: "flex", gap: 18, overflowX: "auto", maxWidth: 960, margin: "6px auto 0", WebkitOverflowScrolling: "touch" }}>
          {NAV.map(n => <NavLink key={n.to} to={n.to} end={n.end} style={navStyle}>{n.label}</NavLink>)}
        </ScrollRow>
      </div>

      <GateBanner gate={gate} />
      {err && <div style={{ padding: 16, color: C.red, fontSize: 13 }}>{err}</div>}
      {!shared && !err && <div style={{ padding: 16, color: N.muted, fontSize: 13 }}>Loading the species index…</div>}
      {shared && (
        <Routes>
          <Route index element={<LibraryScreen {...shared} />} />
          <Route path="species/:slug" element={<SpeciesPhotosScreen {...shared} />} />
          <Route path="add" element={<AddPhotoScreen {...shared} />} />
          <Route path="categories" element={<CategoriesScreen api={api} />} />
          <Route path="morphs" element={<MorphsScreen {...shared} readOnly={shared.morphsReadOnly} />} />
          <Route path="morphs/new" element={<MorphsScreen {...shared} readOnly={shared.morphsReadOnly} creating />} />
          <Route path="morphs/:id" element={<MorphsScreen {...shared} readOnly={shared.morphsReadOnly} />} />
          <Route path="feedback" element={<FeedbackScreen {...shared} />} />
          <Route path="testers" element={<TestersScreen api={api} adminId={adminId} />} />
          <Route path="sections" element={<SectionsScreen api={api} />} />
          <Route path="index" element={<IndexScreen {...shared} />} />
          <Route path="index/:slug" element={<IndexScreen {...shared} />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      )}
    </div>
  );
};

export default AdminApp;
