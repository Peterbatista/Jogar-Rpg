import React, { useState } from 'react';
import { CharacterSheet } from '../types/rpg';
import { NARRATIVE_CHAPTERS, StoryChapter, StoryChoice } from '../data/narrativeCampaign';
import { DiceRollerModal } from './DiceRollerModal';
import { getAttributeModifier } from '../utils/dndMath';
import {
  BookOpen,
  Compass,
  Sparkles,
  ShieldAlert,
  Heart,
  RotateCcw,
  Award,
  ChevronRight,
  Flame,
} from 'lucide-react';

interface InteractiveStoryProps {
  character: CharacterSheet;
  onUpdateCharacter: (updater: (prev: CharacterSheet) => CharacterSheet) => void;
}

export const InteractiveStory: React.FC<InteractiveStoryProps> = ({
  character,
  onUpdateCharacter,
}) => {
  const [d20ModalOpen, setD20ModalOpen] = useState(false);
  const [pendingChoice, setPendingChoice] = useState<StoryChoice | null>(null);
  const [lastOutcome, setLastOutcome] = useState<{ text: string; isSuccess: boolean } | null>(null);

  const currentChapterId = character.narrativaProgresso?.capituloAtualId || 'capitulo_1';
  const currentChapter = NARRATIVE_CHAPTERS[currentChapterId] || NARRATIVE_CHAPTERS['capitulo_1'];
  const difficulty = character.narrativaProgresso?.dificuldade || 'normal';

  const dcModByDifficulty = {
    facil: -2,
    normal: 0,
    dificil: 2,
    hardcore: 4,
  }[difficulty];

  const handleSelectChoice = (choice: StoryChoice) => {
    if (choice.exigeTeste) {
      setPendingChoice(choice);
      setD20ModalOpen(true);
    } else {
      executeChoiceProgression(choice, true);
    }
  };

  const handleDiceTestResult = (naturalRoll: number, total: number, isCrit: boolean, isFail: boolean) => {
    if (!pendingChoice || !pendingChoice.exigeTeste) return;

    const baseDc = pendingChoice.exigeTeste.dcBase + dcModByDifficulty;
    const isSuccess = naturalRoll === 20 || (!isFail && total >= baseDc);

    executeChoiceProgression(pendingChoice, isSuccess);
  };

  const executeChoiceProgression = (choice: StoryChoice, isSuccess: boolean) => {
    const outcomeText = isSuccess ? (choice.textoSucesso || 'Você obteve êxito!') : (choice.textoFalha || 'Você falhou no teste!');
    setLastOutcome({ text: outcomeText, isSuccess });

    onUpdateCharacter(prev => {
      let updatedXp = prev.experiencia;
      let nextHpNarrativa = prev.narrativaProgresso.hpNarrativa;
      let nextStock = { ...prev.elementosEstoque };

      if (isSuccess) {
        if (choice.recompensaXp) updatedXp += choice.recompensaXp;
        if (choice.recompensaElemento) {
          const sym = choice.recompensaElemento.simbolo;
          nextStock[sym] = (nextStock[sym] || 0) + choice.recompensaElemento.quantidade;
        }
      } else {
        const dmg = (choice.danoEmCasoDeFalha || 3) * (difficulty === 'hardcore' ? 2 : 1);
        nextHpNarrativa = Math.max(1, nextHpNarrativa - dmg);
      }

      const completedCapCount = choice.proximoCapituloId.startsWith('epilogo')
        ? (prev.estatisticas?.capitulosConcluidos || 0) + 1
        : prev.estatisticas?.capitulosConcluidos || 0;

      const updatedAch = prev.conquistas.map(a => {
        if (a.id === 'ach_cronicas_cap1' && completedCapCount >= 1) {
          return { ...a, progressoAtual: 1, desbloqueada: true };
        }
        return a;
      });

      return {
        ...prev,
        experiencia: updatedXp,
        elementosEstoque: nextStock,
        estatisticas: {
          ...prev.estatisticas,
          capitulosConcluidos: completedCapCount,
        },
        conquistas: updatedAch,
        narrativaProgresso: {
          ...prev.narrativaProgresso,
          capituloAtualId: choice.proximoCapituloId,
          hpNarrativa: nextHpNarrativa,
          decisoesHistorico: [
            ...(prev.narrativaProgresso?.decisoesHistorico || []),
            `${currentChapter.titulo}: ${choice.texto} (${isSuccess ? 'Sucesso' : 'Falha'})`,
          ],
        },
      };
    });
  };

  const handleChangeDifficulty = (newDiff: 'facil' | 'normal' | 'dificil' | 'hardcore') => {
    onUpdateCharacter(prev => ({
      ...prev,
      narrativaProgresso: {
        ...prev.narrativaProgresso,
        dificuldade: newDiff,
      },
    }));
  };

  const handleResetStory = () => {
    if (confirm('Deseja reiniciar a campanha narrativa a partir do Capítulo I?')) {
      onUpdateCharacter(prev => ({
        ...prev,
        narrativaProgresso: {
          ...prev.narrativaProgresso,
          capituloAtualId: 'capitulo_1',
          hpNarrativa: prev.combate.pvMax,
        },
      }));
      setLastOutcome(null);
    }
  };

  const getAttrMod = (attr: keyof CharacterSheet['atributos']) => {
    return getAttributeModifier(character.atributos[attr]);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Banner Narrativo */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-950 via-slate-900 to-stone-900 p-6 border border-amber-600/30 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold mb-2 border border-amber-500/30">
              <BookOpen className="w-3.5 h-3.5" />
              Campanha Solo Interativa • As Crônicas do Codex
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Aventuras & Escolhas no Mundo de D&D
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Tome decisões que moldam o destino do reino. Cada ação exige testes de perícia com rolagem do D20, penalidades para fracassos e bonificações épicas para sucessos críticos!
            </p>
          </div>

          {/* Dificuldade & Vitalidade Narrativa */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="px-3.5 py-2 rounded-xl bg-slate-900/90 border border-slate-700">
              <span className="block text-[10px] text-slate-400 uppercase font-semibold">Dificuldade</span>
              <select
                value={difficulty}
                onChange={e => handleChangeDifficulty(e.target.value as any)}
                className="bg-transparent text-xs font-bold text-amber-400 focus:outline-none cursor-pointer"
              >
                <option value="facil" className="bg-slate-900">Aprendiz (Fácil)</option>
                <option value="normal" className="bg-slate-900">Aventureiro (Normal)</option>
                <option value="dificil" className="bg-slate-900">Veterano (Difícil)</option>
                <option value="hardcore" className="bg-slate-900">Mestre (Hardcore)</option>
              </select>
            </div>

            <div className="px-3.5 py-2 rounded-xl bg-slate-900/90 border border-slate-700 flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-500 fill-red-500/30" />
              <div>
                <span className="block text-[10px] text-slate-400 uppercase font-semibold">PV de Narrativa</span>
                <span className="text-sm font-black text-white">{character.narrativaProgresso?.hpNarrativa || 10} PV</span>
              </div>
            </div>

            <button
              onClick={handleResetStory}
              className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
              title="Reiniciar Campanha"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Caixa do Capítulo Narrativo Atual */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 md:p-8 shadow-2xl space-y-6">
        <div className="flex items-center gap-4 pb-4 border-b border-slate-800">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-3xl">
            {currentChapter.imagemTema}
          </div>
          <div>
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">{currentChapter.subtitulo}</span>
            <h3 className="text-xl md:text-2xl font-bold text-white mt-0.5">{currentChapter.titulo}</h3>
          </div>
        </div>

        {/* Texto Narrativo Imersivo */}
        <div className="text-slate-200 text-sm md:text-base leading-relaxed whitespace-pre-line p-5 rounded-xl bg-slate-950/70 border border-slate-800 font-serif">
          {currentChapter.textoNarrativo}
        </div>

        {/* Feedback do Último Desfecho de Teste */}
        {lastOutcome && (
          <div className={`p-4 rounded-xl border animate-in zoom-in-95 duration-200 flex items-start gap-3 ${
            lastOutcome.isSuccess
              ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
              : 'bg-red-950/40 border-red-500/50 text-red-200'
          }`}>
            <Sparkles className={`w-5 h-5 shrink-0 mt-0.5 ${lastOutcome.isSuccess ? 'text-emerald-400' : 'text-red-400'}`} />
            <div>
              <strong className="block text-xs uppercase font-bold tracking-wider mb-0.5">
                {lastOutcome.isSuccess ? 'Desfecho de Sucesso!' : 'Consequência de Falha!'}
              </strong>
              <p className="text-xs md:text-sm leading-normal">{lastOutcome.text}</p>
            </div>
          </div>
        )}

        {/* Opções de Escolha / Ações do Jogador */}
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-amber-400" />
            Escolhas Disponíveis:
          </h4>

          <div className="grid grid-cols-1 gap-3">
            {currentChapter.opcoes.map(choice => {
              const test = choice.exigeTeste;
              const testMod = test ? getAttrMod(test.atributo) : 0;
              const targetDc = test ? test.dcBase + dcModByDifficulty : 0;

              return (
                <button
                  key={choice.id}
                  type="button"
                  onClick={() => handleSelectChoice(choice)}
                  className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500/60 hover:bg-slate-900/90 text-left transition group cursor-pointer flex items-center justify-between gap-4 shadow-sm"
                >
                  <div className="space-y-1">
                    <span className="block text-sm font-semibold text-slate-200 group-hover:text-amber-300 transition-colors">
                      {choice.texto}
                    </span>
                    {test && (
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span>Exige: <strong className="text-cyan-400">{test.periciaNome}</strong></span>
                        <span>CD Alvo: <strong className="text-amber-400 font-mono">{targetDc}</strong></span>
                        <span>Seu Bônus: <strong className="text-emerald-400 font-mono">+{testMod}</strong></span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {test && (
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        Rolar D20
                      </span>
                    )}
                    <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* D20 Modal para Testes Narrativos */}
      {d20ModalOpen && pendingChoice && pendingChoice.exigeTeste && (
        <DiceRollerModal
          isOpen={d20ModalOpen}
          onClose={() => setD20ModalOpen(false)}
          actionTitle={`Teste Narrativo: ${pendingChoice.exigeTeste.periciaNome}`}
          modifier={getAttrMod(pendingChoice.exigeTeste.atributo)}
          dcTarget={pendingChoice.exigeTeste.dcBase + dcModByDifficulty}
          onResult={(nat, tot, crit, fail) => {
            setD20ModalOpen(false);
            handleDiceTestResult(nat, tot, crit, fail);
          }}
        />
      )}
    </div>
  );
};
