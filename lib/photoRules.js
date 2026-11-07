// ─── Photo licence rules and customer-facing credits ─────────────
// One place for: which photos may go on species pages, when a credit can be
// hidden, and the credit text customers see. The database enforces the same
// rules with check constraints (supabase/migrations/*_species_photos.sql);
// this is what turns them into clear messages and the credit object.
//
// Server only (CommonJS, like the rest of lib/). The app never computes a
// credit itself: api/species-photos and api/admin-photos send `credit` ready
// to render with <CreditedImage>.

const LICENCES = ["cc0", "cc-by", "cc-by-sa", "permission", "tester_consent", "royalty_free"];
// Licences whose terms always require attribution, whatever credit_required says.
const ATTRIBUTION_LICENCES = ["cc-by", "cc-by-sa"];
// Licences that may be used on customer-facing pages. CC BY-SA is left out on
// purpose: share-alike would put its obligations on the page it's shown in.
const PUBLIC_LICENCES = ["cc0", "cc-by", "permission", "tester_consent", "royalty_free"];

const CC_BY_SA_REASON = "CC BY-SA photos can't go on species pages. Share-alike would oblige us to licence the page they appear on the same way, so this photo stays an AI reference only.";
const ATR_COMMUNITY = "ATR community";

const SOURCE_NAMES = {
  inaturalist: "iNaturalist",
  ala: "Atlas of Living Australia",
  wikimedia: "Wikimedia Commons",
  tester: ATR_COMMUNITY,
  admin_upload: null, // named from the source URL's host, if any
};

const isWebUrl = (u) => {
  if (typeof u !== "string") return false;
  try { const x = new URL(u); return x.protocol === "https:" || x.protocol === "http:"; } catch (e) { return false; }
};

const attributionRequired = (p) => ATTRIBUTION_LICENCES.includes(p.licence) || Boolean(p.credit_required);

// The credit icon shows unless it was switched off AND the licence allows it.
const creditShown = (p) => p.show_credit !== false || attributionRequired(p);

// null when the photo can go on a species page, otherwise the reason it can't.
const publicBlockReason = (p) => {
  if (!p) return "That photo doesn't exist any more.";
  if (p.licence === "cc-by-sa") return CC_BY_SA_REASON;
  if (!PUBLIC_LICENCES.includes(p.licence)) return "This licence can't be used on species pages.";
  if (p.status !== "active") return "Restore the photo before using it on a species page.";
  if (p.licence === "royalty_free" && (!p.stock_library || !p.stock_asset_id)) return "Add the stock library and asset ID (the proof of licence) first.";
  return null;
};

// "4.0" from https://creativecommons.org/licenses/by/4.0/ (or the CC0 1.0 URL).
const ccVersion = (url, fallback) => {
  const m = /creativecommons\.org\/(?:licenses|publicdomain)\/[a-z-]+\/(\d+\.\d+)/i.exec(url || "");
  return m ? m[1] : fallback;
};

const licenceName = (p) => {
  switch (p.licence) {
    case "cc0": return `CC0 ${ccVersion(p.licence_url, "1.0")}`;
    case "cc-by": return `CC BY ${ccVersion(p.licence_url, "4.0")}`;
    case "cc-by-sa": return `CC BY-SA ${ccVersion(p.licence_url, "4.0")}`;
    case "permission": return "Used with permission";
    case "tester_consent": return "Shared with permission";
    case "royalty_free": return "Royalty-free licence";
    default: return "Licence on file";
  }
};

const hostName = (u) => { try { return new URL(u).hostname.replace(/^www\./, ""); } catch (e) { return null; } };

// Who the photo is credited to.
const creditName = (p) => {
  if (p.display_credit) return p.display_credit;
  if (p.licence === "royalty_free") return [p.stock_library, p.photographer].filter(Boolean).join(" / ") || "Stock photo";
  if (p.licence === "tester_consent" || p.source === "tester") return p.credit_by_name && p.photographer ? p.photographer : ATR_COMMUNITY;
  return p.photographer || "Unknown photographer";
};

// The credit object the app renders. Only display fields; nothing internal.
const publicCredit = (p) => {
  const isStock = p.licence === "royalty_free";
  const isTester = p.licence === "tester_consent" || p.source === "tester";
  const sourceUrl = !isTester && isWebUrl(p.source_url) ? p.source_url : null;
  const source = isStock ? p.stock_library : (SOURCE_NAMES[p.source] || (sourceUrl && hostName(sourceUrl)) || null);
  const licenceUrl = isWebUrl(p.licence_url) ? p.licence_url : null;
  return {
    show: creditShown(p),
    name: creditName(p),
    licence: licenceName(p),
    licenceUrl,
    source: source || null,
    sourceUrl,
  };
};

module.exports = {
  LICENCES, ATTRIBUTION_LICENCES, PUBLIC_LICENCES, CC_BY_SA_REASON, ATR_COMMUNITY,
  attributionRequired, creditShown, publicBlockReason, licenceName, creditName, publicCredit, isWebUrl,
};
