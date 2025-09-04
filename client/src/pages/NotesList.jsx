import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import useAuth from "../hooks/useAuth";
import {
  Search as SearchIcon,
  Star as StarIcon,
  StarOff as StarOffIcon,
  Pin as PinIcon,
  PinOff as PinOffIcon,
  PlusCircle,
  Save,
} from "lucide-react";

export default function NotesList() {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState([]);
  const [selectedTagIds, setSelectedTagIds] = useState([]);
  const [newTag, setNewTag] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [notes, setNotes] = useState([]);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [search, setSearch] = useState("");
  const composerRef = useRef(null);
  const ROW_HEIGHT = 8; // px, base auto-row height used for spanning
  const dragIdRef = useRef(null);

  function onDragStart(e, id, isPinned) {
    if (isPinned) {
      e.preventDefault();
      return;
    }
    dragIdRef.current = id;
    e.dataTransfer.effectAllowed = "move";
  }
  function onDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }
  function onDragEnd() {
    dragIdRef.current = null;
  }
  function onDrop(e, targetId) {
    e.preventDefault();
    const sourceId = dragIdRef.current;
    dragIdRef.current = null;
    if (!sourceId || sourceId === targetId) return;
    const current = [...notes];
    const pinnedCount = current.filter((n) => n.is_pinned).length;
    const from = current.findIndex((n) => n.id === sourceId);
    const to = current.findIndex((n) => n.id === targetId);
    if (from === -1 || to === -1) return;
    // Prevent reordering into or from pinned zone
    if (from < pinnedCount || to < pinnedCount) return;
    const unpinned = current.slice(pinnedCount);
    const fromRel = from - pinnedCount;
    const toRel = to - pinnedCount;
    const [moved] = unpinned.splice(fromRel, 1);
    unpinned.splice(toRel, 0, moved);
    setNotes([...current.slice(0, pinnedCount), ...unpinned]);
  }

  // debounce search
  const debouncedSearch = useMemo(() => {
    let t;
    return (value, fn) => {
      if (t) clearTimeout(t);
      t = setTimeout(() => fn(value), 300);
    };
  }, []);

  async function fetchNotes(q) {
    try {
      setLoadingNotes(true);
      const { data } = await api.get("/api/notes", { params: { q: q || "" } });
      if (data?.ok) setNotes(sortNotes(data.data || []));
    } catch (err) {
      if (err?.response?.status === 401) {
        // ignore for guests
      }
    } finally {
      setLoadingNotes(false);
    }
  }

  useEffect(() => {
    fetchNotes("");
  }, []);

  useEffect(() => {
    debouncedSearch(search, (q) => fetchNotes(q));
  }, [search, debouncedSearch]);

  // Load tags once when logged in
  useEffect(() => {
    if (!isLoggedIn) return;
    (async () => {
      try {
        const { data } = await api.get("/api/tags");
        if (data?.ok) setTags(data.data || []);
      } catch (err) {}
    })();
  }, [isLoggedIn]);

  function toggleTag(id) {
    setSelectedTagIds((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  }

  async function handleAddTag() {
    if (!isLoggedIn) {
      toast.error("Please log in to add tags");
      navigate("/login");
      return;
    }
    const name = newTag.trim();
    if (!name) return;
    try {
      const { data } = await api.post("/api/tags", { name });
      if (data?.ok && data.data) {
        setTags((prev) => [...prev, data.data]);
        setSelectedTagIds((prev) => [...prev, data.data.id]);
        setNewTag("");
      } else {
        toast.error(data?.error || "Could not create tag");
      }
    } catch (err) {
      if (err?.response?.status === 401) {
        toast.error("Session expired. Please log in again");
        navigate("/login");
      } else {
        toast.error(err?.response?.data?.error || "Could not create tag");
      }
    }
  }

  async function handleCreateNote() {
    if (!isLoggedIn) {
      toast.error("Please log in to create notes");
      navigate("/login");
      return;
    }
    if (!title.trim()) {
      // Do not create if empty title; simply ignore
      return;
    }
    try {
      setSubmitting(true);
      const { data } = await api.post("/api/notes", { title, content });
      if (!data?.ok || !data.data) {
        toast.error(data?.error || "Could not create note");
        setSubmitting(false);
        return;
      }
      const noteId = data.data.id;
      if (selectedTagIds.length > 0) {
        await api.post(`/api/notes/${noteId}/tags`, { tagIds: selectedTagIds });
      }
      toast.success("Note created");
      // Reset composer
      setTitle("");
      setContent("");
      setSelectedTagIds([]);
      setNewTag("");
      // Refresh list or prepend
      setNotes((prev) => {
        const pinnedCount = prev.filter((n) => n.is_pinned).length;
        const arr = [...prev];
        arr.splice(pinnedCount, 0, { ...data.data });
        return arr;
      });
    } catch (err) {
      if (err?.response?.status === 401) {
        toast.error("Session expired. Please log in again");
        navigate("/login");
      } else {
        toast.error(err?.response?.data?.error || "Could not create note");
      }
    } finally {
      setSubmitting(false);
    }
  }

  function sortNotes(list) {
    return [...list].sort((a, b) => {
      const pa = a.is_pinned ? 1 : 0;
      const pb = b.is_pinned ? 1 : 0;
      if (pb - pa !== 0) return pb - pa;
      const ta = a.created_at ? new Date(a.created_at).getTime() : 0;
      const tb = b.created_at ? new Date(b.created_at).getTime() : 0;
      return tb - ta;
    });
  }

  async function togglePin(noteId, nextPinned) {
    try {
      const { data } = await api.put(`/api/notes/${noteId}`, {
        is_pinned: nextPinned,
      });
      if (data?.ok && data.data) {
        setNotes((prev) =>
          sortNotes(
            prev.map((n) => (n.id === noteId ? { ...n, ...data.data } : n))
          )
        );
      }
    } catch (err) {
      if (err?.response?.status === 401) {
        toast.error("Please log in to pin notes");
        navigate("/login");
      } else {
        toast.error(err?.response?.data?.error || "Could not update pin");
      }
    }
  }

  async function toggleStar(noteId, nextStar) {
    try {
      const { data } = await api.put(`/api/notes/${noteId}`, {
        is_starred: nextStar,
      });
      if (data?.ok && data.data) {
        setNotes((prev) =>
          prev.map((n) => (n.id === noteId ? { ...n, ...data.data } : n))
        );
      }
    } catch (err) {
      if (err?.response?.status === 401) {
        toast.error("Please log in to star notes");
        navigate("/login");
      } else {
        toast.error(err?.response?.data?.error || "Could not update star");
      }
    }
  }

  // Create on outside click if there is content
  useEffect(() => {
    function onDocMouseDown(e) {
      if (!composerRef.current) return;
      if (composerRef.current.contains(e.target)) return;
      const hasData =
        title.trim() ||
        content.trim() ||
        selectedTagIds.length > 0 ||
        newTag.trim();
      if (hasData && !submitting) {
        handleCreateNote();
      }
    }
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, content, selectedTagIds, newTag, submitting, isLoggedIn]);

  return (
    <section className="space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">All Notes</h1>
          <p className="text-neutral-600">Your latest notes appear here.</p>
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

      {/* Composer shown as first card in list */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 auto-rows-[8px] grid-flow-row-dense">
        <ResizableGridCard rowHeight={ROW_HEIGHT}>
          <div
            ref={composerRef}
            className="rounded-xl border-2 border-dashed border-neutral-300 bg-white p-4 shadow-sm overflow-auto min-h-[160px]"
          >
            {isLoggedIn ? (
              <div className="space-y-3">
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Title"
                  className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 outline-none focus:border-neutral-500"
                />
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your note..."
                  rows={5}
                  className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 outline-none focus:border-neutral-500"
                />
                <div className="space-y-2">
                  <div className="text-sm font-medium">Tags</div>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => toggleTag(t.id)}
                        className={`rounded-full border px-3 py-1 text-sm ${
                          selectedTagIds.includes(t.id)
                            ? "cursor-pointer bg-black text-white border-black"
                            : "cursor-pointer bg-white border-neutral-300 hover:bg-neutral-100"
                        }`}
                      >
                        {t.name}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="New tag name"
                      className="flex-1 rounded-lg border border-neutral-300 bg-white px-3 py-2 outline-none focus:border-neutral-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="cursor-pointer rounded-lg border border-neutral-300 bg-white px-3 py-2 hover:bg-neutral-100"
                    >
                      <PlusCircle size={16} />
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-xs text-neutral-500">
                    Click anywhere outside to save
                  </div>
                  <button
                    type="button"
                    onClick={handleCreateNote}
                    disabled={submitting}
                    className="cursor-pointer rounded-lg bg-black px-3 py-2 text-white disabled:opacity-60"
                  >
                    {submitting ? "Saving…" : <Save size={16} />}
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => {
                  toast.error("Please log in to create notes");
                  navigate("/login");
                }}
                className="cursor-pointer w-full h-full text-left"
              >
                <h2 className="font-medium">Log in to create a note</h2>
                <p className="text-sm text-neutral-600">Tap to go to login.</p>
              </button>
            )}
          </div>
        </ResizableGridCard>

        {/* Existing notes */}
        {loadingNotes ? (
          <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
            Loading…
          </div>
        ) : notes.length === 0 ? (
          <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
            No notes yet.
          </div>
        ) : (
          notes.map((n) => (
            <ResizableGridCard key={n.id} rowHeight={ROW_HEIGHT}>
              <div
                className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm overflow-auto min-h-[160px]"
                draggable
                onDragStart={(e) => onDragStart(e, n.id, n.is_pinned)}
                onDragOver={onDragOver}
                onDragEnd={onDragEnd}
                onDrop={(e) => onDrop(e, n.id)}
                onClick={() => navigate(`/notes/${n.id}`)}
              >
                <div className="flex items-start justify-between gap-2">
                  <h2 className="font-medium truncate">{n.title}</h2>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggleStar(n.id, !n.is_starred)}
                      className={`rounded-full border p-1 ${
                        n.is_starred
                          ? "cursor-pointer bg-yellow-400 text-black border-yellow-400"
                          : "cursor-pointer bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-100"
                      }`}
                      title={n.is_starred ? "Unstar" : "Star"}
                    >
                      {n.is_starred ? (
                        <StarOffIcon size={14} />
                      ) : (
                        <StarIcon size={14} />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => togglePin(n.id, !n.is_pinned)}
                      className={`rounded-full border p-1 ${
                        n.is_pinned
                          ? "cursor-pointer bg-black text-white border-black"
                          : "cursor-pointer bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-100"
                      }`}
                      title={n.is_pinned ? "Unpin" : "Pin"}
                    >
                      {n.is_pinned ? (
                        <PinOffIcon size={14} />
                      ) : (
                        <PinIcon size={14} />
                      )}
                    </button>
                  </div>
                </div>
                {n.content && (
                  <p className="text-sm text-neutral-600 whitespace-pre-wrap">
                    {n.content}
                  </p>
                )}
              </div>
            </ResizableGridCard>
          ))
        )}
      </div>
    </section>
  );
}

function ResizableGridCard({ children, rowHeight = 8 }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const parent = el.parentElement;
    if (!parent) return;

    function computeSpan() {
      const contentEl = el.firstElementChild;
      if (!contentEl) return;
      const height = contentEl.getBoundingClientRect().height;
      const styles = window.getComputedStyle(parent);
      const autoRows = parseFloat(styles.gridAutoRows) || rowHeight;
      const rowGap = parseFloat(styles.rowGap) || 0;
      const span = Math.ceil((height + rowGap) / (autoRows + rowGap));
      el.style.gridRowEnd = `span ${Math.max(span, 1)}`;
    }

    computeSpan();
    const ro = new ResizeObserver(computeSpan);
    ro.observe(el);
    const content = el.firstElementChild;
    if (content) ro.observe(content);
    window.addEventListener("resize", computeSpan);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", computeSpan);
    };
  }, [rowHeight]);

  return (
    <div ref={ref} style={{ gridRowEnd: "span 1" }}>
      {children}
    </div>
  );
}
