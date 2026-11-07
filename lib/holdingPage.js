// ─── Pre-launch holding page ──────────────────────────────────────
// Served by middleware.js to anyone without a valid access cookie, and by the
// invite bootstrap when a link doesn't work. Static and self-contained: inline
// styles, no app bundle, no species content, no email capture. Its only image
// is the ATR logo (public/holding-logo.webp/.png), which middleware always serves.
//
// The small script only helps a tester whose cookie has run out: if this
// browser still holds their invite code (the app keeps it in localStorage),
// it goes through the invite link once more, and the server re-checks it.
// When the server says the code is no longer active (notice "inactive"), the
// stored code is removed so it isn't tried again.

const ORANGE = "#D25815"; // D2 brand orange (the page can't import the app's C object)
const STORAGE_KEY = "atr-ai-id-invite"; // same key as src/beta/betaAccess.js

const NOTICES = {
  inactive: "That invite link isn't active any more. If you think that's wrong, contact us.",
  unavailable: "We couldn't check your invite just now. Try the link again in a minute.",
};

const holdingPage = ({ notice } = {}) => {
  const msg = NOTICES[notice] || "";
  const clear = notice === "inactive";
  return `<!doctype html>
<html lang="en-AU">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="robots" content="noindex, nofollow">
<meta name="theme-color" content="#000000">
<title>All Things Reptile — coming 2027</title>
<style>
  html, body { margin: 0; height: 100%; background: #000; color: #fff; }
  body { font-family: "DM Sans", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; -webkit-font-smoothing: antialiased; }
  main { min-height: 100%; box-sizing: border-box; display: flex; flex-direction: column; justify-content: center;
         padding: calc(env(safe-area-inset-top, 0px) + 32px) 24px calc(env(safe-area-inset-bottom, 0px) + 32px); max-width: 560px; margin: 0 auto; }
  .logo { margin: 0 0 24px; }
  .logo img { display: block; width: 100%; max-width: 420px; height: auto; margin-left: -6px; }
  .bar { width: 48px; height: 4px; background: ${ORANGE}; border-radius: 2px; }
  .soon { font-size: 15px; font-weight: 700; color: ${ORANGE}; text-transform: uppercase; letter-spacing: 0.12em; margin: 18px 0 0; }
  .line { font-size: 17px; line-height: 1.5; color: #d6d6d6; margin: 14px 0 0; max-width: 30em; }
  .invite { font-size: 13px; line-height: 1.5; color: #A8A8A8; margin: 40px 0 0; padding-top: 16px; border-top: 1px solid #222; }
  .notice { font-size: 13px; line-height: 1.5; color: #fff; background: #1a1a1a; border-left: 3px solid ${ORANGE}; padding: 10px 12px; margin: 28px 0 0; border-radius: 4px; }
</style>
</head>
<body>
<main>
  <h1 class="logo"><picture><source srcset="/holding-logo.webp" type="image/webp"><img src="/holding-logo.png" width="593" height="230" alt="All Things Reptile"></picture></h1>
  <div class="bar" aria-hidden="true"></div>
  <p class="soon">All Things Reptile — coming 2027</p>
  <p class="line">Australia's reference for keeping native reptiles and frogs: species, care and licensing in one place.</p>
  ${msg ? `<p class="notice" role="status">${msg}</p>` : ""}
  <p class="invite">Have an invite? Use the link we sent you.</p>
</main>
<script>
(function () {
  try {
    var KEY = ${JSON.stringify(STORAGE_KEY)};
    ${clear ? "localStorage.removeItem(KEY); return;" : ""}
    if (sessionStorage.getItem("atr-gate-retried")) return;
    var code = localStorage.getItem(KEY);
    if (!code || !/^[A-Za-z0-9_-]{32,128}$/.test(code)) return;
    sessionStorage.setItem("atr-gate-retried", "1");
    location.replace("/id?invite=" + encodeURIComponent(code));
  } catch (e) {}
})();
</script>
</body>
</html>`;
};

const HOLDING_HEADERS = {
  "Content-Type": "text/html; charset=utf-8",
  "Cache-Control": "no-store",
  "X-Robots-Tag": "noindex, nofollow",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
};

module.exports = { holdingPage, HOLDING_HEADERS, NOTICES, STORAGE_KEY };
