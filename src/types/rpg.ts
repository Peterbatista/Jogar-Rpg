export type CharacterClass =
  | 'Guerreiro'
  | 'Mago'
  | 'Ladino'
  | 'Clérigo'
  | 'Bárbaro'
  | 'Paladino'
  | 'Bruxo'
  | 'Bardo'
  | 'Druida'
  | 'Feiticeiro'
  | 'Artífice'
  | 'Alquimista';

export type CharacterRace =
  | 'Humano'
  | 'Elfo'
  | 'Anão'
  | 'Halfling'
  | 'Draconato'
  | 'Gnomo'
  | 'Meio-Elfo'
  | 'Meio-Orc'
  | 'Tiefling'
  | 'Golias'
  | 'Tabaxi'
  | 'Aasimar'
  | 'Forjado Bélico'
  | 'Centauro'
  | 'Bugbear'
  | 'Tartaruga (Tortle)';

export interface Attributes {
  forca: number;
  destreza: number;
  constituicao: number;
  inteligencia: number;
  sabedoria: number;
  carisma: number;
}

export interface CombatStats {
  pvMax: number;
  pvAtual: number;
  pvTemp: number;
  classeArmd: number;
  iniciativa: string;
  deslocamento: string;
  dadosVida: string;
  bonusProf: string;
  inspiracao: boolean;
  sucessosMorte: number;
  fracassosMorte: number;
  armaPrincipal: string;
  ataqueBonus: string;
  danoArma: string;
}

export interface SpellcastingStats {
  classeConjurador: string;
  habilidadeChave: string;
  cdTr: number;
  bonusAtaque: string;
  espacosTotal: number[];
  espacosUsados: number[];
  truques: string[];
  magiasConhecidas: string[];
}

export interface TemporaryBuff {
  id: string;
  nome: string;
  atributo: keyof Attributes | 'ca' | 'pvTemp' | 'deslocamento';
  valor: number;
  duracaoMinutos: number;
  criadoEm: number; // timestamp
  origem: 'alquimia' | 'treino' | 'meditacao' | 'narrativa';
  descricao: string;
}

export interface ChemicalElement {
  numeroAtomico: number; // Z (prótons = elétrons)
  simbolo: string;
  nome: string;
  massaAtomica: number; // A
  neutrons: number; // N = Math.round(A) - Z
  protons: number; // = Z
  eletrons: number; // = Z
  categoria:
    | 'Metais Alcalinos'
    | 'Metais Alcalinoterrosos'
    | 'Metais de Transição'
    | 'Semimetais'
    | 'Não-Metais'
    | 'Halogênios'
    | 'Gases Nobres'
    | 'Lantanídeos/Actinídeos'
    | 'Elementos Primordiais';
  runaAlquimica: string; // Ex: ᚺ, ᛋ, ᛏ, ᛃ, ᛚ, ᛖ, etc.
  nomeRuna: string; // Ex: Hagalaz, Sowilo, Tiwaz, Jera, Laguz, Ehwaz
  nivelAlquimiaRequerido: number;
  propriedadeAlquimica: string;
  ressonanciaMagica: string;
  corHex: string;
}

export interface AlchemyPotion {
  id: string;
  nome: string;
  nivelRequerido: number;
  elementosNecessarios: { simbolo: string; quantidade: number }[];
  tempoPreparoSegundos: number;
  cdAlquimica: number;
  descricao: string;
  efeitoBuff?: {
    atributo: keyof Attributes | 'ca' | 'pvTemp' | 'deslocamento';
    valor: number;
    duracaoMinutos: number;
  };
  efeitoDescricao: string;
  tipo: 'cura' | 'fortificacao' | 'mental' | 'combate' | 'utilidade' | 'lendario';
  icone: string;
}

export interface InventoryItem {
  id: string;
  nome: string;
  tipo: 'arma' | 'armadura' | 'pocao' | 'ingrediente' | 'pergaminho' | 'reliquia' | 'outro' | 'documento';
  quantidade: number;
  pesoKg: number;
  valorPO: number;
  raridade: 'Comum' | 'Incomum' | 'Raro' | 'Épico' | 'Lendário';
  descricao: string;
  equipavel?: boolean;
  equipado?: boolean;
  slotEquipamento?: 'cabeca' | 'tronco' | 'maoPrincipal' | 'maoSecundaria' | 'amuleto' | 'anel';
  bonusAtributo?: {
    atributo: keyof Attributes;
    valor: number;
  };
  pocaoRefId?: string;
  origemMestre?: boolean;
  anexoMestreUrl?: string;
  conteudoArquivo?: string;
  noEspacoDimensional?: boolean;
}

export interface PhysicalTrainingActivity {
  id: string;
  nome: string;
  nivelRequerido: number;
  duracaoSegundos: number;
  expRecompensa: number;
  atributoFoco: 'forca' | 'constituicao' | 'destreza';
  buffValor: number;
  buffDuracaoMinutos: number;
  descricao: string;
  icone: string;
}

export interface MeditationActivity {
  id: string;
  nome: string;
  nivelRequerido: number;
  duracaoSegundos: number;
  expRecompensa: number;
  atributoFoco: 'inteligencia' | 'sabedoria';
  buffValor: number;
  buffDuracaoMinutos: number;
  descricao: string;
  icone: string;
}

export interface Achievement {
  id: string;
  titulo: string;
  descricao: string;
  categoria: 'alquimia' | 'treino' | 'meditacao' | 'combate' | 'narrativa';
  progressoAtual: number;
  progressoAlvo: number;
  desbloqueada: boolean;
  recompensaXp: number;
  icone: string;
}

export interface CharacterSheet {
  id: string;
  userId: string;
  userName: string;
  nome: string;
  raca: CharacterRace;
  classe: CharacterClass;
  nivel: number;
  experiencia: number;
  antecedente: string;
  tendencia: string;
  historia: string;
  aparencia?: string;
  atributos: Attributes;
  combate: CombatStats;
  magias: SpellcastingStats;
  detalhes: {
    tracos?: string;
    ideais?: string;
    ligacoes?: string;
    defeitos?: string;
    idiomas?: string;
    proficienciasArmas?: string;
  };
  inventario: InventoryItem[];
  moedas: {
    pc: number; // Peças de Cobre
    pp: number; // Peças de Prata
    pe: number; // Peças de Electro
    po: number; // Peças de Ouro
    pl: number; // Peças de Platina
  };
  elementosEstoque: { [simbolo: string]: number };
  buffs: TemporaryBuff[];
  estatisticas: {
    pocoesCriadas: number;
    treinosCompletados: number;
    segundosMeditados: number;
    rolagensD20Total: number;
    criticos20: number;
    falhasCriticas1: number;
    capitulosConcluidos: number;
  };
  conquistas: Achievement[];
  narrativaProgresso: {
    capituloAtualId: string;
    dificuldade: 'facil' | 'normal' | 'dificil' | 'hardcore';
    decisoesHistorico: string[];
    hpNarrativa: number;
  };
  papelUsuario?: UserRole;
  salaMesaId?: string;
  armazenamentoEspacialDesbloqueado?: boolean;
  modoAprovacaoMestre?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RankingEntry {
  characterId: string;
  characterName: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  classe: CharacterClass;
  raca: CharacterRace;
  nivel: number;
  experiencia: number;
  alquimiaCrafts: number;
  treinoPontos: number;
  meditacaoMinutos: number;
  conquistasQtd: number;
  scoreTotal: number;
  titulo: string;
  updatedAt: string;
}

export interface DailyChallenge {
  id: string;
  titulo: string;
  descricao: string;
  recompensaXp: number;
  recompensaItem?: string;
  tipo: 'alquimia' | 'treino' | 'meditacao' | 'narrativa';
  meta: number;
  progresso: number;
  concluido: boolean;
  resgatado: boolean;
}

export interface SynthesizedCompound {
  id: string;
  nome: string;
  descricao: string;
  elementosUsados: { simbolo: string; quantidade: number }[];
  totalProtons: number;
  totalEletrons: number;
  totalNeutrons: number;
  massaTotal: number;
  raridade: 'Comum' | 'Incomum' | 'Raro' | 'Épico' | 'Lendário';
  tipo: 'solvente' | 'liga_metalica' | 'elixir' | 'catalisador' | 'pedra_filosofal';
  efeitoDescricao: string;
  icone: string;
  buff?: {
    atributo: keyof Attributes | 'ca' | 'pvTemp' | 'deslocamento';
    valor: number;
    duracaoMinutos: number;
  };
}

export interface ClassLevelUpTrial {
  classe: CharacterClass;
  titulo: string;
  descricao: string;
  desafioObrigatorio1: {
    tipo: 'alquimia' | 'treino' | 'meditacao';
    label: string;
    metaQtd: number;
  };
  desafioObrigatorio2?: {
    tipo: 'alquimia' | 'treino' | 'meditacao';
    label: string;
    metaQtd: number;
  };
  desafioOpcional?: {
    tipo: 'alquimia' | 'treino' | 'meditacao';
    label: string;
    bonusDescricao: string;
  };
}

export interface DiceRollRecord {
  id: string;
  acao: string;
  dadoBase: string;
  rolagemNatural: number;
  modificador: number;
  total: number;
  cdOuCa?: number;
  isCritico: boolean;
  isFalhaCritica: boolean;
  sucesso?: boolean;
  detalhes: string;
  timestamp: number;
}

export type UserRole = 'jogador' | 'mestre' | 'mestre_jogador';

export interface RoomParticipant {
  userId: string;
  userName: string;
  userEmail: string;
  personagemNome?: string;
  classe?: CharacterClass;
  raca?: CharacterRace;
  nivel?: number;
  pvAtual?: number;
  pvMax?: number;
  status: 'online' | 'offline';
  armazenamentoEspacialLiberado: boolean;
  entrouEm: string;
}

export interface SheetChangeRequest {
  id: string;
  salaId: string;
  jogadorId: string;
  jogadorNome: string;
  personagemNome: string;
  tipo: 'compra_loja' | 'alteracao_atributos' | 'subir_nivel' | 'edicao_livre' | 'desbloqueio_espacial';
  titulo: string;
  descricao: string;
  dadosAlteracao: any;
  status: 'pendente' | 'aprovado' | 'recusado';
  criadoEm: number;
  respostaMestre?: string;
}

export interface MasterChallenge {
  id: string;
  salaId: string;
  mestreId: string;
  mestreNome: string;
  destinatario: 'todos' | string; // 'todos' ou userId do jogador
  destinatarioNome: string;
  titulo: string;
  descricao: string;
  tipo: 'alquimia' | 'treino' | 'meditacao' | 'narrativa';
  meta: number;
  progresso: number;
  recompensaXp: number;
  recompensaItem?: string;
  concluido: boolean;
  dataEnvio: string;
  notificacaoEnviada: {
    email: boolean;
    celular: boolean;
  };
}

export interface MasterFileTransfer {
  id: string;
  salaId: string;
  mestreId: string;
  mestreNome: string;
  destinatarioId: string; // userId do jogador
  destinatarioNome: string;
  nomeArquivo: string;
  tipoItem: 'pergaminho' | 'documento' | 'mapa' | 'arma' | 'reliquia' | 'pocao';
  descricao: string;
  conteudoTexto?: string;
  pesoKg: number;
  valorPO: number;
  raridade: 'Comum' | 'Incomum' | 'Raro' | 'Épico' | 'Lendário';
  dataEnvio: string;
}

export interface TacticalMap {
  id: string;
  nome: string;
  ambiente: string;
  descricao: string;
  tamanhoGrid: string;
  salas: string[];
  armadilhasESegredos: string[];
  climaEAtmosfera: string;
  layoutVisualAscii?: string;
}

export interface MonsterNPC {
  id: string;
  nome: string;
  tipo: string;
  desafioCR: string;
  ca: number;
  pv: number;
  deslocamento: string;
  atributos: {
    for: number;
    des: number;
    con: number;
    int: number;
    sab: number;
    car: number;
  };
  habilidades: string[];
  acoesCombate: string[];
  lore: string;
}

export interface RewardItem {
  id: string;
  nome: string;
  tipo: 'arma' | 'armadura' | 'reliquia' | 'pocao' | 'pergaminho';
  raridade: 'Comum' | 'Incomum' | 'Raro' | 'Épico' | 'Lendário';
  pesoKg: number;
  valorPO: number;
  propriedadesMagicas: string;
  descricao: string;
}

export interface CampaignStory {
  id: string;
  titulo: string;
  sinopse: string;
  tema: string;
  nivelRecomendado: string;
  arcosNarrativos: {
    fase: string;
    titulo: string;
    detalhes: string;
  }[];
  ganchoAventura: string;
  mapas: TacticalMap[];
  monstrosENPCs: MonsterNPC[];
  itensRecompensa: RewardItem[];
  criadoEm: string;
}

export interface RPGRoom {
  id: string;
  codigo: string; // ex: CDX-7842
  nome: string;
  mestreId: string;
  mestreNome: string;
  mestreEmail: string;
  descricao: string;
  sistema: 'D&D 5e';
  limiteMaximo: 20; // Limite fixo de 20 pessoas por sala
  jogadores: RoomParticipant[];
  campanhas: CampaignStory[];
  desafiosMestre: MasterChallenge[];
  solicitacoesFicha: SheetChangeRequest[];
  arquivosEnviados: MasterFileTransfer[];
  ativa: boolean;
  createdAt: string;
}

