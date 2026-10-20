import { SynthesizedCompound } from '../types/rpg';

export interface SynthesisFormula {
  id: string;
  nome: string;
  descricao: string;
  reagentesNecessarios: { simbolo: string; quantidade: number }[];
  tipo: SynthesizedCompound['tipo'];
  raridade: SynthesizedCompound['raridade'];
  cdAlquimica: number;
  efeitoDescricao: string;
  icone: string;
  buff?: SynthesizedCompound['buff'];
}

export const SYNTHESIS_FORMULAS: SynthesisFormula[] = [
  {
    id: 'formula_solvente_agua',
    nome: 'Solvente Primordial (2H + 1O)',
    descricao: 'Água pura e ionizada com éter primordial, solvente perfeito para dissolver toxinas e regenerar tecidos.',
    reagentesNecessarios: [
      { simbolo: 'H', quantidade: 2 },
      { simbolo: 'O', quantidade: 1 },
    ],
    tipo: 'solvente',
    raridade: 'Comum',
    cdAlquimica: 10,
    efeitoDescricao: 'Recupera 15 PV e remove qualquer condição de envenenamento.',
    icone: '💧',
    buff: {
      atributo: 'constituicao',
      valor: 1,
      duracaoMinutos: 20,
    },
  },
  {
    id: 'formula_aco_damasco',
    nome: 'Liga de Aço Damasco Alquímico (1C + 2Fe)',
    descricao: 'Fusão de ferro nativo com átomos de carbono em matriz cristalina, produz lâminas inquebráveis.',
    reagentesNecessarios: [
      { simbolo: 'C', quantidade: 1 },
      { simbolo: 'Fe', quantidade: 2 },
    ],
    tipo: 'liga_metalica',
    raridade: 'Incomum',
    cdAlquimica: 12,
    efeitoDescricao: 'Material de forja que confere +2 de dano físico e corte perfurante a qualquer arma.',
    icone: '⚔️',
    buff: {
      atributo: 'forca',
      valor: 2,
      duracaoMinutos: 45,
    },
  },
  {
    id: 'formula_amalgame_aurea',
    nome: 'Amálgama Áurea da Pedra Filosofal (1Au + 1Hg)',
    descricao: 'A clássica transmutação hermética combinando mercúrio volátil com ouro sagrado solar.',
    reagentesNecessarios: [
      { simbolo: 'Au', quantidade: 1 },
      { simbolo: 'Hg', quantidade: 1 },
    ],
    tipo: 'pedra_filosofal',
    raridade: 'Raro',
    cdAlquimica: 15,
    efeitoDescricao: 'Transmuta 100 PO adicionais e concede aura de prestígio inato (+2 Carisma por 1 hora).',
    icone: '✨',
    buff: {
      atributo: 'carisma',
      valor: 2,
      duracaoMinutos: 60,
    },
  },
  {
    id: 'formula_polvora_dragao',
    nome: 'Pólvora Rúnica de Dragão (1S + 1P + 1K)',
    descricao: 'Composto pirotécnico instável de enxofre, fósforo e potássio que detona em labaredas de plasma.',
    reagentesNecessarios: [
      { simbolo: 'S', quantidade: 1 },
      { simbolo: 'P', quantidade: 1 },
      { simbolo: 'K', quantidade: 1 },
    ],
    tipo: 'catalisador',
    raridade: 'Raro',
    cdAlquimica: 14,
    efeitoDescricao: 'Bomba arremessável: detona causando 3d6 de dano de fogo em área de 4,5 metros (CD 14 DES).',
    icone: '💥',
  },
  {
    id: 'formula_cristal_psiquico',
    nome: 'Cristal de Ressonância Mental (1Ag + 1Si)',
    descricao: 'Prata pura entrelaçada com silício puro, agindo como amplificador de sinapses neuronais e foco arcano.',
    reagentesNecessarios: [
      { simbolo: 'Ag', quantidade: 1 },
      { simbolo: 'Si', quantidade: 1 },
    ],
    tipo: 'elixir',
    raridade: 'Incomum',
    cdAlquimica: 13,
    efeitoDescricao: '+2 em Sabedoria e Inteligência para conjuração de truques e magias por 40 minutos.',
    icone: '🔮',
    buff: {
      atributo: 'inteligencia',
      valor: 2,
      duracaoMinutos: 40,
    },
  },
  {
    id: 'formula_levitacao_serena',
    nome: 'Gás de Levitação Quântica (1Li + 2He)',
    descricao: 'Mistura ultraleve de lítio ionizado em hélio nobre, reduz a gravidade pessoal ao extremo.',
    reagentesNecessarios: [
      { simbolo: 'Li', quantidade: 1 },
      { simbolo: 'He', quantidade: 2 },
    ],
    tipo: 'elixir',
    raridade: 'Raro',
    cdAlquimica: 14,
    efeitoDescricao: 'Permite flutuar a até 3 metros do chão por 30 minutos, imune a dano de queda.',
    icone: '🪶',
    buff: {
      atributo: 'deslocamento',
      valor: 3,
      duracaoMinutos: 30,
    },
  },
  {
    id: 'formula_placa_titanio',
    nome: 'Placa Adamantina de Titânio-Platina (1Ti + 1Pt)',
    descricao: 'A mais densa e impenetrável liga forjada, repelindo projéteis e feitiços de choque.',
    reagentesNecessarios: [
      { simbolo: 'Ti', quantidade: 1 },
      { simbolo: 'Pt', quantidade: 1 },
    ],
    tipo: 'liga_metalica',
    raridade: 'Lendário',
    cdAlquimica: 18,
    efeitoDescricao: 'Concede +2 de bônus na Classe de Armadura (CA) permanente ao equipar.',
    icone: '🛡️',
    buff: {
      atributo: 'ca',
      valor: 2,
      duracaoMinutos: 120,
    },
  },
];
