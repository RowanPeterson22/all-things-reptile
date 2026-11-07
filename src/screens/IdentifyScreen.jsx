import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { C } from "../constants/colours";
import WarnBox from "../components/WarnBox";
import IdFeedbackCard from "../components/IdFeedbackCard";
import IdSuggestionCard, { NotNativeNotice } from "../components/IdSuggestionCard";
import { BETA_HEADER } from "../beta/betaAccess";
import { useSessionState } from "../beta/idSession";

// ─── ID Reptile screen (D9 AI species ID — closed beta) ───────────
// Photo → downscaled JPEG in the browser → POST /api/identify → suggestions,
// then the tester's feedback (IdFeedbackCard). Only rendered for a verified
// invite code (App.jsx); every request carries it in the x-atr-beta header.

const MAX_EDGE = 1568;          // long edge sent to the API; keeps cost and upload size down
const JPEG_QUALITY = 0.85;

const SUGGESTION_TEXT = "This is a suggestion, not a confirmed identification.";
const SNAKE_WARNING = "Never approach or handle a wild snake based on this result — many Australian snakes are venomous. Keep your distance and call a licensed snake catcher.";
const SHORT_REMINDER = "Suggestion only. Never handle a wild snake based on it.";

// Decode any photo the browser can read and re-encode it as a JPEG data URL,
// no larger than MAX_EDGE on its long side. Also strips EXIF (including GPS).
const toJpegDataUrl = (file) => new Promise((resolve, reject) => {
  const url = URL.createObjectURL(file);
  const img = new Image();
  img.onload = () => {
    const scale = Math.min(1, MAX_EDGE / Math.max(img.naturalWidth, img.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
    canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
    URL.revokeObjectURL(url);
    resolve(canvas.toDataURL("image/jpeg", JPEG_QUALITY));
  };
  img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("decode")); };
  img.src = url;
});

const SafetyNotice = () => (
  <>
    <div style={{ fontSize: 13, fontWeight: 700, color: "#333", marginBottom: 8 }}>{SUGGESTION_TEXT}</div>
    <WarnBox type="red" title="⚠️ Wild snakes">{SNAKE_WARNING}</WarnBox>
  </>
);

const btn = (primary, disabled) => ({
  background: primary ? C.green : "white",
  color: primary ? "white" : C.green,
  border: primary ? "none" : `1.5px solid ${C.green}`,
  borderRadius: 10, padding: "10px 20px", fontSize: 14, fontWeight: 700,
  cursor: disabled ? "default" : "pointer", fontFamily: "inherit", opacity: disabled ? 0.5 : 1,
});

const IdentifyScreen = ({ inviteCode, traitsBySpecies = {}, onRevoked }) => {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const requestRef = useRef(null);
  // Held in memory (not browser storage) so the photo and results are still here
  // after opening a care guide from a result and tapping Back.
  const [photo, setPhoto] = useSessionState("id:photo", null);     // JPEG data URL
  const [status, setStatus] = useSessionState("id:status", "idle"); // idle | preparing | loading | done | error
  const [result, setResult] = useSessionState("id:result", null);
  const [error, setError] = useSessionState("id:error", "");
  const [runId, setRunId] = useSessionState("id:runId", 0);         // new feedback card per result

  // Abandon an in-flight request if the user leaves the screen; on return, a
  // request that was cut off shows the photo ready to identify again.
  useEffect(() => {
    if (status === "loading" || status === "preparing") setStatus("idle");
    return () => requestRef.current && requestRef.current.abort();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const choosePhoto = async (e) => {
    const file = e.target.files && e.target.files[0];
    e.target.value = "";
    if (!file) return;
    if (requestRef.current) requestRef.current.abort();
    setResult(null); setError(""); setStatus("preparing");
    try {
      setPhoto(await toJpegDataUrl(file));
      setStatus("idle");
    } catch (err) {
      setPhoto(null); setStatus("error");
      setError("That photo couldn't be opened. Try a JPEG or PNG.");
    }
  };

  const identify = async () => {
    if (!photo) return;
    const controller = new AbortController();
    requestRef.current = controller;
    setStatus("loading"); setError(""); setResult(null);
    try {
      const res = await fetch("/api/identify", {
        method: "POST",
        headers: { "Content-Type": "application/json", [BETA_HEADER]: inviteCode },
        body: JSON.stringify({ image: photo }),
        signal: controller.signal,
      });
      if (res.status === 403) { if (onRevoked) onRevoked(); return; }
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Something went wrong. Try again.");
      setResult(data); setStatus("done"); setRunId(n => n + 1);
    } catch (err) {
      if (err.name === "AbortError") return;
      setStatus("error");
      setError(err.message && err.message !== "Failed to fetch" ? err.message : "Couldn't reach the ID service. Check your connection and try again.");
    }
  };

  const reset = () => {
    if (requestRef.current) requestRef.current.abort();
    setPhoto(null); setResult(null); setError(""); setStatus("idle");
  };

  const busy = status === "preparing" || status === "loading";

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
      <input ref={inputRef} type="file" accept="image/*" capture="environment" onChange={choosePhoto} style={{ display: "none" }} />

      {!photo ? (
        <div style={{ background: "white", border: "1.5px dashed #e0e0dc", borderRadius: 14, padding: "32px 16px", textAlign: "center", marginBottom: 16 }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>📷</div>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Identify a reptile or frog</div>
          <div style={{ fontSize: 13, color: "#888", lineHeight: 1.5 }}>Take or choose a clear photo and our AI will suggest what it might be</div>
          <button onClick={() => inputRef.current && inputRef.current.click()} disabled={busy} style={{ ...btn(true, busy), marginTop: 14 }}>
            {status === "preparing" ? "Preparing photo…" : "Take or choose a photo"}
          </button>
        </div>
      ) : (
        <div style={{ background: "white", borderRadius: 14, border: "0.5px solid #e8e8e4", padding: 12, marginBottom: 16 }}>
          <img src={photo} alt="The animal to identify" style={{ width: "100%", maxHeight: 320, objectFit: "contain", borderRadius: 10, background: C.cream, display: "block" }} />
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button onClick={identify} disabled={busy} style={{ ...btn(true, busy), flex: 1 }}>
              {status === "loading" ? "Identifying…" : result ? "Identify again" : "Identify"}
            </button>
            <button onClick={() => inputRef.current && inputRef.current.click()} disabled={status === "preparing"} style={btn(false, status === "preparing")}>New photo</button>
          </div>
          {status === "loading" && (
            <div style={{ fontSize: 12, color: "#888", textAlign: "center", marginTop: 10 }}>Looking closely — this usually takes a few seconds.</div>
          )}
        </div>
      )}

      <SafetyNotice />

      {status === "error" && <WarnBox type="gold" title="Couldn't identify this photo">{error}</WarnBox>}

      {status === "done" && result && (
        <div style={{ marginTop: 6 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 10 }}>Suggestions</div>

          {result.subject === "not_reptile_or_frog" && (
            <WarnBox type="blue" title="No reptile or frog found">This photo doesn't seem to show a reptile or frog. Try a closer photo of the animal.</WarnBox>
          )}
          {result.notNative && <NotNativeNotice />}
          {result.subject !== "not_reptile_or_frog" && (!result.suggestions || result.suggestions.length === 0) && (
            <WarnBox type="blue" title="No suggestion">We couldn't suggest a species from this photo. Try a clearer, closer photo in good light.</WarnBox>
          )}

          {(result.suggestions || []).map((s, i) => (
            <IdSuggestionCard key={i} suggestion={s} onOpen={(appSlug) => navigate(`/species/${appSlug}`, { state: { tab: "identify" } })} />
          ))}

          {result.note && (
            <div style={{ fontSize: 12, color: "#777", lineHeight: 1.5, marginBottom: 10 }}>
              <span style={{ fontWeight: 700, color: "#555" }}>Tip: </span>{result.note}
            </div>
          )}

          <IdFeedbackCard key={runId} runId={runId} result={result} photo={photo} inviteCode={inviteCode} traitsBySpecies={traitsBySpecies} onRevoked={onRevoked} />

          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 4 }}>
            <button onClick={reset} style={btn(false, false)}>Start again</button>
            <div style={{ flex: 1, fontSize: 11, color: C.red, lineHeight: 1.4 }}>{SHORT_REMINDER}</div>
          </div>
        </div>
      )}

      <div style={{ fontSize: 11, color: "#aaa", lineHeight: 1.6, marginTop: 12, textAlign: "center" }}>
        Your photo is sent to our AI provider for this check only. We don't keep it unless you choose to save it with your feedback.
      </div>
    </div>
  );
};

export default IdentifyScreen;
