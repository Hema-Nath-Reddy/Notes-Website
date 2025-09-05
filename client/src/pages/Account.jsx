import useAuth from '../hooks/useAuth'
import { Link } from 'react-router-dom'

export default function Account() {
  const { user } = useAuth()

  return (
    <section className="space-y-4">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-white">Account</h1>
        <p className="text-white/70">Your profile details.</p>
      </header>
      <div className="rounded-xl glass p-4 space-y-2">
        <div>
          <div className="text-sm text-white/50">Email</div>
          <div className="font-medium text-white">{user?.email || '—'}</div>
        </div>
        <div>
          <div className="text-sm text-white/50">ID</div>
          <div className="text-xs text-white/70 break-all">{user?.id || '—'}</div>
        </div>
        <div className="pt-2 space-y-2">
          <Link to="/logout" className="inline-block rounded-lg glass-button px-3 py-2 text-white hover:bg-white/20">Log out</Link>
          <div className="pt-2 border-t border-white/20">
            <Link 
              to="/delete-account" 
              className="inline-block rounded-lg px-3 py-2 text-white hover:bg-red-500/20 transition-all"
              style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}
            >
              Delete Account
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}


