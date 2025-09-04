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
          className="flex items-center gap-2 rounded-lg border border-neutral-300 bg-white p-2 hover:bg-neutral-100"
        >
          <ChevronsLeft />
          Go Back
        </button>
        <h1 className="text-2xl font-semibold tracking-tight">
          Notes with tag
        </h1>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search notes"
          className="hidden sm:block rounded-lg border border-neutral-300 bg-white px-3 py-2 outline-none focus:border-neutral-500"
        />
      </header>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
            Loading…
          </div>
        ) : notes.length === 0 ? (
          <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
            No notes.
          </div>
        ) : (
          notes.map((n) => (
            <div
              key={n.id}
              className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm cursor-pointer"
              onClick={() => navigate(`/notes/${n.id}`)}
            >
              <h2 className="font-medium truncate">{n.title}</h2>
              {n.content && (
                <p className="text-sm text-neutral-600 whitespace-pre-wrap">
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
