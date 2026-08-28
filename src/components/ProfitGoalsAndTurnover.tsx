import React, { useState } from 'react';
import {
  Target,
  TrendingUp,
  Clock,
  AlertTriangle,
  Flame,
  CheckCircle2,
  DollarSign,
  Wallet,
  ArrowUpRight,
  Sparkles,
  Zap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatBRL, formatPercent, calculateVehicleMetrics } from '../utils/calculations';
import { getCategoryInfo } from '../utils/categories';

export const ProfitGoalsAndTurnover: React.FC = () => {
  const { vehicles } = useAuth();

  const [monthlyProfitGoal, setMonthlyProfitGoal] = useState<number>(5000);
  const [workingCapitalReservePercent, setWorkingCapitalReservePercent] = useState<number>(60); // 60% reinvestimento, 40% lucro livre

  // Calculate sold items metrics
  const soldItems = vehicles.filter((v) => v.status === 'sold');
  const inStockItems = vehicles.filter((v) => v.status === 'in_stock');

  // Profit achieved this month (or total sold)
  const totalRealizedProfit = soldItems.reduce((acc, item) => {
    const metrics = calculateVehicleMetrics(item);
    return acc + metrics.netProfit;
  }, 0);

  const goalProgressPercent = Math.min(
    100,
    Math.round((totalRealizedProfit / (monthlyProfitGoal || 1)) * 100)
  );

  // Capital separation:
  // Reinvestment Capital (to buy more goods) vs Free Pocket Profit (for personal expenses)
  const reinvestmentCapital = (totalRealizedProfit * workingCapitalReservePercent) / 100;
  const freePocketCash = totalRealizedProfit - reinvestmentCapital;

  // Turnover / Inventory Age Breakdown
  const now = new Date();
  const agingItems = inStockItems.map((item) => {
    const pDate = item.purchaseDate ? new Date(item.purchaseDate) : now;
    const diffTime = Math.abs(now.getTime() - pDate.getTime());
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const metrics = calculateVehicleMetrics(item);
    return {
      item,
      days,
      metrics,
      status: days > 25 ? 'critical' : days > 15 ? 'warning' : 'healthy',
    };
  });

  const healthyItems = agingItems.filter((i) => i.status === 'healthy');
  const warningItems = agingItems.filter((i) => i.status === 'warning');
  const criticalItems = agingItems.filter((i) => i.status === 'critical');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950/40 to-slate-900 border border-emerald-500/30 rounded-3xl p-6 text-white shadow-xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-2">
          <Target className="w-3.5 h-3.5" />
          Metas de Faturamento & Termômetro de Giro
        </div>
        <h1 className="text-2xl font-black text-white">
          Metas de Lucro, Salário no Bolso & Alerta de Estoque Parado
        </h1>
        <p className="text-xs text-slate-300 max-w-2xl mt-1">
          Separe com precisão o Capital de Reinvestimento do seu Lucro Livre para gastos pessoais, e nunca deixe produtos parados no estoque gerando custo de oportunidade.
        </p>
      </div>

      {/* Goal & Pocket Cash Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Goal Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-amber-400 flex items-center gap-1.5 uppercase">
              <Target className="w-4 h-4" /> Meta Mensal de Lucro
            </span>
            <span className="text-xs font-black text-white">{goalProgressPercent}% Atingido</span>
          </div>

          <div className="space-y-1">
            <div className="text-3xl font-black text-white">{formatBRL(totalRealizedProfit)}</div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>de</span>
              <input
                type="number"
                value={monthlyProfitGoal}
                onChange={(e) => setMonthlyProfitGoal(Number(e.target.value))}
                className="w-28 px-2 py-0.5 bg-slate-950 border border-slate-700 rounded-lg text-amber-400 font-bold text-xs"
              />
              <span>estipulado</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden p-0.5 border border-slate-800">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                goalProgressPercent >= 100
                  ? 'bg-emerald-400 shadow-lg shadow-emerald-500/50'
                  : 'bg-gradient-to-r from-amber-500 to-emerald-400'
              }`}
              style={{ width: `${Math.min(100, goalProgressPercent)}%` }}
            />
          </div>

          <p className="text-[11px] text-slate-400">
            Faltam <strong>{formatBRL(Math.max(0, monthlyProfitGoal - totalRealizedProfit))}</strong> para bater a meta deste ciclo.
          </p>
        </div>

        {/* Capital Division: Pocket Cash vs Reinvestment */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-emerald-400 flex items-center gap-1.5 uppercase">
              <Wallet className="w-4 h-4" /> Divisão Inteligente de Caixa
            </span>
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <span>Reinvestir:</span>
              <select
                value={workingCapitalReservePercent}
                onChange={(e) => setWorkingCapitalReservePercent(Number(e.target.value))}
                className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-white font-bold text-xs"
              >
                <option value={70}>70% Giro / 30% Bolso</option>
                <option value={60}>60% Giro / 40% Bolso</option>
                <option value={50}>50% Giro / 50% Bolso</option>
                <option value={40}>40% Giro / 60% Bolso</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {/* Free Pocket Cash */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-emerald-500/30 space-y-1">
              <span className="text-[10px] uppercase font-bold text-emerald-400 block tracking-wider">
                Lucro Livre no Bolso (Salário/Despesas)
              </span>
              <div className="text-2xl font-black text-emerald-400">{formatBRL(freePocketCash)}</div>
              <span className="text-[10px] text-slate-400 block">
                {100 - workingCapitalReservePercent}% do lucro realizado disponível para retirada pessoal.
              </span>
            </div>

            {/* Reinvestment Capital */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-sky-500/30 space-y-1">
              <span className="text-[10px] uppercase font-bold text-sky-400 block tracking-wider">
                Capital de Giro (Reinvestimento em Novos BRICKs)
              </span>
              <div className="text-2xl font-black text-sky-400">{formatBRL(reinvestmentCapital)}</div>
              <span className="text-[10px] text-slate-400 block">
                {workingCapitalReservePercent}% blindado para comprar novos produtos e girar.
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Turnover Thermometer (Inventory Age) */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-black text-white flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400" /> Termômetro de Giro & Alerta de Liquidação
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Produtos acima de 20 dias no estoque perdem rentabilidade pelo custo de oportunidade.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
              🟢 {healthyItems.length} Giro Rápido (&lt;15 dias)
            </span>
            <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 font-bold border border-amber-500/20">
              🟡 {warningItems.length} Atenção (15-25 dias)
            </span>
            <span className="px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 font-bold border border-rose-500/20">
              🔴 {criticalItems.length} Parado (&gt;25 dias)
            </span>
          </div>
        </div>

        {/* List of aging items */}
        {agingItems.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            Nenhum item no estoque ativo no momento.
          </div>
        ) : (
          <div className="space-y-3">
            {agingItems
              .sort((a, b) => b.days - a.days)
              .map(({ item, days, metrics, status }) => {
                const cat = getCategoryInfo(item.category);
                return (
                  <div
                    key={item.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      status === 'critical'
                        ? 'bg-rose-950/20 border-rose-500/40'
                        : status === 'warning'
                        ? 'bg-amber-950/20 border-amber-500/40'
                        : 'bg-slate-950 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${
                          status === 'critical'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                            : status === 'warning'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        }`}
                      >
                        {days}d
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{item.model}</span>
                          <span className="text-[10px] text-slate-400 font-medium">({cat.name})</span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Custo Real de Entrada: <strong className="text-slate-200">{formatBRL(metrics.totalVehicleCost)}</strong> &bull; Preço Alvo: <strong className="text-emerald-400">{formatBRL(item.salePrice || metrics.targetPrice15Percent)}</strong>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 sm:border-l border-slate-800 sm:pl-4">
                      {status === 'critical' && (
                        <div className="bg-rose-500/10 px-3 py-1.5 rounded-xl border border-rose-500/30 text-rose-300 text-[11px] font-bold">
                          💡 Ação IA: Reduzir R$ 50 ou aceitar trocas com volta de 40%
                        </div>
                      )}
                      {status === 'warning' && (
                        <div className="bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/30 text-amber-300 text-[11px] font-bold">
                          💡 Ação IA: Impulsionar anúncio ou renovar fotos
                        </div>
                      )}
                      {status === 'healthy' && (
                        <div className="bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/30 text-emerald-300 text-[11px] font-bold">
                          ✅ Ritmo Normal de Giro
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
};
