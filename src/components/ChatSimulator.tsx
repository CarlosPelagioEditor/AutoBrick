import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { BrickItem, NegotiationSimulation } from '../types';
import { calculateVehicleMetrics, evaluateCounterOffer, formatBRL, formatPercent } from '../utils/calculations';
import { getCategoryInfo } from '../utils/categories';
import {
  MessageSquare,
  Sparkles,
  DollarSign,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Copy,
  Check,
  Send,
  Car,
  RefreshCw,
  Zap,
  Package,
} from 'lucide-react';

interface ChatSimulatorProps {
  initialVehicle?: BrickItem | null;
  onSelectVehicle?: (vehicle: BrickItem) => void;
}

export const ChatSimulator: React.FC<ChatSimulatorProps> = ({ initialVehicle }) => {
  const { vehicles } = useAuth();
  const [selectedItemId, setSelectedItemId] = useState<string>(
    initialVehicle?.id || (vehicles.length > 0 ? vehicles[0].id : '')
  );

  const activeItem = vehicles.find((v) => v.id === selectedItemId) || vehicles[0];
  const metrics = activeItem ? calculateVehicleMetrics(activeItem) : null;
  const catMeta = activeItem ? getCategoryInfo(activeItem.category) : null;

  const [proposedPrice, setProposedPrice] = useState<number>(
    activeItem ? Math.round((activeItem.salePrice || activeItem.purchasePrice * 1.2) * 0.9) : 2500
  );
  const [buyerMessage, setBuyerMessage] = useState<string>(
    'Boa noite amigo, tenho muito interesse. Faz por esse valor no PIX para eu ir buscar agora?'
  );

  const [targetMargin, setTargetMargin] = useState<number>(15);
  const [simulation, setSimulation] = useState<NegotiationSimulation | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState<boolean>(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Update simulation when price or item changes
  useEffect(() => {
    if (metrics && proposedPrice > 0) {
      const result = evaluateCounterOffer(metrics.totalVehicleCost, proposedPrice, targetMargin);
      setSimulation(result);
    }
  }, [selectedItemId, proposedPrice, targetMargin, metrics?.totalVehicleCost]);

  // Handle item change
  const handleItemChange = (id: string) => {
    setSelectedItemId(id);
    const item = vehicles.find((v) => v.id === id);
    if (item) {
      const vMetrics = calculateVehicleMetrics(item);
      const suggested = Math.round((item.salePrice || vMetrics.targetPrice15Percent) * 0.9);
      setProposedPrice(suggested);
    }
  };

  // Generate AI Counter-Responses via backend Gemini API
  const handleGenerateAiTactics = async () => {
    if (!activeItem || !proposedPrice) return;
    setIsLoadingAi(true);
    try {
      const res = await fetch('/api/ai/chat-negotiation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          item: activeItem,
          vehicle: activeItem,
          metrics,
          buyerMessage,
          proposedPrice,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSimulation((prev) => (prev ? { ...prev, ...data } : data));
        setIsLoadingAi(false);
        return;
      }
    } catch {
      // Ignored: fallback will handle
    }

    // Fallback structured options
    const totalCost = metrics?.totalVehicleCost || 0;
    const counterPrice = Math.round(totalCost / (1 - targetMargin / 100));
    setSimulation((prev) => ({
      ...(prev || {
        proposedPrice,
        proposedProfit: proposedPrice - totalCost,
        proposedMargin: ((proposedPrice - totalCost) / proposedPrice) * 100,
        verdict: 'COUNTER',
        verdictLabel: '🟡 Contraproposta',
        verdictDescription: 'Analise calculada com base na margem e custos do item.',
      }),
      options: [
        {
          label: 'Manter Firme',
          tone: 'Profissional e Firme',
          message: `Olá! O produto "${activeItem.model}" está impecável, com todos os acessórios e já revisado. Por esse valor infelizmente não consigo, mas o preço já está excelente pelo estado dele.`,
        },
        {
          label: 'Contraproposta Justa',
          tone: 'Negociador Equilibrado',
          message: `Consigo fazer por ${formatBRL(counterPrice)} no PIX à vista se vier retirar hoje. Menos que isso não compensa pelo estado e cuidado do produto.`,
        },
        {
          label: 'Fechamento Rápido no PIX',
          tone: 'Gatilho de Urgência',
          message: `Fecho por ${formatBRL(counterPrice)} se você confirmar agora e buscar ainda hoje. Deixo separado para você!`,
        },
      ],
    }));
    setIsLoadingAi(false);
  };

  const handleCopyText = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2500);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/80 rounded-3xl p-6 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-2">
              <MessageSquare className="w-3.5 h-3.5" />
              Módulo A: Simulador de Ofertas no Chat & Contrapropostas
            </div>
            <h1 className="text-2xl font-black text-white">
              Simulador Tático de Ofertas do Marketplace & OLX
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl mt-1">
              Recebeu uma proposta no WhatsApp ou OLX? Descubra instantaneamente se dá lucro, sua margem real e copie respostas persuasivas de contraproposta com IA.
            </p>
          </div>

          {/* Item Selector Dropdown */}
          {vehicles.length > 0 && (
            <div className="min-w-[260px]">
              <label className="block text-xs font-bold text-slate-400 mb-1">
                Item Selecionado para Negociação:
              </label>
              <select
                value={selectedItemId}
                onChange={(e) => handleItemChange(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                {vehicles.map((v) => {
                  const cat = getCategoryInfo(v.category);
                  return (
                    <option key={v.id} value={v.id}>
                      {cat.emoji} {v.model} ({formatBRL(v.salePrice || v.purchasePrice * 1.15)})
                    </option>
                  );
                })}
              </select>
            </div>
          )}
        </div>
      </div>

      {activeItem && metrics ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Product Financial Card & Parameters */}
          <div className="space-y-4">
            
            {/* Product Summary Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-xl">
                  {catMeta?.emoji || '📦'}
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-amber-400">
                    {catMeta?.name.split('(')[0]}
                  </div>
                  <h3 className="text-sm font-black text-white">{activeItem.model}</h3>
                  <div className="text-[11px] text-slate-400">
                    {activeItem.storageOrSpecs || (activeItem.plate ? `Placa ${activeItem.plate}` : '')}
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Preço Anunciado:</span>
                  <span className="font-extrabold text-white">
                    {formatBRL(activeItem.salePrice || metrics.targetPrice15Percent)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Custo Total de Entrada:</span>
                  <span className="font-bold text-amber-400">{formatBRL(metrics.totalVehicleCost)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Preço de Referência de Mercado:</span>
                  <span className="text-slate-300">{formatBRL(activeItem.fipeValue)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Meta Mínima Desejada:</span>
                  <span className="font-bold text-sky-400">{targetMargin}% de Margem</span>
                </div>
              </div>
            </div>

            {/* Negotiation Parameters Input Form */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
              <h3 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-400" /> Parâmetros da Oferta Recebida
              </h3>

              {/* Proposed Price by Buyer */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Valor Proposto pelo Comprador (R$) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="50"
                    value={proposedPrice}
                    onChange={(e) => setProposedPrice(Number(e.target.value))}
                    className="w-full px-4 py-3 bg-slate-950 border border-emerald-500/50 rounded-xl text-lg font-black text-emerald-400 focus:outline-none focus:border-emerald-400"
                  />
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[11px] text-slate-500">Atalhos:</span>
                  <button
                    type="button"
                    onClick={() => setProposedPrice(Math.round(metrics.totalVehicleCost * 1.15))}
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 font-bold"
                  >
                    Meta 15% ({formatBRL(metrics.totalVehicleCost * 1.15)})
                  </button>
                  <button
                    type="button"
                    onClick={() => setProposedPrice(Math.round(metrics.totalVehicleCost * 1.08))}
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 font-bold"
                  >
                    Mínimo 8% ({formatBRL(metrics.totalVehicleCost * 1.08)})
                  </button>
                </div>
              </div>

              {/* Target Margin Slider */}
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-300 mb-1">
                  <span>Sua Meta Mínima de Margem:</span>
                  <span className="text-amber-400">{targetMargin}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="35"
                  step="1"
                  value={targetMargin}
                  onChange={(e) => setTargetMargin(Number(e.target.value))}
                  className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>

              {/* Buyer Message Input */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Mensagem Recebida do Comprador (Opcional)
                </label>
                <textarea
                  rows={3}
                  value={buyerMessage}
                  onChange={(e) => setBuyerMessage(e.target.value)}
                  placeholder="Cole aqui o texto enviado pelo cliente no WhatsApp ou OLX..."
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Button to Generate AI Responses */}
              <button
                type="button"
                onClick={handleGenerateAiTactics}
                disabled={isLoadingAi}
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-500/20 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                {isLoadingAi ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Gerando Respostas Táticas com IA...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 stroke-[2.5]" />
                    Gerar Respostas & Contraproposta com IA
                  </>
                )}
              </button>
            </div>

          </div>

          {/* Right Column: Instant Visual Verdict & AI Counter-offer Responses */}
          <div className="lg:col-span-2 space-y-4">
            
            {simulation && (
              <>
                {/* Visual Verdict Banner */}
                <div
                  className={`rounded-3xl p-6 border transition-all ${
                    simulation.verdict === 'ACCEPT'
                      ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-100'
                      : simulation.verdict === 'COUNTER'
                      ? 'bg-amber-950/40 border-amber-500/60 text-amber-100'
                      : 'bg-rose-950/40 border-rose-500/60 text-rose-100'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      {simulation.verdict === 'ACCEPT' && (
                        <CheckCircle2 className="w-10 h-10 text-emerald-400 shrink-0" />
                      )}
                      {simulation.verdict === 'COUNTER' && (
                        <AlertCircle className="w-10 h-10 text-amber-400 shrink-0" />
                      )}
                      {simulation.verdict === 'REJECT' && (
                        <XCircle className="w-10 h-10 text-rose-400 shrink-0" />
                      )}
                      <div>
                        <h3 className="text-xl font-black">{simulation.verdictLabel}</h3>
                        <p className="text-xs text-slate-300 mt-1 max-w-xl">
                          {simulation.verdictDescription}
                        </p>
                      </div>
                    </div>

                    <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 text-right shrink-0">
                      <div className="text-[10px] uppercase font-bold text-slate-400">
                        Lucro com a Oferta
                      </div>
                      <div
                        className={`text-xl font-black ${
                          simulation.proposedProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {formatBRL(simulation.proposedProfit)}
                      </div>
                      <div className="text-xs font-bold text-slate-300">
                        Margem: {formatPercent(simulation.proposedMargin)}
                      </div>
                    </div>
                  </div>

                  {simulation.suggestedCounterPrice && (
                    <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <span className="text-slate-300">
                        Preço Sugerido de Contraproposta para Garantir {targetMargin}% de Lucro:
                      </span>
                      <span className="font-extrabold text-amber-400 text-sm bg-slate-950 px-3 py-1 rounded-xl border border-amber-500/30">
                        {formatBRL(simulation.suggestedCounterPrice)}
                      </span>
                    </div>
                  )}
                </div>

                {/* AI Tactical Options for Copying */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-400" /> Respostas Táticas Prontas para WhatsApp / OLX
                    </h3>
                    <span className="text-[11px] text-slate-400">Clique para copiar diretamente</span>
                  </div>

                  <div className="space-y-3">
                    {(simulation.options || [
                      {
                        label: 'Manter Firme',
                        tone: 'Profissional e Seguro',
                        message: `Olá! O produto "${activeItem.model}" está impecável, 100% testado e com todos os acessórios originais. Por esse valor infelizmente não consigo fechar, mas o valor de anúncio já é uma excelente oportunidade para o estado dele.`,
                      },
                      {
                        label: 'Contraproposta Equilibrada',
                        tone: 'Negociador Estratégico',
                        message: `Consigo chegar em ${formatBRL(simulation.suggestedCounterPrice || metrics.targetPrice15Percent)} no PIX à vista se você vier retirar hoje. Menos que isso não consigo segurar.`,
                      },
                      {
                        label: 'Gatilho de Urgência / Fechar Hoje',
                        tone: 'Persuasivo para Fechar Rápido',
                        message: `Se você confirmar agora e retirar ainda hoje, fecho por ${formatBRL(simulation.suggestedCounterPrice || metrics.targetPrice15Percent)} no PIX. Me avise para eu já deixar separado e testado para você!`,
                      },
                    ]).map((opt, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-950/80 hover:bg-slate-950 border border-slate-800 hover:border-slate-700 p-4 rounded-2xl transition-all space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold">
                              {opt.label}
                            </span>
                            <span className="text-[11px] text-slate-400 italic">
                              Tom: {opt.tone}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleCopyText(opt.message, idx)}
                            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-300 text-xs font-bold transition-all flex items-center gap-1.5"
                          >
                            {copiedIndex === idx ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
                                Copiado!
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                Copiar Texto
                              </>
                            )}
                          </button>
                        </div>

                        <p className="text-xs text-slate-300 font-sans leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-800/60 select-all">
                          {opt.message}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

          </div>

        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-400">
          Nenhum item cadastrado no estoque para simulação. Cadastre um item no BRICK primeiro.
        </div>
      )}

    </div>
  );
};
