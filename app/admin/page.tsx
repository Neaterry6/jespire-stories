'use client'

import { useEffect, useState } from 'react'
import { addDoc, collection, deleteDoc, doc, getDocs, getDoc, onSnapshot, serverTimestamp, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/hooks/useAuth'
import Link from 'next/link'
import { BookOpen, Eye, Heart, Users, Plus, Trash2, Send, FileText } from 'lucide-react'
import { toast } from 'sonner'

type Story = {
  id: string
  title?: string
  synopsis?: string
  content?: string
  genre?: string
  coverUrl?: string
  status?: string
  createdAt?: { seconds?: number } | null
}

const OWNERS = ['akewusholaabdulbakri101@gmail.com', 'jennypandy49@gmail.com']

export default function Admin() {
  const { user, loading } = useAuth()
  const [role, setRole] = useState('')
  const [stats, setStats] = useState({ users: 0, stories: 0, views: 0, likes: 0 })
  const [stories, setStories] = useState<Story[]>([])
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [synopsis, setSynopsis] = useState('')
  const [content, setContent] = useState('')
  const [genre, setGenre] = useState('Fiction')
  const [coverUrl, setCoverUrl] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!user) return

    getDoc(doc(db, 'users', user.uid)).then((snapshot) => {
      const nextRole = snapshot.exists() ? snapshot.data().role || '' : ''
      setRole(nextRole)
    })

    const unsubscribe = onSnapshot(collection(db, 'stories'), (snapshot) => {
      const nextStories: Story[] = snapshot.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      })) as Story[]

      nextStories.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
      setStories(nextStories)
    })

    return unsubscribe
  }, [user])

  useEffect(() => {
    if (!user || !['admin', 'owner'].includes(role)) return

    Promise.all([
      getDocs(collection(db, 'users')),
      getDocs(collection(db, 'stories')),
      getDocs(collection(db, 'story_analytics')),
      getDocs(collection(db, 'likes')),
    ]).then(([users, storyDocs, analytics, likes]) => {
      setStats({
        users: users.size,
        stories: storyDocs.size,
        views: analytics.size,
        likes: likes.size,
      })
    })
  }, [user, role, stories.length])

  async function publish(event: React.FormEvent) {
    event.preventDefault()
    if (!user || !OWNERS.includes((user.email || '').toLowerCase())) return

    setBusy(true)
    try {
      await addDoc(collection(db, 'stories'), {
        title: title.trim(),
        synopsis: synopsis.trim(),
        content: content.trim(),
        genre,
        coverUrl: coverUrl.trim() || 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1000&q=80',
        tags: [],
        authorId: user.uid,
        likesCount: 0,
        bookmarksCount: 0,
        viewsCount: 0,
        status: 'published',
        createdAt: serverTimestamp(),
      })
      toast.success('Story published.')
      setTitle('')
      setSynopsis('')
      setContent('')
      setCoverUrl('')
      setOpen(false)
    } catch (error: any) {
      toast.error(error?.message || 'Could not publish story.')
    } finally {
      setBusy(false)
    }
  }

  async function toggle(story: Story) {
    const nextStatus = story.status === 'published' ? 'draft' : 'published'
    await updateDoc(doc(db, 'stories', story.id), { status: nextStatus })
    toast.success(nextStatus === 'published' ? 'Published.' : 'Moved to draft.')
  }

  async function remove(story: Story) {
    if (confirm(`Delete “${story.title || 'this story'}”?`)) {
      await deleteDoc(doc(db, 'stories', story.id))
    }
  }

  if (loading) return <div className="mx-auto max-w-6xl px-5 py-20">Loading…</div>

  if (!user || !['admin', 'owner'].includes(role)) {
    return (
      <div className="mx-auto max-w-xl px-5 py-24 text-center">
        <p className="text-xs uppercase tracking-[.25em] text-blue-600">Jespire Studio</p>
        <h1 className="mt-3 font-serif text-4xl">Owner access required.</h1>
        <Link href="/" className="mt-7 inline-block rounded-full bg-blue-600 px-6 py-3 text-white">Back home</Link>
      </div>
    )
  }

  const cards = [
    ['Users', stats.users, Users],
    ['Stories', stats.stories, BookOpen],
    ['Views', stats.views, Eye],
    ['Likes', stats.likes, Heart],
  ] as const

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[.28em] text-blue-600">Jespire Studio</p>
          <h1 className="mt-2 font-serif text-5xl">Dashboard</h1>
          <p className="mt-2 text-sm text-slate-500">Write. Publish. Watch it grow.</p>
        </div>
        <button onClick={() => setOpen(!open)} className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-5 py-3 text-sm font-medium text-white shadow-lg shadow-blue-600/15">
          <Plus size={17} /> New story
        </button>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(([label, value, Icon]) => (
          <div key={label} className="rounded-3xl border border-blue-100 bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">{label}</span>
              <Icon size={18} className="text-blue-600" />
            </div>
            <p className="mt-4 font-serif text-4xl">{value}</p>
          </div>
        ))}
      </div>

      {open && (
        <form onSubmit={publish} className="mt-8 rounded-[2rem] border border-blue-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div className="flex items-center gap-3"><FileText className="text-blue-600" /><h2 className="font-serif text-2xl">New story</h2></div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="field" />
            <select value={genre} onChange={(e) => setGenre(e.target.value)} className="field"><option>Fiction</option><option>Romance</option><option>Drama</option><option>Poetry</option><option>Anime</option></select>
            <input value={coverUrl} onChange={(e) => setCoverUrl(e.target.value)} placeholder="Cover image URL (optional)" className="field sm:col-span-2" />
            <textarea required value={synopsis} onChange={(e) => setSynopsis(e.target.value)} placeholder="Short synopsis" rows={2} className="field sm:col-span-2" />
            <textarea required value={content} onChange={(e) => setContent(e.target.value)} placeholder="Write your story here…" rows={10} className="field sm:col-span-2" />
          </div>
          <button disabled={busy} className="mt-4 inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-3 text-sm font-medium text-white disabled:opacity-50"><Send size={16} />{busy ? 'Publishing…' : 'Publish to feed'}</button>
        </form>
      )}

      <section className="mt-8 overflow-hidden rounded-[2rem] border border-blue-100 bg-white dark:border-slate-800 dark:bg-slate-950">
        <div className="border-b border-blue-100 px-6 py-5 dark:border-slate-800"><h2 className="font-serif text-2xl">Stories</h2></div>
        {stories.length ? stories.map((story) => (
          <div key={story.id} className="flex items-center gap-4 border-b border-blue-50 px-6 py-4 last:border-0 dark:border-slate-800">
            <img src={story.coverUrl} alt="" className="h-14 w-11 rounded-lg object-cover" />
            <div className="min-w-0 flex-1"><h3 className="truncate font-medium">{story.title}</h3><p className="text-xs text-slate-400">{story.genre} · {story.status}</p></div>
            <button onClick={() => toggle(story)} className="hidden rounded-full bg-blue-50 px-3 py-2 text-xs text-blue-700 sm:block">{story.status === 'published' ? 'Unpublish' : 'Publish'}</button>
            <button onClick={() => remove(story)} className="rounded-full p-2 text-slate-400 hover:text-red-500"><Trash2 size={16} /></button>
          </div>
        )) : <div className="px-6 py-12 text-center text-sm text-slate-400">No stories yet.</div>}
      </section>
    </div>
  )
}
