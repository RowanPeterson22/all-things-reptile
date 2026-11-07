// ─── AI species ID: core logic (D9) ──────────────────────────────
// Used by api/identify.js. Kept outside api/ so Vercel doesn't deploy it as a
// separate function, and kept free of Vercel types so it can be unit-tested
// with a mocked fetch (src/__tests__/identify.test.js).
//
// Privacy: the image is forwarded to the Anthropic API and nothing else. It is
// never written to disk, stored or logged. (A beta tester can separately opt in
// to saving a photo with their feedback: see lib/feedback.js.)

const SPECIES = require("./identifySpecies");
const { MORPHS, TRAITS, TRAIT_IDS } = require("./morphs");
const INDEX = require("./speciesIndex");

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION = "2023-06-01";
// Override with the ANTHROPIC_MODEL env var (e.g. claude-haiku-5-5 to cut cost).
const DEFAULT_MODEL = "claude-sonnet-5-5";

// temperature 0 for repeatable answers, but only on models that still accept
// sampling parameters. Sonnet 4.6 onwards, Opus 4.7 onwards and the 5.x models
// return a 400 for a non-default temperature (Anthropic's Sonnet 5 migration
// guide, checked 7 Nov 2026), so for those it's left out and consistency comes
// from structured output, low effort and a fixed, cached prompt.
const acceptsTemperature = (model) => {
  const m = String(model || "");
  if (/^claude-3/.test(m)) return true;
  if (/^claude-(?:sonnet|opus)-4(?:-\d{8})?$/.test(m)) return true;           // Sonnet 4 / Opus 4
  if (/^claude-(?:haiku|sonnet)-4-5(?:$|-)/.test(m)) return true;             // Haiku / Sonnet 4.5
  if (/^claude-opus-4-[1-6](?:$|-)/.test(m)) return true;                     // Opus 4.1–4.6
  return false;
};

// Vercel caps a function request body at 4.5 MB, so cap the base64 string at
// 4 MB (about 3 MB of image). The app downscales photos well below this.
const MAX_BASE64_CHARS = 4 * 1024 * 1024;
const MIN_BASE64_CHARS = 100;
const MEDIA_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const CONFIDENCE = ["likely", "possible", "unlikely"];
const TRAIT_CONFIDENCE = ["likely", "possible"];
const MAX_TRAITS = 6;
const SUBJECTS = ["reptile", "frog", "not_reptile_or_frog", "unclear"];
const MAX_SUGGESTIONS = 3;

class IdentifyError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

// ─── Request validation ───────────────────────────────────────────
// First bytes of each accepted format, so a mislabelled upload is rejected
// before it costs an API call.
const sniffMediaType = (buf) => {
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";
  if (buf.length >= 8 && buf.slice(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "image/png";
  if (buf.length >= 6 && /^GIF8[79]a$/.test(buf.slice(0, 6).toString("latin1"))) return "image/gif";
  if (buf.length >= 12 && buf.slice(0, 4).toString("latin1") === "RIFF" && buf.slice(8, 12).toString("latin1") === "WEBP") return "image/webp";
  return null;
};

// body: the parsed JSON body { image: "<base64 or data URL>", mediaType?: "image/jpeg" }
// Returns { data, mediaType } or throws IdentifyError.
const validateRequest = (body) => {
  if (!body || typeof body !== "object" || Array.isArray(body)) throw new IdentifyError(400, "Send a JSON body with an image.");
  let { image, mediaType } = body;
  if (typeof image !== "string" || !image) throw new IdentifyError(400, "No photo was sent.");

  const dataUrl = /^data:([^;,]+);base64,/.exec(image);
  if (dataUrl) {
    mediaType = mediaType || dataUrl[1];
    image = image.slice(dataUrl[0].length);
  }
  if (image.length > MAX_BASE64_CHARS) throw new IdentifyError(413, "That photo is too large. Try a smaller one (under 3 MB).");
  if (image.length < MIN_BASE64_CHARS) throw new IdentifyError(400, "That photo couldn't be read.");
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(image)) throw new IdentifyError(400, "That photo couldn't be read.");

  const sniffed = sniffMediaType(Buffer.from(image.slice(0, 24), "base64"));
  if (!sniffed) throw new IdentifyError(415, "Use a JPEG, PNG, WebP or GIF photo.");
  if (mediaType && !MEDIA_TYPES.includes(mediaType)) throw new IdentifyError(415, "Use a JPEG, PNG, WebP or GIF photo.");
  return { data: image, mediaType: sniffed };
};

// ─── Anthropic request ────────────────────────────────────────────
const OUTPUT_SCHEMA = {
  type: "object",
  properties: {
    subject: { type: "string", enum: SUBJECTS, description: "What the photo mainly shows." },
    australian_native: { type: "boolean", description: "false if the animal looks like an overseas, exotic or introduced species rather than an Australian native; true otherwise (including when unsure)." },
    suggestions: {
      type: "array",
      description: `Exactly ${MAX_SUGGESTIONS} candidate species from the species list, most likely first. Empty only if the subject isn't a reptile or frog, or the photo is too unclear to judge.`,
      items: {
        type: "object",
        properties: {
          scientific_name: { type: "string", description: "The scientific name exactly as the species list writes it." },
          common_name: { type: "string", description: "The common name exactly as the species list writes it (the scientific name if the list gives none)." },
          confidence: { type: "string", enum: CONFIDENCE },
          reason: { type: "string", description: "One short sentence on the visible features behind this suggestion." },
          traits: {
            type: "array",
            description: "Hobby morphs or colour lines visible in the photo, from the trait list for this species only. Several can apply at once (e.g. hypomelanistic and translucent). Empty if none are visible or the species has no listed traits.",
            items: {
              type: "object",
              properties: {
                id: { type: "string", enum: TRAIT_IDS },
                confidence: { type: "string", enum: TRAIT_CONFIDENCE },
              },
              required: ["id", "confidence"],
              additionalProperties: false,
            },
          },
        },
        required: ["scientific_name", "common_name", "confidence", "reason", "traits"],
        additionalProperties: false,
      },
    },
    note: { type: "string", description: "One short sentence for the user, e.g. what a clearer photo would need. Empty string if nothing to add." },
  },
  required: ["subject", "australian_native", "suggestions", "note"],
  additionalProperties: false,
};

// Trait list keyed by the index's names, so the prompt never marks which
// species the app covers.
const traitPromptLines = () => Object.entries(MORPHS)
  .map(([appSlug, list]) => {
    const r = INDEX.byAppSlug(appSlug);
    const head = r ? `${r.common}|${r.scientific}` : appSlug;
    return `${head}:\n${list.map(t => `  - ${t.id} (${t.name}): ${t.cue}`).join("\n")}`;
  })
  .join("\n");

// Instructions first, then the long lists. The whole system prompt is one
// cached block (see buildAnthropicRequest), so it must stay byte-stable:
// nothing per-request goes in here.
const SYSTEM_PROMPT = `You help users of All Things Reptile, an Australian reptile and frog keeping reference, work out what animal is in a photo.

The species list below holds every native Australian reptile and frog, under group headings, one per line as "Common name|Scientific name" (just the scientific name where there is no common name). Every species on it is equally possible. Judge only on what is visible in the photo; do not favour a species because it is well known or commonly kept.

Return exactly ${MAX_SUGGESTIONS} candidates from the list, most likely first, even when the first is clear: the second and third are its closest look-alikes. Give each a confidence of "likely", "possible" or "unlikely". Use "likely" only when diagnostic features are clearly visible. Copy the scientific and common names exactly as the list writes them, and never name a species that isn't on the list, except for a non-native animal (below). Work through the same features in the same order every time (body shape, head shape, scalation and texture, pattern, colour, size cues, setting), so the same photo always gets the same answer.

The list holds natives only. If the animal clearly isn't an Australian native (an overseas species photographed abroad, an exotic pet, or an introduced species such as the Cane Toad or Asian House Gecko), set australian_native to false and give your best ${MAX_SUGGESTIONS} guesses by their real common and scientific names, even though they aren't on the list. Otherwise set australian_native to true.

If the photo doesn't show a reptile or frog, set subject to "not_reptile_or_frog" and return no suggestions. If it's too blurry, dark or distant to judge, set subject to "unclear", still give your best ${MAX_SUGGESTIONS} candidates (as "unlikely") if you can, and say in the note what a better photo would need.

For a suggestion that appears in the trait list, also list any hobby morphs or colour lines you can see, each "likely" (clearly visible) or "possible". Only use traits listed under that species. Traits combine: return every one that applies (e.g. hypomelanistic and translucent together). Wild-type animals get an empty list. Never guess a trait you can't see; nail colour, eye colour and scale texture need a clear view.

Use Australian English. Never tell the user an animal is safe to approach or handle.

Trait list (species, then trait id (name): visual cue):
${traitPromptLines()}

Species list:
${INDEX.speciesPromptList()}`;

// Prompt caching: the system prompt (~16k tokens, almost all species list) is a
// single text block with an ephemeral 1-hour cache breakpoint. The cache prefix
// runs tools → system → messages; there are no tools and the image only comes
// in the user message after the breakpoint, so every request reads the same
// cached system prompt. 1 hour rather than the 5-minute default because beta
// testers use ID sporadically: a 1h write costs 2x base input, a read 0.1x.
// usage.cache_read_input_tokens on the reply shows whether it hit.
const buildAnthropicRequest = ({ data, mediaType }, model = DEFAULT_MODEL) => ({
  model,
  max_tokens: 2048,
  ...(acceptsTemperature(model) ? { temperature: 0 } : {}),
  system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral", ttl: "1h" } }],
  messages: [{
    role: "user",
    content: [
      { type: "image", source: { type: "base64", media_type: mediaType, data } },
      { type: "text", text: `What species is this? Give your top ${MAX_SUGGESTIONS} candidates from the species list, using the schema.` },
    ],
  }],
  output_config: { effort: "low", format: { type: "json_schema", schema: OUTPUT_SCHEMA } },
});

// ─── Response parsing ─────────────────────────────────────────────
// Turns an Anthropic Messages response into the app's result shape:
// { subject, notNative, note, suggestions: [Suggestion] }. notNative: the model
// says the animal isn't an Australian native (overseas, exotic or introduced);
// every suggestion is then unmatched with outsideCoverage: true. A Suggestion is
//   matched: true  → { slug (index slug), appSlug|null, inApp, matched, name, latin,
//                      group, dangerouslyVenomous, confidence, reason, traits }
//   matched: false → the model named something that isn't in the index: slug and
//                    appSlug null, inApp false, its name as written, no traits.
// inApp (so a care-guide link) only for records with an appSlug.
// traits: [{ id, name, confidence }] — only traits listed for that species in
// lib/morphs.js (keyed by app slug); duplicates dropped, at most MAX_TRAITS.
const parseTraits = (appSlug, raw) => {
  const allowed = new Set((MORPHS[appSlug] || []).map(t => t.id));
  if (!allowed.size || !Array.isArray(raw)) return [];
  const seen = new Set();
  const out = [];
  for (const t of raw) {
    if (!t || typeof t !== "object") continue;
    const id = typeof t.id === "string" ? t.id.trim().toLowerCase() : "";
    if (!allowed.has(id) || seen.has(id)) continue;
    seen.add(id);
    const c = typeof t.confidence === "string" ? t.confidence.trim().toLowerCase() : "";
    out.push({ id, name: TRAITS[id].name, confidence: TRAIT_CONFIDENCE.includes(c) ? c : "possible" });
  }
  // likely first, keep model order within each group
  return [...out.filter(t => t.confidence === "likely"), ...out.filter(t => t.confidence !== "likely")].slice(0, MAX_TRAITS);
};

const lc = (v) => (typeof v === "string" ? v.trim().toLowerCase() : "");
const str = (v) => (typeof v === "string" ? v.trim() : "");

// outside: the model said the animal isn't an Australian native. Its guesses
// are then shown as outside ATR's coverage and never matched to the index,
// even if a name happens to look like an index species.
const toSuggestion = (s, outside = false) => {
  const confidence = CONFIDENCE.includes(lc(s.confidence)) ? lc(s.confidence) : "possible";
  const reason = str(s.reason);
  const scientific = str(s.scientific_name) || str(s.latin_name);
  const hit = outside ? null : INDEX.findRecord({ slug: s.slug, scientific, common: s.common_name });
  if (!hit) {
    return {
      slug: null, appSlug: null, inApp: false, matched: false, ...(outside ? { outsideCoverage: true } : {}),
      name: str(s.common_name) || scientific || "Unknown species", latin: scientific,
      group: null, dangerouslyVenomous: false, confidence, reason, traits: [],
    };
  }
  const r = hit.record;
  return {
    slug: r.slug, appSlug: r.appSlug || null, inApp: Boolean(r.appSlug), matched: true,
    name: r.common, latin: r.scientific, group: r.group, dangerouslyVenomous: Boolean(r.dangerouslyVenomous),
    confidence, reason, traits: r.appSlug ? parseTraits(r.appSlug, s.traits) : [],
  };
};

const parseAnthropicResponse = (msg) => {
  if (!msg || !Array.isArray(msg.content)) throw new IdentifyError(502, "The ID service sent an unexpected reply.");
  if (msg.stop_reason === "refusal") throw new IdentifyError(422, "This photo couldn't be identified. Try another one.");
  if (msg.stop_reason === "max_tokens") throw new IdentifyError(502, "The ID service ran out of room. Try again.");
  const block = msg.content.find(b => b && b.type === "text");
  if (!block) throw new IdentifyError(502, "The ID service sent an unexpected reply.");

  let out;
  try { out = JSON.parse(block.text); } catch (e) { throw new IdentifyError(502, "The ID service sent an unexpected reply."); }
  if (!out || typeof out !== "object") throw new IdentifyError(502, "The ID service sent an unexpected reply.");

  const subject = SUBJECTS.includes(lc(out.subject)) ? lc(out.subject) : "unclear";
  // Only an explicit false counts: a missing flag is treated as native.
  const notNative = subject !== "not_reptile_or_frog" && out.australian_native === false;
  const raw = subject === "not_reptile_or_frog" || !Array.isArray(out.suggestions) ? [] : out.suggestions;
  const suggestions = [];
  const seen = new Set();
  for (const s of raw) {
    if (!s || typeof s !== "object") continue;
    const sug = toSuggestion(s, notNative);
    // The same species twice (e.g. once through a synonym) counts once.
    const key = sug.slug || `?${lc(sug.latin) || lc(sug.name)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    suggestions.push(sug);
    if (suggestions.length === MAX_SUGGESTIONS) break;
  }
  return { subject, notNative, note: str(out.note), suggestions };
};

// ─── Whole request ────────────────────────────────────────────────
// Returns { status, body }. fetchImpl is injectable for tests.
const identify = async (reqBody, { apiKey, model, fetchImpl } = {}) => {
  try {
    if (!apiKey) throw new IdentifyError(503, "AI ID isn't set up yet.");
    const image = validateRequest(reqBody);
    const doFetch = fetchImpl || globalThis.fetch;

    let res;
    try {
      res = await doFetch(ANTHROPIC_URL, {
        method: "POST",
        headers: { "content-type": "application/json", "x-api-key": apiKey, "anthropic-version": ANTHROPIC_VERSION },
        body: JSON.stringify(buildAnthropicRequest(image, model || DEFAULT_MODEL)),
      });
    } catch (e) {
      throw new IdentifyError(502, "Couldn't reach the ID service. Try again.");
    }
    if (res.status === 429 || res.status === 529) throw new IdentifyError(503, "The ID service is busy. Try again in a minute.");
    if (!res.ok) {
      // Log the status only: never the request (it holds the image) or the key.
      console.error(`identify: Anthropic API returned ${res.status}`);
      throw new IdentifyError(502, "The ID service had a problem. Try again.");
    }
    return { status: 200, body: { ...parseAnthropicResponse(await res.json()), model: model || DEFAULT_MODEL } };
  } catch (e) {
    if (e instanceof IdentifyError) return { status: e.status, body: { error: e.message } };
    console.error("identify: unexpected error");
    return { status: 500, body: { error: "Something went wrong. Try again." } };
  }
};

module.exports = {
  identify, validateRequest, buildAnthropicRequest, parseAnthropicResponse, parseTraits, sniffMediaType,
  IdentifyError, MAX_TRAITS, MAX_SUGGESTIONS, DEFAULT_MODEL, MAX_BASE64_CHARS, MIN_BASE64_CHARS, OUTPUT_SCHEMA, SPECIES,
  SYSTEM_PROMPT, acceptsTemperature,
};
