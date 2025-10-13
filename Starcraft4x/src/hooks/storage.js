const LOCAL_STORAGE_KEY = "eor-save-v1";

/**
 * Load persisted game snapshot from localStorage.
 */
export function loadSavedGameState() {
  try {
    const serialized = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!serialized) return null;
    return JSON.parse(serialized);
  } catch {
    return null;
  }
}

/**
 * Persist a compact game snapshot into localStorage.
 */
export function persistGameStateToLocalStorage(gameSnapshot) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(gameSnapshot));
  } catch {
    // ignore quota errors
  }
}

/**
 * Remove saved snapshot (used on "Start New Game").
 */
export function clearSavedGameState() {
  try {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  } catch {}
}
