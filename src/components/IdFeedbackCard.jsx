import { useEffect, useMemo } from "react";
import { C } from "../constants/colours";
import WarnBox from "./WarnBox";
import { SPECIES } from "../data/species";
import { BETA_HEADER } from "../beta/betaAccess";
import { useSessionState } from "../beta/idSession";

// ─── AI ID beta feedback card ─────────────────────────────────────
// "Was this right?" → verdict, correct species, traits, notes, and an opt-in
// (default off, per photo) to save the photo for ATR's reference library.
// traitsBySpecies comes from /api/beta-check, so the draft morph list never
// ships in the public bundle.

export const CONSENT_LABEL = "Save my photo to help train ATR's ID (optional)";
export const CONSENT_TEXT = "Your photo is kept privately by All Things Reptile to improve identification. It is never published, and we'll delete it if you ask.";

const VERDICTS = [
  { id: "correct", label: "Correct" },
  { id: "partly",  label: "Partly"  },
  { id: "wrong",   label: "Wrong"   },
];
const SPECIES_OPTIONS = [...SPECIES].sort((a, b) => a.name.localeCompare(b.name));

const label = { fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.07em", margin: "14px 0 6px" };
const field = { width: "100%", boxSizing: "border-box", border: "1px solid #e0e0dc", borderRadius: 10, padding: "9px 10px", fontSize: 14, fontFamily: "inherit", background: "white", color: "#111" };
const pill = (on) => ({
  background: on ? C.green : "white", color: on ? "white" : C.green, border: `1.5px solid ${C.green}`,
  borderRadius: 10, padding: "8px 0", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", flex: 1,
});
const chip = (on) => ({
  background: on ? C.greenPale : "white", color: on ? C.green : "#555", border: `1px solid ${on ? C.green : "#e0e0dc"}`,
  borderRadius: 8, padding: "5px 9px", fontSize: 12, fontWeight: on ? 700 : 500, cursor: "pointer", fontFamily: "inherit",
});

const IdFeedbackCard = ({ result, photo, inviteCode, traitsBySpecies = {}, onRevoked, runId = 0 }) => {
  const top = (result && result.suggestions && result.suggestions[0]) || null;
  // Kept per result in memory, so a half-filled (or sent) card survives a trip
  // to a care guide and back.
  const k = (name) => `fb:${runId}:${name}`;
  const [verdict, setVerdict] = useSessionState(k("verdict"), "");
  const [species, setSpecies] = useSessionState(k("species"), top && top.inApp && top.slug ? top.slug : "");
  const [otherName, setOtherName] = useSessionState(k("otherName"), "");
  const [traits, setTraits] = useSessionState(k("traits"), () => (top && top.traits ? top.traits.map(t => t.id) : []));
  const [notes, setNotes] = useSessionState(k("notes"), "");
  const [consent, setConsent] = useSessionState(k("consent"), false);
  const [status, setStatus] = useSessionState(k("status"), "idle"); // idle | sending | sent | error
  const [error, setError] = useSessionState(k("error"), "");
  // A send interrupted by leaving the screen didn't finish; let them send again.
  useEffect(() => { if (status === "sending") setStatus("idle"); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const traitOptions = useMemo(() => traitsBySpecies[species] || [], [traitsBySpecies, species]);

  // The AI's own suggestions go at the top of the list. One that isn't an app
  // species (e.g. Jacky Dragon) fills in "Other" with its name in one tap.
  const suggested = (result && result.suggestions) || [];
  const chooseSpecies = (value) => {
    if (value.startsWith("ai:")) {
      const s = suggested[Number(value.slice(3))];
      if (s) setOtherName(s.latin ? `${s.name} (${s.latin})` : s.name);
      value = "other";
    }
    const slug = value;
    setSpecies(slug);
    // Keep only traits that exist for the new species.
    const allowed = new Set((traitsBySpecies[slug] || []).map(t => t.id));
    setTraits(ts => ts.filter(t => allowed.has(t)));
  };
  const toggleTrait = (id) => setTraits(ts => (ts.includes(id) ? ts.filter(t => t !== id) : [...ts, id]));

  const submit = async () => {
    if (!verdict || status === "sending") return;
    setStatus("sending"); setError("");
    const body = {
      ai: result,
      verdict,
      correctSpeciesSlug: species || null,
      correctSpeciesOther: species === "other" ? otherName : undefined,
      correctTraits: traits,
      notes,
      photoConsent: consent && Boolean(photo),
      ...(consent && photo ? { photo } : {}),
    };
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json", [BETA_HEADER]: inviteCode },
        body: JSON.stringify(body),
      });
      if (res.status === 403) { if (onRevoked) onRevoked(); return; }
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Couldn't send your feedback. Try again.");
      setStatus("sent");
    } catch (err) {
      setStatus("error");
      setError(err.message && err.message !== "Failed to fetch" ? err.message : "Couldn't reach the server. Check your connection and try again.");
    }
  };

  if (status === "sent") {
    return (
      <div style={{ background: C.greenPale, borderRadius: 14, padding: 16, marginBottom: 12, textAlign: "center" }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: C.green, marginBottom: 4 }}>Thanks — feedback sent</div>
        <div style={{ fontSize: 12, color: "#555", lineHeight: 1.5 }}>Every correction helps us make ATR's ID more accurate.</div>
      </div>
    );
  }

  const needsName = species === "other" && !otherName.trim();
  // The server needs either the right species or a note when the AI was wrong.
  const needsAnswer = verdict === "wrong" && !species && !notes.trim();
  const canSend = verdict && !needsName && !needsAnswer && status !== "sending";

  return (
    <div style={{ background: "white", borderRadius: 14, border: `1.5px solid ${C.greenPale}`, padding: 14, marginBottom: 12 }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: "#111" }}>Was this right?</div>
      <div style={{ fontSize: 11, color: "#999", marginTop: 2 }}>Beta tester feedback</div>

      <div style={{ display: "flex", gap: 8, marginTop: 10 }} role="group" aria-label="Was this right?">
        {VERDICTS.map(v => (
          <button key={v.id} type="button" aria-pressed={verdict === v.id} onClick={() => setVerdict(v.id)} style={pill(verdict === v.id)}>{v.label}</button>
        ))}
      </div>

      {verdict && (
        <>
          <label htmlFor="fb-species" style={{ ...label, display: "block" }}>{verdict === "correct" ? "Species" : "What is it actually?"}</label>
          <select id="fb-species" value={species} onChange={e => chooseSpecies(e.target.value)} style={field}>
            <option value="">Not sure</option>
            {suggested.length > 0 && (
              <optgroup label="From the suggestions">
                {suggested.map((s, i) => (s.inApp && s.slug
                  ? <option key={`s${i}`} value={s.slug}>{s.name}</option>
                  : <option key={`s${i}`} value={`ai:${i}`}>{s.name} (not in the app)</option>))}
              </optgroup>
            )}
            <optgroup label="Not listed">
              <option value="other">Other — type the name</option>
            </optgroup>
            <optgroup label="All app species">
              {SPECIES_OPTIONS.map(s => <option key={s.slug} value={s.slug}>{s.name}</option>)}
            </optgroup>
          </select>
          {species === "other" && (
            <input aria-label="Species name" placeholder="Common or latin name" value={otherName} maxLength={120} onChange={e => setOtherName(e.target.value)} style={{ ...field, marginTop: 8 }} />
          )}

          {traitOptions.length > 0 && (
            <>
              <div style={label}>Morphs / traits (pick all that apply)</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {traitOptions.map(t => (
                  <button key={t.id} type="button" aria-pressed={traits.includes(t.id)} onClick={() => toggleTrait(t.id)} style={chip(traits.includes(t.id))}>{t.name}</button>
                ))}
              </div>
            </>
          )}

          <label htmlFor="fb-notes" style={{ ...label, display: "block" }}>Notes</label>
          <textarea id="fb-notes" value={notes} maxLength={2000} rows={3} onChange={e => setNotes(e.target.value)} placeholder="Anything the AI missed (locality, age, lighting…)" style={{ ...field, resize: "vertical" }} />

          {photo && (
            <label style={{ display: "flex", gap: 10, alignItems: "flex-start", marginTop: 14, cursor: "pointer" }}>
              <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} style={{ marginTop: 3, accentColor: C.green, width: 16, height: 16, flexShrink: 0 }} />
              <span>
                <span style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#333" }}>{CONSENT_LABEL}</span>
                <span style={{ display: "block", fontSize: 12, color: "#777", lineHeight: 1.5, marginTop: 2 }}>{CONSENT_TEXT}</span>
              </span>
            </label>
          )}

          {needsAnswer && <div style={{ fontSize: 12, color: "#888", marginTop: 10 }}>Pick the right species or add a note so we know what it is.</div>}
          {status === "error" && <div style={{ marginTop: 12 }}><WarnBox type="gold" title="Couldn't send feedback">{error}</WarnBox></div>}

          <button type="button" onClick={submit} disabled={!canSend} style={{
            background: C.green, color: "white", border: "none", borderRadius: 10, padding: "10px 20px", fontSize: 14, fontWeight: 700,
            width: "100%", marginTop: 14, fontFamily: "inherit", cursor: canSend ? "pointer" : "default", opacity: canSend ? 1 : 0.5,
          }}>
            {status === "sending" ? "Sending…" : "Send feedback"}
          </button>
        </>
      )}
    </div>
  );
};

export default IdFeedbackCard;
