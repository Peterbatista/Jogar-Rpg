let cardsRaca = [];
let cardsClasse = [];
const fichaStorageKey = 'rpg-mesa-fichas';
const jogadorStorageKey = 'rpg-mesa-jogadores';
const fichaBackupStorageKey = 'rpg-mesa-fichas-backup';
const sessaoStorageKey = 'rpg-mesa-sessao';
const npcStorageKey = 'rpg-mesa-npcs';
const historiaCampanhaStorageKey = 'rpg-mesa-historia-campanha';
const monstroVidaStorageKey = 'rpg-mesa-monstros-vida';
const monstroBackupStorageKey = 'rpg-mesa-monstros-backup';
const monstroImagemStorageKey = 'rpg-mesa-monstros-imagens';
const rolagemStorageKey = 'rpg-mesa-rolagens';
let fichaModalAtualId = null;
let monstroAtualIndice = null;
let usuarioAguardandoPapel = null;

// Controla se estamos criando ou editando uma ficha
let fichaEditandoId = null; 

const nomesResistencias = ['Força', 'Destreza', 'Constituição', 'Inteligência', 'Sabedoria', 'Carisma'];
const nomesPericias = ['Acrobacia (Des)', 'Arcanismo (Int)', 'Atletismo (For)', 'Atuação (Car)', 'Blefar (Car)', 'Furtividade (Des)', 'História (Int)', 'Intimidação (Car)', 'Intuição (Sab)', 'Investigação (Int)', 'Lidar com Animais (Sab)', 'Medicina (Sab)', 'Natureza (Int)', 'Percepção (Sab)', 'Persuasão (Car)', 'Prestidigitação (Des)', 'Religião (Int)', 'Sobrevivência (Sab)'];

const catalogoRacas = [
    ['Anão', 'Alta resistência (Constituição), resistência a venenos, Visão no Escuro.', 'Deslocamento base reduzido (7,5 metros).'],
    ['Draconato', 'Ataque de Sopro em área, resistência a um elemento natural.', 'Sem Visão no Escuro, bônus muito engessados em Força e Carisma.'],
    ['Elfo', 'Visão no Escuro, imunidade a sono mágico, Transe e proficiência em Percepção.', 'Menor resistência física inicial, sem bônus de Constituição base.'],
    ['Gnomo', 'Vantagem em testes de resistência mágicos, Visão no Escuro.', 'Deslocamento reduzido, penalidades para armas pesadas.'],
    ['Halfling', 'Sorte, furtividade natural e movimento entre inimigos maiores.', 'Deslocamento reduzido, não pode utilizar armas pesadas.'],
    ['Humano', 'Aumento em todos os atributos ou Talento extra no nível 1 na regra Variante.', 'Nenhuma habilidade mágica inata, sem Visão no Escuro.'],
    ['Meio-Elfo', 'Atributos flexíveis, imunidade a sono mágico e perícias extras.', 'Habilidades raciais genéricas, sem foco em dano bruto.'],
    ['Meio-Orc', 'Sobrevive com 1 PV ao receber dano letal e causa crítico corpo a corpo devastador.', 'Benefícios quase inteiramente focados em combate corpo a corpo.'],
    ['Tiefling', 'Resistência a fogo, feitiços inatos e Visão no Escuro.', 'Pouco útil para classes marciais que não usam Carisma.'],
    ['Aarakocra', 'Voo inato com altíssimo deslocamento (15 metros).', 'Não pode voar usando armaduras médias ou pesadas.'],
    ['Aasimar', 'Resistência a dano radiante e necrótico, cura e transformação celestial.', 'Transformação dura 1 minuto e exige descanso longo.'],
    ['Bugbear', 'Alcance corpo a corpo estendido e dano surpresa massivo no primeiro turno.', 'Porte imenso dificulta furtividade em ambientes civilizados.'],
    ['Centauro', 'Deslocamento alto, investida com cascos e grande capacidade de carga.', 'Escalar estruturas verticais custa quatro vezes mais movimento.'],
    ['Forjado Bélico', '+1 na Classe de Armadura, não precisa dormir, comer ou respirar e é imune a doenças.', 'Descanso longo exige ficar estático e consciente por 6 horas.'],
    ['Goblin', 'Desengajar ou esconder-se como Ação Bônus, com grande mobilidade em combate.', 'Deslocamento reduzido e sem imunidades naturais.'],
    ['Golias', 'Reduz dano recebido com reação e possui resistência passiva ao frio.', 'Grande e pesado, alvo fácil e sem foco em furtividade.'],
    ['Metamorfo', 'Altera aparência, altura e voz, com vantagem em testes de enganação.', 'Focado em interpretação, com pouca utilidade em combate puro.'],
    ['Tabaxi', 'Agilidade Felina, garras naturais e velocidade de escalada.', 'Agilidade Felina exige ficar imóvel por um turno para recarregar.'],
    ['Tartaruga (Tortle)', 'Armadura natural CA 17 e +4 na CA ao entrar no casco.', 'Não pode equipar armaduras e deslocamento cai a 0 no casco.'],
    ['Yuan-ti', 'Vantagem contra feitiços e efeitos mágicos, além de imunidade a veneno.', 'Sem habilidades marciais e muito forte magicamente.']
];

const catalogoMagias = {
    Bardo: [
        ['Zombaria Viciosa', 'Insulta o alvo magicamente e impõe desvantagem no próximo ataque dele.', '1d4 psíquico'],
        ['Onda Trovejante', 'Emite um estrondo em cubo de 4,5m e empurra os inimigos.', '2d8 trovejante'],
        ['Curar Ferimentos', 'Toca uma criatura e canaliza energia para fechar suas feridas.', 'Cura 1d8 + modificador de conjuração']
    ],
    Bruxo: [
        ['Rajada Mística', 'Dispara um feixe de pura energia mágica à distância.', '1d10 de energia/força'],
        ['Toque Arrepiante', 'Cria uma mão esquelética que impede o alvo de recuperar PV no turno.', '1d8 necrótico'],
        ['Repreensão Infernal', 'Reação ao sofrer um ataque que envolve o atacante em chamas.', '2d10 de fogo']
    ],
    Clérigo: [
        ['Chama Sagrada', 'Faz uma luz divina descer sobre um inimigo sem bônus de cobertura.', '1d8 radiante'],
        ['Raio Guiador', 'Feixe de luz; o próximo aliado a atacar o alvo ganha vantagem.', '4d6 radiante'],
        ['Palavra Curativa', 'Prece rápida que cura um aliado à distância.', 'Cura 1d4 + modificador de conjuração']
    ],
    Druida: [
        ['Chicote de Espinhos', 'Vinhas mágicas atingem o alvo e o puxam 3 metros.', '1d6 perfurante'],
        ['Criar Chamas', 'Produz uma chama que ilumina e pode ser arremessada.', '1d8 de fogo'],
        ['Bordão Mágico', 'Usa Sabedoria para atacar com um cajado imbuído de magia natural.', '1d8 contundente mágico']
    ],
    Mago: [
        ['Raio de Fogo', 'Arremessa uma chama explosiva à distância.', '1d10 de fogo'],
        ['Mísseis Mágicos', 'Dispara 3 dardos de energia que nunca erram.', '1d4 + 1 de energia por dardo'],
        ['Orbe Cromático', 'Arremessa uma esfera de elemento escolhido pelo jogador.', '3d8 do elemento escolhido'],
        ['Escudo Arcano', 'Reação que cria uma barreira e aumenta a CA até o próximo turno.', '+5 na CA, sem dano']
    ],
    Feiticeiro: [
        ['Raio de Fogo', 'Arremessa uma chama explosiva à distância.', '1d10 de fogo'],
        ['Mísseis Mágicos', 'Dispara 3 dardos de energia que nunca erram.', '1d4 + 1 de energia por dardo'],
        ['Orbe Cromático', 'Arremessa uma esfera de elemento escolhido pelo jogador.', '3d8 do elemento escolhido'],
        ['Escudo Arcano', 'Reação que cria uma barreira e aumenta a CA até o próximo turno.', '+5 na CA, sem dano']
    ]
};

const catalogoMonstros = [
    {nome: 'Goblin', tipo: 'Humanóide', nd: '1/4', ca: 15, pv: 7, deslocamento: '9 m', ataque: 'Cimitarra: +4 (1d6 + 2 cortante)', tracos: 'Fuga Ágil e Visão no Escuro.', atributos: 'FOR 8 | DES 14 | CON 10 | INT 10 | SAB 8 | CAR 8'},
    {nome: 'Esqueleto', tipo: 'Morto-vivo', nd: '1/4', ca: 13, pv: 13, deslocamento: '9 m', ataque: 'Espada curta: +4 (1d6 + 2 perfurante)', tracos: 'Imunidade a veneno e não precisa respirar.', atributos: 'FOR 10 | DES 14 | CON 15 | INT 6 | SAB 8 | CAR 5'},
    {nome: 'Lobo', tipo: 'Fera', nd: '1/4', ca: 13, pv: 11, deslocamento: '12 m', ataque: 'Mordida: +4 (2d4 + 2 perfurante), pode derrubar', tracos: 'Audição e olfato aguçados; Táticas de Matilha.', atributos: 'FOR 12 | DES 15 | CON 12 | INT 3 | SAB 12 | CAR 6'},
    {nome: 'Bandido', tipo: 'Humanóide', nd: '1/8', ca: 12, pv: 11, deslocamento: '9 m', ataque: 'Cimitarra: +3 (1d6 + 1 cortante)', tracos: 'Pode usar arco curto ou cimitarra.', atributos: 'FOR 11 | DES 12 | CON 12 | INT 10 | SAB 10 | CAR 10'},
    {nome: 'Orc', tipo: 'Humanóide', nd: '1/2', ca: 13, pv: 15, deslocamento: '9 m', ataque: 'Machado grande: +5 (1d12 + 3 cortante)', tracos: 'Agressivo: pode mover-se em direção a um inimigo como ação bônus.', atributos: 'FOR 16 | DES 12 | CON 16 | INT 7 | SAB 11 | CAR 10'},
    {nome: 'Urso Coruja', tipo: 'Monstruosidade', nd: '3', ca: 13, pv: 59, deslocamento: '12 m', ataque: 'Bico e garras: +7 (múltiplos ataques)', tracos: 'Visão no Escuro e sentidos aguçados.', atributos: 'FOR 20 | DES 12 | CON 17 | INT 3 | SAB 12 | CAR 7'}
];

// FUNÇÃO ATUALIZADA: Esconde o bloco de magias para quem não usa magia
function atualizarCamposPorClasse(classeNome) {
    let sessaoMagias = null;
    document.querySelectorAll('fieldset').forEach(fs => {
        const legend = fs.querySelector('legend');
        if (legend && (legend.textContent.includes('Magias') || legend.textContent.includes('Conjurador'))) {
            sessaoMagias = fs;
        }
    });

    if (!sessaoMagias) return;

    const usaMagia = ['Mago', 'Clérigo', 'Bardo', 'Druida', 'Feiticeiro', 'Bruxo', 'Paladino'];
    
    if (usaMagia.includes(classeNome)) {
        sessaoMagias.style.display = 'block';
    } else {
        sessaoMagias.style.display = 'none';
    }
}

// NOVA FUNÇÃO: Calcula Bônus de Magia e Proficiência automaticamente ao digitar Nível/Atributos
function atualizarCalculosAutomaticos() {
    const classe = document.getElementById('classeEscolhida')?.value;
    if (!classe) return;

    const nivelEl = document.getElementById('nivel');
    const nivel = Number(nivelEl?.value) || 1;
    // Cálculo oficial do Livro do Jogador (Proficiência = +2, a cada 4 níveis sobe +1)
    const profBonus = Math.floor((nivel - 1) / 4) + 2; 
    
    const profInput = document.getElementById('bonusProf');
    if (profInput) profInput.value = `+${profBonus}`;

    // Define qual a Habilidade Chave de cada classe
    const infoClasses = {
        'Mago': { conjurador: 'Mago', hab: 'inteligencia', habNome: 'Inteligência' },
        'Clérigo': { conjurador: 'Clérigo', hab: 'sabedoria', habNome: 'Sabedoria' },
        'Druida': { conjurador: 'Druida', hab: 'sabedoria', habNome: 'Sabedoria' },
        'Paladino': { conjurador: 'Paladino', hab: 'carisma', habNome: 'Carisma' },
        'Bardo': { conjurador: 'Bardo', hab: 'carisma', habNome: 'Carisma' },
        'Feiticeiro': { conjurador: 'Feiticeiro', hab: 'carisma', habNome: 'Carisma' },
        'Bruxo': { conjurador: 'Bruxo', hab: 'carisma', habNome: 'Carisma' }
    };

    const info = infoClasses[classe];
    const elClasseConj = document.getElementById('classeConjurador');
    const elHabChave = document.getElementById('habilidadeChave');
    const elCdTr = document.getElementById('cdTr');
    const elBonusAtaque = document.getElementById('bonusAtaqueMagia');

    if (info) {
        if (elClasseConj) elClasseConj.value = info.conjurador;
        if (elHabChave) elHabChave.value = info.habNome;
        
        const attrValue = Number(document.getElementById(info.hab)?.value) || 10;
        const mod = Math.floor((attrValue - 10) / 2); // Regra D&D: Mod = (Atributo - 10) / 2
        
        if (elCdTr) elCdTr.value = 8 + profBonus + mod; // CD do Teste = 8 + Prof + Mod
        
        const bonusAtaque = profBonus + mod;
        if (elBonusAtaque) elBonusAtaque.value = (bonusAtaque >= 0 ? '+' : '') + bonusAtaque;
    } else {
        // Limpa se for classe não conjuradora (Guerreiro, Ladino, Bárbaro)
        if(elClasseConj) elClasseConj.value = '';
        if(elHabChave) elHabChave.value = '';
        if(elCdTr) elCdTr.value = '';
        if(elBonusAtaque) elBonusAtaque.value = '';
    }
}

// Escuta os campos para calcular a matemática na hora que o jogador digita
window.addEventListener('DOMContentLoaded', () => {
    ['forca', 'destreza', 'constituicao', 'inteligencia', 'sabedoria', 'carisma', 'nivel'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', atualizarCalculosAutomaticos);
    });
});

function selecionarCard(cards, inputId, card) {
    cards.forEach(function(item) {
        item.classList.remove('selecionado');
    });

    card.classList.add('selecionado');
    document.getElementById(inputId).value = card.querySelector('.nome-card').textContent.trim();

    if (inputId === 'racaEscolhida') {
        document.getElementById('vantagemRaca').value = card.dataset.vantagem || '';
        document.getElementById('desvantagemRaca').value = card.dataset.desvantagem || '';
    }

    if (inputId === 'classeEscolhida') {
        preencherOpcoesMagia();
        atualizarCamposPorClasse(card.querySelector('.nome-card').textContent.trim());
        atualizarCalculosAutomaticos(); // Chama o cálculo de CD e Bônus assim que escolher a classe
    }
}

function renderizarRacas() {
    const lista = document.getElementById('listaRacas');
    if (!lista) return;

    lista.innerHTML = catalogoRacas.map(function(raca) {
        return `<div class="card-personagem" data-vantagem="${escapeHtml(raca[1])}" data-desvantagem="${escapeHtml(raca[2])}"><span class="nome-card">${escapeHtml(raca[0])}</span><div class="info-card"><span class="vantagem">Vantagens:</span> ${escapeHtml(raca[1])}<br><span class="desvantagem">Desvantagens:</span> ${escapeHtml(raca[2])}</div></div>`;
    }).join('');

    cardsRaca = document.querySelectorAll('#grupo-raca .card-personagem');
    cardsRaca.forEach(function(card) {
        card.addEventListener('click', function() {
            selecionarCard(cardsRaca, 'racaEscolhida', card);
        });
    });
}

renderizarRacas();

function renderizarClassesMagicas() {
    const lista = document.querySelector('#grupo-classe .grid-personagens');
    if (!lista) return;

    const classes = [
        ['Bardo', 'Inspiração e magia musical.', 'Menor resistência física.'],
        ['Bruxo', 'Poderes concedidos por um patrono.', 'Depende de um pacto.'],
        ['Druida', 'Magia natural e transformação.', 'Restrições ligadas à natureza.'],
        ['Feiticeiro', 'Magia inata e flexível.', 'Poucas magias conhecidas.']
    ];

    classes.forEach(function(classe) {
        if (Array.from(lista.querySelectorAll('.nome-card')).some(function(card) { return card.textContent.trim() === classe[0]; })) return;
        lista.insertAdjacentHTML('beforeend', `<div class="card-personagem"><span class="nome-card">${classe[0]}</span><div class="info-card"><span class="vantagem">Vantagem:</span> ${classe[1]}<br><span class="desvantagem">Desvantagem:</span> ${classe[2]}</div></div>`);
    });

    cardsClasse = document.querySelectorAll('#grupo-classe .card-personagem');
    cardsClasse.forEach(function(card) {
        card.addEventListener('click', function() {
            selecionarCard(cardsClasse, 'classeEscolhida', card);
        });
    });
}

renderizarClassesMagicas();

function renderizarFiltrosMonstros() {
    const tipo = document.getElementById('filtroTipoMonstro');
    const nd = document.getElementById('filtroNdMonstro');
    if (!tipo || !nd) return;

    tipo.innerHTML = '<option value="">Todos os tipos</option>';
    nd.innerHTML = '<option value="">Todos os ND</option>';
    Array.from(new Set(catalogoMonstros.map(function(monstro) { return monstro.tipo; }))).sort().forEach(function(valor) {
        tipo.insertAdjacentHTML('beforeend', `<option value="${escapeHtml(valor)}">${escapeHtml(valor)}</option>`);
    });
    Array.from(new Set(catalogoMonstros.map(function(monstro) { return monstro.nd; }))).sort(function(a, b) { return parseFloat(a) - parseFloat(b); }).forEach(function(valor) {
        nd.insertAdjacentHTML('beforeend', `<option value="${escapeHtml(valor)}">ND ${escapeHtml(valor)}</option>`);
    });
}

async function carregarBestiarioSrd() {
    const botao = document.getElementById('carregarBestiario');
    const status = document.getElementById('statusBestiario');
    if (botao) botao.disabled = true;
    if (status) status.textContent = 'Carregando criaturas do SRD...';

    try {
        const resposta = await fetch('https://www.dnd5eapi.co/api/2014/monsters');
        if (!resposta.ok) throw new Error('API indisponível');
        const indice = await resposta.json();
        const detalhes = await Promise.all(indice.results.map(async function(item) {
            const respostaMonstro = await fetch(`https://www.dnd5eapi.co/api/2014/monsters/${item.index}`);
            if (!respostaMonstro.ok) return null;
            return respostaMonstro.json();
        }));
        const monstrosSrd = detalhes.filter(Boolean).map(converterMonstroSrd);
        if (!monstrosSrd.length) throw new Error('Nenhum monstro retornado');

        catalogoMonstros.splice(0, catalogoMonstros.length, ...monstrosSrd);
        renderizarFiltrosMonstros();
        renderizarMonstros();
        if (status) status.textContent = `${monstrosSrd.length} criaturas SRD carregadas.`;
    } catch (error) {
        if (status) status.textContent = 'Não foi possível carregar o SRD. O catálogo inicial continua disponível.';
    } finally {
        if (botao) botao.disabled = false;
    }
}

function converterMonstroSrd(monstro) {
    const ataque = (monstro.actions || []).find(function(acao) {
        return acao.attack_bonus !== undefined || acao.damage;
    }) || (monstro.actions || [])[0];
    const tracos = (monstro.special_abilities || []).slice(0, 3).map(function(habilidade) {
        return `${habilidade.name}: ${habilidade.desc}`;
    }).join(' ');
    const dano = ataque?.damage?.map(function(item) {
        return `${item.damage_dice || ''} ${item.damage_type?.name || ''}`.trim();
    }).join(', ') || '';
    const ataqueTexto = ataque ? `${ataque.name || 'Ação'}${ataque.attack_bonus !== undefined ? `: +${ataque.attack_bonus}` : ''}${dano ? ` (${dano})` : ''}` : 'Sem ataque cadastrado';
    const atributos = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'].map(function(chave) {
        return `${chave.slice(0, 3).toUpperCase()} ${monstro[chave] ?? '-'}`;
    }).join(' | ');

    return {
        nome: monstro.name,
        tipo: monstro.type || 'Desconhecido',
        nd: String(monstro.challenge_rating ?? '-'),
        ca: monstro.armor_class?.[0]?.value ?? '-',
        pv: monstro.hit_points ?? 0,
        deslocamento: Object.values(monstro.speed || {}).join(', ') || '-',
        ataque: ataqueTexto,
        tracos: tracos || 'Nenhum traço especial cadastrado.',
        atributos: atributos
    };
}

function renderizarMonstros() {
    const lista = document.getElementById('listaMonstros');
    if (!lista) return;

    const busca = (document.getElementById('buscaMonstro')?.value || '').toLowerCase().trim();
    const tipo = document.getElementById('filtroTipoMonstro')?.value || '';
    const nd = document.getElementById('filtroNdMonstro')?.value || '';
    const monstros = catalogoMonstros.filter(function(monstro) {
        const correspondeBusca = !busca || `${monstro.nome} ${monstro.tipo}`.toLowerCase().includes(busca);
        return correspondeBusca && (!tipo || monstro.tipo === tipo) && (!nd || monstro.nd === nd);
    });

    lista.innerHTML = monstros.length ? monstros.map(function(monstro, indice) {
        return `<button type="button" class="card-monstro" data-monstro="${catalogoMonstros.indexOf(monstro)}"><span>${escapeHtml(monstro.nome)}</span><small>${escapeHtml(monstro.tipo)} · ND ${escapeHtml(monstro.nd)}</small></button>`;
    }).join('') : '<p class="lista-vazia">Nenhum monstro encontrado.</p>';
    lista.querySelectorAll('.card-monstro').forEach(function(card) {
        card.addEventListener('click', function() {
            exibirFichaMonstro(Number(card.dataset.monstro));
        });
    });
}

function exibirFichaMonstro(indice) {
    const monstro = catalogoMonstros[indice];
    const ficha = document.getElementById('fichaMonstro');
    if (!monstro || !ficha) return;

    monstroAtualIndice = indice;
    const vidas = lerDados(monstroVidaStorageKey);
    const imagens = lerDados(monstroImagemStorageKey);
    const vidaAtual = vidas[indice] === undefined ? monstro.pv : vidas[indice];
    ficha.innerHTML = `<div class="cabecalho-ficha-monstro"><div class="retrato-monstro"><img id="imagemMonstro" src="${imagens[indice] || ''}" alt="Retrato de ${escapeHtml(monstro.nome)}" ${imagens[indice] ? '' : 'hidden'}><span id="placeholderMonstro" ${imagens[indice] ? 'hidden' : ''}>Espaço para<br>retrato 3/4</span><label for="uploadMonstro">Adicionar foto</label><input type="file" id="uploadMonstro" accept="image/*"></div><header><span class="selo-rpg">Ficha de ameaça</span><h3>${escapeHtml(monstro.nome)}</h3><p>${escapeHtml(monstro.tipo)} · ND ${escapeHtml(monstro.nd)}</p></header></div><div class="dados-monstro"><div><b>CA</b><strong>${escapeHtml(monstro.ca)}</strong></div><div><b>PV atuais</b><strong id="monstroPvAtual">${escapeHtml(vidaAtual)}</strong></div><div><b>PV máximos</b><strong>${escapeHtml(monstro.pv)}</strong></div></div><div class="vida-monstro-controles"><label>Atualizar PV <input type="number" id="monstroPvInput" min="0" max="${monstro.pv}" value="${vidaAtual}"></label><button type="button" class="btn-salvar" onclick="salvarVidaMonstro()">Salvar PV</button><button type="button" class="btn-deletar" onclick="aplicarDanoMonstro()">Aplicar dano</button><button type="button" class="btn-sorteio" onclick="curarMonstro()">Curar</button></div><div class="dados-monstro"><div><b>Deslocamento</b><strong>${escapeHtml(monstro.deslocamento)}</strong></div></div><dl class="detalhes-monstro"><dt>Atributos</dt><dd>${escapeHtml(monstro.atributos)}</dd><dt>Ataque principal</dt><dd>${escapeHtml(monstro.ataque)}</dd><dt>Traços especiais</dt><dd>${escapeHtml(monstro.tracos)}</dd></dl>`;
    const upload = document.getElementById('uploadMonstro');
    if (upload) upload.addEventListener('change', function() { salvarImagemMonstro(indice, upload.files[0]); });
    document.querySelectorAll('.card-monstro').forEach(function(card) { card.classList.toggle('selecionado', Number(card.dataset.monstro) === indice); });
}

function salvarImagemMonstro(indice, arquivo) {
    if (!arquivo || !arquivo.type.startsWith('image/')) return;
    const leitor = new FileReader();
    leitor.onload = function() {
        const imagens = lerDados(monstroImagemStorageKey);
        imagens[indice] = leitor.result;
        salvarDados(monstroImagemStorageKey, imagens);
        exibirFichaMonstro(indice);
    };
    leitor.readAsDataURL(arquivo);
}

function rolarDadosMestre() {
    const quantidadeCampo = document.getElementById('quantidadeDados');
    const tipoCampo = document.getElementById('tipoDado');
    const resultado = document.getElementById('resultadoRolagem');
    const quantidade = Math.min(100, Math.max(1, Number(quantidadeCampo.value) || 1));
    const lados = Number(tipoCampo.value) || 20;
    const valores = Array.from({length: quantidade}, function() {
        return Math.floor(Math.random() * lados) + 1;
    });
    const total = valores.reduce(function(soma, valor) { return soma + valor; }, 0);
    resultado.textContent = `${quantidade}d${lados}: ${total} (${valores.join(' + ')})`;
    const historico = lerDados(rolagemStorageKey);
    historico.unshift({expressao: `${quantidade}d${lados}`, total: total, valores: valores, criadoEm: new Date().toISOString()});
    salvarDados(rolagemStorageKey, historico.slice(0, 10));
    renderizarHistoricoRolagens();
    return {quantidade: quantidade, lados: lados, total: total, valores: valores};
}

function renderizarHistoricoRolagens() {
    const historicoElemento = document.getElementById('historicoRolagens');
    if (!historicoElemento) return;
    historicoElemento.innerHTML = lerDados(rolagemStorageKey).slice(0, 5).map(function(rolagem) {
        return `<span>${escapeHtml(rolagem.expressao)} = <strong>${escapeHtml(rolagem.total)}</strong> (${escapeHtml(rolagem.valores.join(', '))})</span>`;
    }).join('');
}

function carregarPersonagensVida() {
    const seletor = document.getElementById('personagemVidaSelect');
    if (!seletor) return;
    const fichas = lerDados(fichaStorageKey);
    seletor.innerHTML = '<option value="">Selecione um personagem</option>' + fichas.map(function(ficha) {
        return `<option value="${ficha.id}">${escapeHtml(ficha.nome)}</option>`;
    }).join('');
}

function atualizarCamposVidaPersonagem() {
    const id = Number(document.getElementById('personagemVidaSelect').value);
    const ficha = lerDados(fichaStorageKey).find(function(item) { return item.id === id; });
    const combate = ficha?.combate || {};
    document.getElementById('personagemPvAtual').value = combate.pvAtual || combate.pvMax || 0;
    document.getElementById('personagemPvMax').textContent = combate.pvMax || 0;
}

function salvarVidaPersonagem() {
    const id = Number(document.getElementById('personagemVidaSelect').value);
    const fichas = lerDados(fichaStorageKey);
    const indice = fichas.findIndex(function(ficha) { return ficha.id === id; });
    if (indice < 0) return;
    const ficha = fichas[indice];
    const backups = lerDados(fichaBackupStorageKey);
    backups.push({id: Date.now(), fichaId: id, criadoEm: new Date().toISOString(), versao: ficha.versao || 1, ficha: JSON.parse(JSON.stringify(ficha))});
    ficha.combate = ficha.combate || {};
    ficha.combate.pvAtual = Math.max(0, Math.min(Number(ficha.combate.pvMax || 0), Number(document.getElementById('personagemPvAtual').value) || 0));
    ficha.versao = (ficha.versao || 1) + 1;
    ficha.atualizadoEm = new Date().toISOString();
    salvarDados(fichaStorageKey, fichas);
    salvarDados(fichaBackupStorageKey, backups);
    atualizarCamposVidaPersonagem();
    renderizarFichas();
}

function salvarVidaMonstro() {
    if (monstroAtualIndice === null) return;
    const monstro = catalogoMonstros[monstroAtualIndice];
    const vidas = lerDados(monstroVidaStorageKey);
    const backups = lerDados(monstroBackupStorageKey);
    const anterior = vidas[monstroAtualIndice] === undefined ? monstro.pv : vidas[monstroAtualIndice];
    backups.push({id: Date.now(), monstro: monstro.nome, pvAnterior: anterior, criadoEm: new Date().toISOString()});
    vidas[monstroAtualIndice] = Math.max(0, Math.min(monstro.pv, Number(document.getElementById('monstroPvInput').value) || 0));
    salvarDados(monstroVidaStorageKey, vidas);
    salvarDados(monstroBackupStorageKey, backups);
    exibirFichaMonstro(monstroAtualIndice);
}

function aplicarDanoMonstro() {
    const rolagem = rolarDadosMestre();
    if (monstroAtualIndice === null) return;
    const input = document.getElementById('monstroPvInput');
    input.value = Math.max(0, Number(input.value) - rolagem.total);
    salvarVidaMonstro();
}

function curarMonstro() {
    const rolagem = rolarDadosMestre();
    if (monstroAtualIndice === null) return;
    const input = document.getElementById('monstroPvInput');
    const maximo = catalogoMonstros[monstroAtualIndice].pv;
    input.value = Math.min(maximo, Number(input.value) + rolagem.total);
    salvarVidaMonstro();
}

renderizarFiltrosMonstros();
renderizarMonstros();
renderizarHistoricoRolagens();
carregarPersonagensVida();
const personagemVidaSelect = document.getElementById('personagemVidaSelect');
if (personagemVidaSelect) personagemVidaSelect.addEventListener('change', atualizarCamposVidaPersonagem);
['buscaMonstro', 'filtroTipoMonstro', 'filtroNdMonstro'].forEach(function(id) {
    const campo = document.getElementById(id);
    if (campo) campo.addEventListener('input', renderizarMonstros);
    if (campo && campo.tagName === 'SELECT') campo.addEventListener('change', renderizarMonstros);
});

cardsClasse.forEach(function(card) {
    card.addEventListener('click', function() {
        selecionarCard(cardsClasse, 'classeEscolhida', card);
    });
});

function lerDados(storageKey) {
    try {
        return JSON.parse(localStorage.getItem(storageKey) || '[]');
    } catch (error) {
        return [];
    }
}

function salvarDados(storageKey, dados) {
    localStorage.setItem(storageKey, JSON.stringify(dados));
}

// FUNÇÃO ATUALIZADA: Editar Ficha com carregamento do sistema Mágico
function editarFicha(id) {
    const fichas = lerDados(fichaStorageKey);
    const ficha = fichas.find(f => f.id === id);
    if(!ficha) return;

    fichaEditandoId = id; 
    
    window.location.href = '#personagem'; 
    
    document.getElementById('nomePersonagem').value = ficha.nome || '';
    document.getElementById('nivel').value = ficha.nivel || 1;
    document.getElementById('antecedente').value = ficha.antecedente || '';
    document.getElementById('tendencia').value = ficha.tendencia || '';
    document.getElementById('experiencia').value = ficha.experiencia || 0;
    document.getElementById('historia').value = ficha.historia || '';
    
    document.getElementById('racaEscolhida').value = ficha.raca || '';
    if(ficha.raca) {
        const racaCard = Array.from(cardsRaca).find(c => c.querySelector('.nome-card').textContent.trim() === ficha.raca);
        if(racaCard) selecionarCard(cardsRaca, 'racaEscolhida', racaCard);
    }

    document.getElementById('classeEscolhida').value = ficha.classe || '';
    if(ficha.classe) {
        const classeCard = Array.from(cardsClasse).find(c => c.querySelector('.nome-card').textContent.trim() === ficha.classe);
        if(classeCard) {
            selecionarCard(cardsClasse, 'classeEscolhida', classeCard);
        }
    }

    if(ficha.atributos) {
        document.getElementById('forca').value = ficha.atributos.forca || 10;
        document.getElementById('destreza').value = ficha.atributos.destreza || 10;
        document.getElementById('constituicao').value = ficha.atributos.constituicao || 10;
        document.getElementById('inteligencia').value = ficha.atributos.inteligencia || 10;
        document.getElementById('sabedoria').value = ficha.atributos.sabedoria || 10;
        document.getElementById('carisma').value = ficha.atributos.carisma || 10;
    }

    if(ficha.combate) {
        document.getElementById('pvMax').value = ficha.combate.pvMax || 10;
        document.getElementById('pvAtual').value = ficha.combate.pvAtual || 10;
        document.getElementById('pvTemp').value = ficha.combate.pvTemp || 0;
        document.getElementById('classeArmd').value = ficha.combate.classeArmd || 10;
        document.getElementById('dadosVida').value = ficha.combate.dadosVida || '';
        document.getElementById('iniciativa').value = ficha.combate.iniciativa || '';
        document.getElementById('deslocamento').value = ficha.combate.deslocamento || '';
        document.getElementById('bonusProf').value = ficha.combate.bonusProf || '';
        document.getElementById('inspiracao').value = ficha.combate.inspiracao || '';
        document.getElementById('moedas').value = ficha.combate.moedas || '';
        document.getElementById('sucessosMorte').value = ficha.combate.sucessosMorte || 0;
        document.getElementById('fracassosMorte').value = ficha.combate.fracassosMorte || 0;
        document.getElementById('equipamentoOpcao').value = ficha.combate.equipamentoOpcao || '';
        document.getElementById('equipamento').value = ficha.combate.equipamento || '';
        document.getElementById('ataqueArma').value = ficha.combate.ataqueArma || '';
        document.getElementById('ataqueBonus').value = ficha.combate.ataqueBonus || '';
        document.getElementById('ataqueDano').value = ficha.combate.ataqueDano || '';
        document.getElementById('ataques').value = ficha.combate.ataques || '';
        document.getElementById('ataqueMagiaOpcao').value = ficha.combate.ataqueMagiaOpcao || '';
        document.getElementById('ataquesMagiaDetalhes').value = ficha.combate.ataquesMagiaDetalhes || '';
    }

    if(ficha.detalhes) {
        ['tracos', 'ideais', 'ligacoes', 'defeitos', 'caracteristicas', 'idiomas', 'aparencia', 'idade', 'altura', 'peso', 'olhos', 'pele', 'cabelos', 'aliados', 'tesouro'].forEach(campo => {
            const el = document.getElementById(campo);
            if(el) el.value = ficha.detalhes[campo] || '';
        });
    }

    if(ficha.magias) {
        document.getElementById('truques').value = ficha.magias.truques || '';
        document.getElementById('magiasConhecidas').value = ficha.magias.conhecidas || '';
    }

    atualizarCalculosAutomaticos(); // Recalcula tudo baseado no que foi carregado

    const btnSalvar = document.querySelector('#formNovaFicha .btn-salvar');
    if(btnSalvar) btnSalvar.textContent = "Atualizar Ficha";
}

function salvarJogador() {
    const form = document.getElementById('formNovoUsuario');
    if (!form || !form.reportValidity()) return;

    usuarioAguardandoPapel = {
        id: Date.now(),
        nome: document.getElementById('nome').value.trim(),
        telefone: document.getElementById('fone').value.trim(),
        nascimento: document.getElementById('nasc').value,
        email: document.getElementById('email').value.trim()
    };
    const papelSelecionado = document.querySelector('input[name="papelUsuario"]:checked')?.value;
    if (papelSelecionado) {
        definirPapel(papelSelecionado);
        return;
    }
    document.getElementById('modalPapel').hidden = false;
    document.body.classList.add('modal-aberto');
}

function definirPapel(papel) {
    if (!usuarioAguardandoPapel) return;

    const usuario = Object.assign({}, usuarioAguardandoPapel, {papel: papel});
    const jogadores = lerDados(jogadorStorageKey);
    jogadores.push(usuario);
    salvarDados(jogadorStorageKey, jogadores);
    salvarDados(sessaoStorageKey, usuario);
    usuarioAguardandoPapel = null;
    document.getElementById('modalPapel').hidden = true;
    document.body.classList.remove('modal-aberto');
    document.getElementById('formNovoUsuario').reset();
    aplicarAcessoPapel();
    if (papel === 'mestre') document.getElementById('mestre').scrollIntoView({behavior: 'smooth'});
    else document.getElementById('personagem').scrollIntoView({behavior: 'smooth'});
}

function aplicarAcessoPapel() {
    const sessao = lerSessao();
    const eMestre = sessao?.papel === 'mestre' || sessao?.papel === 'mestre-jogador';
    const areaMestre = document.getElementById('mestre');
    const linkMestre = document.getElementById('linkAreaMestre');
    if (areaMestre) areaMestre.hidden = !eMestre;
    if (linkMestre) linkMestre.hidden = !eMestre;
}

function lerSessao() {
    try {
        return JSON.parse(localStorage.getItem(sessaoStorageKey) || 'null');
    } catch (error) {
        return null;
    }
}

function abrirNpcModal() {
    if (lerSessao()?.papel !== 'mestre') return;
    document.getElementById('modalNpc').hidden = false;
    document.body.classList.add('modal-aberto');
}

function fecharNpcModal() {
    document.getElementById('modalNpc').hidden = true;
    document.body.classList.remove('modal-aberto');
}

function salvarNpc(event) {
    event.preventDefault();
    const npcs = lerDados(npcStorageKey);
    npcs.push({
        id: Date.now(),
        nome: document.getElementById('npcNome').value.trim(),
        tipo: document.getElementById('npcTipo').value.trim(),
        grupo: document.getElementById('npcGrupo').value.trim(),
        relacao: document.getElementById('npcRelacao').value.trim(),
        raca: document.getElementById('npcRaca').value.trim(),
        classe: document.getElementById('npcClasse').value.trim(),
        pv: document.getElementById('npcPv').value,
        ca: document.getElementById('npcCa').value,
        historia: document.getElementById('npcHistoria').value.trim()
    });
    salvarDados(npcStorageKey, npcs);
    document.getElementById('formNpc').reset();
    fecharNpcModal();
    renderizarNpcs();
}

function renderizarNpcs() {
    const lista = document.getElementById('listaNpcsConteudo');
    if (!lista) return;
    const npcs = lerDados(npcStorageKey);
    lista.innerHTML = npcs.length ? npcs.map(function(npc) {
        return `<article class="card-npc"><div><h4>${escapeHtml(npc.nome)}</h4><p>${escapeHtml(npc.raca || 'Raça não informada')} · ${escapeHtml(npc.classe || 'Função não informada')}</p></div><div><strong>${escapeHtml(npc.grupo || 'Sem grupo')}</strong><span>${escapeHtml(npc.relacao || 'Vínculo não informado')}</span></div><p>${escapeHtml(npc.historia || 'Sem história registrada.')}</p></article>`;
    }).join('') : '<p class="lista-vazia">Nenhum NPC cadastrado.</p>';
}

function carregarHistoriaCampanha() {
    const campo = document.getElementById('historiaCampanha');
    if (campo) campo.value = localStorage.getItem(historiaCampanhaStorageKey) || '';
}

function salvarHistoriaCampanha() {
    const campo = document.getElementById('historiaCampanha');
    if (!campo) return;
    localStorage.setItem(historiaCampanhaStorageKey, campo.value.trim());
    alert('História da campanha salva.');
}

// FUNÇÃO ATUALIZADA: Calcula Saves e Perícias Oficiais ao Salvar a Ficha
function salvarFicha() {
    const form = document.getElementById('formNovaFicha');
    if (!form || !form.reportValidity()) return;

    const raca = document.getElementById('racaEscolhida').value;
    const classe = document.getElementById('classeEscolhida').value;

    if (!raca || !classe) {
        alert('Escolha uma raça e uma classe antes de salvar a ficha.');
        return;
    }

    // --- CÁLCULO DE PERÍCIAS E RESISTÊNCIAS (LIVRO DO JOGADOR) ---
    const nivelVal = Number(document.getElementById('nivel').value) || 1;
    const profBonus = Math.floor((nivelVal - 1) / 4) + 2;
    
    const attrs = {
        0: Number(document.getElementById('forca').value) || 10,
        1: Number(document.getElementById('destreza').value) || 10,
        2: Number(document.getElementById('constituicao').value) || 10,
        3: Number(document.getElementById('inteligencia').value) || 10,
        4: Number(document.getElementById('sabedoria').value) || 10,
        5: Number(document.getElementById('carisma').value) || 10
    };
    const getMod = (val) => Math.floor((val - 10) / 2);

    // Mapeamento de Proficiências Nativas por Classe D&D 5e
    const infoClassesDetalhadas = {
        'Mago': { profSaves: [3, 4], profPericias: [1, 6] },
        'Clérigo': { profSaves: [4, 5], profPericias: [16, 11] },
        'Druida': { profSaves: [3, 4], profPericias: [12, 10] },
        'Paladino': { profSaves: [4, 5], profPericias: [16, 14] },
        'Bardo': { profSaves: [1, 5], profPericias: [3, 14, 4] },
        'Feiticeiro': { profSaves: [2, 5], profPericias: [1, 14] },
        'Bruxo': { profSaves: [4, 5], profPericias: [1, 7] },
        'Guerreiro': { profSaves: [0, 2], profPericias: [2, 7] },
        'Bárbaro': { profSaves: [0, 2], profPericias: [2, 17] },
        'Ladino': { profSaves: [1, 3], profPericias: [5, 0, 15, 4] } 
    };

    const infoDet = infoClassesDetalhadas[classe] || { profSaves: [], profPericias: [] };
    
    // Calcula Testes de Resistência baseados nos modificadores e bônus da classe
    let testesResistenciaObj = {};
    for (let i = 0; i < 6; i++) {
        let val = getMod(attrs[i]);
        if (infoDet.profSaves.includes(i)) val += profBonus;
        testesResistenciaObj[`resistencia_${i}`] = (val >= 0 ? '+' : '') + val;
    }

    // Calcula Perícias e vincula com o atributo base que ela usa (ex: Acrobacia usa Destreza[1])
    const periciaAttrMap = [1, 3, 0, 5, 5, 1, 3, 5, 4, 3, 4, 4, 3, 4, 5, 1, 3, 4];
    let periciasObj = {};
    for (let i = 0; i < 18; i++) {
        let val = getMod(attrs[periciaAttrMap[i]]);
        if (infoDet.profPericias.includes(i)) val += profBonus;
        periciasObj[`pericia_${i}`] = (val >= 0 ? '+' : '') + val;
    }
    // -------------------------------------------------------------

    const ficha = {
        id: fichaEditandoId ? fichaEditandoId : Date.now(), 
        nome: document.getElementById('nomePersonagem').value.trim(),
        historia: document.getElementById('historia').value.trim(),
        antecedente: document.getElementById('antecedente').value.trim(),
        tendencia: document.getElementById('tendencia').value.trim(),
        experiencia: document.getElementById('experiencia').value,
        nivel: document.getElementById('nivel').value,
        raca: raca,
        vantagemRaca: document.getElementById('vantagemRaca').value.trim(),
        desvantagemRaca: document.getElementById('desvantagemRaca').value.trim(),
        classe: classe,
        atributos: {
            forca: document.getElementById('forca').value,
            destreza: document.getElementById('destreza').value,
            constituicao: document.getElementById('constituicao').value,
            inteligencia: document.getElementById('inteligencia').value,
            sabedoria: document.getElementById('sabedoria').value,
            carisma: document.getElementById('carisma').value
        },
        combate: {
            pvMax: document.getElementById('pvMax').value,
            pvAtual: document.getElementById('pvAtual').value,
            pvTemp: document.getElementById('pvTemp').value,
            classeArmd: document.getElementById('classeArmd').value,
            iniciativa: document.getElementById('iniciativa').value.trim(),
            deslocamento: document.getElementById('deslocamento').value.trim(),
            dadosVida: document.getElementById('dadosVida').value.trim(),
            bonusProf: document.getElementById('bonusProf').value.trim(),
            inspiracao: document.getElementById('inspiracao').value.trim(),
            moedas: document.getElementById('moedas').value.trim(),
            sucessosMorte: document.getElementById('sucessosMorte').value,
            fracassosMorte: document.getElementById('fracassosMorte').value,
            equipamentoOpcao: document.getElementById('equipamentoOpcao').value,
            equipamento: document.getElementById('equipamento').value.trim(),
            ataqueArma: document.getElementById('ataqueArma').value,
            ataqueBonus: document.getElementById('ataqueBonus').value.trim(),
            ataqueDano: document.getElementById('ataqueDano').value.trim(),
            ataques: document.getElementById('ataques').value.trim(),
            ataqueMagiaOpcao: document.getElementById('ataqueMagiaOpcao').value,
            ataquesMagiaDetalhes: document.getElementById('ataquesMagiaDetalhes').value.trim()
        },
        detalhes: {
            tracos: document.getElementById('tracos').value.trim(),
            ideais: document.getElementById('ideais').value.trim(),
            ligacoes: document.getElementById('ligacoes').value.trim(),
            defeitos: document.getElementById('defeitos').value.trim(),
            caracteristicas: document.getElementById('caracteristicas').value.trim(),
            idiomas: document.getElementById('idiomas').value.trim(),
            aparencia: document.getElementById('aparencia').value.trim(),
            idade: document.getElementById('idade').value.trim(),
            altura: document.getElementById('altura').value.trim(),
            peso: document.getElementById('peso').value.trim(),
            olhos: document.getElementById('olhos').value.trim(),
            pele: document.getElementById('pele').value.trim(),
            cabelos: document.getElementById('cabelos').value.trim(),
            aliados: document.getElementById('aliados').value.trim(),
            tesouro: document.getElementById('tesouro').value.trim()
        },
        magias: {
            classeConjurador: document.getElementById('classeConjurador').value.trim(),
            habilidadeChave: document.getElementById('habilidadeChave').value.trim(),
            cdTr: document.getElementById('cdTr').value.trim(),
            bonusAtaque: document.getElementById('bonusAtaqueMagia').value.trim(),
            truques: document.getElementById('truques').value.trim(),
            conhecidas: document.getElementById('magiasConhecidas').value.trim()
        },
        // Salva os cálculos automáticos que fizemos lá em cima
        testesResistencia: testesResistenciaObj,
        pericias: periciasObj,
        versao: 1,
        atualizadoEm: new Date().toISOString()
    };

    const fichas = lerDados(fichaStorageKey);
    
    if (fichaEditandoId !== null) {
        const index = fichas.findIndex(f => f.id === fichaEditandoId);
        if (index !== -1) {
            fichas[index] = ficha;
        }
        fichaEditandoId = null; 
        document.querySelector('#formNovaFicha .btn-salvar').textContent = "Salvar Ficha";
        alert('Ficha atualizada com sucesso!');
    } else {
        fichas.push(ficha);
        alert('Ficha salva na guilda!');
    }

    salvarDados(fichaStorageKey, fichas);
    renderizarFichas();
    form.reset();
}

function deletarPersonagem(id) {
    if (!confirm('Tem certeza que deseja deletar esta ficha?')) return;

    const fichas = lerDados(fichaStorageKey).filter(function(ficha) {
        return ficha.id !== id;
    });
    salvarDados(fichaStorageKey, fichas);
    renderizarFichas();
}

function renderizarFichas() {
    const lista = document.getElementById('listaFichas');
    if (!lista) return;

    const fichas = lerDados(fichaStorageKey);
    lista.innerHTML = '';

    if (fichas.length === 0) {
        lista.innerHTML = '<p class="lista-vazia">Nenhuma ficha foi salva ainda.</p>';
        return;
    }

    fichas.forEach(function(ficha) {
        const card = document.createElement('div');
        card.className = 'card-lista';
        card.innerHTML = `<div class="info-resumo"><p><strong>Personagem:</strong> ${escapeHtml(ficha.nome)}</p><p><strong>Raça:</strong> ${escapeHtml(ficha.raca)}</p><p><strong>Classe:</strong> ${escapeHtml(ficha.classe)}</p></div>
        <div class="acao-lista">
            <button type="button" class="btn-abrir" onclick="abrirFichaModal(${ficha.id})">Abrir</button>
            <button type="button" class="btn-sorteio" onclick="editarFicha(${ficha.id})">Editar</button>
            <button type="button" class="btn-deletar" onclick="deletarPersonagem(${ficha.id})">Deletar</button>
        </div>`;
        lista.appendChild(card);
    });
}

function escapeHtml(valor) {
    return String(valor === null || valor === undefined ? '' : valor).replace(/[&<>'"]/g, function(caractere) {
        return {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[caractere];
    });
}

function preencherCampoModal(id, valor, padrao) {
    const elemento = document.getElementById(id);
    if (!elemento) return;

    const valorVazio = (!valor || valor === '' || valor === 'Não informado' || valor === padrao);

    if (valorVazio) {
        const container = elemento.closest('.ficha-bloco') || elemento.parentElement;
        if (container && !container.classList.contains('ficha-faixa')) {
             container.style.display = 'none';
        } else {
             elemento.textContent = '-';
        }
    } else {
        const container = elemento.closest('.ficha-bloco') || elemento.parentElement;
        if (container) container.style.display = '';
        
        elemento.textContent = valor;
    }
}

function abrirFichaModal(id) {
    const modal = document.getElementById('modalFicha');
    const ficha = lerDados(fichaStorageKey).find(function(item) {
        return item.id === id;
    });

    if (!modal || !ficha) return;

    const atributos = ficha.atributos || {};
    const combate = ficha.combate || {};
    const detalhes = ficha.detalhes || {};
    const magias = ficha.magias || {};
    const nomesAtributos = {
        forca: 'Força',
        destreza: 'Destreza',
        constituicao: 'Constituição',
        inteligencia: 'Inteligência',
        sabedoria: 'Sabedoria',
        carisma: 'Carisma'
    };

    document.getElementById('modalFichaNome').textContent = ficha.nome || 'Herói sem nome';
    document.getElementById('modalFichaOrigem').textContent = `${ficha.raca || 'Raça não definida'} • ${ficha.classe || 'Classe não definida'}`;
    preencherCampoModal('modalFichaNomeSecundario', ficha.nome, 'Herói sem nome');
    preencherCampoModal('modalFichaClasse', ficha.classe, 'Não informada');
    preencherCampoModal('modalFichaRaca', ficha.raca, 'Não informada');
    preencherCampoModal('modalFichaHistoria', ficha.historia, '');
    
    document.getElementById('modalFichaAtributos').innerHTML = Object.keys(nomesAtributos).map(function(chave) {
        return `<div><strong>${nomesAtributos[chave]}</strong><span>${escapeHtml(atributos[chave] || '-')}</span></div>`;
    }).join('');

    preencherCampoModal('modalFichaAntecedente', ficha.antecedente, 'Não informado');
    preencherCampoModal('modalFichaTendencia', ficha.tendencia, 'Não informado');
    preencherCampoModal('modalFichaExperiencia', ficha.experiencia, '0');
    preencherCampoModal('modalFichaNivel', ficha.nivel, '1');
    preencherCampoModal('modalFichaPv', `${combate.pvAtual || combate.pvMax || '0'} / ${combate.pvMax || '0'}`);
    preencherCampoModal('modalFichaPvTemp', combate.pvTemp, '0');
    preencherCampoModal('modalFichaArmd', combate.classeArmd, '10');
    preencherCampoModal('modalFichaIniciativa', combate.iniciativa, '');
    preencherCampoModal('modalFichaDeslocamento', combate.deslocamento, '');
    preencherCampoModal('modalFichaDadosVida', combate.dadosVida, '');
    preencherCampoModal('modalFichaBonusProf', combate.bonusProf, '');
    preencherCampoModal('modalFichaInspiracao', combate.inspiracao, '');
    preencherCampoModal('modalFichaMoedas', combate.moedas, 'Não informado');
    preencherCampoModal('modalFichaMorte', `${combate.sucessosMorte || 0} sucessos / ${combate.fracassosMorte || 0} fracassos`);
    
    const equipamentoTexto = [combate.equipamentoOpcao && `Kit: ${combate.equipamentoOpcao}`, combate.equipamento].filter(Boolean).join(' | ');
    const ataqueTexto = [combate.ataqueArma, combate.ataqueBonus, combate.ataqueDano].filter(Boolean).join(' | ');
    preencherCampoModal('modalFichaEquipamento', equipamentoTexto, 'Não informado');
    preencherCampoModal('modalFichaAtaques', [ataqueTexto, combate.ataques].filter(Boolean).join(' | '), 'Não informado');
    
    preencherCampoModal('modalFichaTracos', detalhes.tracos, 'Não informado');
    preencherCampoModal('modalFichaIdeais', detalhes.ideais, 'Não informado');
    preencherCampoModal('modalFichaLigacoes', detalhes.ligacoes, 'Não informado');
    preencherCampoModal('modalFichaDefeitos', detalhes.defeitos, 'Não informado');
    preencherCampoModal('modalFichaCaracteristicas', detalhes.caracteristicas, 'Não informado');
    preencherCampoModal('modalFichaIdiomas', detalhes.idiomas, 'Não informado');
    preencherCampoModal('modalFichaAparencia', detalhes.aparencia, 'Não informado');
    
    preencherCampoModal('modalFichaFisico', [detalhes.idade && `Idade: ${detalhes.idade}`, detalhes.altura && `Altura: ${detalhes.altura}`, detalhes.peso && `Peso: ${detalhes.peso}`, detalhes.olhos && `Olhos: ${detalhes.olhos}`, detalhes.pele && `Pele: ${detalhes.pele}`, detalhes.cabelos && `Cabelos: ${detalhes.cabelos}`].filter(Boolean).join(' | '), 'Não informado');
    
    preencherCampoModal('modalFichaAliados', detalhes.aliados, 'Não informado');
    preencherCampoModal('modalFichaTesouro', detalhes.tesouro, 'Não informado');
    
    preencherCampoModal('modalFichaClasseConjurador', magias.classeConjurador, 'Não informado');
    preencherCampoModal('modalFichaHabilidadeChave', magias.habilidadeChave, 'Não informado');
    preencherCampoModal('modalFichaCdTr', magias.cdTr, 'Não informado');
    preencherCampoModal('modalFichaBonusAtaque', magias.bonusAtaque, 'Não informado');
    preencherCampoModal('modalFichaTruques', magias.truques, 'Não informado');
    preencherCampoModal('modalFichaMagias', magias.conhecidas, 'Não informado');

    const sabedoria = Number(atributos.sabedoria || 10);
    document.getElementById('modalFichaPassiva').textContent = 10 + Math.floor((sabedoria - 10) / 2);
    fichaModalAtualId = ficha.id;
    
    renderizarCamposEditaveis('modalFichaResistencias', nomesResistencias, ficha.testesResistencia || {}, 'resistencia');
    renderizarCamposEditaveis('modalFichaPericias', nomesPericias, ficha.pericias || {}, 'pericia');
    
    document.getElementById('modalFichaPassiva').value = ficha.sabedoriaPassiva || 10 + Math.floor((sabedoria - 10) / 2);
    document.getElementById('modalFichaInspiracao').value = combate.inspiracao || '';
    
    modal.hidden = false;
    document.body.classList.add('modal-aberto');
    modal.querySelector('.modal-fechar').focus();
}

function renderizarCamposEditaveis(elementId, nomes, valores, prefixo) {
    const container = document.getElementById(elementId);
    if (!container) return;

    container.innerHTML = nomes.map(function(nome, indice) {
        const chave = `${prefixo}_${indice}`;
        return `<label class="campo-modal"><span>${nome}</span><input type="text" data-tipo="${prefixo}" data-chave="${chave}" value="${escapeHtml(valores[chave] || '')}" placeholder="+0"></label>`;
    }).join('');
}

function salvarAlteracoesFicha() {
    if (fichaModalAtualId === null) return;

    const fichas = lerDados(fichaStorageKey);
    const indiceFicha = fichas.findIndex(function(ficha) {
        return ficha.id === fichaModalAtualId;
    });
    if (indiceFicha < 0) return;

    const fichaAtual = fichas[indiceFicha];
    const backups = lerDados(fichaBackupStorageKey);
    backups.push({
        id: Date.now(),
        fichaId: fichaAtual.id,
        criadoEm: new Date().toISOString(),
        versao: fichaAtual.versao || 1,
        ficha: JSON.parse(JSON.stringify(fichaAtual))
    });

    const fichaAtualizada = JSON.parse(JSON.stringify(fichaAtual));
    fichaAtualizada.testesResistencia = lerCamposEditaveis('resistencia');
    fichaAtualizada.pericias = lerCamposEditaveis('pericia');
    fichaAtualizada.sabedoriaPassiva = document.getElementById('modalFichaPassiva').value;
    fichaAtualizada.combate = fichaAtualizada.combate || {};
    fichaAtualizada.combate.inspiracao = document.getElementById('modalFichaInspiracao').value.trim();
    fichaAtualizada.versao = (fichaAtual.versao || 1) + 1;
    fichaAtualizada.atualizadoEm = new Date().toISOString();

    fichas[indiceFicha] = fichaAtualizada;
    salvarDados(fichaStorageKey, fichas);
    salvarDados(fichaBackupStorageKey, backups);
    abrirFichaModal(fichaAtualizada.id);
    renderizarFichas();
    alert(`Alterações salvas. Backup da versão ${fichaAtual.versao || 1} criado.`);
}

function lerCamposEditaveis(tipo) {
    const valores = {};
    document.querySelectorAll(`[data-tipo="${tipo}"]`).forEach(function(campo) {
        valores[campo.dataset.chave] = campo.value.trim();
    });
    return valores;
}

function fecharFichaModal() {
    const modal = document.getElementById('modalFicha');
    if (!modal) return;

    modal.hidden = true;
    document.body.classList.remove('modal-aberto');
}

document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') fecharFichaModal();
});

document.addEventListener('click', function(event) {
    if (event.target.id === 'modalFicha') fecharFichaModal();
});

function mudarModoAtributos(modo) {
    const listaAtributos = ['forca', 'destreza', 'constituicao', 'inteligencia', 'sabedoria', 'carisma'];

    listaAtributos.forEach(function(id) {
        const campo = document.getElementById(id);

        if (modo === 'automatico') {
            campo.value = Math.floor(Math.random() * 20) + 1;
            campo.readOnly = true;
            campo.style.backgroundColor = 'rgba(84, 217, 232, 0.12)';
        } else {
            campo.readOnly = false;
            campo.value = 10;
            campo.style.backgroundColor = '';
        }
    });

    atualizarCalculosAutomaticos(); // Recalcula a matemática após sortear os dados
    if (modo === 'automatico') {
        alert('Os atributos foram definidos com uma rolagem de D20 e os bônus atualizados.');
    }
}

function sortearClasse() {
    const classes = ['Guerreiro', 'Mago', 'Ladino', 'Clérigo', 'Bárbaro', 'Paladino'];
    const classeSorteada = classes[Math.floor(Math.random() * classes.length)];
    const classeCard = Array.from(cardsClasse).find(function(card) {
        return card.querySelector('.nome-card').textContent.trim() === classeSorteada;
    });

    if (classeCard) {
        selecionarCard(cardsClasse, 'classeEscolhida', classeCard);
    }

    alert('A classe sorteada foi: ' + classeSorteada);
}

function sortearRaca() {
    if (!cardsRaca.length) return;

    const racaSorteada = cardsRaca[Math.floor(Math.random() * cardsRaca.length)];
    selecionarCard(cardsRaca, 'racaEscolhida', racaSorteada);
    alert('A raça sorteada foi: ' + racaSorteada.querySelector('.nome-card').textContent.trim());
}

function preencherEquipamentoAutomatico() {
    const classe = document.getElementById('classeEscolhida').value;
    const kits = {
        Guerreiro: ['guerreiro', 'Espada longa, escudo, cota de malha e mochila de aventureiro.'],
        Paladino: ['guerreiro', 'Espada longa, escudo, armadura pesada e símbolo sagrado.'],
        Mago: ['mago', 'Cajado arcano, grimório, componentes e mochila de estudioso.'],
        Ladino: ['ladino', 'Adagas, ferramentas de ladrão, capa escura e mochila de aventureiro.'],
        Clérigo: ['aventureiro', 'Maça, escudo, símbolo sagrado e kit de sacerdote.'],
        Bárbaro: ['guerreiro', 'Machado de batalha, duas machadinhas, peles e kit de explorador.']
    };
    const kit = kits[classe] || ['aventureiro', 'Mochila de aventureiro, corda, tochas, cantil e ferramentas básicas.'];
    document.getElementById('equipamentoOpcao').value = kit[0];
    document.getElementById('equipamento').value = kit[1];
}

function preencherArmaAutomatica() {
    const classe = document.getElementById('classeEscolhida').value;
    const armas = {
        Guerreiro: ['Espada longa', '+5', '1d8 cortante'],
        Paladino: ['Espada longa', '+5', '1d8 cortante'],
        Mago: ['Cajado arcano', '+2', '1d6 contundente'],
        Ladino: ['Adaga', '+5', '1d4 perfurante'],
        Clérigo: ['Maça', '+4', '1d6 contundente'],
        Bárbaro: ['Machado de batalha', '+5', '1d8 cortante']
    };
    const arma = armas[classe] || ['Espada longa', '+3', '1d8 cortante'];
    document.getElementById('ataqueArma').value = arma[0];
    document.getElementById('ataqueBonus').value = arma[1];
    document.getElementById('ataqueDano').value = arma[2];
}

function preencherOpcoesMagia() {
    const seletor = document.getElementById('ataqueMagiaOpcao');
    if (!seletor) return;

    const classe = document.getElementById('classeEscolhida').value;
    const magias = catalogoMagias[classe] || [];
    seletor.innerHTML = '<option value="">Escolher magia</option>' + magias.map(function(magia, indice) {
        return `<option value="${indice}">${magia[0]}</option>`;
    }).join('');
}

function preencherMagiaAutomatica() {
    const classe = document.getElementById('classeEscolhida').value;
    const magias = catalogoMagias[classe] || [];
    const seletor = document.getElementById('ataqueMagiaOpcao');
    const detalhes = document.getElementById('ataquesMagiaDetalhes');

    if (!magias.length || !seletor || !detalhes) {
        alert('Escolha uma classe mágica para preencher uma magia automaticamente.');
        return;
    }

    if (!seletor.options.length || seletor.options.length === 1) preencherOpcoesMagia();
    const indice = seletor.value === '' ? 0 : Number(seletor.value);
    const magia = magias[indice] || magias[0];
    seletor.value = String(indice);
    detalhes.value = `${magia[0]}\nEfeito: ${magia[1]}\nDano/Efeito: ${magia[2]}`;
    document.getElementById('ataques').value = detalhes.value;
}

const formJogador = document.getElementById('formNovoUsuario');
const formFicha = document.getElementById('formNovaFicha');
const formNpc = document.getElementById('formNpc');

if (formJogador) {
    formJogador.addEventListener('submit', function(event) {
        event.preventDefault();
        salvarJogador();
    });
}

if (formFicha) {
    formFicha.addEventListener('submit', function(event) {
        event.preventDefault();
        salvarFicha();
    });
}

if (formNpc) formNpc.addEventListener('submit', salvarNpc);

renderizarFichas();
aplicarAcessoPapel();
renderizarNpcs();
carregarHistoriaCampanha();

function carregarFichaDisplay() {
    const fichas = lerDados(fichaStorageKey);
    if (!fichas || fichas.length === 0) return;
    const ficha = fichas[fichas.length - 1];

    if (document.getElementById('displayNome')) document.getElementById('displayNome').textContent = ficha.nome || '';
    if (document.getElementById('displayClasse')) document.getElementById('displayClasse').textContent = ficha.classe || '';
    if (document.getElementById('displayJogador')) document.getElementById('displayJogador').textContent = (localStorage.getItem(jogadorStorageKey) ? JSON.parse(localStorage.getItem(jogadorStorageKey))[0]?.nome : '') || '';

    if (ficha.atributos) {
        if (document.getElementById('displayFor')) document.getElementById('displayFor').textContent = ficha.atributos.forca || '';
        if (document.getElementById('displayDes')) document.getElementById('displayDes').textContent = ficha.atributos.destreza || '';
        if (document.getElementById('displayCon')) document.getElementById('displayCon').textContent = ficha.atributos.constituicao || '';
        if (document.getElementById('displayInt')) document.getElementById('displayInt').textContent = ficha.atributos.inteligencia || '';
        if (document.getElementById('displaySab')) document.getElementById('displaySab').textContent = ficha.atributos.sabedoria || '';
        if (document.getElementById('displayCar')) document.getElementById('displayCar').textContent = ficha.atributos.carisma || '';
    }

    if (document.getElementById('displayPV')) document.getElementById('displayPV').textContent = ficha.pv || '12 / 12';
    if (document.getElementById('displayCA')) document.getElementById('displayCA').textContent = ficha.ca || '16';
    if (document.getElementById('displayAtk')) document.getElementById('displayAtk').textContent = ficha.atk || '+5 (Arma)';

    if (document.getElementById('displayPassiva')) {
        const sab = Number(ficha.atributos?.sabedoria || 10);
        const passiva = 10 + Math.floor((sab - 10) / 2);
        document.getElementById('displayPassiva').textContent = passiva;
    }
}

carregarFichaDisplay();