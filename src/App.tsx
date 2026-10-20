import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './firebase/authContext';
import { CharacterSheet } from './types/rpg';
import { createInitialCharacter } from './utils/initialCharacter';
import { saveCharacter, getActiveLocalCharacter } from './firebase/characterService';
import { Header } from './components/Header';
import { Navigation, TabKey } from './components/Navigation';
import { CharacterSheetView } from './components/CharacterSheetView';
import { AlchemyLab } from './components/AlchemyLab';
import { TrainingAndMeditation } from './components/TrainingAndMeditation';
import { InteractiveStory } from './components/InteractiveStory';
import { InventoryView } from './components/InventoryView';
import { RankingsView } from './components/RankingsView';
import { PlayerStatsView } from './components/PlayerStatsView';
import { NotificationsPanel } from './components/NotificationsPanel';
import { DiceRollerModal } from './components/DiceRollerModal';
import { AuthModal } from './components/AuthModal';
import { MasterRoomHub } from './components/MasterRoomHub';
import { RPGRoom, SheetChangeRequest, InventoryItem } from './types/rpg';
import { DiceRollProvider } from './context/DiceRollContext';

const INITIAL_ROOM: RPGRoom = {
  id: 'sala_aethelgard_1',
  codigo: 'CDX-7842',
  nome: 'Campanha: As Crônicas de Aethelgard',
  mestreId: 'mestre_arcanus',
  mestreNome: 'Arquimestre Arcanus',
  mestreEmail: 'mestre.arcanus@codexrpg.com',
  descricao: 'Mesa oficial D&D 5e de exploração e alquimia cósmica.',
  sistema: 'D&D 5e',
  limiteMaximo: 20,
  ativa: true,
  createdAt: new Date().toISOString(),
  jogadores: [
    {
      userId: 'guest',
      userName: 'Aventureiro Inicial',
      userEmail: 'jogador@reinos.com',
      personagemNome: 'Valerius',
      classe: 'Mago',
      raca: 'Humano',
      nivel: 3,
      pvAtual: 22,
      pvMax: 22,
      status: 'online',
      armazenamentoEspacialLiberado: false,
      entrouEm: '2026-10-19',
    },
    {
      userId: 'user_lyra',
      userName: 'Lyra Sombra',
      userEmail: 'lyra.sombra@reinos.com',
      personagemNome: 'Lyra',
      classe: 'Ladino',
      raca: 'Elfo',
      nivel: 3,
      pvAtual: 24,
      pvMax: 24,
      status: 'online',
      armazenamentoEspacialLiberado: true,
      entrouEm: '2026-10-18',
    },
    {
      userId: 'user_thorin',
      userName: 'Thorin Escudo-de-Carvalho',
      userEmail: 'thorin.anao@reinos.com',
      personagemNome: 'Thorin',
      classe: 'Guerreiro',
      raca: 'Anão',
      nivel: 3,
      pvAtual: 34,
      pvMax: 34,
      status: 'offline',
      armazenamentoEspacialLiberado: false,
      entrouEm: '2026-10-17',
    },
    {
      userId: 'user_zephyr',
      userName: 'Zephyr o Errante',
      userEmail: 'zephyr@reinos.com',
      personagemNome: 'Zephyr',
      classe: 'Clérigo',
      raca: 'Aasimar',
      nivel: 3,
      pvAtual: 26,
      pvMax: 26,
      status: 'online',
      armazenamentoEspacialLiberado: false,
      entrouEm: '2026-10-19',
    },
  ],
  campanhas: [],
  desafiosMestre: [
    {
      id: 'm_chal_initial_1',
      salaId: 'sala_aethelgard_1',
      mestreId: 'mestre_arcanus',
      mestreNome: 'Arquimestre Arcanus',
      destinatario: 'todos',
      destinatarioNome: 'Toda a Mesa',
      titulo: 'Destilação da Centelha Primordial',
      descricao: 'Sintetize 2 elixires alquímicos na câmara de fusão de átomos para preparar o grupo para o Templo Proibido.',
      tipo: 'alquimia',
      meta: 2,
      progresso: 1,
      recompensaXp: 300,
      recompensaItem: 'Poção de Cura Maior',
      concluido: false,
      dataEnvio: 'Hoje',
      notificacaoEnviada: { email: true, celular: true },
    },
  ],
  solicitacoesFicha: [
    {
      id: 'req_init_1',
      salaId: 'sala_aethelgard_1',
      jogadorId: 'user_lyra',
      jogadorNome: 'Lyra Sombra',
      personagemNome: 'Lyra',
      tipo: 'compra_loja',
      titulo: 'Compra: Adaga Alquímica com Canaleta',
      descricao: 'Lyra solicitou comprar uma Adaga Alquímica por 12 PO para aplicação de venenos na próxima sessão.',
      dadosAlteracao: { custoPO: 12 },
      status: 'pendente',
      criadoEm: Date.now() - 3600000,
    },
  ],
  arquivosEnviados: [],
};

function AppContent() {
  const { user } = useAuth();
  const [character, setCharacter] = useState<CharacterSheet>(() => {
    const cached = getActiveLocalCharacter();
    const initial = cached || createInitialCharacter();
    // Default to player with master approval mode enabled for immersion
    return {
      ...initial,
      papelUsuario: initial.papelUsuario || 'mestre_jogador', // default to dual so user can test everything immediately
      modoAprovacaoMestre: true,
      salaMesaId: 'sala_aethelgard_1',
    };
  });
  const [room, setRoom] = useState<RPGRoom>(INITIAL_ROOM);
  const [activeTab, setActiveTab] = useState<TabKey>('ficha');
  const [quickD20Open, setQuickD20Open] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const isMaster =
    character.papelUsuario === 'mestre' ||
    character.papelUsuario === 'mestre_jogador' ||
    character.userId === room.mestreId;

  // Sync with Firestore whenever character changes
  useEffect(() => {
    saveCharacter(
      character,
      user?.uid,
      user?.displayName || character.userName,
      user?.photoURL || undefined
    );
  }, [character, user]);

  // If user logs in, associate character with user
  useEffect(() => {
    if (user && character.userId === 'guest') {
      setCharacter(prev => ({
        ...prev,
        userId: user.uid,
        userName: user.displayName || prev.userName,
      }));
    }
  }, [user]);

  const handleUpdateCharacter = (updater: (prev: CharacterSheet) => CharacterSheet) => {
    setCharacter(prev => updater(prev));
  };

  // Mestre envia arquivo ou item que é anexado ao inventário do jogador
  const handleSendFileToPlayer = (recipientId: string, itemPayload: Partial<InventoryItem>) => {
    const newItem: InventoryItem = {
      id: itemPayload.id || 'anexo_mestre_' + Date.now(),
      nome: itemPayload.nome || 'Documento Oficial do Mestre',
      tipo: itemPayload.tipo || 'documento',
      quantidade: itemPayload.quantidade || 1,
      pesoKg: itemPayload.pesoKg || 0.2,
      valorPO: itemPayload.valorPO || 50,
      raridade: itemPayload.raridade || 'Raro',
      descricao: itemPayload.descricao || 'Item/Documento oficial enviado pelo Mestre da Mesa.',
      conteudoArquivo: itemPayload.conteudoArquivo,
      origemMestre: true,
      equipavel: itemPayload.equipavel || false,
      equipado: false,
      noEspacoDimensional: false,
    };

    // Se o destinatário for o próprio jogador logado
    if (recipientId === character.userId || recipientId === 'guest' || recipientId === 'todos') {
      setCharacter(prev => ({
        ...prev,
        inventario: [newItem, ...prev.inventario],
      }));
    }

    // Registra no histórico da sala
    setRoom(prev => ({
      ...prev,
      arquivosEnviados: [
        {
          id: 'transfer_' + Date.now(),
          salaId: prev.id,
          mestreId: prev.mestreId,
          mestreNome: prev.mestreNome,
          destinatarioId: recipientId,
          destinatarioNome: prev.jogadores.find(j => j.userId === recipientId)?.userName || 'Jogador',
          nomeArquivo: newItem.nome,
          tipoItem: newItem.tipo as any,
          descricao: newItem.descricao,
          conteudoTexto: newItem.conteudoArquivo,
          pesoKg: newItem.pesoKg,
          valorPO: newItem.valorPO,
          raridade: newItem.raridade,
          dataEnvio: new Date().toLocaleDateString('pt-BR'),
        },
        ...prev.arquivosEnviados,
      ],
    }));
  };

  // Jogador solicita aprovação do Mestre para compras ou alterações
  const handleRequestMasterApproval = (partialReq: Partial<SheetChangeRequest>) => {
    const req: SheetChangeRequest = {
      id: 'req_' + Date.now(),
      salaId: room.id,
      jogadorId: character.userId,
      jogadorNome: character.userName,
      personagemNome: character.nome,
      tipo: partialReq.tipo || 'compra_loja',
      titulo: partialReq.titulo || 'Alteração na Ficha',
      descricao: partialReq.descricao || '',
      dadosAlteracao: partialReq.dadosAlteracao,
      status: 'pendente',
      criadoEm: Date.now(),
    };

    setRoom(prev => ({
      ...prev,
      solicitacoesFicha: [req, ...prev.solicitacoesFicha],
    }));
  };

  // Mestre aprova a alteração da ficha
  const handleApproveChangeRequest = (request: SheetChangeRequest) => {
    setRoom(prev => ({
      ...prev,
      solicitacoesFicha: prev.solicitacoesFicha.map(s =>
        s.id === request.id ? { ...s, status: 'aprovado' } : s
      ),
    }));

    // Se foi compra de item na loja, debita ouro e entrega arma
    if (request.tipo === 'compra_loja' && request.dadosAlteracao?.arma) {
      const arma = request.dadosAlteracao.arma;
      const custo = request.dadosAlteracao.custoPO || 0;

      if (request.jogadorId === character.userId || request.jogadorId === 'guest') {
        const itemComprado: InventoryItem = {
          id: 'arma_aprovada_' + Date.now(),
          nome: arma.nome,
          tipo: 'arma',
          quantidade: 1,
          pesoKg: arma.pesoKg,
          valorPO: arma.precoPO,
          raridade: arma.categoria === 'Arcana / Alquímica' ? 'Incomum' : 'Comum',
          descricao: `${arma.descricao} (Dano: ${arma.danoDado} ${arma.danoTipo} - Aprovado pelo Mestre)`,
          equipavel: true,
          equipado: true,
          origemMestre: true,
        };

        setCharacter(prev => ({
          ...prev,
          moedas: {
            ...prev.moedas,
            po: Math.max(0, (prev.moedas?.po || 0) - custo),
          },
          inventario: [itemComprado, ...prev.inventario],
        }));
      }
    }

    alert(`✅ Solicitação "${request.titulo}" de ${request.jogadorNome} aprovada pelo Mestre com sucesso!`);
  };

  // Mestre recusa a alteração
  const handleRejectChangeRequest = (requestId: string, reason?: string) => {
    setRoom(prev => ({
      ...prev,
      solicitacoesFicha: prev.solicitacoesFicha.map(s =>
        s.id === requestId ? { ...s, status: 'recusado', respostaMestre: reason } : s
      ),
    }));
    alert('❌ A solicitação foi recusada pelo Mestre.');
  };

  const pendingApprovalsCount = room.solicitacoesFicha?.filter(s => s.status === 'pendente').length || 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans pb-20 md:pb-12">
      {/* Header com Status e Auth */}
      <Header
        character={character}
        onOpenQuickD20={() => setQuickD20Open(true)}
        onOpenAuth={() => setAuthModalOpen(true)}
      />

      {/* Navegação por Abas com Contador de Aprovações Pendentes */}
      <Navigation
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        pendingApprovalsCount={pendingApprovalsCount}
      />

      {/* Conteúdo Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'ficha' && (
          <CharacterSheetView
            character={character}
            onUpdateCharacter={handleUpdateCharacter}
          />
        )}

        {activeTab === 'sala_mestre' && (
          <MasterRoomHub
            room={room}
            isMaster={isMaster}
            currentUserId={character.userId}
            onUpdateRoom={setRoom}
            onSendFileToPlayer={handleSendFileToPlayer}
            onApproveChangeRequest={handleApproveChangeRequest}
            onRejectChangeRequest={handleRejectChangeRequest}
          />
        )}

        {activeTab === 'alquimia' && (
          <AlchemyLab
            character={character}
            onUpdateCharacter={handleUpdateCharacter}
          />
        )}

        {activeTab === 'treino' && (
          <TrainingAndMeditation
            character={character}
            onUpdateCharacter={handleUpdateCharacter}
          />
        )}

        {activeTab === 'narrativa' && (
          <InteractiveStory
            character={character}
            onUpdateCharacter={handleUpdateCharacter}
          />
        )}

        {activeTab === 'inventario' && (
          <InventoryView
            character={character}
            onUpdateCharacter={handleUpdateCharacter}
            onRequestMasterApproval={handleRequestMasterApproval}
          />
        )}

        {activeTab === 'ranking' && (
          <RankingsView character={character} />
        )}

        {activeTab === 'estatisticas' && (
          <PlayerStatsView
            character={character}
            onUpdateCharacter={handleUpdateCharacter}
          />
        )}

        {activeTab === 'notificacoes' && (
          <NotificationsPanel
            character={character}
            onUpdateCharacter={handleUpdateCharacter}
          />
        )}
      </main>

      {/* Modal de Autenticação Segura (OTP 6 dígitos + Google OAuth) */}
      {authModalOpen && (
        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          onSuccess={registeredUser => {
            setCharacter(prev => ({
              ...prev,
              userId: registeredUser.uid,
              userName: registeredUser.displayName,
              papelUsuario: registeredUser.papel || 'jogador',
            }));
            if (registeredUser.papel === 'mestre' || registeredUser.papel === 'mestre_jogador') {
              setActiveTab('sala_mestre');
            }
          }}
        />
      )}

      {/* Modal Rápido de D20 */}
      {quickD20Open && (
        <DiceRollerModal
          isOpen={quickD20Open}
          onClose={() => setQuickD20Open(false)}
          actionTitle="Rolagem Rápida D20"
          modifier={0}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <DiceRollProvider>
        <AppContent />
      </DiceRollProvider>
    </AuthProvider>
  );
}
