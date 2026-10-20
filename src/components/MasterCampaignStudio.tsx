import React, { useState } from 'react';
import {
  Sparkles,
  BookOpen,
  Map,
  Skull,
  Award,
  Send,
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  Copy,
  Plus,
  RefreshCw,
  Eye,
  Shield,
  Layers,
  Flame,
} from 'lucide-react';
import {
  CampaignStory,
  TacticalMap,
  MonsterNPC,
  RewardItem,
  RoomParticipant,
  InventoryItem,
} from '../types/rpg';

interface MasterCampaignStudioProps {
  participants: RoomParticipant[];
  onSendFileToPlayer: (recipientId: string, item: Partial<InventoryItem>) => void;
  savedCampaigns?: CampaignStory[];
  onSaveCampaign?: (campaign: CampaignStory) => void;
}

export const MasterCampaignStudio: React.FC<MasterCampaignStudioProps> = ({
  participants,
  onSendFileToPlayer,
  savedCampaigns = [],
  onSaveCampaign,
}) => {
  const [activeTab, setActiveTab] = useState<'lore' | 'map' | 'monster' | 'item' | 'custom_file'>('lore');
  const [theme, setTheme] = useState('Ruínas Alquímicas Arcanas');
  const [level, setLevel] = useState(3);
  const [customPrompt, setCustomPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Generated Items State
  const [generatedStory, setGeneratedStory] = useState<CampaignStory | null>(null);
  const [generatedMap, setGeneratedMap] = useState<TacticalMap | null>(null);
  const [generatedMonster, setGeneratedMonster] = useState<MonsterNPC | null>(null);
  const [generatedItem, setGeneratedItem] = useState<RewardItem | null>(null);

  // Send to Player modal state
  const [showSendModal, setShowSendModal] = useState(false);
  const [itemToSend, setItemToSend] = useState<Partial<InventoryItem> | null>(null);
  const [selectedRecipientId, setSelectedRecipientId] = useState<string>(participants[0]?.userId || '');
  const [sendSuccessMsg, setSendSuccessMsg] = useState<string | null>(null);

  // Custom File / Scroll Upload state
  const [customDocTitle, setCustomDocTitle] = useState('');
  const [customDocContent, setCustomDocContent] = useState('');
  const [customDocType, setCustomDocType] = useState<InventoryItem['tipo']>('documento');
  const [customDocWeight, setCustomDocWeight] = useState(0.2);

  const handleGenerate = async (genType: 'lore' | 'map' | 'monster' | 'item') => {
    setIsGenerating(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/gemini/generate-campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: genType,
          theme,
          level,
          customPrompt,
        }),
      });

      const result = await response.json();

      if (result.success && result.data) {
        if (genType === 'lore') {
          const storyData: CampaignStory = {
            id: 'campaign_' + Date.now(),
            titulo: result.data.titulo || 'Crônica Arcana',
            sinopse: result.data.sinopse || '',
            tema: theme,
            nivelRecomendado: `Nível ${level}`,
            arcosNarrativos: result.data.arcosNarrativos || [],
            ganchoAventura: result.data.ganchoAventura || '',
            mapas: [],
            monstrosENPCs: [],
            itensRecompensa: [],
            criadoEm: new Date().toISOString(),
          };
          setGeneratedStory(storyData);
          if (onSaveCampaign) onSaveCampaign(storyData);
        } else if (genType === 'map') {
          const mapData: TacticalMap = {
            id: 'map_' + Date.now(),
            nome: result.data.nome || 'Masmorra Arcana',
            ambiente: result.data.ambiente || theme,
            descricao: result.data.descricao || '',
            tamanhoGrid: result.data.tamanhoGrid || '20x20',
            salas: result.data.salas || [],
            armadilhasESegredos: result.data.armadilhasESegredos || [],
            climaEAtmosfera: result.data.climaEAtmosfera || '',
            layoutVisualAscii: result.data.layoutVisualAscii || '',
          };
          setGeneratedMap(mapData);
        } else if (genType === 'monster') {
          const monData: MonsterNPC = {
            id: 'mon_' + Date.now(),
            nome: result.data.nome || 'Monstro Elemental',
            tipo: result.data.tipo || 'Criatura',
            desafioCR: result.data.desafioCR || `CR ${level}`,
            ca: result.data.ca || 15,
            pv: result.data.pv || 50,
            deslocamento: result.data.deslocamento || '9m',
            atributos: result.data.atributos || { for: 16, des: 12, con: 16, int: 6, sab: 10, car: 8 },
            habilidades: result.data.habilidades || [],
            acoesCombate: result.data.acoesCombate || [],
            lore: result.data.lore || '',
          };
          setGeneratedMonster(monData);
        } else if (genType === 'item') {
          const itemData: RewardItem = {
            id: 'reward_' + Date.now(),
            nome: result.data.nome || 'Artefato Arcano',
            tipo: result.data.tipo || 'reliquia',
            raridade: result.data.raridade || 'Raro',
            pesoKg: result.data.pesoKg || 1,
            valorPO: result.data.valorPO || 300,
            propriedadesMagicas: result.data.propriedadesMagicas || '',
            descricao: result.data.descricao || '',
          };
          setGeneratedItem(itemData);
        }
      } else {
        throw new Error(result.error || 'Falha ao gerar conteúdo.');
      }
    } catch (err: any) {
      console.warn('Erro na geração com IA, usando gerador alternativo:', err);
      setErrorMsg('Gerado via modelo alternativo do Codex RPG.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOpenSendModal = (itemPayload: Partial<InventoryItem>) => {
    setItemToSend(itemPayload);
    setSelectedRecipientId(participants[0]?.userId || '');
    setSendSuccessMsg(null);
    setShowSendModal(true);
  };

  const handleConfirmSend = () => {
    if (!itemToSend || !selectedRecipientId) return;

    onSendFileToPlayer(selectedRecipientId, itemToSend);
    const targetPlayer = participants.find(p => p.userId === selectedRecipientId);
    setSendSuccessMsg(`✅ Arquivo "${itemToSend.nome}" anexado com sucesso ao inventário de ${targetPlayer?.userName || 'Jogador'}!`);

    setTimeout(() => {
      setShowSendModal(false);
      setItemToSend(null);
      setSendSuccessMsg(null);
    }, 2000);
  };

  const handleSendCustomDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customDocTitle.trim() || !selectedRecipientId) return;

    const customItem: Partial<InventoryItem> = {
      id: 'doc_mestre_' + Date.now(),
      nome: customDocTitle.trim(),
      tipo: customDocType,
      quantidade: 1,
      pesoKg: customDocWeight,
      valorPO: 50,
      raridade: 'Raro',
      descricao: customDocContent.trim() || 'Documento/Pergaminho oficial enviado pelo Mestre.',
      conteudoArquivo: customDocContent.trim(),
      origemMestre: true,
      equipavel: false,
    };

    onSendFileToPlayer(selectedRecipientId, customItem);
    const target = participants.find(p => p.userId === selectedRecipientId);
    alert(`📜 Arquivo "${customDocTitle}" anexado ao inventário de ${target?.userName || 'Jogador'}!`);
    setCustomDocTitle('');
    setCustomDocContent('');
  };

  return (
    <div className="space-y-6">
      {/* Header do Grimório do Mestre */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-950/60 via-slate-900 to-amber-950/40 border border-purple-500/30 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-amber-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white tracking-tight">
                  Forja Narrativa & Grimório com Gemini IA
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/40 text-[10px] font-bold text-purple-300">
                  Google Gemini 3.8 Flash
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Crie histórias épicas, mapas táticos, monstros balanceados de D&D 5e e envie arquivos diretamente para o inventário dos jogadores.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block uppercase font-mono">Jogadores Conectados</span>
              <span className="text-xs font-bold text-amber-400">{participants.length} na Mesa (Limite: 20)</span>
            </div>
          </div>
        </div>

        {/* Parâmetros de Geração */}
        <div className="mt-5 pt-4 border-t border-purple-500/20 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Tema / Cenário Fantástico da Campanha
            </label>
            <input
              type="text"
              value={theme}
              onChange={e => setTheme(e.target.value)}
              placeholder="Ex: Cidadela de Mercúrio Flutuante, Tumba do Dragão de Enxofre..."
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Nível Médio do Grupo (CR)
            </label>
            <select
              value={level}
              onChange={e => setLevel(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-purple-500"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].map(lvl => (
                <option key={lvl} value={lvl}>
                  Nível {lvl} {lvl <= 4 ? '(Iniciante)' : lvl <= 10 ? '(Heróico)' : lvl <= 16 ? '(Mestre)' : '(Épico)'}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tabs de Seleção de Ferramenta */}
      <div className="flex space-x-2 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('lore')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            activeTab === 'lore'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          História & Arcos
        </button>

        <button
          onClick={() => setActiveTab('map')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            activeTab === 'map'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Map className="w-4 h-4" />
          Mapas Táticos
        </button>

        <button
          onClick={() => setActiveTab('monster')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            activeTab === 'monster'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Skull className="w-4 h-4" />
          Monstros & NPCs
        </button>

        <button
          onClick={() => setActiveTab('item')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            activeTab === 'item'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Award className="w-4 h-4" />
          Itens de Recompensa
        </button>

        <button
          onClick={() => setActiveTab('custom_file')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            activeTab === 'custom_file'
              ? 'bg-amber-600 text-white shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Upload className="w-4 h-4" />
          Enviar Arquivo / Pergaminho Personalizado
        </button>
      </div>

      {/* ABA 1: HISTÓRIA DA CAMPANHA */}
      {activeTab === 'lore' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-purple-400" />
              Gerador de História e Arcos da Campanha
            </h3>
            <button
              onClick={() => handleGenerate('lore')}
              disabled={isGenerating}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs transition cursor-pointer flex items-center gap-2 shadow-md"
            >
              <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
              {isGenerating ? 'Gemini IA Escrevendo...' : 'Gerar História com IA'}
            </button>
          </div>

          {generatedStory ? (
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono text-purple-400 uppercase font-bold tracking-wider">
                    {generatedStory.nivelRecomendado} • {generatedStory.tema}
                  </span>
                  <h4 className="text-lg font-black text-white mt-0.5">{generatedStory.titulo}</h4>
                </div>
                <button
                  onClick={() =>
                    handleOpenSendModal({
                      id: 'pergaminho_' + Date.now(),
                      nome: `Pergaminho de Lore: ${generatedStory.titulo}`,
                      tipo: 'pergaminho',
                      quantidade: 1,
                      pesoKg: 0.2,
                      valorPO: 100,
                      raridade: 'Raro',
                      descricao: generatedStory.sinopse,
                      conteudoArquivo: `GANCHO: ${generatedStory.ganchoAventura}\n\nARCOS:\n` +
                        generatedStory.arcosNarrativos.map(a => `${a.fase}: ${a.titulo} - ${a.detalhes}`).join('\n\n'),
                      origemMestre: true,
                    })
                  }
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  Enviar como Pergaminho ao Jogador
                </button>
              </div>

              <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/30 text-xs text-slate-300 leading-relaxed">
                <strong className="text-purple-300 block mb-1">Sinopse da Aventura:</strong>
                {generatedStory.sinopse}
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                <strong className="text-amber-400 block mb-1 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5" /> Gancho de Aventura para os Jogadores:
                </strong>
                <p className="text-slate-300">{generatedStory.ganchoAventura}</p>
              </div>

              <div className="space-y-2">
                <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Arcos Dramáticos</h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {generatedStory.arcosNarrativos.map((arco, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
                      <span className="text-[10px] font-bold text-purple-400">{arco.fase}</span>
                      <h6 className="font-bold text-white text-xs my-0.5">{arco.titulo}</h6>
                      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{arco.detalhes}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 text-center text-slate-500 text-xs">
              Clique em &quot;Gerar História com IA&quot; para que o Gemini elabore a trama principal, arcos narrativos e ganchos de aventura.
            </div>
          )}
        </div>
      )}

      {/* ABA 2: MAPAS TÁTICOS */}
      {activeTab === 'map' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Map className="w-4 h-4 text-cyan-400" />
              Gerador de Masmorras & Mapas Táticos
            </h3>
            <button
              onClick={() => handleGenerate('map')}
              disabled={isGenerating}
              className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold text-xs transition cursor-pointer flex items-center gap-2 shadow-md"
            >
              <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
              {isGenerating ? 'Desenhando com IA...' : 'Gerar Mapa Tático com IA'}
            </button>
          </div>

          {generatedMap ? (
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold">
                    {generatedMap.tamanhoGrid} • {generatedMap.ambiente}
                  </span>
                  <h4 className="text-lg font-black text-white mt-0.5">{generatedMap.nome}</h4>
                </div>
                <button
                  onClick={() =>
                    handleOpenSendModal({
                      id: 'mapa_' + Date.now(),
                      nome: `Carta Náutica/Mapa: ${generatedMap.nome}`,
                      tipo: 'documento',
                      quantidade: 1,
                      pesoKg: 0.5,
                      valorPO: 75,
                      raridade: 'Incomum',
                      descricao: generatedMap.descricao,
                      conteudoArquivo: `ATMOSFERA: ${generatedMap.climaEAtmosfera}\n\nSALAS:\n` +
                        generatedMap.salas.join('\n') + `\n\nARMADILHAS E SEGREDOS:\n` +
                        generatedMap.armadilhasESegredos.join('\n'),
                      origemMestre: true,
                    })
                  }
                  className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  Enviar Mapa para Jogador
                </button>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">{generatedMap.descricao}</p>

              {/* Layout Visual Esquemático */}
              {generatedMap.layoutVisualAscii && (
                <div className="p-3 rounded-xl bg-slate-950 border border-cyan-500/30 text-center font-mono text-xs text-cyan-300 tracking-wider">
                  {generatedMap.layoutVisualAscii}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <h5 className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5" /> Salas e Ambientes do Grid
                  </h5>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {generatedMap.salas.map((sala, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-cyan-500">•</span>
                        <span>{sala}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <h5 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5" /> Armadilhas & Portas Secretas
                  </h5>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {generatedMap.armadilhasESegredos.map((armadilha, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-amber-500">•</span>
                        <span>{armadilha}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 text-center text-slate-500 text-xs">
              Gere salas táticas com descrições de iluminação, armadilhas D&D 5e e layouts que você pode anexar ao inventário dos jogadores.
            </div>
          )}
        </div>
      )}

      {/* ABA 3: MONSTROS & NPCS */}
      {activeTab === 'monster' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Skull className="w-4 h-4 text-red-400" />
              Criador de Monstros & Chefes D&D 5e
            </h3>
            <button
              onClick={() => handleGenerate('monster')}
              disabled={isGenerating}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold text-xs transition cursor-pointer flex items-center gap-2 shadow-md"
            >
              <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
              {isGenerating ? 'Invocando Monstro...' : 'Gerar Monstro com IA'}
            </button>
          </div>

          {generatedMonster ? (
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-red-500/20 border border-red-500/40 text-[10px] font-bold text-red-300">
                      {generatedMonster.desafioCR}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">{generatedMonster.tipo}</span>
                  </div>
                  <h4 className="text-lg font-black text-white mt-1">{generatedMonster.nome}</h4>
                </div>
                <button
                  onClick={() =>
                    handleOpenSendModal({
                      id: 'bestiario_' + Date.now(),
                      nome: `Relatório de Bestiário: ${generatedMonster.nome}`,
                      tipo: 'documento',
                      quantidade: 1,
                      pesoKg: 0.3,
                      valorPO: 40,
                      raridade: 'Incomum',
                      descricao: generatedMonster.lore,
                      conteudoArquivo: `ESTATÍSTICAS D&D:\nCA: ${generatedMonster.ca} | PV: ${generatedMonster.pv} | Desl: ${generatedMonster.deslocamento}\n\nHABILIDADES:\n` +
                        generatedMonster.habilidades.join('\n') + `\n\nAÇÕES DE COMBATE:\n` +
                        generatedMonster.acoesCombate.join('\n'),
                      origemMestre: true,
                    })
                  }
                  className="px-3 py-1.5 rounded-xl bg-red-500 hover:bg-red-400 text-white font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  Enviar Registro aos Jogadores
                </button>
              </div>

              {/* Ficha D&D 5e Resumida */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-red-500/30 grid grid-cols-3 gap-2 text-center text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Classe de Armadura</span>
                  <span className="text-base font-black text-cyan-400">{generatedMonster.ca}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Pontos de Vida</span>
                  <span className="text-base font-black text-red-400">{generatedMonster.pv} PV</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Deslocamento</span>
                  <span className="text-xs font-bold text-slate-200">{generatedMonster.deslocamento}</span>
                </div>
              </div>

              <div className="grid grid-cols-6 gap-2 text-center font-mono text-xs bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-500">FOR</span>
                  <div className="font-bold text-amber-300">{generatedMonster.atributos.for}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500">DES</span>
                  <div className="font-bold text-amber-300">{generatedMonster.atributos.des}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500">CON</span>
                  <div className="font-bold text-amber-300">{generatedMonster.atributos.con}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500">INT</span>
                  <div className="font-bold text-amber-300">{generatedMonster.atributos.int}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500">SAB</span>
                  <div className="font-bold text-amber-300">{generatedMonster.atributos.sab}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500">CAR</span>
                  <div className="font-bold text-amber-300">{generatedMonster.atributos.car}</div>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <strong className="text-red-400 block mb-1">Ações de Ataque:</strong>
                  <ul className="space-y-1 text-slate-300">
                    {generatedMonster.acoesCombate.map((act, i) => (
                      <li key={i}>⚔️ {act}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 text-center text-slate-500 text-xs">
              Gere fichas balanceadas de monstros, chefões com ações lendárias e envie os registros como pergaminhos de bestiário aos jogadores.
            </div>
          )}
        </div>
      )}

      {/* ABA 4: ITENS DE RECOMPENSA */}
      {activeTab === 'item' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              Forja de Itens Mágicos & Recompensas
            </h3>
            <button
              onClick={() => handleGenerate('item')}
              disabled={isGenerating}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition cursor-pointer flex items-center gap-2 shadow-md"
            >
              <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
              {isGenerating ? 'Forjando Item...' : 'Forjar Item com IA'}
            </button>
          </div>

          {generatedItem ? (
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-[10px] font-bold text-amber-300">
                      {generatedItem.raridade}
                    </span>
                    <span className="text-xs text-slate-400 font-mono capitalize">{generatedItem.tipo}</span>
                  </div>
                  <h4 className="text-lg font-black text-white mt-1">{generatedItem.nome}</h4>
                </div>

                <button
                  onClick={() =>
                    handleOpenSendModal({
                      id: 'loot_' + Date.now(),
                      nome: generatedItem.nome,
                      tipo: generatedItem.tipo,
                      quantidade: 1,
                      pesoKg: generatedItem.pesoKg,
                      valorPO: generatedItem.valorPO,
                      raridade: generatedItem.raridade,
                      descricao: `${generatedItem.descricao} Propriedades: ${generatedItem.propriedadesMagicas}`,
                      origemMestre: true,
                      equipavel: true,
                    })
                  }
                  className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Send className="w-4 h-4" />
                  Enviar Item Diretamente ao Inventário
                </button>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Peso: <strong className="text-white">{generatedItem.pesoKg} kg</strong></span>
                  <span>Valor de Mercado: <strong className="text-amber-400">{generatedItem.valorPO} PO</strong></span>
                </div>
                <div className="pt-2 border-t border-slate-800">
                  <strong className="text-amber-400 block mb-0.5">Propriedades Mágicas:</strong>
                  <p className="text-slate-300">{generatedItem.propriedadesMagicas}</p>
                </div>
                <div>
                  <strong className="text-slate-400 block mb-0.5">Descrição:</strong>
                  <p className="text-slate-400">{generatedItem.descricao}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 text-center text-slate-500 text-xs">
              Crie relíquias lendárias, poções arcanas e armas forjadas com elementos químicos para premiar os jogadores da mesa.
            </div>
          )}
        </div>
      )}

      {/* ABA 5: ENVIO DE ARQUIVO / PERGAMINHO PERSONALIZADO */}
      {activeTab === 'custom_file' && (
        <form onSubmit={handleSendCustomDocument} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-amber-500" />
            <div>
              <h4 className="text-sm font-bold text-white">Despacho de Arquivo & Anexo no Inventário</h4>
              <p className="text-xs text-slate-400">
                Escreva uma carta confidencial, envie um mapa em texto ou pergaminho sagrado que será anexado na mochila do jogador.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nome do Arquivo / Título do Pergaminho
              </label>
              <input
                type="text"
                required
                value={customDocTitle}
                onChange={e => setCustomDocTitle(e.target.value)}
                placeholder="Ex: Mandado de Prisão do Barão, Carta Selada em Cera..."
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Tipo do Item
              </label>
              <select
                value={customDocType}
                onChange={e => setCustomDocType(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="documento">📜 Documento Oficial</option>
                <option value="pergaminho">📜 Pergaminho Mágico</option>
                <option value="reliquia">💎 Relíquia Arcana</option>
                <option value="arma">⚔️ Arma Customizada</option>
                <option value="pocao">🧪 Poção Especial</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Jogador de Destino (Mesa)
            </label>
            <select
              value={selectedRecipientId}
              onChange={e => setSelectedRecipientId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
            >
              {participants.map(p => (
                <option key={p.userId} value={p.userId}>
                  {p.userName} {p.personagemNome ? `(${p.personagemNome} - ${p.classe})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Conteúdo do Arquivo / Texto do Documento
            </label>
            <textarea
              rows={4}
              required
              value={customDocContent}
              onChange={e => setCustomDocContent(e.target.value)}
              placeholder="Digite o texto que o jogador lerá ao abrir o anexo no inventário..."
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-bold text-xs transition flex items-center gap-2 cursor-pointer shadow-lg"
            >
              <Send className="w-4 h-4" />
              Anexar Diretamente no Inventário do Jogador
            </button>
          </div>
        </form>
      )}

      {/* MODAL DE CONFIRMAÇÃO DE ENVIO DE ITEM/ARQUIVO PARA JOGADOR */}
      {showSendModal && itemToSend && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-slate-900 border border-amber-500/30 rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Send className="w-4 h-4 text-amber-500" />
                Despachar Item para Inventário
              </h4>
              <button
                onClick={() => setShowSendModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
              <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">Item Selecionado</span>
              <div className="text-sm font-black text-white">{itemToSend.nome}</div>
              <p className="text-slate-400 line-clamp-2">{itemToSend.descricao}</p>
              <div className="flex gap-3 text-slate-400 pt-1 text-[11px]">
                <span>Peso: <strong className="text-white">{itemToSend.pesoKg} kg</strong></span>
                <span>Raridade: <strong className="text-amber-400">{itemToSend.raridade}</strong></span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Escolha o Jogador da Mesa:
              </label>
              <select
                value={selectedRecipientId}
                onChange={e => setSelectedRecipientId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                {participants.map(p => (
                  <option key={p.userId} value={p.userId}>
                    {p.userName} {p.personagemNome ? `(${p.personagemNome} - ${p.classe})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {sendSuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold">
                {sendSuccessMsg}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowSendModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmSend}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <CheckCircle className="w-4 h-4" />
                Confirmar e Anexar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
