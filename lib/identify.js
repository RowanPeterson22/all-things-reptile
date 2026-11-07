// ─── AI species ID: core logic (D9) ──────────────────────────────
// Used by api/identify.js. Kept outside api/ so Vercel doesn't deploy it as a
// separate function, and kept free of Vercel types so it can be unit-tested
// with a mocked fetch (src/__tests__/identify.test.js).
//
// Privacy: the image is forwarded to the Anthropic API and nothing else. It is
// never written to disk, stored or logged.

const SPECIES = require("./identifySpecies");

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION = "2023-06-01";
// Override with the ANTHROPIC_MODEL env var (e.g. claude-haiku-5-5 to cut cost).
const DEFAULT_MODEL = "claude-sonnet-5-5";

// Vercel caps a function request body at 4.5 MB, so cap the base64 string at
// 4 MB (about 3 MB of image). The app downscales photos well below this.
const MAX_BASE64_CHARS = 4 * 1024 * 1024;
const MIN_BASE64_CHARS = 100;
const MEDIA_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const CONFIDENCE = ["likely", "possible", "unlikely"];
const SUBJECTS = ["reptile", "frog", "not_reptile_or_frog", "unclear"];
const OTHER = "not-one-of-our-species";
const MAX_SUGGESTIONS = 3;

const BY_SLUG = Object.fromEntries(SPECIES.map(s => [s.slug, s]));

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
    suggestions: {
      type: "array",
      description: `Up to ${MAX_SUGGESTIONS} candidate species, most likely first. Empty if the subject isn't a reptile or frog.`,
      items: {
        type: "object",
        properties: {
          slug: { type: "string", enum: [...SPECIES.map(s => s.slug), OTHER], description: `The slug from the species list, or "${OTHER}".` },
          common_name: { type: "string" },
          latin_name: { type: "string" },
          confidence: { type: "string", enum: CONFIDENCE },
          reason: { type: "string", description: "One short sentence on the visible features behind this suggestion." },
        },
        required: ["slug", "common_name", "latin_name", "confidence", "reason"],
        additionalProperties: false,
      },
    },
    note: { type: "string", description: "One short sentence for the user, e.g. what a clearer photo would need. Empty string if nothing to add." },
  },
  required: ["subject", "suggestions", "note"],
  additionalProperties: false,
};

const SPECIES_LINES = SPECIES.map(s => `${s.slug} | ${s.name} | ${s.latin} | ${s.type}`).join("\n");

const SYSTEM_PROMPT = `You help users of All Things Reptile, an Australian reptile and frog keeping reference app, work out what animal is in a photo.

Suggest up to ${MAX_SUGGESTIONS} likely species, most likely first, each with a confidence of "likely", "possible" or "unlikely". Be honest about uncertainty: use "likely" only when diagnostic features are clearly visible.

Prefer species from the app's list below (slug | common name | latin name | group). If the animal is better matched by a species that isn't on the list, use slug "${OTHER}" and give its real common and latin names; this matters most for wild Australian snakes, many of which are venomous and are not on the list. Never force a match to the list.

If the photo doesn't show a reptile or frog, set subject to "not_reptile_or_frog" and return no suggestions. If it's too blurry, dark or distant to judge, set subject to "unclear" and say in the note what a better photo would need.

Use Australian English. Never tell the user an animal is safe to approach or handle.

Species list:
${SPECIES_LINES}`;

const buildAnthropicRequest = ({ data, mediaType }, model = DEFAULT_MODEL) => ({
  model,
  max_tokens: 2048,
  system: SYSTEM_PROMPT,
  messages: [{
    role: "user",
    content: [
      { type: "image", source: { type: "base64", media_type: mediaType, data } },
      { type: "text", text: "What species is this? Answer using the schema." },
    ],
  }],
  output_config: { effort: "low", format: { type: "json_schema", schema: OUTPUT_SCHEMA } },
});

// ─── Response parsing ─────────────────────────────────────────────
// Turns an Anthropic Messages response into the app's result shape:
// { subject, note, suggestions: [{ slug|null, inApp, name, latin, confidence, reason }] }
const parseAnthropicResponse = (msg) => {
  if (!msg || !Array.isArray(msg.content)) throw new IdentifyError(502, "The ID service sent an unexpected reply.");
  if (msg.stop_reason === "refusal") throw new IdentifyError(422, "This photo couldn't be identified. Try another one.");
  if (msg.stop_reason === "max_tokens") throw new IdentifyError(502, "The ID service ran out of room. Try again.");
  const block = msg.content.find(b => b && b.type === "text");
  if (!block) throw new IdentifyError(502, "The ID service sent an unexpected reply.");

  let out;
  try { out = JSON.parse(block.text); } catch (e) { throw new IdentifyError(502, "The ID service sent an unexpected reply."); }
  if (!out || typeof out !== "object") throw new IdentifyError(502, "The ID service sent an unexpected reply.");

  const lc = (v) => (typeof v === "string" ? v.trim().toLowerCase() : "");
  const str = (v) => (typeof v === "string" ? v.trim() : "");
  const subject = SUBJECTS.includes(lc(out.subject)) ? lc(out.subject) : "unclear";

  const raw = subject === "not_reptile_or_frog" || !Array.isArray(out.suggestions) ? [] : out.suggestions;
  const suggestions = raw
    .filter(s => s && typeof s === "object")
    .map(s => {
      const ours = BY_SLUG[lc(s.slug)];
      const confidence = CONFIDENCE.includes(lc(s.confidence)) ? lc(s.confidence) : "possible";
      return ours
        ? { slug: ours.slug, inApp: true, name: ours.name, latin: ours.latin, confidence, reason: str(s.reason) }
        : { slug: null, inApp: false, name: str(s.common_name) || "Unknown species", latin: str(s.latin_name), confidence, reason: str(s.reason) };
    })
    .slice(0, MAX_SUGGESTIONS);

  return { subject, note: str(out.note), suggestions };
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
    return { status: 200, body: parseAnthropicResponse(await res.json()) };
  } catch (e) {
    if (e instanceof IdentifyError) return { status: e.status, body: { error: e.message } };
    console.error("identify: unexpected error");
    return { status: 500, body: { error: "Something went wrong. Try again." } };
  }
};

module.exports = {
  identify, validateRequest, buildAnthropicRequest, parseAnthropicResponse,
  IdentifyError, DEFAULT_MODEL, MAX_BASE64_CHARS, OTHER, OUTPUT_SCHEMA, SPECIES,
};
