import api from '../lib/api'
import { useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { clearAuth } from '../lib/auth'

export default function Logout() {
  const navigate = useNavigate()
  useEffect(() => {
    async function run() {
      try {
        const { data } = await api.post('/auth/logout')
        if (data?.ok) {
          toast.success('Logged out')
        }
      } catch (_) {}
      clearAuth()
      navigate('/login')
    }
    run()
  }, [navigate])

  return null
}


