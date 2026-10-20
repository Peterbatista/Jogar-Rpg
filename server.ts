import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '10mb' }));

// Shared Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Endpoint: Geração da Campanha, Mapas, Monstros e Itens com IA Gemini
app.post('/api/gemini/generate-campaign', async (req: Request, res: Response) => {
  const { type, theme, level, customPrompt } = req.body;

  try {
    let systemInstruction = `Você é um Arqui-Mestre de RPG D&D 5e experiente e criador de mundos fantástico-alquímicos do Codex RPG. Responda em Português do Brasil com riqueza de detalhes, estatísticas balanceadas de D&D 5e e atmosfera envolvente.`;
    let userPrompt = '';

    if (type === 'lore') {
      userPrompt = `Gere uma campanha épica de D&D 5e no tema "${theme || 'Ruínas Alquímicas Arcanas'}" para nível ${level || 3}.
Forneça em formato JSON estruturado com os campos:
{
  "titulo": "Título épico da campanha",
  "sinopse": "Sinopse concisa e empolgante",
  "tema": "${theme || 'Ruínas Alquímicas'}",
  "nivelRecomendado": "Nível ${level || 3}",
  "ganchoAventura": "Gancho inicial de contratação ou mistério",
  "arcosNarrativos": [
    { "fase": "Ato 1", "titulo": "Nome do Ato", "detalhes": "Descrição do conflito inicial" },
    { "fase": "Ato 2", "titulo": "Nome do Ato", "detalhes": "Aprofundamento e traição/mistério" },
    { "fase": "Ato 3", "titulo": "Nome do Ato", "detalhes": "Confronto e clímax decisivo" }
  ]
}`;
    } else if (type === 'map') {
      userPrompt = `Crie um mapa tático de D&D 5e no tema "${theme || 'Masmorra Subterrânea'}" para nível ${level || 3}.
Forneça em formato JSON com:
{
  "nome": "Nome do Mapa/Masmorra",
  "ambiente": "${theme || 'Laboratório Subterrâneo'}",
  "descricao": "Visão geral da estrutura e iluminação",
  "tamanhoGrid": "25x25 quadrados (1.5m cada)",
  "climaEAtmosfera": "Odores de enxofre, névoa e goteiras arcanas",
  "salas": [
    "Sala 1 (Entrada dos Guardiões): Círculo rúnico e estátuas de ferro",
    "Sala 2 (Câmara de Destilação): Tubos de vidro quebrado e poças ácidas",
    "Sala 3 (Sanctum do Arquimago): Altar de transmutação e grimórios flutuantes"
  ],
  "armadilhasESegredos": [
    "Placa de pressão com vapor flamejante (Percepção DC 14, Reflexos DC 13)",
    "Porta secreta atrás de estante com runa de Mercúrio revelável com luz mágica"
  ],
  "layoutVisualAscii": "[ENTRADA] === (CORREDOR) === [LABORATÓRIO] === [SANCTUM]"
}`;
    } else if (type === 'monster') {
      userPrompt = `Crie um monstro ou chefe vilão para D&D 5e de Nível de Desafio CR ${level || 3} no tema "${theme || 'Golem Alquímico Corrompido'}".
Forneça em formato JSON com:
{
  "nome": "Nome do Monstro/NPC",
  "tipo": "Construto / Elemental Médio",
  "desafioCR": "CR ${level || 3}",
  "ca": 15,
  "pv": 68,
  "deslocamento": "9m (caminhada)",
  "atributos": { "for": 16, "des": 12, "con": 16, "int": 6, "sab": 10, "car": 8 },
  "habilidades": [
    "Núcleo de Mercúrio: Vantagem em salvaguardas contra veneno e magia ácida.",
    "Sobrecarga Elemental: Quando atinge 0 PV, explode liberando miasma (DC 13 Con)"
  ],
  "acoesCombate": [
    "Pancada Rúnica: Ataque corpo a corpo +5 para acertar, dano 2d8+3 concussão + 1d6 ácido.",
    "Sopro de Vapor Igneo (Recarga 5-6): Cone de 4.5m, dano 3d6 fogo (DC 13 Destreza reduz à metade)."
  ],
  "lore": "Breve história da criatura e como ela se comporta em batalha."
}`;
    } else if (type === 'item') {
      userPrompt = `Crie um item mágico de recompensa para D&D 5e no tema "${theme || 'Artefato de Transmutação'}".
Forneça em formato JSON com:
{
  "nome": "Nome do Item",
  "tipo": "arma", // ou "armadura" | "reliquia" | "pocao" | "pergaminho"
  "raridade": "Raro",
  "pesoKg": 1.5,
  "valorPO": 450,
  "propriedadesMagicas": "+1 nas jogadas de ataque e dano; concede 1d6 de dano de fogo ou ácido à escolha do portador.",
  "descricao": "Forjada nas caldeiras primordiais com runas de combustão alquímica."
}`;
    } else {
      userPrompt = customPrompt || `Gere elementos de campanha D&D 5e no tema ${theme}.`;
    }

    let responseText = '';
    // Call Gemini API if available
    if (process.env.GEMINI_API_KEY) {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: [
          { role: 'user', parts: [{ text: `${systemInstruction}\n\n${userPrompt}` }] }
        ],
      });
      responseText = response.text || '';
    }

    // Try parsing JSON or provide clean structure
    let parsedResult = null;
    if (responseText) {
      try {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedResult = JSON.parse(jsonMatch[0]);
        }
      } catch (err) {
        // use raw text
      }
    }

    // If Gemini wasn't called or failed to parse, use procedural rich generator
    if (!parsedResult) {
      if (type === 'lore') {
        parsedResult = {
          titulo: `A Crônica das Ruínas de ${theme || 'Aethelgard'}`,
          sinopse: `Antigos alquimistas selaram um segredo sob as abóbadas arcanas. O equilíbrio elemental foi corrompido e apenas heróis valorosos podem restaurar o Núcleo Cósmico.`,
          tema: theme || 'Ruínas Alquímicas Arcanas',
          nivelRecomendado: `Nível ${level || 3}`,
          ganchoAventura: `Um mercador ferido chega com um mapa gravado em chumbo puro, pedindo socorro antes de se liquefazer em cinzas prismáticas.`,
          arcosNarrativos: [
            { fase: 'Ato 1', titulo: 'O Chamado de Chumbo', detalhes: 'Investigação do massacre no entreposto e travessia da Floresta de Enxofre.' },
            { fase: 'Ato 2', titulo: 'As Abóbadas de Mercúrio', detalhes: 'Infiltração nos salões subterrâneos, desarmando armadilhas rúnicas e enfrentando golens desgovernados.' },
            { fase: 'Ato 3', titulo: 'O Julgamento da Pedra Filosofal', detalhes: 'Confronto final contra o Arquimago Corrompido no topo da forja estelar.' }
          ]
        };
      } else if (type === 'map') {
        parsedResult = {
          nome: `Masmorra do Crisol de ${theme || 'Prata Viva'}`,
          ambiente: theme || 'Laboratório Subterrâneo Arcano',
          descricao: `Complexo escavado em obsidiana negra iluminado por canaletas de mercúrio fosforescente. O ar cheira a ozônio e fuligem mágica.`,
          tamanhoGrid: '20x20 quadrados (1.5m cada)',
          climaEAtmosfera: 'Frio gélido com goteiras de condensação química e ecos de engrenagens arcanas.',
          salas: [
            'Sala 1 (Válvula de Entrada): Câmara hermética com inscrições rúnicas de boas-vindas e 2 estátuas sentinelas.',
            'Sala 2 (Destilaria de Éter): Grandes tonéis de cobre interligados por canos de vidro com fluidos borbulhantes.',
            'Sala 3 (Câmara de Isolamento): Cubículo com campo de força translúcido contendo um tomo proibido.',
            'Sala 4 (Coração da Forja): Plataforma circular suspensa sobre um abismo de plasma estelar.'
          ],
          armadilhasESegredos: [
            'Válvula de gás clorídrico oculta sob lajota falsa (Percepção DC 14, teste de Constituição DC 13 ou envenenado).',
            'Alavanca disfarçada em forma de candelabro que abre o cofre de reagentes raros.'
          ],
          layoutVisualAscii: '[ENTRADA] --> [SALA DOS TONÉIS] --> [CORREDOR RÚNICO] --> [FORJA FINAL]'
        };
      } else if (type === 'monster') {
        parsedResult = {
          nome: `${theme || 'Autômato Químico'} Titânico`,
          tipo: 'Construto Grande, Neutro Caótico',
          desafioCR: `CR ${level || 3}`,
          ca: 15,
          pv: 62 + (level || 3) * 8,
          deslocamento: '9m (terrestre)',
          atributos: { for: 17, des: 10, con: 16, int: 5, sab: 11, car: 6 },
          habilidades: [
            'Blindagem Quimicamente Resistente: Resistência a dano cortante e perfurante de armas não-mágicas.',
            'Reação Exotérmica: Quando sofre dano de fogo, ganha +2 no dano das suas próximas ações.'
          ],
          acoesCombate: [
            'Punho Hidráulico: +6 para acertar, alcance 1.5m, dano 2d8+3 concussão.',
            'Jato de Ácido Concentrado (Recarga 5-6): Linha de 9m por 1.5m de largura. Alvos fazem salvaguarda de Destreza DC 13 sofrendo 4d6 de dano de ácido (metade em sucesso).'
          ],
          lore: `Criado por alquimistas heréticos como guardião indefectível. Seu interior contém caldeiras arcanas movidas a vapor e alkahest purificado.`
        };
      } else {
        parsedResult = {
          nome: `Lâmina do Éter de ${theme || 'Solaris'}`,
          tipo: 'arma',
          raridade: 'Raro',
          pesoKg: 1.5,
          valorPO: 500,
          propriedadesMagicas: '+1 de bônus em jogadas de ataque e dano. Ao atingir um acerto crítico, emana uma onda de calor causando 2d6 de dano radiante extra.',
          descricao: `Lâmina forjada em aço temperado com cristais de ouro monoatômico. Reluz com uma chama solar que nunca se extingue.`
        };
      }
    }

    res.json({
      success: true,
      data: parsedResult,
      rawText: responseText || null,
      generatedWith: process.env.GEMINI_API_KEY ? 'gemini-3.8-flash' : 'codex-procedural-ai',
    });
  } catch (error: any) {
    console.error('Erro na API Gemini:', error);
    res.status(500).json({
      success: false,
      error: error?.message || 'Falha ao processar requisição com Gemini IA.',
    });
  }
});

// Endpoint: Simulação de Envio de Notificações (E-mail & Celular)
app.post('/api/notifications/send-challenge', (req: Request, res: Response) => {
  const { jogadorEmail, jogadorNome, mestreNome, desafioTitulo, recompensaXp } = req.body;

  res.json({
    success: true,
    message: `Notificações de desafio enviadas com sucesso para ${jogadorNome || 'jogador'}.`,
    emailEnviado: {
      destinatario: jogadorEmail || 'jogador@codexrpg.com',
      remetente: 'mestre@codexrpg.com',
      assunto: `⚔️ [Codex RPG] Novo Desafio do Mestre: ${desafioTitulo}`,
      dataHora: new Date().toISOString(),
    },
    pushCelularEnviado: {
      titulo: `Novo Desafio de ${mestreNome || 'Mestre da Mesa'}`,
      corpo: `${desafioTitulo} (+${recompensaXp} XP)`,
      som: 'rpg_quest_horn.mp3',
      vibracao: [200, 100, 200],
    },
  });
});

async function startServer() {
  if (!isProd) {
    // Development mode with Vite middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production mode: serve static files from dist
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
