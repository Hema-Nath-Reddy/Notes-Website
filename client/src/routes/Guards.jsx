import useAuth from '../hooks/useAuth'
import { Navigate, useLocation } from 'react-router-dom'

export function RequireAuth({ children }) {
  const { isLoggedIn } = useAuth()
  const location = useLocation()
  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }
  return children
}

export function RequireGuest({ children }) {
  const { isLoggedIn } = useAuth()
  const location = useLocation()
  if (isLoggedIn) {
    return <Navigate to={location.state?.from?.pathname || '/'} replace />
  }
  return children
}


