// ─── Type-ahead search over the species index (AI ID beta) ────────
// Pure functions so the picker's ranking can be unit-tested. Works on the slim
// records from src/data/speciesPicker.json ({ s, c, n, a?, p?, v? }); see
// lib/speciesPicker.js for the key names.

export const normalise = (v) => String(v || "")
  .normalize("NFD").replace(/[̀-ͯ]/g, "")
  .toLowerCase()
  .replace(/[’']/g, "")
  .replace(/[^a-z0-9]+/g, " ")
  .trim();

const words = (s) => (s ? s.split(" ") : []);

// Slim record → picker entry with precomputed search keys.
export const prepareIndex = (records) => records.map(r => {
  const common = normalise(r.c);
  const sci = normalise(r.n);
  const alt = (r.a || []).map(normalise).filter(Boolean);
  return {
    slug: r.s, common: r.c, scientific: r.n, otherNames: r.a || [],
    appSlug: r.p || null, venomous: Boolean(r.v),
    _common: common, _sci: sci, _alt: alt,
    _commonWords: words(common), _sciWords: words(sci), _altWords: alt.flatMap(words),
  };
});

// Every query word must start some word in the field.
const allPrefix = (qWords, fieldWords) => qWords.every(q => fieldWords.some(w => w.startsWith(q)));

// Lower is better; null means no match.
const score = (e, q, qWords) => {
  if (e._common === q || e._sci === q) return 0;
  if (e._common.startsWith(q)) return 1;
  if (e._sci.startsWith(q)) return 2;
  if (e._alt.some(a => a === q || a.startsWith(q))) return 3;
  if (allPrefix(qWords, e._commonWords)) return 4;
  if (allPrefix(qWords, e._sciWords)) return 5;
  if (allPrefix(qWords, [...e._commonWords, ...e._sciWords, ...e._altWords])) return 6;
  if (q.length >= 3 && (e._common.includes(q) || e._sci.includes(q) || e._alt.some(a => a.includes(q)))) return 7;
  return null;
};

// Ranked matches for a query: best score first, then alphabetical by common
// name. App species get no boost: every native is weighed the same.
export const searchSpecies = (entries, query, limit = 12) => {
  const q = normalise(query);
  if (!q || !entries) return [];
  const qWords = words(q);
  const hits = [];
  for (const e of entries) {
    const sc = score(e, q, qWords);
    if (sc !== null) hits.push([sc, e]);
  }
  hits.sort((a, b) => a[0] - b[0] || a[1].common.localeCompare(b[1].common, "en"));
  return hits.slice(0, limit).map(h => h[1]);
};

// The other name that matched, to show why a result came up (e.g. a synonym).
export const matchedAltName = (entry, query) => {
  const q = normalise(query);
  if (!q || entry._common.includes(q) || entry._sci.includes(q)) return null;
  const qWords = words(q);
  const i = entry._alt.findIndex(a => a.includes(q) || allPrefix(qWords, words(a)));
  return i >= 0 ? entry.otherNames[i] : null;
};

// Lazily load the index: a separate chunk that only beta testers ever fetch.
let cache = null;
export const loadSpeciesIndex = () => {
  if (!cache) {
    cache = import(/* webpackChunkName: "species-picker" */ "../data/speciesPicker.json")
      .then(m => prepareIndex(m.default || m))
      .catch(err => { cache = null; throw err; });
  }
  return cache;
};
