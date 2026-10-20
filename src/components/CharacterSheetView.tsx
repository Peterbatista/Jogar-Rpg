import React, { useState } from 'react';
import { CharacterSheet, CharacterClass, CharacterRace } from '../types/rpg';
import { CLASSES_CATALOG, RACES_CATALOG } from '../data/classesAndRaces';
import { WEAPONS_CATALOG, WeaponDefinition } from '../data/weaponsCatalog';
import { CLASS_LEVEL_UP_TRIALS } from '../data/classTrials';
import { getAttributeModifier, formatModifier, getProficiencyBonus, getEffectiveAttributes } from '../utils/dndMath';
import { DiceRollerModal } from './DiceRollerModal';
import { RaceShowcaseModal } from './RaceShowcaseModal';
import { ClassShowcaseModal } from './ClassShowcaseModal';
import { useDiceRoll } from '../context/DiceRollContext';
import confetti from 'canvas-confetti';
import {
  Shield,
  Heart,
  Zap,
  Sparkles,
  Swords,
  Scroll,
  Edit3,
  Dices,
  BookOpen,
  Award,
  Plus,
  Minus,
  UserCheck,
  CheckCircle2,
  X,
  Target,
  Flame,
  ArrowRight,
  Crosshair,
} from 'lucide-react';

interface CharacterSheetViewProps {
  character: CharacterSheet;
  onUpdateCharacter: (updater: (prev: CharacterSheet) => CharacterSheet) => void;
}

export const CharacterSheetView: React.FC<CharacterSheetViewProps> = ({
  character,
  onUpdateCharacter,
}) => {
  const { recordRoll } = useDiceRoll();
  const [d20ModalOpen, setD20ModalOpen] = useState(false);
  const [raceModalOpen, setRaceModalOpen] = useState(false);
  const [classModalOpen, setClassModalOpen] = useState(false);
  const [levelUpModalOpen, setLevelUpModalOpen] = useState(false);
  const [armoryModalOpen, setArmoryModalOpen] = useState(false);

  const [testTitle, setTestTitle] = useState('');
  const [testModifier, setTestModifier] = useState(0);
  const [testDc, setTestDc] = useState<number | undefined>(undefined);
  const [raceImageError, setRaceImageError] = useState(false);

  const currentClassInfo = CLASSES_CATALOG.find(c => c.nome === character.classe) || CLASSES_CATALOG[0];
  const currentRaceInfo = RACES_CATALOG.find(r => r.nome === character.raca) || RACES_CATALOG[0];
  const classTrial = CLASS_LEVEL_UP_TRIALS[character.classe] || CLASS_LEVEL_UP_TRIALS['Guerreiro'];

  const profBonus = getProficiencyBonus(character.nivel);
  const { effective, bonusMap } = getEffectiveAttributes(character.atributos, character.buffs);

  // Equipped weapons from inventory or default arsenal
  const equippedWeapons = WEAPONS_CATALOG.filter(w => {
    // Check if weapon is in inventory and equipped
    const inInv = character.inventario.find(i => i.nome.toLowerCase().includes(w.nome.toLowerCase()));
    if (inInv) return inInv.equipado !== false;
    // Default starting weapon based on class
    if (character.classe === 'Mago' || character.classe === 'Bruxo' || character.classe === 'Artífice') {
      return w.id === 'arma_cajado_arcano' || w.id === 'arma_adaga_alquimica';
    }
    if (character.classe === 'Ladino') {
      return w.id === 'arma_rapieira' || w.id === 'arma_arco_longo';
    }
    return w.id === 'arma_espada_longa' || w.id === 'arma_machado_batalha';
  });

  const attrList = [
    { key: 'forca' as const, label: 'Força', abbr: 'FOR', value: effective.forca, base: character.atributos.forca, bonus: bonusMap.forca },
    { key: 'destreza' as const, label: 'Destreza', abbr: 'DES', value: effective.destreza, base: character.atributos.destreza, bonus: bonusMap.destreza },
    { key: 'constituicao' as const, label: 'Constituição', abbr: 'CON', value: effective.constituicao, base: character.atributos.constituicao, bonus: bonusMap.constituicao },
    { key: 'inteligencia' as const, label: 'Inteligência', abbr: 'INT', value: effective.inteligencia, base: character.atributos.inteligencia, bonus: bonusMap.inteligencia },
    { key: 'sabedoria' as const, label: 'Sabedoria', abbr: 'SAB', value: effective.sabedoria, base: character.atributos.sabedoria, bonus: bonusMap.sabedoria },
    { key: 'carisma' as const, label: 'Carisma', abbr: 'CAR', value: effective.carisma, base: character.atributos.carisma, bonus: bonusMap.carisma },
  ];

  const skillsList = [
    { nome: 'Acrobacia', attr: 'destreza' as const },
    { nome: 'Arcanismo', attr: 'inteligencia' as const },
    { nome: 'Atletismo', attr: 'forca' as const },
    { nome: 'Atuação', attr: 'carisma' as const },
    { nome: 'Blefar', attr: 'carisma' as const },
    { nome: 'Furtividade', attr: 'destreza' as const },
    { nome: 'História', attr: 'inteligencia' as const },
    { nome: 'Intimidação', attr: 'carisma' as const },
    { nome: 'Intuição', attr: 'sabedoria' as const },
    { nome: 'Investigação', attr: 'inteligencia' as const },
    { nome: 'Lidar com Animais', attr: 'sabedoria' as const },
    { nome: 'Medicina', attr: 'sabedoria' as const },
    { nome: 'Natureza', attr: 'inteligencia' as const },
    { nome: 'Percepção', attr: 'sabedoria' as const },
    { nome: 'Persuasão', attr: 'carisma' as const },
    { nome: 'Prestidigitação', attr: 'destreza' as const },
    { nome: 'Religião', attr: 'inteligencia' as const },
    { nome: 'Sobrevivência', attr: 'sabedoria' as const },
  ];

  const handleRollAttribute = (label: string, mod: number) => {
    setTestTitle(`Teste de Atributo: ${label}`);
    setTestModifier(mod);
    setTestDc(undefined);
    setD20ModalOpen(true);
  };

  const handleRollSkill = (skillName: string, attrKey: keyof CharacterSheet['atributos']) => {
    const mod = getAttributeModifier(effective[attrKey]);
    setTestTitle(`Perícia: ${skillName} (${attrKey.toUpperCase()})`);
    setTestModifier(mod);
    setTestDc(undefined);
    setD20ModalOpen(true);
  };

  const handleWeaponAttack = (weapon: WeaponDefinition) => {
    const isFinesse = weapon.propriedades.includes('Acuidade');
    const isRanged = weapon.categoria === 'Marcial' && weapon.nome.includes('Arco');
    const attrToUse = isRanged || (isFinesse && effective.destreza > effective.forca) ? effective.destreza : effective.forca;
    const mod = getAttributeModifier(attrToUse) + profBonus;

    setTestTitle(`Ataque com ${weapon.nome}`);
    setTestModifier(mod);
    setTestDc(14); // Standard enemy AC
    setD20ModalOpen(true);
  };

  const handleWeaponDamage = (weapon: WeaponDefinition) => {
    const isFinesse = weapon.propriedades.includes('Acuidade');
    const attrToUse = isFinesse && effective.destreza > effective.forca ? effective.destreza : effective.forca;
    const mod = getAttributeModifier(attrToUse);

    // Roll damage dice (e.g. 1d8, 1d6, 1d4)
    const diceMatch = weapon.danoDado.match(/(\d+)d(\d+)/);
    const numDice = diceMatch ? parseInt(diceMatch[1], 10) : 1;
    const diceSides = diceMatch ? parseInt(diceMatch[2], 10) : 8;

    let rollSum = 0;
    for (let i = 0; i < numDice; i++) {
      rollSum += Math.floor(Math.random() * diceSides) + 1;
    }
    const totalDamage = Math.max(1, rollSum + mod);

    recordRoll({
      acao: `Dano de Arma: ${weapon.nome}`,
      dadoBase: weapon.danoDado,
      rolagemNatural: rollSum,
      modificador: mod,
      total: totalDamage,
      isCritico: rollSum === diceSides * numDice,
      isFalhaCritica: rollSum === numDice,
      sucesso: true,
      detalhes: `Causou ${totalDamage} de dano ${weapon.danoTipo} (${rollSum} no dado + ${mod} de atributo)!`,
    });
  };

  const handleAdjustPv = (delta: number) => {
    onUpdateCharacter(prev => ({
      ...prev,
      combate: {
        ...prev.combate,
        pvAtual: Math.max(0, Math.min(prev.combate.pvMax, prev.combate.pvAtual + delta)),
      },
    }));
  };

  // Class trials verification
  const pocoesCount = character.estatisticas?.pocoesCriadas || 0;
  const treinosCount = character.estatisticas?.treinosCompletados || 0;
  const meditacaoMins = Math.floor((character.estatisticas?.segundosMeditados || 0) / 60);

  const checkTrialSatisfied = (tipo: 'alquimia' | 'treino' | 'meditacao') => {
    if (tipo === 'alquimia') return pocoesCount >= 1;
    if (tipo === 'treino') return treinosCount >= 1;
    if (tipo === 'meditacao') return (character.estatisticas?.segundosMeditados || 0) >= 30;
    return false;
  };

  const req1Met = checkTrialSatisfied(classTrial.desafioObrigatorio1.tipo);
  const req2Met = classTrial.desafioObrigatorio2 ? checkTrialSatisfied(classTrial.desafioObrigatorio2.tipo) : true;
  const canLevelUp = req1Met && req2Met;

  const handleConfirmLevelUp = () => {
    if (!canLevelUp) {
      alert('Você ainda não concluiu os desafios obrigatórios exigidos pela sua classe para subir de nível.');
      return;
    }

    onUpdateCharacter(prev => ({
      ...prev,
      nivel: prev.nivel + 1,
      combate: {
        ...prev.combate,
        pvMax: prev.combate.pvMax + 6,
        pvAtual: prev.combate.pvAtual + 6,
      },
    }));

    setLevelUpModalOpen(false);
    try {
      confetti({
        particleCount: 100,
        spread: 90,
        origin: { y: 0.5 },
        colors: ['#f59e0b', '#fbbf24', '#38bdf8', '#10b981'],
      });
    } catch (e) {
      // ignore
    }
    alert(`Parabéns! Você alcançou o NÍVEL ${character.nivel + 1} como ${character.classe}! Seus Pontos de Vida aumentaram em +6.`);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* CABEÇALHO DO PERSONAGEM COM ILUSTRAÇÕES DE CLASSE E RAÇA */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 md:p-8 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {/* Retrato Ilustrado da Raça ou Emblema da Classe com Fallback Resiliente */}
            <div className="relative group cursor-pointer" onClick={() => setRaceModalOpen(true)}>
              {currentRaceInfo.imagePath && !raceImageError ? (
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden border-2 border-amber-500/60 shadow-xl shrink-0 relative bg-slate-950">
                  <img
                    src={currentRaceInfo.imagePath}
                    alt={`Retrato oficial da raça ${character.raca}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    referrerPolicy="no-referrer"
                    onError={() => setRaceImageError(true)}
                  />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-transparent transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <span className="text-[10px] bg-slate-950/80 px-1.5 py-0.5 rounded text-amber-300 font-bold">Ver Raças</span>
                  </div>
                </div>
              ) : (
                <div
                  className="w-20 h-20 md:w-24 md:h-24 rounded-2xl p-2 bg-slate-950 border border-slate-700 shadow-xl shrink-0 flex items-center justify-center"
                  dangerouslySetInnerHTML={{ __html: currentRaceInfo.iconSvg || currentClassInfo.iconSvg }}
                  title={`Ilustração: ${character.raca}`}
                />
              )}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                {/* BOTÃO PARA ESCOLHER OU SORTEAR CLASSE (COM RANDOM RAFFLE) */}
                <button
                  type="button"
                  onClick={() => setClassModalOpen(true)}
                  className="text-xs font-bold px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                  title="Clique para escolher uma classe ou sortear aleatoriamente com d20"
                >
                  <Dices className="w-3.5 h-3.5 text-amber-400" />
                  <span>{character.classe} (Nível {character.nivel})</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500/40 text-amber-950 font-extrabold ml-1">
                    🎲 Trocar / Sortear
                  </span>
                </button>

                {/* BOTÃO PARA ESCOLHER RAÇA */}
                <button
                  type="button"
                  onClick={() => setRaceModalOpen(true)}
                  className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/30 transition flex items-center gap-1 cursor-pointer shadow-sm"
                  title="Clique para visualizar galeria completa de raças e características"
                >
                  <span>{character.raca}</span>
                  <Edit3 className="w-3 h-3 text-indigo-400" />
                </button>

                <span className="text-xs text-slate-400 font-medium">
                  {character.antecedente} • {character.tendencia}
                </span>
              </div>

              <h1 className="text-2xl md:text-4xl font-black text-white tracking-tight">{character.nome}</h1>
              <p className="text-xs text-slate-400 mt-1 max-w-xl line-clamp-2">{character.historia}</p>

              {/* Banner de Permissão do Mestre */}
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-300">
                  <Shield className={`w-3.5 h-3.5 ${character.modoAprovacaoMestre ? 'text-amber-400' : 'text-slate-500'}`} />
                  Mesa: {character.modoAprovacaoMestre ? (
                    <span className="text-amber-400 font-bold">Aprovação do Mestre Ativa</span>
                  ) : (
                    <span className="text-slate-400">Modo Independente</span>
                  )}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    onUpdateCharacter(prev => ({
                      ...prev,
                      modoAprovacaoMestre: !prev.modoAprovacaoMestre,
                    }))
                  }
                  className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-[10px] font-semibold transition cursor-pointer"
                  title="Ativar ou desativar exigência de aprovação do Mestre para alterações na ficha"
                >
                  {character.modoAprovacaoMestre ? 'Desativar Exigência' : 'Exigir Permissão do Mestre'}
                </button>
              </div>
            </div>
          </div>

          {/* PAINEL DE XP E DESAFIO DE SUBIDA DE NÍVEL */}
          <div className="flex items-center gap-4 bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
            <div>
              <div className="text-[11px] font-medium text-slate-400 uppercase">Experiência</div>
              <div className="text-xl font-black text-amber-400 font-mono">{character.experiencia} XP</div>
            </div>
            <button
              onClick={() => setLevelUpModalOpen(true)}
              className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-black text-xs transition cursor-pointer shadow-lg shadow-amber-500/20 flex items-center gap-1.5"
            >
              <Award className="w-4 h-4" /> Subir Nível (Desafios)
            </button>
          </div>
        </div>

        {/* VANTAGENS RACIAIS E DA CLASSE */}
        <div className="mt-6 pt-6 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-amber-400 font-bold block mb-1">✦ Traço de Classe ({character.classe}):</span>
            <span className="text-slate-300">{currentClassInfo.vantagem}</span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center justify-between mb-1">
              <span className="text-indigo-400 font-bold">✦ Herança Racial ({character.raca}):</span>
              <button
                type="button"
                onClick={() => setRaceModalOpen(true)}
                className="text-[11px] text-cyan-400 hover:underline font-semibold cursor-pointer"
              >
                Galeria de Raças D&D →
              </button>
            </div>
            <span className="text-slate-300 block mb-2">{currentRaceInfo.vantagem}</span>
            <div className="space-y-1 pt-1.5 border-t border-slate-900">
              {currentRaceInfo.caracteristicasBasicas?.slice(0, 2).map((t, idx) => (
                <div key={idx} className="text-[11px] text-slate-400">
                  • {t}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* COMBATE & PONTOS DE VIDA */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* PV Atual / Max */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Pontos de Vida</span>
            <Heart className="w-4 h-4 text-red-500 fill-red-500" />
          </div>
          <div className="text-2xl font-black font-mono text-white mt-1">
            {character.combate.pvAtual} <span className="text-xs text-slate-400">/ {character.combate.pvMax}</span>
          </div>
          <div className="flex gap-1.5 mt-2">
            <button
              onClick={() => handleAdjustPv(-1)}
              className="flex-1 py-1 rounded bg-slate-800 hover:bg-red-950 text-red-400 font-bold text-xs cursor-pointer"
            >
              -1 PV
            </button>
            <button
              onClick={() => handleAdjustPv(1)}
              className="flex-1 py-1 rounded bg-slate-800 hover:bg-emerald-950 text-emerald-400 font-bold text-xs cursor-pointer"
            >
              +1 PV
            </button>
          </div>
        </div>

        {/* Classe de Armadura */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl text-center">
          <span className="text-xs text-slate-400 font-medium block">Classe Armadura (CA)</span>
          <div className="text-3xl font-black font-mono text-cyan-400 mt-1 flex items-center justify-center gap-1">
            <Shield className="w-5 h-5 text-cyan-500" />
            {character.combate.classeArmd}
          </div>
          <span className="text-[10px] text-slate-500 font-medium">Proteção Passiva</span>
        </div>

        {/* Iniciativa */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl text-center">
          <span className="text-xs text-slate-400 font-medium block">Iniciativa</span>
          <div className="text-3xl font-black font-mono text-amber-400 mt-1">
            {character.combate.iniciativa || formatModifier(getAttributeModifier(effective.destreza))}
          </div>
          <span className="text-[10px] text-slate-500 font-medium">Reflexo de Batalha</span>
        </div>

        {/* Deslocamento */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl text-center">
          <span className="text-xs text-slate-400 font-medium block">Deslocamento</span>
          <div className="text-2xl font-black font-mono text-emerald-400 mt-1.5">
            {character.combate.deslocamento || currentRaceInfo.deslocamento}
          </div>
          <span className="text-[10px] text-slate-500 font-medium">Velocidade Base</span>
        </div>

        {/* Bônus de Proficiência */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl text-center">
          <span className="text-xs text-slate-400 font-medium block">Bônus Proficiência</span>
          <div className="text-3xl font-black font-mono text-indigo-400 mt-1">
            +{profBonus}
          </div>
          <span className="text-[10px] text-slate-500 font-medium">Livro Oficial</span>
        </div>

        {/* Dados de Vida */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl text-center">
          <span className="text-xs text-slate-400 font-medium block">Dado de Vida</span>
          <div className="text-2xl font-black font-mono text-purple-400 mt-1.5">
            {character.nivel}{currentClassInfo.dadoVida}
          </div>
          <span className="text-[10px] text-slate-500 font-medium">Descanso Curto</span>
        </div>
      </div>

      {/* ARSENAL DE ARMAS EQUIPADAS & COMBATE COM ROLAGEM DE DADOS */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Swords className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-lg text-white">Arsenal de Armas & Golpes de Combate</h3>
          </div>
          <button
            onClick={() => setArmoryModalOpen(true)}
            className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 cursor-pointer"
          >
            <span>Ver Catálogo Completo de Armas D&D →</span>
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {equippedWeapons.map(weapon => (
            <div
              key={weapon.id}
              className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-amber-500/50 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl p-2 rounded-xl bg-slate-900 border border-slate-800">{weapon.icone}</span>
                    <div>
                      <h4 className="font-bold text-white text-base">{weapon.nome}</h4>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2">
                        <span>{weapon.categoria}</span>
                        <span>•</span>
                        <strong className="text-amber-400 font-mono">{weapon.danoDado} {weapon.danoTipo}</strong>
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Equipada
                  </span>
                </div>

                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {weapon.propriedades.map((prop, idx) => (
                    <span key={idx} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-900 text-slate-300 border border-slate-800 font-mono">
                      {prop}
                    </span>
                  ))}
                </div>
              </div>

              {/* Botões de Rolagem de Ataque e Dano */}
              <div className="mt-4 pt-3 border-t border-slate-900 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleWeaponAttack(weapon)}
                  className="py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-300 font-bold text-xs border border-cyan-500/30 flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
                  Atacar (d20)
                </button>
                <button
                  type="button"
                  onClick={() => handleWeaponDamage(weapon)}
                  className="py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 font-bold text-xs border border-amber-500/30 flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Dices className="w-3.5 h-3.5 text-amber-400" />
                  Rolar Dano ({weapon.danoDado})
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* OS 6 ATRIBUTOS PRINCIPAIS COM BÔNUS TEMPORÁRIOS */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-lg text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" /> Atributos Principais & Modificadores
          </h3>
          <span className="text-xs text-slate-400">Clique no dado para rolar o atributo</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {attrList.map(attr => {
            const mod = getAttributeModifier(attr.value);
            const hasBuff = attr.bonus > 0;

            return (
              <div
                key={attr.key}
                className={`p-4 rounded-2xl border text-center transition flex flex-col justify-between ${
                  hasBuff
                    ? 'bg-amber-950/20 border-amber-500/60 shadow-lg shadow-amber-500/10'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    {attr.label}
                  </span>
                  <div className="text-3xl font-black font-mono text-white mt-1">
                    {attr.value}
                    {hasBuff && (
                      <span className="text-xs font-bold text-amber-400 ml-1">(+{attr.bonus})</span>
                    )}
                  </div>
                  <div className="text-xs font-mono font-bold text-emerald-400 mt-0.5">
                    Modificador: {formatModifier(mod)}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleRollAttribute(attr.label, mod)}
                  className="mt-3 py-1.5 px-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 text-xs font-semibold flex items-center justify-center gap-1 border border-slate-800 transition cursor-pointer"
                >
                  <Dices className="w-3.5 h-3.5 text-amber-500" /> Rolar
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* PERÍCIAS OFICIAIS & MAGIAS/CONJURAÇÃO */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* PERÍCIAS (18 Perícias D&D 5e) */}
        <div className="lg:col-span-7 bg-slate-900 rounded-3xl border border-slate-800 p-6 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Scroll className="w-5 h-5 text-amber-500" />
              <h3 className="font-bold text-base text-white">Perícias do Aventureiro (18 Perícias)</h3>
            </div>
            <span className="text-xs text-slate-400">Modificadores com Bônus Ativo</span>
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[460px] overflow-y-auto pr-1">
            {skillsList.map(skill => {
              const mod = getAttributeModifier(effective[skill.attr]);
              return (
                <div
                  key={skill.nome}
                  onClick={() => handleRollSkill(skill.nome, skill.attr)}
                  className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-amber-500/50 flex items-center justify-between cursor-pointer transition group"
                >
                  <div>
                    <span className="text-xs font-semibold text-slate-200 group-hover:text-amber-300 transition-colors">
                      {skill.nome}
                    </span>
                    <span className="block text-[10px] text-slate-500 uppercase">{skill.attr}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs font-bold text-emerald-400">
                      {formatModifier(mod)}
                    </span>
                    <Dices className="w-3.5 h-3.5 text-slate-600 group-hover:text-amber-400 transition-colors" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CONJURAÇÃO & ATAQUES */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 shadow-xl">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <h3 className="font-bold text-base text-white">Parâmetros Mágicos & CD</h3>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-center">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="block text-[11px] text-slate-400 font-medium">CD Teste de Magia</span>
                <span className="text-2xl font-black font-mono text-amber-400">
                  {8 + profBonus + getAttributeModifier(effective[currentClassInfo.atributoChave])}
                </span>
                <span className="text-[10px] text-slate-500">8 + Prof + Mod Chave</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="block text-[11px] text-slate-400 font-medium">Bônus de Ataque Mágico</span>
                <span className="text-2xl font-black font-mono text-indigo-400">
                  {formatModifier(profBonus + getAttributeModifier(effective[currentClassInfo.atributoChave]))}
                </span>
                <span className="text-[10px] text-slate-500">Prof + Mod Chave</span>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <span className="text-xs font-semibold text-slate-300 block">Truques Conhecidos:</span>
              <div className="flex flex-wrap gap-1.5">
                {character.magias?.truques?.map(t => (
                  <span key={t} className="text-xs px-2.5 py-1 rounded-lg bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 font-medium">
                    {t}
                  </span>
                )) || <span className="text-xs text-slate-500">Nenhum truque cadastrado.</span>}
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <span className="text-xs font-semibold text-slate-300 block">Feitiços e Fórmulas Gravadas:</span>
              <div className="flex flex-wrap gap-1.5">
                {character.magias?.magiasConhecidas?.map(m => (
                  <span key={m} className="text-xs px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 font-medium">
                    {m}
                  </span>
                )) || <span className="text-xs text-slate-500">Nenhuma magia conhecida.</span>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL DE DESAFIOS DE SUBIDA DE NÍVEL (BASEADOS NA CLASSE) */}
      {levelUpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-xl rounded-3xl bg-slate-900 border border-slate-700 p-6 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setLevelUpModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <Award className="w-7 h-7" />
              </div>
              <div>
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  Ascensão Heroica de Nível {character.nivel} → {character.nivel + 1}
                </span>
                <h3 className="text-xl font-black text-white">{classTrial.titulo}</h3>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3.5 rounded-2xl border border-slate-800 mb-5">
              {classTrial.descricao}
            </p>

            {/* Checklist dos Desafios Obrigatórios */}
            <div className="space-y-3 mb-6">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Requisitos Obrigatórios para {character.classe}:
              </h4>

              {/* Desafio Obrigatório 1 */}
              <div
                className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 text-xs ${
                  req1Met ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-200' : 'bg-slate-950 border-slate-800 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{req1Met ? '✅' : '⏳'}</span>
                  <div>
                    <div className="font-bold text-white">{classTrial.desafioObrigatorio1.label}</div>
                    <div className="text-[11px] text-slate-400">
                      Status:{' '}
                      <strong className={req1Met ? 'text-emerald-400' : 'text-amber-400'}>
                        {req1Met ? 'Concluído' : 'Pendente'}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Desafio Obrigatório 2 (se houver) */}
              {classTrial.desafioObrigatorio2 && (
                <div
                  className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 text-xs ${
                    req2Met ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-200' : 'bg-slate-950 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{req2Met ? '✅' : '⏳'}</span>
                    <div>
                      <div className="font-bold text-white">{classTrial.desafioObrigatorio2.label}</div>
                      <div className="text-[11px] text-slate-400">
                        Status:{' '}
                        <strong className={req2Met ? 'text-emerald-400' : 'text-amber-400'}>
                          {req2Met ? 'Concluído' : 'Pendente'}
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Desafio Opcional com Bônus */}
              {classTrial.desafioOpcional && (
                <div className="p-3.5 rounded-2xl bg-amber-950/20 border border-amber-500/30 flex items-center justify-between gap-3 text-xs text-amber-200">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
                      ★ Desafio Opcional ({classTrial.desafioOpcional.label}):
                    </span>
                    <span className="text-slate-300">{classTrial.desafioOpcional.bonusDescricao}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Ações */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                disabled={!canLevelUp}
                onClick={handleConfirmLevelUp}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-black text-xs transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
              >
                <Award className="w-4 h-4" />
                {canLevelUp ? `Confirmar Ascensão para Nível ${character.nivel + 1} (+6 PV)` : 'Desafios Pendentes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DO CATÁLOGO DE ARMAS D&D */}
      {armoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-3xl rounded-3xl bg-slate-900 border border-slate-700 p-6 shadow-2xl text-slate-100 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Swords className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-lg text-white">Catálogo Oficial de Armas D&D 5e</h3>
              </div>
              <button
                onClick={() => setArmoryModalOpen(false)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-3">
              {WEAPONS_CATALOG.map(w => (
                <div
                  key={w.id}
                  className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl p-2 rounded-xl bg-slate-900 border border-slate-800">{w.icone}</span>
                    <div>
                      <h4 className="font-bold text-white text-sm">{w.nome}</h4>
                      <p className="text-slate-400 text-[11px] mt-0.5">{w.descricao}</p>
                      <div className="flex items-center gap-2 mt-1 text-[11px] font-mono">
                        <strong className="text-amber-400">{w.danoDado} {w.danoTipo}</strong>
                        <span>•</span>
                        <span className="text-slate-400">{w.categoria}</span>
                        <span>•</span>
                        <span className="text-emerald-400">{w.precoPO} PO</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        handleWeaponAttack(w);
                        setArmoryModalOpen(false);
                      }}
                      className="px-3 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold transition cursor-pointer flex items-center gap-1"
                    >
                      <Crosshair className="w-3.5 h-3.5" /> Atacar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE ESCOLHA / SORTEIO ALEATÓRIO DE CLASSE */}
      {classModalOpen && (
        <ClassShowcaseModal
          isOpen={classModalOpen}
          onClose={() => setClassModalOpen(false)}
          selectedClass={character.classe}
          onSelectClass={newClass => {
            const cInfo = CLASSES_CATALOG.find(c => c.nome === newClass);
            onUpdateCharacter(prev => ({
              ...prev,
              classe: newClass,
            }));
          }}
        />
      )}

      {/* MODAL DE ESCOLHA DE RAÇA */}
      {raceModalOpen && (
        <RaceShowcaseModal
          isOpen={raceModalOpen}
          onClose={() => setRaceModalOpen(false)}
          selectedRace={character.raca}
          onSelectRace={newRace => {
            const rInfo = RACES_CATALOG.find(r => r.nome === newRace);
            onUpdateCharacter(prev => ({
              ...prev,
              raca: newRace,
              combate: {
                ...prev.combate,
                deslocamento: rInfo?.deslocamento || prev.combate.deslocamento,
              },
            }));
          }}
        />
      )}

      {/* D20 Modal */}
      {d20ModalOpen && (
        <DiceRollerModal
          isOpen={d20ModalOpen}
          onClose={() => setD20ModalOpen(false)}
          actionTitle={testTitle}
          modifier={testModifier}
          dcTarget={testDc}
        />
      )}
    </div>
  );
};
