import React, { useState } from 'react';
import { CharacterSheet, DailyChallenge } from '../types/rpg';
import { INITIAL_DAILY_CHALLENGES } from '../data/achievementsData';
import {
  Bell,
  Sparkles,
  Award,
  CheckCircle2,
  Calendar,
  Flame,
  Zap,
} from 'lucide-react';

interface NotificationsPanelProps {
  character: CharacterSheet;
  onUpdateCharacter: (updater: (prev: CharacterSheet) => CharacterSheet) => void;
}

export const NotificationsPanel: React.FC<NotificationsPanelProps> = ({
  character,
  onUpdateCharacter,
}) => {
  const [challenges, setChallenges] = useState<DailyChallenge[]>(INITIAL_DAILY_CHALLENGES);
  const [pushStatus, setPushStatus] = useState<string>('idle');

  const handleRequestPushPermission = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      alert('Seu navegador não oferece suporte nativo à Web Notification API.');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setPushStatus('granted');
        new Notification('Codex RPG: Notificações Ativadas!', {
          body: 'Você receberá alertas sobre os Desafios Diários de Alquimia, Treino e Eventos Especiais!',
          icon: '/favicon.ico',
        });
      } else {
        setPushStatus('denied');
        alert('Permissão de notificações não autorizada.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleClaimChallenge = (challengeId: string) => {
    const ch = challenges.find(c => c.id === challengeId);
    if (!ch) return;

    onUpdateCharacter(prev => ({
      ...prev,
      experiencia: prev.experiencia + ch.recompensaXp,
    }));

    setChallenges(prev =>
      prev.map(c => (c.id === challengeId ? { ...c, resgatado: true } : c))
    );

    alert(`Parabéns! Você resgatou +${ch.recompensaXp} XP pelo desafio "${ch.titulo}".`);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 p-6 border border-purple-500/30 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold mb-2 border border-purple-500/30">
              <Bell className="w-3.5 h-3.5" />
              Notificações Push & Eventos da Guilda
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Desafios Diários & Avisos da Comunidade
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Ative notificações no navegador para receber alertas automáticos quando novos desafios de alquimia, sessões de treino e eventos do servidor ficarem disponíveis.
            </p>
          </div>

          <button
            onClick={handleRequestPushPermission}
            className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 text-white font-bold text-xs transition cursor-pointer flex items-center gap-2 shadow-lg shadow-purple-500/20 self-start md:self-auto"
          >
            <Bell className="w-4 h-4" />
            {pushStatus === 'granted' ? '✓ Notificações Ativadas' : 'Ativar Notificações Push'}
          </button>
        </div>
      </div>

      {/* Lista de Desafios Diários */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-base text-slate-100">Desafios Diários do Ciclo</h3>
          </div>
          <span className="text-xs text-slate-400">Reinicia a cada 24 horas</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {challenges.map(ch => (
            <div
              key={ch.id}
              className={`p-5 rounded-xl border transition flex flex-col justify-between ${
                ch.resgatado
                  ? 'bg-slate-950/40 border-slate-800/60 opacity-60'
                  : 'bg-slate-950/80 border-slate-800 hover:border-purple-500/50'
              }`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase">
                    {ch.tipo}
                  </span>
                  <span className="font-mono text-emerald-400 font-bold text-xs">+{ch.recompensaXp} XP</span>
                </div>

                <h4 className="font-bold text-sm text-slate-100 mt-3">{ch.titulo}</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{ch.descricao}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  disabled={ch.resgatado}
                  onClick={() => handleClaimChallenge(ch.id)}
                  className={`w-full py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    ch.resgatado
                      ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-slate-950'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {ch.resgatado ? 'Resgatado' : 'Completar & Resgatar XP'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
