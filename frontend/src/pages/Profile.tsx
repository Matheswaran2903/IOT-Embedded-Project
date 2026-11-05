import { FormEvent, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { authApi } from '../services/api';
export default function Profile() {
 const {user,refreshProfile,logout}=useAuth();
 const [name,setName]=useState(user?.name??''); const [school,setSchool]=useState(user?.school??'');
 const [cls,setCls]=useState(user?.class_name??''); const [level,setLevel]=useState<'beginner'|'intermediate'|'advanced'>(user?.quiz_level??'beginner');
 const [message,setMessage]=useState(''); const [busy,setBusy]=useState(false);
 async function save(e:FormEvent){e.preventDefault();setBusy(true);setMessage('');try{await authApi.updateProfile({name,school,class_name:cls,quiz_level:level});await refreshProfile();setMessage('Profile updated successfully.')}catch(err){setMessage(err instanceof Error?err.message:'Could not update profile.')}finally{setBusy(false)}}
 return <div className="mx-auto max-w-2xl px-4 py-10 text-white"><div className="glass rounded-3xl p-7"><h1 className="text-3xl font-bold">My Profile</h1><p className="mt-2 text-slate-300">{user?.email}</p><form onSubmit={save} className="mt-6 grid gap-4">{[[name,setName,'Full name'],[school,setSchool,'School'],[cls,setCls,'Class / Grade']].map(([v,set,label])=><label key={label as string} className="grid gap-2">{label as string}<input className="rounded-lg border border-slate-500 bg-slate-900 p-3 text-white" value={v as string} onChange={e=>(set as (v:string)=>void)(e.target.value)} required maxLength={label==='Class / Grade'?10:label==='School'?120:80}/></label>)}<label className="grid gap-2">Learning level<select className="rounded-lg border border-slate-500 bg-slate-900 p-3" value={level} onChange={e=>setLevel(e.target.value as typeof level)}><option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option></select></label>{message&&<p role="status">{message}</p>}<button disabled={busy} className="rounded-xl bg-cyan-600 p-3 font-bold">{busy?'Saving…':'Save profile'}</button></form><button onClick={logout} className="mt-5 rounded-xl border border-red-300 p-3 text-red-200">Sign out</button></div></div>;
}
