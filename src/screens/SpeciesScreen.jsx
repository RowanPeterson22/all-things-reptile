import { useCallback, useState } from "react";
import SpeciesPage from "../components/SpeciesPage";
import SpeciesBlocks from "../components/SpeciesBlocks";
import { useSpeciesContent } from "../data/speciesContent";

// ─── Species page (data-driven, D5) ───────────────────────────────
// One page for all 46 species: the document for :slug (bundled snapshot
// first, then the published copy from the server) laid out by
// SpeciesBlocks inside the dark SpeciesPage shell (hero slideshow, credits,
// tabs). Tab sets come from the document, so they still differ by species.
// `slug` is required; the route has already checked it exists.
// /admin → Species previews an unsaved draft with the same component: `doc`
// replaces the fetched document, and `tab`/`onTab` let the editor follow along.

const SpeciesScreen = ({ slug, onBack, fetchImpl, doc: draft, tab, onTab }) => {
  const doc = useSpeciesContent(slug, { fetchImpl, doc: draft });
  // Toggle choices (the Bearded Dragon's age switch) live here, so they survive
  // switching tabs, as they did when the state lived in the page component.
  const [toggleState, setToggleState] = useState({});
  const toggles = {
    get: (id) => toggleState[id],
    set: useCallback((id, k) => setToggleState(t => ({ ...t, [id]: k })), []),
  };
  if (!doc) return null;
  const byKey = Object.fromEntries(doc.tabs.map(t => [t.key, t]));
  return (
    <SpeciesPage onBack={onBack} name={doc.name} latin={doc.latin} aka={doc.aka || undefined} emoji={doc.emoji}
      badges={doc.badges.map(label => [label])}
      tabs={doc.tabs.map(t => t.key)} tab={tab} onTab={onTab}
      tabContent={(key) => (byKey[key] ? <SpeciesBlocks blocks={byKey[key].blocks} toggles={toggles} path={`${key}:`} /> : null)} />
  );
};

export default SpeciesScreen;
