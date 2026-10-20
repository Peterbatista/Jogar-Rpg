import React, { useState, useEffect } from 'react';
import { CharacterSheet } from '../types/rpg';
import { useAuth } from '../firebase/authContext';
import { DiceRollerModal } from './DiceRollerModal';
import {
  Flame,
  Shield,
  Heart,
  Dices,
  LogIn,
  LogOut,
  Wifi,
  WifiOff,
  Sparkles,
  Zap,
  History,
} from 'lucide-react';
import { useDiceRoll } from '../context/DiceRollContext';

interface HeaderProps {
  character: CharacterSheet;
  onOpenQuickD20: () => void;
  onOpenAuth: () => void;
}

export const Header: React.FC<HeaderProps> = ({ character, onOpenQuickD20, onOpenAuth }) => {
  const { user, isOnline, logout } = useAuth();
  const { setOpenHistoryModal } = useDiceRoll();
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 15000);
    return () => clearInterval(timer);
  }, []);

  const activeBuffs = character.buffs.filter(b => {
    const expiresAt = b.criadoEm + b.duracaoMinutos * 60 * 1000;
    return expiresAt > now;
  });

  const hpPercentage = Math.min(100, Math.max(0, (character.combate.pvAtual / character.combate.pvMax) * 100));

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo & Título */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20">
              <Flame className="w-6 h-6 fill-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg text-white tracking-tight">CODEX RPG</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  {character.papelUsuario === 'mestre' && '👑 Mestre'}
                  {character.papelUsuario === 'mestre_jogador' && '⚔️ Mestre / Jogador'}
                  {(!character.papelUsuario || character.papelUsuario === 'jogador') && '🛡️ Jogador'}
                </span>
                <span className="hidden sm:inline text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-900 text-slate-400 border border-slate-800">
                  Mesa: CDX-7842
                </span>
              </div>
              <div className="text-xs text-slate-400">
                {character.nome} • <span className="text-amber-400 font-semibold">{character.classe} Nv. {character.nivel}</span>
              </div>
            </div>
          </div>

          {/* Buffs Ativos Temporários (badges rápidos) */}
          <div className="hidden lg:flex items-center gap-2 overflow-x-auto max-w-md py-1">
            {activeBuffs.map(buff => {
              const minutesLeft = Math.max(1, Math.round((buff.criadoEm + buff.duracaoMinutos * 60 * 1000 - now) / 60000));
              return (
                <div
                  key={buff.id}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/40 text-[11px] text-amber-300 font-medium whitespace-nowrap"
                  title={buff.descricao}
                >
                  <Zap className="w-3 h-3 text-amber-400" />
                  <strong>+{buff.valor} {buff.atributo.toUpperCase()}</strong>
                  <span className="text-slate-400">({minutesLeft}m)</span>
                </div>
              );
            })}
            {activeBuffs.length === 0 && (
              <span className="text-[11px] text-slate-500 italic">Sem buffs ativos</span>
            )}
          </div>

          {/* Status Online, D20 rápido e Auth */}
          <div className="flex items-center gap-3">
            {/* Status Online/Offline */}
            <div
              className={`hidden sm:flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border ${
                isOnline
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                  : 'bg-amber-950/60 border-amber-500/40 text-amber-300'
              }`}
              title={isOnline ? 'Sincronizado em tempo real com Firebase' : 'Modo offline com cache local'}
            >
              {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
              <span className="font-medium text-[11px]">{isOnline ? 'Nuvem Conectada' : 'Modo Offline'}</span>
            </div>

            {/* Botão Rolar D20 Rápido & Histórico */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={onOpenQuickD20}
                className="p-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-amber-500 text-amber-400 hover:text-amber-300 transition cursor-pointer shadow-sm flex items-center gap-1.5 text-xs font-bold"
                title="Rolar Dado D20"
              >
                <Dices className="w-4 h-4" />
                <span className="hidden sm:inline">Rolar D20</span>
              </button>
              <button
                onClick={() => setOpenHistoryModal(true)}
                className="p-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white transition cursor-pointer shadow-sm flex items-center justify-center text-xs"
                title="Abrir Histórico de Rolagens"
              >
                <History className="w-4 h-4 text-cyan-400" />
              </button>
            </div>

            {/* Auth Button */}
            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'Jogador'}
                    className="w-8 h-8 rounded-full border border-amber-500/50"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-amber-600 flex items-center justify-center text-xs font-bold text-white">
                    {user.displayName?.[0] || 'U'}
                  </div>
                )}
                <span className="hidden xl:inline text-xs font-semibold text-slate-300 max-w-[120px] truncate">
                  {user.displayName || user.email?.split('@')[0]}
                </span>
                <button
                  onClick={logout}
                  className="p-1.5 text-slate-400 hover:text-red-400 transition cursor-pointer"
                  title="Desconectar conta"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="py-1.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Entrar / Cadastrar</span>
              </button>
            )}
          </div>
        </div>

        {/* Barra de Vida & Buffs Mobile */}
        <div className="mt-2.5 pt-2 border-t border-slate-900 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 flex-1 max-w-xs">
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 shrink-0" />
            <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
              <div
                className="bg-red-500 h-full transition-all duration-300"
                style={{ width: `${hpPercentage}%` }}
              />
            </div>
            <span className="font-mono text-[11px] text-slate-300 font-bold shrink-0">
              {character.combate.pvAtual}/{character.combate.pvMax}
            </span>
          </div>

          <div className="flex items-center gap-3 font-mono text-[11px] text-slate-400">
            <span>CA: <strong className="text-cyan-400">{character.combate.classeArmd}</strong></span>
            <span>XP: <strong className="text-amber-400">{character.experiencia}</strong></span>
          </div>
        </div>
      </div>
    </header>
  );
};
