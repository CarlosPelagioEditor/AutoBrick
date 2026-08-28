import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  calculateVehicleMetrics,
  formatBRL,
  formatPercent,
  getInventoryDurationDetails,
} from '../utils/calculations';
import { BrickItem, ItemCategory, ItemStatus } from '../types';
import { CATEGORIES_CONFIG, CATEGORIES_LIST, getCategoryInfo } from '../utils/categories';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';
import {
  Search,
  Plus,
  Sparkles,
  MessageSquare,
  Repeat,
  CheckCircle,
  Clock,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Wrench,
  Truck,
  DollarSign,
  FileCheck,
  Edit2,
  Trash2,
  Tag,
  Package,
  Layers,
  Gamepad2,
  Smartphone,
  Tv,
  Car,
  Laptop,
  Calendar,
  CheckCircle2,
  FileText,
} from 'lucide-react';

interface VehicleListProps {
  onSelectVehicle: (vehicle: BrickItem) => void;
  onOpenNewVehicle: () => void;
  onEditVehicle: (vehicle: BrickItem) => void;
  onOpenCopilot: (vehicle: BrickItem) => void;
  onOpenChatSimulator: (vehicle: BrickItem) => void;
  onMarkSold: (vehicle: BrickItem) => void;
  onGenerateReceipt?: (vehicle: BrickItem) => void;
  onOpenCopywriting?: (vehicle: BrickItem) => void;
}

export const VehicleList: React.FC<VehicleListProps> = ({
  onSelectVehicle,
  onOpenNewVehicle,
  onEditVehicle,
  onOpenCopilot,
  onOpenChatSimulator,
  onMarkSold,
  onGenerateReceipt,
  onOpenCopywriting,
}) => {
  const { vehicles, deleteVehicle } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ItemStatus>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | ItemCategory>('all');
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<BrickItem | null>(null);

  // Filter items
  const filteredItems = vehicles.filter((item) => {
    const matchesSearch =
      item.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.brand && item.brand.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.storageOrSpecs && item.storageOrSpecs.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.serialOrImei && item.serialOrImei.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.plate && item.plate.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.accessoriesIncluded && item.accessoriesIncluded.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || (item.category || 'other') === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedCardId(expandedCardId === id ? null : id);
  };

  const handleDeleteClick = (item: BrickItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setItemToDelete(item);
  };

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      deleteVehicle(itemToDelete.id);
      setItemToDelete(null);
    }
  };

  const getConditionBadge = (condition?: string) => {
    switch (condition) {
      case 'novo_lacrado':
        return <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">✨ Novo Lacrado</span>;
      case 'seminovo_impecavel':
        return <span className="px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-400 border border-sky-500/30 text-[10px] font-bold">💎 Seminovo Impecável</span>;
      case 'usado_bom':
        return <span className="px-2 py-0.5 rounded-md bg-slate-700/60 text-slate-300 border border-slate-600 text-[10px] font-semibold">👍 Usado Bom</span>;
      case 'com_detalhes':
        return <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-semibold">⚠️ Com Detalhes</span>;
      case 'para_conserto_pecas':
        return <span className="px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/30 text-[10px] font-semibold">🛠️ Para Peças</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Search and Filters Header */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl space-y-4">
        
        {/* Top Filter Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por Xbox, iPhone, TV, placa, modelo, serial, marca..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-950/80 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          {/* Status Filter Buttons */}
          <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0 overflow-x-auto">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                statusFilter === 'all'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Todos ({vehicles.length})
            </button>
            <button
              onClick={() => setStatusFilter('in_stock')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                statusFilter === 'in_stock'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Em Estoque ({vehicles.filter((v) => v.status === 'in_stock').length})
            </button>
            <button
              onClick={() => setStatusFilter('negotiating')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                statusFilter === 'negotiating'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Negociando ({vehicles.filter((v) => v.status === 'negotiating').length})
            </button>
            <button
              onClick={() => setStatusFilter('sold')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                statusFilter === 'sold'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Vendidos ({vehicles.filter((v) => v.status === 'sold').length})
            </button>
          </div>

          {/* New Item Button */}
          <button
            onClick={onOpenNewVehicle}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs rounded-xl shadow-md shadow-amber-500/20 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            Novo Item no Brik
          </button>
        </div>

        {/* Category Pills Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar border-t border-slate-800/80 pt-3">
          <span className="text-[11px] font-bold text-slate-500 mr-1 shrink-0">Categorias:</span>
          
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-3 py-1 rounded-lg font-bold shrink-0 transition-all ${
              categoryFilter === 'all'
                ? 'bg-slate-700 text-white border border-slate-600 shadow-sm'
                : 'bg-slate-950/60 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            📦 Todas ({vehicles.length})
          </button>

          {CATEGORIES_LIST.map((cat) => {
            const count = vehicles.filter((v) => (v.category || 'other') === cat.id).length;
            const isSelected = categoryFilter === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.id)}
                className={`px-3 py-1 rounded-lg font-bold shrink-0 transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-sm'
                    : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                <span>{cat.emoji}</span>
                <span>{cat.name.split('(')[0]}</span>
                {count > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Items Grid */}
      {filteredItems.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-12 text-center">
          <Package className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-1">Nenhum item encontrado</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
            Não encontramos nenhum produto no brik com os filtros atuais.
          </p>
          <button
            onClick={onOpenNewVehicle}
            className="px-4 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Cadastrar Primeiro Produto
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredItems.map((item) => {
            const metrics = calculateVehicleMetrics(item);
            const isExpanded = expandedCardId === item.id;
            const categoryMeta = getCategoryInfo(item.category);
            const isSold = item.status === 'sold';
            const duration = getInventoryDurationDetails(item.purchaseDate, item.saleDate, isSold);

            return (
              <div
                key={item.id}
                onClick={() => onSelectVehicle(item)}
                className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-3xl p-5 md:p-6 transition-all hover:shadow-xl cursor-pointer relative overflow-hidden group"
              >
                {/* Stock Alert Warning Bar */}
                {metrics.isOverStockAlert && !isSold && (
                  <div className="absolute top-0 left-0 right-0 bg-amber-500/10 border-b border-amber-500/20 px-4 py-1 text-[11px] font-bold text-amber-400 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Atenção: Item parado há {duration.days} dias no estoque!
                    </span>
                    <span className="text-slate-400">Recomendado acelerar giro ou aceitar contraproposta</span>
                  </div>
                )}

                <div className={`flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${metrics.isOverStockAlert && !isSold ? 'pt-5' : ''}`}>
                  
                  {/* Left Column: Product Info & Badges */}
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 text-2xl font-black shrink-0">
                      {categoryMeta.emoji}
                    </div>

                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-[10px] font-extrabold text-amber-400 uppercase tracking-wider">
                          {categoryMeta.name.split('(')[0]}
                        </span>
                        
                        {getConditionBadge(item.condition)}

                        {item.status === 'in_stock' && (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                            📦 Em Estoque
                          </span>
                        )}
                        {item.status === 'negotiating' && (
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-bold">
                            💬 Em Negociação
                          </span>
                        )}
                        {item.status === 'sold' && (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-[10px] font-extrabold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            Vendido
                            {item.tradeIn?.hasTradeIn && (
                              <span className="text-amber-400 ml-1 font-bold">
                                {item.tradeIn.dealType === 'trade_only' ? '• Troca Pura' : '• Dinheiro + Troca'}
                              </span>
                            )}
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-black text-white group-hover:text-amber-400 transition-colors">
                        {item.model}
                      </h3>

                      <div className="text-xs text-slate-400 flex flex-wrap items-center gap-3">
                        {item.brand && (
                          <span className="font-semibold text-slate-300">{item.brand}</span>
                        )}
                        {item.storageOrSpecs && (
                          <span>• {item.storageOrSpecs}</span>
                        )}
                        {item.plate && (
                          <span className="font-mono text-slate-300 font-bold bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                            Placa: {item.plate}
                          </span>
                        )}
                        {item.batteryHealth && (
                          <span className="text-emerald-400 font-bold">
                            • Bateria: {item.batteryHealth}%
                          </span>
                        )}
                        {item.serialOrImei && (
                          <span className="text-slate-400 text-[11px]">
                            • ID: {item.serialOrImei}
                          </span>
                        )}
                      </div>

                      {item.accessoriesIncluded && (
                        <p className="text-[11px] text-slate-400 italic line-clamp-1">
                          Incluso: {item.accessoriesIncluded}
                        </p>
                      )}

                      {/* TEMPO DE CADASTRO ATÉ A VENDA / EM ESTOQUE */}
                      <div className="pt-1">
                        {isSold ? (
                          <div className="inline-flex flex-wrap items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs">
                            <Clock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <div className="flex flex-wrap items-center gap-1.5 text-[11px] sm:text-xs">
                              <span className="font-extrabold text-emerald-300">
                                Vendido em {duration.days} {duration.days === 1 ? 'dia' : 'dias'}
                              </span>
                              <span className="text-emerald-500/60">•</span>
                              <span className="text-slate-300">
                                Entrada: <strong className="text-slate-100 font-bold">{duration.startDateFormatted}</strong>
                              </span>
                              <span className="text-emerald-400 font-bold">➔</span>
                              <span className="text-slate-300">
                                Venda: <strong className="text-emerald-300 font-bold">{duration.endDateFormatted}</strong>
                              </span>
                            </div>
                            <span className={`px-2 py-0.2 rounded-md border text-[10px] font-bold ${duration.speedBadge.colorClasses}`}>
                              {duration.speedBadge.emoji} {duration.speedBadge.label}
                            </span>
                          </div>
                        ) : (
                          <div className="inline-flex flex-wrap items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
                            <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span className="font-bold text-slate-200 text-[11px] sm:text-xs">
                              Em estoque há {duration.days} {duration.days === 1 ? 'dia' : 'dias'}
                            </span>
                            <span className="text-slate-600">•</span>
                            <span className="text-slate-400 text-[11px]">
                              Cadastrado em {duration.startDateFormatted}
                            </span>
                            <span className={`px-2 py-0.2 rounded-md border text-[10px] font-bold ${duration.speedBadge.colorClasses}`}>
                              {duration.speedBadge.emoji} {duration.speedBadge.label}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Middle Column: Financial Metrics */}
                  <div className="flex flex-wrap items-center gap-4 sm:gap-6 bg-slate-950/60 p-3 sm:p-4 rounded-2xl border border-slate-800 shrink-0">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-500">
                        {categoryMeta.marketPriceLabel}
                      </div>
                      <div className="text-xs font-bold text-slate-300">
                        {formatBRL(item.fipeValue)}
                      </div>
                      <div className="text-[10px] font-extrabold text-emerald-400">
                        {metrics.fipeDiscountPercent < 0
                          ? `${Math.abs(metrics.fipeDiscountPercent).toFixed(1)}% abaixo (vantagem)`
                          : `+${metrics.fipeDiscountPercent.toFixed(1)}%`}
                      </div>
                    </div>

                    <div className="border-l border-slate-800 pl-4 sm:pl-6">
                      <div className="text-[10px] uppercase font-bold text-slate-500">
                        Custo Total (Entrada)
                      </div>
                      <div className="text-xs font-extrabold text-amber-400">
                        {formatBRL(metrics.totalVehicleCost)}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Compra: {formatBRL(item.purchasePrice)}
                      </div>
                    </div>

                    <div className="border-l border-slate-800 pl-4 sm:pl-6">
                      <div className="text-[10px] uppercase font-bold text-slate-500">
                        {item.status === 'sold' ? 'Preço de Venda' : 'Preço Anunciado / Meta'}
                      </div>
                      <div className="text-xs font-extrabold text-white">
                        {formatBRL(item.salePrice || metrics.targetPrice15Percent)}
                      </div>
                      <div className={`text-[10px] font-bold ${metrics.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        Lucro: {formatBRL(metrics.netProfit)} ({formatPercent(metrics.realMarginPercent)})
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Actions */}
                  <div className="flex flex-wrap items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onOpenChatSimulator(item)}
                      title="Simular Contraproposta no Chat (WhatsApp/Marketplace)"
                      className="p-2.5 rounded-xl bg-slate-800 hover:bg-emerald-500/20 hover:text-emerald-300 text-slate-300 border border-slate-700 transition-all flex items-center gap-1.5 text-xs font-bold"
                    >
                      <MessageSquare className="w-4 h-4 text-emerald-400" />
                      <span className="hidden sm:inline">Simular Oferta</span>
                    </button>

                    {onOpenCopywriting && (
                      <button
                        onClick={() => onOpenCopywriting(item)}
                        title="Gerar Copy & Anúncio de Alta Conversão"
                        className="p-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-all flex items-center gap-1.5 text-xs font-bold"
                      >
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        <span className="hidden sm:inline">Anúncio IA</span>
                      </button>
                    )}

                    <button
                      onClick={() => onOpenCopilot(item)}
                      title="Copiloto IA & Estratégia de Negociação"
                      className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all flex items-center gap-1.5 text-xs font-bold"
                    >
                      <Sparkles className="w-4 h-4 text-sky-400" />
                      <span className="hidden sm:inline">Copiloto</span>
                    </button>

                    {/* Mark Sold Button */}
                    <button
                      onClick={() => onMarkSold(item)}
                      title={isSold ? 'Editar dados da Venda' : 'Marcar como Vendido'}
                      className={`p-2.5 rounded-xl border transition-all text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                        isSold
                          ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/25'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black shadow-md shadow-emerald-600/20'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{isSold ? 'Ver Venda' : 'Vendido'}</span>
                    </button>

                    {/* Receipt Generator Button */}
                    {onGenerateReceipt && (
                      <button
                        onClick={() => onGenerateReceipt(item)}
                        title="Gerar Recibo e Termo de Garantia"
                        className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all flex items-center gap-1.5 text-xs font-bold cursor-pointer"
                      >
                        <FileText className="w-4 h-4 text-amber-400" />
                        <span className="hidden sm:inline">Recibo</span>
                      </button>
                    )}

                    {/* Edit Item Button */}
                    <button
                      onClick={() => onEditVehicle(item)}
                      title="Editar Item"
                      className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    {/* Delete Item Button */}
                    <button
                      onClick={(e) => handleDeleteClick(item, e)}
                      title="Excluir Item do Brik"
                      className="p-2.5 rounded-xl bg-slate-800 hover:bg-rose-500/20 hover:text-rose-400 text-slate-400 border border-slate-700 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    {/* Expand Details */}
                    <button
                      onClick={(e) => toggleExpand(item.id, e)}
                      title="Expandir detalhes"
                      className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 transition-all"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>

                </div>

                {/* Expandable Cost Breakdown Section */}
                {isExpanded && (
                  <div className="mt-5 pt-5 border-t border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    
                    {/* Logística & Frete */}
                    <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800">
                      <div className="font-bold text-amber-400 flex items-center gap-1.5 mb-2">
                        <Truck className="w-3.5 h-3.5" /> Logística & Frete
                      </div>
                      <div className="space-y-1 text-slate-300 text-[11px]">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Frete / Combustível / Uber:</span>
                          <span>{formatBRL(item.fuelExpense)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Distância / Deslocamento:</span>
                          <span>{item.distanceKm} km</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Outras Despesas de Busca:</span>
                          <span>{formatBRL(item.additionalLogistics)}</span>
                        </div>
                        <div className="flex justify-between font-bold border-t border-slate-800 pt-1 text-amber-300">
                          <span>Total Logística:</span>
                          <span>{formatBRL(metrics.totalLogisticsCost)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Preparação & Custos */}
                    <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800">
                      <div className="font-bold text-sky-400 flex items-center gap-1.5 mb-2">
                        <Wrench className="w-3.5 h-3.5" /> Preparação & Manutenção
                      </div>
                      <div className="space-y-1 text-slate-300 text-[11px]">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Conserto / Peças / Pasta:</span>
                          <span>{formatBRL(item.mechanics)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Limpeza Técnica / Película:</span>
                          <span>{formatBRL(item.detailing)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Acessórios / Cabos / Pneus:</span>
                          <span>{formatBRL(item.tiresWheels)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Marketing OLX / Face Ads:</span>
                          <span>{formatBRL(item.marketing)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Reserva de Garantia ({item.hiddenDefectReservePercent}%):</span>
                          <span>{formatBRL(metrics.hiddenDefectsCost)}</span>
                        </div>
                        <div className="flex justify-between font-bold border-t border-slate-800 pt-1 text-sky-300">
                          <span>Total Preparação:</span>
                          <span>{formatBRL(metrics.totalPreparationCost)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Metas & Troca */}
                    <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800">
                      <div className="font-bold text-emerald-400 flex items-center gap-1.5 mb-2">
                        <DollarSign className="w-3.5 h-3.5" /> Metas de Giro & Troca
                      </div>
                      <div className="space-y-1 text-slate-300 text-[11px]">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Ponto de Equilíbrio (Zero a Zero):</span>
                          <span>{formatBRL(metrics.breakEvenPrice)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Meta com 15% de Margem:</span>
                          <span className="font-bold text-sky-300">{formatBRL(metrics.targetPrice15Percent)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Meta com 20% de Margem:</span>
                          <span className="font-bold text-emerald-300">{formatBRL(metrics.targetPrice20Percent)}</span>
                        </div>
                        {item.tradeIn?.hasTradeIn && (
                          <div className="mt-2.5 pt-2 border-t border-slate-800 space-y-1 text-[11px] bg-slate-900/60 p-2.5 rounded-xl border border-sky-500/20">
                            <div className="text-sky-300 font-bold flex items-center gap-1">
                              <span>🔄</span> Detalhes do Fechamento com Troca:
                            </div>
                            <div className="text-slate-300 flex justify-between">
                              <span className="text-slate-400">Item Recebido:</span>
                              <span className="font-bold text-white">{item.tradeIn.model}</span>
                            </div>
                            {item.tradeIn.cashReceived !== undefined && item.tradeIn.cashReceived > 0 && (
                              <div className="text-slate-300 flex justify-between">
                                <span className="text-slate-400">Volta em Dinheiro:</span>
                                <span className="font-bold text-emerald-400">{formatBRL(item.tradeIn.cashReceived)}</span>
                              </div>
                            )}
                            <div className="text-slate-300 flex justify-between">
                              <span className="text-slate-400">Custo de Entrada do Novo Item:</span>
                              <span className="font-extrabold text-amber-300">{formatBRL(item.tradeIn.effectiveEntryCost ?? item.tradeIn.attributedValue)}</span>
                            </div>
                            {item.tradeIn.expectedSalePrice !== undefined && item.tradeIn.expectedSalePrice > 0 && (
                              <div className="text-slate-300 flex justify-between">
                                <span className="text-slate-400">Previsão de Revenda:</span>
                                <span className="font-bold text-emerald-300">{formatBRL(item.tradeIn.expectedSalePrice)}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmDeleteModal
        isOpen={!!itemToDelete}
        item={itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleConfirmDelete}
      />

    </div>
  );
};
