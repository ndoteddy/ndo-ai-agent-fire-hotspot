/**
 * Simple in-memory key/value cache with per-entry TTL.
 * Suitable for single-process use; resets on server restart.
 */

const store = new Map();

/**
 * @param {string} key
 * @returns {any | null} stored value, or null if missing/expired
 */
function get(key) {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return null;
  }
  return entry.value;
}

/**
 * @param {string} key
 * @param {any} value
 * @param {number} ttlMs  milliseconds until expiry
 */
function set(key, value, ttlMs) {
  store.set(key, { value, expiresAt: Date.now() + ttlMs });
}

/**
 * @param {string} key
 */
function invalidate(key) {
  store.delete(key);
}

/** Remove all expired entries (call periodically if needed). */
function purgeExpired() {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (now > entry.expiresAt) store.delete(key);
  }
}

module.exports = { get, set, invalidate, purgeExpired };
