import { CharacterClass, ClassLevelUpTrial } from '../types/rpg';

export const CLASS_LEVEL_UP_TRIALS: Record<CharacterClass, ClassLevelUpTrial> = {
  'Mago': {
    classe: 'Mago',
    titulo: 'Transmutação da Centelha & Foco Astral',
    descricao: 'Para expandir seu grimório e transcender o círculo de conjuração, o Mago deve purificar reagentes químicos na Alquimia e meditar para alinhar sua mente aos planos arcanos.',
    desafioObrigatorio1: {
      tipo: 'alquimia',
      label: 'Destilar 1 Poção ou Síntese Alquímica com reagentes químicos',
      metaQtd: 1,
    },
    desafioObrigatorio2: {
      tipo: 'meditacao',
      label: 'Completar 1 Sessão de Meditação Arcana / Foco Mental',
      metaQtd: 1,
    },
    desafioOpcional: {
      tipo: 'treino',
      label: 'Condicionamento Físico de Evitação',
      bonusDescricao: '+2 PV Máximos Permanentes de bônus por vigor físico!',
    },
  },
  'Alquimista': {
    classe: 'Alquimista',
    titulo: 'Grande Obra & Síntese Rúnica',
    descricao: 'A elevação alquímica exige manipular o Codex Elementalis, fundir átomos em novas matrizes e meditar sobre os princípios herméticos.',
    desafioObrigatorio1: {
      tipo: 'alquimia',
      label: 'Fundir Elementos ou Destilar Poção no Laboratório Alquímico',
      metaQtd: 1,
    },
    desafioObrigatorio2: {
      tipo: 'meditacao',
      label: 'Meditação Hermética sobre as Leis da Matéria',
      metaQtd: 1,
    },
    desafioOpcional: {
      tipo: 'treino',
      label: 'Treino de Resistência a Toxinas e Vapores',
      bonusDescricao: '+1 na CA ou resistência corporal!',
    },
  },
  'Artífice': {
    classe: 'Artífice',
    titulo: 'Forja Mecano-Alquímica & Teoria Arcana',
    descricao: 'O artífice funde ligas metálicas na câmara de síntese e estuda geometrias dimensionais através da meditação.',
    desafioObrigatorio1: {
      tipo: 'alquimia',
      label: 'Síntese de Ligas Rúnicas ou Soluções Catalisadoras',
      metaQtd: 1,
    },
    desafioObrigatorio2: {
      tipo: 'meditacao',
      label: 'Cálculo Mental & Geometria Mágica no Santuário',
      metaQtd: 1,
    },
    desafioOpcional: {
      tipo: 'treino',
      label: 'Treino Físico de Marretagem & Forja Pesada',
      bonusDescricao: '+2 de Carga Máxima e +1 em Força!',
    },
  },
  'Bruxo': {
    classe: 'Bruxo',
    titulo: 'Pacto Oculto & Transe com o Patrono',
    descricao: 'Exige rituais meditativos de comunhão com a entidade patronal e destilação de elixires sombrios.',
    desafioObrigatorio1: {
      tipo: 'meditacao',
      label: 'Comunhão Espiritual com o Patrono Astral',
      metaQtd: 1,
    },
    desafioObrigatorio2: {
      tipo: 'alquimia',
      label: 'Elixir ou Óleo de Sacrifício Alquímico',
      metaQtd: 1,
    },
    desafioOpcional: {
      tipo: 'treino',
      label: 'Treino Físico de Sobrevivência',
      bonusDescricao: '+3 PV temporários em cada descanso!',
    },
  },
  'Bárbaro': {
    classe: 'Bárbaro',
    titulo: 'Vigor Titânico & Fúria Focada',
    descricao: 'O Bárbaro deve forjar músculos erguendo monólitos de pedra e canalizar a fúria ancestral através de meditação guerreira.',
    desafioObrigatorio1: {
      tipo: 'treino',
      label: 'Levantamento de Rochas ou Corrida de Guerra com Carga',
      metaQtd: 1,
    },
    desafioObrigatorio2: {
      tipo: 'meditacao',
      label: 'Meditação do Guerreiro: Canalização da Fúria e Foco Espiritual',
      metaQtd: 1,
    },
    desafioOpcional: {
      tipo: 'alquimia',
      label: 'Tinturas Alquímicas de Guerra e Raízes Estimulantes',
      bonusDescricao: '+2 de Dano Físico no primeiro ataque em combate!',
    },
  },
  'Guerreiro': {
    classe: 'Guerreiro',
    titulo: 'Disciplina Marcial & Mente de Estrategista',
    descricao: 'Domínio implacável das armas através de treino de força e foco tático adquirido no silêncio da meditação.',
    desafioObrigatorio1: {
      tipo: 'treino',
      label: 'Drill de Combate com Armas & Musculação de Guerra',
      metaQtd: 1,
    },
    desafioObrigatorio2: {
      tipo: 'meditacao',
      label: 'Meditação Tática de Visualização de Duelo',
      metaQtd: 1,
    },
    desafioOpcional: {
      tipo: 'alquimia',
      label: 'Aplicação de Óleos de Afiação Alquímica na Lâmina',
      bonusDescricao: '+1 permanente de Ataque com Arma!',
    },
  },
  'Paladino': {
    classe: 'Paladino',
    titulo: 'Juramento Sagrado & Purificação do Templo',
    descricao: 'O Paladino necessita de vigor corporal para empunhar armaduras pesadas e vigílias meditativas sob a luz dos deuses.',
    desafioObrigatorio1: {
      tipo: 'treino',
      label: 'Treinamento de Armadura e Força Sagrada',
      metaQtd: 1,
    },
    desafioObrigatorio2: {
      tipo: 'meditacao',
      label: 'Vigília Sagrada de Meditação e Comunhão Divina',
      metaQtd: 1,
    },
    desafioOpcional: {
      tipo: 'alquimia',
      label: 'Destilação de Água Benta Alquímica',
      bonusDescricao: '+5 PV de Cura Divina adicional!',
    },
  },
  'Clérigo': {
    classe: 'Clérigo',
    titulo: 'Orações Arcanas & Bálsamos de Salvação',
    descricao: 'Comunhão profunda com as divindades por meio de meditação e manipulação de unguentos sagrados com compostos da terra.',
    desafioObrigatorio1: {
      tipo: 'meditacao',
      label: 'Comunhão com o Panteão e Transe Sagrado',
      metaQtd: 1,
    },
    desafioObrigatorio2: {
      tipo: 'alquimia',
      label: 'Preparo de Bálsamo Curativo ou Água Purificada',
      metaQtd: 1,
    },
    desafioOpcional: {
      tipo: 'treino',
      label: 'Postura Marcial com Maça e Escudo',
      bonusDescricao: '+1 na Classe de Armadura (CA)!',
    },
  },
  'Druida': {
    classe: 'Druida',
    titulo: 'Harmonia Elemental & Sintonia com a Terra',
    descricao: 'União da sabedoria dos ciclos naturais (meditação xamânica) com a extração de essências puras dos elementos primordiais.',
    desafioObrigatorio1: {
      tipo: 'meditacao',
      label: 'Transe Xamânico da Árvore-Mãe',
      metaQtd: 1,
    },
    desafioObrigatorio2: {
      tipo: 'alquimia',
      label: 'Destilação de Elixir de Seiva e Minerais Primordiais',
      metaQtd: 1,
    },
    desafioOpcional: {
      tipo: 'treino',
      label: 'Agilidade Selvagem e Corrida com Feras',
      bonusDescricao: '+1,5m no Deslocamento!',
    },
  },
  'Ladino': {
    classe: 'Ladino',
    titulo: 'Reflexos de Sombra & Óleos Venenosos',
    descricao: 'Agilidade corporal acrobática e preparação química de pós cegantes e toxinas de precisão.',
    desafioObrigatorio1: {
      tipo: 'treino',
      label: 'Circuito de Agilidade, Acrobacia e Furtividade',
      metaQtd: 1,
    },
    desafioObrigatorio2: {
      tipo: 'alquimia',
      label: 'Extração de Reagentes de Mercúrio ou Ácido Alquímico',
      metaQtd: 1,
    },
    desafioOpcional: {
      tipo: 'meditacao',
      label: 'Respiração Silenciosa e Supressão de Passos',
      bonusDescricao: '+2 na Iniciativa e Furtividade!',
    },
  },
  'Bardo': {
    classe: 'Bardo',
    titulo: 'Afinação Harmônica & Foco da Musa',
    descricao: 'Equilíbrio mental meditativo para dominar canções de criação somado à síntese de pós de brilho e licores inspiradores.',
    desafioObrigatorio1: {
      tipo: 'meditacao',
      label: 'Meditação Sonora & Alinhamento com a Música das Esferas',
      metaQtd: 1,
    },
    desafioObrigatorio2: {
      tipo: 'alquimia',
      label: 'Síntese de Elixir de Eloquência ou Pó Cintilante',
      metaQtd: 1,
    },
    desafioOpcional: {
      tipo: 'treino',
      label: 'Dança das Lâminas e Treino de Flexibilidade',
      bonusDescricao: '+1 Dado de Inspiração Bárdica gratuito!',
    },
  },
  'Feiticeiro': {
    classe: 'Feiticeiro',
    titulo: 'Despertar da Linhagem & Controle do Caos',
    descricao: 'Meditação para controlar a magia que corre em suas veias e catalisação de elementos químicos para estabilizar a aura.',
    desafioObrigatorio1: {
      tipo: 'meditacao',
      label: 'Meditação de Contenção da Força Dracônica/Mágica',
      metaQtd: 1,
    },
    desafioObrigatorio2: {
      tipo: 'alquimia',
      label: 'Manipulação de Cristais e Fogo Elemental',
      metaQtd: 1,
    },
    desafioOpcional: {
      tipo: 'treino',
      label: 'Resistência Física ao Recuo da Magia Selvagem',
      bonusDescricao: '+2 Pontos de Feitiçaria Extras!',
    },
  },
};
