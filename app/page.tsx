"use client";

import { useEffect, useMemo, useState } from "react";
import WorldDashboard from "./components/WorldDashboard";
import {
  Activity, ArrowDownRight, ArrowUpRight, Banknote, CalendarDays, ChevronRight,
  CircleDollarSign, Flag, Gauge, Goal, Handshake, Heart, Home, LayoutDashboard,
  MessageCircle, Pause, Play, RotateCcw, Search, Shield, ShoppingCart, Star,
  Target, Trophy, UserRound, Users, Wallet, Zap
} from "lucide-react";

type Tab = "dashboard" | "match" | "squad" | "market" | "world";
type Player = {
  id: number; name: string; pos: string; rating: number; age: number;
  morale: number; form: number; value: number; status: string;
};

type Event = { minute: number; type: "goal" | "shot" | "card" | "info"; text: string; team?: "home" | "away" };

const initialPlayers: Player[] = [
  { id: 1, name: "Rafael Silva", pos: "ATA", rating: 78, age: 24, morale: 86, form: 91, value: 18500000, status: "Titular" },
  { id: 2, name: "Caio Mendes", pos: "MEI", rating: 76, age: 22, morale: 82, form: 84, value: 14200000, status: "Titular" },
  { id: 3, name: "Lucas Rocha", pos: "VOL", rating: 74, age: 27, morale: 79, form: 76, value: 9800000, status: "Titular" },
  { id: 4, name: "Bruno Alves", pos: "ZAG", rating: 75, age: 29, morale: 74, form: 73, value: 7600000, status: "Titular" },
  { id: 5, name: "Matheus Lima", pos: "LE", rating: 72, age: 21, morale: 88, form: 80, value: 6100000, status: "Banco" },
  { id: 6, name: "João Victor", pos: "GOL", rating: 77, age: 26, morale: 90, form: 88, value: 11000000, status: "Titular" },
];

const initialEvents: Event[] = [
  { minute: 8, type: "shot", team: "home", text: "Rafael Silva finaliza colocado. Defesa do goleiro." },
  { minute: 17, type: "card", team: "away", text: "Volante adversário recebe amarelo." },
  { minute: 31, type: "goal", team: "home", text: "GOOOL! Rafael Silva aparece entre os zagueiros." },
  { minute: 44, type: "shot", team: "away", text: "Atlético Nacional responde no contra-ataque." },
  { minute: 63, type: "goal", team: "away", text: "Empate. Finalização rápida dentro da área." },
];

export default function Home() {
  const [tab, setTab] = useState<Tab>("dashboard");
  const [players, setPlayers] = useState(initialPlayers);
  const [selected, setSelected] = useState<Player | null>(null);
  const [budget, setBudget] = useState(28500000);
  const [matchMinute, setMatchMinute] = useState(63);
  const [running, setRunning] = useState(false);
  const [homeScore, setHomeScore] = useState(1);
  const [awayScore, setAwayScore] = useState(1);
  const [events, setEvents] = useState(initialEvents);
  const [possession, setPossession] = useState(54);
  const [xg, setXg] = useState({ home: 1.18, away: 0.82 });
  const [mentality, setMentality] = useState("Equilibrado");
  const [message, setMessage] = useState("Dia de jogo. O vestiário está pronto.");

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => simulateMinute(), 850);
    return () => window.clearInterval(timer);
  }, [running, matchMinute]);

  useEffect(() => {
    const saved = window.localStorage.getItem("futebolzinho-ui-v1");
    if (!saved) return;
    try {
      const data = JSON.parse(saved);
      if (data.budget) setBudget(data.budget);
      if (data.players) setPlayers(data.players);
    } catch {}
  }, []);

  useEffect(() => {
    window.localStorage.setItem("futebolzinho-ui-v1", JSON.stringify({ budget, players }));
  }, [budget, players]);

  function simulateMinute() {
    if (matchMinute >= 90) { setRunning(false); return; }
    const next = matchMinute + 1;
    setMatchMinute(next);
    setPossession(p => Math.max(35, Math.min(65, p + (Math.random() > .5 ? 1 : -1))));
    setXg(v => ({
      home: Number((v.home + (Math.random() > .82 ? .06 : .01)).toFixed(2)),
      away: Number((v.away + (Math.random() > .85 ? .05 : .01)).toFixed(2))
    }));
    if (Math.random() > .965) {
      const home = Math.random() > .5;
      if (home) setHomeScore(v => v + 1); else setAwayScore(v => v + 1);
      setEvents(v => [{ minute: next, type: "goal", team: home ? "home" : "away", text: home ? "GOOOL! Rafael Silva decide no último terço." : "Gol adversário em transição rápida." }, ...v]);
    } else if (Math.random() > .82) {
      setEvents(v => [{ minute: next, type: "shot", team: Math.random() > .5 ? "home" : "away", text: "Finalização após construção pelo meio." }, ...v]);
    }
  }

  function manualGoal(team: "home" | "away") {
    if (team === "home") setHomeScore(v => v + 1); else setAwayScore(v => v + 1);
    setEvents(v => [{ minute: matchMinute, type: "goal", team, text: team === "home" ? "GOOOL! Jogada trabalhada pelo lado direito." : "Gol visitante em contra-ataque." }, ...v]);
  }

  function talk(option: string) {
    if (!selected) return;
    const delta = option.includes("cobrar") ? -4 : 6;
    setPlayers(v => v.map(p => p.id === selected.id ? { ...p, morale: Math.max(1, Math.min(99, p.morale + delta)) } : p));
    setMessage(option.includes("cobrar") ? selected.name + " entendeu a cobrança. Moral -4, foco +8." : selected.name + " saiu da conversa mais confiante. Moral +6.");
    setSelected(null);
  }

  function signPlayer(name: string, price: number) {
    if (budget < price) { setMessage("Orçamento insuficiente para concluir a negociação."); return; }
    setBudget(v => v - price);
    setMessage(name + " foi contratado por " + money(price) + ". O jogador entra no elenco.");
  }

  const starters = useMemo(() => players.filter(p => p.status === "Titular"), [players]);

  return (
    <main className="min-h-screen bg-[#050908] text-white">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#07100d]/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-5 py-3">
          <button onClick={() => setTab("dashboard")} className="flex items-center gap-3 text-left">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500 text-lg font-black text-black">FZ</div>
            <div><div className="font-black tracking-tight">Futebolzinho FC</div><div className="text-[10px] uppercase tracking-[.22em] text-emerald-400">Manager • Temporada 2026</div></div>
          </button>
          <div className="hidden items-center gap-2 md:flex">
            <HeaderMetric icon={<Wallet size={14}/>} label="Caixa" value={money(budget)} />
            <HeaderMetric icon={<Trophy size={14}/>} label="Liga" value="#7" />
            <HeaderMetric icon={<Star size={14}/>} label="Moral" value="82" />
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1500px] gap-5 px-4 py-5">
        <nav className="hidden w-56 shrink-0 flex-col gap-1 lg:flex">
          <Nav icon={<LayoutDashboard/>} label="Visão geral" active={tab === "dashboard"} onClick={() => setTab("dashboard")} />
          <Nav icon={<Goal/>} label="Partida" active={tab === "match"} onClick={() => setTab("match")} />
          <Nav icon={<Users/>} label="Elenco" active={tab === "squad"} onClick={() => setTab("squad")} />
          <Nav icon={<ShoppingCart/>} label="Mercado" active={tab === "market"} onClick={() => setTab("market")} />
          <Nav icon={<GlobeIcon/>} label="Universo" active={tab === "world"} onClick={() => setTab("world")} />
          <div className="my-4 border-t border-white/10" />
          <div className="rounded-2xl border border-white/10 bg-white/[.03] p-4">
            <div className="mb-2 text-[10px] uppercase tracking-widest text-zinc-500">Próximo compromisso</div>
            <div className="font-bold">Atlético Nacional</div><div className="mt-1 text-xs text-zinc-500">Brasileirão • Rodada 12</div>
            <button onClick={() => setTab("match")} className="mt-4 flex w-full items-center justify-between rounded-xl bg-emerald-500 px-3 py-2 text-xs font-bold text-black">Ir para partida <ChevronRight size={15}/></button>
          </div>
        </nav>

        <div className="min-w-0 flex-1">
          <div className="mb-4 flex gap-2 overflow-x-auto lg:hidden">
            {["dashboard","match","squad","market","world"].map(v => <button key={v} onClick={() => setTab(v as Tab)} className={"whitespace-nowrap rounded-xl px-3 py-2 text-xs " + (tab === v ? "bg-emerald-500 font-bold text-black" : "bg-white/5 text-zinc-400")}>{tabName(v as Tab)}</button>)}
          </div>

          {tab === "dashboard" && <Dashboard message={message} budget={budget} players={players} onMatch={() => setTab("match")} onSquad={() => setTab("squad")} onMarket={() => setTab("market")} />}
          {tab === "match" && <MatchView minute={matchMinute} running={running} setRunning={setRunning} home={homeScore} away={awayScore} events={events} possession={possession} xg={xg} mentality={mentality} setMentality={setMentality} simulate={simulateMinute} goal={manualGoal} />}
          {tab === "squad" && <SquadView players={players} onSelect={setSelected} />}
          {tab === "market" && <MarketView budget={budget} sign={signPlayer} />}
          {tab === "world" && <WorldDashboard />}
        </div>
      </div>

      {selected && <TalkModal player={selected} close={() => setSelected(null)} talk={talk} />}
    </main>
  );
}

function Dashboard({message,budget,players,onMatch,onSquad,onMarket}:{message:string;budget:number;players:Player[];onMatch:()=>void;onSquad:()=>void;onMarket:()=>void}) {
  return <div className="space-y-5">
    <div className="rounded-[28px] border border-white/10 bg-gradient-to-br from-[#103b2b] via-[#0b2119] to-[#08110e] p-6 md:p-8">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div><div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-400"><span className="h-2 w-2 rounded-full bg-emerald-400"/> Dia de jogo</div><h1 className="max-w-2xl text-3xl font-black tracking-tight md:text-5xl">Você não assiste ao futebol.<br/>Você <span className="text-emerald-400">manda nele.</span></h1><p className="mt-4 max-w-xl text-sm leading-6 text-zinc-400">Gerencie escalação, vestiário, tática, mercado e caixa. Cada decisão muda a temporada.</p></div>
        <button onClick={onMatch} className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-400 px-6 py-4 font-black text-black shadow-lg shadow-emerald-950/40">Jogar partida <Play size={18} fill="currentColor"/></button>
      </div>
    </div>
    <div className="grid gap-4 md:grid-cols-3">
      <ActionCard icon={<Users/>} title="Elenco" value={players.length + " atletas"} desc="2 jogadores pedem mais minutos" action="Gerenciar" onClick={onSquad}/>
      <ActionCard icon={<CircleDollarSign/>} title="Mercado" value={money(budget)} desc="Caixa disponível para reforços" action="Buscar jogador" onClick={onMarket}/>
      <ActionCard icon={<CalendarDays/>} title="Calendário" value="Rodada 12" desc="Atlético Nacional • hoje, 19:00" action="Preparar" onClick={onMatch}/>
    </div>
    <div className="grid gap-5 xl:grid-cols-[1.3fr_.7fr]">
      <Panel title="Vestiário" icon={<Heart size={17}/>}>
        <div className="rounded-2xl bg-white/[.03] p-4"><div className="text-sm font-semibold">Última conversa</div><p className="mt-1 text-xs leading-5 text-zinc-500">{message}</p></div>
        <div className="mt-4 grid grid-cols-3 gap-3"><Mini label="Moral" value="82" trend="+4"/><Mini label="Forma" value="78" trend="+2"/><Mini label="Físico" value="91" trend="+1"/></div>
      </Panel>
      <Panel title="Tabela" icon={<Trophy size={17}/>}>
        {["1. Flamengo","2. Palmeiras","3. Bahia","4. Grêmio","5. Corinthians","7. Futebolzinho FC"].map((x,i)=><div key={x} className="flex items-center justify-between border-b border-white/5 py-2.5 text-xs last:border-0"><span className={i===5?"font-bold text-emerald-400":"text-zinc-300"}>{x}</span><span className="text-zinc-600">{i===5?15:24-i*2} pts</span></div>)}
      </Panel>
    </div>
  </div>;
}

function MatchView({minute,running,setRunning,home,away,events,possession,xg,mentality,setMentality,simulate,goal}:{minute:number;running:boolean;setRunning:(v:boolean)=>void;home:number;away:number;events:Event[];possession:number;xg:{home:number;away:number};mentality:string;setMentality:(v:string)=>void;simulate:()=>void;goal:(t:"home"|"away")=>void}) {
  return <div className="space-y-5">
    <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
      <div className="space-y-5">
        <Panel>
          <div className="flex items-center justify-between border-b border-white/10 pb-4"><div><div className="text-[10px] uppercase tracking-widest text-zinc-500">Brasileirão • Rodada 12</div><div className="mt-1 flex items-center gap-2 text-sm font-bold"><span className="h-2 w-2 rounded-full bg-red-400"/>{minute >= 90 ? "Fim de jogo" : running ? "AO VIVO" : "Partida pausada"}</div></div><div className="font-mono text-2xl font-black text-emerald-400">{String(minute).padStart(2,"0")}:00</div></div>
          <div className="grid grid-cols-3 items-center py-10 text-center"><Team name="Futebolzinho FC" short="FZ"/><div><div className="text-6xl font-black tracking-tighter">{home}<span className="mx-3 text-zinc-600">×</span>{away}</div><div className="mt-2 text-[10px] uppercase tracking-widest text-zinc-600">Placar ao vivo</div></div><Team name="Atlético Nacional" short="AN"/></div>
          <div className="grid grid-cols-3 gap-3"><Stat label="POSSE" a={possession+"%"} b={(100-possession)+"%"}/><Stat label="xG" a={xg.home.toFixed(2)} b={xg.away.toFixed(2)}/><Stat label="FINALIZAÇÕES" a="8" b="6"/></div>
        </Panel>
        <Panel title="Tática em campo" icon={<Target size={17}/>}>
          <div className="mb-4 flex flex-wrap gap-2">{["Equilibrado","Pressão alta","Bloco baixo","Contra-ataque"].map(x=><button key={x} onClick={()=>setMentality(x)} className={"rounded-xl px-3 py-2 text-xs " + (mentality===x?"bg-emerald-500 font-bold text-black":"bg-white/5 text-zinc-400")}>{x}</button>)}</div>
          <div className="relative mx-auto aspect-[1.65] max-w-3xl overflow-hidden rounded-2xl border border-white/20 bg-gradient-to-b from-emerald-700/80 to-emerald-950/80">
            <div className="absolute inset-5 rounded-xl border border-white/20"/><div className="absolute left-1/2 top-0 h-full w-px bg-white/20"/><div className="absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/20"/>
            {[[50,85],[23,70],[41,67],[59,67],[77,70],[30,48],[50,53],[70,48],[28,26],[50,21],[72,26]].map((p,i)=><div key={i} className="absolute -translate-x-1/2 -translate-y-1/2" style={{left:p[0]+"%",top:p[1]+"%"}}><div className="grid h-8 w-8 place-items-center rounded-full border-2 border-white/70 bg-emerald-500 text-[9px] font-black text-black">{i+1}</div></div>)}
          </div>
        </Panel>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4"><Control label="+1 minuto" icon={<Play/>} onClick={simulate}/><Control label="Gol FZ" icon={<Goal/>} onClick={()=>goal("home")}/><Control label="Gol AN" icon={<Goal/>} onClick={()=>goal("away")}/><Control label={running?"Pausar":"Iniciar"} icon={running?<Pause/>:<Play/>} onClick={()=>setRunning(!running)}/></div>
      </div>
      <div className="space-y-5">
        <Panel title="Narrativa da partida" icon={<Activity size={17}/>}>
          <div className="space-y-3">{events.slice(0,9).map((e,i)=><div key={i} className="flex gap-3 border-b border-white/5 pb-3 last:border-0"><span className="w-8 font-mono text-xs text-zinc-600">{e.minute}'</span><div className="flex gap-2 text-sm"><span className={e.type==="goal"?"text-emerald-400":e.type==="card"?"text-yellow-400":"text-sky-400"}>{e.type==="goal"?<Goal size={15}/>:<Activity size={15}/>}</span>{e.text}</div></div>)}</div>
        </Panel>
        <Panel title="Banco de decisões" icon={<Gauge size={17}/>}>
          <Decision label="Pressão" value={mentality === "Pressão alta" ? "Alta" : "Média"} up={mentality === "Pressão alta"}/>
          <Decision label="Risco defensivo" value={mentality === "Bloco baixo" ? "Baixo" : "Médio"} up={mentality !== "Pressão alta"}/>
          <Decision label="Fadiga estimada" value="68%" up={false}/>
        </Panel>
      </div>
    </div>
  </div>;
}

function SquadView({players,onSelect}:{players:Player[];onSelect:(p:Player)=>void}) {
  return <div className="space-y-5"><div className="flex items-end justify-between"><div><div className="text-xs uppercase tracking-widest text-emerald-400">Elenco principal</div><h1 className="mt-1 text-3xl font-black">Seu vestiário</h1></div><div className="text-right text-xs text-zinc-500">{players.filter(p=>p.status==="Titular").length} titulares • 82 moral média</div></div>
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{players.map(p=><button key={p.id} onClick={()=>onSelect(p)} className="group rounded-2xl border border-white/10 bg-white/[.03] p-4 text-left transition hover:-translate-y-0.5 hover:border-emerald-500/40 hover:bg-emerald-950/20"><div className="flex items-start justify-between"><div className="flex gap-3"><div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-emerald-500/30 to-sky-500/20 font-black">{p.pos}</div><div><div className="font-bold">{p.name}</div><div className="mt-1 text-xs text-zinc-500">{p.age} anos • {p.status}</div></div></div><div className="text-right"><div className="text-xl font-black">{p.rating}</div><div className="text-[9px] text-zinc-600">OVR</div></div></div><div className="mt-4 grid grid-cols-3 gap-2"><Mini label="Moral" value={String(p.morale)} trend={p.morale>=80?"Boa":"Atenção"}/><Mini label="Forma" value={String(p.form)} trend=""/><Mini label="Valor" value={moneyShort(p.value)} trend=""/></div><div className="mt-3 flex items-center justify-between text-xs text-zinc-500"><span>Conversar com jogador</span><MessageCircle size={14} className="text-emerald-400"/></div></button>)}</div>
  </div>;
}

function MarketView({budget,sign}:{budget:number;sign:(name:string,price:number)=>void}) {
  const targets=[{name:"Enzo Martins",pos:"ATA",age:19,rating:72,value:6200000,why:"Potencial 86"},{name:"Diego Nunes",pos:"VOL",age:25,rating:77,value:11800000,why:"Passe + marcação"},{name:"Pedro Costa",pos:"ZAG",age:21,rating:73,value:7400000,why:"Potencial 89"},{name:"André Ribeiro",pos:"PD",age:23,rating:75,value:9700000,why:"Velocidade"}];
  return <div className="space-y-5"><div className="rounded-3xl border border-white/10 bg-gradient-to-r from-[#102b20] to-[#0b1411] p-6"><div className="text-xs uppercase tracking-widest text-emerald-400">Janela de transferências</div><div className="mt-2 flex flex-wrap items-end justify-between gap-4"><div><h1 className="text-3xl font-black">Mercado</h1><p className="mt-1 text-sm text-zinc-500">Encontre jogadores que cabem no projeto, não só no orçamento.</p></div><div className="text-right"><div className="text-xs text-zinc-500">Orçamento</div><div className="text-2xl font-black text-emerald-400">{money(budget)}</div></div></div></div>
    <div className="flex gap-2 rounded-2xl border border-white/10 bg-white/[.02] p-2"><div className="flex flex-1 items-center gap-2 px-2 text-zinc-600"><Search size={16}/> Buscar por nome, posição ou estilo</div><button className="rounded-xl bg-white/10 px-4 py-2 text-xs">Filtros</button></div>
    <div className="grid gap-3 md:grid-cols-2">{targets.map(t=><div key={t.name} className="rounded-2xl border border-white/10 bg-white/[.03] p-4"><div className="flex justify-between"><div><div className="font-bold">{t.name}</div><div className="mt-1 text-xs text-zinc-500">{t.pos} • {t.age} anos • OVR {t.rating}</div></div><div className="text-right"><div className="font-bold">{moneyShort(t.value)}</div><div className="text-[10px] text-emerald-400">{t.why}</div></div></div><div className="mt-4 flex gap-2"><button onClick={()=>sign(t.name,t.value)} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-500 py-2.5 text-xs font-black text-black"><Handshake size={14}/> Fazer proposta</button><button className="rounded-xl border border-white/10 px-4 text-xs text-zinc-400">Observar</button></div></div>)}</div>
  </div>;
}

function TalkModal({player,close,talk}:{player:Player;close:()=>void;talk:(x:string)=>void}) {
  return <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm"><div className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#0b1511] p-6 shadow-2xl"><div className="flex items-start justify-between"><div><div className="text-xs uppercase tracking-widest text-emerald-400">Conversa privada</div><h2 className="mt-1 text-2xl font-black">{player.name}</h2><p className="mt-1 text-xs text-zinc-500">{player.pos} • moral {player.morale} • forma {player.form}</p></div><button onClick={close} className="text-zinc-500">✕</button></div><div className="mt-6 space-y-2"><TalkOption text="Elogiar a boa fase" sub="Moral +6 • confiança" onClick={()=>talk("elogiar")}/><TalkOption text="Cobrar empenho após nota baixa" sub="Moral -4 • foco +8" onClick={()=>talk("cobrar")}/><TalkOption text="Tranquilizar por estar no banco" sub="Moral +6 • lealdade +3" onClick={()=>talk("tranquilizar")}/></div></div></div>;
}

function TalkOption({text,sub,onClick}:{text:string;sub:string;onClick:()=>void}){return <button onClick={onClick} className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/[.03] p-4 text-left hover:border-emerald-500/40 hover:bg-emerald-950/20"><span><span className="block text-sm font-bold">{text}</span><span className="mt-1 block text-xs text-zinc-500">{sub}</span></span><ChevronRight size={17} className="text-zinc-600"/></button>}

function Panel({title,icon,children}:{title?:string;icon?:React.ReactNode;children:React.ReactNode}){return <section className="rounded-3xl border border-white/10 bg-[#0a1310] p-5 shadow-xl shadow-black/10">{title&&<div className="mb-4 flex items-center gap-2 text-sm font-bold">{icon&&<span className="text-emerald-400">{icon}</span>}{title}</div>}{children}</section>}
function Nav({icon,label,active,onClick}:{icon:React.ReactNode;label:string;active:boolean;onClick:()=>void}){return <button onClick={onClick} className={"flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm " + (active?"bg-emerald-500 font-bold text-black":"text-zinc-400 hover:bg-white/5 hover:text-white")}>{icon}{label}</button>}
function HeaderMetric({icon,label,value}:{icon:React.ReactNode;label:string;value:string}){return <div className="rounded-xl border border-white/10 bg-white/[.03] px-3 py-2"><div className="flex items-center gap-1 text-[9px] uppercase tracking-widest text-zinc-600">{icon}{label}</div><div className="mt-0.5 text-xs font-bold">{value}</div></div>}
function ActionCard({icon,title,value,desc,action,onClick}:{icon:React.ReactNode;title:string;value:string;desc:string;action:string;onClick:()=>void}){return <button onClick={onClick} className="rounded-2xl border border-white/10 bg-[#0a1310] p-5 text-left hover:border-emerald-500/30"><div className="mb-4 grid h-9 w-9 place-items-center rounded-xl bg-emerald-950 text-emerald-400">{icon}</div><div className="text-xs text-zinc-500">{title}</div><div className="mt-1 text-xl font-black">{value}</div><div className="mt-1 text-xs text-zinc-600">{desc}</div><div className="mt-4 text-xs font-bold text-emerald-400">{action} →</div></button>}
function Mini({label,value,trend}:{label:string;value:string;trend:string}){return <div className="rounded-xl bg-black/20 p-2.5"><div className="text-[9px] uppercase tracking-widest text-zinc-600">{label}</div><div className="mt-1 flex items-end justify-between"><span className="text-sm font-bold">{value}</span>{trend&&<span className="text-[9px] text-emerald-400">{trend}</span>}</div></div>}
function Stat({label,a,b}:{label:string;a:string;b:string}){return <div className="rounded-2xl border border-white/5 bg-white/[.03] p-3 text-center"><div className="flex justify-between text-sm font-bold"><span>{a}</span><span>{b}</span></div><div className="mt-1 text-[9px] uppercase tracking-widest text-zinc-600">{label}</div></div>}
function Control({label,icon,onClick}:{label:string;icon:React.ReactNode;onClick:()=>void}){return <button onClick={onClick} className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-[#0a1310] p-3 text-xs font-bold hover:border-emerald-500/30">{icon}{label}</button>}
function Decision({label,value,up}:{label:string;value:string;up:boolean}){return <div className="flex items-center justify-between border-b border-white/5 py-3 last:border-0"><span className="text-xs text-zinc-500">{label}</span><span className="flex items-center gap-1 text-xs font-bold">{up?<ArrowUpRight size={13} className="text-emerald-400"/>:<ArrowDownRight size={13} className="text-yellow-400"/>}{value}</span></div>}
function Team({name,short}:{name:string;short:string}){return <div className="flex flex-col items-center gap-3"><div className="grid h-20 w-20 place-items-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-800 text-xl font-black text-black shadow-lg">{short}</div><div className="text-sm font-bold">{name}</div></div>}
function GlobeIcon(){return <span className="text-lg">◉</span>}
function tabName(t:Tab){return ({dashboard:"Visão geral",match:"Partida",squad:"Elenco",market:"Mercado",world:"Universo"}[t])}
function money(n:number){return new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL",maximumFractionDigits:0}).format(n)}
function moneyShort(n:number){return n>=1000000?"R$ "+(n/1000000).toFixed(1)+"M":"R$ "+Math.round(n/1000)+"k"}
