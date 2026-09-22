import Link from 'next/link'
import { ArrowRight, BookOpen } from 'lucide-react'

export default function Home(){
  return <div className="min-h-[calc(100vh-4rem)] overflow-hidden">
    <section className="home-hero px-5 py-20 sm:py-28">
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1fr_.9fr]">
        <div className="text-center lg:text-left">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-blue-600 font-serif text-2xl font-bold text-white shadow-xl shadow-blue-600/25 lg:mx-0">J</div>
          <p className="mt-5 text-xs font-medium uppercase tracking-[.35em] text-blue-600 dark:text-blue-400">JESPIRE</p>
          <h1 className="home-title mt-4 font-serif text-6xl leading-[.92] sm:text-8xl">Stories that <i>stay.</i></h1>
          <p className="home-muted mx-auto mt-6 max-w-md text-base leading-7 lg:mx-0">Read. Save. Share.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
            <Link href="/auth" className="rounded-full bg-blue-600 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700">Create an account <ArrowRight className="ml-2 inline" size={16}/></Link>
            <Link href="/feed" className="rounded-full border border-blue-200 bg-white/80 px-7 py-3.5 text-sm font-medium text-blue-700 backdrop-blur dark:border-blue-900 dark:bg-slate-900/70 dark:text-blue-300">Explore stories</Link>
          </div>
        </div>
        <div className="home-panel blue-glow overflow-hidden rounded-[2rem] p-3 sm:p-5">
          <img src="/jespire-reading.svg" alt="Two anime-inspired readers sharing a book" className="h-auto w-full" />
        </div>
      </div>
    </section>
    <section className="px-5 py-16">
      <div className="home-panel mx-auto max-w-4xl rounded-[2rem] p-8 text-center sm:p-12">
        <BookOpen className="mx-auto text-blue-600 dark:text-blue-400" size={25}/>
        <h2 className="home-title mt-4 font-serif text-4xl">A quiet place to read.</h2>
        <p className="home-muted mx-auto mt-3 max-w-xl leading-7">Discover stories, save your favorites, and meet fellow readers.</p>
      </div>
    </section>
  </div>
}
