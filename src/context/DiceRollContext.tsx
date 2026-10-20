import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { DiceRollRecord } from '../types/rpg';
import { playCriticalSuccessSound, playCriticalFailSound, playDiceRollSound } from '../utils/audio';
import confetti from 'canvas-confetti';
import { Dices, CheckCircle2, AlertOctagon, Sparkles, X, History, ChevronRight } from 'lucide-react';

interface DiceRollContextType {
  lastRoll: DiceRollRecord | null;
  rollHistory: DiceRollRecord[];
  showRollBanner: boolean;
  dismissBanner: () => void;
  recordRoll: (roll: Omit<DiceRollRecord, 'id' | 'timestamp'>) => void;
  clearHistory: () => void;
  openHistoryModal: boolean;
  setOpenHistoryModal: (open: boolean) => void;
}

const DiceRollContext = createContext<DiceRollContextType | undefined>(undefined);

export const DiceRollProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [lastRoll, setLastRoll] = useState<DiceRollRecord | null>(null);
  const [rollHistory, setRollHistory] = useState<DiceRollRecord[]>([]);
  const [showRollBanner, setShowRollBanner] = useState<boolean>(false);
  const [openHistoryModal, setOpenHistoryModal] = useState<boolean>(false);

  const recordRoll = useCallback((rollData: Omit<DiceRollRecord, 'id' | 'timestamp'>) => {
    const newRecord: DiceRollRecord = {
      ...rollData,
      id: 'roll_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      timestamp: Date.now(),
    };

    setLastRoll(newRecord);
    setRollHistory(prev => [newRecord, ...prev.slice(0, 49)]); // Keep last 50
    setShowRollBanner(true);

    if (newRecord.isCritico) {
      playCriticalSuccessSound();
      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.15 },
          colors: ['#f59e0b', '#fbbf24', '#10b981'],
        });
      } catch (e) {
        // ignore
      }
    } else if (newRecord.isFalhaCritica) {
      playCriticalFailSound();
    } else {
      playDiceRollSound();
    }
  }, []);

  const dismissBanner = useCallback(() => {
    setShowRollBanner(false);
  }, []);

  const clearHistory = useCallback(() => {
    setRollHistory([]);
    setLastRoll(null);
  }, []);

  return (
    <DiceRollContext.Provider
      value={{
        lastRoll,
        rollHistory,
        showRollBanner,
        dismissBanner,
        recordRoll,
        clearHistory,
        openHistoryModal,
        setOpenHistoryModal,
      }}
    >
      {children}

      {/* BANNER FLUTUANTE DE RESULTADO DA ROLAGEM */}
      {showRollBanner && lastRoll && (
        <div className="fixed top-4 right-4 sm:top-5 sm:right-6 z-50 max-w-md w-[calc(100vw-2rem)] animate-in slide-in-from-top-4 fade-in duration-300">
          <div
            className={`rounded-2xl p-4 shadow-2xl border backdrop-blur-xl transition-all ${
              lastRoll.isCritico
                ? 'bg-amber-950/95 border-amber-400 text-amber-100 shadow-[0_0_25px_rgba(245,158,11,0.4)]'
                : lastRoll.isFalhaCritica
                ? 'bg-red-950/95 border-red-500 text-red-100 shadow-[0_0_25px_rgba(239,68,68,0.4)]'
                : lastRoll.sucesso
                ? 'bg-slate-900/95 border-emerald-500/80 text-emerald-100 shadow-xl'
                : 'bg-slate-900/95 border-slate-700 text-slate-100 shadow-xl'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-slate-950/60 border border-white/10 text-xl">
                  {lastRoll.isCritico ? '👑' : lastRoll.isFalhaCritica ? '💀' : '🎲'}
                </span>
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider">
                    {lastRoll.isCritico ? (
                      <span className="text-amber-400 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" /> CRÍTICO NATURAL (20)!
                      </span>
                    ) : lastRoll.isFalhaCritica ? (
                      <span className="text-red-400 flex items-center gap-1">
                        <AlertOctagon className="w-3.5 h-3.5" /> FALHA CRÍTICA (1)!
                      </span>
                    ) : lastRoll.sucesso ? (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> SUCESSO!
                      </span>
                    ) : (
                      <span className="text-slate-300">RESULTADO DA JOGADA</span>
                    )}
                  </div>
                  <h4 className="text-sm font-black text-white truncate max-w-[240px]">{lastRoll.acao}</h4>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setOpenHistoryModal(true)}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition cursor-pointer"
                  title="Ver Histórico de Rolagens"
                >
                  <History className="w-4 h-4" />
                </button>
                <button
                  onClick={dismissBanner}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* CÁLCULO E DETALHES DA ROLAGEM */}
            <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between gap-4">
              <div className="flex items-baseline gap-2 font-mono">
                <span className="text-xs text-slate-400">{lastRoll.dadoBase}:</span>
                <span
                  className={`text-lg font-black px-2 py-0.5 rounded-md ${
                    lastRoll.isCritico
                      ? 'bg-amber-500 text-slate-950'
                      : lastRoll.isFalhaCritica
                      ? 'bg-red-600 text-white'
                      : 'bg-slate-800 text-cyan-300'
                  }`}
                >
                  [{lastRoll.rolagemNatural}]
                </span>
                <span className="text-xs text-slate-400">
                  {lastRoll.modificador >= 0 ? `+${lastRoll.modificador}` : lastRoll.modificador}
                </span>
                <span className="text-xl font-black text-white">= {lastRoll.total}</span>
              </div>

              {lastRoll.cdOuCa !== undefined && (
                <div className="text-right text-xs">
                  <span className="text-slate-400">Alvo CD/CA: </span>
                  <strong className="text-amber-400 font-mono">{lastRoll.cdOuCa}</strong>
                </div>
              )}
            </div>

            {lastRoll.detalhes && (
              <p className="mt-2 text-xs text-slate-300/90 leading-snug line-clamp-2">
                {lastRoll.detalhes}
              </p>
            )}
          </div>
        </div>
      )}

      {/* MODAL DE HISTÓRICO DE ROLAGENS */}
      {openHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-xl rounded-3xl bg-slate-900 border border-slate-700 p-6 shadow-2xl text-slate-100 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Dices className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-lg text-white">Histórico de Rolagens de Dados</h3>
              </div>
              <div className="flex items-center gap-2">
                {rollHistory.length > 0 && (
                  <button
                    onClick={clearHistory}
                    className="text-xs text-slate-400 hover:text-red-400 transition cursor-pointer"
                  >
                    Limpar
                  </button>
                )}
                <button
                  onClick={() => setOpenHistoryModal(false)}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-2.5">
              {rollHistory.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-sm">
                  <Dices className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  Nenhuma rolagem registrada ainda nesta sessão.
                </div>
              ) : (
                rollHistory.map(r => (
                  <div
                    key={r.id}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-base">
                        {r.isCritico ? '👑' : r.isFalhaCritica ? '💀' : '🎲'}
                      </span>
                      <div>
                        <div className="font-bold text-slate-200">{r.acao}</div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {r.dadoBase} [{r.rolagemNatural}] {r.modificador >= 0 ? `+${r.modificador}` : r.modificador} ={' '}
                          <strong className="text-amber-400 text-xs">{r.total}</strong>
                          {r.cdOuCa ? ` (vs ${r.cdOuCa})` : ''}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          r.isCritico
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : r.isFalhaCritica
                            ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                            : r.sucesso
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {r.isCritico ? 'Crítico 20' : r.isFalhaCritica ? 'Falha 1' : r.sucesso ? 'Sucesso' : 'Total'}
                      </span>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </DiceRollContext.Provider>
  );
};

export const useDiceRoll = () => {
  const context = useContext(DiceRollContext);
  if (!context) {
    throw new Error('useDiceRoll must be used within a DiceRollProvider');
  }
  return context;
};
