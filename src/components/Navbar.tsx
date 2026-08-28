import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Package,
  MessageSquare,
  Repeat,
  FileSpreadsheet,
  LogOut,
  ShieldCheck,
  CreditCard,
  ShoppingBag,
  ShieldAlert,
  Target,
  FileText,
  Plus,
  Sparkles,
  Users,
  Database,
  Cloud,
  Smartphone,
} from 'lucide-react';

export type AppTab =
  | 'dashboard'
  | 'vehicles'
  | 'trade'
  | 'card_fees'
  | 'catalog'
  | 'security'
  | 'goals'
  | 'copywriting'
  | 'crm'
  | 'backup'
  | 'chat'
  | 'tax';

interface NavbarProps {
  currentTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  onOpenNewVehicle: () => void;
  onOpenReceiptModal: () => void;
  onOpenAuthModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  onOpenNewVehicle,
  onOpenReceiptModal,
  onOpenAuthModal,
}) => {
  const { currentUser, users, logout, switchUser, cloudSyncStatus, isCloudSyncing } = useAuth();

  return (
    <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Brand Logo */}
          <div
            onClick={() => onTabChange('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer select-none shrink-0"
          >
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 flex items-center justify-center text-slate-950 font-black text-lg shadow-lg shadow-amber-500/20">
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-black tracking-tight text-white">
                  AUTOBRICK <span className="text-amber-400 font-extrabold">& BRIK MASTER</span>
                </span>
              </div>
              <div className="text-[10px] text-slate-400 font-medium">
                Sua Central Completa de Lucro & Trocas
              </div>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <div className="hidden xl:flex items-center space-x-1">
            <button
              onClick={() => onTabChange('dashboard')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                currentTab === 'dashboard'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Painel</span>
            </button>

            <button
              onClick={() => onTabChange('vehicles')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                currentTab === 'vehicles'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Estoque</span>
            </button>

            <button
              onClick={() => onTabChange('copywriting')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                currentTab === 'copywriting'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-amber-300 hover:text-amber-200 hover:bg-slate-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Anúncios IA</span>
            </button>

            <button
              onClick={() => onTabChange('crm')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                currentTab === 'crm'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Clientes & CRM</span>
            </button>

            <button
              onClick={() => onTabChange('trade')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                currentTab === 'trade'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Repeat className="w-3.5 h-3.5" />
              <span>Trocas</span>
            </button>

            <button
              onClick={() => onTabChange('card_fees')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                currentTab === 'card_fees'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Maquininha</span>
            </button>

            <button
              onClick={() => onTabChange('catalog')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                currentTab === 'catalog'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Vitrine</span>
            </button>

            <button
              onClick={() => onTabChange('security')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                currentTab === 'security'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Anti-Golpe</span>
            </button>

            <button
              onClick={() => onTabChange('goals')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                currentTab === 'goals'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              <span>Metas</span>
            </button>

            <button
              onClick={() => onTabChange('backup')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                currentTab === 'backup'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>Backup</span>
            </button>
          </div>

          {/* Quick Actions & User Switcher */}
          <div className="flex items-center gap-2 shrink-0">
            
            {/* Quick Action: New Item */}
            <button
              type="button"
              onClick={onOpenNewVehicle}
              className="px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span className="hidden sm:inline">Novo Item</span>
            </button>

            {/* Quick Action: Emit Receipt */}
            <button
              type="button"
              onClick={onOpenReceiptModal}
              title="Gerar Recibo e Garantia"
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs rounded-xl border border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Recibo / Garantia</span>
            </button>

            {/* Multi-tenant / Cloud Switcher Button */}
            {onOpenAuthModal && (
              <button
                type="button"
                onClick={onOpenAuthModal}
                title="Gerenciar Conta & Sincronização em Nuvem"
                className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  cloudSyncStatus === 'online'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-amber-500/40 hover:text-white'
                }`}
              >
                <Cloud className={`w-3.5 h-3.5 ${cloudSyncStatus === 'online' ? 'text-emerald-400' : 'text-amber-400'}`} />
                <span className="hidden md:inline">
                  {cloudSyncStatus === 'online' ? 'Nuvem Sincronizada' : 'Conectar Nuvem'}
                </span>
              </button>
            )}

            <div className="hidden lg:flex items-center gap-1.5 bg-slate-950 px-2.5 py-1.5 rounded-xl border border-slate-800 text-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <select
                value={currentUser?.id || ''}
                onChange={(e) => switchUser(e.target.value)}
                className="bg-transparent text-slate-200 text-xs font-bold focus:outline-none cursor-pointer"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id} className="bg-slate-900 text-white">
                    👤 {u.name.split(' ')[0]} ({u.storeName || 'Brik'})
                  </option>
                ))}
              </select>
            </div>

            {/* Logout Button */}
            <button
              onClick={logout}
              title="Sair da Conta"
              className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>

      {/* Subnav for Tablet / Mobile / Laptops */}
      <div className="xl:hidden border-t border-slate-800 bg-slate-950/95 px-3 py-2 flex items-center gap-2 overflow-x-auto scrollbar-none text-xs font-bold">
        <button
          onClick={() => onTabChange('dashboard')}
          className={`px-3 py-1.5 rounded-lg shrink-0 flex items-center gap-1 ${
            currentTab === 'dashboard' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
          }`}
        >
          <LayoutDashboard className="w-3.5 h-3.5" /> Painel
        </button>

        <button
          onClick={() => onTabChange('vehicles')}
          className={`px-3 py-1.5 rounded-lg shrink-0 flex items-center gap-1 ${
            currentTab === 'vehicles' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Package className="w-3.5 h-3.5" /> Estoque
        </button>

        <button
          onClick={() => onTabChange('copywriting')}
          className={`px-3 py-1.5 rounded-lg shrink-0 flex items-center gap-1 ${
            currentTab === 'copywriting' ? 'bg-amber-500 text-slate-950' : 'text-amber-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" /> Anúncios IA
        </button>

        <button
          onClick={() => onTabChange('crm')}
          className={`px-3 py-1.5 rounded-lg shrink-0 flex items-center gap-1 ${
            currentTab === 'crm' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-3.5 h-3.5" /> Clientes & CRM
        </button>

        <button
          onClick={() => onTabChange('trade')}
          className={`px-3 py-1.5 rounded-lg shrink-0 flex items-center gap-1 ${
            currentTab === 'trade' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Repeat className="w-3.5 h-3.5" /> Trocas & Rolo
        </button>

        <button
          onClick={() => onTabChange('card_fees')}
          className={`px-3 py-1.5 rounded-lg shrink-0 flex items-center gap-1 ${
            currentTab === 'card_fees' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" /> Maquininha
        </button>

        <button
          onClick={() => onTabChange('catalog')}
          className={`px-3 py-1.5 rounded-lg shrink-0 flex items-center gap-1 ${
            currentTab === 'catalog' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5" /> Vitrine
        </button>

        <button
          onClick={() => onTabChange('security')}
          className={`px-3 py-1.5 rounded-lg shrink-0 flex items-center gap-1 ${
            currentTab === 'security' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" /> Anti-Golpe
        </button>

        <button
          onClick={() => onTabChange('goals')}
          className={`px-3 py-1.5 rounded-lg shrink-0 flex items-center gap-1 ${
            currentTab === 'goals' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Target className="w-3.5 h-3.5" /> Metas
        </button>

        <button
          onClick={() => onTabChange('backup')}
          className={`px-3 py-1.5 rounded-lg shrink-0 flex items-center gap-1 ${
            currentTab === 'backup' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Database className="w-3.5 h-3.5" /> Backup
        </button>

        <button
          onClick={() => onTabChange('chat')}
          className={`px-3 py-1.5 rounded-lg shrink-0 flex items-center gap-1 ${
            currentTab === 'chat' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" /> Chat IA
        </button>

        <button
          onClick={() => onTabChange('tax')}
          className={`px-3 py-1.5 rounded-lg shrink-0 flex items-center gap-1 ${
            currentTab === 'tax' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5" /> IRPF
        </button>
      </div>
    </nav>
  );
};
