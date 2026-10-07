"use client";

import { useState } from "react";
import WorldDashboard from "./components/WorldDashboard";
import { Activity, Flag, Goal, Pause, Play, RotateCcw, Shield, Trophy, Users, Zap } from "lucide-react";

type Event={minute:number;team:"home"|"away";type:"goal"|"card"|"shot";text:string};

const initialEvents:Event[]=[
 {minute:8,team:"home",type:"shot",text:"Finalização perigosa de Rafael"},
 {minute:17,team:"away",type:"card",text:"Cartão amarelo — volante"},
 {minute:31,team:"home",type:"goal",text:"GOOOL! Rafael abre o placar"},
 {minute:44,team:"away",type:"shot",text:"Defesa difícil do goleiro"},
 {minute:63,team:"away",type:"goal",text:"Empate após contra-ataque"}
];

export default function Home(){
 const [minute,setMinute]=useState(63);
 const [running,setRunning]=useState(false);
 const [home,setHome]=useState(1);
 const [away,setAway]=useState(1);
 const [events,setEvents]=useState(initialEvents);
 const [pos,setPos]=useState(54);
 const [xg,setXg]=useState({home:1.18,away:0.82});

 function tick(){
  if(!running||minute>=90){setRunning(false);return}
  setMinute(v=>v+1);
  setPos(v=>Math.max(38,Math.min(62,v+(Math.random()>.5?1:-1))));
  setXg(v=>({home:Number((v.home+(Math.random()>.78?.04:0)).toFixed(2)),away:Number((v.away+(Math.random()>.82?.05:0)).toFixed(2))}));
 }
 function goal(team:"home"|"away"){
  if(team==="home")setHome(v=>v+1);else setAway(v=>v+1);
  setEvents(v=>[{minute,team,type:"goal",text:"GOOOL! Gol marcado"},...v]);
 }

 return <main className="min-h-screen bg-[#07100d] text-white">
  <header className="border-b border-emerald-950 bg-[#091713]">
   <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
    <div><div className="font-mono text-xs uppercase tracking-[.25em] text-emerald-400">Futebolzinho FC</div><h1 className="text-xl font-bold">Match Center</h1></div>
    <div className="rounded-full border border-emerald-900 px-3 py-1.5 text-xs text-emerald-300">{minute>=90?"ENCERRADO":running?"AO VIVO":"PAUSADO"}</div>
   </div>
  </header>
  <div className="mx-auto grid max-w-7xl gap-5 p-5 lg:grid-cols-[1fr_340px]">
   <section className="space-y-5">
    <div className="overflow-hidden rounded-3xl border border-emerald-950 bg-[#0c1814]">
     <div className="flex justify-between border-b border-emerald-950 px-5 py-3 text-xs text-emerald-300"><span>BRASILEIRÃO • RODADA 12</span><span>{minute}'</span></div>
     <div className="grid grid-cols-3 items-center px-6 py-10 text-center">
      <Team name="Futebolzinho FC" short="FZ" color="from-emerald-500 to-teal-700"/>
      <div><div className="text-5xl font-black">{home} <span className="text-emerald-500">×</span> {away}</div><div className="mt-2 text-xs text-zinc-500">Tempo de jogo</div></div>
      <Team name="Atlético Nacional" short="AN" color="from-sky-500 to-blue-700"/>
     </div>
     <div className="grid grid-cols-3 gap-3 border-t border-emerald-950 p-5">
      <Stat label="POSSE" a={String(pos)+"%"} b={String(100-pos)+"%"}/>
      <Stat label="xG" a={xg.home.toFixed(2)} b={xg.away.toFixed(2)}/>
      <Stat label="FINALIZAÇÕES" a="8" b="6"/>
     </div>
    </div>
    <div className="rounded-3xl border border-emerald-950 bg-[#0c1814] p-5">
     <div className="mb-4 flex justify-between"><h2 className="font-bold">Campo tático</h2><span className="text-xs text-zinc-500">4-3-3 • pressão alta</span></div>
     <div className="relative mx-auto aspect-[1.65] max-w-3xl overflow-hidden rounded-2xl border-2 border-white/15 bg-gradient-to-b from-emerald-700/80 to-emerald-900/80">
      <div className="absolute inset-5 rounded-xl border border-white/25"/><div className="absolute left-1/2 top-0 h-full w-px bg-white/20"/>
      {[[50,82],[24,67],[42,65],[58,65],[76,67],[30,45],[50,50],[70,45],[28,25],[50,20],[72,25]].map((p,i)=><div key={i} className="absolute -translate-x-1/2 -translate-y-1/2" style={{left:String(p[0])+"%",top:String(p[1])+"%"}}><div className="flex h-7 w-7 items-center justify-center rounded-full border border-white/60 bg-emerald-500 text-[9px] font-bold">{i+1}</div></div>)}
     </div>
    </div>
    <div className="rounded-3xl border border-emerald-950 bg-[#0c1814] p-5">
     <div className="mb-4 flex items-center justify-between"><h2 className="font-bold">Controle da partida</h2><div className="flex gap-2"><button onClick={()=>setMinute(0)} className="rounded-xl border border-emerald-900 p-2"><RotateCcw size={16}/></button><button onClick={()=>setRunning(v=>!v)} className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-bold text-black">{running?<Pause size={15}/>:<Play size={15}/>} {running?"Pausar":"Continuar"}</button></div></div>
     <div className="grid grid-cols-2 gap-3 sm:grid-cols-4"><button onClick={tick} className="rounded-xl border border-emerald-900 p-3 text-xs">Simular +1'</button><button onClick={()=>goal("home")} className="rounded-xl border border-emerald-900 p-3 text-xs">Gol mandante</button><button onClick={()=>goal("away")} className="rounded-xl border border-emerald-900 p-3 text-xs">Gol visitante</button><button onClick={()=>{setMinute(90);setRunning(false)}} className="rounded-xl border border-emerald-900 p-3 text-xs">Fim</button></div>
    </div>
   </section>
   <aside className="space-y-5">
    <div className="rounded-3xl border border-emerald-950 bg-[#0c1814] p-5"><div className="mb-4 flex items-center gap-2"><Activity size={17} className="text-emerald-400"/><h2 className="font-bold">Momentum</h2></div><div className="h-3 overflow-hidden rounded-full bg-sky-500"><div className="h-full bg-emerald-400" style={{width:String(pos)+"%"}}/></div><div className="mt-2 flex justify-between text-xs text-zinc-500"><span>Futebolzinho</span><span>Atlético</span></div></div>
    <div className="rounded-3xl border border-emerald-950 bg-[#0c1814] p-5"><div className="mb-4 flex items-center gap-2"><Zap size={17} className="text-yellow-400"/><h2 className="font-bold">Eventos</h2></div><div className="space-y-3">{events.map((e,i)=><div key={i} className="flex gap-3 text-sm"><span className="w-8 shrink-0 font-mono text-xs text-zinc-500">{e.minute}'</span><div className="flex items-center gap-1">{e.type==="goal"?<Goal size={13} className="text-emerald-400"/>:e.type==="card"?<Flag size={13} className="text-yellow-400"/>:<Activity size={13} className="text-sky-400"/>}{e.text}</div></div>)}</div></div>
    <div className="rounded-3xl border border-emerald-950 bg-[#0c1814] p-5"><h2 className="mb-4 font-bold">Atalhos</h2><div className="space-y-3 text-sm text-zinc-300"><div className="flex gap-2"><Users size={15} className="text-emerald-400"/> Substituições</div><div className="flex gap-2"><Shield size={15} className="text-emerald-400"/> Linha defensiva</div><div className="flex gap-2"><Trophy size={15} className="text-emerald-400"/> Instruções táticas</div></div></div>
   </aside>
  </div>
  <div className="mx-auto max-w-7xl px-5 pb-5"><WorldDashboard /></div>
 </main>
}
function Team({name,short,color}:{name:string;short:string;color:string}){return <div className="flex flex-col items-center gap-3"><div className={"flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br "+color+" text-xl font-black"}>{short}</div><div className="font-semibold">{name}</div></div>}
function Stat({label,a,b}:{label:string;a:string;b:string}){return <div className="rounded-2xl bg-black/20 p-3 text-center"><div className="flex justify-between text-sm font-bold"><span>{a}</span><span>{b}</span></div><div className="mt-1 text-[10px] tracking-widest text-zinc-500">{label}</div></div>}
