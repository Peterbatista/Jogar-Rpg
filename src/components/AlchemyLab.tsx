import React, { useState } from 'react';
import {
  ChemicalElement,
  AlchemyPotion,
  CharacterSheet,
  TemporaryBuff,
  InventoryItem,
  SynthesizedCompound,
} from '../types/rpg';
import { PERIODIC_ELEMENTS } from '../data/periodicTable';
import { ALCHEMY_POTIONS } from '../data/alchemyRecipes';
import { SYNTHESIS_FORMULAS, SynthesisFormula } from '../data/synthesisRecipes';
import { playAlchemyBrewSound, playCriticalSuccessSound } from '../utils/audio';
import { DiceRollerModal } from './DiceRollerModal';
import { getAttributeModifier } from '../utils/dndMath';
import { useDiceRoll } from '../context/DiceRollContext';
import {
  FlaskConical,
  Atom,
  Sparkles,
  Flame,
  Check,
  Plus,
  Info,
  Clock,
  ShieldAlert,
  ArrowRight,
  PackagePlus,
  SlidersHorizontal,
  Zap,
  Trash2,
  RefreshCw,
  Layers,
  Dices,
} from 'lucide-react';

interface AlchemyLabProps {
  character: CharacterSheet;
  onUpdateCharacter: (updater: (prev: CharacterSheet) => CharacterSheet) => void;
}

export const AlchemyLab: React.FC<AlchemyLabProps> = ({ character, onUpdateCharacter }) => {
  const { recordRoll } = useDiceRoll();
  const [labMode, setLabMode] = useState<'pocoes' | 'sintese'>('sintese');
  const [selectedElement, setSelectedElement] = useState<ChemicalElement | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('Todos');
  const [searchElement, setSearchElement] = useState('');

  // Potion brewing state
  const [brewingPotionId, setBrewingPotionId] = useState<string | null>(null);
  const [brewCountdown, setBrewCountdown] = useState<number>(0);
  const [d20ModalOpen, setD20ModalOpen] = useState(false);
  const [pendingPotion, setPendingPotion] = useState<AlchemyPotion | null>(null);

  // Atomic Synthesis Chamber state
  const [synthesisSlots, setSynthesisSlots] = useState<{ element: ChemicalElement; quantity: number }[]>([
    { element: PERIODIC_ELEMENTS[0], quantity: 2 }, // 2x H
    { element: PERIODIC_ELEMENTS[5], quantity: 1 }, // 1x O
  ]);
  const [isFusing, setIsFusing] = useState(false);
  const [fusionSuccessData, setFusionSuccessData] = useState<SynthesizedCompound | null>(null);

  const categories = [
    'Todos',
    'Não-Metais',
    'Metais de Transição',
    'Metais Alcalinos',
    'Metais Alcalinoterrosos',
    'Semimetais',
    'Gases Nobres',
    'Lantanídeos/Actinídeos',
  ];

  const filteredElements = PERIODIC_ELEMENTS.filter(elem => {
    const matchCat = activeCategory === 'Todos' || elem.categoria === activeCategory;
    const matchSearch =
      elem.nome.toLowerCase().includes(searchElement.toLowerCase()) ||
      elem.simbolo.toLowerCase().includes(searchElement.toLowerCase()) ||
      elem.runaAlquimica.includes(searchElement) ||
      elem.nomeRuna.toLowerCase().includes(searchElement.toLowerCase());
    return matchCat && matchSearch;
  });

  const intMod = getAttributeModifier(character.atributos.inteligencia);

  const handleCollectSample = (simbolo: string) => {
    onUpdateCharacter(prev => ({
      ...prev,
      elementosEstoque: {
        ...prev.elementosEstoque,
        [simbolo]: (prev.elementosEstoque[simbolo] || 0) + 2,
      },
      conquistas: prev.conquistas.map(c => {
        if (c.id === 'ach_tabela_periodica') {
          const uniqueCount = Object.keys(prev.elementosEstoque).length;
          return {
            ...c,
            progressoAtual: uniqueCount,
            desbloqueada: uniqueCount >= c.progressoAlvo,
          };
        }
        return c;
      }),
    }));
  };

  const handleAddToChamber = (elem: ChemicalElement) => {
    setSynthesisSlots(prev => {
      const existingIdx = prev.findIndex(s => s.element.simbolo === elem.simbolo);
      if (existingIdx >= 0) {
        const next = [...prev];
        next[existingIdx] = { ...next[existingIdx], quantity: next[existingIdx].quantity + 1 };
        return next;
      }
      if (prev.length >= 4) {
        alert('A câmara suporta no máximo 4 elementos simultâneos para manter o confinamento rúnico estável.');
        return prev;
      }
      return [...prev, { element: elem, quantity: 1 }];
    });
    setLabMode('sintese');
  };

  const handleRemoveFromChamber = (simbolo: string) => {
    setSynthesisSlots(prev => prev.filter(s => s.element.simbolo !== simbolo));
  };

  const handleSetChamberQty = (simbolo: string, delta: number) => {
    setSynthesisSlots(prev =>
      prev
        .map(s => {
          if (s.element.simbolo === simbolo) {
            const nextQty = s.quantity + delta;
            return nextQty > 0 ? { ...s, quantity: nextQty } : null;
          }
          return s;
        })
        .filter(Boolean) as { element: ChemicalElement; quantity: number }[]
    );
  };

  const handleLoadFormula = (formula: SynthesisFormula) => {
    const newSlots = formula.reagentesNecessarios.map(req => {
      const elem = PERIODIC_ELEMENTS.find(e => e.simbolo === req.simbolo) || PERIODIC_ELEMENTS[0];
      return { element: elem, quantity: req.quantidade };
    });
    setSynthesisSlots(newSlots);
    setLabMode('sintese');
  };

  // Calculations for current atomic synthesis
  const totalProtons = synthesisSlots.reduce((sum, s) => sum + s.element.protons * s.quantity, 0);
  const totalEletrons = synthesisSlots.reduce((sum, s) => sum + s.element.eletrons * s.quantity, 0);
  const totalNeutrons = synthesisSlots.reduce((sum, s) => sum + s.element.neutrons * s.quantity, 0);
  const totalMass = synthesisSlots.reduce((sum, s) => sum + s.element.massaAtomica * s.quantity, 0);

  // Execute Atomic Fusion & Chemical Synthesis
  const handleStartSynthesis = () => {
    if (synthesisSlots.length < 2) {
      alert('Selecione pelo menos 2 elementos químicos para iniciar a reação de transmutação.');
      return;
    }

    // Check stock
    const missingElements = synthesisSlots.filter(
      s => (character.elementosEstoque[s.element.simbolo] || 0) < s.quantity
    );
    if (missingElements.length > 0) {
      const missingList = missingElements.map(m => `${m.quantity}x ${m.element.simbolo}`).join(', ');
      alert(`Estoque insuficiente de reagentes: você precisa coletar [ ${missingList} ] na Tabela Periódica.`);
      return;
    }

    setIsFusing(true);
    setFusionSuccessData(null);
    playAlchemyBrewSound();

    // Deduct reagents from character inventory
    onUpdateCharacter(prev => {
      const nextStock = { ...prev.elementosEstoque };
      synthesisSlots.forEach(s => {
        nextStock[s.element.simbolo] = Math.max(0, (nextStock[s.element.simbolo] || 0) - s.quantity);
      });
      return { ...prev, elementosEstoque: nextStock };
    });

    // Simulate orbital fusion particle animation for 3.5 seconds
    setTimeout(() => {
      // Roll D20 for stability
      const d20 = Math.floor(Math.random() * 20) + 1;
      const totalCheck = d20 + intMod;
      const isCrit = d20 === 20;
      const isFail = d20 === 1;

      // Identify matching formula or generate custom transmutated compound
      const matchingFormula = SYNTHESIS_FORMULAS.find(f => {
        if (f.reagentesNecessarios.length !== synthesisSlots.length) return false;
        return f.reagentesNecessarios.every(req => {
          const slot = synthesisSlots.find(s => s.element.simbolo === req.simbolo);
          return slot && slot.quantity === req.quantidade;
        });
      });

      const symbolsSummary = synthesisSlots.map(s => `${s.quantity > 1 ? s.quantity : ''}${s.element.simbolo}`).join('');
      const runesSummary = synthesisSlots.map(s => s.element.runaAlquimica).join(' ');

      let compound: SynthesizedCompound;

      if (matchingFormula) {
        compound = {
          id: 'comp_' + Date.now(),
          nome: matchingFormula.nome,
          descricao: matchingFormula.descricao,
          elementosUsados: synthesisSlots.map(s => ({ simbolo: s.element.simbolo, quantidade: s.quantity })),
          totalProtons,
          totalEletrons,
          totalNeutrons,
          massaTotal: totalMass,
          raridade: isCrit ? 'Lendário' : matchingFormula.raridade,
          tipo: matchingFormula.tipo,
          efeitoDescricao: matchingFormula.efeitoDescricao + (isCrit ? ' [POTÊNCIA DOBRADA POR CRÍTICO!]' : ''),
          icone: matchingFormula.icone,
          buff: matchingFormula.buff,
        };
      } else {
        const isRare = totalMass > 150 || isCrit;
        compound = {
          id: 'custom_comp_' + Date.now(),
          nome: `Composto Rúnico ${symbolsSummary} (${runesSummary})`,
          descricao: `Substância alquímica transmutada na câmara rúnica. Fusão de ${synthesisSlots.length} elementos atômicos com massa molecular ${totalMass.toFixed(2)} u.`,
          elementosUsados: synthesisSlots.map(s => ({ simbolo: s.element.simbolo, quantidade: s.quantity })),
          totalProtons,
          totalEletrons,
          totalNeutrons,
          massaTotal: totalMass,
          raridade: isCrit ? 'Lendário' : isRare ? 'Raro' : 'Incomum',
          tipo: totalProtons % 2 === 0 ? 'liga_metalica' : 'elixir',
          efeitoDescricao: `Composto estável com ${totalProtons} prótons e ${totalNeutrons} nêutrons. Confere +${isCrit ? 3 : 2} em testes de perícia por 30 minutos.`,
          icone: totalProtons % 2 === 0 ? '🔮' : '⚗️',
          buff: {
            atributo: 'inteligencia',
            valor: isCrit ? 3 : 2,
            duracaoMinutos: 30,
          },
        };
      }

      // Add to character inventory
      const newItem: InventoryItem = {
        id: compound.id,
        nome: compound.nome,
        tipo: compound.tipo === 'liga_metalica' ? 'outro' : 'pocao',
        quantidade: isCrit ? 2 : 1,
        pesoKg: Math.max(0.2, Number((totalMass / 100).toFixed(1))),
        valorPO: Math.round(totalMass * 0.8) + (isCrit ? 100 : 20),
        raridade: compound.raridade,
        descricao: `${compound.descricao} [Efeito: ${compound.efeitoDescricao}]`,
        equipavel: compound.tipo === 'liga_metalica',
      };

      onUpdateCharacter(prev => {
        const xpEarned = Math.round(totalMass * 0.5) + (isCrit ? 60 : 30);
        return {
          ...prev,
          experiencia: prev.experiencia + xpEarned,
          inventario: [newItem, ...prev.inventario],
          estatisticas: {
            ...prev.estatisticas,
            pocoesCriadas: (prev.estatisticas?.pocoesCriadas || 0) + 1,
          },
        };
      });

      // Record Roll to Global Dice Context
      recordRoll({
        acao: `Fusão Atômica: ${compound.nome}`,
        dadoBase: 'd20',
        rolagemNatural: d20,
        modificador: intMod,
        total: totalCheck,
        cdOuCa: 12,
        isCritico: isCrit,
        isFalhaCritica: isFail,
        sucesso: totalCheck >= 12 || isCrit,
        detalhes: isCrit
          ? `Fusão Perfeita! Rendimento atômico duplicado com massa molecular ${totalMass.toFixed(2)} u!`
          : isFail
          ? 'Reação instável contida pelo selo hermético.'
          : `Reação de transmutação estabilizada com sucesso. Item adicionado ao inventário!`,
      });

      setIsFusing(false);
      setFusionSuccessData(compound);
      playCriticalSuccessSound();
    }, 3200);
  };

  // Potion start
  const startBrewing = (potion: AlchemyPotion) => {
    const hasEnough = potion.elementosNecessarios.every(
      req => (character.elementosEstoque[req.simbolo] || 0) >= req.quantidade
    );
    if (!hasEnough) {
      alert('Você não possui elementos químicos suficientes para esta fórmula.');
      return;
    }

    setPendingPotion(potion);
    setD20ModalOpen(true);
  };

  const handleBrewDiceResult = (naturalRoll: number, _total: number, isCrit: boolean, isFail: boolean) => {
    if (!pendingPotion) return;
    const potion = pendingPotion;

    // Deduct elements
    onUpdateCharacter(prev => {
      const nextStock = { ...prev.elementosEstoque };
      potion.elementosNecessarios.forEach(req => {
        nextStock[req.simbolo] = Math.max(0, (nextStock[req.simbolo] || 0) - req.quantidade);
      });
      return { ...prev, elementosEstoque: nextStock };
    });

    setBrewingPotionId(potion.id);
    const duration = Math.min(8, potion.tempoPreparoSegundos);
    setBrewCountdown(duration);
    playAlchemyBrewSound();

    const interval = setInterval(() => {
      setBrewCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setBrewingPotionId(null);
          finishBrewing(potion, isCrit, isFail);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const finishBrewing = (potion: AlchemyPotion, isCrit: boolean, isFail: boolean) => {
    const bonusMultiplier = isCrit ? 2 : 1;
    const qtyCreated = 1 * bonusMultiplier;

    const newItem: InventoryItem = {
      id: 'pocao_' + Date.now(),
      nome: potion.nome,
      tipo: 'pocao',
      quantidade: qtyCreated,
      pesoKg: 0.5 * qtyCreated,
      valorPO: potion.nivelRequerido * 25,
      raridade: potion.tipo === 'lendario' ? 'Lendário' : potion.nivelRequerido >= 4 ? 'Raro' : 'Incomum',
      descricao: potion.descricao + ` (${potion.efeitoDescricao})`,
      pocaoRefId: potion.id,
    };

    onUpdateCharacter(prev => {
      const xpGained = potion.nivelRequerido * 40 + (isCrit ? 50 : 0);
      const updatedInv = [...prev.inventario];
      const existingIdx = updatedInv.findIndex(i => i.nome === potion.nome && i.tipo === 'pocao');
      if (existingIdx >= 0) {
        updatedInv[existingIdx] = {
          ...updatedInv[existingIdx],
          quantidade: updatedInv[existingIdx].quantidade + qtyCreated,
          pesoKg: updatedInv[existingIdx].pesoKg + 0.5 * qtyCreated,
        };
      } else {
        updatedInv.unshift(newItem);
      }

      return {
        ...prev,
        experiencia: prev.experiencia + xpGained,
        inventario: updatedInv,
        estatisticas: {
          ...prev.estatisticas,
          pocoesCriadas: (prev.estatisticas?.pocoesCriadas || 0) + 1,
        },
      };
    });

    playCriticalSuccessSound();
  };

  const handleConsumePotionDirectly = (potion: AlchemyPotion) => {
    if (!potion.efeitoBuff) return;
    const newBuff: TemporaryBuff = {
      id: 'buff_pocao_' + Date.now(),
      nome: potion.nome,
      atributo: potion.efeitoBuff.atributo,
      valor: potion.efeitoBuff.valor,
      duracaoMinutos: potion.efeitoBuff.duracaoMinutos,
      criadoEm: Date.now(),
      origem: 'alquimia',
      descricao: potion.efeitoDescricao,
    };

    onUpdateCharacter(prev => ({
      ...prev,
      buffs: [...prev.buffs, newBuff],
    }));

    alert(`Você consumiu ${potion.nome} diretamente! O bônus temporário foi ativado.`);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* CABEÇALHO DO LABORATÓRIO */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 md:p-8 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-600 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/20">
              <FlaskConical className="w-8 h-8" />
            </div>
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-1 border border-emerald-500/30">
                <Sparkles className="w-3.5 h-3.5" />
                Laboratório Alquímico & Codex Elementalis
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                Transmutação Rúnica & Caldeirão Hermético
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Fusão de elementos químicos com base em prótons, elétrons, nêutrons e runas ancestrais para criar poções e ligas mágicas.
              </p>
            </div>
          </div>

          {/* Alternador de Modo */}
          <div className="flex p-1.5 rounded-2xl bg-slate-950 border border-slate-800 shrink-0">
            <button
              onClick={() => setLabMode('sintese')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                labMode === 'sintese'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Atom className="w-4 h-4" />
              Câmara de Síntese Rúnica
            </button>
            <button
              onClick={() => setLabMode('pocoes')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                labMode === 'pocoes'
                  ? 'bg-gradient-to-r from-emerald-600 to-amber-600 text-white shadow-lg shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FlaskConical className="w-4 h-4" />
              Caldeirão de Poções
            </button>
          </div>
        </div>
      </div>

      {/* SEÇÃO PRINCIPAL: CÂMARA DE SÍNTESE OU CALDEIRÃO DE POÇÕES */}
      {labMode === 'sintese' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* PAINEL DA CÂMARA DE SÍNTESE COM ANIMAÇÃO DOS ÁTOMOS */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-slate-900 rounded-3xl border border-cyan-500/30 p-6 shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Atom className="w-5 h-5 text-cyan-400 animate-spin-slow" />
                  <h3 className="font-bold text-lg text-white">Reator de Fusão Molecular & Rúnica</h3>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-500/30 font-mono font-bold">
                  {synthesisSlots.length}/4 Elementos
                </span>
              </div>

              {/* ANIMAÇÃO VISUAL DA COMBINAÇÃO DOS ÁTOMOS EM ÓRBITA */}
              <div className="my-6 relative h-64 md:h-72 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden">
                {/* Grade estelar de fundo */}
                <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />

                {/* Círculos Rúnicos & Orbitais Atômicos Animados */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 400 300">
                  <circle
                    cx="200"
                    cy="150"
                    r="105"
                    stroke="#0891b2"
                    strokeWidth="1.5"
                    strokeDasharray="6 6"
                    fill="none"
                    className="opacity-40 animate-[spin_20s_linear_infinite]"
                  />
                  <circle
                    cx="200"
                    cy="150"
                    r="75"
                    stroke="#a855f7"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                    fill="none"
                    className="opacity-50 animate-[spin_12s_linear_infinite_reverse]"
                  />
                  <circle
                    cx="200"
                    cy="150"
                    r="45"
                    stroke="#eab308"
                    strokeWidth="1.5"
                    strokeDasharray="2 3"
                    fill="none"
                    className="opacity-60 animate-[spin_7s_linear_infinite]"
                  />

                  {/* Arcos de Conexão de Plasma entre os Átomos Selecionados */}
                  {synthesisSlots.map((_, idx) => {
                    const angle = (idx * (360 / Math.max(1, synthesisSlots.length)) * Math.PI) / 180;
                    const x = 200 + 85 * Math.cos(angle);
                    const y = 150 + 85 * Math.sin(angle);
                    return (
                      <line
                        key={idx}
                        x1="200"
                        y1="150"
                        x2={x}
                        y2={y}
                        stroke="#38bdf8"
                        strokeWidth="2"
                        strokeDasharray="4 2"
                        className="opacity-75 animate-pulse"
                      />
                    );
                  })}
                </svg>

                {/* NÚCLEO CENTRAL DE REAÇÃO (O Caldeirão Quântico) */}
                <div className="relative z-10 w-24 h-24 rounded-full bg-gradient-to-tr from-cyan-600 via-indigo-600 to-amber-500 p-1 shadow-[0_0_50px_rgba(6,182,212,0.5)] flex items-center justify-center animate-pulse">
                  <div className="w-full h-full rounded-full bg-slate-950 flex flex-col items-center justify-center text-center p-2">
                    <span className="text-xl font-black text-amber-300 font-mono">
                      {isFusing ? '⚡' : synthesisSlots.map(s => s.element.runaAlquimica).join('') || 'ᚱ'}
                    </span>
                    <span className="text-[9px] text-cyan-300 font-bold font-mono">
                      {totalMass.toFixed(1)} u
                    </span>
                  </div>
                </div>

                {/* ÁTOMOS ORBITANDO AO REDOR DO NÚCLEO */}
                {synthesisSlots.map((slot, idx) => {
                  const totalSlots = synthesisSlots.length;
                  const angle = (idx * (360 / totalSlots) * Math.PI) / 180;
                  const radius = 85;
                  const posX = Math.cos(angle) * radius;
                  const posY = Math.sin(angle) * radius;

                  return (
                    <div
                      key={slot.element.simbolo + idx}
                      className={`absolute z-20 w-14 h-14 rounded-2xl border-2 shadow-xl flex flex-col items-center justify-center font-mono cursor-pointer transition-all duration-700 ${
                        isFusing ? 'scale-75 translate-x-0 translate-y-0 opacity-80' : 'hover:scale-110'
                      }`}
                      style={{
                        transform: isFusing ? 'translate(0px, 0px)' : `translate(${posX}px, ${posY}px)`,
                        borderColor: slot.element.corHex,
                        backgroundColor: '#020617',
                        boxShadow: `0 0 15px ${slot.element.corHex}40`,
                      }}
                      title={`${slot.element.nome} - Runa ${slot.element.runaAlquimica}`}
                    >
                      <span className="text-xs font-black" style={{ color: slot.element.corHex }}>
                        {slot.element.simbolo}
                      </span>
                      <span className="text-[10px] text-amber-400 font-bold leading-none">
                        {slot.element.runaAlquimica}
                      </span>
                      <span className="text-[8px] text-slate-400 font-bold">
                        ×{slot.quantity}
                      </span>
                    </div>
                  );
                })}

                {/* Efeito Visual durante a Fusão */}
                {isFusing && (
                  <div className="absolute inset-0 bg-cyan-500/20 backdrop-blur-xs flex flex-col items-center justify-center z-30 animate-in fade-in">
                    <div className="text-4xl animate-bounce">⚡💥⚗️</div>
                    <div className="text-sm font-black text-cyan-300 mt-2 font-mono tracking-widest animate-pulse">
                      COLISÃO ATÔMICA & FUSÃO EM ANDAMENTO...
                    </div>
                  </div>
                )}
              </div>

              {/* Ficha Atômica do Composto a ser Sintetizado */}
              <div className="grid grid-cols-4 gap-2 text-center p-3 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs">
                <div className="p-2 rounded-xl bg-slate-900">
                  <span className="block text-[10px] text-slate-400 uppercase font-semibold">Prótons Totais</span>
                  <span className="text-base font-black text-emerald-400">{totalProtons}</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-900">
                  <span className="block text-[10px] text-slate-400 uppercase font-semibold">Elétrons Totais</span>
                  <span className="text-base font-black text-blue-400">{totalEletrons}</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-900">
                  <span className="block text-[10px] text-slate-400 uppercase font-semibold">Nêutrons Totais</span>
                  <span className="text-base font-black text-amber-400">{totalNeutrons}</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-900">
                  <span className="block text-[10px] text-slate-400 uppercase font-semibold">Massa Total</span>
                  <span className="text-base font-black text-slate-200">{totalMass.toFixed(2)} u</span>
                </div>
              </div>

              {/* Elementos Carregados na Câmara */}
              <div className="mt-4 space-y-2">
                <div className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>Reagentes Confinados na Câmara:</span>
                  <button
                    onClick={() => setSynthesisSlots([])}
                    className="text-[11px] text-red-400 hover:text-red-300 cursor-pointer flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" /> Esvaziar Câmara
                  </button>
                </div>

                <div className="space-y-2">
                  {synthesisSlots.length === 0 ? (
                    <div className="p-4 rounded-xl border border-dashed border-slate-800 text-center text-xs text-slate-500">
                      Nenhum átomo na câmara. Clique em qualquer elemento na Tabela Periódica abaixo para adicioná-lo.
                    </div>
                  ) : (
                    synthesisSlots.map(slot => {
                      const inStock = character.elementosEstoque[slot.element.simbolo] || 0;
                      const hasStock = inStock >= slot.quantity;

                      return (
                        <div
                          key={slot.element.simbolo}
                          className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className="text-sm font-black px-2 py-1 rounded-lg border font-mono"
                              style={{ borderColor: slot.element.corHex, color: slot.element.corHex }}
                            >
                              {slot.element.simbolo}
                            </span>
                            <div>
                              <div className="font-bold text-white flex items-center gap-2">
                                {slot.element.nome}
                                <span className="text-amber-400 font-mono text-sm">
                                  [{slot.element.runaAlquimica}]
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-400">
                                p⁺:{slot.element.protons} | e⁻:{slot.element.eletrons} | n⁰:{slot.element.neutrons} • Estoque:{' '}
                                <strong className={hasStock ? 'text-emerald-400' : 'text-red-400'}>
                                  {inStock}
                                </strong>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <div className="flex items-center bg-slate-900 rounded-lg border border-slate-800 p-0.5">
                              <button
                                onClick={() => handleSetChamberQty(slot.element.simbolo, -1)}
                                className="px-2 py-0.5 text-slate-400 hover:text-white cursor-pointer"
                              >
                                -
                              </button>
                              <span className="px-2 text-xs font-mono font-bold text-white">
                                {slot.quantity}
                              </span>
                              <button
                                onClick={() => handleSetChamberQty(slot.element.simbolo, 1)}
                                className="px-2 py-0.5 text-slate-400 hover:text-white cursor-pointer"
                              >
                                +
                              </button>
                            </div>
                            <button
                              onClick={() => handleRemoveFromChamber(slot.element.simbolo)}
                              className="p-1.5 text-slate-500 hover:text-red-400 cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Botão de Fusão Atômica */}
              <div className="mt-5">
                <button
                  type="button"
                  disabled={isFusing || synthesisSlots.length < 2}
                  onClick={handleStartSynthesis}
                  className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-amber-500 hover:from-cyan-400 text-slate-950 font-black text-sm transition shadow-lg shadow-cyan-500/20 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Zap className="w-4 h-4 text-slate-950" />
                  {isFusing ? 'Fundindo Átomos...' : '⚛️ Iniciar Fusão Alquímica & Síntese Rúnica (d20)'}
                </button>
              </div>

              {/* CARD DE SUCESSO DE TRANSMUTAÇÃO */}
              {fusionSuccessData && (
                <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-emerald-950/70 to-slate-950 border border-emerald-500/50 shadow-xl animate-in zoom-in-95">
                  <div className="flex items-start gap-3">
                    <span className="text-3xl p-2 rounded-xl bg-slate-900 border border-emerald-500/30">
                      {fusionSuccessData.icone}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-emerald-300">{fusionSuccessData.nome}</h4>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                          {fusionSuccessData.raridade}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1">{fusionSuccessData.descricao}</p>
                      <div className="mt-2 text-xs font-semibold text-emerald-400 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Adicionado à Mochila de Inventário!
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* FÓRMULAS CONHECIDAS DE TRANSMUTAÇÃO */}
            <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 shadow-xl">
              <h3 className="font-bold text-base text-white mb-3 flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-400" />
                Matrizes de Transmutação Herméticas (Atalhos de Síntese)
              </h3>
              <div className="space-y-2.5">
                {SYNTHESIS_FORMULAS.map(formula => (
                  <div
                    key={formula.id}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500/40 transition flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="font-bold text-white flex items-center gap-2">
                        <span>{formula.icone}</span>
                        <span>{formula.nome}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{formula.efeitoDescricao}</p>
                    </div>

                    <button
                      onClick={() => handleLoadFormula(formula)}
                      className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 font-bold text-[11px] transition cursor-pointer shrink-0"
                    >
                      Carregar
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* TABELA PERIÓDICA COMPLETA COM RUNAS ALQUÍMICAS EM DESTAQUE */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 shadow-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Atom className="w-5 h-5 text-cyan-400" />
                  <h3 className="font-bold text-lg text-white">Codex Elementalis (Tabela Periódica)</h3>
                </div>
                <div className="text-xs text-slate-400 font-mono">
                  <strong className="text-cyan-400">{PERIODIC_ELEMENTS.length} Elementos</strong> Catalogados
                </div>
              </div>

              {/* Filtro e Categorias */}
              <div className="mt-4 space-y-3">
                <input
                  type="text"
                  placeholder="Buscar por símbolo, nome, runa (ex: ᚺ, Fe, Ouro)..."
                  value={searchElement}
                  onChange={e => setSearchElement(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-cyan-500 transition"
                />
                <div className="flex flex-wrap gap-1.5">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`text-xs px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                        activeCategory === cat
                          ? 'bg-cyan-500 text-slate-950 font-bold'
                          : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* GRID COMPLETO COM RUNA, PRÓTONS, ELÉTRONS, NÊUTRONS E MASSA */}
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[580px] overflow-y-auto pr-1 scrollbar-thin">
                {filteredElements.map(elem => {
                  const stock = character.elementosEstoque[elem.simbolo] || 0;
                  return (
                    <div
                      key={elem.simbolo}
                      onClick={() => setSelectedElement(elem)}
                      className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-400 cursor-pointer transition flex flex-col justify-between group relative overflow-hidden shadow-sm"
                    >
                      <div className="flex items-start justify-between">
                        <span className="text-[10px] font-mono font-bold text-slate-500">Z: {elem.numeroAtomico}</span>
                        {/* RUNA ALQUÍMICA EM DESTAQUE */}
                        <span
                          className="text-sm font-black px-1.5 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono"
                          title={`Runa Alquímica: ${elem.nomeRuna}`}
                        >
                          {elem.runaAlquimica}
                        </span>
                      </div>

                      <div className="my-2 text-center">
                        <span
                          className="text-2xl font-black font-mono tracking-tight group-hover:scale-110 transition-transform inline-block"
                          style={{ color: elem.corHex }}
                        >
                          {elem.simbolo}
                        </span>
                        <div className="text-xs font-semibold text-slate-200 truncate">{elem.nome}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{elem.massaAtomica.toFixed(2)} u</div>
                      </div>

                      {/* Prótons, Elétrons e Nêutrons */}
                      <div className="pt-2 border-t border-slate-900 grid grid-cols-3 text-[10px] font-mono text-center text-slate-400">
                        <div><span className="text-emerald-400 font-bold">p:</span>{elem.protons}</div>
                        <div><span className="text-blue-400 font-bold">e:</span>{elem.eletrons}</div>
                        <div><span className="text-amber-400 font-bold">n:</span>{elem.neutrons}</div>
                      </div>

                      {stock > 0 && (
                        <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/50 text-[9px] font-bold text-cyan-300">
                          Estoque: {stock}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* INSPEÇÃO DO ELEMENTO SELECIONADO */}
            {selectedElement && (
              <div className="bg-slate-900 rounded-3xl border border-cyan-500/40 p-5 shadow-2xl animate-in zoom-in-95 duration-150">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-16 h-16 rounded-2xl flex flex-col items-center justify-center font-mono border-2 shadow-inner"
                      style={{ borderColor: selectedElement.corHex, backgroundColor: '#020617' }}
                    >
                      <span className="text-2xl font-black" style={{ color: selectedElement.corHex }}>
                        {selectedElement.simbolo}
                      </span>
                      <span className="text-xs text-amber-400 font-bold">{selectedElement.runaAlquimica}</span>
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-white flex items-center gap-2">
                        {selectedElement.nome}
                        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium">
                          {selectedElement.categoria}
                        </span>
                      </h4>
                      <p className="text-xs text-amber-300 mt-0.5 font-medium">
                        Runa Alquímica: <strong>{selectedElement.nomeRuna} ({selectedElement.runaAlquimica})</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      type="button"
                      onClick={() => handleAddToChamber(selectedElement)}
                      className="px-3 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-xs font-bold transition flex items-center gap-1.5 shadow-md cursor-pointer"
                    >
                      <Atom className="w-3.5 h-3.5" /> Adicionar à Câmara
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCollectSample(selectedElement.simbolo)}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1.5 shadow-md cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> +2 Amostras
                    </button>
                  </div>
                </div>

                {/* Painel com Prótons, Elétrons, Nêutrons e Massa Atômica */}
                <div className="mt-4 grid grid-cols-4 gap-2 text-center p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono">
                  <div className="p-2 rounded-lg bg-slate-900/60">
                    <span className="block text-[10px] text-slate-400 uppercase font-semibold">Prótons (p⁺)</span>
                    <span className="text-base font-bold text-emerald-400">{selectedElement.protons}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900/60">
                    <span className="block text-[10px] text-slate-400 uppercase font-semibold">Elétrons (e⁻)</span>
                    <span className="text-base font-bold text-blue-400">{selectedElement.eletrons}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900/60">
                    <span className="block text-[10px] text-slate-400 uppercase font-semibold">Nêutrons (n⁰)</span>
                    <span className="text-base font-bold text-amber-400">{selectedElement.neutrons}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900/60">
                    <span className="block text-[10px] text-slate-400 uppercase font-semibold">Massa Atômica</span>
                    <span className="text-base font-bold text-slate-200">{selectedElement.massaAtomica} u</span>
                  </div>
                </div>

                <div className="mt-4 space-y-2 text-xs">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <strong className="text-amber-400 block mb-0.5">Propriedade Alquímica Hermética:</strong>
                    <span className="text-slate-300">{selectedElement.propriedadeAlquimica}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <strong className="text-indigo-400 block mb-0.5">Ressonância no RPG:</strong>
                    <span className="text-slate-300">{selectedElement.ressonanciaMagica}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ABA DO CALDEIRÃO TRADICIONAL DE POÇÕES */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 shadow-xl">
              <h3 className="font-bold text-base text-white mb-2 flex items-center gap-2">
                <FlaskConical className="w-5 h-5 text-emerald-400" />
                Fórmulas de Poções por Nível
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Destile poções de cura, bônus temporários e elixires lendários para o seu inventário.
              </p>

              {brewingPotionId && (
                <div className="mb-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/40 text-center space-y-2 animate-pulse">
                  <div className="inline-flex items-center gap-2 text-amber-400 font-bold text-sm">
                    <Flame className="w-4 h-4 animate-bounce text-amber-500" />
                    Destilando Reagentes Químicos...
                  </div>
                  <div className="text-3xl font-extrabold font-mono text-amber-300">{brewCountdown}s</div>
                </div>
              )}

              <div className="space-y-3">
                {ALCHEMY_POTIONS.map(potion => {
                  const canBrew = character.nivel >= potion.nivelRequerido;
                  const hasIngredients = potion.elementosNecessarios.every(
                    req => (character.elementosEstoque[req.simbolo] || 0) >= req.quantidade
                  );

                  return (
                    <div
                      key={potion.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        canBrew ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-950/30 border-slate-900 opacity-60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl p-2 rounded-xl bg-slate-900 border border-slate-800">{potion.icone}</span>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-sm text-white">{potion.nome}</h4>
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                                Nv. {potion.nivelRequerido}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5">{potion.descricao}</p>
                            <div className="mt-1 text-xs font-medium text-emerald-400">
                              Efeito: {potion.efeitoDescricao}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-medium text-slate-400">Reagentes:</span>
                        {potion.elementosNecessarios.map(req => {
                          const inStock = character.elementosEstoque[req.simbolo] || 0;
                          const ok = inStock >= req.quantidade;
                          return (
                            <span
                              key={req.simbolo}
                              className={`inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-md border ${
                                ok
                                  ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30'
                                  : 'bg-red-950/40 text-red-300 border-red-500/30'
                              }`}
                            >
                              <strong>{req.simbolo}</strong>: {inStock}/{req.quantidade}
                            </span>
                          );
                        })}
                      </div>

                      <div className="mt-3 flex items-center justify-between gap-2">
                        <div className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> {potion.tempoPreparoSegundos}s • CD {potion.cdAlquimica}
                        </div>
                        <div className="flex gap-2">
                          {potion.efeitoBuff && (
                            <button
                              type="button"
                              onClick={() => handleConsumePotionDirectly(potion)}
                              className="text-xs py-1.5 px-3 rounded-xl bg-indigo-950/60 hover:bg-indigo-900 text-indigo-300 border border-indigo-500/30 font-medium transition cursor-pointer"
                            >
                              Consumir Buff
                            </button>
                          )}
                          <button
                            type="button"
                            disabled={!canBrew || !hasIngredients || !!brewingPotionId}
                            onClick={() => startBrewing(potion)}
                            className="text-xs py-1.5 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:pointer-events-none text-slate-950 font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md"
                          >
                            <FlaskConical className="w-3.5 h-3.5" />
                            Destilar
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 bg-slate-900 rounded-3xl border border-slate-800 p-6 shadow-xl">
            <h3 className="font-bold text-base text-white mb-3 flex items-center gap-2">
              <Atom className="w-4 h-4 text-cyan-400" />
              Estoque de Elementos Químicos Coletados
            </h3>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5">
              {Object.entries(character.elementosEstoque).map(([sym, qtd]) => {
                const elem = PERIODIC_ELEMENTS.find(e => e.simbolo === sym);
                return (
                  <div
                    key={sym}
                    onClick={() => {
                      if (elem) {
                        setSelectedElement(elem);
                        setLabMode('sintese');
                      }
                    }}
                    className="p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-cyan-500/50 cursor-pointer text-center transition group shadow-sm"
                  >
                    <span className="block text-sm font-mono font-bold text-cyan-300 group-hover:scale-110 transition-transform">
                      {sym}
                    </span>
                    <span className="block text-[11px] text-amber-400 font-mono">{elem?.runaAlquimica || ''}</span>
                    <span className="block text-[10px] text-slate-400 truncate">{elem?.nome || sym}</span>
                    <span className="inline-block mt-1 text-xs font-bold text-emerald-400">×{qtd}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Rolagem D20 para Maestria Alquímica */}
      {d20ModalOpen && pendingPotion && (
        <DiceRollerModal
          isOpen={d20ModalOpen}
          onClose={() => setD20ModalOpen(false)}
          actionTitle={`Destilação Alquímica: ${pendingPotion.nome}`}
          modifier={intMod}
          dcTarget={pendingPotion.cdAlquimica}
          onResult={(natRoll, total, isCrit, isFail) => {
            setD20ModalOpen(false);
            handleBrewDiceResult(natRoll, total, isCrit, isFail);
          }}
        />
      )}
    </div>
  );
};
