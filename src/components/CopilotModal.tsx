import React, { useState, useEffect } from 'react';
import { BrickItem, CopilotAnalysis, GeneratedAdCopy } from '../types';
import { calculateVehicleMetrics, formatBRL, formatPercent } from '../utils/calculations';
import { getCategoryInfo } from '../utils/categories';
import {
  Sparkles,
  X,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Copy,
  Check,
  RefreshCw,
  Share2,
  FileText,
  ShieldCheck,
  Zap,
  Target,
  Layers,
} from 'lucide-react';

interface CopilotModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: BrickItem;
}

export const CopilotModal: React.FC<CopilotModalProps> = ({
  isOpen,
  onClose,
  vehicle,
}) => {
  const [activeTab, setActiveTab] = useState<'diagnosis' | 'ad_generator'>('diagnosis');
  const [analysis, setAnalysis] = useState<CopilotAnalysis | null>(null);
  const [adCopy, setAdCopy] = useState<GeneratedAdCopy | null>(null);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const [isLoadingAd, setIsLoadingAd] = useState(false);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const metrics = calculateVehicleMetrics(vehicle);
  const catMeta = getCategoryInfo(vehicle.category);

  // Fetch Copilot analysis from backend
  const fetchAnalysis = async () => {
    setIsLoadingAnalysis(true);
    try {
      const res = await fetch('/api/ai/copilot-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item: vehicle, vehicle, metrics }),
      });

      if (res.ok) {
        const data = await res.json();
        setAnalysis(data);
        return;
      }
    } catch {
      // Ignored: fallback will handle
    }

    // Fallback local diagnosis
    setAnalysis({
      score: metrics.realMarginPercent >= 15 ? 88 : 72,
      scoreLabel: metrics.realMarginPercent >= 15 ? 'Excelente Oportunidade' : 'Margem Moderada',
      diagnosis: `O item "${vehicle.model}" foi adquirido por ${formatBRL(vehicle.purchasePrice)} com deságio de ${Math.abs(metrics.fipeDiscountPercent).toFixed(1)}% em relação ao mercado. Custo total após preparação: ${formatBRL(metrics.totalVehicleCost)}.`,
      strengths: [
        `Deságio de ${Math.abs(metrics.fipeDiscountPercent).toFixed(1)}% na aquisição garante proteção contra oscilação.`,
        `Custos de preparação controlados em ${formatBRL(metrics.totalPreparationCost)}.`,
        `Alta liquidez para a categoria "${catMeta.name.split('(')[0]}".`,
      ],
      risks: [
        metrics.daysInStock > 25 ? `Item há ${metrics.daysInStock} dias em estoque. Acelerar giro.` : 'Risco de desvalorização tecnológica ou depreciação de mercado.',
        'Garantia legal de 90 dias / vícios ocultos.',
      ],
      tacticalAdvice: `Anuncie por ${formatBRL(vehicle.salePrice || metrics.targetPrice15Percent)}. Caso receba propostas à vista no PIX, o piso mínimo seguro é ${formatBRL(metrics.breakEvenPrice * 1.08)} mantendo lucro.`,
      idealPriceRange: {
        quickSale: Math.round(metrics.totalVehicleCost * 1.10),
        targetPrice: Math.round(metrics.totalVehicleCost * 1.18),
        maximumNegotiableDiscount: Math.round(metrics.totalVehicleCost * 1.05),
      },
    });
    setIsLoadingAnalysis(false);
  };

  // Fetch Ad Copy from backend
  const fetchAdCopy = async () => {
    setIsLoadingAd(true);
    try {
      const res = await fetch('/api/ai/generate-ad', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item: vehicle, vehicle, targetPlatform: 'Marketplace / OLX' }),
      });

      if (res.ok) {
        const data = await res.json();
        setAdCopy(data);
        return;
      }
    } catch {
      // Ignored: fallback will handle
    }

    setAdCopy({
      title: `${vehicle.model} - ${vehicle.condition || 'Seminovo Impecável'} [100% Testado]`,
      highlights: [
        'Item extremamente conservado e higienizado',
        vehicle.accessoriesIncluded ? `Acompanha: ${vehicle.accessoriesIncluded}` : 'Acompanha todos os acessórios originais',
        'Testamos tudo presencialmente na entrega',
        'Aceitamos PIX ou Cartão em até 12x com taxa da máquina',
      ],
      fullText: `🔥 ${vehicle.model.toUpperCase()} EM ESTADO DE NOVO! 🔥\n\n` +
        `Produto 100% revisado, limpo e testado. Perfeito funcionamento sem nenhum detalhe.\n\n` +
        `✅ ${vehicle.storageOrSpecs || 'Especificação completa'}\n` +
        `✅ ${vehicle.accessoriesIncluded || 'Acompanha acessórios'}\n` +
        `✅ Testamos tudo na hora da retirada para total segurança de ambas as partes.\n\n` +
        `💰 Valor: ${formatBRL(vehicle.salePrice || metrics.targetPrice15Percent)} no PIX\n\n` +
        `📍 Retirada em mãos ou entrega a combinar.\n` +
        `⚠️ Golpistas e curiosos não percam tempo. Não faço envio por terceiros sem pagamento prévio.`,
      instagramCaption: `Disponível para venda: ${vehicle.model}! Impecável e revisado. Garanta pelo direct! #brik #vendas #seminovos`,
      antiCuriousDisclaimer: 'Aviso: Golpistas do falso comprovante/Uber não percam tempo.',
    });
    setIsLoadingAd(false);
  };

  useEffect(() => {
    if (isOpen) {
      fetchAnalysis();
      fetchAdCopy();
    }
  }, [isOpen, vehicle.id]);

  if (!isOpen) return null;

  const handleCopy = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-xl">
              {catMeta.emoji}
            </div>
            <div>
              <h2 className="text-base font-black text-white flex items-center gap-2">
                Copiloto IA & Estratégia de Brik
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                  {vehicle.model}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Diagnóstico de rentabilidade, giro rápido e gerador de anúncios blindados.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 py-2.5 bg-slate-950/50 border-b border-slate-800 flex items-center gap-3">
          <button
            onClick={() => setActiveTab('diagnosis')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'diagnosis'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>Diagnóstico & Precificação</span>
          </button>
          <button
            onClick={() => setActiveTab('ad_generator')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'ad_generator'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Gerador de Anúncios (Marketplace/OLX)</span>
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* TAB 1: DIAGNOSIS */}
          {activeTab === 'diagnosis' && (
            <div className="space-y-6">
              {isLoadingAnalysis ? (
                <div className="py-16 text-center space-y-3">
                  <RefreshCw className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
                  <p className="text-xs font-bold text-slate-300">
                    O Copiloto IA está analisando custos de entrada, margem e liquidez para este produto...
                  </p>
                </div>
              ) : analysis ? (
                <>
                  {/* Score & Verdict Banner */}
                  <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col items-center justify-center shrink-0">
                        <span className="text-xl font-black text-amber-400">{analysis.score}</span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase">Score IA</span>
                      </div>
                      <div>
                        <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                          Avaliação da Operação
                        </div>
                        <h3 className="text-lg font-black text-white">{analysis.scoreLabel}</h3>
                        <p className="text-xs text-slate-300 mt-0.5">{analysis.diagnosis}</p>
                      </div>
                    </div>

                    <div className="text-right sm:border-l sm:border-slate-800 sm:pl-6 shrink-0">
                      <div className="text-[10px] text-slate-500 uppercase font-bold">Investimento Total</div>
                      <div className="text-lg font-black text-amber-400">{formatBRL(metrics.totalVehicleCost)}</div>
                      <div className="text-xs text-emerald-400 font-bold">
                        Lucro Meta: {formatBRL(metrics.netProfit)} ({formatPercent(metrics.realMarginPercent)})
                      </div>
                    </div>
                  </div>

                  {/* Ideal Price Range Cards */}
                  {analysis.idealPriceRange && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800">
                        <div className="text-[10px] font-bold uppercase text-amber-400">⚡ Giro Rápido (3 a 5 dias)</div>
                        <div className="text-base font-black text-white mt-1">
                          {formatBRL(analysis.idealPriceRange.quickSale)}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">Para liberar capital rápido</div>
                      </div>

                      <div className="bg-slate-950/70 p-4 rounded-2xl border border-emerald-500/30">
                        <div className="text-[10px] font-bold uppercase text-emerald-400">🎯 Preço de Anúncio Ideal</div>
                        <div className="text-base font-black text-emerald-400 mt-1">
                          {formatBRL(analysis.idealPriceRange.targetPrice)}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">Margem ideal de mercado</div>
                      </div>

                      <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800">
                        <div className="text-[10px] font-bold uppercase text-rose-400">🛡️ Piso Mínimo de Desconto</div>
                        <div className="text-base font-black text-white mt-1">
                          {formatBRL(analysis.idealPriceRange.maximumNegotiableDiscount)}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">Não venda abaixo deste valor</div>
                      </div>
                    </div>
                  )}

                  {/* Strengths & Risks */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-950/70 p-4 rounded-2xl border border-emerald-500/20 space-y-2">
                      <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle className="w-4 h-4" /> Pontos Fortes da Negociação
                      </div>
                      <ul className="space-y-1.5 text-xs text-slate-300">
                        {analysis.strengths.map((s, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-emerald-400 font-bold">•</span>
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-slate-950/70 p-4 rounded-2xl border border-amber-500/20 space-y-2">
                      <div className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4" /> Riscos & Pontos de Atenção
                      </div>
                      <ul className="space-y-1.5 text-xs text-slate-300">
                        {analysis.risks.map((r, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-amber-400 font-bold">•</span>
                            <span>{r}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Tactical Advice */}
                  <div className="bg-slate-950/90 border border-slate-800 p-4 rounded-2xl space-y-1.5">
                    <div className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
                      <Zap className="w-4 h-4" /> Conselho Estratégico de Giro & Venda
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed font-sans">
                      {analysis.tacticalAdvice}
                    </p>
                  </div>
                </>
              ) : null}
            </div>
          )}

          {/* TAB 2: AD GENERATOR */}
          {activeTab === 'ad_generator' && (
            <div className="space-y-6">
              {isLoadingAd ? (
                <div className="py-16 text-center space-y-3">
                  <RefreshCw className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
                  <p className="text-xs font-bold text-slate-300">
                    Gerando anúncio otimizado para Facebook Marketplace, OLX e grupos de WhatsApp...
                  </p>
                </div>
              ) : adCopy ? (
                <>
                  {/* Full Marketplace & OLX Ad Text */}
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                        <FileText className="w-4 h-4" /> Anúncio Completo (Marketplace & OLX)
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(adCopy.fullText, 'fullText')}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-amber-500/20 text-slate-300 hover:text-amber-300 text-xs font-bold transition-all flex items-center gap-1.5"
                      >
                        {copiedSection === 'fullText' ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" /> Copiado!
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" /> Copiar Anúncio
                          </>
                        )}
                      </button>
                    </div>

                    <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 text-xs text-slate-200 font-sans whitespace-pre-wrap leading-relaxed select-all">
                      {adCopy.fullText}
                    </div>
                  </div>

                  {/* Highlights Grid */}
                  <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-2">
                    <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4" /> Destaques & Diferenciais do Produto
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {adCopy.highlights.map((h, i) => (
                        <div key={i} className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                          <span>{h}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Anti-curious / Anti-scam footer */}
                  <div className="bg-slate-950/70 border border-rose-500/20 rounded-2xl p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2.5">
                      <ShieldCheck className="w-5 h-5 text-rose-400 shrink-0" />
                      <div className="text-xs text-slate-300">
                        <span className="font-bold text-rose-400">Blindagem Anti-Golpe: </span>
                        {adCopy.antiCuriousDisclaimer}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(adCopy.antiCuriousDisclaimer, 'disclaimer')}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white text-xs font-semibold shrink-0"
                    >
                      {copiedSection === 'disclaimer' ? 'Copiado!' : 'Copiar'}
                    </button>
                  </div>
                </>
              ) : null}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-800 flex items-center justify-between bg-slate-950/70">
          <button
            type="button"
            onClick={activeTab === 'diagnosis' ? fetchAnalysis : fetchAdCopy}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Recalcular com IA
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-amber-500 text-slate-950 font-black text-xs hover:brightness-110 transition-all"
          >
            Concluir
          </button>
        </div>

      </div>
    </div>
  );
};
