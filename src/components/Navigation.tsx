import {
  User,
  FlaskConical,
  Dumbbell,
  BookOpen,
  Backpack,
  Trophy,
  BarChart3,
  Bell,
  Crown,
} from 'lucide-react';

export type TabKey =
  | 'ficha'
  | 'alquimia'
  | 'treino'
  | 'narrativa'
  | 'inventario'
  | 'sala_mestre'
  | 'ranking'
  | 'estatisticas'
  | 'notificacoes';

interface NavigationProps {
  activeTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
  pendingApprovalsCount?: number;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onSelectTab, pendingApprovalsCount = 0 }) => {
  const navItems = [
    { key: 'ficha' as TabKey, label: 'Ficha RPG', icon: User },
    { key: 'sala_mestre' as TabKey, label: 'Sala do Mestre (Mesa)', icon: Crown, badge: pendingApprovalsCount },
    { key: 'alquimia' as TabKey, label: 'Codex Alquimia', icon: FlaskConical },
    { key: 'treino' as TabKey, label: 'Treino & Meditação', icon: Dumbbell },
    { key: 'narrativa' as TabKey, label: 'Campanha & D20', icon: BookOpen },
    { key: 'inventario' as TabKey, label: 'Mochila', icon: Backpack },
    { key: 'ranking' as TabKey, label: 'Ranking', icon: Trophy },
    { key: 'estatisticas' as TabKey, label: 'Estatísticas', icon: BarChart3 },
    { key: 'notificacoes' as TabKey, label: 'Desafios', icon: Bell },
  ];

  return (
    <>
      {/* Navegação Desktop (Tabs horizontais elegantes) */}
      <nav className="hidden md:block bg-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1 overflow-x-auto py-2">
            {navItems.map(item => {
              const isActive = activeTab === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => onSelectTab(item.key)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer relative ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Navegação Mobile (Bottom Bar fixa com rolagem suave) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 px-2 py-1.5 shadow-2xl">
        <div className="flex items-center justify-around overflow-x-auto gap-1">
          {navItems.slice(0, 6).map(item => {
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => onSelectTab(item.key)}
                className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition min-w-[50px] cursor-pointer ${
                  isActive ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <item.icon className="w-5 h-5 mb-0.5" />
                <span className="text-[9px] tracking-tight truncate max-w-[55px]">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
