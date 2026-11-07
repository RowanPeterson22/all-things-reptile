import { C } from "../constants/colours";
import { usePublicPhotos } from "../components/SpeciesGallery";
import { CreditText } from "../components/PhotoCredit";
import { objectPosition } from "../components/focal";

// ─── /credits: every photo shown in the app, with its full credit ─
// Lists credits even for photos whose icon is hidden (stock or CC0 that needs
// no attribution), so the page is a complete record. Linked from the Glossary
// footer.

const groupBySpecies = (photos) => {
  const groups = [];
  const at = {};
  for (const p of photos) {
    const key = p.species || "other";
    if (!(key in at)) { at[key] = groups.length; groups.push({ key, name: p.speciesName || key, scientific: p.scientific, photos: [] }); }
    groups[at[key]].photos.push(p);
  }
  return groups.sort((a, b) => a.name.localeCompare(b.name));
};

const CreditsScreen = ({ fetchImpl }) => {
  const photos = usePublicPhotos(null, { all: true, fetchImpl });
  const groups = groupBySpecies(photos);
  return (
    <div style={{ padding: "18px 18px 28px" }}>
      <div style={{ fontSize: 20, fontWeight: 700, color: "#111", marginBottom: 4 }}>Photo credits</div>
      <div style={{ fontSize: 13, color: "#666", lineHeight: 1.6, marginBottom: 16 }}>
        The photos on our species pages come from photographers who share their work under open licences, give us permission, or license it to us. Thank you to every one of them.
      </div>
      {groups.length === 0 && <div style={{ fontSize: 13, color: "#888" }}>No photos are shown in the app yet.</div>}
      {groups.map(g => (
        <section key={g.key} style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.green }}>{g.name}</div>
          {g.scientific && <div style={{ fontSize: 11, color: "#888", fontStyle: "italic", marginBottom: 6 }}>{g.scientific}</div>}
          {g.photos.map(p => (
            <div key={p.id} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "8px 0", borderTop: "0.5px solid #eee" }}>
              <img src={p.url} alt={p.alt || ""} loading="lazy" decoding="async" width={64} height={48}
                style={{ width: 64, height: 48, objectFit: "cover", objectPosition: objectPosition(p.focal), borderRadius: 6, flex: "0 0 auto", background: "#f0f0ec" }} />
              <CreditText credit={p.credit} style={{ minWidth: 0, overflowWrap: "anywhere" }} />
            </div>
          ))}
        </section>
      ))}
    </div>
  );
};

export default CreditsScreen;
