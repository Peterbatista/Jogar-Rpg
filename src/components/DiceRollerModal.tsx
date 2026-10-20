import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { playDiceRollSound, playCriticalSuccessSound, playCriticalFailSound } from '../utils/audio';
import { formatModifier } from '../utils/dndMath';
import { useDiceRoll } from '../context/DiceRollContext';
import { X, Sparkles, Skull, Dices } from 'lucide-react';

interface DiceRollerModalProps {
  isOpen: boolean;
  onClose: () => void;
  actionTitle: string;
  modifier: number;
  dcTarget?: number;
  onResult?: (naturalRoll: number, total: number, isCriticalSuccess: boolean, isCriticalFail: boolean) => void;
}

export const DiceRollerModal: React.FC<DiceRollerModalProps> = ({
  isOpen,
  onClose,
  actionTitle,
  modifier,
  dcTarget,
  onResult,
}) => {
  const { recordRoll } = useDiceRoll();
  const [isRolling, setIsRolling] = useState(false);
  const [currentValue, setCurrentValue] = useState<number | null>(null);
  const [finalValue, setFinalValue] = useState<number | null>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0, z: 0 });

  useEffect(() => {
    if (isOpen) {
      setFinalValue(null);
      setCurrentValue(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const rollDice = () => {
    if (isRolling) return;
    setIsRolling(true);
    setFinalValue(null);
    playDiceRollSound();

    let rollCount = 0;
    const interval = setInterval(() => {
      rollCount++;
      const randomFace = Math.floor(Math.random() * 20) + 1;
      setCurrentValue(randomFace);
      setRotation({
        x: Math.floor(Math.random() * 360),
        y: Math.floor(Math.random() * 360),
        z: Math.floor(Math.random() * 360),
      });

      if (rollCount >= 18) {
        clearInterval(interval);
        const result = Math.floor(Math.random() * 20) + 1;
        setCurrentValue(result);
        setFinalValue(result);
        setIsRolling(false);

        const isCrit20 = result === 20;
        const isCrit1 = result === 1;

        if (isCrit20) {
          playCriticalSuccessSound();
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#facc15', '#eab308', '#fbbf24', '#ffffff'],
          });
        } else if (isCrit1) {
          playCriticalFailSound();
        }

        const total = result + modifier;
        const success = dcTarget !== undefined ? total >= dcTarget || isCrit20 : undefined;

        recordRoll({
          acao: actionTitle,
          dadoBase: 'd20',
          rolagemNatural: result,
          modificador: modifier,
          total,
          cdOuCa: dcTarget,
          isCritico: isCrit20,
          isFalhaCritica: isCrit1,
          sucesso: success,
          detalhes: isCrit20
            ? 'Acerto Crítico Lendário! Bônus máximo aplicado na ação.'
            : isCrit1
            ? 'Falha Crítica no d20! Penalidade aplicada no teste.'
            : success
            ? `Superou com sucesso a dificuldade CD ${dcTarget}!`
            : dcTarget
            ? `Não atingiu a CD ${dcTarget}.`
            : `Jogada computada com modificador ${formatModifier(modifier)}.`,
        });

        if (onResult) {
          onResult(result, total, isCrit20, isCrit1);
        }
      }
    }, 60);
  };

  const isSuccess = finalValue !== null && dcTarget !== undefined ? (finalValue + modifier) >= dcTarget || finalValue === 20 : null;
  const isCritSuccess = finalValue === 20;
  const isCritFail = finalValue === 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className={`relative w-full max-w-md rounded-2xl border ${
        isCritSuccess ? 'border-amber-400 bg-slate-900 shadow-[0_0_40px_rgba(250,204,21,0.35)]' :
        isCritFail ? 'border-red-600 bg-slate-900 shadow-[0_0_40px_rgba(220,38,38,0.35)] animate-shake' :
        'border-slate-700 bg-slate-900'
      } p-6 text-slate-100 shadow-2xl`}>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Dices className="w-5 h-5 text-amber-500" />
            <h3 className="font-semibold text-lg text-slate-100">Rolagem D20 Interativa</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Motivo da Rolagem */}
        <div className="mt-4 p-3 bg-slate-950/70 rounded-xl border border-slate-800">
          <div className="text-xs font-medium text-amber-400 uppercase tracking-wider">Ação em Teste</div>
          <div className="text-sm font-semibold text-slate-200 mt-0.5">{actionTitle}</div>
          <div className="flex items-center justify-between mt-2 text-xs text-slate-400">
            <span>Modificador: <strong className="text-emerald-400 font-mono text-sm">{formatModifier(modifier)}</strong></span>
            {dcTarget && <span>Dificuldade (CD): <strong className="text-amber-300 font-mono text-sm">{dcTarget}</strong></span>}
          </div>
        </div>

        {/* Dado 3D Central */}
        <div className="my-8 flex flex-col items-center justify-center">
          <div
            onClick={rollDice}
            className={`relative w-36 h-36 flex items-center justify-center cursor-pointer transition-transform duration-150 select-none ${
              isRolling ? 'scale-110' : 'hover:scale-105'
            }`}
            style={{
              transform: `perspective(600px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) rotateZ(${rotation.z}deg)`,
              transition: isRolling ? 'transform 0.06s ease' : 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          >
            {/* Visual D20 Shape */}
            <div className={`w-full h-full flex items-center justify-center rounded-3xl ${
              isCritSuccess
                ? 'bg-gradient-to-br from-amber-300 via-amber-500 to-yellow-600 shadow-lg shadow-amber-500/50'
                : isCritFail
                ? 'bg-gradient-to-br from-red-600 via-red-800 to-rose-950 shadow-lg shadow-red-700/50'
                : 'bg-gradient-to-br from-indigo-600 via-purple-700 to-slate-900 border-2 border-indigo-400/50 shadow-xl'
            }`}>
              <div className="relative text-center">
                <span className={`font-mono text-4xl font-extrabold tracking-tighter ${
                  isCritSuccess ? 'text-slate-950' : 'text-white drop-shadow-md'
                }`}>
                  {currentValue !== null ? currentValue : '20'}
                </span>
                <span className={`block text-[10px] font-bold uppercase tracking-wider ${
                  isCritSuccess ? 'text-amber-950' : 'text-slate-300'
                }`}>
                  {currentValue === null ? 'Clique p/ Rolar' : 'D20'}
                </span>
              </div>
            </div>
          </div>

          {/* Feedback de Resultado */}
          {finalValue !== null && (
            <div className="mt-4 text-center animate-in zoom-in-95 duration-200">
              {isCritSuccess && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold text-sm">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  SUCESSO CRÍTICO NATURAL 20! (+Bonificação Suprema)
                </div>
              )}
              {isCritFail && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 text-red-300 border border-red-500/40 font-bold text-sm">
                  <Skull className="w-4 h-4 text-red-400" />
                  FALHA CRÍTICA NATURAL 1! (-Penalidade)
                </div>
              )}
              {!isCritSuccess && !isCritFail && dcTarget !== undefined && (
                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold text-sm ${
                  isSuccess
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                }`}>
                  {isSuccess ? '✓ Sucesso no Teste!' : '✗ Fracasso no Teste!'}
                </div>
              )}

              <div className="mt-2 text-slate-300 font-mono text-sm">
                Rolagem: <span className="font-bold text-white">{finalValue}</span> + Modificador (<span className="text-emerald-400">{formatModifier(modifier)}</span>) = <strong className="text-xl text-amber-400">{finalValue + modifier}</strong>
              </div>
            </div>
          )}
        </div>

        {/* Botão de Ação */}
        <div className="flex gap-2">
          <button
            onClick={rollDice}
            disabled={isRolling}
            className="flex-1 py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 transition shadow-lg shadow-amber-500/20 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
          >
            <Dices className="w-4 h-4" />
            {isRolling ? 'Rolando D20...' : finalValue === null ? 'Rolar Dado Agora' : 'Rolar Novamente'}
          </button>
          {finalValue !== null && (
            <button
              onClick={onClose}
              className="py-3 px-5 rounded-xl font-semibold text-sm bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
            >
              Concluir
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
