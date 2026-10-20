import { CharacterClass, CharacterRace } from '../types/rpg';

export interface ClassInfo {
  nome: CharacterClass;
  vantagem: string;
  desvantagem: string;
  atributoChave: 'forca' | 'destreza' | 'constituicao' | 'inteligencia' | 'sabedoria' | 'carisma';
  dadoVida: string;
  usaMagia: boolean;
  usaAlquimia: boolean;
  descricao: string;
  iconSvg: string;
}

export interface RaceInfo {
  nome: CharacterRace;
  vantagem: string;
  desvantagem: string;
  bonusAtributo: string;
  deslocamento: string;
  visaoNoEscuro: boolean;
  tamanho: 'Pequeno' | 'Médio';
  descricao: string;
  imagePath?: string;
  iconSvg: string;
  caracteristicasBasicas: string[];
}

export const CLASSES_CATALOG: ClassInfo[] = [
  {
    nome: 'Guerreiro',
    vantagem: 'Mestre indiscutível das armas, armaduras pesadas e múltiplos ataques por rodada.',
    desvantagem: 'Ausência de conjuração mágica inicial; vulnerável a ataques mentais à distância.',
    atributoChave: 'forca',
    dadoVida: '1d10',
    usaMagia: false,
    usaAlquimia: false,
    descricao: 'Campeão marcial disciplinado que domina o campo de batalha através de técnicas brutais e escudos reluzentes.',
    iconSvg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full text-amber-500"><circle cx="50" cy="50" r="45" stroke="currentColor" stroke-width="3" fill="#1e1b4b" fill-opacity="0.6"/><path d="M50 15 L80 30 L70 70 L50 88 L30 70 L20 30 Z" stroke="#eab308" stroke-width="3" fill="#312e81"/><path d="M50 22 L50 80 M35 45 L65 45" stroke="#fbbf24" stroke-width="4" stroke-linecap="round"/><circle cx="50" cy="35" r="5" fill="#f59e0b"/></svg>`,
  },
  {
    nome: 'Mago',
    vantagem: 'Vasto repertório arcano, feitiços de dano massivo em área e afinidade alquímica suprema.',
    desvantagem: 'Poucos pontos de vida (d6) e sem proficiência em armaduras físicas.',
    atributoChave: 'inteligencia',
    dadoVida: '1d6',
    usaMagia: true,
    usaAlquimia: true,
    descricao: 'Erudito do cosmos e dos elementos químicos arcanos, capaz de dobrar as leis da física com fórmulas e encantamentos.',
    iconSvg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full text-indigo-400"><circle cx="50" cy="50" r="45" stroke="currentColor" stroke-width="3" fill="#1e1b4b" fill-opacity="0.6"/><path d="M50 16 L65 65 L25 65 Z" stroke="#818cf8" stroke-width="3" fill="#3730a3"/><ellipse cx="50" cy="65" rx="35" ry="12" stroke="#a5b4fc" stroke-width="3" fill="#4338ca"/><circle cx="50" cy="38" r="4" fill="#38bdf8"/><path d="M30 38 Q50 20 70 38" stroke="#67e8f9" stroke-width="2" stroke-dasharray="2 2"/></svg>`,
  },
  {
    nome: 'Artífice',
    vantagem: 'Genialidade na criação de itens mágicos, infusões arcanas e maestria no laboratório alquímico.',
    desvantagem: 'Necessita de reagentes e ferramentas para atingir o ápice do seu poder.',
    atributoChave: 'inteligencia',
    dadoVida: '1d8',
    usaMagia: true,
    usaAlquimia: true,
    descricao: 'Engenheiro arcano e pioneiro dos elementos da Tabela Periódica, unindo ciência exata com magia tecnológica.',
    iconSvg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full text-cyan-400"><circle cx="50" cy="50" r="45" stroke="currentColor" stroke-width="3" fill="#082f49" fill-opacity="0.6"/><circle cx="50" cy="50" r="22" stroke="#38bdf8" stroke-width="3" stroke-dasharray="8 4"/><path d="M50 18 L50 28 M50 72 L50 82 M18 50 L28 50 M72 50 L82 50" stroke="#06b6d4" stroke-width="4" stroke-linecap="round"/><circle cx="50" cy="50" r="10" fill="#0284c7"/><path d="M42 42 L58 58 M42 58 L58 42" stroke="#e0f2fe" stroke-width="2"/></svg>`,
  },
  {
    nome: 'Alquimista',
    vantagem: 'Especialista em bombas de efeito elementar, elixires mutagênicos e catalisadores químicos.',
    desvantagem: 'Recursos limitados aos frascos e elementos estocados na sua bolsa de campo.',
    atributoChave: 'inteligencia',
    dadoVida: '1d8',
    usaMagia: true,
    usaAlquimia: true,
    descricao: 'Pesquisador devotado ao Codex Elementalis, capaz de sintetizar poções com velocidade relâmpago no meio da batalha.',
    iconSvg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full text-emerald-400"><circle cx="50" cy="50" r="45" stroke="currentColor" stroke-width="3" fill="#064e3b" fill-opacity="0.6"/><path d="M43 22 L57 22 L57 38 L72 68 C75 75 70 82 62 82 L38 82 C30 82 25 75 28 68 L43 38 Z" stroke="#34d399" stroke-width="3" fill="#047857"/><ellipse cx="50" cy="72" rx="16" ry="6" fill="#10b981"/><circle cx="46" cy="65" r="3" fill="#a7f3d0"/><circle cx="54" cy="58" r="2" fill="#a7f3d0"/></svg>`,
  },
  {
    nome: 'Bruxo',
    vantagem: 'Poder concedido por patronos ancestrais; ataques de energia pura (Rajada Mística) e elixires sombrios.',
    desvantagem: 'Espaços de magia limitados que se esgotam rapidamente.',
    atributoChave: 'carisma',
    dadoVida: '1d8',
    usaMagia: true,
    usaAlquimia: true,
    descricao: 'Pactuário dos mistérios eldritch que combina rituais arcanos com a destilação de venenos e essências proibidas.',
    iconSvg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full text-purple-400"><circle cx="50" cy="50" r="45" stroke="currentColor" stroke-width="3" fill="#3b0764" fill-opacity="0.6"/><path d="M50 20 C30 35 30 65 50 80 C70 65 70 35 50 20 Z" stroke="#c084fc" stroke-width="3" fill="#6b21a8"/><circle cx="50" cy="50" r="12" fill="#581c87"/><circle cx="50" cy="50" r="5" fill="#f43f5e"/></svg>`,
  },
  {
    nome: 'Ladino',
    vantagem: 'Ataque furtivo devastador, mobilidade incomparável e desarmamento mestre de armadilhas.',
    desvantagem: 'Combate direto e prolongado sem aliados é extremamente arriscado.',
    atributoChave: 'destreza',
    dadoVida: '1d8',
    usaMagia: false,
    usaAlquimia: false,
    descricao: 'Mestre das sombras, do veneno rápido e da precisão cirúrgica, invisível nos cantos da masmorra.',
    iconSvg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full text-emerald-500"><circle cx="50" cy="50" r="45" stroke="currentColor" stroke-width="3" fill="#0f172a" fill-opacity="0.6"/><path d="M50 15 L58 40 L50 85 L42 40 Z" stroke="#10b981" stroke-width="3" fill="#047857"/><path d="M35 45 L65 45" stroke="#34d399" stroke-width="4" stroke-linecap="round"/><circle cx="50" cy="88" r="3" fill="#6ee7b7"/></svg>`,
  },
  {
    nome: 'Clérigo',
    vantagem: 'Cura divina poderosa, unção de óleos abençoados, armaduras e conjuração de suporte sagrado.',
    desvantagem: 'Foco dividido entre combate corpo a corpo e canalização da fé.',
    atributoChave: 'sabedoria',
    dadoVida: '1d8',
    usaMagia: true,
    usaAlquimia: true,
    descricao: 'Arauto dos deuses cuja fé viva sela feridas, purifica pragas e repele as criaturas das trevas.',
    iconSvg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full text-amber-300"><circle cx="50" cy="50" r="45" stroke="currentColor" stroke-width="3" fill="#451a03" fill-opacity="0.6"/><path d="M42 20 L58 20 L58 38 L76 38 L76 54 L58 54 L58 84 L42 84 L42 54 L24 54 L24 38 L42 38 Z" stroke="#fbbf24" stroke-width="3" fill="#d97706"/><circle cx="50" cy="46" r="6" fill="#fef08a"/></svg>`,
  },
  {
    nome: 'Bárbaro',
    vantagem: 'Fúria incontrolável, maior reserva de pontos de vida (d12) e resistência física colossal.',
    desvantagem: 'Incapaz de conjurar feitiços ou manter concentração enquanto em estado de fúria.',
    atributoChave: 'forca',
    dadoVida: '1d12',
    usaMagia: false,
    usaAlquimia: false,
    descricao: 'Força bruta elemental personificada, alimentada pelo instinto de sobrevivência selvagem.',
    iconSvg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full text-red-500"><circle cx="50" cy="50" r="45" stroke="currentColor" stroke-width="3" fill="#450a0a" fill-opacity="0.6"/><path d="M25 35 Q50 15 75 35 Q60 55 50 50 Q40 55 25 35 Z" stroke="#ef4444" stroke-width="3" fill="#991b1b"/><path d="M50 48 L50 85 M40 85 L60 85" stroke="#f87171" stroke-width="4" stroke-linecap="round"/></svg>`,
  },
  {
    nome: 'Paladino',
    vantagem: 'Destruição divina com ataques corpo a corpo, aura de proteção e cura pelas mãos.',
    desvantagem: 'Código de juramento rígido e alta dependência de múltiplos atributos (FOR, CAR, CON).',
    atributoChave: 'forca',
    dadoVida: '1d10',
    usaMagia: true,
    usaAlquimia: false,
    descricao: 'Cavaleiro consagrado cujo juramento de honra reluz no campo de batalha em forma de justiça sagrada.',
    iconSvg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full text-yellow-400"><circle cx="50" cy="50" r="45" stroke="currentColor" stroke-width="3" fill="#422006" fill-opacity="0.6"/><path d="M50 16 L78 30 L68 70 L50 86 L32 70 L22 30 Z" stroke="#eab308" stroke-width="3" fill="#78350f"/><path d="M50 30 L50 70 M38 45 L62 45" stroke="#fef08a" stroke-width="3" stroke-linecap="round"/><circle cx="50" cy="50" r="8" fill="#eab308"/></svg>`,
  },
  {
    nome: 'Druida',
    vantagem: 'Metamorfose em feras selvagens, controle da natureza e botânica alquímica de ervas.',
    desvantagem: 'Proibição de armaduras metálicas puras que bloqueiam a ressonância natural.',
    atributoChave: 'sabedoria',
    dadoVida: '1d8',
    usaMagia: true,
    usaAlquimia: true,
    descricao: 'Guardião dos bosques e dos espíritos primordiais, capaz de canalizar a fúria da tempestade e a cura da terra.',
    iconSvg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full text-lime-400"><circle cx="50" cy="50" r="45" stroke="currentColor" stroke-width="3" fill="#14532d" fill-opacity="0.6"/><path d="M50 18 C30 35 32 70 50 82 C68 70 70 35 50 18 Z" stroke="#84cc16" stroke-width="3" fill="#3f6212"/><path d="M50 30 L50 75 M50 45 L62 38 M50 55 L38 48" stroke="#bef264" stroke-width="3" stroke-linecap="round"/></svg>`,
  },
  {
    nome: 'Bardo',
    vantagem: 'Inspiração de aliados, magias versáteis de qualquer lista e carisma arrebatador.',
    desvantagem: 'Menor resistência física e dano direto moderado.',
    atributoChave: 'carisma',
    dadoVida: '1d8',
    usaMagia: true,
    usaAlquimia: false,
    descricao: 'Trovador das palavras de criação cujas melodias alteram a realidade e encantam mentes e corações.',
    iconSvg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full text-rose-400"><circle cx="50" cy="50" r="45" stroke="currentColor" stroke-width="3" fill="#4c0519" fill-opacity="0.6"/><path d="M38 25 L65 20 L65 65 C65 72 58 78 50 78 C42 78 35 72 35 65 C35 58 42 52 50 52 L56 52 L56 32 L38 35 Z" stroke="#f43f5e" stroke-width="3" fill="#be123c"/></svg>`,
  },
  {
    nome: 'Feiticeiro',
    vantagem: 'Metamagia espontânea para alterar propriedades de feitiços e poder inato no sangue.',
    desvantagem: 'Número restrito de magias conhecidas.',
    atributoChave: 'carisma',
    dadoVida: '1d6',
    usaMagia: true,
    usaAlquimia: true,
    descricao: 'Conjurador nato cuja alma pulsa com energia dracônica, cósmica ou tempestuosa incontrolável.',
    iconSvg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full text-violet-400"><circle cx="50" cy="50" r="45" stroke="currentColor" stroke-width="3" fill="#2e1065" fill-opacity="0.6"/><path d="M50 15 L62 38 L88 38 L68 55 L75 80 L50 64 L25 80 L32 55 L12 38 L38 38 Z" stroke="#a855f7" stroke-width="3" fill="#7e22ce"/></svg>`,
  },
];

export const RACES_CATALOG: RaceInfo[] = [
  {
    nome: 'Elfo',
    vantagem: '+2 Destreza, Visão no Escuro (18m), Imunidade a sono mágico, Transe meditativo de 4 horas.',
    desvantagem: 'Menor robustez física inicial sem bônus nativo de constituição.',
    bonusAtributo: '+2 DES, +1 INT (Alto Elfo)',
    deslocamento: '9 m',
    visaoNoEscuro: true,
    tamanho: 'Médio',
    imagePath: '/assets/images/raca_elfo_1792453253790.jpg',
    descricao: 'Seres ancestrais de graça sobrenatural, olhos que enxergam a tecidura mágica e mentes imunes ao sono mortal.',
    caracteristicasBasicas: [
      'Ancestralidade Feérica: Vantagem em testes contra ser enfeitiçado e magia não pode colocá-lo para dormir.',
      'Transe: Não precisa dormir; medita profundamente por 4 horas para obter descanso longo.',
      'Sentidos Aguçados: Proficiência garantida na perícia Percepção.',
      'Visão no Escuro: Enxerga na penumbra e escuridão total até 18 metros.'
    ],
    iconSvg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full text-emerald-400"><circle cx="50" cy="50" r="45" stroke="currentColor" stroke-width="3" fill="#064e3b"/><path d="M35 45 C20 30 20 20 25 15 C35 25 40 38 40 45 Z M65 45 C80 30 80 20 75 15 C65 25 60 38 60 45 Z" fill="#10b981"/><circle cx="43" cy="50" r="3" fill="#a7f3d0"/><circle cx="57" cy="50" r="3" fill="#a7f3d0"/></svg>`,
  },
  {
    nome: 'Anão',
    vantagem: '+2 Constituição, Resiliência Anã (resistência soberana a venenos), Visão no Escuro e perícia em forja.',
    desvantagem: 'Deslocamento base reduzido (7,5 metros) e peso corporal elevado.',
    bonusAtributo: '+2 CON, +2 FOR (Anão da Montanha)',
    deslocamento: '7,5 m',
    visaoNoEscuro: true,
    tamanho: 'Médio',
    imagePath: '/assets/images/raca_anao_1792453254447.jpg',
    descricao: 'Guerreiros e mestres ferreiros das montanhas profundas, imutáveis como a rocha e fiéis aos seus clãs ancestrais.',
    caracteristicasBasicas: [
      'Resiliência Anã: Vantagem em testes contra veneno e resistência a dano de veneno.',
      'Treinamento Anão em Armas: Proficiência com machado de batalha, machadinha, martelo leve e martelo de guerra.',
      'Conhecimento de Pedras: Adiciona dobro da proficiência em História sobre trabalhos em alvenaria.',
      'Visão no Escuro: Enxerga na escuridão subterrânea até 18 metros.'
    ],
    iconSvg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full text-amber-600"><circle cx="50" cy="50" r="45" stroke="currentColor" stroke-width="3" fill="#292524"/><path d="M30 35 L70 35 L65 55 L35 55 Z" fill="#78716c"/><path d="M35 55 Q50 88 65 55 Q50 95 35 55 Z" fill="#b45309"/><circle cx="42" cy="45" r="3" fill="#facc15"/><circle cx="58" cy="45" r="3" fill="#facc15"/></svg>`,
  },
  {
    nome: 'Draconato',
    vantagem: 'Ataque de sopro elemental (fogo, relâmpago ou ácido) e resistência passiva ao mesmo dano.',
    desvantagem: 'Sem Visão no Escuro; bônus fixos em Força e Carisma.',
    bonusAtributo: '+2 FOR, +1 CAR',
    deslocamento: '9 m',
    visaoNoEscuro: false,
    tamanho: 'Médio',
    imagePath: '/assets/images/raca_draconato_1792453255634.jpg',
    descricao: 'Descendentes nobres dos dragões lendários, portando escamas cintilantes, orgulho titânico e honra marcial.',
    caracteristicasBasicas: [
      'Ancestral Dracônico: Determina o tipo de dano do sopro e resistência passiva (Ex: Dragão Vermelho = Fogo).',
      'Ataque de Sopro: Causa 2d6 de dano elemental em área (cone de 4,5m ou linha de 9m) com teste de CD.',
      'Resistência a Dano: Reduz à metade todo dano do elemento do seu ancestral dracônico.',
      'Porte Imponente: Presença intimidadora natural em negociações e combate.'
    ],
    iconSvg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full text-red-500"><circle cx="50" cy="50" r="45" stroke="currentColor" stroke-width="3" fill="#450a0a"/><path d="M50 20 L75 45 L65 75 L50 85 L35 75 L25 45 Z" fill="#dc2626"/><circle cx="40" cy="45" r="4" fill="#facc15"/><circle cx="60" cy="45" r="4" fill="#facc15"/><path d="M45 65 L55 65" stroke="#fef08a" stroke-width="3"/></svg>`,
  },
  {
    nome: 'Humano',
    vantagem: '+1 em todos os 6 atributos ou Talento adicional no Nível 1 com perícia extra (Variante).',
    desvantagem: 'Sem Visão no Escuro e sem resistências inatas sobrenaturais.',
    bonusAtributo: '+1 em todos os atributos',
    deslocamento: '9 m',
    visaoNoEscuro: false,
    tamanho: 'Médio',
    imagePath: '/assets/images/raca_humano_1792453255700.jpg',
    descricao: 'A mais adaptável e versátil das raças mortais, pioneira nos reinos da civilização, da alquimia e da magia.',
    caracteristicasBasicas: [
      'Versatilidade Máxima: Aprendizado acelerado em qualquer profissão ou classe de combate.',
      'Talento Extra (Variante): Permite iniciar no Nível 1 com um talento de mestre e proficiência extra.',
      'Equilíbrio Anatômico: Capacidade de empunhar qualquer kit de equipamento sem restrições de porte.',
      'Ambição Incessante: Alta adaptabilidade em campanhas urbanas, masmorras ou desertos.'
    ],
    iconSvg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full text-blue-400"><circle cx="50" cy="50" r="45" stroke="currentColor" stroke-width="3" fill="#0f172a"/><circle cx="50" cy="42" r="18" fill="#38bdf8"/><path d="M28 82 C28 65 38 58 50 58 C62 58 72 65 72 82 Z" fill="#0284c7"/></svg>`,
  },
  {
    nome: 'Tiefling',
    vantagem: 'Resistência a dano de fogo, Visão no Escuro (18m) e legado infernal com truques e feitiços inatos.',
    desvantagem: 'Estigma social e benefícios raciais menos voltados para classes marciais sem carisma.',
    bonusAtributo: '+2 CAR, +1 INT',
    deslocamento: '9 m',
    visaoNoEscuro: true,
    tamanho: 'Médio',
    imagePath: '/assets/images/raca_tiefling_1792453256113.jpg',
    descricao: 'Descendentes de linhagens tocadas pelos planos inferiores, com chifres imponentes, cauda ágil e olhar ardente.',
    caracteristicasBasicas: [
      'Legado Infernal: Conhece o truque Taumaturgia; no nível 3 conjura Repreensão Infernal; no nível 5 Escuridão.',
      'Resistência Infernal: Resistência inata a dano de fogo (recebe metade do dano).',
      'Visão no Escuro: Enxerga na escuridão total até 18 metros com tons de vermelho.',
      'Fascinante e Assustador: Bônus de carisma perfeito para Bruxos, Bardos e Feiticeiros.'
    ],
    iconSvg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full text-pink-500"><circle cx="50" cy="50" r="45" stroke="currentColor" stroke-width="3" fill="#500724"/><path d="M35 38 C25 20 18 15 15 10 C30 18 35 28 38 35 Z M65 38 C75 20 82 15 85 10 C70 18 65 28 62 35 Z" fill="#db2777"/><circle cx="50" cy="55" r="18" fill="#be185d"/><circle cx="43" cy="52" r="3" fill="#fbbf24"/><circle cx="57" cy="52" r="3" fill="#fbbf24"/></svg>`,
  },
  {
    nome: 'Meio-Orc',
    vantagem: 'Resistência Implacável (cair para 1 PV ao invés de morrer) e Crítico Brutal devastador.',
    desvantagem: 'Menos flexibilidade para estilos puramente mágicos ou diplomáticos.',
    bonusAtributo: '+2 FOR, +1 CON',
    deslocamento: '9 m',
    visaoNoEscuro: true,
    tamanho: 'Médio',
    imagePath: '/assets/images/raca_meio_orc_1792454959157.jpg',
    descricao: 'Força indomável combinada com a determinação humana e presas prontas para o combate.',
    caracteristicasBasicas: [
      'Resistência Implacável: Ao cair para 0 PV sem ser morto imediatamente, cai para 1 PV (1x por descanso longo).',
      'Ataques Selvagens: Ao acertar um acerto crítico corpo a corpo, rola um dado de dano de arma adicional.',
      'Ameaçador: Proficiência automática na perícia Intimidação.',
      'Visão no Escuro: Enxerga até 18 metros na penumbra e escuridão.'
    ],
    iconSvg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full text-lime-600"><circle cx="50" cy="50" r="45" stroke="currentColor" stroke-width="3" fill="#14532d"/><path d="M30 30 L70 30 L75 70 L50 85 L25 70 Z" fill="#4d7c0f"/><path d="M38 65 L40 55 L44 65 Z M62 65 L60 55 L56 65 Z" fill="#f8fafc"/></svg>`,
  },
  {
    nome: 'Gnomo',
    vantagem: 'Esperteza Gnômica (vantagem em todos os testes de INT, SAB e CAR contra magia) e Visão no Escuro.',
    desvantagem: 'Deslocamento reduzido (7,5m) e desvantagem com armas marciais pesadas.',
    bonusAtributo: '+2 INT, +1 CON (Gnomo das Rochas)',
    deslocamento: '7,5 m',
    visaoNoEscuro: true,
    tamanho: 'Pequeno',
    imagePath: '/assets/images/raca_gnomo_1792454958079.jpg',
    descricao: 'Entusiastas incuráveis de engenhocas, alquimia teórica e enigmas arcanos.',
    caracteristicasBasicas: [
      'Esperteza Gnômica: Vantagem em todos os testes de resistência de Inteligência, Sabedoria e Carisma contra magia.',
      'Conhecimento de Artífice: Dobra a proficiência em testes de História sobre itens e aparelhos tecnológicos.',
      'Engenhoqueiro: Pode gastar 1 hora e materiais para criar pequenos aparelhos mecânicos (isqueiro, brinquedo mecânico).',
      'Visão no Escuro: Enxerga na escuridão até 18 metros.'
    ],
    iconSvg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full text-teal-400"><circle cx="50" cy="50" r="45" stroke="currentColor" stroke-width="3" fill="#042f2e"/><polygon points="50,15 65,45 35,45" fill="#14b8a6"/><circle cx="50" cy="55" r="16" fill="#0d9488"/></svg>`,
  },
  {
    nome: 'Halfling',
    vantagem: 'Sorte Prodigiosa (rerrola qualquer 1 natural no d20!), bravura contra medo e agilidade furtiva.',
    desvantagem: 'Deslocamento reduzido e incapacidade de manejar armas pesadas.',
    bonusAtributo: '+2 DES, +1 CAR (Pés-Leves)',
    deslocamento: '7,5 m',
    visaoNoEscuro: false,
    tamanho: 'Pequeno',
    imagePath: '/assets/images/raca_halfling_1792454958887.jpg',
    descricao: 'Povo afável mas surpreendentemente corajoso, capazes de escapar por entre as pernas de gigantes.',
    caracteristicasBasicas: [
      'Sorte Prodigiosa: Ao rolar um 1 natural em d20 (ataque, teste ou resistência), pode rolar novamente e usar a nova jogada.',
      'Bravura: Vantagem em testes de resistência contra ficar amedrontado.',
      'Agilidade Halfling: Pode se mover através do espaço de qualquer criatura que seja de tamanho maior que o seu.',
      'Furtividade Natural: Pode tentar se esconder mesmo quando apenas obscurecido por criaturas maiores.'
    ],
    iconSvg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full text-orange-400"><circle cx="50" cy="50" r="45" stroke="currentColor" stroke-width="3" fill="#431407"/><circle cx="50" cy="45" r="18" fill="#f97316"/><path d="M40 35 Q50 25 60 35" stroke="#fed7aa" stroke-width="4" stroke-linecap="round"/></svg>`,
  },
  {
    nome: 'Golias',
    vantagem: 'Resistência da Pedra (reduz dano sofrido com reação), atleta nato e bônus de capacidade de carga.',
    desvantagem: 'Tamanho imenso que dificulta passar despercebido em ambientes urbanos.',
    bonusAtributo: '+2 FOR, +1 CON',
    deslocamento: '9 m',
    visaoNoEscuro: false,
    tamanho: 'Médio',
    imagePath: '/assets/images/raca_golias_1792454959882.jpg',
    descricao: 'Titãs dos picos glaciais esculpidos pela tempestade e pelo código rigoroso da montanha.',
    caracteristicasBasicas: [
      'Resistência da Pedra: Usa uma reação ao sofrer dano para reduzir 1d12 + modificador de Constituição.',
      'Atleta Natural: Proficiência gratuita na perícia Atletismo.',
      'Porte Poderoso: Conta como uma categoria de tamanho maior ao determinar sua capacidade de carga.',
      'Nascido na Montanha: Aclimatação a altas altitudes e resistência a frio extremo.'
    ],
    iconSvg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full text-slate-300"><circle cx="50" cy="50" r="45" stroke="currentColor" stroke-width="3" fill="#1e293b"/><path d="M30 35 L70 35 L75 75 L50 88 L25 75 Z" fill="#64748b"/><path d="M38 48 L48 58 M62 48 L52 58" stroke="#38bdf8" stroke-width="3"/></svg>`,
  },
  {
    nome: 'Tabaxi',
    vantagem: 'Agilidade Felina (dobra o deslocamento por 1 turno), garras retráteis e velocidade de escalada.',
    desvantagem: 'Necessita ficar estático por 1 turno para recarregar a explosão de velocidade.',
    bonusAtributo: '+2 DES, +1 CAR',
    deslocamento: '9 m',
    visaoNoEscuro: true,
    tamanho: 'Médio',
    imagePath: '/assets/images/raca_tabaxi_1792454961037.jpg',
    descricao: 'Humanoides felinos curiosos e velozes, caçadores de segredos e relíquias raras.',
    caracteristicasBasicas: [
      'Agilidade Felina: Dobra o deslocamento em um turno de combate até o fim do movimento (recarrega ao ficar imóvel).',
      'Garras Retráteis: Ataques desarmados causam 1d4 + DES de dano cortante e possui deslocamento de escalada de 6m.',
      'Talentos Felinos: Proficiência em Percepção e Furtividade.',
      'Visão no Escuro: Enxerga na escuridão até 18 metros.'
    ],
    iconSvg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full text-amber-400"><circle cx="50" cy="50" r="45" stroke="currentColor" stroke-width="3" fill="#451a03"/><polygon points="30,20 40,40 25,40" fill="#f59e0b"/><polygon points="70,20 60,40 75,40" fill="#f59e0b"/><circle cx="50" cy="52" r="18" fill="#d97706"/></svg>`,
  },
  {
    nome: 'Aasimar',
    vantagem: 'Resistência a dano radiante e necrótico, toque de cura celestial e transformação radiante.',
    desvantagem: 'A transformação dura apenas 1 minuto e recarrega somente com descanso longo.',
    bonusAtributo: '+2 CAR, +1 SAB',
    deslocamento: '9 m',
    visaoNoEscuro: true,
    tamanho: 'Médio',
    imagePath: '/assets/images/raca_aasimar_1792454961286.jpg',
    descricao: 'Portadores da centelha celestial dos planos superiores, guiados por visões dos anjos.',
    caracteristicasBasicas: [
      'Resistência Celestial: Resistência inata a dano radiante e dano necrótico.',
      'Mãos Curativas: Toca uma criatura como ação para curar PV igual ao seu nível (1x por descanso longo).',
      'Luz Radiante: Conhece o truque Luz inato.',
      'Visão no Escuro: Enxerga na penumbra e escuridão até 18 metros.'
    ],
    iconSvg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full text-yellow-300"><circle cx="50" cy="50" r="45" stroke="currentColor" stroke-width="3" fill="#422006"/><ellipse cx="50" cy="22" rx="20" ry="6" stroke="#fde047" stroke-width="3" fill="none"/><circle cx="50" cy="50" r="18" fill="#fef08a"/></svg>`,
  },
  {
    nome: 'Forjado Bélico',
    vantagem: '+1 na CA permanente, imunidade a doenças e sono mágico; não precisa comer, respirar ou beber.',
    desvantagem: 'Descanso longo exige ficar vigilante e imóvel por 6 horas.',
    bonusAtributo: '+2 CON, +1 livre',
    deslocamento: '9 m',
    visaoNoEscuro: false,
    tamanho: 'Médio',
    imagePath: '/assets/images/raca_forjado_1792454961163.jpg',
    descricao: 'Construtos autômatos forjados para a guerra, dotados de alma viva e placas de metal protetoras.',
    caracteristicasBasicas: [
      'Proteção Integrada: Ganha +1 bônus permanente na Classe de Armadura (CA).',
      'Resiliência de Construto: Vantagem contra veneno, imune a doenças, não precisa comer, beber ou respirar.',
      'Descanso de Sentinela: Não precisa dormir; passa 6 horas em estado inerte mas consciente.',
      'Especialização Integrada: Proficiência em uma perícia e uma ferramenta à escolha.'
    ],
    iconSvg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full text-zinc-400"><circle cx="50" cy="50" r="45" stroke="currentColor" stroke-width="3" fill="#18181b"/><path d="M30 30 L70 30 L65 75 L50 85 L35 75 Z" fill="#52525b"/><rect x="42" y="45" width="16" height="4" fill="#38bdf8"/></svg>`,
  },
];
