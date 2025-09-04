const STORAGE_KEY = 'auth'

export function saveAuth(auth) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(auth))
  } catch (_) {}
}

export function getAuth() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch (_) {
    return null
  }
}

export function clearAuth() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (_) {}
}


