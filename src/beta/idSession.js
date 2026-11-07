import { useCallback, useState } from "react";

// In-memory state for the ID screen that survives leaving and coming back
// (e.g. opening a care guide from a result, then tapping Back). Memory only:
// it's cleared on reload, and the photo never goes into browser storage.
const store = new Map();

export function useSessionState(key, initial) {
  const [value, setValue] = useState(() =>
    store.has(key) ? store.get(key) : (typeof initial === "function" ? initial() : initial));
  const set = useCallback((v) => setValue((prev) => {
    const next = typeof v === "function" ? v(prev) : v;
    store.set(key, next);
    return next;
  }), [key]);
  return [value, set];
}

export const clearSession = () => store.clear();
