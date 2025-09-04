import useAuth from '../hooks/useAuth'
import { Link } from 'react-router-dom'

export default function Account() {
  const { user } = useAuth()

  return (
    <section className="space-y-4">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Account</h1>
        <p className="text-neutral-600">Your profile details.</p>
      </header>
      <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm space-y-2">
        <div>
          <div className="text-sm text-neutral-500">Email</div>
          <div className="font-medium">{user?.email || '—'}</div>
        </div>
        <div>
          <div className="text-sm text-neutral-500">ID</div>
          <div className="text-xs text-neutral-700 break-all">{user?.id || '—'}</div>
        </div>
        <div className="pt-2">
          <Link to="/logout" className="inline-block rounded-lg border border-neutral-300 bg-white px-3 py-2 hover:bg-neutral-100">Log out</Link>
        </div>
      </div>
    </section>
  )
}


