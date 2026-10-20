import React, { useState, useEffect } from 'react';
import { CharacterSheet, RankingEntry } from '../types/rpg';
import { subscribeToRankings } from '../firebase/characterService';
import {
  Trophy,
  Medal,
  Crown,
  Sparkles,
  FlaskConical,
  Dumbbell,
  Compass,
  Star,
  Users,
} from 'lucide-react';

interface RankingsViewProps {
  character: CharacterSheet;
}

export const RankingsView: React.FC<RankingsViewProps> = ({ character }) => {
  const [rankings, setRankings] = useState<RankingEntry[]>([]);
  const [filterType, setFilterType] = useState<'geral' | 'alquimia' | 'treino' | 'meditacao'>('geral');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeToRankings(items => {
      setRankings(items);
      setIsLoading(false);
    });
    return () => unsub();
  }, []);

  // Filter/Sort based on tab
  const sortedRankings = [...rankings].sort((a, b) => {
    if (filterType === 'alquimia') return (b.alquimiaCrafts || 0) - (a.alquimiaCrafts || 0);
    if (filterType === 'treino') return (b.treinoPontos || 0) - (a.treinoPontos || 0);
    if (filterType === 'meditacao') return (b.meditacaoMinutos || 0) - (a.meditacaoMinutos || 0);
    return (b.scoreTotal || 0) - (a.scoreTotal || 0);
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Banner de Rankings */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-yellow-950 via-slate-900 to-amber-950 p-6 border border-yellow-500/30 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-300 text-xs font-semibold mb-2 border border-yellow-500/30">
              <Trophy className="w-3.5 h-3.5" />
              Hall dos Campeões • Ranking Global em Tempo Real
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Classificação dos Heróis & Mestres
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Dispute o topo em diferentes caminhos de evolução: Maestria Alquímica, Poderio Físico no Dojo ou Sabedoria Astral no Santuário de Meditação.
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5 bg-slate-950/80 p-1.5 rounded-xl border border-slate-800 self-start md:self-auto">
            {[
              { id: 'geral' as const, label: 'Score Geral', icon: Trophy },
              { id: 'alquimia' as const, label: 'Alquimia', icon: FlaskConical },
              { id: 'treino' as const, label: 'Força Física', icon: Dumbbell },
              { id: 'meditacao' as const, label: 'Meditação', icon: Sparkles },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id)}
                className={`text-xs px-3 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  filterType === tab.id
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tabela do Ranking */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs text-slate-400 font-semibold uppercase tracking-wider">
          <div className="flex items-center gap-3">
            <span className="w-8 text-center">Pos.</span>
            <span>Aventureiro & Classe</span>
          </div>
          <div className="flex items-center gap-6">
            <span className="hidden sm:inline">Especialidade</span>
            <span className="w-24 text-right">Pontuação</span>
          </div>
        </div>

        <div className="space-y-2">
          {sortedRankings.map((entry, index) => {
            const isSelf = entry.characterId === character.id;
            const rank = index + 1;

            return (
              <div
                key={entry.characterId || index}
                className={`p-3.5 rounded-xl border transition flex items-center justify-between gap-4 ${
                  isSelf
                    ? 'bg-amber-500/10 border-amber-500/50 shadow-md'
                    : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                {/* Posição e Identificação */}
                <div className="flex items-center gap-3.5">
                  <div className="w-8 flex items-center justify-center font-black font-mono text-base">
                    {rank === 1 ? (
                      <Crown className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                    ) : rank === 2 ? (
                      <Medal className="w-5 h-5 text-slate-300 fill-slate-300" />
                    ) : rank === 3 ? (
                      <Medal className="w-5 h-5 text-amber-600 fill-amber-600" />
                    ) : (
                      <span className="text-slate-500">#{rank}</span>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
                        {entry.characterName}
                        {isSelf && (
                          <span className="text-[10px] px-2 py-0.2 rounded-full bg-amber-500 text-slate-950 font-bold">
                            Você
                          </span>
                        )}
                      </h4>
                    </div>
                    <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                      <span className="font-medium text-amber-300">Nv. {entry.nivel} {entry.classe}</span>
                      <span>•</span>
                      <span>{entry.raca}</span>
                      <span>•</span>
                      <span className="text-[11px] text-slate-400">{entry.titulo || 'Aventureiro'}</span>
                    </div>
                  </div>
                </div>

                {/* Estatísticas de Foco e Score Total */}
                <div className="flex items-center gap-6">
                  <div className="hidden sm:flex items-center gap-4 text-xs font-mono text-slate-300">
                    <span title="Poções Alquímicas Criadas" className="flex items-center gap-1">
                      <FlaskConical className="w-3.5 h-3.5 text-emerald-400" /> {entry.alquimiaCrafts || 0}
                    </span>
                    <span title="Sessões de Treino Físico" className="flex items-center gap-1">
                      <Dumbbell className="w-3.5 h-3.5 text-red-400" /> {entry.treinoPontos || 0}
                    </span>
                    <span title="Minutos em Meditação" className="flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> {entry.meditacaoMinutos || 0}m
                    </span>
                  </div>

                  <div className="text-right w-24">
                    <span className="block font-mono font-black text-base text-amber-400">
                      {filterType === 'alquimia'
                        ? `${entry.alquimiaCrafts || 0} craft`
                        : filterType === 'treino'
                        ? `${entry.treinoPontos || 0} drills`
                        : filterType === 'meditacao'
                        ? `${entry.meditacaoMinutos || 0} min`
                        : `${entry.scoreTotal || 0} pts`}
                    </span>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">
                      {entry.experiencia} XP
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          {sortedRankings.length === 0 && !isLoading && (
            <div className="py-12 text-center text-slate-500">
              <Users className="w-10 h-10 mx-auto mb-2 opacity-40" />
              Nenhum personagem registrado no ranking ainda.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
