import React from 'react';
import { CharacterSheet } from '../types/rpg';
import { getEffectiveAttributes, getAttributeModifier } from '../utils/dndMath';
import {
  BarChart3,
  Award,
  Zap,
  Flame,
  FlaskConical,
  Dumbbell,
  Sparkles,
  Dices,
  CheckCircle2,
  Lock,
} from 'lucide-react';

interface PlayerStatsViewProps {
  character: CharacterSheet;
  onUpdateCharacter: (updater: (prev: CharacterSheet) => CharacterSheet) => void;
}

export const PlayerStatsView: React.FC<PlayerStatsViewProps> = ({
  character,
  onUpdateCharacter,
}) => {
  const { effective, bonusMap } = getEffectiveAttributes(character.atributos, character.buffs);

  const statsCards = [
    { label: 'Poções Alquímicas Criadas', value: character.estatisticas?.pocoesCriadas || 0, icon: FlaskConical, color: 'text-emerald-400 bg-emerald-950/40 border-emerald-500/30' },
    { label: 'Sessões de Treino Físico', value: character.estatisticas?.treinosCompletados || 0, icon: Dumbbell, color: 'text-red-400 bg-red-950/40 border-red-500/30' },
    { label: 'Segundos em Meditação', value: `${character.estatisticas?.segundosMeditados || 0}s`, icon: Sparkles, color: 'text-indigo-400 bg-indigo-950/40 border-indigo-500/30' },
    { label: 'Rolagens de Dados D20', value: character.estatisticas?.rolagensD20Total || 0, icon: Dices, color: 'text-cyan-400 bg-cyan-950/40 border-cyan-500/30' },
    { label: 'Sucessos Críticos (Nat 20)', value: character.estatisticas?.criticos20 || 0, icon: Flame, color: 'text-amber-400 bg-amber-950/40 border-amber-500/30' },
    { label: 'Capítulos Concluídos', value: character.estatisticas?.capitulosConcluidos || 0, icon: Award, color: 'text-purple-400 bg-purple-950/40 border-purple-500/30' },
  ];

  const attrRadar = [
    { key: 'forca' as const, label: 'FORÇA', base: character.atributos.forca, eff: effective.forca, color: 'bg-red-500' },
    { key: 'destreza' as const, label: 'DESTREZA', base: character.atributos.destreza, eff: effective.destreza, color: 'bg-emerald-500' },
    { key: 'constituicao' as const, label: 'CONSTITUIÇÃO', base: character.atributos.constituicao, eff: effective.constituicao, color: 'bg-amber-500' },
    { key: 'inteligencia' as const, label: 'INTELIGÊNCIA', base: character.atributos.inteligencia, eff: effective.inteligencia, color: 'bg-blue-500' },
    { key: 'sabedoria' as const, label: 'SABEDORIA', base: character.atributos.sabedoria, eff: effective.sabedoria, color: 'bg-indigo-500' },
    { key: 'carisma' as const, label: 'CARISMA', base: character.atributos.carisma, eff: effective.carisma, color: 'bg-purple-500' },
  ];

  const handleClaimAchievementReward = (achId: string) => {
    onUpdateCharacter(prev => {
      const ach = prev.conquistas.find(a => a.id === achId);
      if (!ach || !ach.desbloqueada) return prev;

      return {
        ...prev,
        experiencia: prev.experiencia + ach.recompensaXp,
        conquistas: prev.conquistas.map(a =>
          a.id === achId ? { ...a, recompensaResgatada: true } as any : a
        ),
      };
    });
    alert('Recompensa de conquista resgatada com sucesso!');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Banner de Estatísticas */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 p-6 border border-blue-500/30 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold mb-2 border border-blue-500/30">
              <BarChart3 className="w-3.5 h-3.5" />
              Painel de Desempenho & Conquistas Desbloqueáveis
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Estatísticas & Evolução do Personagem
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Acompanhe sua trajetória heróica: comparativo de atributos bufados, marcos conquistados e histórico de rolagens críticas.
            </p>
          </div>
        </div>
      </div>

      {/* Grid de Métricas Principais */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {statsCards.map(stat => (
          <div key={stat.label} className={`p-4 rounded-2xl border ${stat.color} shadow-lg text-center flex flex-col justify-between`}>
            <stat.icon className="w-6 h-6 mx-auto mb-1 opacity-90" />
            <div className="text-2xl font-black font-mono text-white mt-1">{stat.value}</div>
            <span className="text-[10px] text-slate-300 uppercase font-bold mt-1 line-clamp-1">{stat.label}</span>
          </div>
        ))}
      </div>

      {/* Comparativo de Atributos: Base vs Bufado */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-base text-slate-100">Equilíbrio de Atributos (Base vs Bufado)</h3>
          </div>
          <span className="text-xs text-slate-400">Escala de 1 a 24</span>
        </div>

        <div className="mt-6 space-y-4">
          {attrRadar.map(item => {
            const hasBonus = item.eff > item.base;
            const percentageBase = (item.base / 24) * 100;
            const percentageEff = (item.eff / 24) * 100;

            return (
              <div key={item.key} className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="font-bold text-slate-200">{item.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">Base: {item.base}</span>
                    {hasBonus && (
                      <span className="font-bold text-emerald-400">
                        Efetivo: {item.eff} (+{item.eff - item.base})
                      </span>
                    )}
                  </div>
                </div>

                <div className="w-full bg-slate-950 rounded-full h-3 p-0.5 border border-slate-800 relative overflow-hidden">
                  <div
                    className={`${item.color} h-full rounded-full transition-all duration-500 opacity-90`}
                    style={{ width: `${percentageEff}%` }}
                  />
                  {hasBonus && (
                    <div
                      className="absolute top-0 bottom-0 bg-white/20 animate-pulse"
                      style={{ left: `${percentageBase}%`, width: `${percentageEff - percentageBase}%` }}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Galeria de Conquistas Desbloqueáveis */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-base text-slate-100">Conquistas Desbloqueáveis ({character.conquistas?.filter(c => c.desbloqueada).length || 0}/{character.conquistas?.length || 0})</h3>
          </div>
          <span className="text-xs text-slate-400">Resgate recompensas em XP</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {character.conquistas?.map(ach => (
            <div
              key={ach.id}
              className={`p-4 rounded-xl border transition flex items-start gap-3.5 ${
                ach.desbloqueada
                  ? 'bg-amber-950/20 border-amber-500/50 shadow-md'
                  : 'bg-slate-950/60 border-slate-800/80 opacity-60'
              }`}
            >
              <div className="text-3xl p-2 rounded-xl bg-slate-900 border border-slate-800 shrink-0">
                {ach.icone}
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-slate-100">{ach.titulo}</h4>
                  {ach.desbloqueada ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <Lock className="w-4 h-4 text-slate-500 shrink-0" />
                  )}
                </div>
                <p className="text-xs text-slate-400 leading-normal">{ach.descricao}</p>

                <div className="pt-2 flex items-center justify-between text-xs">
                  <span className="font-mono text-emerald-400 font-bold">+{ach.recompensaXp} XP</span>
                  <span className="font-mono text-slate-400 text-[11px]">
                    {ach.progressoAtual}/{ach.progressoAlvo}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
