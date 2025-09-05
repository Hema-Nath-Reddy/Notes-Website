import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../lib/api";
import { ChevronsLeft } from "lucide-react";

export default function TagNotes() {
  const { tagId } = useParams();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const debounced = useMemo(() => {
    let t;
    return (v, fn) => {
      if (t) clearTimeout(t);
      t = setTimeout(() => fn(v), 300);
    };
  }, []);

  async function fetchNotes(q) {
    try {
      setLoading(true);
      const { data } = await api.get(`/api/tags/${tagId}/notes`, {
        params: { q: q || "" },
      });
      if (data?.ok) setNotes(data.data || []);
    } catch (_) {
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchNotes("");
  }, [tagId]);
  useEffect(() => {
    debounced(search, (q) => fetchNotes(q));
  }, [search, debounced]);

  return (
    <section className="space-y-4">
      <header className="flex items-center justify-between">
        <button
          onClick={() => navigate("/tags")}
          className="flex items-center gap-2 rounded-lg glass-button p-2 text-white hover:bg-white/20"
        >
          <ChevronsLeft />
          Go Back
        </button>
        <h1 className="text-2xl font-semibold tracking-tight text-white">
          Notes with tag
        </h1>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search notes"
          className="hidden sm:block rounded-lg glass-input px-3 py-2 outline-none text-white placeholder-white/50"
        />
      </header>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="rounded-xl glass p-4">
            <span className="text-white">Loading…</span>
          </div>
        ) : notes.length === 0 ? (
          <div className="rounded-xl glass p-4">
            <span className="text-white">No notes.</span>
          </div>
        ) : (
          notes.map((n) => (
            <div
              key={n.id}
              className="rounded-xl glass p-4 cursor-pointer hover:bg-white/10 transition-all"
              onClick={() => navigate(`/notes/${n.id}`)}
            >
              <h2 className="font-medium truncate text-white">{n.title}</h2>
              {n.content && (
                <p className="text-sm text-white/70 whitespace-pre-wrap">
                  {n.content}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </section>
  );
}
