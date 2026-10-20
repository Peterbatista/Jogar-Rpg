import React, { useState } from 'react';
import { CharacterRace, CharacterSheet } from '../types/rpg';
import { RACES_CATALOG, RaceInfo } from '../data/classesAndRaces';
import { X, Check, Eye, Shield, Footprints, Sparkles, UserCheck } from 'lucide-react';

interface RaceShowcaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedRace: CharacterRace;
  onSelectRace: (race: CharacterRace) => void;
}

export const RaceShowcaseModal: React.FC<RaceShowcaseModalProps> = ({
  isOpen,
  onClose,
  selectedRace,
  onSelectRace,
}) => {
  const [currentRace, setCurrentRace] = useState<RaceInfo>(() => {
    return RACES_CATALOG.find(r => r.nome === selectedRace) || RACES_CATALOG[0];
  });
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  if (!isOpen) return null;

  const handleConfirmRace = (raceNome: CharacterRace) => {
    onSelectRace(raceNome);
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

        {/* Título */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold mb-2 border border-amber-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            Galeria Oficial de Raças D&D 5e & Retratos Ilustrados
          </div>
          <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            Seletor de Raça com Características Básicas
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Escolha sua herança ancestral para definir deslocamento, visão no escuro, bônus de atributos e habilidades nativas.
          </p>
        </div>

        {/* Seletor Rápido de Raças (Carrossel / Chips) */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-6 scrollbar-thin">
          {RACES_CATALOG.map(race => {
            const isSelected = currentRace.nome === race.nome;
            return (
              <button
                key={race.nome}
                onClick={() => setCurrentRace(race)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer shrink-0 border ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/20'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <span>{race.nome}</span>
                {selectedRace === race.nome && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-950/40 text-amber-950 font-extrabold">
                    Atual
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Detalhe da Raça Selecionada */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Imagem Ilustrada da Raça */}
          <div className="md:col-span-5 space-y-3">
            <div className="relative rounded-2xl overflow-hidden border-2 border-slate-700 aspect-square shadow-2xl bg-slate-950 flex items-center justify-center">
              {currentRace.imagePath && !imageErrors[currentRace.nome] ? (
                <img
                  src={currentRace.imagePath}
                  alt={`Retrato oficial da raça ${currentRace.nome}`}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  onError={() => setImageErrors(prev => ({ ...prev, [currentRace.nome]: true }))}
                />
              ) : (
                <div
                  className="w-48 h-48 p-4 flex items-center justify-center"
                  dangerouslySetInnerHTML={{ __html: currentRace.iconSvg }}
                />
              )}

              <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent">
                <span className="text-lg font-black text-white">{currentRace.nome}</span>
                <span className="block text-[11px] text-amber-400 font-semibold">{currentRace.bonusAtributo}</span>
              </div>
            </div>

            <button
              onClick={() => handleConfirmRace(currentRace.nome)}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-black text-sm transition shadow-lg shadow-amber-500/20 cursor-pointer flex items-center justify-center gap-2"
            >
              <UserCheck className="w-4 h-4" />
              Definir {currentRace.nome} como Raça do Personagem
            </button>
          </div>

          {/* Ficha de Características Básicas D&D 5e */}
          <div className="md:col-span-7 space-y-4">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <h4 className="text-base font-bold text-white mb-1">Descrição & Lore</h4>
              <p className="text-xs text-slate-300 leading-relaxed">{currentRace.descricao}</p>
            </div>

            {/* Painel de Estatísticas Físicas Básicas */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="block text-[10px] text-slate-400 uppercase font-semibold flex items-center justify-center gap-1">
                  <Footprints className="w-3 h-3 text-emerald-400" /> Deslocamento
                </span>
                <span className="text-base font-black font-mono text-emerald-400">{currentRace.deslocamento}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="block text-[10px] text-slate-400 uppercase font-semibold flex items-center justify-center gap-1">
                  <Eye className="w-3 h-3 text-cyan-400" /> Visão Escuro
                </span>
                <span className="text-base font-black font-mono text-cyan-400">
                  {currentRace.visaoNoEscuro ? '18 metros' : 'Não possui'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="block text-[10px] text-slate-400 uppercase font-semibold flex items-center justify-center gap-1">
                  <Shield className="w-3 h-3 text-indigo-400" /> Porte
                </span>
                <span className="text-base font-black font-mono text-indigo-400">{currentRace.tamanho}</span>
              </div>
            </div>

            {/* Lista das 4 Características Básicas */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Características Raciais Oficiais:
              </h4>

              <div className="space-y-2">
                {currentRace.caracteristicasBasicas?.map((trait, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 leading-relaxed flex items-start gap-2.5"
                  >
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{trait}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
