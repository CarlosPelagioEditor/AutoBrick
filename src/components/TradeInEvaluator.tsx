import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { BrickItem } from '../types';
import { calculateVehicleMetrics, formatBRL, formatPercent } from '../utils/calculations';
import { getCategoryInfo } from '../utils/categories';
import { TradeJourneyTree } from './TradeJourneyTree';
import {
  Repeat,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Package,
  Layers,
  ArrowRight,
  Sparkles,
  Loader2,
  Globe,
  HelpCircle,
  Plus,
  Trash2,
  GitFork,
  Calculator,
} from 'lucide-react';

interface MultiTradeItem {
  id: string;
  name: string;
  marketPrice: number;
  expectedResale: number;
  prepCost: number;
}

export const TradeInEvaluator: React.FC = () => {
  const { vehicles } = useAuth();

  const [activeSubTab, setActiveSubTab] = useState<'single_trade' | 'multi_trade' | 'genealogy'>('single_trade');

  const [useCustomItem, setUseCustomItem] = useState<boolean>(vehicles.length === 0);
  const [customItemName, setCustomItemName] = useState<string>('Item Original (Ex: Fone Bluetooth)');
  const [customItemCost, setCustomItemCost] = useState<number>(300);

  const [selectedMainItemId, setSelectedMainItemId] = useState<string>(
    vehicles.length > 0 ? vehicles[0].id : ''
  );

  const mainItem = vehicles.find((v) => v.id === selectedMainItemId) || vehicles[0];
  const mainMetrics = mainItem ? calculateVehicleMetrics(mainItem) : null;

  // Active original item values
  const effectiveOriginalCost = useCustomItem
    ? Number(customItemCost) || 0
    : mainMetrics?.totalVehicleCost || 0;
  const effectiveOriginalName = useCustomItem
    ? customItemName
    : mainItem?.model || 'Item do Estoque';

  // Single Trade-In simulation fields
  const [tradeModel, setTradeModel] = useState<string>('JBL Flip 6');
  const [cashDifferenceReceived, setCashDifferenceReceived] = useState<number>(100);
  const [tradeMarketValue, setTradeMarketValue] = useState<number>(450);
  const [tradePrepCost, setTradePrepCost] = useState<number>(0);
  const [expectedResalePrice, setExpectedResalePrice] = useState<number>(428);

  // Multi-Item Trade-in fields
  const [multiCashReceived, setMultiCashReceived] = useState<number>(200);
  const [multiTradeItems, setMultiTradeItems] = useState<MultiTradeItem[]>([
    {
      id: 'm1',
      name: 'PlayStation 4 Slim 500GB',
      marketPrice: 1200,
      expectedResale: 1150,
      prepCost: 50,
    },
    {
      id: 'm2',
      name: 'Fone JBL Tune 510BT',
      marketPrice: 180,
      expectedResale: 160,
      prepCost: 0,
    },
  ]);

  // AI Valuation State
  const [isLoadingAi, setIsLoadingAi] = useState<boolean>(false);
  const [aiData, setAiData] = useState<any>(null);

  // Single Item Calculations
  const effectiveEntryCost = Math.max(0, effectiveOriginalCost - cashDifferenceReceived);
  const totalInvestedInTrade = effectiveEntryCost + tradePrepCost;
  const resaleProfit = (expectedResalePrice || tradeMarketValue) - totalInvestedInTrade;

  const totalCombinedRevenue = cashDifferenceReceived + (expectedResalePrice || tradeMarketValue);
  const totalCombinedInvestment = effectiveOriginalCost + tradePrepCost;
  const combinedProfit = totalCombinedRevenue - totalCombinedInvestment;
  const combinedMarginPercent =
    totalCombinedRevenue > 0 ? (combinedProfit / totalCombinedRevenue) * 100 : 0;

  // Multi-Item Calculations
  const totalMultiMarketPrice = multiTradeItems.reduce((acc, i) => acc + i.marketPrice, 0) || 1;
  const totalMultiPrepCost = multiTradeItems.reduce((acc, i) => acc + i.prepCost, 0);
  const totalMultiResale = multiTradeItems.reduce((acc, i) => acc + (i.expectedResale || i.marketPrice), 0);
  const multiRemainingCostToDistribute = Math.max(0, effectiveOriginalCost - multiCashReceived);

  const multiItemsAnalysis = multiTradeItems.map((item) => {
    // Distribute remaining cost proportionally by market weight
    const weight = item.marketPrice / totalMultiMarketPrice;
    const allocatedEntryCost = multiRemainingCostToDistribute * weight;
    const totalInvested = allocatedEntryCost + item.prepCost;
    const itemProfit = (item.expectedResale || item.marketPrice) - totalInvested;
    const itemMargin = (item.expectedResale || item.marketPrice) > 0 ? (itemProfit / (item.expectedResale || item.marketPrice)) * 100 : 0;
    return {
      ...item,
      allocatedEntryCost,
      totalInvested,
      itemProfit,
      itemMargin,
    };
  });

  const totalMultiRevenue = multiCashReceived + totalMultiResale;
  const totalMultiInvestment = effectiveOriginalCost + totalMultiPrepCost;
  const multiCombinedProfit = totalMultiRevenue - totalMultiInvestment;
  const multiCombinedMargin = totalMultiRevenue > 0 ? (multiCombinedProfit / totalMultiRevenue) * 100 : 0;

  const handleQueryAiValuation = async () => {
    if (!tradeModel.trim()) {
      alert('Por favor, informe o produto recebido na troca.');
      return;
    }

    setIsLoadingAi(true);
    try {
      const res = await fetch('/api/ai/trade-valuation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tradeModel: tradeModel.trim(),
          originalItemCost: effectiveOriginalCost,
          originalItemModel: effectiveOriginalName,
          cashReceived: cashDifferenceReceived,
          tradePrepCost: tradePrepCost,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setAiData(data);
        if (data.marketAveragePrice) {
          setTradeMarketValue(data.marketAveragePrice);
        }
        if (data.suggestedResalePrice) {
          setExpectedResalePrice(data.suggestedResalePrice);
        }
      }
    } catch (err) {
      console.error('Erro ao consultar IA:', err);
    } finally {
      setIsLoadingAi(false);
    }
  };

  const handleAddMultiItem = () => {
    const newItem: MultiTradeItem = {
      id: `m_${Date.now()}`,
      name: 'Novo Item na Volta',
      marketPrice: 300,
      expectedResale: 280,
      prepCost: 0,
    };
    setMultiTradeItems([...multiTradeItems, newItem]);
  };

  const handleRemoveMultiItem = (id: string) => {
    if (multiTradeItems.length <= 1) {
      alert('É necessário ter ao menos 1 item na troca.');
      return;
    }
    setMultiTradeItems(multiTradeItems.filter((i) => i.id !== id));
  };

  const handleUpdateMultiItem = (id: string, field: keyof MultiTradeItem, value: any) => {
    setMultiTradeItems(
      multiTradeItems.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/80 rounded-3xl p-6 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs font-semibold mb-2">
              <Repeat className="w-3.5 h-3.5" />
              Calculadora de Trocas, Rolo & Genealogia
            </div>
            <h1 className="text-2xl font-black text-white">
              Avaliador Inteligente de Trocas & Rolo
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl mt-1">
              Desconte automaticamente a volta em dinheiro do seu custo original, consulte preços na internet com IA, simule múltiplos itens na troca ou acompanhe a evolução do capital em cadeia.
            </p>
          </div>

          {/* Sub-tab switcher */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 shrink-0">
            <button
              type="button"
              onClick={() => setActiveSubTab('single_trade')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeSubTab === 'single_trade'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Calculator className="w-3.5 h-3.5" /> 1 Item + Volta
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('multi_trade')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeSubTab === 'multi_trade'
                  ? 'bg-sky-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" /> 2+ Itens na Volta
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('genealogy')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeSubTab === 'genealogy'
                  ? 'bg-indigo-500 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <GitFork className="w-3.5 h-3.5" /> Genealogia do Rolo
            </button>
          </div>
        </div>
      </div>

      {/* Sub-tab 1: Single Trade In */}
      {activeSubTab === 'single_trade' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Columns: Input parameters */}
          <div className="lg:col-span-2 space-y-6">
            {/* Leg 1: Item Original */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 md:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-black text-amber-400 flex items-center gap-2">
                  <Package className="w-4 h-4" /> 1. Seu Produto Original
                </h2>
                {vehicles.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setUseCustomItem(!useCustomItem)}
                    className="text-xs text-sky-400 hover:text-sky-300 font-bold cursor-pointer"
                  >
                    {useCustomItem ? '← Selecionar do Estoque' : '+ Digitar Valor Manual'}
                  </button>
                )}
              </div>

              {!useCustomItem && vehicles.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Selecione o Item do seu Estoque:
                    </label>
                    <select
                      value={selectedMainItemId}
                      onChange={(e) => setSelectedMainItemId(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                    >
                      {vehicles.map((v) => {
                        const cat = getCategoryInfo(v.category);
                        return (
                          <option key={v.id} value={v.id}>
                            {cat.emoji} {v.model} (Custo: {formatBRL(calculateVehicleMetrics(v).totalVehicleCost)})
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  {mainItem && mainMetrics && (
                    <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Investimento Real no Item:</span>
                        <span className="font-bold text-amber-400">{formatBRL(mainMetrics.totalVehicleCost)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Preço Desejado:</span>
                        <span className="font-bold text-white">
                          {formatBRL(mainItem.salePrice || mainMetrics.targetPrice15Percent)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Nome do Produto Original:
                    </label>
                    <input
                      type="text"
                      value={customItemName}
                      onChange={(e) => setCustomItemName(e.target.value)}
                      placeholder="Ex: Fone Sony, Celular Xiaomi..."
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-amber-400 mb-1">
                      Valor que você comprou o produto original (R$):
                    </label>
                    <input
                      type="number"
                      value={customItemCost || ''}
                      onChange={(e) => setCustomItemCost(Number(e.target.value))}
                      placeholder="Ex: 300"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-amber-500/50 rounded-xl text-xs font-black text-amber-400 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Leg 2: Item Recebido na Troca com IA */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 md:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-black text-sky-400 flex items-center gap-2">
                  <Repeat className="w-4 h-4" /> 2. O que você pegou no rolo?
                </h2>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-400 font-bold border border-sky-500/20 flex items-center gap-1">
                  <Globe className="w-3 h-3" /> Média da Internet
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Dinheiro Recebido */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-black text-emerald-400 mb-1">
                    Quanto você pegou em dinheiro / PIX? (Volta em R$)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-400 font-black text-sm">R$</span>
                    <input
                      type="number"
                      value={cashDifferenceReceived || ''}
                      onChange={(e) => setCashDifferenceReceived(Number(e.target.value))}
                      placeholder="Ex: 100"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-emerald-500/50 rounded-xl text-sm font-black text-emerald-400 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Descontando R$ {cashDifferenceReceived || 0} do custo original de R$ {effectiveOriginalCost}, o novo item entra para você por apenas <strong>R$ {effectiveEntryCost}</strong>!
                  </p>
                </div>

                {/* Nome do Produto Recebido + Botão IA */}
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="block text-xs font-black text-sky-300">
                    Qual produto você pegou em formato de troca? (Nome / Modelo) *
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={tradeModel}
                      onChange={(e) => setTradeModel(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleQueryAiValuation();
                        }
                      }}
                      placeholder="Ex: JBL Flip 6, Xbox One S 500GB, iPhone 11, TV 43..."
                      className="flex-1 px-3.5 py-2.5 bg-slate-950 border-2 border-sky-500/50 rounded-xl text-sm font-bold text-white placeholder-slate-500 focus:outline-none focus:border-sky-400"
                    />
                    <button
                      type="button"
                      onClick={handleQueryAiValuation}
                      disabled={isLoadingAi || !tradeModel.trim()}
                      className="px-4 py-2.5 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all shrink-0 active:scale-95 cursor-pointer"
                    >
                      {isLoadingAi ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Puxando médias...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                          <span>Calcular com IA</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Preço Médio de Mercado */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Média de Mercado na Internet (R$)
                  </label>
                  <input
                    type="number"
                    value={tradeMarketValue || ''}
                    onChange={(e) => setTradeMarketValue(Number(e.target.value))}
                    placeholder="Ex: 450"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                {/* Preço Esperado para Revenda */}
                <div>
                  <label className="block text-xs font-bold text-amber-400 mb-1">
                    Preço Sugerido para Revenda (R$)
                  </label>
                  <input
                    type="number"
                    value={expectedResalePrice || ''}
                    onChange={(e) => setExpectedResalePrice(Number(e.target.value))}
                    placeholder="Ex: 428"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-amber-500/50 rounded-xl text-xs font-black text-amber-400 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Combined Profitability Card & AI Verdict */}
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-xl">
              <h2 className="text-sm font-black text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" /> Resultado Calculado da Troca
              </h2>

              {/* Total Profit Badge */}
              <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-center space-y-1">
                <div className="text-[10px] uppercase font-bold text-slate-400">Lucro Líquido Total da Operação</div>
                <div
                  className={`text-2xl font-black ${
                    combinedProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  +{formatBRL(combinedProfit)}
                </div>
                <div className="text-xs font-bold text-slate-300">
                  Margem no Investimento: {formatPercent(combinedMarginPercent)}
                </div>
              </div>

              {/* Breakdown List */}
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Custo do Item Original:</span>
                  <span className="font-bold text-slate-200">{formatBRL(effectiveOriginalCost)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Dinheiro Recebido no Ato:</span>
                  <span className="font-bold text-emerald-400">+{formatBRL(cashDifferenceReceived)}</span>
                </div>
                <div className="flex justify-between border-t border-slate-800 pt-1.5">
                  <span className="text-slate-300 font-semibold">Custo Real de Entrada do Novo Item:</span>
                  <span className="font-black text-amber-400">{formatBRL(effectiveEntryCost)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Revenda Prevista do Novo Item:</span>
                  <span className="font-bold text-sky-400">+{formatBRL(expectedResalePrice || tradeMarketValue)}</span>
                </div>
                <div className="flex justify-between border-t border-slate-800 pt-2 font-bold">
                  <span className="text-slate-300">Faturamento Bruto Total:</span>
                  <span className="text-white">{formatBRL(totalCombinedRevenue)}</span>
                </div>
              </div>

              {/* AI Verdict Box if available */}
              {aiData && aiData.aiAnalysisVerdict ? (
                <div className="bg-sky-950/40 p-4 rounded-2xl border border-sky-500/30 space-y-2 text-xs text-sky-200">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-sky-400" /> Diagnóstico Inteligente:
                  </div>
                  <p className="leading-relaxed text-sky-200/90">{aiData.aiAnalysisVerdict}</p>
                  {aiData.tacticalTip && (
                    <p className="text-[11px] text-amber-300 pt-2 border-t border-sky-500/20 font-medium">
                      💡 Dica de Negociação: {aiData.tacticalTip}
                    </p>
                  )}
                </div>
              ) : (
                <div className="bg-slate-950/90 p-4 rounded-2xl border border-slate-800 space-y-1.5">
                  <div className="text-[11px] font-bold text-sky-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Como a IA Calcula:
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Custo de Entrada = Custo Original ({formatBRL(effectiveOriginalCost)}) - Dinheiro ({formatBRL(cashDifferenceReceived)}) = <span className="text-white font-bold">{formatBRL(effectiveEntryCost)}</span>.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Sub-tab 2: Multi-Trade In (2+ itens recebidos) */}
      {activeSubTab === 'multi_trade' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Multiple items input */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Original Item & PIX */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
              <h2 className="text-sm font-black text-amber-400 flex items-center gap-2">
                <Package className="w-4 h-4" /> 1. Seu Produto & Dinheiro na Volta
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Custo do seu Item Original (R$):</label>
                  <input
                    type="number"
                    value={effectiveOriginalCost || ''}
                    onChange={(e) => setCustomItemCost(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-amber-500/50 rounded-xl text-sm font-black text-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-emerald-400 mb-1">Volta em Dinheiro / PIX (R$):</label>
                  <input
                    type="number"
                    value={multiCashReceived || ''}
                    onChange={(e) => setMultiCashReceived(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-emerald-500/50 rounded-xl text-sm font-black text-emerald-400"
                  />
                </div>
              </div>
              <p className="text-xs text-slate-400">
                Saldo de custo a distribuir entre os novos itens: <strong className="text-white">{formatBRL(multiRemainingCostToDistribute)}</strong>
              </p>
            </div>

            {/* List of Received Items */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-black text-sky-400 flex items-center gap-2">
                  <Layers className="w-4 h-4" /> 2. Produtos Recebidos na Troca ({multiTradeItems.length})
                </h2>
                <button
                  type="button"
                  onClick={handleAddMultiItem}
                  className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer transition-all"
                >
                  <Plus className="w-3.5 h-3.5" /> + Adicionar Outro Item
                </button>
              </div>

              <div className="space-y-4">
                {multiItemsAnalysis.map((item, idx) => (
                  <div key={item.id} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-white flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-300 text-[10px] flex items-center justify-center font-bold">
                          {idx + 1}
                        </span>
                        <span>Item {idx + 1}</span>
                      </span>
                      {multiTradeItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveMultiItem(item.id)}
                          className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div className="sm:col-span-3">
                        <label className="block text-slate-400 mb-1">Nome / Modelo do Item:</label>
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => handleUpdateMultiItem(item.id, 'name', e.target.value)}
                          className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">Preço Médio de Mercado (R$):</label>
                        <input
                          type="number"
                          value={item.marketPrice || ''}
                          onChange={(e) => handleUpdateMultiItem(item.id, 'marketPrice', Number(e.target.value))}
                          className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-amber-400 mb-1">Preço Previsto de Revenda (R$):</label>
                        <input
                          type="number"
                          value={item.expectedResale || ''}
                          onChange={(e) => handleUpdateMultiItem(item.id, 'expectedResale', Number(e.target.value))}
                          className="w-full px-3 py-1.5 bg-slate-900 border border-amber-500/40 rounded-lg text-amber-400 font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">Revisão / Limpeza (R$):</label>
                        <input
                          type="number"
                          value={item.prepCost || ''}
                          onChange={(e) => handleUpdateMultiItem(item.id, 'prepCost', Number(e.target.value))}
                          className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white"
                        />
                      </div>
                    </div>

                    <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-400">
                        Custo de Entrada Alocado: <span className="text-amber-400">{formatBRL(item.allocatedEntryCost)}</span>
                      </span>
                      <span className="text-emerald-400">
                        Lucro Previsto: +{formatBRL(item.itemProfit)} ({item.itemMargin.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Multi Combined Summary */}
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-xl">
              <h2 className="text-sm font-black text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" /> Resultado com Múltiplos Itens
              </h2>

              <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-center space-y-1">
                <div className="text-[10px] uppercase font-bold text-slate-400">Lucro Combinado da Operação</div>
                <div className="text-2xl font-black text-emerald-400">+{formatBRL(multiCombinedProfit)}</div>
                <div className="text-xs font-bold text-slate-300">
                  Margem Geral: {formatPercent(multiCombinedMargin)}
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Investimento Original:</span>
                  <span className="font-bold text-slate-200">{formatBRL(effectiveOriginalCost)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Volta em PIX no Ato:</span>
                  <span className="font-bold text-emerald-400">+{formatBRL(multiCashReceived)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Revenda dos {multiTradeItems.length} Itens:</span>
                  <span className="font-bold text-sky-400">+{formatBRL(totalMultiResale)}</span>
                </div>
                <div className="flex justify-between border-t border-slate-800 pt-2 font-bold">
                  <span className="text-slate-300">Faturamento Total Previsto:</span>
                  <span className="text-white">{formatBRL(totalMultiRevenue)}</span>
                </div>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 text-xs text-slate-300 leading-relaxed">
                💡 O sistema distribui o custo remanescente proporcionalmente ao valor de mercado de cada item recebido para que você nunca venda nenhum produto com prejuízo.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sub-tab 3: Genealogy Tree */}
      {activeSubTab === 'genealogy' && <TradeJourneyTree />}

    </div>
  );
};
