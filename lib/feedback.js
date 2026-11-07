// ─── AI ID beta: tester feedback ─────────────────────────────────
// Used by api/feedback.js. Validates a tester's verdict on an AI result and
// writes it to id_feedback in the atr Supabase project.
//
// Photos: only stored when the tester ticked the per-photo consent box
// (photoConsent === true). A photo sent without consent is rejected, not
// silently dropped, so a client bug can't look like consent. Stored photos go
// to the private id-photos bucket at <tester_id>/<uuid>.jpg.

const crypto = require("crypto");
const { TRAIT_IDS } = require("./morphs");
const { MAX_BASE64_CHARS, MIN_BASE64_CHARS, sniffMediaType } = require("./identify");
const { SLUGS } = require("./speciesIndex");
const { insertFeedback, uploadPhoto, deletePhoto, SupabaseError } = require("./supabase");

// Species are stored as index slugs (src/data/australianSpecies.json), e.g.
// "jacky-dragon", for app and non-app species alike. Only "Other" stores free
// text: correct_species_slug null + correct_species_other. (Before Nov 2026 the
// server wrote the sentinel "not-one-of-our-species" for anything outside the
// 46 app species; those rows are left as they are.)
const VERDICTS = ["correct", "partly", "wrong"];
const TRAIT_SET = new Set(TRAIT_IDS);
// "other" in the picker: the tester types the species name instead.
const OTHER_PICK = "other";
const MAX_NOTES = 2000;
const MAX_OTHER_NAME = 120;
const MAX_TRAITS = 30;
// ai_raw is the result the tester saw (suggestions, note, subject). Cap it so a
// client can't stuff the table.
const MAX_AI_JSON = 20000;

class FeedbackError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}
const bad = (msg) => { throw new FeedbackError(400, msg); };

const cleanText = (v, max, label) => {
  if (v === undefined || v === null || v === "") return null;
  if (typeof v !== "string") bad(`${label} must be text.`);
  const t = v.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "").trim();
  if (t.length > max) bad(`${label} is too long (max ${max} characters).`);
  return t || null;
};

// Accepts a JPEG as raw base64 or a data URL. Same size/format checks as
// /api/identify, but JPEG only: the app always re-encodes to JPEG and the
// bucket only accepts image/jpeg.
const decodePhoto = (photo) => {
  if (typeof photo !== "string" || !photo) bad("The photo couldn't be read.");
  let data = photo;
  const m = /^data:([^;,]+);base64,/.exec(data);
  if (m) {
    if (m[1] !== "image/jpeg") throw new FeedbackError(415, "Only JPEG photos can be saved.");
    data = data.slice(m[0].length);
  }
  if (data.length > MAX_BASE64_CHARS) throw new FeedbackError(413, "That photo is too large to save (under 3 MB).");
  if (data.length < MIN_BASE64_CHARS || !/^[A-Za-z0-9+/]+={0,2}$/.test(data)) bad("The photo couldn't be read.");
  const buf = Buffer.from(data, "base64");
  if (sniffMediaType(buf.subarray(0, 24)) !== "image/jpeg") throw new FeedbackError(415, "Only JPEG photos can be saved.");
  return buf;
};

// Pull the fields we store from the AI result the client echoes back. We don't
// trust it as truth (it's tester-supplied); it records what they saw.
const aiFields = (ai) => {
  if (!ai || typeof ai !== "object" || Array.isArray(ai)) bad("Send the AI result you're giving feedback on.");
  let raw;
  try { raw = JSON.stringify(ai); } catch (e) { bad("The AI result couldn't be read."); }
  if (raw.length > MAX_AI_JSON) throw new FeedbackError(413, "The AI result is too large.");
  const suggestions = Array.isArray(ai.suggestions) ? ai.suggestions : [];
  const top = suggestions[0] && typeof suggestions[0] === "object" ? suggestions[0] : null;
  // Index slug of the AI's top pick; null when there was none or the model
  // named a species that isn't in the index (ai_raw keeps what it said).
  const topSlug = top && typeof top.slug === "string" && SLUGS.has(top.slug) ? top.slug : null;
  const aiTraits = top && Array.isArray(top.traits)
    ? top.traits.filter(t => t && typeof t.id === "string" && TRAIT_SET.has(t.id)).map(t => ({ id: t.id, confidence: t.confidence === "likely" ? "likely" : "possible" }))
    : [];
  const model = typeof ai.model === "string" ? ai.model.slice(0, 100) : null;
  return { model, ai_top_species_slug: topSlug, ai_traits: aiTraits, ai_raw: JSON.parse(raw) };
};

// body → { row, photo: Buffer|null }. Throws FeedbackError.
const validateFeedback = (body) => {
  if (!body || typeof body !== "object" || Array.isArray(body)) bad("Send a JSON body.");

  const verdict = typeof body.verdict === "string" ? body.verdict.trim().toLowerCase() : "";
  if (!VERDICTS.includes(verdict)) bad("Choose Correct, Partly or Wrong.");

  const ai = aiFields(body.ai);

  let correct_species_slug = null;
  let correct_species_other = null;
  const pick = body.correctSpeciesSlug;
  if (pick !== undefined && pick !== null && pick !== "") {
    if (typeof pick !== "string") bad("Unknown species.");
    if (pick === OTHER_PICK) {
      correct_species_other = cleanText(body.correctSpeciesOther, MAX_OTHER_NAME, "Species name");
      if (!correct_species_other) bad("Type the species name.");
    } else if (SLUGS.has(pick)) {
      correct_species_slug = pick;
    } else bad("Unknown species.");
  }
  // "Correct" means the top suggestion was right; record it as the answer.
  if (verdict === "correct" && !correct_species_slug && !correct_species_other && ai.ai_top_species_slug) {
    correct_species_slug = ai.ai_top_species_slug;
  }
  if (verdict === "wrong" && !correct_species_slug && !correct_species_other && !cleanText(body.notes, MAX_NOTES, "Notes")) {
    bad("Tell us what it actually is: pick a species or add a note.");
  }

  let correct_traits = [];
  if (body.correctTraits !== undefined && body.correctTraits !== null) {
    if (!Array.isArray(body.correctTraits)) bad("Traits must be a list.");
    if (body.correctTraits.length > MAX_TRAITS) bad("Too many traits.");
    for (const t of body.correctTraits) if (typeof t !== "string" || !TRAIT_SET.has(t)) bad("Unknown trait.");
    correct_traits = [...new Set(body.correctTraits)];
  }

  const notes = cleanText(body.notes, MAX_NOTES, "Notes");

  if (body.photoConsent !== undefined && typeof body.photoConsent !== "boolean") bad("Photo consent must be true or false.");
  const photo_consent = body.photoConsent === true;
  const hasPhoto = body.photo !== undefined && body.photo !== null && body.photo !== "";
  if (hasPhoto && !photo_consent) bad("A photo can only be saved if you tick the consent box.");
  if (photo_consent && !hasPhoto) bad("Tick the box only when sending a photo.");
  const photo = hasPhoto ? decodePhoto(body.photo) : null;

  return {
    row: { ...ai, verdict, correct_species_slug, correct_species_other, correct_traits, notes, photo_consent },
    photo,
  };
};

// Whole request. Returns { status, body }. tester comes from requireTester().
const submitFeedback = async (reqBody, { tester, cfg, fetchImpl, uuid = crypto.randomUUID } = {}) => {
  try {
    const { row, photo } = validateFeedback(reqBody);
    let photo_path = null;
    if (photo) {
      photo_path = `${tester.id}/${uuid()}.jpg`;
      await uploadPhoto(cfg, photo_path, photo, fetchImpl);
    }
    try {
      await insertFeedback(cfg, { ...row, tester_id: tester.id, photo_path }, fetchImpl);
    } catch (e) {
      // Don't leave an orphaned photo with no consent record pointing at it.
      if (photo_path) await deletePhoto(cfg, photo_path, fetchImpl).catch(() => console.error("feedback: orphan photo cleanup failed"));
      throw e;
    }
    return { status: 201, body: { ok: true, photoSaved: Boolean(photo_path) } };
  } catch (e) {
    if (e instanceof FeedbackError || e instanceof SupabaseError) return { status: e.status, body: { error: e.message } };
    console.error("feedback: unexpected error");
    return { status: 500, body: { error: "Something went wrong. Try again." } };
  }
};

module.exports = { validateFeedback, submitFeedback, FeedbackError, VERDICTS, OTHER_PICK, MAX_NOTES };
