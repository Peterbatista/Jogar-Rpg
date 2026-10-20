import React, { useState, useEffect } from 'react';
import { CharacterSheet, PhysicalTrainingActivity, MeditationActivity, TemporaryBuff } from '../types/rpg';
import { PHYSICAL_TRAINING_DRILLS, MEDITATION_PRACTICES } from '../data/trainingData';
import { CLASS_LEVEL_UP_TRIALS } from '../data/classTrials';
import { playSingingBowlSound, playCriticalSuccessSound, playDiceRollSound } from '../utils/audio';
import { DiceRollerModal } from './DiceRollerModal';
import { getAttributeModifier } from '../utils/dndMath';
import { useDiceRoll } from '../context/DiceRollContext';
import {
  Dumbbell,
  Sparkles,
  Flame,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Clock,
  Shield,
  Zap,
  Volume2,
  Heart,
  Award,
  ChevronRight,
  Target,
} from 'lucide-react';

interface TrainingAndMeditationProps {
  character: CharacterSheet;
  onUpdateCharacter: (updater: (prev: CharacterSheet) => CharacterSheet) => void;
}

export const TrainingAndMeditation: React.FC<TrainingAndMeditationProps> = ({
  character,
  onUpdateCharacter,
}) => {
  const { recordRoll } = useDiceRoll();
  const [activeTab, setActiveTab] = useState<'treino' | 'meditacao'>('treino');

  // Timer & Session State
  const [runningType, setRunningType] = useState<'treino' | 'meditacao' | null>(null);
  const [activeActivityId, setActiveActivityId] = useState<string | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(0);
  const [initialDuration, setInitialDuration] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Animation state (reps for training, breath cycle for meditation)
  const [workoutReps, setWorkoutReps] = useState<number>(0);
  const [breathPhase, setBreathPhase] = useState<'inspire' | 'segure' | 'expire'>('inspire');

  // D20 Modal
  const [d20ModalOpen, setD20ModalOpen] = useState(false);
  const [pendingActivity, setPendingActivity] = useState<PhysicalTrainingActivity | MeditationActivity | null>(null);

  // Tick timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (runningType && !isPaused && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining(prev => {
          if (prev <= 1) {
            handleCompleteSession();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [runningType, isPaused, secondsRemaining]);

  // Animation cycle for Workout & Meditation
  useEffect(() => {
    let animInterval: NodeJS.Timeout;
    if (runningType && !isPaused) {
      animInterval = setInterval(() => {
        if (runningType === 'treino') {
          setWorkoutReps(prev => prev + 1);
        } else {
          // 6-second breathing cycle: 2s inspire, 2s segure, 2s expire
          setBreathPhase(prev => {
            if (prev === 'inspire') return 'segure';
            if (prev === 'segure') return 'expire';
            return 'inspire';
          });
        }
      }, 2000);
    }
    return () => clearInterval(animInterval);
  }, [runningType, isPaused]);

  const handleStartActivity = (activity: PhysicalTrainingActivity | MeditationActivity) => {
    setPendingActivity(activity);
    setD20ModalOpen(true);
  };

  const handleD20TestComplete = (naturalRoll: number, total: number, isCrit: boolean, isFail: boolean) => {
    if (!pendingActivity) return;
    const activity = pendingActivity;
    const isPhysical = 'atributoFoco' in activity && ['forca', 'constituicao', 'destreza'].includes(activity.atributoFoco);

    setRunningType(isPhysical ? 'treino' : 'meditacao');
    setActiveActivityId(activity.id);
    setInitialDuration(activity.duracaoSegundos);
    setSecondsRemaining(activity.duracaoSegundos);
    setIsPaused(false);
    setWorkoutReps(0);

    if (!isPhysical) {
      playSingingBowlSound();
    }
  };

  const handleCompleteSession = () => {
    if (!runningType || !activeActivityId) return;

    if (runningType === 'treino') {
      const drill = PHYSICAL_TRAINING_DRILLS.find(d => d.id === activeActivityId);
      if (!drill) return;

      const newBuff: TemporaryBuff = {
        id: 'buff_treino_' + Date.now(),
        nome: `Bônus Marcial: ${drill.nome}`,
        atributo: drill.atributoFoco,
        valor: drill.buffValor,
        duracaoMinutos: drill.buffDuracaoMinutos,
        criadoEm: Date.now(),
        origem: 'treino',
        descricao: `+${drill.buffValor} em ${drill.atributoFoco.toUpperCase()} conquistado no Dojo Físico.`,
      };

      onUpdateCharacter(prev => {
        const nextXp = prev.experiencia + drill.expRecompensa;
        const totalCompleted = (prev.estatisticas?.treinosCompletados || 0) + 1;
        const updatedAch = prev.conquistas.map(a => {
          if (a.id === 'ach_punhos_ferro') {
            return { ...a, progressoAtual: totalCompleted, desbloqueada: totalCompleted >= a.progressoAlvo };
          }
          return a;
        });

        return {
          ...prev,
          experiencia: nextXp,
          buffs: [...prev.buffs, newBuff],
          estatisticas: {
            ...prev.estatisticas,
            treinosCompletados: totalCompleted,
          },
          conquistas: updatedAch,
        };
      });

      playCriticalSuccessSound();
      alert(`Treino Físico Concluído! +${drill.expRecompensa} XP e +${drill.buffValor} em ${drill.atributoFoco.toUpperCase()} ativado por ${drill.buffDuracaoMinutos} min.`);
    } else {
      const practice = MEDITATION_PRACTICES.find(m => m.id === activeActivityId);
      if (!practice) return;

      const newBuff: TemporaryBuff = {
        id: 'buff_meditacao_' + Date.now(),
        nome: `Clareza Astral: ${practice.nome}`,
        atributo: practice.atributoFoco,
        valor: practice.buffValor,
        duracaoMinutos: practice.buffDuracaoMinutos,
        criadoEm: Date.now(),
        origem: 'meditacao',
        descricao: `+${practice.buffValor} em ${practice.atributoFoco.toUpperCase()} concedido pela harmonização no Santuário.`,
      };

      onUpdateCharacter(prev => {
        const nextXp = prev.experiencia + practice.expRecompensa;
        const totalSecs = (prev.estatisticas?.segundosMeditados || 0) + practice.duracaoSegundos;
        const updatedAch = prev.conquistas.map(a => {
          if (a.id === 'ach_mente_inabalavel') {
            const minutes = Math.floor(totalSecs / 60);
            return { ...a, progressoAtual: minutes, desbloqueada: minutes >= a.progressoAlvo };
          }
          return a;
        });

        return {
          ...prev,
          experiencia: nextXp,
          buffs: [...prev.buffs, newBuff],
          estatisticas: {
            ...prev.estatisticas,
            segundosMeditados: totalSecs,
          },
          conquistas: updatedAch,
        };
      });

      playCriticalSuccessSound();
      alert(`Sessão de Meditação Concluída! +${practice.expRecompensa} XP e +${practice.buffValor} em ${practice.atributoFoco.toUpperCase()} concedido por ${practice.buffDuracaoMinutos} min.`);
    }

    setRunningType(null);
    setActiveActivityId(null);
    setSecondsRemaining(0);
  };

  const handleCancelTimer = () => {
    if (confirm('Deseja realmente cancelar a sessão atual? O progresso do cronômetro será descartado.')) {
      setRunningType(null);
      setActiveActivityId(null);
      setSecondsRemaining(0);
    }
  };

  const strMod = getAttributeModifier(character.atributos.forca);
  const intMod = getAttributeModifier(character.atributos.inteligencia);
  const wisMod = getAttributeModifier(character.atributos.sabedoria);

  const classTrial = CLASS_LEVEL_UP_TRIALS[character.classe] || CLASS_LEVEL_UP_TRIALS['Guerreiro'];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* CABEÇALHO DO DOJO & SANTUÁRIO */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 md:p-8 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-600 via-amber-600 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-red-600/20">
              <Dumbbell className="w-8 h-8" />
            </div>
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold mb-1 border border-amber-500/30">
                <Sparkles className="w-3.5 h-3.5" />
                Dojo Marcial & Santuário Astral de Meditação
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                Treino Físico & Harmonização Mental
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Exercite o corpo para ganhar força e vigor, ou medite no santuário para inteligência e sabedoria cósmica.
              </p>
            </div>
          </div>

          {/* Alternador de Modo */}
          <div className="flex p-1.5 rounded-2xl bg-slate-950 border border-slate-800 shrink-0">
            <button
              onClick={() => setActiveTab('treino')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'treino'
                  ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-lg shadow-red-600/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Dumbbell className="w-4 h-4" />
              Treino Físico (FOR/DES/CON)
            </button>
            <button
              onClick={() => setActiveTab('meditacao')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'meditacao'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              Santuário de Meditação (INT/SAB)
            </button>
          </div>
        </div>

        {/* REQUISITOS DE SUBIDA DE NÍVEL DA CLASSE */}
        <div className="mt-6 pt-5 border-t border-slate-800/80">
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <Target className="w-5 h-5" />
              </span>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 block">
                  Desafio da Classe ({character.classe}) para Subir de Nível:
                </span>
                <span className="text-xs text-white font-medium">
                  {classTrial.titulo}: {classTrial.descricao}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 text-xs">
              <span className="px-2.5 py-1 rounded-lg bg-red-950/60 text-red-300 border border-red-500/30 font-semibold">
                {classTrial.desafioObrigatorio1.label}
              </span>
              {classTrial.desafioObrigatorio2 && (
                <span className="px-2.5 py-1 rounded-lg bg-indigo-950/60 text-indigo-300 border border-indigo-500/30 font-semibold">
                  {classTrial.desafioObrigatorio2.label}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* PAINEL ATIVO DE EXERCÍCIO OU MEDITAÇÃO COM ANIMAÇÃO VISUAL */}
      {runningType && (
        <div className="p-6 md:p-8 rounded-3xl bg-slate-900 border-2 border-amber-500/50 shadow-[0_0_40px_rgba(245,158,11,0.25)] space-y-6 animate-in slide-in-from-top-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-4xl animate-pulse">
                {runningType === 'treino' ? '🏋️‍♂️' : '🧘‍♂️'}
              </div>
              <div>
                <div className="text-xs uppercase font-bold tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  Sessão em Andamento • {runningType === 'treino' ? 'Dojo Físico Marcial' : 'Santuário Astral Interior'}
                </div>
                <h3 className="text-xl md:text-2xl font-black text-white mt-0.5">
                  {runningType === 'treino'
                    ? PHYSICAL_TRAINING_DRILLS.find(d => d.id === activeActivityId)?.nome
                    : MEDITATION_PRACTICES.find(m => m.id === activeActivityId)?.nome}
                </h3>
                <p className="text-xs text-slate-400">
                  Mantenha a concentração para absorver os bônus de atributos temporários e XP.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-5">
              <div className="text-center font-mono">
                <span className="text-4xl md:text-5xl font-black text-amber-400 tracking-tight">
                  {Math.floor(secondsRemaining / 60)}:{String(secondsRemaining % 60).padStart(2, '0')}
                </span>
                <span className="block text-[10px] text-slate-400 uppercase font-medium">Tempo Restante</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPaused(!isPaused)}
                  className="p-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition cursor-pointer shadow-md"
                  title={isPaused ? 'Continuar' : 'Pausar'}
                >
                  {isPaused ? <Play className="w-5 h-5 text-emerald-400" /> : <Pause className="w-5 h-5 text-amber-400" />}
                </button>
                <button
                  type="button"
                  onClick={handleCompleteSession}
                  className="px-5 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 text-slate-950 font-black text-xs transition cursor-pointer flex items-center gap-2 shadow-lg shadow-emerald-500/20"
                >
                  <CheckCircle2 className="w-4 h-4" /> Concluir Imediato
                </button>
                <button
                  type="button"
                  onClick={handleCancelTimer}
                  className="p-3.5 rounded-2xl bg-slate-800 hover:bg-red-950 text-slate-400 hover:text-red-300 transition cursor-pointer"
                  title="Cancelar Sessão"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* ANIMAÇÃO DINÂMICA: EXERCÍCIO FÍSICO OU MEDITAÇÃO */}
          {runningType === 'treino' ? (
            /* ANIMAÇÃO DO EXERCÍCIO FÍSICO COM REPETIÇÕES E AURA DE FORÇA */
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col md:flex-row items-center justify-around gap-6">
              <div className="relative w-44 h-44 flex items-center justify-center">
                {/* Aura de calor / músculos pulsando */}
                <div
                  className="absolute inset-0 rounded-full bg-red-600/20 blur-xl animate-ping"
                  style={{ animationDuration: '3s' }}
                />
                <svg className="w-full h-full" viewBox="0 0 160 160">
                  {/* Trilha do progresso circular */}
                  <circle cx="80" cy="80" r="70" stroke="#1e293b" strokeWidth="8" fill="none" />
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="#ef4444"
                    strokeWidth="8"
                    strokeDasharray="440"
                    strokeDashoffset={440 - (440 * (initialDuration - secondsRemaining)) / (initialDuration || 1)}
                    strokeLinecap="round"
                    fill="none"
                    className="transition-all duration-1000"
                  />
                  {/* Atleta levantando haltere animado */}
                  <g
                    className="transition-transform duration-700 ease-in-out"
                    style={{
                      transform: workoutReps % 2 === 0 ? 'translateY(-10px)' : 'translateY(10px)',
                    }}
                  >
                    {/* Cabeça */}
                    <circle cx="80" cy="50" r="14" fill="#f59e0b" />
                    {/* Tronco */}
                    <path d="M70 65 L90 65 L86 100 L74 100 Z" fill="#ef4444" />
                    {/* Braços com Haltere */}
                    <line x1="50" y1="65" x2="110" y2="65" stroke="#94a3b8" strokeWidth="4" />
                    <rect x="42" y="55" width="10" height="20" rx="3" fill="#cbd5e1" />
                    <rect x="108" y="55" width="10" height="20" rx="3" fill="#cbd5e1" />
                  </g>
                </svg>
              </div>

              <div className="space-y-3 text-center md:text-left max-w-sm">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 text-red-400 font-bold text-xs border border-red-500/30">
                  <Flame className="w-3.5 h-3.5 animate-bounce" /> Vigor & Hipertrofia Heroica
                </div>
                <h4 className="text-lg font-bold text-white">Cadência de Esforço Físico</h4>
                <div className="flex items-center justify-center md:justify-start gap-4 font-mono text-sm">
                  <div>
                    <span className="text-slate-400 text-xs block">Repetições:</span>
                    <strong className="text-2xl font-black text-amber-400">{workoutReps} reps</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-xs block">Ritmo Cardíaco:</span>
                    <strong className="text-2xl font-black text-red-400">145 bpm</strong>
                  </div>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden border border-slate-800">
                  <div
                    className="bg-gradient-to-r from-red-600 to-amber-500 h-full transition-all duration-1000"
                    style={{ width: `${((initialDuration - secondsRemaining) / (initialDuration || 1)) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ) : (
            /* ANIMAÇÃO DA MEDITAÇÃO COM MANDALA SAGRADA E RITMO DE RESPIRAÇÃO */
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col md:flex-row items-center justify-around gap-6">
              <div className="relative w-44 h-44 flex items-center justify-center">
                {/* Onda de Som / Taça Tibetana */}
                <div
                  className="absolute inset-0 rounded-full bg-indigo-600/25 blur-2xl animate-pulse"
                  style={{ animationDuration: '4s' }}
                />

                {/* Mandala Sagrada Giratória */}
                <svg
                  className="w-full h-full animate-[spin_25s_linear_infinite]"
                  viewBox="0 0 160 160"
                >
                  <circle cx="80" cy="80" r="70" stroke="#4f46e5" strokeWidth="1.5" strokeDasharray="4 4" fill="none" />
                  <circle cx="80" cy="80" r="50" stroke="#a855f7" strokeWidth="1.5" strokeDasharray="3 3" fill="none" />
                  <polygon points="80,20 135,115 25,115" stroke="#06b6d4" strokeWidth="1.5" fill="none" className="opacity-60" />
                  <polygon points="80,140 135,45 25,45" stroke="#eab308" strokeWidth="1.5" fill="none" className="opacity-60" />
                </svg>

                {/* Orbe Central Respiratório que expande e contrai */}
                <div
                  className={`absolute w-18 h-18 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-cyan-400 p-1 shadow-[0_0_35px_rgba(99,102,241,0.6)] flex items-center justify-center transition-all duration-1000 ${
                    breathPhase === 'inspire' ? 'scale-125' : breathPhase === 'segure' ? 'scale-115' : 'scale-90'
                  }`}
                >
                  <div className="w-full h-full rounded-full bg-slate-950 flex flex-col items-center justify-center text-center">
                    <span className="text-xl">🧘</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 text-center md:text-left max-w-sm">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 font-bold text-xs border border-indigo-500/30">
                  <Sparkles className="w-3.5 h-3.5" /> Foco Interior & Terceiro Olho
                </div>
                <h4 className="text-lg font-bold text-white">Guia de Respiração Prânica</h4>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                  <span className="text-slate-400 block mb-0.5">Fase Atual da Respiração:</span>
                  <strong className="text-base font-black text-cyan-300 uppercase tracking-widest font-mono">
                    {breathPhase === 'inspire' ? '🌬️ INSPIRE O ÉTER...' : breathPhase === 'segure' ? '✨ RETENHA O FOCO...' : '🍃 EXPIRE AS IMPUREZAS...'}
                  </strong>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden border border-slate-800">
                  <div
                    className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-full transition-all duration-1000"
                    style={{ width: `${((initialDuration - secondsRemaining) / (initialDuration || 1)) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ABA DE TREINO FÍSICO */}
      {activeTab === 'treino' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div>
              <h3 className="font-bold text-lg text-white flex items-center gap-2">
                <Dumbbell className="w-5 h-5 text-red-500" />
                Habilidades Físicas por Progressão de Nível
              </h3>
              <p className="text-xs text-slate-400">
                Exercícios corporais graduais para aumento de Força, Destreza e Constituição.
              </p>
            </div>
            <div className="text-xs px-3 py-1.5 rounded-xl bg-red-950/60 border border-red-500/30 text-red-300 font-mono font-bold">
              Modificador de Força: <strong>+{strMod}</strong>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {PHYSICAL_TRAINING_DRILLS.map(drill => {
              const isLocked = character.nivel < drill.nivelRequerido;
              const isActive = activeActivityId === drill.id;

              return (
                <div
                  key={drill.id}
                  className={`p-5 rounded-3xl border transition-all flex flex-col justify-between ${
                    isLocked
                      ? 'bg-slate-950/40 border-slate-900 opacity-60'
                      : isActive
                      ? 'bg-red-950/20 border-red-500 shadow-lg shadow-red-500/10'
                      : 'bg-slate-900 border-slate-800 hover:border-red-500/50'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <span className="text-4xl p-2.5 rounded-2xl bg-slate-950 border border-slate-800">{drill.icone}</span>
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                          isLocked ? 'bg-slate-800 text-slate-400' : 'bg-red-500/20 text-red-300 border border-red-500/30'
                        }`}
                      >
                        Nível {drill.nivelRequerido}
                      </span>
                    </div>

                    <h4 className="font-bold text-base text-white mt-3">{drill.nome}</h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{drill.descricao}</p>

                    <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-1.5 text-xs font-mono">
                      <div className="flex justify-between text-slate-300">
                        <span>Foco do Atributo:</span>
                        <strong className="text-amber-400 uppercase font-bold">
                          +{drill.buffValor} {drill.atributoFoco}
                        </strong>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>Duração do Buff:</span>
                        <span className="text-slate-400">{drill.buffDuracaoMinutos} min</span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>Recompensa de XP:</span>
                        <strong className="text-emerald-400">+{drill.expRecompensa} XP</strong>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5">
                    <button
                      type="button"
                      disabled={isLocked || !!runningType}
                      onClick={() => handleStartActivity(drill)}
                      className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 text-white font-bold text-xs transition cursor-pointer flex items-center justify-center gap-2 shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      {isActive ? 'Em Execução' : `Iniciar Treino (${drill.duracaoSegundos}s)`}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ABA DE MEDITAÇÃO */}
      {activeTab === 'meditacao' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div>
              <h3 className="font-bold text-lg text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                Práticas de Meditação & Transe Espiritual
              </h3>
              <p className="text-xs text-slate-400">
                Alinhamento do fluxo do éter para ampliação de Sabedoria, Inteligência e Conexão Arcana.
              </p>
            </div>
            <div className="text-xs px-3 py-1.5 rounded-xl bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 font-mono font-bold">
              Sabedoria: <strong>+{wisMod}</strong> | Inteligência: <strong>+{intMod}</strong>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {MEDITATION_PRACTICES.map(practice => {
              const isLocked = character.nivel < practice.nivelRequerido;
              const isActive = activeActivityId === practice.id;

              return (
                <div
                  key={practice.id}
                  className={`p-5 rounded-3xl border transition-all flex flex-col justify-between ${
                    isLocked
                      ? 'bg-slate-950/40 border-slate-900 opacity-60'
                      : isActive
                      ? 'bg-indigo-950/20 border-indigo-500 shadow-lg shadow-indigo-500/10'
                      : 'bg-slate-900 border-slate-800 hover:border-indigo-500/50'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <span className="text-4xl p-2.5 rounded-2xl bg-slate-950 border border-slate-800">{practice.icone}</span>
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                          isLocked ? 'bg-slate-800 text-slate-400' : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                        }`}
                      >
                        Nível {practice.nivelRequerido}
                      </span>
                    </div>

                    <h4 className="font-bold text-base text-white mt-3">{practice.nome}</h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{practice.descricao}</p>

                    <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-1.5 text-xs font-mono">
                      <div className="flex justify-between text-slate-300">
                        <span>Foco do Atributo:</span>
                        <strong className="text-indigo-400 uppercase font-bold">
                          +{practice.buffValor} {practice.atributoFoco}
                        </strong>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>Duração da Clareza:</span>
                        <span className="text-slate-400">{practice.buffDuracaoMinutos} min</span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>Recompensa de XP:</span>
                        <strong className="text-emerald-400">+{practice.expRecompensa} XP</strong>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5">
                    <button
                      type="button"
                      disabled={isLocked || !!runningType}
                      onClick={() => handleStartActivity(practice)}
                      className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 text-white font-bold text-xs transition cursor-pointer flex items-center justify-center gap-2 shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      {isActive ? 'Em Transe' : `Iniciar Meditação (${practice.duracaoSegundos}s)`}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal de Rolagem D20 antes da Atividade */}
      {d20ModalOpen && pendingActivity && (
        <DiceRollerModal
          isOpen={d20ModalOpen}
          onClose={() => setD20ModalOpen(false)}
          actionTitle={`Teste de Disciplina: ${pendingActivity.nome}`}
          modifier={'forca' in pendingActivity ? strMod : intMod}
          dcTarget={10}
          onResult={(natRoll, total, isCrit, isFail) => {
            setD20ModalOpen(false);
            handleD20TestComplete(natRoll, total, isCrit, isFail);
          }}
        />
      )}
    </div>
  );
};
