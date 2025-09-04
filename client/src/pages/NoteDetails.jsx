import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../lib/api";
import { toast } from "react-hot-toast";
import {
  Star as StarIcon,
  StarOff as StarOffIcon,
  Pin as PinIcon,
  PinOff as PinOffIcon,
  Trash2 as TrashIcon,
  Save as SaveIcon,
  ChevronsLeft,
} from "lucide-react";

export default function NoteDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [note, setNote] = useState(null);
  const [tags, setTags] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingContent, setEditingContent] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [tempTitle, setTempTitle] = useState("");
  const [tempContent, setTempContent] = useState("");

  async function load() {
    try {
      const [{ data: n }, { data: t }, { data: at }] = await Promise.all([
        api.get(`/api/notes/${id}`),
        api.get(`/api/notes/${id}/tags`),
        api.get("/api/tags"),
      ]);
      if (n?.ok) setNote(n.data);
      if (t?.ok) setTags(t.data || []);
      if (at?.ok) setAllTags(at.data || []);
    } catch (err) {
      if (err?.response?.status === 401) navigate("/login");
    }
  }

  useEffect(() => {
    load();
  }, [id]);

  async function save(update) {
    try {
      const { data } = await api.put(`/api/notes/${id}`, update);
      if (data?.ok) setNote((prev) => ({ ...prev, ...data.data }));
    } catch (err) {
      toast.error("Could not save");
    }
  }

  async function remove() {
    try {
      const { data } = await api.delete(`/api/notes/${id}`);
      if (data?.ok) {
        toast.success("Deleted");
        navigate("/");
      }
    } catch (err) {
      toast.error("Delete failed");
    }
  }

  async function linkTags(tagIds) {
    try {
      const { data } = await api.post(`/api/notes/${id}/tags`, { tagIds });
      if (data?.ok) load();
    } catch (err) {
      toast.error("Update tags failed");
    }
  }

  async function unlinkTag(tagId) {
    try {
      const { data } = await api.delete(`/api/notes/${id}/tags/${tagId}`);
      if (data?.ok) setTags((prev) => prev.filter((t) => t.id !== tagId));
    } catch (err) {
      toast.error("Update tags failed");
    }
  }

  async function createTag() {
    const name = newTag.trim();
    if (!name) return;
    try {
      const { data } = await api.post("/api/tags", { name });
      if (data?.ok && data.data) {
        setAllTags((prev) => [...prev, data.data]);
        setTags((prev) => [...prev, data.data]);
        await linkTags([data.data.id]);
        setNewTag("");
      }
    } catch (err) {
      toast.error("Create tag failed");
    }
  }

  if (!note) return null;

  const commitTitle = async () => {
    setEditingTitle(false);
    const v = (tempTitle ?? "").trim();
    if (v && v !== note.title) await save({ title: v });
  };

  const commitContent = async () => {
    setEditingContent(false);
    const v = tempContent ?? "";
    if (v !== (note.content || "")) await save({ content: v });
  };

  const saveAll = async () => {
    const updates = {};
    if (editingTitle) {
      const v = (tempTitle ?? "").trim();
      if (v && v !== note.title) Object.assign(updates, { title: v });
      setEditingTitle(false);
    }
    if (editingContent) {
      const v = tempContent ?? "";
      if (v !== (note.content || "")) Object.assign(updates, { content: v });
      setEditingContent(false);
    }
    if (Object.keys(updates).length > 0) await save(updates);
  };

  return (
    <section className="space-y-4">
      <header className="flex items-center justify-between">
        <div className="space-y-1">
          <button
            onClick={() => navigate("/")}
            className="cursor-pointer flex items-center gap-2 rounded-lg border border-neutral-300 bg-white p-2 hover:bg-neutral-100"
          >
            <ChevronsLeft />
            Go Back
          </button>
          {!editingTitle ? (
            <h1
              onDoubleClick={() => {
                setEditingTitle(true);
                setTempTitle(note.title);
              }}
              className="text-2xl font-semibold tracking-tight"
            >
              {note.title}
            </h1>
          ) : (
            <input
              autoFocus
              value={tempTitle}
              onChange={(e) => setTempTitle(e.target.value)}
              onBlur={commitTitle}
              className="cursor-pointer rounded-lg border border-neutral-300 bg-white px-3 py-2 outline-none focus:border-neutral-500"
            />
          )}
          <p className="text-neutral-600">
            Double click to edit title or content. Use buttons to star/pin or
            delete.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => save({ is_starred: !note.is_starred })}
            title={note.is_starred ? "Unstar" : "Star"}
            className="cursor-pointer rounded-lg border border-neutral-300 bg-white p-2 hover:bg-neutral-100"
          >
            {note.is_starred ? (
              <StarOffIcon size={16} />
            ) : (
              <StarIcon size={16} />
            )}
          </button>
          <button
            onClick={() => save({ is_pinned: !note.is_pinned })}
            title={note.is_pinned ? "Unpin" : "Pin"}
            className="cursor-pointer rounded-lg border border-neutral-300 bg-white p-2 hover:bg-neutral-100"
          >
            {note.is_pinned ? <PinOffIcon size={16} /> : <PinIcon size={16} />}
          </button>
          <button
            onClick={saveAll}
            title="Save"
            className="cursor-pointer rounded-lg border border-neutral-300 bg-white p-2 hover:bg-neutral-100"
          >
            <SaveIcon size={16} />
          </button>
          <button
            onClick={remove}
            title="Delete"
            className="cursor-pointer rounded-lg bg-red-600 text-white p-2"
          >
            <TrashIcon size={16} />
          </button>
        </div>
      </header>

      <article className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm min-h-40">
        {!editingContent ? (
          <div
            onDoubleClick={() => {
              setEditingContent(true);
              setTempContent(note.content || "");
            }}
            className="whitespace-pre-wrap"
          >
            {note.content || "—"}
          </div>
        ) : (
          <textarea
            autoFocus
            value={tempContent}
            onChange={(e) => setTempContent(e.target.value)}
            onBlur={commitContent}
            rows={8}
            className="cursor-pointer w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 outline-none focus:border-neutral-500"
          />
        )}
      </article>

      <section className="space-y-2">
        <div className="text-sm font-medium">Tags</div>
        <div className="flex flex-wrap gap-2">
          {tags.map((t) => (
            <button
              key={t.id}
              onClick={() => unlinkTag(t.id)}
              className="cursor-pointer rounded-full border px-3 py-1 text-sm bg-white border-neutral-300 hover:bg-neutral-100"
            >
              {t.name} ×
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <select
            onChange={(e) => e.target.value && linkTags([e.target.value])}
            className="cursor-pointer rounded-lg border border-neutral-300 bg-white px-3 py-2 outline-none focus:border-neutral-500"
          >
            <option value="">Add existing tag…</option>
            {allTags
              .filter((t) => !tags.find((x) => x.id === t.id))
              .map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
          </select>
          <input
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="New tag"
            className="cursor-pointer flex-1 rounded-lg border border-neutral-300 bg-white px-3 py-2 outline-none focus:border-neutral-500"
          />
          <button
            onClick={createTag}
            className="cursor-pointer  rounded-lg border border-neutral-300 bg-white px-3 py-2 hover:bg-neutral-100"
          >
            Create
          </button>
        </div>
      </section>
    </section>
  );
}
