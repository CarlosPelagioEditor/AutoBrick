import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  calculateVehicleMetrics,
  formatBRL,
  formatPercent,
  getInventoryDurationDetails,
} from '../utils/calculations';
import { BrickItem } from '../types';
import { CATEGORIES_LIST, getCategoryInfo } from '../utils/categories';
import {
  TrendingUp,
  DollarSign,
  Clock,
  AlertTriangle,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  MessageSquare,
  Repeat,
  FileSpreadsheet,
  Package,
  Layers,
  CreditCard,
  ShoppingBag,
  ShieldAlert,
  Target,
  FileText,
  Zap,
  Users,
  Database,
} from 'lucide-react';

interface DashboardProps {
  onSelectVehicle: (item: BrickItem) => void;
  onOpenNewVehicle: () => void;
  onOpenCopilot: (item: BrickItem) => void;
  onOpenChatSimulator: (item?: BrickItem) => void;
  onOpenTradeIn: () => void;
  onOpenTaxReport: () => void;
  onOpenCardCalculator?: () => void;
  onOpenSecurityChecklist?: () => void;
  onOpenCatalog?: () => void;
  onOpenGoals?: () => void;
  onOpenReceiptModal?: () => void;
  onOpenCopywriting?: (item?: BrickItem) => void;
  onOpenCrm?: () => void;
  onOpenBackup?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onSelectVehicle,
  onOpenNewVehicle,
  onOpenCopilot,
  onOpenChatSimulator,
  onOpenTradeIn,
  onOpenTaxReport,
  onOpenCardCalculator,
  onOpenSecurityChecklist,
  onOpenCatalog,
  onOpenGoals,
  onOpenReceiptModal,
  onOpenCopywriting,
  onOpenCrm,
  onOpenBackup,
}) => {
  const { currentUser, vehicles, clients } = useAuth();

  // Compute aggregated statistics strictly for the current user
  const itemStats = vehicles.map((v) => ({
    item: v,
    metrics: calculateVehicleMetrics(v),
  }));

  const inStockItems = itemStats.filter((i) => i.item.status === 'in_stock');
  const soldItems = itemStats.filter((i) => i.item.status === 'sold');
  const negotiatingItems = itemStats.filter((i) => i.item.status === 'negotiating');

  // Realized profit (from sold items)
  const totalRealizedProfit = soldItems.reduce((acc, i) => acc + i.metrics.netProfit, 0);

  // Total capital currently invested in active inventory
  const totalActiveCapitalInvested = inStockItems.reduce(
    (acc, i) => acc + i.metrics.totalVehicleCost,
    0
  );

  // Average margin of sold items (or all)
  const marginSamples = (soldItems.length > 0 ? soldItems : itemStats).filter(
    (i) => i.metrics.realMarginPercent > 0
  );
  const avgMarginPercent =
    marginSamples.length > 0
      ? marginSamples.reduce((acc, i) => acc + i.metrics.realMarginPercent, 0) /
        marginSamples.length
      : 15.0;

  // Average purchase discount vs Market/FIPE
  const avgMarketDiscount =
    itemStats.length > 0
      ? itemStats.reduce((acc, i) => acc + i.metrics.fipeDiscountPercent, 0) /
        itemStats.length
      : -18;

  // Items with >30 days alert
  const overStockAlerts = itemStats.filter((i) => i.metrics.isOverStockAlert);

  // Category distribution
  const categoryCounts = CATEGORIES_LIST.map((cat) => {
    const itemsInCat = vehicles.filter((v) => (v.category || 'other') === cat.id);
    const inStockInCat = itemsInCat.filter((v) => v.status === 'in_stock');
    const investedInCat = inStockInCat.reduce((acc, v) => acc + calculateVehicleMetrics(v).totalVehicleCost, 0);
    return {
      category: cat,
      totalCount: itemsInCat.length,
      inStockCount: inStockInCat.length,
      invested: investedInCat,
    };
  }).filter((c) => c.totalCount > 0);

  return (
    <div className="space-y-6">
      
      {/* Header Banner with Welcome & Tenant Info */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/70 p-6 md:p-8 text-white shadow-xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Gestão Universal de Brik &bull; Games, TVs, Celulares, Carros & Eletros
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Painel Financeiro & Central do Brik
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Olá, <span className="font-bold text-white">{currentUser?.name || 'Revendedor'}</span>.
              Monitore rentabilidade real, deságio de compra, taxas de maquininha, catálogo do WhatsApp e trocas automatizadas por IA.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenNewVehicle}
              className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Package className="w-4 h-4 stroke-[3]" />
              Novo Item no Brik
            </button>
            {onOpenReceiptModal && (
              <button
                onClick={onOpenReceiptModal}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 transition-all flex items-center gap-2 cursor-pointer"
              >
                <FileText className="w-4 h-4 text-amber-400" />
                Gerar Recibo / Garantia
              </button>
            )}
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Capital Ativo Investido */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
            <span>Capital Ativo no Brik</span>
            <DollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {formatBRL(totalActiveCapitalInvested)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5">
            <span className="text-amber-400 font-bold">{inStockItems.length} itens</span> em estoque disponível
          </div>
        </div>

        {/* Card 2: Lucro Realizado */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
            <span>Lucro Líquido Realizado</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">
            {formatBRL(totalRealizedProfit)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5">
            <span className="text-emerald-400 font-bold">{soldItems.length} vendas</span> finalizadas
          </div>
        </div>

        {/* Card 3: Margem Média Real */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
            <span>Margem Média Líquida</span>
            <Sparkles className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-black text-sky-400">
            {formatPercent(avgMarginPercent)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5">
            Meta operacional: <span className="text-white font-bold">&ge; 15,0%</span>
          </div>
        </div>

        {/* Card 4: Deságio Médio na Compra */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
            <span>Deságio Médio na Entrada</span>
            <ArrowUpRight className="w-4 h-4 text-yellow-400" />
          </div>
          <div className="text-2xl font-black text-yellow-400">
            {avgMarketDiscount < 0
              ? `${Math.abs(avgMarketDiscount).toFixed(1)}% abaixo`
              : `+${avgMarketDiscount.toFixed(1)}%`}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Média de compra vs Preço de Mercado / FIPE
          </div>
        </div>

      </div>

      {/* Category Breakdown Section */}
      <div className="bg-slate-900/80 border border-slate-800 p-5 md:p-6 rounded-3xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-black text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-400" /> Distribuição do Brik por Categoria
          </h2>
          <span className="text-xs text-slate-400 font-medium">
            Total de {vehicles.length} produtos cadastrados
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {categoryCounts.map((catStat) => (
            <div
              key={catStat.category.id}
              className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800/80 space-y-1"
            >
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <span className="text-base">{catStat.category.emoji}</span>
                <span className="truncate">{catStat.category.name.split('(')[0]}</span>
              </div>
              <div className="text-lg font-black text-amber-400">
                {formatBRL(catStat.invested)}
              </div>
              <div className="text-[10px] text-slate-400">
                {catStat.inStockCount} em estoque ({catStat.totalCount} no total)
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Overstock Alert Banner (if any item > 30 days) */}
      {overStockAlerts.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-3xl p-5 md:p-6 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-amber-300">
                Alerta de Giro: {overStockAlerts.length} {overStockAlerts.length === 1 ? 'item parado' : 'itens parados'} há mais de 30 dias!
              </h2>
              <p className="text-xs text-slate-300 max-w-2xl mt-0.5">
                Itens com giro travado geram custo de oportunidade e desvalorização.
                Use o Copiloto IA para recalibrar o anúncio ou faça uma contraproposta mais agressiva.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onSelectVehicle(overStockAlerts[0].item)}
              className="px-4 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow hover:brightness-110 transition-all cursor-pointer"
            >
              Ver {overStockAlerts[0].item.model}
            </button>
          </div>
        </div>
      )}

      {/* Operational Modules & Toolbox Grid */}
      <div className="space-y-3">
        <h2 className="text-base font-black text-white flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" /> Central de Ferramentas Estratégicas
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          
          {/* Card Fee Calculator */}
          {onOpenCardCalculator && (
            <div
              onClick={onOpenCardCalculator}
              className="bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 p-5 rounded-3xl transition-all cursor-pointer group space-y-3 shadow-md"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Simulador de Taxas</div>
                <h3 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">
                  Maquininha de Cartão até 18x
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Repasse automático de taxas (InfinitePay, Ton, Mercado Pago) e geração de tabela para WhatsApp em 1 clique.
                </p>
              </div>
              <div className="pt-1 text-xs font-bold text-amber-400 flex items-center gap-1">
                Calcular taxas <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
            </div>
          )}

          {/* Trade In & Genealogy */}
          <div
            onClick={onOpenTradeIn}
            className="bg-slate-900/90 border border-slate-800 hover:border-sky-500/50 p-5 rounded-3xl transition-all cursor-pointer group space-y-3 shadow-md"
          >
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <Repeat className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-sky-400 uppercase tracking-wider">Trocas com IA</div>
              <h3 className="text-sm font-bold text-white group-hover:text-sky-400 transition-colors">
                Avaliador de Rolo & Genealogia
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Desconto automático de volta em dinheiro, médias da internet e árvore de multiplicação de capital.
              </p>
            </div>
            <div className="pt-1 text-xs font-bold text-sky-400 flex items-center gap-1">
              Avaliar proposta <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Public Catalog */}
          {onOpenCatalog && (
            <div
              onClick={onOpenCatalog}
              className="bg-slate-900/90 border border-slate-800 hover:border-emerald-500/50 p-5 rounded-3xl transition-all cursor-pointer group space-y-3 shadow-md"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Vendas no WhatsApp</div>
                <h3 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                  Vitrine Digital & Catálogo
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Catálogo limpo para clientes sem expor custos, com cópia formatada para WhatsApp e links diretos.
                </p>
              </div>
              <div className="pt-1 text-xs font-bold text-emerald-400 flex items-center gap-1">
                Abrir vitrine <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
            </div>
          )}

          {/* Anti-Scam Checklist */}
          {onOpenSecurityChecklist && (
            <div
              onClick={onOpenSecurityChecklist}
              className="bg-slate-900/90 border border-slate-800 hover:border-rose-500/50 p-5 rounded-3xl transition-all cursor-pointer group space-y-3 shadow-md"
            >
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">Segurança Presencial</div>
                <h3 className="text-sm font-bold text-white group-hover:text-rose-400 transition-colors">
                  Checklist Anti-Golpe & Testes
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Guia passo a passo de testes para iPhones, Consoles, TVs e Dossiê dos 5 maiores golpes do Brasil.
                </p>
              </div>
              <div className="pt-1 text-xs font-bold text-rose-400 flex items-center gap-1">
                Ver checklist <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
            </div>
          )}

          {/* Goals & Working Capital */}
          {onOpenGoals && (
            <div
              onClick={onOpenGoals}
              className="bg-slate-900/90 border border-slate-800 hover:border-teal-500/50 p-5 rounded-3xl transition-all cursor-pointer group space-y-3 shadow-md"
            >
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] font-bold text-teal-400 uppercase tracking-wider">Gestão Financeira</div>
                <h3 className="text-sm font-bold text-white group-hover:text-teal-400 transition-colors">
                  Metas, Giro & Salário no Bolso
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Divisão de Capital de Giro vs. Lucro Livre pessoal e termômetro de produtos parados no estoque.
                </p>
              </div>
              <div className="pt-1 text-xs font-bold text-teal-400 flex items-center gap-1">
                Ver metas <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
            </div>
          )}

          {/* Copywriting AI Ad Generator */}
          {onOpenCopywriting && (
            <div
              onClick={() => onOpenCopywriting()}
              className="bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 p-5 rounded-3xl transition-all cursor-pointer group space-y-3 shadow-md"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Marketing Turbo com IA</div>
                <h3 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">
                  Gerador de Anúncios OLX & FB
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Crie títulos magnéticos, proteções anti-golpe e descrições persuasivas com 1 clique para colar no Marketplace.
                </p>
              </div>
              <div className="pt-1 text-xs font-bold text-amber-400 flex items-center gap-1">
                Gerar anúncio <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
            </div>
          )}

          {/* Mini-CRM & Encomendas */}
          {onOpenCrm && (
            <div
              onClick={onOpenCrm}
              className="bg-slate-900/90 border border-slate-800 hover:border-sky-500/50 p-5 rounded-3xl transition-all cursor-pointer group space-y-3 shadow-md"
            >
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] font-bold text-sky-400 uppercase tracking-wider">Radar de Clientes</div>
                <h3 className="text-sm font-bold text-white group-hover:text-sky-400 transition-colors">
                  Mini-CRM & Match de Encomendas
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Cadastre compradores, acompanhe desejos de compra e receba alertas automáticos de match com o estoque.
                </p>
              </div>
              <div className="pt-1 text-xs font-bold text-sky-400 flex items-center gap-1">
                Ver clientes <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
            </div>
          )}

          {/* Data Backup & Export */}
          {onOpenBackup && (
            <div
              onClick={onOpenBackup}
              className="bg-slate-900/90 border border-slate-800 hover:border-emerald-500/50 p-5 rounded-3xl transition-all cursor-pointer group space-y-3 shadow-md"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Segurança & Excel</div>
                <h3 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                  Backup & Planilhas Excel (CSV)
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Exporte planilhas completas de estoque, lucros realizados e faça backup seguro em JSON.
                </p>
              </div>
              <div className="pt-1 text-xs font-bold text-emerald-400 flex items-center gap-1">
                Acessar backup <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
            </div>
          )}

          {/* Tax Report */}
          <div
            onClick={onOpenTaxReport}
            className="bg-slate-900/90 border border-slate-800 hover:border-purple-500/50 p-5 rounded-3xl transition-all cursor-pointer group space-y-3 shadow-md"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">Fiscal & Legal</div>
              <h3 className="text-sm font-bold text-white group-hover:text-purple-400 transition-colors">
                IRPF & Isenção R$ 35k/mês
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Memória de cálculo fiscal com controle de limite mensal de isenção e apuração de GCAP.
              </p>
            </div>
            <div className="pt-1 text-xs font-bold text-purple-400 flex items-center gap-1">
              Ver IRPF <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </div>

        </div>
      </div>

      {/* Recent Inventory Items Table/Cards Preview */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 md:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-black text-white flex items-center gap-2">
            <Package className="w-4 h-4 text-amber-400" /> Itens Recentes no Brik
          </h2>
          <button
            onClick={onOpenNewVehicle}
            className="text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
          >
            + Cadastrar Produto
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vehicles.slice(0, 6).map((item) => {
            const metrics = calculateVehicleMetrics(item);
            const catMeta = getCategoryInfo(item.category);
            const isSold = item.status === 'sold';
            const duration = getInventoryDurationDetails(item.purchaseDate, item.saleDate, isSold);

            return (
              <div
                key={item.id}
                onClick={() => onSelectVehicle(item)}
                className="bg-slate-950/70 hover:bg-slate-950 border border-slate-800 hover:border-slate-700 p-4 rounded-2xl transition-all cursor-pointer space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-md bg-slate-800 text-[10px] font-bold text-amber-400 flex items-center gap-1">
                    <span>{catMeta.emoji}</span>
                    <span>{catMeta.name.split('(')[0]}</span>
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isSold
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : item.status === 'negotiating'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        : 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                    }`}
                  >
                    {isSold ? 'Vendido' : item.status === 'negotiating' ? 'Em Negociação' : 'Em Estoque'}
                  </span>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-white line-clamp-1">{item.model}</h3>
                  <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                    {item.brand && <span>{item.brand}</span>}
                    {item.storageOrSpecs && <span>• {item.storageOrSpecs}</span>}
                    {item.plate && <span className="font-mono">• {item.plate}</span>}
                  </div>
                </div>

                {/* Duration indicator */}
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800/80 flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>
                      {isSold
                        ? `Vendido em ${duration.days}d (${duration.startDateFormatted} ➔ ${duration.endDateFormatted})`
                        : `Em estoque há ${duration.days}d (desde ${duration.startDateFormatted})`}
                    </span>
                  </div>
                  <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${duration.speedBadge.colorClasses}`}>
                    {duration.speedBadge.emoji}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <div>
                    <div className="text-[10px] text-slate-500 font-semibold">Custo Entrada</div>
                    <div className="font-extrabold text-amber-400">{formatBRL(metrics.totalVehicleCost)}</div>
                  </div>

                  <div className="text-right">
                    <div className="text-[10px] text-slate-500 font-semibold">Preço Venda</div>
                    <div className="font-extrabold text-white">
                      {formatBRL(item.salePrice || metrics.targetPrice15Percent)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 text-[11px]">
                  <span className="text-slate-400">
                    {isSold ? 'Lucro Realizado' : 'Lucro Previsto'}:
                  </span>
                  <span className={`font-bold ${metrics.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {formatBRL(metrics.netProfit)} ({formatPercent(metrics.realMarginPercent)})
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
