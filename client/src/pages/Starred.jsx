import { useEffect, useMemo, useState } from "react";
import api from "../lib/api";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Search as SearchIcon, StarOff as StarOffIcon, Pin as PinIcon, PinOff as PinOffIcon } from "lucide-react";

export default function Starred() {
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  const debounced = useMemo(() => {
    let t; return (v, fn) => { if (t) clearTimeout(t); t = setTimeout(() => fn(v), 300) }
  }, [])

  async function fetchStarred(q) {
    try {
      setLoading(true)
      const { data } = await api.get('/api/notes', { params: { starred: true, q: q || '' } })
      if (data?.ok) setNotes(data.data || [])
    } catch (err) {
      if (err?.response?.status === 401) navigate('/login')
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchStarred('') }, [])
  useEffect(() => { debounced(search, (q) => fetchStarred(q)) }, [search, debounced])

  async function toggleStar(noteId, next) {
    try {
      const { data } = await api.put(`/api/notes/${noteId}`, { is_starred: next })
      if (data?.ok) setNotes(prev => prev.filter(n => n.id !== noteId))
    } catch (err) {
      toast.error('Could not update')
    }
  }

  async function togglePin(noteId, nextPinned) {
    try {
      const { data } = await api.put(`/api/notes/${noteId}`, { is_pinned: nextPinned })
      if (data?.ok) {
        setNotes(prev => prev.map(n => n.id === noteId ? { ...n, ...data.data } : n))
      }
    } catch (err) {
      toast.error('Could not update')
    }
  }

  return (
    <section className="space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Starred</h1>
          <p className="text-neutral-600">Your favorite notes.</p>
        </div>
        <div className="hidden sm:block relative">
          <SearchIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search notes" className="rounded-lg border border-neutral-300 bg-white pl-8 pr-3 py-2 outline-none focus:border-neutral-500" />
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 auto-rows-[8px] grid-flow-row-dense">
        {loading ? (
          <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">Loading…</div>
        ) : notes.length === 0 ? (
          <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">No starred notes.</div>
        ) : (
          notes.map(n => (
            <div key={n.id} className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm min-h-[160px]">
              <div className="flex items-start justify-between gap-2">
                <h2 className="font-medium truncate">{n.title}</h2>
                <div className="flex items-center gap-2">
                  <button onClick={() => toggleStar(n.id, false)} title="Unstar" className="rounded-full border p-1 bg-yellow-400 text-black border-yellow-400">
                    <StarOffIcon size={14} />
                  </button>
                  <button onClick={() => togglePin(n.id, !n.is_pinned)} title={n.is_pinned ? 'Unpin' : 'Pin'} className={`rounded-full border p-1 ${n.is_pinned ? 'bg-black text-white border-black' : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-100'}`}>
                    {n.is_pinned ? <PinOffIcon size={14} /> : <PinIcon size={14} />}
                  </button>
                </div>
              </div>
              {n.content && <p className="text-sm text-neutral-600 whitespace-pre-wrap">{n.content}</p>}
            </div>
          ))
        )}
      </div>
    </section>
  )
}


