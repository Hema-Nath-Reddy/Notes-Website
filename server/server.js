const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables from .env
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

// Validate required env vars
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_ANON_KEY in environment.');
}

// Create Supabase client
const supabase = createClient(SUPABASE_URL || '', SUPABASE_ANON_KEY || '');

// Health route
app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'server', timestamp: new Date().toISOString() });
});

// Simple Supabase connectivity check (no table read)
app.get('/status', async (_req, res) => {
  try {
    // A lightweight no-op request: get current user with no session always returns null but exercises client
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      return res.status(500).json({ ok: false, error: error.message });
    }
    return res.json({ ok: true, supabaseReachable: true, user: data?.user || null });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// Auth endpoints
app.post('/auth/signup', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ ok: false, error: 'Email and password required' });
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return res.status(400).json({ ok: false, error: error.message });
    return res.status(201).json({ ok: true, data });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ ok: false, error: 'Email and password required' });
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return res.status(401).json({ ok: false, error: error.message });
    return res.json({ ok: true, data });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

app.post('/auth/logout', async (req, res) => {
  try {
    const supa = getSupabaseForRequest(req);
    const { error } = await supa.auth.signOut();
    if (error) return res.status(400).json({ ok: false, error: error.message });
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

app.get('/auth/google-url', async (req, res) => {
  try {
    const redirectTo = req.query.redirect || `${req.protocol}://${req.get('host')}/health`;
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo }
    });
    if (error) return res.status(400).json({ ok: false, error: error.message });
    return res.json({ ok: true, url: data.url });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// Helper: per-request Supabase client using user's JWT (Authorization: Bearer <token>)
function getSupabaseForRequest(req) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
  return createClient(SUPABASE_URL || '', SUPABASE_ANON_KEY || '', {
    global: {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    }
  });
}

async function getUserIdOr401(req, res, supa) {
  const { data, error } = await supa.auth.getUser();
  if (error) {
    return res.status(401).json({ ok: false, error: error.message });
  }
  if (!data?.user) {
    return res.status(401).json({ ok: false, error: 'Unauthorized' });
  }
  return data.user.id;
}

// Notes API
app.get('/api/notes', async (req, res) => {
  try {
    const supa = getSupabaseForRequest(req);
    const userId = await getUserIdOr401(req, res, supa);
    if (typeof userId !== 'string') return; // response already sent

    const { q, archived, pinned, starred } = req.query;
    let query = supa.from('notes').select('*').order('created_at', { ascending: false });
    if (typeof archived !== 'undefined') {
      query = query.eq('is_archived', archived === 'true');
    }
    if (typeof pinned !== 'undefined') {
      query = query.eq('is_pinned', pinned === 'true');
    }
    if (typeof starred !== 'undefined') {
      query = query.eq('is_starred', starred === 'true');
    }
    if (q && String(q).trim().length > 0) {
      const term = String(q).trim();
      // Support partial, case-insensitive matches on title or content
      query = query.or(`title.ilike.%${term}%,content.ilike.%${term}%`);
    }

    const { data, error } = await query;
    if (error) return res.status(400).json({ ok: false, error: error.message });
    return res.json({ ok: true, data });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

app.post('/api/notes', async (req, res) => {
  try {
    const supa = getSupabaseForRequest(req);
    const userId = await getUserIdOr401(req, res, supa);
    if (typeof userId !== 'string') return;

    const { title, content, is_archived, is_pinned, color } = req.body || {};
    if (!title || String(title).trim().length === 0) {
      return res.status(400).json({ ok: false, error: 'Title is required' });
    }

    const insertPayload = {
      user_id: userId,
      title,
      content: content ?? null,
      is_archived: Boolean(is_archived) || false,
      is_pinned: Boolean(is_pinned) || false,
      color: color ?? null
    };

    const { data, error } = await supa.from('notes').insert(insertPayload).select('*').single();
    if (error) return res.status(400).json({ ok: false, error: error.message });
    return res.status(201).json({ ok: true, data });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

app.get('/api/notes/:id', async (req, res) => {
  try {
    const supa = getSupabaseForRequest(req);
    const userId = await getUserIdOr401(req, res, supa);
    if (typeof userId !== 'string') return;

    const { id } = req.params;
    const { data, error } = await supa.from('notes').select('*').eq('id', id).single();
    if (error) return res.status(404).json({ ok: false, error: error.message });
    return res.json({ ok: true, data });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// Get tags for a note
app.get('/api/notes/:id/tags', async (req, res) => {
  try {
    const supa = getSupabaseForRequest(req);
    const userId = await getUserIdOr401(req, res, supa);
    if (typeof userId !== 'string') return;

    const { id } = req.params;
    const { data, error } = await supa
      .from('note_tags')
      .select('tags:tag_id ( id, name )')
      .eq('note_id', id);
    if (error) return res.status(400).json({ ok: false, error: error.message });
    const tags = (data || []).map(r => r.tags).filter(Boolean);
    return res.json({ ok: true, data: tags });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

app.put('/api/notes/:id', async (req, res) => {
  try {
    const supa = getSupabaseForRequest(req);
    const userId = await getUserIdOr401(req, res, supa);
    if (typeof userId !== 'string') return;

    const { id } = req.params;
    const { title, content, is_archived, is_pinned, is_starred, color } = req.body || {};
    const updatePayload = {};
    if (typeof title !== 'undefined') updatePayload.title = title;
    if (typeof content !== 'undefined') updatePayload.content = content;
    if (typeof is_archived !== 'undefined') updatePayload.is_archived = Boolean(is_archived);
    if (typeof is_pinned !== 'undefined') updatePayload.is_pinned = Boolean(is_pinned);
    if (typeof is_starred !== 'undefined') updatePayload.is_starred = Boolean(is_starred);
    if (typeof color !== 'undefined') updatePayload.color = color;

    const { data, error } = await supa.from('notes').update(updatePayload).eq('id', id).select('*').single();
    if (error) return res.status(400).json({ ok: false, error: error.message });
    return res.json({ ok: true, data });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

app.delete('/api/notes/:id', async (req, res) => {
  try {
    const supa = getSupabaseForRequest(req);
    const userId = await getUserIdOr401(req, res, supa);
    if (typeof userId !== 'string') return;

    const { id } = req.params;
    const { error } = await supa.from('notes').delete().eq('id', id);
    if (error) return res.status(400).json({ ok: false, error: error.message });
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// Tags API
app.get('/api/tags', async (req, res) => {
  try {
    const supa = getSupabaseForRequest(req);
    const userId = await getUserIdOr401(req, res, supa);
    if (typeof userId !== 'string') return;

    const { data, error } = await supa.from('tags').select('*').order('name', { ascending: true });
    if (error) return res.status(400).json({ ok: false, error: error.message });
    return res.json({ ok: true, data });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

app.post('/api/tags', async (req, res) => {
  try {
    const supa = getSupabaseForRequest(req);
    const userId = await getUserIdOr401(req, res, supa);
    if (typeof userId !== 'string') return;

    const { name } = req.body || {};
    if (!name || String(name).trim().length === 0) {
      return res.status(400).json({ ok: false, error: 'Tag name is required' });
    }

    const { data, error } = await supa.from('tags').insert({ user_id: userId, name }).select('*').single();
    if (error) return res.status(400).json({ ok: false, error: error.message });
    return res.status(201).json({ ok: true, data });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

app.delete('/api/tags/:id', async (req, res) => {
  try {
    const supa = getSupabaseForRequest(req);
    const userId = await getUserIdOr401(req, res, supa);
    if (typeof userId !== 'string') return;

    const { id } = req.params;
    const { error } = await supa.from('tags').delete().eq('id', id);
    if (error) return res.status(400).json({ ok: false, error: error.message });
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// Link tags to a note
app.post('/api/notes/:id/tags', async (req, res) => {
  try {
    const supa = getSupabaseForRequest(req);
    const userId = await getUserIdOr401(req, res, supa);
    if (typeof userId !== 'string') return;

    const { id } = req.params;
    const { tagIds } = req.body || {};
    if (!Array.isArray(tagIds) || tagIds.length === 0) {
      return res.status(400).json({ ok: false, error: 'tagIds must be a non-empty array' });
    }

    const rows = tagIds.map(tid => ({ note_id: id, tag_id: tid }));
    const { error } = await supa.from('note_tags').insert(rows);
    if (error) return res.status(400).json({ ok: false, error: error.message });
    return res.status(201).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// Unlink a tag from a note
app.delete('/api/notes/:noteId/tags/:tagId', async (req, res) => {
  try {
    const supa = getSupabaseForRequest(req);
    const userId = await getUserIdOr401(req, res, supa);
    if (typeof userId !== 'string') return;

    const { noteId, tagId } = req.params;
    const { error } = await supa.from('note_tags').delete().match({ note_id: noteId, tag_id: tagId });
    if (error) return res.status(400).json({ ok: false, error: error.message });
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// Notes by tag
app.get('/api/tags/:tagId/notes', async (req, res) => {
  try {
    const supa = getSupabaseForRequest(req);
    const userId = await getUserIdOr401(req, res, supa);
    if (typeof userId !== 'string') return;

    const { tagId } = req.params;
    const { q } = req.query;
    let query = supa
      .from('note_tags')
      .select('notes:note_id ( id, title, content, created_at, is_pinned, is_starred )')
      .eq('tag_id', tagId);

    const { data, error } = await query;
    if (error) return res.status(400).json({ ok: false, error: error.message });
    let notes = (data || []).map(r => r.notes).filter(Boolean);
    if (q && String(q).trim().length > 0) {
      const term = String(q).toLowerCase();
      notes = notes.filter(n =>
        (n.title || '').toLowerCase().includes(term) ||
        (n.content || '').toLowerCase().includes(term)
      );
    }
    // sort pinned first, then newest
    notes.sort((a, b) => {
      const pb = (b.is_pinned ? 1 : 0) - (a.is_pinned ? 1 : 0);
      if (pb !== 0) return pb;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
    return res.json({ ok: true, data: notes });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});


