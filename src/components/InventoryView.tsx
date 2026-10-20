import React, { useState } from 'react';
import { CharacterSheet, InventoryItem, TemporaryBuff, SheetChangeRequest } from '../types/rpg';
import { getCarryingCapacityKg } from '../utils/dndMath';
import { WEAPONS_CATALOG, WeaponDefinition } from '../data/weaponsCatalog';
import {
  Backpack,
  Shield,
  Sword,
  Sparkles,
  Coins,
  Weight,
  Plus,
  Trash2,
  Check,
  FlaskConical,
  Package,
  X,
  Crosshair,
  Dices,
  Lock,
  Unlock,
  Layers,
  FileText,
  Eye,
  AlertTriangle,
  Send,
  Zap,
} from 'lucide-react';

interface InventoryViewProps {
  character: CharacterSheet;
  onUpdateCharacter: (updater: (prev: CharacterSheet) => CharacterSheet) => void;
  onRequestMasterApproval?: (req: Partial<SheetChangeRequest>) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  character,
  onUpdateCharacter,
  onRequestMasterApproval,
}) => {
  const [filterType, setFilterType] = useState<string>('todos');
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [showWeaponsArmory, setShowWeaponsArmory] = useState(false);
  const [readingItem, setReadingItem] = useState<InventoryItem | null>(null);

  // New Item State
  const [newItemName, setNewItemName] = useState('');
  const [newItemType, setNewItemType] = useState<InventoryItem['tipo']>('outro');
  const [newItemWeight, setNewItemWeight] = useState(1);
  const [newItemQuantity, setNewItemQuantity] = useState(1);
  const [newItemPO, setNewItemPO] = useState(10);
  const [newItemDesc, setNewItemDesc] = useState('');

  // Meditação e Requisitos da Habilidade de Armazenamento Espacial
  const segundosMeditados = character.estatisticas?.segundosMeditados || 0;
  const minutosMeditados = Math.floor(segundosMeditados / 60);
  const spatialStorageUnlocked = Boolean(
    character.armazenamentoEspacialDesbloqueado ||
    segundosMeditados >= 300 || // 5 minutos de meditação cósmica
    character.nivel >= 5
  );

  // D&D 5e Carrying Capacity Rules (PHB p. 176)
  // Regra Padrão: Força × 15 libras (~7.5 kg)
  // Regra Opcional Carga Pesada: Força × 10 libras (~5.0 kg) -> Deslocamento cai em 3m
  // Regra Opcional Carga Severa: Força × 15 libras (~7.5 kg) -> Deslocamento cai em 6m, desvantagem em testes
  const maxCapacityKg = getCarryingCapacityKg(character.atributos.forca);
  const heavyEncumbranceKg = character.atributos.forca * 5.0;

  // Itens no Armazenamento Espacial NÃO pesam na capacidade física (peso = 0)
  const backpackItems = character.inventario.filter(item => !item.noEspacoDimensional);
  const spatialItems = character.inventario.filter(item => item.noEspacoDimensional);

  const physicalWeight = backpackItems.reduce(
    (sum, item) => sum + (item.pesoKg || 0) * (item.quantidade || 1),
    0
  );

  const weightPercentage = Math.min(100, (physicalWeight / maxCapacityKg) * 100);
  const isHeavy = physicalWeight > heavyEncumbranceKg && physicalWeight <= maxCapacityKg;
  const isOverencumbered = physicalWeight > maxCapacityKg;

  const filteredItems = character.inventario.filter(item => {
    if (filterType === 'todos') return true;
    if (filterType === 'espacial') return item.noEspacoDimensional;
    if (filterType === 'mochila') return !item.noEspacoDimensional;
    return item.tipo === filterType;
  });

  const handleToggleEquip = (itemId: string) => {
    onUpdateCharacter(prev => {
      const updated = prev.inventario.map(item => {
        if (item.id === itemId) {
          const nextEquipped = !item.equipado;
          return { ...item, equipado: nextEquipped };
        }
        return item;
      });
      return { ...prev, inventario: updated };
    });
  };

  const handleToggleSpatialTransfer = (itemId: string) => {
    if (!spatialStorageUnlocked) {
      alert('Habilidade de Armazenamento Espacial bloqueada! Medite por 5 minutos no Treino Mental ou peça autorização ao Mestre da sua Mesa.');
      return;
    }

    onUpdateCharacter(prev => ({
      ...prev,
      inventario: prev.inventario.map(item => {
        if (item.id === itemId) {
          const nextSpatial = !item.noEspacoDimensional;
          return { ...item, noEspacoDimensional: nextSpatial };
        }
        return item;
      }),
    }));
  };

  const handleUsePotion = (item: InventoryItem) => {
    onUpdateCharacter(prev => {
      let nextPv = prev.combate.pvAtual;
      let newBuffs = [...prev.buffs];

      if (item.nome.toLowerCase().includes('cura')) {
        const healAmount = Math.floor(Math.random() * 8) + 4; // 2d4+2
        nextPv = Math.min(prev.combate.pvMax, nextPv + healAmount);
        alert(`🧪 Você bebeu ${item.nome} e recuperou ${healAmount} PV!`);
      } else {
        const buff: TemporaryBuff = {
          id: 'buff_item_' + Date.now(),
          nome: item.nome,
          atributo: 'forca',
          valor: 2,
          duracaoMinutos: 30,
          criadoEm: Date.now(),
          origem: 'alquimia',
          descricao: item.descricao,
        };
        newBuffs.push(buff);
        alert(`✨ Você consumiu ${item.nome}! Bônus temporário ativado.`);
      }

      const updatedInv = prev.inventario
        .map(i => (i.id === item.id ? { ...i, quantidade: i.quantidade - 1 } : i))
        .filter(i => i.quantidade > 0);

      return {
        ...prev,
        combate: {
          ...prev.combate,
          pvAtual: nextPv,
        },
        buffs: newBuffs,
        inventario: updatedInv,
      };
    });
  };

  const handleDeleteItem = (itemId: string) => {
    onUpdateCharacter(prev => ({
      ...prev,
      inventario: prev.inventario.filter(i => i.id !== itemId),
    }));
  };

  const handleCreateNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const item: InventoryItem = {
      id: 'custom_' + Date.now(),
      nome: newItemName.trim(),
      tipo: newItemType,
      quantidade: newItemQuantity,
      pesoKg: newItemWeight,
      valorPO: newItemPO,
      raridade: 'Comum',
      descricao: newItemDesc.trim() || 'Item adicionado à mochila.',
      equipavel: newItemType === 'arma' || newItemType === 'armadura' || newItemType === 'reliquia',
      equipado: false,
      noEspacoDimensional: false,
    };

    onUpdateCharacter(prev => ({
      ...prev,
      inventario: [item, ...prev.inventario],
    }));

    setNewItemName('');
    setNewItemDesc('');
    setShowAddItemModal(false);
  };

  const handleBuyWeapon = (w: WeaponDefinition) => {
    const currentGold = character.moedas?.po || 0;
    if (currentGold < w.precoPO) {
      alert(`Você não tem peças de ouro suficientes! Custo: ${w.precoPO} PO, Você tem: ${currentGold} PO.`);
      return;
    }

    // Se estiver em modo de aprovação do Mestre
    if (character.modoAprovacaoMestre && onRequestMasterApproval) {
      onRequestMasterApproval({
        tipo: 'compra_loja',
        titulo: `Compra de Equipamento: ${w.nome}`,
        descricao: `O jogador solicitou adquirir a arma "${w.nome}" (${w.categoria}, Dano ${w.danoDado} ${w.danoTipo}) pelo valor de ${w.precoPO} PO.`,
        dadosAlteracao: {
          arma: w,
          custoPO: w.precoPO,
        },
      });
      setShowWeaponsArmory(false);
      alert(`📜 Solicitação de compra de "${w.nome}" enviada ao Mestre da Mesa! A arma será forjada e entregue assim que o Mestre autorizar.`);
      return;
    }

    // Compra direta em modo solo
    const newItem: InventoryItem = {
      id: 'arma_' + Date.now(),
      nome: w.nome,
      tipo: 'arma',
      quantidade: 1,
      pesoKg: w.pesoKg,
      valorPO: w.precoPO,
      raridade: w.categoria === 'Arcana / Alquímica' ? 'Incomum' : 'Comum',
      descricao: `${w.descricao} (Dano: ${w.danoDado} ${w.danoTipo})`,
      equipavel: true,
      equipado: true,
      noEspacoDimensional: false,
    };

    onUpdateCharacter(prev => ({
      ...prev,
      moedas: {
        ...prev.moedas,
        po: Math.max(0, (prev.moedas?.po || 0) - w.precoPO),
      },
      inventario: [newItem, ...prev.inventario],
    }));

    setShowWeaponsArmory(false);
    alert(`⚔️ Você forjou e equipou ${w.nome} por ${w.precoPO} PO!`);
  };

  const handleUpdateCoins = (coinKey: keyof CharacterSheet['moedas'], delta: number) => {
    onUpdateCharacter(prev => {
      const current = prev.moedas?.[coinKey] || 0;
      const nextVal = Math.max(0, current + delta);
      return {
        ...prev,
        moedas: {
          ...prev.moedas,
          [coinKey]: nextVal,
        },
      };
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* HEADER DE CAPACIDADE DE CARGA (D&D 5E) & BOLSA DE MOEDAS */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Capacidade de Carga D&D 5e (Livro do Jogador / Mestre) */}
        <div className="md:col-span-6 bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Backpack className="w-5 h-5 text-amber-500" />
              <div>
                <h3 className="font-bold text-base text-slate-100">Capacidade de Carga (D&D 5e)</h3>
                <span className="text-[10px] text-slate-400 font-mono">PHB p. 176 • Força ({character.atributos.forca}) × 7.5 kg</span>
              </div>
            </div>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                isOverencumbered
                  ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                  : isHeavy
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              }`}
            >
              {isOverencumbered ? '⛔ Sobrecarregado' : isHeavy ? '⚠️ Carga Pesada (-3m)' : '🟢 Carga Normal'}
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Weight className="w-4 h-4 text-slate-500" /> Peso Físico na Mochila:
              </span>
              <span className="font-mono font-bold text-slate-100">
                {physicalWeight.toFixed(1)} kg / <span className="text-amber-400">{maxCapacityKg.toFixed(1)} kg máx</span>
              </span>
            </div>

            <div className="w-full bg-slate-950 rounded-full h-3 p-0.5 overflow-hidden border border-slate-800">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  isOverencumbered
                    ? 'bg-red-500 shadow-md shadow-red-500/50'
                    : isHeavy
                    ? 'bg-amber-500 shadow-md shadow-amber-500/50'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${weightPercentage}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
              <span>Leve: até {heavyEncumbranceKg.toFixed(1)} kg</span>
              <span>Pesada: {heavyEncumbranceKg.toFixed(1)} - {maxCapacityKg.toFixed(1)} kg</span>
              <span>Limite: {maxCapacityKg.toFixed(1)} kg</span>
            </div>

            {isOverencumbered && (
              <p className="text-[11px] text-red-400 font-semibold bg-red-950/40 border border-red-500/30 p-2 rounded-xl">
                ⚠️ Personagem sobrecarregado! Conforme o Livro do Jogador, seu deslocamento cai em 6m e você tem desvantagem em testes de habilidade, jogadas de ataque e testes de resistência de Força, Destreza e Constituição.
              </p>
            )}
          </div>
        </div>

        {/* Bolsa de Moedas do Aventureiro */}
        <div className="md:col-span-6 bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-base text-slate-100">Bolsa de Moedas do Aventureiro</h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">D&D 5e Standard</span>
          </div>

          <div className="mt-4 grid grid-cols-5 gap-2 text-center">
            {[
              { key: 'po' as const, label: 'PO', name: 'Ouro', color: 'text-amber-400 border-amber-500/30' },
              { key: 'pl' as const, label: 'PL', name: 'Platina', color: 'text-cyan-300 border-cyan-500/30' },
              { key: 'pe' as const, label: 'PE', name: 'Electro', color: 'text-blue-300 border-blue-500/30' },
              { key: 'pp' as const, label: 'PP', name: 'Prata', color: 'text-slate-300 border-slate-500/30' },
              { key: 'pc' as const, label: 'PC', name: 'Cobre', color: 'text-orange-400 border-orange-500/30' },
            ].map(coin => (
              <div key={coin.key} className={`p-2 rounded-xl bg-slate-950 border ${coin.color}`}>
                <span className="block text-[10px] text-slate-400 font-bold">{coin.name}</span>
                <span className="text-lg font-black font-mono">{character.moedas?.[coin.key] || 0}</span>
                <div className="flex justify-center gap-1 mt-1">
                  <button
                    onClick={() => handleUpdateCoins(coin.key, -1)}
                    className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 cursor-pointer"
                  >
                    -
                  </button>
                  <button
                    onClick={() => handleUpdateCoins(coin.key, 1)}
                    className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CARD DA HABILIDADE DE ARMAZENAMENTO ESPACIAL (BOLSA DIMENSIONAL / VÁCUO ASTRAL) */}
      <div
        className={`p-5 rounded-2xl border transition-all ${
          spatialStorageUnlocked
            ? 'bg-gradient-to-r from-purple-950/70 via-slate-900 to-indigo-950/70 border-purple-500/50 shadow-xl shadow-purple-500/10'
            : 'bg-slate-900/60 border-slate-800'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black shadow-lg ${
                spatialStorageUnlocked
                  ? 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-purple-500/20 animate-pulse'
                  : 'bg-slate-800 text-slate-500 border border-slate-700'
              }`}
            >
              {spatialStorageUnlocked ? <Sparkles className="w-6 h-6" /> : <Lock className="w-5 h-5" />}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-black text-white">
                  Habilidade Arcana: Armazenamento Espacial (Dobra Dimensional)
                </h4>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    spatialStorageUnlocked
                      ? 'bg-purple-500/20 border border-purple-500/40 text-purple-300'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {spatialStorageUnlocked ? '🌌 Desbloqueado & Ativo' : '🔒 Bloqueado'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {spatialStorageUnlocked
                  ? 'Itens transferidos para o Armazenamento Espacial têm o peso completamente anulado pelo vácuo dimensional!'
                  : `Aprenda meditando por 5 minutos acumulados no Treino Mental (Progresso: ${minutosMeditados}/5 min) OU solicite permissão ao Mestre da sua mesa.`}
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs text-purple-300 font-mono font-bold block">
              {spatialItems.length} {spatialItems.length === 1 ? 'item guardado' : 'itens guardados'} no vácuo
            </span>
            <span className="text-[10px] text-slate-500">Peso Físico Anulado: 0.0 kg</span>
          </div>
        </div>
      </div>

      {/* SEÇÃO PRINCIPAL DE INVENTÁRIO */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-2xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Filtros */}
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'todos', label: 'Todos os Itens' },
              { id: 'mochila', label: `🎒 Mochila Fís. (${backpackItems.length})` },
              { id: 'espacial', label: `🌌 Espacial (${spatialItems.length})` },
              { id: 'arma', label: 'Armas' },
              { id: 'armadura', label: 'Armaduras' },
              { id: 'pocao', label: 'Poções' },
              { id: 'reliquia', label: 'Relíquias' },
              { id: 'documento', label: '📜 Documentos & Anexos' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id)}
                className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                  filterType === tab.id
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Botões de Ação */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowWeaponsArmory(true)}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Sword className="w-4 h-4 text-amber-400" /> Forjar / Comprar Armas
            </button>
            <button
              onClick={() => setShowAddItemModal(true)}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4" /> Item Manual
            </button>
          </div>
        </div>

        {/* Grade de Itens */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredItems.map(item => (
            <div
              key={item.id}
              className={`p-4 rounded-xl border transition flex flex-col justify-between ${
                item.noEspacoDimensional
                  ? 'bg-purple-950/20 border-purple-500/40 shadow-sm'
                  : item.equipado
                  ? 'bg-amber-950/20 border-amber-500/60 shadow-md'
                  : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {item.tipo === 'pocao' ? (
                      <FlaskConical className="w-5 h-5 text-emerald-400 shrink-0" />
                    ) : item.tipo === 'arma' ? (
                      <Sword className="w-5 h-5 text-red-400 shrink-0" />
                    ) : item.tipo === 'armadura' ? (
                      <Shield className="w-5 h-5 text-blue-400 shrink-0" />
                    ) : item.tipo === 'documento' || item.tipo === 'pergaminho' ? (
                      <FileText className="w-5 h-5 text-amber-400 shrink-0" />
                    ) : (
                      <Package className="w-5 h-5 text-slate-400 shrink-0" />
                    )}
                    <div>
                      <h4 className="text-sm font-bold text-slate-100 leading-tight">{item.nome}</h4>
                      <span className="text-[10px] text-amber-400/90 font-mono capitalize">
                        {item.tipo} • {item.raridade}
                      </span>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-col items-end gap-1">
                    {item.origemMestre && (
                      <span className="px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-bold">
                        📜 Anexo do Mestre
                      </span>
                    )}
                    {item.noEspacoDimensional && (
                      <span className="px-1.5 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[9px] font-bold">
                        🌌 Espacial (0 kg)
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-400 mt-2.5 line-clamp-2 leading-relaxed">
                  {item.descricao}
                </p>

                <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-mono">
                  <span>Qtd: <strong className="text-white">{item.quantidade}</strong></span>
                  <span>
                    Peso: <strong className={item.noEspacoDimensional ? 'text-purple-400' : 'text-slate-200'}>
                      {item.noEspacoDimensional ? '0.0 kg' : `${(item.pesoKg * item.quantidade).toFixed(1)} kg`}
                    </strong>
                  </span>
                  <span>Valor: <strong className="text-amber-400">{item.valorPO * item.quantidade} PO</strong></span>
                </div>
              </div>

              {/* Ações do Item */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  {/* Ler Documento/Anexo */}
                  {(item.conteudoArquivo || item.tipo === 'documento' || item.tipo === 'pergaminho') && (
                    <button
                      onClick={() => setReadingItem(item)}
                      className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" /> Ler
                    </button>
                  )}

                  {/* Usar Poção */}
                  {item.tipo === 'pocao' && (
                    <button
                      onClick={() => handleUsePotion(item)}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                    >
                      Beber
                    </button>
                  )}

                  {/* Equipar Arma/Armadura */}
                  {item.equipavel && (
                    <button
                      onClick={() => handleToggleEquip(item.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                        item.equipado
                          ? 'bg-amber-500 text-slate-950 shadow-sm'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                      }`}
                    >
                      {item.equipado ? <Check className="w-3.5 h-3.5" /> : null}
                      {item.equipado ? 'Equipado' : 'Equipar'}
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Botão de Transferência Espacial */}
                  {spatialStorageUnlocked && (
                    <button
                      onClick={() => handleToggleSpatialTransfer(item.id)}
                      className={`p-1.5 rounded-lg transition cursor-pointer text-xs ${
                        item.noEspacoDimensional
                          ? 'bg-purple-900/60 text-purple-300 hover:bg-purple-800'
                          : 'bg-slate-800 text-slate-400 hover:text-purple-300 hover:bg-slate-700'
                      }`}
                      title={item.noEspacoDimensional ? 'Retornar para a Mochila Física' : 'Guardar no Armazenamento Espacial (Peso 0)'}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-800 transition cursor-pointer"
                    title="Descartar Item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filteredItems.length === 0 && (
            <div className="col-span-full p-8 text-center text-slate-500 text-xs bg-slate-950/40 rounded-xl border border-dashed border-slate-800">
              Nenhum item encontrado nesta categoria.
            </div>
          )}
        </div>
      </div>

      {/* MODAL DE LEITURA DE DOCUMENTO / ANEXO DO MESTRE */}
      {readingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="w-full max-w-xl bg-gradient-to-b from-amber-950/40 to-slate-950 border border-amber-500/40 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-amber-500/20">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-base text-white">{readingItem.nome}</h3>
              </div>
              <button
                onClick={() => setReadingItem(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-amber-950/15 border border-amber-500/30 font-serif text-sm text-amber-100/90 leading-relaxed max-h-[60vh] overflow-y-auto whitespace-pre-wrap">
              {readingItem.conteudoArquivo || readingItem.descricao}
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
              <span className="flex items-center gap-1.5 text-amber-400">
                <Sparkles className="w-3.5 h-3.5" /> Documento Oficial Selado no Codex RPG
              </span>
              <button
                onClick={() => setReadingItem(null)}
                className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition cursor-pointer"
              >
                Fechar Pergaminho
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE ADICIONAR ITEM MANUAL */}
      {showAddItemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-amber-500" />
                Adicionar Item ao Inventário
              </h3>
              <button
                onClick={() => setShowAddItemModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNewItem} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nome do Item</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Espada Curta de Mithril"
                  value={newItemName}
                  onChange={e => setNewItemName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Tipo</label>
                  <select
                    value={newItemType}
                    onChange={e => setNewItemType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none"
                  >
                    <option value="arma">Arma</option>
                    <option value="armadura">Armadura</option>
                    <option value="pocao">Poção</option>
                    <option value="reliquia">Relíquia</option>
                    <option value="documento">Documento</option>
                    <option value="outro">Utilitário</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Quantidade</label>
                  <input
                    type="number"
                    min="1"
                    value={newItemQuantity}
                    onChange={e => setNewItemQuantity(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Peso Unitário (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={newItemWeight}
                    onChange={e => setNewItemWeight(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Valor Unitário (PO)</label>
                  <input
                    type="number"
                    min="0"
                    value={newItemPO}
                    onChange={e => setNewItemPO(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Descrição / Efeitos</label>
                <textarea
                  rows={2}
                  placeholder="Propriedades especiais, dano ou características..."
                  value={newItemDesc}
                  onChange={e => setNewItemDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddItemModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold cursor-pointer"
                >
                  Guardar na Mochila
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE CATÁLOGO / FORJA DE ARMAS D&D 5E */}
      {showWeaponsArmory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-2xl rounded-3xl bg-slate-900 border border-slate-700 p-6 shadow-2xl text-slate-100 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sword className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-lg text-white">Forja de Armas D&D 5e</h3>
              </div>
              <button
                onClick={() => setShowWeaponsArmory(false)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 mt-2">
              <span>Seu Ouro Atual: <strong className="text-amber-400 font-mono">{character.moedas?.po || 0} PO</strong></span>
              {character.modoAprovacaoMestre && (
                <span className="text-amber-400 font-semibold flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5" /> Requer Aprovação do Mestre da Mesa
                </span>
              )}
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-3">
              {WEAPONS_CATALOG.map(w => {
                const canAfford = (character.moedas?.po || 0) >= w.precoPO;

                return (
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
                          <span className="text-slate-400">{w.pesoKg} kg</span>
                        </div>
                      </div>
                    </div>

                    <button
                      disabled={!canAfford}
                      onClick={() => handleBuyWeapon(w)}
                      className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-bold transition cursor-pointer shrink-0 shadow-md flex items-center gap-1.5"
                    >
                      <span>{character.modoAprovacaoMestre ? 'Solicitar Compra' : 'Forjar'} ({w.precoPO} PO)</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
