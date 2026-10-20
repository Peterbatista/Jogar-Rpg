import React, { useEffect, useState } from 'react';
import {
  Bell,
  Mail,
  Smartphone,
  X,
  Sparkles,
  Award,
  CheckCircle,
  ExternalLink,
  Volume2,
  Vibrate,
  Shield,
} from 'lucide-react';
import { MasterChallenge } from '../types/rpg';

interface NotificationSimulatorModalProps {
  challenge: MasterChallenge | null;
  isOpen: boolean;
  onClose: () => void;
  onAcceptChallenge?: (challenge: MasterChallenge) => void;
}

export const NotificationSimulatorModal: React.FC<NotificationSimulatorModalProps> = ({
  challenge,
  isOpen,
  onClose,
  onAcceptChallenge,
}) => {
  const [activeView, setActiveView] = useState<'both' | 'phone' | 'email'>('both');
  const [phoneVibrating, setPhoneVibrating] = useState(false);

  useEffect(() => {
    if (isOpen && challenge) {
      setPhoneVibrating(true);
      const timer = setTimeout(() => setPhoneVibrating(false), 1200);
      return () => clearTimeout(timer);
    }
  }, [isOpen, challenge]);

  if (!isOpen || !challenge) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-amber-500/30 rounded-2xl shadow-2xl shadow-amber-500/10 overflow-hidden my-6">
        {/* Header da Notificação */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Bell className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white">
                  Despacho Oficial de Notificações do Mestre
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-[10px] font-bold text-emerald-300">
                  Enviado com Sucesso
                </span>
              </div>
              <p className="text-xs text-slate-400">
                O Mestre <strong className="text-amber-400">{challenge.mestreNome}</strong> gerou um novo desafio para{' '}
                <span className="text-white font-semibold">
                  {challenge.destinatario === 'todos' ? 'Toda a Mesa (Até 20 Jogadores)' : challenge.destinatarioNome}
                </span>.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs">
              <button
                onClick={() => setActiveView('both')}
                className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                  activeView === 'both' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                Ambos
              </button>
              <button
                onClick={() => setActiveView('phone')}
                className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                  activeView === 'phone' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                📱 Celular
              </button>
              <button
                onClick={() => setActiveView('email')}
                className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                  activeView === 'email' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                📧 E-mail
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Conteúdo: Celular e E-mail lado a lado */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 bg-slate-900/60">
          {/* SIMULADOR DE CELULAR (Push Notification & Lembrete) */}
          {(activeView === 'both' || activeView === 'phone') && (
            <div className="flex flex-col items-center">
              <div className="w-full flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-cyan-400" />
                  Lembrete no Celular (Push Notification)
                </span>
                <span className="text-[10px] text-slate-500 flex items-center gap-1">
                  <Vibrate className={`w-3 h-3 ${phoneVibrating ? 'text-amber-400 animate-ping' : ''}`} />
                  Som + Vibração Ativos
                </span>
              </div>

              {/* Smartphone Frame Mockup */}
              <div
                className={`w-full max-w-sm rounded-[36px] bg-slate-950 border-4 border-slate-700 p-3 shadow-2xl relative transition-transform ${
                  phoneVibrating ? 'scale-[1.02] border-amber-500/50' : ''
                }`}
              >
                {/* Notch / Dynamic Island */}
                <div className="w-24 h-4 bg-slate-800 rounded-full mx-auto mb-3 flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-950 mr-2"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-700"></div>
                </div>

                {/* Lock Screen Header */}
                <div className="text-center py-4">
                  <span className="text-4xl font-extralight text-white tracking-tight">
                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                    {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </div>
                </div>

                {/* Banner de Notificação Push */}
                <div className="my-3 p-3.5 rounded-2xl bg-slate-900/90 border border-amber-500/40 backdrop-blur-md shadow-xl animate-pulse">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-amber-400">
                      <div className="w-4 h-4 rounded-md bg-amber-500 flex items-center justify-center text-slate-950 text-[10px] font-black">
                        ⚡
                      </div>
                      CODEX RPG • AGORA
                    </div>
                    <span className="text-[10px] text-slate-500">Mesa D&D 5e</span>
                  </div>

                  <h4 className="text-xs font-bold text-white mb-1 flex items-center gap-1.5">
                    ⚔️ Novo Desafio: {challenge.titulo}
                  </h4>
                  <p className="text-[11px] text-slate-300 leading-relaxed line-clamp-2">
                    {challenge.descricao}
                  </p>

                  <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px]">
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-semibold">
                      +{challenge.recompensaXp} XP {challenge.recompensaItem ? `+ ${challenge.recompensaItem}` : ''}
                    </span>
                    <button
                      onClick={() => {
                        if (onAcceptChallenge) onAcceptChallenge(challenge);
                        onClose();
                      }}
                      className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition cursor-pointer shadow-sm"
                    >
                      Abrir no App
                    </button>
                  </div>
                </div>

                {/* Atalhos inferiores do celular */}
                <div className="flex justify-between items-center px-4 pt-6 pb-2 text-slate-500 text-xs">
                  <div className="w-9 h-9 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center">
                    🔦
                  </div>
                  <div className="w-16 h-1 bg-slate-700 rounded-full"></div>
                  <div className="w-9 h-9 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center">
                    📷
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SIMULADOR DE E-MAIL (Notificação por E-mail) */}
          {(activeView === 'both' || activeView === 'email') && (
            <div className="flex flex-col">
              <div className="w-full flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-amber-400" />
                  Notificação por E-mail Oficial
                </span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-md">
                  Status: Entregue na Caixa de Entrada
                </span>
              </div>

              {/* Email Client Window Mockup */}
              <div className="flex-1 rounded-2xl bg-slate-950 border border-slate-800 shadow-xl overflow-hidden flex flex-col">
                {/* Email Client Header */}
                <div className="px-4 py-2.5 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block"></span>
                    <span className="ml-2 font-mono text-[11px] text-slate-300 font-semibold">
                      Correio Arcano • Codex RPG
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500">SMTP Criptografado TLS</span>
                </div>

                {/* Email Metadata */}
                <div className="p-4 border-b border-slate-800/80 bg-slate-900/40 text-xs space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-semibold w-16">De:</span>
                    <span className="text-amber-400 font-medium">
                      Mestre {challenge.mestreNome} &lt;mestre@codexrpg.com&gt;
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-semibold w-16">Para:</span>
                    <span className="text-slate-200">
                      {challenge.destinatario === 'todos' ? 'jogadores-da-mesa@codexrpg.com' : `${challenge.destinatarioNome} &lt;jogador@codexrpg.com&gt;`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-semibold w-16">Assunto:</span>
                    <span className="text-white font-bold">
                      ⚔️ [Codex RPG] Novo Desafio da Mesa: {challenge.titulo}
                    </span>
                  </div>
                </div>

                {/* Email Body */}
                <div className="p-5 flex-1 space-y-4 text-xs text-slate-300 leading-relaxed bg-gradient-to-b from-slate-950 to-slate-900">
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
                    <h5 className="text-sm font-bold text-amber-300 mb-1 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      Um novo decreto foi proclamado pelo Mestre!
                    </h5>
                    <p className="text-slate-300 text-xs">
                      Saudações, nobre aventureiro. O Mestre da mesa convocou suas habilidades para completar o seguinte desafio:
                    </p>
                  </div>

                  <div className="space-y-2 bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
                    <div className="text-sm font-bold text-white">{challenge.titulo}</div>
                    <div className="text-xs text-slate-400 leading-normal">{challenge.descricao}</div>
                    <div className="flex items-center gap-3 pt-2 text-xs">
                      <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-bold">
                        Meta: {challenge.meta} {challenge.tipo === 'treino' ? 'repetições' : challenge.tipo === 'meditacao' ? 'minutos' : 'itens'}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-bold">
                        Recompensa: +{challenge.recompensaXp} XP
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400">
                    Este lembrete foi gerado automaticamente e enviado para seu e-mail cadastrado e notificação móvel. Complete a meta no painel do Codex RPG para resgatar a experiência e subir de nível.
                  </p>

                  <div className="pt-2">
                    <button
                      onClick={() => {
                        if (onAcceptChallenge) onAcceptChallenge(challenge);
                        onClose();
                      }}
                      className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition cursor-pointer shadow-md flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Visualizar & Acompanhar Desafio na Ficha
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Sistema de Notificações Criptografado Codex RPG</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition cursor-pointer"
          >
            Fechar Prévia
          </button>
        </div>
      </div>
    </div>
  );
};
