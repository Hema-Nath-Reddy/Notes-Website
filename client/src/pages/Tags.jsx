import { useEffect, useMemo, useState } from "react";
import api from "../lib/api";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Search as SearchIcon } from "lucide-react";
export default function Tags() {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [name, setName] = useState("");
  const navigate = useNavigate();

  const debounced = useMemo(() => {
    let t;
    return (v, fn) => {
      if (t) clearTimeout(t);
      t = setTimeout(() => fn(v), 300);
    };
  }, []);

  async function fetchTags(q) {
    try {
      setLoading(true);
      const { data } = await api.get("/api/tags");
      if (data?.ok) {
        const list = data.data || [];
        setTags(
          q
            ? list.filter((t) =>
                t.name.toLowerCase().includes(String(q).toLowerCase())
              )
            : list
        );
      }
    } catch (err) {
      if (err?.response?.status === 401) navigate("/login");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTags("");
  }, []);
  useEffect(() => {
    debounced(search, (q) => fetchTags(q));
  }, [search, debounced]);

  async function createTag() {
    const value = name.trim();
    if (!value) return;
    try {
      const { data } = await api.post("/api/tags", { name: value });
      if (data?.ok && data.data) {
        setTags((prev) => [...prev, data.data]);
        setName("");
      } else {
        toast.error(data?.error || "Could not create tag");
      }
    } catch (err) {
      toast.error(err?.response?.data?.error || "Could not create tag");
    }
  }

  async function removeTag(id) {
    try {
      const { data } = await api.delete(`/api/tags/${id}`);
      if (data?.ok) setTags((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      toast.error("Could not delete");
    }
  }

  return (
    <section className="space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tags</h1>
          <p className="text-neutral-600">Organize your notes with tags.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden sm:block relative">
            <SearchIcon
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search notes"
              className="rounded-lg border border-neutral-300 bg-white pl-8 pr-3 py-2 outline-none focus:border-neutral-500"
            />
          </div>
        </div>
      </header>

      <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm space-y-3">
        <div className="flex gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="New tag name"
            className="flex-1 rounded-lg border border-neutral-300 bg-white px-3 py-2 outline-none focus:border-neutral-500"
          />
          <button
            onClick={createTag}
            className="rounded-lg border border-neutral-300 bg-white px-3 py-2 hover:bg-neutral-100"
          >
            Add
          </button>
        </div>
        {loading ? (
          <div>Loading…</div>
        ) : tags.length === 0 ? (
          <div>No tags yet.</div>
        ) : (
          <ul className="divide-y divide-neutral-200">
            {tags.map((t) => (
              <li key={t.id} className="flex items-center justify-between py-2">
                <button
                  onClick={() => navigate(`/tags/${t.id}`)}
                  className="text-left hover:underline"
                >
                  {t.name}
                </button>
                <button
                  onClick={() => removeTag(t.id)}
                  className="rounded-lg border border-neutral-300 bg-white px-3 py-1 text-sm hover:bg-neutral-100"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
