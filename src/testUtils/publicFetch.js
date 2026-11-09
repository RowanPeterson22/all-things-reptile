// Shared by the gate tests: a public visitor makes only public, edge-cached
// requests with no invite header: the layout (GET /api/beta-check) and, on
// the Species screen, the category images. Never a POST beta check, an admin
// check or any other API call.
export const CATEGORY_IMAGES_URL = "/api/species-photos?categories=1";
export const PUBLIC_LAYOUT_URL = "/api/beta-check";

const expectPlainGet = (init = {}) => {
  expect(Object.keys(init.headers || {}).map(k => k.toLowerCase())).not.toContain("x-atr-beta");
  expect(init.method === undefined || init.method === "GET").toBe(true);
};

export const expectOnlyPublicRequests = (fetchMock = global.fetch, { categories = false } = {}) => {
  const calls = fetchMock.mock.calls;
  expect(calls.map(c => c[0])).toEqual(categories ? [PUBLIC_LAYOUT_URL, CATEGORY_IMAGES_URL] : [PUBLIC_LAYOUT_URL]);
  calls.forEach(c => expectPlainGet(c[1]));
};

// The Species screen's one image request (layout request aside).
export const expectOnlyCategoryImages = (fetchMock = global.fetch) => expectOnlyPublicRequests(fetchMock, { categories: true });
