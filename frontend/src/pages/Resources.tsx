import { useState } from 'react';
import gallery from '../data/componentGallery.json';
import projects from '../data/projectCodes.json';
export default function Resources() {
 const [filter,setFilter]=useState('');
 const [active,setActive]=useState<number|null>(null);
 const items=gallery.filter(c=>c.name.replaceAll('_',' ').toLowerCase().includes(filter.toLowerCase()));
 return <div className="mx-auto max-w-6xl px-4 py-8 text-slate-100">
 <h1 className="text-3xl font-bold">IoT Kit Components & Arduino Projects</h1>
 <p className="my-4 text-slate-300">Explore your kit's components and learn from the uploaded circuit examples.</p>
 <input aria-label="Search components" className="mb-5 w-full rounded-lg border border-slate-600 bg-slate-900 p-3" placeholder="Search components" value={filter} onChange={e=>setFilter(e.target.value)}/>
 <div className="grid grid-cols-2 gap-4 md:grid-cols-4">{items.map(c=><article key={c.name} className="glass rounded-xl p-3"><img loading="lazy" src={'/components/'+c.file} alt={c.name.replaceAll('_',' ')} className="h-36 w-full object-contain"/><h2 className="mt-2 font-semibold capitalize">{c.name.replaceAll('_',' ')}</h2></article>)}</div>
 <h2 className="mb-4 mt-10 text-2xl font-bold">Circuit code library</h2>
 <p className="mb-4 text-slate-300">Examples transcribed from the supplied document. Check wiring and libraries before uploading to hardware.</p>
 <div className="space-y-3">{projects.map(p=><section key={p.id} className="glass rounded-lg p-4"><button className="w-full text-left font-semibold" onClick={()=>setActive(active===p.id?null:p.id)}>{p.title} {active===p.id?'−':'+'}</button>{active===p.id&&<><pre className="mt-3 max-h-96 overflow-auto whitespace-pre-wrap rounded-lg bg-slate-950 p-4 text-xs">{p.code}</pre><button className="mt-2 rounded bg-violet-700 px-4 py-2" onClick={()=>navigator.clipboard.writeText(p.code)}>Copy code</button></>}</section>)}</div>
 </div>
}
