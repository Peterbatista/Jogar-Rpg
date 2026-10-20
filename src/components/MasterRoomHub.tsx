import React, { useState } from 'react';
import {
  Crown,
  Users,
  UserPlus,
  Send,
  Sparkles,
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  Bell,
  Mail,
  Smartphone,
  Copy,
  Check,
  AlertTriangle,
  FolderOpen,
  Trash2,
  Lock,
  Unlock,
  Package,
  Layers,
  ArrowRight,
} from 'lucide-react';
import {
  RPGRoom,
  RoomParticipant,
  MasterChallenge,
  SheetChangeRequest,
  InventoryItem,
  CampaignStory,
} from '../types/rpg';
import { MasterCampaignStudio } from './MasterCampaignStudio';
import { NotificationSimulatorModal } from './NotificationSimulatorModal';

interface MasterRoomHubProps {
  room: RPGRoom;
  isMaster: boolean;
  currentUserId: string;
  onUpdateRoom: (updater: (prev: RPGRoom) => RPGRoom) => void;
  onSendFileToPlayer: (recipientId: string, item: Partial<InventoryItem>) => void;
  onApproveChangeRequest: (request: SheetChangeRequest) => void;
  onRejectChangeRequest: (requestId: string, reason?: string) => void;
}

export const MasterRoomHub: React.FC<MasterRoomHubProps> = ({
  room,
  isMaster,
  currentUserId,
  onUpdateRoom,
  onSendFileToPlayer,
  onApproveChangeRequest,
  onRejectChangeRequest,
}) => {
  const [activeTab, setActiveTab] = useState<'jogadores' | 'desafios' | 'aprovacoes' | 'gemini_studio'>('jogadores');
  const [copiedCode, setCopiedCode] = useState(false);

  // New Challenge Form
  const [showNewChallengeModal, setShowNewChallengeModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newType, setNewType] = useState<MasterChallenge['tipo']>('treino');
  const [newMeta, setNewMeta] = useState(15);
  const [newXp, setNewXp] = useState(250);
  const [newItemReward, setNewItemReward] = useState('');
  const [newRecipient, setNewRecipient] = useState<string>('todos');

  // Notification Modal Trigger
  const [previewChallenge, setPreviewChallenge] = useState<MasterChallenge | null>(null);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(room.codigo);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCreateChallenge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const recipientObj = room.jogadores.find(j => j.userId === newRecipient);
    const destinatarioNome = newRecipient === 'todos' ? 'Toda a Mesa' : (recipientObj?.userName || 'Jogador');

    const challenge: MasterChallenge = {
      id: 'm_chal_' + Date.now(),
      salaId: room.id,
      mestreId: room.mestreId,
      mestreNome: room.mestreNome,
      destinatario: newRecipient,
      destinatarioNome,
      titulo: newTitle.trim(),
      descricao: newDesc.trim(),
      tipo: newType,
      meta: newMeta,
      progresso: 0,
      recompensaXp: newXp,
      recompensaItem: newItemReward.trim() || undefined,
      concluido: false,
      dataEnvio: new Date().toLocaleDateString('pt-BR'),
      notificacaoEnviada: {
        email: true,
        celular: true,
      },
    };

    onUpdateRoom(prev => ({
      ...prev,
      desafiosMestre: [challenge, ...prev.desafiosMestre],
    }));

    // Trigger Notification Modal
    setPreviewChallenge(challenge);

    // Reset Form
    setNewTitle('');
    setNewDesc('');
    setShowNewChallengeModal(false);
  };

  const handleToggleSpatialStorage = (userId: string) => {
    onUpdateRoom(prev => ({
      ...prev,
      jogadores: prev.jogadores.map(j => {
        if (j.userId === userId) {
          const nextState = !j.armazenamentoEspacialLiberado;
          return { ...j, armazenamentoEspacialLiberado: nextState };
        }
        return j;
      }),
    }));
  };

  const handleKickPlayer = (userId: string) => {
    if (confirm('Tem certeza que deseja remover este jogador da mesa?')) {
      onUpdateRoom(prev => ({
        ...prev,
        jogadores: prev.jogadores.filter(j => j.userId !== userId),
      }));
    }
  };

  const pendingRequests = room.solicitacoesFicha?.filter(s => s.status === 'pendente') || [];
  const spotsAvailable = 20 - room.jogadores.length;

  return (
    <div className="space-y-6">
      {/* CARD DO TOPO: SALA DO MESTRE & CÓDIGO DE CONVITE */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-950/60 via-slate-900 to-slate-950 border border-amber-500/30 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20">
              <Crown className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white tracking-tight">{room.nome}</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-[10px] font-bold text-amber-300">
                  {room.sistema}
                </span>
                {isMaster && (
                  <span className="px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/40 text-[10px] font-bold text-purple-300">
                    👑 Você é o Mestre da Mesa
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Mestre: <strong className="text-white">{room.mestreNome}</strong> • {room.descricao}
              </p>
            </div>
          </div>

          {/* Código de Convite & Limite 20 Jogadores */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-800 flex items-center gap-2.5">
              <span className="text-[10px] uppercase font-mono text-slate-400">Código da Sala:</span>
              <span className="font-mono text-base font-black text-amber-400 tracking-wider">
                {room.codigo}
              </span>
              <button
                onClick={handleCopyCode}
                className="p-1 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
                title="Copiar Código"
              >
                {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            {/* Contador de Capacidade (Limite 20) */}
            <div className="bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between gap-3 text-xs mb-1">
                <span className="text-slate-400 font-semibold flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-amber-400" /> Lotação da Mesa
                </span>
                <span className={`font-mono font-bold ${spotsAvailable <= 0 ? 'text-red-400' : 'text-amber-400'}`}>
                  {room.jogadores.length} / 20 máx
                </span>
              </div>
              <div className="w-28 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    spotsAvailable <= 0 ? 'bg-red-500' : 'bg-amber-500'
                  }`}
                  style={{ width: `${Math.min(100, (room.jogadores.length / 20) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* NAVEGAÇÃO DE ABAS DA SALA */}
      <div className="flex space-x-2 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('jogadores')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            activeTab === 'jogadores'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          Jogadores da Mesa ({room.jogadores.length}/20)
        </button>

        <button
          onClick={() => setActiveTab('desafios')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            activeTab === 'desafios'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Bell className="w-4 h-4" />
          Desafios & Notificações ({room.desafiosMestre?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab('aprovacoes')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap relative ${
            activeTab === 'aprovacoes'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Shield className="w-4 h-4" />
          Aprovações da Ficha
          {pendingRequests.length > 0 && (
            <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center animate-pulse">
              {pendingRequests.length}
            </span>
          )}
        </button>

        {isMaster && (
          <button
            onClick={() => setActiveTab('gemini_studio')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
              activeTab === 'gemini_studio'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
                : 'text-purple-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4 text-purple-300" />
            Grimório & IA Gemini (Histórias, Mapas e Itens)
          </button>
        )}
      </div>

      {/* ABA 1: LISTA DOS JOGADORES DA MESA (LIMITE 20) */}
      {activeTab === 'jogadores' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-500" />
                Aventureiros na Mesa ({room.jogadores.length} de 20 vagas ocupadas)
              </h3>
              <p className="text-xs text-slate-400">
                Gerencie permissões, conceda o Armazenamento Espacial e envie itens diretamente para a mochila de cada participante.
              </p>
            </div>

            {spotsAvailable <= 0 ? (
              <span className="px-3 py-1.5 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-bold">
                ⚠️ Sala Lotada (20/20)
              </span>
            ) : (
              <span className="text-xs text-slate-400">
                <strong className="text-emerald-400">{spotsAvailable}</strong> vagas restantes
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {room.jogadores.map(jogador => (
              <div
                key={jogador.userId}
                className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white">{jogador.userName}</h4>
                      <div className="text-xs text-amber-400 font-semibold">
                        {jogador.personagemNome || 'Personagem'} • {jogador.classe || 'Guerreiro'} Nv. {jogador.nivel || 1}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Raça: {jogador.raca || 'Humano'} • {jogador.userEmail}
                      </div>
                    </div>

                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        jogador.status === 'online' ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50' : 'bg-slate-600'
                      }`}
                      title={jogador.status === 'online' ? 'Online' : 'Offline'}
                    />
                  </div>

                  {/* PV */}
                  <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Pontos de Vida:</span>
                    <span className="font-mono font-bold text-red-400">
                      {jogador.pvAtual ?? 24} / {jogador.pvMax ?? 24} PV
                    </span>
                  </div>

                  {/* Status do Armazenamento Espacial */}
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Package className="w-3.5 h-3.5 text-purple-400" />
                      Armazenamento Espacial:
                    </span>
                    <span
                      className={`font-semibold ${
                        jogador.armazenamentoEspacialLiberado ? 'text-purple-400' : 'text-slate-500'
                      }`}
                    >
                      {jogador.armazenamentoEspacialLiberado ? '🌌 Desbloqueado' : '🔒 Bloqueado'}
                    </span>
                  </div>
                </div>

                {/* Ações do Mestre */}
                {isMaster && (
                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleToggleSpatialStorage(jogador.userId)}
                      className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition flex items-center gap-1 cursor-pointer ${
                        jogador.armazenamentoEspacialLiberado
                          ? 'bg-purple-950/60 border border-purple-500/40 text-purple-300 hover:bg-purple-900'
                          : 'bg-slate-800 hover:bg-purple-900/60 text-slate-300'
                      }`}
                      title="Conceder ou revogar a habilidade mágica de armazenamento espacial"
                    >
                      {jogador.armazenamentoEspacialLiberado ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                      {jogador.armazenamentoEspacialLiberado ? 'Revogar Espacial' : 'Liberar Espacial'}
                    </button>

                    <button
                      onClick={() => handleKickPlayer(jogador.userId)}
                      className="p-1.5 text-slate-500 hover:text-red-400 transition cursor-pointer"
                      title="Remover jogador da mesa"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ABA 2: DESAFIOS DO MESTRE & NOTIFICAÇÕES (E-MAIL + CELULAR) */}
      {activeTab === 'desafios' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-500" />
                Desafios Enviados pelo Mestre & Acompanhamento
              </h3>
              <p className="text-xs text-slate-400">
                Ao criar um desafio, notificações com som e prévia de e-mail e push no celular são despachadas aos jogadores.
              </p>
            </div>

            {isMaster && (
              <button
                onClick={() => setShowNewChallengeModal(true)}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-md"
              >
                <Send className="w-4 h-4" />
                Criar & Despachar Novo Desafio
              </button>
            )}
          </div>

          {/* Lista de Desafios da Mesa */}
          <div className="space-y-3">
            {room.desafiosMestre?.map(desafio => (
              <div
                key={desafio.id}
                className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold uppercase">
                      {desafio.tipo}
                    </span>
                    <h4 className="text-sm font-bold text-white">{desafio.titulo}</h4>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-400">
                      Para: <strong className="text-white">{desafio.destinatarioNome}</strong>
                    </span>
                    <button
                      onClick={() => setPreviewChallenge(desafio)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold transition cursor-pointer flex items-center gap-1"
                    >
                      <Smartphone className="w-3 h-3 text-cyan-400" />
                      <Mail className="w-3 h-3 text-amber-400" />
                      Ver Notificações
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">{desafio.descricao}</p>

                {/* Barra de Progresso do Jogador no Desafio */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex-1 max-w-md">
                    <div className="flex justify-between text-slate-400 mb-1 text-[11px]">
                      <span>Progresso do Jogador:</span>
                      <span className="font-mono font-bold text-amber-400">
                        {desafio.progresso} / {desafio.meta} {desafio.tipo === 'treino' ? 'repetições' : desafio.tipo === 'meditacao' ? 'min' : 'itens'}
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-amber-500 h-full transition-all duration-300"
                        style={{ width: `${Math.min(100, (desafio.progresso / Math.max(1, desafio.meta)) * 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-bold text-[11px]">
                      +{desafio.recompensaXp} XP {desafio.recompensaItem ? `+ ${desafio.recompensaItem}` : ''}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                        desafio.concluido
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {desafio.concluido ? '✅ Concluído' : '⏳ Em Andamento'}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {(!room.desafiosMestre || room.desafiosMestre.length === 0) && (
              <div className="p-8 rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 text-center text-slate-500 text-xs">
                Nenhum desafio foi emitido para esta mesa ainda. O Mestre pode clicar no botão acima para criar o primeiro desafio!
              </div>
            )}
          </div>
        </div>
      )}

      {/* ABA 3: CENTRAL DE APROVAÇÃO DE FICHAS */}
      {activeTab === 'aprovacoes' && (
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-500" />
              Aprovações do Mestre para Alterações nas Fichas dos Jogadores
            </h3>
            <p className="text-xs text-slate-400">
              Conforme as diretrizes da mesa, alterações como compra de itens na loja, subida de nível e modificações de atributos exigem a sanção do Mestre.
            </p>
          </div>

          <div className="space-y-3">
            {pendingRequests.map(req => (
              <div
                key={req.id}
                className="p-4 rounded-2xl bg-slate-900 border border-amber-500/30 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-amber-400 uppercase font-bold tracking-wider">
                      Solicitação #{req.id.slice(-4)} • {req.tipo.replace('_', ' ').toUpperCase()}
                    </span>
                    <h4 className="text-sm font-black text-white mt-0.5">{req.titulo}</h4>
                    <p className="text-xs text-slate-400">
                      De: <strong className="text-white">{req.jogadorNome}</strong> ({req.personagemNome})
                    </p>
                  </div>

                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-[10px] font-bold text-amber-300">
                    Aguardando Aprovação
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
                  {req.descricao}
                </div>

                {isMaster && (
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      onClick={() => onRejectChangeRequest(req.id, 'O Mestre não autorizou esta alteração no momento.')}
                      className="px-3.5 py-1.5 rounded-xl bg-red-950/60 hover:bg-red-900/80 border border-red-500/40 text-red-300 text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
                    >
                      <XCircle className="w-4 h-4" />
                      Recusar Alteração
                    </button>
                    <button
                      onClick={() => onApproveChangeRequest(req)}
                      className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-md"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Aprovar & Atualizar Ficha
                    </button>
                  </div>
                )}
              </div>
            ))}

            {pendingRequests.length === 0 && (
              <div className="p-8 rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 text-center text-slate-500 text-xs">
                Nenhuma alteração de ficha pendente no momento. Todas as fichas dos jogadores estão em perfeita conformidade!
              </div>
            )}
          </div>
        </div>
      )}

      {/* ABA 4: GRIMÓRIO & IA GEMINI */}
      {activeTab === 'gemini_studio' && isMaster && (
        <MasterCampaignStudio
          participants={room.jogadores}
          onSendFileToPlayer={onSendFileToPlayer}
          savedCampaigns={room.campanhas}
          onSaveCampaign={camp => {
            onUpdateRoom(prev => ({
              ...prev,
              campanhas: [camp, ...(prev.campanhas || [])],
            }));
          }}
        />
      )}

      {/* MODAL PARA O MESTRE CRIAR NOVO DESAFIO */}
      {showNewChallengeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <form
            onSubmit={handleCreateChallenge}
            className="w-full max-w-md bg-slate-900 border border-amber-500/40 rounded-2xl p-5 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Send className="w-4 h-4 text-amber-500" />
                Criar Desafio com Notificação por E-mail & Celular
              </h4>
              <button
                type="button"
                onClick={() => setShowNewChallengeModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Título do Desafio
              </label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                placeholder="Ex: Treino dos Titãs de Forja, Destilar Elixir Purificador..."
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Tipo de Desafio
                </label>
                <select
                  value={newType}
                  onChange={e => setNewType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="treino">🏋️ Treino Físico</option>
                  <option value="meditacao">🧘 Meditação Arcana</option>
                  <option value="alquimia">🧪 Alquimia & Síntese</option>
                  <option value="narrativa">📜 Missão de História</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Meta Numérica
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={newMeta}
                  onChange={e => setNewMeta(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Recompensa em XP
                </label>
                <input
                  type="number"
                  min="50"
                  step="50"
                  required
                  value={newXp}
                  onChange={e => setNewXp(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Item de Bônus (Opcional)
                </label>
                <input
                  type="text"
                  value={newItemReward}
                  onChange={e => setNewItemReward(e.target.value)}
                  placeholder="Ex: Poção de Força do Gigante"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Destinatário
              </label>
              <select
                value={newRecipient}
                onChange={e => setNewRecipient(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="todos">Toda a Mesa (Até 20 Jogadores)</option>
                {room.jogadores.map(j => (
                  <option key={j.userId} value={j.userId}>
                    {j.userName} ({j.personagemNome || 'Aventureiro'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Descrição do Desafio
              </label>
              <textarea
                rows={3}
                required
                value={newDesc}
                onChange={e => setNewDesc(e.target.value)}
                placeholder="Instruções para os aventureiros..."
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowNewChallengeModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Send className="w-4 h-4" />
                Despachar Desafio & Notificações
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL SIMULADOR DE NOTIFICAÇÃO (E-MAIL + CELULAR) */}
      <NotificationSimulatorModal
        challenge={previewChallenge}
        isOpen={!!previewChallenge}
        onClose={() => setPreviewChallenge(null)}
      />
    </div>
  );
};
