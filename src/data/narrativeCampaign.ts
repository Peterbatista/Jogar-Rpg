import { Attributes } from '../types/rpg';

export interface StoryChoice {
  id: string;
  texto: string;
  exigeTeste?: {
    atributo: keyof Attributes;
    periciaNome: string;
    dcBase: number;
  };
  proximoCapituloId: string;
  recompensaXp?: number;
  recompensaElemento?: { simbolo: string; quantidade: number };
  recompensaItem?: string;
  danoEmCasoDeFalha?: number;
  textoSucesso?: string;
  textoFalha?: string;
}

export interface StoryChapter {
  id: string;
  titulo: string;
  subtitulo: string;
  imagemTema: string;
  textoNarrativo: string;
  opcoes: StoryChoice[];
}

export const NARRATIVE_CHAPTERS: { [id: string]: StoryChapter } = {
  capitulo_1: {
    id: 'capitulo_1',
    titulo: 'Capítulo I: A Cripta dos Alquimistas Esquecidos',
    subtitulo: 'As ruínas sob a cidadela de Aethelgard',
    imagemTema: '🏛️',
    textoNarrativo: `O ar é pesado, saturado com o odor acre de enxofre e ozônio antigo. Você avança pelas escadarias de pedra da lendária Cripta de Vaelok, um arquimago alquimista do Primeiro Ciclo. Diante de você, um portão monumental de ferro fundido e bronze bloqueia o acesso ao sanctum sanctorum. 

No centro da abóbada, uma runa carmesim pulsa com energia instável conectada a três frascos de destilação de mercúrio. Ao lado, uma passagem estreita de entulho parece levar a uma fenda lateral, mas a rocha range ameaçando desabar.

O que você deseja fazer?`,
    opcoes: [
      {
        id: 'opcao_arrombar_portao',
        texto: '[FORÇA] Forçar o portão de ferro com pura potência muscular.',
        exigeTeste: {
          atributo: 'forca',
          periciaNome: 'Atletismo (For)',
          dcBase: 12,
        },
        proximoCapituloId: 'capitulo_2_salaprofunda',
        recompensaXp: 100,
        recompensaElemento: { simbolo: 'Fe', quantidade: 3 },
        danoEmCasoDeFalha: 4,
        textoSucesso: 'Com um urro retumbante e apoio dos pés na rocha fria, as trancas de ferro cedem em estalo metálico! Você abre caminho triunfante e recupera fragmentos de Ferro rúnico.',
        textoFalha: 'O metal não cede e o impacto ressoa violentamente em seus ombros. Você sofre 4 de dano por estresse físico, mas consegue entreabrir uma fresta com esforço extremo.',
      },
      {
        id: 'opcao_desarmar_runa',
        texto: '[INTELIGÊNCIA] Decifrar o circuito de transmutação e desarmar a runa elemental.',
        exigeTeste: {
          atributo: 'inteligencia',
          periciaNome: 'Arcanismo (Int)',
          dcBase: 13,
        },
        proximoCapituloId: 'capitulo_2_laboratorio',
        recompensaXp: 120,
        recompensaElemento: { simbolo: 'Hg', quantidade: 2 },
        danoEmCasoDeFalha: 5,
        textoSucesso: 'Você identifica a ressonância de mercúrio e redireciona os elétrons da runa, estabilizando a energia em um estalo cristalino. Você extrai 2 gotas de Mercúrio Puro!',
        textoFalha: 'A mistura química reage rápido demais! Uma labareda de chamas esmeralda explode causando 5 de dano de fogo antes do selo desativar.',
      },
      {
        id: 'opcao_infiltrar_fenda',
        texto: '[DESTREZA] Deslizar silenciosamente pela fenda de entulho entre as rochas.',
        exigeTeste: {
          atributo: 'destreza',
          periciaNome: 'Acrobacia (Des)',
          dcBase: 11,
        },
        proximoCapituloId: 'capitulo_2_catacumbas',
        recompensaXp: 90,
        recompensaElemento: { simbolo: 'Si', quantidade: 2 },
        danoEmCasoDeFalha: 3,
        textoSucesso: 'Com movimentos fluidos como o vento, você serpenteia entre as pedras sem derrubar um único grão de poeira, encontrando geodos de Silício puro.',
        textoFalha: 'Uma laje escorrega e prende sua perna por instantes, causando escoriações (3 de dano), mas você consegue se libertar para o outro lado.',
      },
      {
        id: 'opcao_analisar_aura',
        texto: '[SABEDORIA] Meditar para intuir os fluxos energéticos e a armadilha.',
        exigeTeste: {
          atributo: 'sabedoria',
          periciaNome: 'Percepção (Sab)',
          dcBase: 11,
        },
        proximoCapituloId: 'capitulo_2_laboratorio',
        recompensaXp: 110,
        recompensaElemento: { simbolo: 'Ag', quantidade: 1 },
        danoEmCasoDeFalha: 2,
        textoSucesso: 'Seu sexto sentido aponta uma alavanca de prata oculta sob o pó. Ao girá-la suavemente, o mecanismo se abre em harmonia perfeita, concedendo 1 Prata Lunar.',
        textoFalha: 'Você hesita e um mecanismo secundário solta um dardo atordoante (2 de dano), mas o portal finalmente destrava.',
      },
    ],
  },
  capitulo_2_salaprofunda: {
    id: 'capitulo_2_salaprofunda',
    titulo: 'Capítulo II: O Guardião de Quimera e Ferro',
    subtitulo: 'A Forja dos Elementos Primordiais',
    imagemTema: '⚔️',
    textoNarrativo: `O ar na câmara é escaldante. No centro ergue-se uma forja colossal com engrenagens de titânio e um Golem de Latão alimentado por um coração de Urânio luminescente. Seus olhos mecânicos fixam em você, e o chão estremece conforme ele empunha um martelo de guerra.

Em uma bancada de apoio, há pós reagentes de chumbo e frascos de ácido, além de cabos condutores de eletricidade presos ao teto.`,
    opcoes: [
      {
        id: 'opcao_combate_frontal',
        texto: '[FORÇA] Enfrentar o Golem em combate corporal direto, mirando suas juntas.',
        exigeTeste: {
          atributo: 'forca',
          periciaNome: 'Atletismo (For)',
          dcBase: 14,
        },
        proximoCapituloId: 'capitulo_3_climax',
        recompensaXp: 180,
        recompensaElemento: { simbolo: 'Ti', quantidade: 2 },
        danoEmCasoDeFalha: 8,
        textoSucesso: 'Seu golpe encontra a junta principal da engrenagem! O Golem recua com faíscas azuis e seu braço desarma, liberando placas de Titânio puríssimo!',
        textoFalha: 'O martelo do autômato atinge de raspão seu peito com força esmagadora (8 de dano), mas você consegue golpear seu eixo ventral.',
      },
      {
        id: 'opcao_jogar_chumbo',
        texto: '[INTELIGÊNCIA] Arremessar o chumbo denso no núcleo para sufocar a reação radioativa.',
        exigeTeste: {
          atributo: 'inteligencia',
          periciaNome: 'Investigação (Int)',
          dcBase: 13,
        },
        proximoCapituloId: 'capitulo_3_climax',
        recompensaXp: 200,
        recompensaElemento: { simbolo: 'Pb', quantidade: 3 },
        danoEmCasoDeFalha: 6,
        textoSucesso: 'Genial! A poeira de chumbo bloqueia as partículas de fissão do núcleo. As luzes do guardião piscam e ele entra em modo dormente seguro.',
        textoFalha: 'O chumbo atenua parcialmente o reator, mas uma onda de calor emana ferindo você em 6 PV antes da paralisação completa.',
      },
      {
        id: 'opcao_sobrecarregar_eletricidade',
        texto: '[DESTREZA] Cortar os cabos condutores de cobre e eletrificar a base do monstro.',
        exigeTeste: {
          atributo: 'destreza',
          periciaNome: 'Prestidigitação (Des)',
          dcBase: 12,
        },
        proximoCapituloId: 'capitulo_3_climax',
        recompensaXp: 160,
        recompensaElemento: { simbolo: 'Cu', quantidade: 3 },
        danoEmCasoDeFalha: 5,
        textoSucesso: 'Os cabos de cobre chicoteiam faíscas elétricas de alta voltagem direto nas pernas do Golem, provocando um curto-circuito espetacular!',
        textoFalha: 'Você leva um choque residual de 5 de dano ao manejar os cabos descapados, mas consegue conectar a carga no autômato.',
      },
    ],
  },
  capitulo_2_laboratorio: {
    id: 'capitulo_2_laboratorio',
    titulo: 'Capítulo II: O Herbário e Laboratório Hermético',
    subtitulo: 'A Fonte de Todas as Panaceias',
    imagemTema: '🧪',
    textoNarrativo: `Você entra em um laboratório preservado em estase temporal. Prateleiras exibem centenas de frascos graduados, retortas de vidro de borossilicato e sementes de plantas alucinógenas e regenerativas cultivadas sob luz mágica solar.

Sobre o atril central, o Diário de Pesquisa de Vaelok repousa aberto, prometendo a fórmula da Pedra Filosofal e do Elixir Áureo. Porém, o frasco de sustentação do teto está rachado e goteja um ácido gasoso.`,
    opcoes: [
      {
        id: 'opcao_sintetizar_antidoto',
        texto: '[SABEDORIA / MEDICINA] Neutralizar o ácido com carbonato e colher as essências raras.',
        exigeTeste: {
          atributo: 'sabedoria',
          periciaNome: 'Medicina (Sab)',
          dcBase: 12,
        },
        proximoCapituloId: 'capitulo_3_climax',
        recompensaXp: 170,
        recompensaElemento: { simbolo: 'Au', quantidade: 1 },
        danoEmCasoDeFalha: 4,
        textoSucesso: 'Reação estequiométrica perfeita! Você estanca a corrosão e resgata uma pepita alquímica de Ouro Solare!',
        textoFalha: 'Vapores ácidos irritam seus pulmões (4 de dano), mas você consegue salvar os pergaminhos intactos.',
      },
      {
        id: 'opcao_estudar_diario',
        texto: '[INTELIGÊNCIA] Decifrar os hieróglifos atômicos para aprender a receita lendária.',
        exigeTeste: {
          atributo: 'inteligencia',
          periciaNome: 'História (Int)',
          dcBase: 13,
        },
        proximoCapituloId: 'capitulo_3_climax',
        recompensaXp: 210,
        recompensaElemento: { simbolo: 'Pt', quantidade: 1 },
        danoEmCasoDeFalha: 5,
        textoSucesso: 'Os mistérios do Codex se desvelam diante de seus olhos! Você assimila a Grande Obra e recebe 1 Platina Pura.',
        textoFalha: 'Uma runa de confusão mental drena suas energias psíquicas causando 5 de dano, mas os segredos foram gravados em sua memória.',
      },
    ],
  },
  capitulo_2_catacumbas: {
    id: 'capitulo_2_catacumbas',
    titulo: 'Capítulo II: As Galerias Subterrâneas',
    subtitulo: 'O Ninho das Serpentes de Cristal',
    imagemTema: '🐍',
    textoNarrativo: `A fenda conduz você a um labirinto de estalactites cintilantes. Criaturas serpentinas compostas de bismuto e quartzo rastejam nas frestas, atraídas pela temperatura corporal de intrusos. No final da galeria, uma escadaria circular ascende de volta à torre do Codex.`,
    opcoes: [
      {
        id: 'opcao_furtividade_serpentes',
        texto: '[DESTREZA] Camuflar seus passos e deslizar nas sombras entre as serpentes.',
        exigeTeste: {
          atributo: 'destreza',
          periciaNome: 'Furtividade (Des)',
          dcBase: 12,
        },
        proximoCapituloId: 'capitulo_3_climax',
        recompensaXp: 160,
        recompensaElemento: { simbolo: 'Bi', quantidade: 2 },
        danoEmCasoDeFalha: 6,
        textoSucesso: 'Você se move como um fantasma. Ao passar, coleta fragmentos cristalinos de Bismuto arco-íris sem ser notado!',
        textoFalha: 'Uma cascavel de cristal morde seu tornozelo liberando veneno térmico (6 de dano), mas você dispara em direção à saída.',
      },
    ],
  },
  capitulo_3_climax: {
    id: 'capitulo_3_climax',
    titulo: 'Capítulo III: O Coração do Codex Ancestral',
    subtitulo: 'A Transmutação do Destino',
    imagemTema: '🌟',
    textoNarrativo: `Você alcançou a câmara estelar do topo do templo. No centro, sobre um pedestal de mármore e ouro, flutua o Orbe de Todas as Substâncias, irradiando calor cósmico. 

O espírito de Vaelok manifesta-se em aura translúcida: "Aventureiro, você provou seu valor marcial, sua destreza e seu intelecto. Diante de ti está o legado da verdadeira Alquimia. Como você utilizará este poder para moldar as eras vindouras?"`,
    opcoes: [
      {
        id: 'opcao_selar_cura',
        texto: 'Devotar o Codex para a cura de todas as pestes e criação de panaceias universais.',
        proximoCapituloId: 'epilogo_sagrado',
        recompensaXp: 400,
        recompensaElemento: { simbolo: 'Au', quantidade: 3 },
        textoSucesso: 'O orbe brilha em ouro puro e azul celestial. Seus atributos são permanentemente abençoados com vitalidade sagrada!',
      },
      {
        id: 'opcao_forjar_armas',
        texto: 'Canalizar a transmutação para a forja de armas titânicas invencíveis e defesa do reino.',
        proximoCapituloId: 'epilogo_marcial',
        recompensaXp: 400,
        recompensaElemento: { simbolo: 'Ti', quantidade: 3 },
        textoSucesso: 'Faíscas incandescentes moldam ligas inquebráveis ao seu redor. Você se torna uma lenda de força viva!',
      },
      {
        id: 'opcao_transcender_arcano',
        texto: 'Fundir sua própria consciência aos prótons cósmicos e transcender os limites mortais.',
        proximoCapituloId: 'epilogo_astral',
        recompensaXp: 500,
        recompensaElemento: { simbolo: 'U', quantidade: 2 },
        textoSucesso: 'O universo se abre como um livro límpido. Sua mente conecta-se à Tecidura Cósmica da Sabedoria infinita!',
      },
    ],
  },
  epilogo_sagrado: {
    id: 'epilogo_sagrado',
    titulo: 'Epílogo: O Renascimento da Alvorada',
    subtitulo: 'Patrono da Vida e da Panaceia',
    imagemTema: '🕊️',
    textoNarrativo: `Graças às suas escolhas virtuosas, o conhecimento do Codex Elementalis foi restaurado ao mundo. Elixires sagrados extinguiram pestes centenárias e os hospitais das grandes capitais agora reverenciam seu nome nos livros de história. 

Seu personagem atingiu o renome lendário! Você pode continuar treinando, destilando elixires e dominando novos elementos na mesa de jogo!`,
    opcoes: [
      {
        id: 'opcao_reiniciar_jornada',
        texto: 'Revisitar a saga em outra dificuldade ou continuar explorando o mundo.',
        proximoCapituloId: 'capitulo_1',
      },
    ],
  },
  epilogo_marcial: {
    id: 'epilogo_marcial',
    titulo: 'Epílogo: O Senhor da Forja Inquebrável',
    subtitulo: 'Baluaerte dos Povos Livres',
    imagemTema: '🛡️',
    textoNarrativo: `Com as ligas sintetizadas de titânio e diamante arcano, suas defesas tornaram o reino inexpugnável contra as invasões do Vazio e das hordas orcs. Bardos cantam suas façanhas marciais por todas as tavernas!

Seu nome está gravado para sempre no Hall dos Campeões do Ranking Global!`,
    opcoes: [
      {
        id: 'opcao_reiniciar_jornada',
        texto: 'Reiniciar a saga em outra dificuldade.',
        proximoCapituloId: 'capitulo_1',
      },
    ],
  },
  epilogo_astral: {
    id: 'epilogo_astral',
    titulo: 'Epílogo: O Olho do Cosmos',
    subtitulo: 'O Primeiro Mestre Transmutador',
    imagemTema: '🌌',
    textoNarrativo: `Você transcendeu o limiar entre a química material e a magia pura. Para você, cada próton e nêutron dança ao ritmo do seu pensamento. Nem o tempo nem o espaço conseguem conter a amplitude da sua iluminação astral.

Você atingiu o ápice da sabedoria mística!`,
    opcoes: [
      {
        id: 'opcao_reiniciar_jornada',
        texto: 'Reiniciar a jornada narrativa.',
        proximoCapituloId: 'capitulo_1',
      },
    ],
  },
};
