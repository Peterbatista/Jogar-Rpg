import React, { useState } from 'react';
import { CharacterClass } from '../types/rpg';
import { CLASSES_CATALOG, ClassInfo } from '../data/classesAndRaces';
import { playDiceRollSound, playCriticalSuccessSound } from '../utils/audio';
import { X, Check, Dices, Sparkles, Wand2, Shield, Heart, Zap } from 'lucide-react';

interface ClassShowcaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedClass: CharacterClass;
  onSelectClass: (classe: CharacterClass) => void;
}

export const ClassShowcaseModal: React.FC<ClassShowcaseModalProps> = ({
  isOpen,
  onClose,
  selectedClass,
  onSelectClass,
}) => {
  const [currentClass, setCurrentClass] = useState<ClassInfo>(() => {
    return CLASSES_CATALOG.find(c => c.nome === selectedClass) || CLASSES_CATALOG[0];
  });
  const [isRaffling, setIsRaffling] = useState(false);

  if (!isOpen) return null;

  const handleRandomClass = () => {
    if (isRaffling) return;
    setIsRaffling(true);
    playDiceRollSound();

    let count = 0;
    const interval = setInterval(() => {
      count++;
      const randomIndex = Math.floor(Math.random() * CLASSES_CATALOG.length);
      setCurrentClass(CLASSES_CATALOG[randomIndex]);

      if (count >= 16) {
        clearInterval(interval);
        const finalClass = CLASSES_CATALOG[Math.floor(Math.random() * CLASSES_CATALOG.length)];
        setCurrentClass(finalClass);
        setIsRaffling(false);
        playCriticalSuccessSound();
      }
    }, 80);
  };

  const handleConfirmClass = (classeNome: CharacterClass) => {
    onSelectClass(classeNome);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-4xl rounded-3xl bg-slate-900 border border-slate-700 p-6 md:p-8 shadow-2xl text-slate-100 max-h-[92vh] overflow-y-auto">
        {/* Botão Fechar */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Título e Botão de Sortear */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold mb-2 border border-amber-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              Catálogo de Classes & Vocações D&D 5e
            </div>
            <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              Escolha ou Sorteie a Classe do Herói
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Guerreiros, magos, artífices e alquimistas possuem estilos únicos de progressão, combate e maestria.
            </p>
          </div>

          <button
            type="button"
            disabled={isRaffling}
            onClick={handleRandomClass}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-black text-xs transition cursor-pointer flex items-center gap-2 shadow-lg shadow-amber-500/20 self-start sm:self-auto disabled:opacity-50"
          >
            <Dices className="w-4 h-4" />
            {isRaffling ? 'Sorteando...' : '🎲 Sortear Classe Aleatória'}
          </button>
        </div>

        {/* Seletor Rápido de Classes */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-6 scrollbar-thin">
          {CLASSES_CATALOG.map(c => {
            const isSelected = currentClass.nome === c.nome;
            return (
              <button
                key={c.nome}
                onClick={() => setCurrentClass(c)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer shrink-0 border ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/20'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <span>{c.nome}</span>
                {selectedClass === c.nome && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-950/40 text-amber-950 font-extrabold">
                    Atual
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Detalhe da Classe Selecionada */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Emblema Ilustrado da Classe */}
          <div className="md:col-span-5 space-y-4">
            <div className="rounded-2xl overflow-hidden border-2 border-slate-700 p-6 bg-slate-950 flex flex-col items-center justify-center text-center shadow-2xl">
              <div
                className="w-32 h-32 mb-4"
                dangerouslySetInnerHTML={{ __html: currentClass.iconSvg }}
              />
              <span className="text-2xl font-black text-white">{currentClass.nome}</span>
              <span className="text-xs text-amber-400 font-semibold uppercase tracking-wider mt-0.5">
                Dado de Vida: {currentClass.dadoVida} • Atributo: {currentClass.atributoChave.toUpperCase()}
              </span>

              <div className="flex gap-2 mt-3">
                {currentClass.usaAlquimia && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    ⚗️ Usa Alquimia
                  </span>
                )}
                {currentClass.usaMagia && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    ✨ Magias
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={() => handleConfirmClass(currentClass.nome)}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-black text-sm transition shadow-lg shadow-amber-500/20 cursor-pointer flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              Definir {currentClass.nome} como Classe
            </button>
          </div>

          {/* Lore, Vantagens e Desvantagens */}
          <div className="md:col-span-7 space-y-4">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <h4 className="text-base font-bold text-white mb-1">Visão Geral da Classe</h4>
              <p className="text-xs text-slate-300 leading-relaxed">{currentClass.descricao}</p>
            </div>

            {/* Vantagens e Desvantagens */}
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 text-xs">
                <span className="font-bold text-emerald-400 block mb-1">✦ Principais Vantagens em Batalha:</span>
                <p className="text-slate-200 leading-relaxed">{currentClass.vantagem}</p>
              </div>

              <div className="p-4 rounded-2xl bg-red-950/30 border border-red-500/40 text-xs">
                <span className="font-bold text-red-400 block mb-1">⚠️ Desvantagens & Vulnerabilidades:</span>
                <p className="text-slate-200 leading-relaxed">{currentClass.desvantagem}</p>
              </div>
            </div>

            {/* Requisitos de Evolução de Classe */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-1.5">
              <span className="text-amber-400 font-bold block mb-1">📋 Requisitos Obrigatórios para Subir de Nível:</span>
              {['Mago', 'Artífice', 'Alquimista'].includes(currentClass.nome) ? (
                <div className="text-slate-300 space-y-1">
                  <div>• <strong>Destilar Alquimia:</strong> Obrigatório sintetizar poções e fórmulas químicas no laboratório.</div>
                  <div>• <strong>Meditação Mística:</strong> Harmonização astral necessária para expansão do intelecto.</div>
                  <div className="text-slate-400">• <em>Treino Físico: Opcional / Bônus complementar.</em></div>
                </div>
              ) : ['Bárbaro', 'Guerreiro', 'Paladino'].includes(currentClass.nome) ? (
                <div className="text-slate-300 space-y-1">
                  <div>• <strong>Treinamento Físico:</strong> Obrigatório completar exercícios de força, carga e sparring no Dojo.</div>
                  <div>• <strong>Meditação / Foco Espiritual:</strong> Manter autocontrole de combate para canalizar a fúria.</div>
                  <div className="text-slate-400">• <em>Alquimia: Opcional / Uso de elixires de suporte.</em></div>
                </div>
              ) : (
                <div className="text-slate-300 space-y-1">
                  <div>• <strong>Treinamento Misto:</strong> Concluir sessões equilibradas de agilidade física e concentração mental.</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
