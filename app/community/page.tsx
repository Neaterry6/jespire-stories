'use client'
import { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react'
import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, serverTimestamp, updateDoc } from 'firebase/firestore'
import { getDownloadURL, ref as storageRef, uploadBytes } from 'firebase/storage'
import { db, storage } from '@/lib/firebase'
import { useAuth } from '@/hooks/useAuth'
import { getJespireRole } from '@/lib/roles'
import { ArrowLeft, Camera, FileUp, Image as ImageIcon, Info, Mic, Paperclip, Pin, Play, Reply, Send, Smile, Trash2, Users, X } from 'lucide-react'
import { toast } from 'sonner'

type Message = {
  id:string; userId:string; displayName?:string; photoURL?:string; text?:string; replyToText?:string|null
  mediaUrl?:string|null; mediaType?:string|null; mediaName?:string|null; createdAt?:{seconds?:number}|null; pinned?:boolean
  reactions?:Record<string,string>
}

export default function Community(){
  const {user,loading}=useAuth(); const [messages,setMessages]=useState<Message[]>([]); const [text,setText]=useState(''); const [reply,setReply]=useState<Message|null>(null); const [busy,setBusy]=useState(false); const [recording,setRecording]=useState(false)
  const inputRef=useRef<HTMLInputElement>(null); const recorderRef=useRef<MediaRecorder|null>(null); const streamRef=useRef<MediaStream|null>(null); const chunksRef=useRef<Blob[]>([])
  const role=useMemo(()=>getJespireRole(user?.email),[user]); const staff=role!=='user'

  useEffect(()=>{const q=query(collection(db,'messages'),orderBy('createdAt','asc'));return onSnapshot(q,s=>setMessages(s.docs.map(d=>({id:d.id,...d.data()} as Message)).slice(-150)))},[])
  useEffect(()=>()=>{streamRef.current?.getTracks().forEach(t=>t.stop())},[])

  async function uploadMedia(file:File,kind:'image'|'file'){
    if(!user)return; if(file.size>10*1024*1024)return toast.error('Keep attachments under 10 MB.')
    setBusy(true)
    try{
      const safeName=file.name.replace(/[^a-zA-Z0-9._-]/g,'_'); const path=`chat-media/${user.uid}/${Date.now()}-${safeName}`
      const snapshot=await uploadBytes(storageRef(storage,path),file,{contentType:file.type||'application/octet-stream'}); const url=await getDownloadURL(snapshot.ref)
      await addDoc(collection(db,'messages'),{userId:user.uid,displayName:user.displayName||'Reader',photoURL:user.photoURL||'',text:'',mediaUrl:url,mediaType:kind==='image'?'image':file.type||'file',mediaName:file.name,replyToText:reply?.text||null,reactions:{},pinned:false,createdAt:serverTimestamp()})
      setReply(null); toast.success(kind==='image'?'Image sent.':'Attachment sent.')
    }catch(error:any){toast.error(error?.message||'Could not upload attachment.')}finally{setBusy(false)}
  }

  async function onFile(e:ChangeEvent<HTMLInputElement>){const file=e.target.files?.[0];e.target.value='';if(!file)return;await uploadMedia(file,file.type.startsWith('image/')?'image':'file')}

  async function send(){if(!user)return toast.info('Sign in to join the community');if(!text.trim())return;setBusy(true);try{await addDoc(collection(db,'messages'),{userId:user.uid,displayName:user.displayName||'Reader',photoURL:user.photoURL||'',text:text.trim(),replyToText:reply?.text||null,reactions:{},pinned:false,createdAt:serverTimestamp()});setText('');setReply(null)}catch(error:any){toast.error(error?.message||'Message failed.')}finally{setBusy(false)}}
  async function react(m:Message,emoji:string){if(!user)return;await updateDoc(doc(db,'messages',m.id),{[`reactions.${user.uid}`]:emoji})}
  async function pin(m:Message){if(!staff)return;await updateDoc(doc(db,'messages',m.id),{pinned:!m.pinned})}
  async function remove(m:Message){if(!user)return;if(m.userId!==user.uid&&!staff)return;await deleteDoc(doc(db,'messages',m.id))}

  async function toggleRecording(){
    if(recording){recorderRef.current?.stop();return}
    if(typeof window==='undefined'||!navigator.mediaDevices?.getUserMedia||typeof MediaRecorder==='undefined')return toast.error('Voice recording is not supported here.')
    try{
      const stream=await navigator.mediaDevices.getUserMedia({audio:true}); streamRef.current=stream; chunksRef.current=[]
      const recorder=new MediaRecorder(stream); recorderRef.current=recorder
      recorder.ondataavailable=e=>{if(e.data.size)chunksRef.current.push(e.data)}
      recorder.onstop=async()=>{setRecording(false);stream.getTracks().forEach(t=>t.stop());const blob=new Blob(chunksRef.current,{type:recorder.mimeType||'audio/webm'});if(!user||!blob.size)return;setBusy(true);try{const ext=(recorder.mimeType||'audio/webm').includes('mp4')?'m4a':'webm';const path=`chat-media/${user.uid}/${Date.now()}-voice.${ext}`;const snapshot=await uploadBytes(storageRef(storage,path),blob,{contentType:blob.type});const url=await getDownloadURL(snapshot.ref);await addDoc(collection(db,'messages'),{userId:user.uid,displayName:user.displayName||'Reader',photoURL:user.photoURL||'',text:'',mediaUrl:url,mediaType:'audio',mediaName:'Voice note',replyToText:reply?.text||null,reactions:{},pinned:false,createdAt:serverTimestamp()});setReply(null);toast.success('Voice note sent.')}catch(error:any){toast.error(error?.message||'Could not send voice note.')}finally{setBusy(false)}}
      recorder.start();setRecording(true)
    }catch(error:any){toast.error(error?.message||'Microphone permission was not granted.')}
  }

  return <main className="mx-auto max-w-3xl px-0 pb-24 sm:px-3 sm:py-5">
    <div className="sticky top-0 z-20 flex items-center gap-3 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-[#07101f]/95 sm:rounded-2xl sm:border"><button onClick={()=>history.back()} className="grid h-10 w-10 place-items-center rounded-full bg-slate-100 dark:bg-slate-900" aria-label="Back"><ArrowLeft size={19}/></button><div className="grid h-10 w-10 place-items-center rounded-full bg-blue-600 text-white"><Users size={19}/></div><div className="min-w-0 flex-1"><h1 className="truncate font-semibold text-slate-950 dark:text-white">Jespire Community</h1><p className="text-xs text-slate-500">{messages.length?`${new Set(messages.map(m=>m.userId)).size} active readers`:'Be the first to chat'}</p></div><button className="grid h-10 w-10 place-items-center rounded-full bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-300" aria-label="Community info"><Info size={18}/></button></div>
    <section className="overflow-hidden border-x border-slate-200 bg-[#f7f9fc] dark:border-slate-800 dark:bg-black sm:rounded-2xl sm:border"><div className="h-[68vh] min-h-[520px] overflow-y-auto px-3 py-5 sm:px-5">{messages.length?messages.map(m=>{const mine=m.userId===user?.uid;return <div key={m.id} className={`mb-4 flex ${mine?'justify-end':'justify-start'}`}><div className={`max-w-[84%] ${mine?'items-end':''}`}><div className={`flex gap-2 ${mine?'flex-row-reverse':''}`}><img src={m.photoURL||`https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(m.displayName||'Reader')}`} className="mt-1 h-9 w-9 rounded-full object-cover" alt=""/><div className={`min-w-0 rounded-[1.35rem] px-3.5 py-2.5 shadow-sm ${mine?'rounded-tr-md bg-blue-600 text-white':'rounded-tl-md bg-white text-slate-800 dark:bg-[#171b22] dark:text-slate-100'}`}>{m.pinned&&<div className="mb-1 flex items-center gap-1 text-[10px] uppercase tracking-wider opacity-60"><Pin size={10}/> Pinned</div>}{!mine&&<p className="mb-1 text-xs font-semibold text-blue-600">{m.displayName||'Reader'}</p>}{m.replyToText&&<div className="mb-2 rounded-lg border-l-2 border-current/30 bg-black/5 px-2.5 py-1.5 text-xs opacity-75"><span className="font-semibold">Reply</span><br/>{m.replyToText}</div>}{m.mediaUrl&&m.mediaType==='image'&&<img src={m.mediaUrl} alt={m.mediaName||'Shared image'} className="mb-2 max-h-72 w-full rounded-xl object-cover"/>}{m.mediaUrl&&m.mediaType==='audio'&&<div className="mb-2 flex items-center gap-2 rounded-xl bg-black/5 p-2"><Play size={15}/><audio controls src={m.mediaUrl} className="h-9 max-w-[230px]"/></div>}{m.mediaUrl&&m.mediaType!=='image'&&m.mediaType!=='audio'&&<a href={m.mediaUrl} target="_blank" rel="noreferrer" className="mb-2 flex items-center gap-2 rounded-xl bg-black/5 p-2 text-sm underline"><FileUp size={16}/><span className="truncate">{m.mediaName||'Attachment'}</span></a>}{m.text&&<p className="whitespace-pre-wrap break-words text-[15px] leading-5">{m.text}</p>}</div></div><div className={`mt-1 flex items-center gap-1 ${mine?'justify-end':'justify-start'} px-10`}><button onClick={()=>setReply(m)} className="rounded-full px-2 py-1 text-xs font-medium text-slate-400 hover:bg-slate-100 hover:text-blue-600 dark:hover:bg-slate-900"><Reply size={13}/></button>{['❤️','😂','😭','😍','🔥'].map(e=><button key={e} onClick={()=>react(m,e)} className="rounded-full px-1 text-xs opacity-75 hover:scale-110">{e}</button>)}{(m.userId===user?.uid||staff)&&<button onClick={()=>remove(m)} className="rounded-full p-1.5 text-slate-400 hover:text-red-500"><Trash2 size={13}/></button>}{staff&&<button onClick={()=>pin(m)} className="rounded-full p-1.5 text-slate-400 hover:text-blue-600"><Pin size={13}/></button>}</div></div></div>}):<div className="flex h-full items-center justify-center text-center text-sm text-slate-400">No messages yet.<br/>Start the conversation.</div>}</div>
    {reply&&<div className="flex items-center gap-2 border-t border-slate-200 bg-white px-4 py-2.5 dark:border-slate-800 dark:bg-[#0d1117]"><Reply size={15} className="text-blue-600"/><span className="min-w-0 flex-1 truncate text-xs text-slate-500">Replying to: {reply.text||reply.mediaName||'attachment'}</span><button onClick={()=>setReply(null)} className="p-1 text-slate-400"><X size={16}/></button></div>}
    <div className="flex items-center gap-2 border-t border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-[#0d1117]"><input ref={inputRef} type="file" hidden accept="image/*,.pdf,.txt,.doc,.docx" onChange={onFile}/><button onClick={()=>inputRef.current?.click()} disabled={busy||recording} className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-500 hover:text-blue-600 dark:bg-slate-900" aria-label="Attach file"><Paperclip size={19}/></button><button onClick={()=>{const el=inputRef.current;if(el){el.accept='image/*';el.click()}}} disabled={busy||recording} className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-500 hover:text-blue-600 dark:bg-slate-900" aria-label="Send image"><ImageIcon size={19}/></button><button onClick={()=>{setText(v=>v+' 😊')}} disabled={recording} className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-500 hover:text-blue-600 dark:bg-slate-900" aria-label="Emoji"><Smile size={19}/></button><input value={text} onChange={e=>setText(e.target.value)} onKeyDown={e=>e.key==='Enter'&&!e.shiftKey&&(e.preventDefault(),send())} placeholder={loading?'Loading…':'Message'} className="min-w-0 flex-1 rounded-full border border-slate-200 bg-[#f7f9fc] px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"/><button onClick={text.trim()?send:toggleRecording} disabled={busy} className={`grid h-10 w-10 shrink-0 place-items-center rounded-full text-white ${recording?'bg-red-500':'bg-blue-600'}`} aria-label={text.trim()?'Send':'Voice note'}>{text.trim()?<Send size={17}/>:recording?<span className="h-2.5 w-2.5 animate-pulse rounded-full bg-white"/>:<Mic size={18}/>}</button></div></section>
  </main>
}
