import React, { useState } from 'react';
import {
  GitFork,
  ArrowRight,
  TrendingUp,
  DollarSign,
  Package,
  Sparkles,
  Plus,
  Repeat,
  CheckCircle2,
  Layers,
  Award,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { BrickItem } from '../types';
import { formatBRL, formatDateBR, formatPercent } from '../utils/calculations';
import { getCategoryInfo } from '../utils/categories';

interface TradeJourneyStep {
  id: string;
  itemName: string;
  cashReceived: number; // Volta em dinheiro capturada
  resaleOrCurrentValue: number;
  prepCost: number;
  status: 'sold' | 'in_stock';
  date: string;
  notes?: string;
}

export const TradeJourneyTree: React.FC = () => {
  const { vehicles } = useAuth();

  // Pre-seed an exciting real-world flipping journey example
  const [initialCapital, setInitialCapital] = useState<number>(300);
  const [initialItemName, setInitialItemName] = useState<string>('Fone Sony WH-1000XM4 (Comprado com defeito no conector)');

  const [steps, setSteps] = useState<TradeJourneyStep[]>([
    {
      id: 'step_1',
      itemName: 'Troca pelo JBL Flip 6 + Volta em Dinheiro',
      cashReceived: 100,
      resaleOrCurrentValue: 450,
      prepCost: 20,
      status: 'sold',
      date: '2026-08-10',
      notes: 'Limpeza simples e venda rápida no Marketplace',
    },
    {
      id: 'step_2',
      itemName: 'Troca por Xbox One S 500GB + 2 Controles',
      cashReceived: 200,
      resaleOrCurrentValue: 950,
      prepCost: 50,
      status: 'sold',
      date: '2026-08-18',
      notes: 'Troca de pasta térmica e higienização dos controles',
    },
    {
      id: 'step_3',
      itemName: 'Troca por iPhone 11 128GB (Ativo Atual em Estoque)',
      cashReceived: 150,
      resaleOrCurrentValue: 1600,
      prepCost: 0,
      status: 'in_stock',
      date: '2026-08-26',
      notes: 'Aparelho 100% impecável com saúde 86%',
    },
  ]);

  // Form for adding a new step
  const [newStepName, setNewStepName] = useState<string>('');
  const [newCashReceived, setNewCashReceived] = useState<number>(0);
  const [newResaleValue, setNewResaleValue] = useState<number>(0);
  const [newPrepCost, setNewPrepCost] = useState<number>(0);
  const [newStatus, setNewStatus] = useState<'sold' | 'in_stock'>('in_stock');

  // Calculations
  const totalCashExtracted = steps.reduce((acc, s) => acc + s.cashReceived, 0);
  const totalPrepCosts = steps.reduce((acc, s) => acc + s.prepCost, 0);
  const totalCashInvested = initialCapital + totalPrepCosts;

  // Active current value (last step value if in stock, or total revenue if all sold)
  const currentAssetValue = steps.length > 0 ? steps[steps.length - 1].resaleOrCurrentValue : 0;
  const totalAccumulatedEquity = totalCashExtracted + currentAssetValue;
  const netAccumulatedProfit = totalAccumulatedEquity - totalCashInvested;
  const totalMultiplier = totalCashInvested > 0 ? totalAccumulatedEquity / totalCashInvested : 0;

  const handleAddStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStepName.trim()) return;

    const newStep: TradeJourneyStep = {
      id: `step_${Date.now()}`,
      itemName: newStepName.trim(),
      cashReceived: Number(newCashReceived) || 0,
      resaleOrCurrentValue: Number(newResaleValue) || 0,
      prepCost: Number(newPrepCost) || 0,
      status: newStatus,
      date: new Date().toISOString().split('T')[0],
    };

    setSteps([...steps, newStep]);
    setNewStepName('');
    setNewCashReceived(0);
    setNewResaleValue(0);
    setNewPrepCost(0);
  };

  const handleRemoveStep = (id: string) => {
    setSteps(steps.filter((s) => s.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 rounded-3xl p-6 text-white shadow-xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold mb-2">
          <GitFork className="w-3.5 h-3.5" />
          Genealogia & Árvore Contínua do Rolo
        </div>
        <h1 className="text-2xl font-black text-white">
          Rastreador de Multiplicação de Capital em Cadeia
        </h1>
        <p className="text-xs text-slate-300 max-w-2xl mt-1">
          Acompanhe como um pequeno investimento inicial se multiplica através de trocas sucessivas com volta em dinheiro até atingir patrimônios muito maiores.
        </p>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Initial Capital */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-1">
          <span className="text-slate-400 text-xs font-bold block">1. Investimento Inicial</span>
          <div className="text-xl font-black text-slate-200">{formatBRL(initialCapital)}</div>
          <span className="text-[10px] text-slate-500 block">Capital próprio colocado no início</span>
        </div>

        {/* PIX Cash Harvested */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-1">
          <span className="text-emerald-400 text-xs font-bold block">2. Dinheiro Retirado nas Voltas</span>
          <div className="text-xl font-black text-emerald-400">+{formatBRL(totalCashExtracted)}</div>
          <span className="text-[10px] text-emerald-500/80 block">PIX colocado direto no bolso</span>
        </div>

        {/* Current Asset Value */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-1">
          <span className="text-sky-400 text-xs font-bold block">3. Valor do Item Atual</span>
          <div className="text-xl font-black text-sky-400">{formatBRL(currentAssetValue)}</div>
          <span className="text-[10px] text-sky-500/80 block">Patrimônio ativo hoje</span>
        </div>

        {/* Total Multiplier */}
        <div className="bg-gradient-to-tr from-amber-500/20 to-yellow-500/10 border border-amber-500/40 p-5 rounded-3xl space-y-1">
          <span className="text-amber-400 text-xs font-black flex items-center gap-1">
            <Award className="w-3.5 h-3.5" /> 4. Multiplicação do Capital
          </span>
          <div className="text-2xl font-black text-amber-300">{totalMultiplier.toFixed(1)}x</div>
          <span className="text-[10px] text-amber-200/80 block font-bold">
            Lucro Total: +{formatBRL(netAccumulatedProfit)}
          </span>
        </div>
      </div>

      {/* Main Chain Visualizer */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-sm font-black text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" /> Linha do Tempo da Genealogia
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Cada elo da corrente mostra o produto negociado, o dinheiro colhido e o valor do ativo conquistado.
            </p>
          </div>
        </div>

        {/* Chain Flow */}
        <div className="space-y-4">
          
          {/* Origin Card */}
          <div className="bg-slate-950 border-2 border-amber-500/50 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-black text-sm">
                0
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-amber-400 block tracking-wider">
                  Origem do Capital (Ponto de Partida)
                </span>
                <input
                  type="text"
                  value={initialItemName}
                  onChange={(e) => setInitialItemName(e.target.value)}
                  className="text-xs font-bold text-white bg-transparent border-b border-slate-800 focus:border-amber-500 focus:outline-none w-full max-w-md py-0.5"
                />
              </div>
            </div>

            <div className="text-right sm:border-l border-slate-800 sm:pl-4">
              <span className="text-[10px] text-slate-400 block">Custo Inicial:</span>
              <input
                type="number"
                value={initialCapital || ''}
                onChange={(e) => setInitialCapital(Number(e.target.value))}
                className="text-sm font-black text-amber-400 bg-slate-900 px-2 py-1 rounded-lg border border-slate-700 w-28 text-right"
              />
            </div>
          </div>

          {/* Subsequent steps */}
          {steps.map((step, idx) => (
            <div key={step.id} className="relative pl-6 sm:pl-8">
              {/* Connector line */}
              <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-indigo-500/40 -translate-x-1/2" />
              
              <div className="bg-slate-950/80 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all">
                <div className="flex items-start sm:items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300 font-black text-xs shrink-0 mt-1 sm:mt-0">
                    {idx + 1}
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{step.itemName}</span>
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          step.status === 'sold'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                        }`}
                      >
                        {step.status === 'sold' ? 'Vendido / Repassado' : 'Ativo em Mãos'}
                      </span>
                    </div>
                    {step.notes && <p className="text-[11px] text-slate-400">{step.notes}</p>}
                  </div>
                </div>

                <div className="flex items-center gap-4 sm:border-l border-slate-800 sm:pl-4 shrink-0">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">Volta no PIX:</span>
                    <span className="text-xs font-black text-emerald-400">
                      +{formatBRL(step.cashReceived)}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">Valor do Item:</span>
                    <span className="text-xs font-black text-sky-400">
                      {formatBRL(step.resaleOrCurrentValue)}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveStep(step.id)}
                    className="text-slate-500 hover:text-rose-400 text-xs p-1 cursor-pointer"
                    title="Excluir etapa"
                  >
                    &times;
                  </button>
                </div>
              </div>
            </div>
          ))}

        </div>

        {/* Add Next Step Form */}
        <form onSubmit={handleAddStep} className="bg-slate-950 p-4 rounded-2xl border border-indigo-500/30 space-y-3">
          <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
            <Plus className="w-4 h-4" /> Adicionar Próxima Troca / Venda na Cadeia
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Nome do Próximo Item Recebido / Negociado:
              </label>
              <input
                type="text"
                value={newStepName}
                onChange={(e) => setNewStepName(e.target.value)}
                placeholder="Ex: PlayStation 5 Digital, iPad 9, Moto Fan..."
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-emerald-400 mb-1">
                Volta em Dinheiro (PIX):
              </label>
              <input
                type="number"
                value={newCashReceived || ''}
                onChange={(e) => setNewCashReceived(Number(e.target.value))}
                placeholder="Ex: 200"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-emerald-400 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-sky-400 mb-1">
                Valor de Mercado / Revenda:
              </label>
              <input
                type="number"
                value={newResaleValue || ''}
                onChange={(e) => setNewResaleValue(Number(e.target.value))}
                placeholder="Ex: 2400"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-sky-400 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={!newStepName.trim()}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow cursor-pointer transition-all"
            >
              + Registrar Nova Etapa do Rolo
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
