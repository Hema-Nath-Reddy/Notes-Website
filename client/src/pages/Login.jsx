import { useState } from 'react'
import api from '../lib/api'
import { toast } from 'react-hot-toast'
import { Link, useNavigate } from 'react-router-dom'
import { saveAuth } from '../lib/auth'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(e) {
    e.preventDefault()
    try {
      setLoading(true)
      const { data } = await api.post('/auth/login', { email, password })
      if (data?.ok) {
        if (data?.data) {
          saveAuth({
            access_token: data.data.session?.access_token || data.data?.access_token,
            refresh_token: data.data.session?.refresh_token || data.data?.refresh_token,
            user: data.data.user || null,
          })
        }
        toast.success('Logged in')
        navigate('/')
      } else {
        toast.error(data?.error || 'Login failed')
      }
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  async function onGoogle() {
    try {
      const { data } = await api.get('/auth/google-url', { params: { redirect: window.location.origin } })
      if (data?.ok && data?.url) {
        window.location.href = data.url
      } else {
        toast.error('Unable to start Google sign-in')
      }
    } catch (err) {
      toast.error('Unable to start Google sign-in')
    }
  }

  return (
    <section className="mx-auto max-w-sm space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
        <p className="text-neutral-600">Welcome back.</p>
      </header>
      <form onSubmit={onSubmit} className="space-y-3">
        <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="Email" className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 outline-none focus:border-neutral-500" />
        <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="Password" className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 outline-none focus:border-neutral-500" />
        <button disabled={loading} className="w-full rounded-lg bg-black px-3 py-2 text-white disabled:opacity-60">{loading ? 'Signing in…' : 'Sign in'}</button>
      </form>
      <button onClick={onGoogle} className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2">Continue with Google</button>
      <p className="text-sm text-neutral-600">No account? <Link to="/signup" className="underline">Sign up</Link></p>
    </section>
  )
}


