// Shared by the gate tests: a public visitor's Browse home makes exactly one
// request, the public, edge-cached category images, with no invite header,
// and never a beta, admin or other API call.
export const CATEGORY_IMAGES_URL = "/api/species-photos?categories=1";

export const expectOnlyCategoryImages = (fetchMock = global.fetch) => {
  const calls = fetchMock.mock.calls;
  expect(calls.map(c => c[0])).toEqual([CATEGORY_IMAGES_URL]);
  const init = calls[0][1] || {};
  expect(Object.keys(init.headers || {}).map(k => k.toLowerCase())).not.toContain("x-atr-beta");
  expect(init.method === undefined || init.method === "GET").toBe(true);
};
