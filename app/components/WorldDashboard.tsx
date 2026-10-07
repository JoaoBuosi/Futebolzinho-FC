"use client";

import { useMemo, useState } from "react";
import { ArrowRight, Globe2, RefreshCw } from "lucide-react";
import { LivingWorldEngine, createInitialWorld } from "../../src/game/world";
import type { LivingWorldData } from "../../src/game/world";

const emptyData: LivingWorldData = {
  clubs: {},
  players: {},
  competitions: {},
  transfers: [],
  retirements: [],
  youth: []
};

export default function WorldDashboard() {
  const initial = useMemo(() => createInitialWorld(), []);
  const [engine] = useState(() => new LivingWorldEngine(initial.world, initial.season, emptyData));
  const [report, setReport] = useState<ReturnType<LivingWorldEngine["advanceSeason"]> | null>(null);
  const [season, setSeason] = useState(initial.world.currentSeason);

  function advance() {
    const result = engine.advanceSeason();
    setSeason(result.nextSeason);
    setReport(result);
  }

  return (
    <section className="rounded-3xl border border-emerald-950 bg-[#0c1814] p-5">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-emerald-950 p-2"><Globe2 size={18} className="text-emerald-400" /></div>
          <div><h2 className="font-bold">Universo Vivo</h2><p className="text-xs text-zinc-500">Motor de temporadas v0.10.4</p></div>
        </div>
        <button onClick={advance} className="flex items-center gap-2 rounded-xl border border-emerald-800 px-3 py-2 text-xs font-semibold text-emerald-200 hover:bg-emerald-950">
          <RefreshCw size={14} /> Avançar temporada
        </button>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Metric label="TEMPORADA" value={String(season)} />
        <Metric label="JOGADORES" value={String(Object.keys(engine.getSnapshot().data.players).length)} />
        <Metric label="CLUBES" value={String(Object.keys(engine.getSnapshot().data.clubs).length)} />
        <Metric label="COMPETIÇÕES" value={String(Object.keys(engine.getSnapshot().data.competitions).length)} />
      </div>
      {report && (
        <div className="mt-4 rounded-2xl border border-emerald-950 bg-black/20 p-4 text-xs text-zinc-300">
          <div className="mb-2 flex items-center gap-2 font-semibold text-emerald-300"><ArrowRight size={14} /> Temporada {report.nextSeason} criada</div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            <span>Jovens: {report.youth}</span><span>Aposentados: {report.retired}</span><span>Transferências: {report.transfers}</span><span>Promovidos: {report.promoted}</span><span>Rebaixados: {report.relegated}</span>
          </div>
        </div>
      )}
      <p className="mt-3 text-[11px] leading-5 text-zinc-500">A camada de realidade (clubes/jogadores reais) será carregada pelo importer server-side e persistida no universo da carreira. Jogadores gerados pelo motor são sempre identificados como gerados.</p>
    </section>
  );
}

function Metric({label, value}:{label:string;value:string}) {
  return <div className="rounded-2xl bg-black/20 p-3"><div className="text-[10px] tracking-widest text-zinc-500">{label}</div><div className="mt-1 text-lg font-black">{value}</div></div>;
}
