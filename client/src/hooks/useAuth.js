import { useEffect, useState } from 'react'
import { getAuth } from '../lib/auth'

export default function useAuth() {
  const [auth, setAuth] = useState(() => getAuth())

  useEffect(() => {
    function onStorage(e) {
      if (e.key === 'auth') {
        try {
          setAuth(e.newValue ? JSON.parse(e.newValue) : null)
        } catch {
          setAuth(null)
        }
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const isLoggedIn = Boolean(auth?.access_token)
  const user = auth?.user || null

  return { isLoggedIn, user, auth }
}


