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
          <h1 className="text-2xl font-semibold tracking-tight text-white">Starred</h1>
          <p className="text-white/70">Your favorite notes.</p>
        </div>
        <div className="hidden sm:block relative">
          <SearchIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search notes" className="rounded-lg glass-input pl-8 pr-3 py-2 outline-none text-white placeholder-white/50" />
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 auto-rows-[8px] grid-flow-row-dense">
        {loading ? (
          <div className="rounded-xl glass p-4"><span className="text-white">Loading…</span></div>
        ) : notes.length === 0 ? (
          <div className="rounded-xl glass p-4"><span className="text-white">No starred notes.</span></div>
        ) : (
          notes.map(n => (
            <div key={n.id} className="rounded-xl glass p-4 min-h-[160px] cursor-pointer hover:bg-white/10 transition-all" onClick={() => navigate(`/notes/${n.id}`)}>
              <div className="flex items-start justify-between gap-2">
                <h2 className="font-medium truncate text-white">{n.title}</h2>
                <div className="flex items-center gap-2">
                  <button onClick={(e) => { e.stopPropagation(); toggleStar(n.id, false); }} title="Unstar" className="rounded-full border p-1 glass-button-primary text-white">
                    <StarOffIcon size={14} />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); togglePin(n.id, !n.is_pinned); }} title={n.is_pinned ? 'Unpin' : 'Pin'} className={`rounded-full border p-1 transition-all ${n.is_pinned ? 'glass-button-primary text-white' : 'glass-button text-white hover:bg-white/20'}`}>
                    {n.is_pinned ? <PinOffIcon size={14} /> : <PinIcon size={14} />}
                  </button>
                </div>
              </div>
              {n.content && <p className="text-sm text-white/70 whitespace-pre-wrap">{n.content}</p>}
            </div>
          ))
        )}
      </div>
    </section>
  )
}


