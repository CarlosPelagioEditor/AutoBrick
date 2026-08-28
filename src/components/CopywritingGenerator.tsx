import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { BrickItem, GeneratedAdCopy } from '../types';
import { CATEGORIES_LIST, getCategoryInfo } from '../utils/categories';
import { formatBRL } from '../utils/calculations';
import {
  Sparkles,
  Copy,
  Check,
  Share2,
  RefreshCw,
  ShoppingBag,
  Sliders,
  Send,
  MessageSquare,
  ShieldCheck,
  CreditCard,
  Layers,
  ArrowRight,
  Flame,
  FileText,
  AlertCircle,
  Eye,
  CheckCircle2,
} from 'lucide-react';

interface CopywritingGeneratorProps {
  initialItem?: BrickItem | null;
  onSavedToItem?: (item: BrickItem) => void;
}

export const CopywritingGenerator: React.FC<CopywritingGeneratorProps> = ({
  initialItem,
  onSavedToItem,
}) => {
  const { vehicles, saveVehicle } = useAuth();

  // Selected item or manual input
  const [selectedItemId, setSelectedItemId] = useState<string>(
    initialItem?.id || (vehicles.length > 0 ? vehicles[0].id : '')
  );

  // Manual fallback fields if no item in stock
  const [manualModel, setManualModel] = useState(initialItem?.model || 'PlayStation 5 Slim 1TB');
  const [manualCategory, setManualCategory] = useState(initialItem?.category || 'consoles_games');
  const [manualPrice, setManualPrice] = useState(initialItem?.salePrice?.toString() || '3290');
  const [manualCondition, setManualCondition] = useState('Seminovo Impecável');
  const [manualSpecs, setManualSpecs] = useState('1TB SSD / 4K / 1 Controle Original');
  const [manualAccessories, setManualAccessories] = useState('Caixa original, cabos e suporte');

  // Generator Options
  const [platform, setPlatform] = useState<'marketplace' | 'olx' | 'whatsapp' | 'instagram'>('marketplace');
  const [tone, setTone] = useState<'comercial' | 'urgencia' | 'tecnico' | 'gamer'>('urgencia');
  const [includeAntiScam, setIncludeAntiScam] = useState(true);
  const [includeCardRates, setIncludeCardRates] = useState(true);
  const [includeTradeOption, setIncludeTradeOption] = useState(true);
  const [includeWarranty, setIncludeWarranty] = useState(true);

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAd, setGeneratedAd] = useState<GeneratedAdCopy | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Find active item
  const activeItem = vehicles.find((v) => v.id === selectedItemId);

  const handleCopy = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setSaveSuccess(false);

    const productPayload = activeItem
      ? {
          model: activeItem.model,
          category: activeItem.category,
          brand: activeItem.brand,
          condition: activeItem.condition,
          storageOrSpecs: activeItem.storageOrSpecs,
          accessoriesIncluded: activeItem.accessoriesIncluded,
          serialOrImei: activeItem.serialOrImei,
          batteryHealth: activeItem.batteryHealth,
          salePrice: activeItem.salePrice || activeItem.fipeValue || 1000,
          fipeValue: activeItem.fipeValue,
        }
      : {
          model: manualModel,
          category: manualCategory,
          condition: manualCondition,
          storageOrSpecs: manualSpecs,
          accessoriesIncluded: manualAccessories,
          salePrice: Number(manualPrice) || 1000,
          fipeValue: Number(manualPrice) || 1000,
        };

    const toneDescriptions = {
      comercial: 'Profissional, direto, seguro e confiável',
      urgencia: 'Preço promocional para fechar hoje, oportunidade relâmpago',
      tecnico: 'Focado em especificações completas, testes de bancada e transparência',
      gamer: 'Linguagem dinâmica voltada para o público gamer e entusiastas de tecnologia',
    };

    const platformLabels = {
      marketplace: 'Facebook Marketplace',
      olx: 'OLX Brasil',
      whatsapp: 'WhatsApp & Status',
      instagram: 'Instagram Feed / Direct',
    };

    try {
      const res = await fetch('/api/ai/generate-ad', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          item: productPayload,
          targetPlatform: platformLabels[platform],
          tone: toneDescriptions[tone],
        }),
      });

      if (!res.ok) throw new Error('Falha na resposta');
      const data = await res.json();

      // Enrich ad with user toggles if not already present
      let enrichedFullText = data.fullText || '';
      const priceFormatted = formatBRL(productPayload.salePrice);

      if (includeCardRates && !enrichedFullText.includes('12x')) {
        enrichedFullText += `\n\n💳 FORMAS DE PAGAMENTO:\n• PIX ou Dinheiro: ${priceFormatted}\n• Cartão de Crédito em até 12x ou 18x (taxas da maquininha repassadas)`;
      }

      if (includeTradeOption && !enrichedFullText.includes('troca')) {
        enrichedFullText += `\n\n🔄 ACEITO TROCAS / BRICK:\n• Aceito itens de menor valor com volta em dinheiro (sob avaliação justa para revenda).`;
      }

      if (includeWarranty && !enrichedFullText.includes('Garantia')) {
        enrichedFullText += `\n\n🛡️ PROCEDÊNCIA & GARANTIA:\n• Produto com procedência 100% verificada e garantia balcão para você testar com calma.`;
      }

      if (includeAntiScam && !enrichedFullText.includes('Aviso')) {
        enrichedFullText += `\n\n⚠️ AVISO DE SEGURANÇA:\n• Testamos tudo na hora da entrega presencial.\n• Não envio por motoristas sem confirmação direta do PIX no aplicativo do banco.`;
      }

      const generatedResult: GeneratedAdCopy = {
        title: data.title || `🔥 ${productPayload.model} - IMPECÁVEL!`,
        highlights: data.highlights || ['100% Testado', 'Sem detalhes', 'Entrega Imediata'],
        fullText: enrichedFullText,
        instagramCaption: data.instagramCaption,
        antiCuriousDisclaimer: data.antiCuriousDisclaimer,
        isAiGenerated: data.isAiGenerated !== false,
      };

      setGeneratedAd(generatedResult);
    } catch (err) {
      console.warn('Erro ao gerar copy, gerando localmente:', err);
      // Local fallback
      const priceFormatted = formatBRL(Number(productPayload.salePrice) || 1000);
      const title = `🔥 ${productPayload.model} - ${productPayload.condition || 'Seminovo Impecável'} [100% Testado]`;
      let text = `🔥 ${productPayload.model.toUpperCase()} - ESTADO DE NOVO! 🔥\n\n`;
      text += `Produto extremamente bem cuidado, revisado e pronto para uso imediato!\n\n`;
      text += `📌 ESPECIFICAÇÕES & DETALHES:\n`;
      text += `• Modelo: ${productPayload.model}\n`;
      text += `• Condição: ${productPayload.condition || 'Sem marcas de queda'}\n`;
      text += `• Configuração: ${productPayload.storageOrSpecs || 'Original'}\n`;
      text += `• Acompanha: ${productPayload.accessoriesIncluded || 'Itens originais'}\n`;
      text += `\n💰 VALOR: ${priceFormatted} à vista no PIX.\n`;

      if (includeCardRates) {
        text += `💳 Parcelo no cartão em até 12x ou 18x (taxas da maquininha).\n`;
      }
      if (includeTradeOption) {
        text += `🔄 Aceito trocas por eletrônicos com volta em dinheiro.\n`;
      }
      if (includeWarranty) {
        text += `🛡️ Garantia de funcionamento e procedência 100% limpa.\n`;
      }
      if (includeAntiScam) {
        text += `\n⚠️ ENTREGA SEGURA:\nRetirada em local público movimentado. Testamos tudo presencialmente na hora da entrega.`;
      }

      setGeneratedAd({
        title,
        highlights: ['100% Funcional', 'Revisado', 'Aceito Cartão'],
        fullText: text,
        instagramCaption: `Disponível: ${productPayload.model}! ✨ Perfeito estado, por apenas ${priceFormatted}. Chama no Direct/WhatsApp! 🚀 #BRICK #seminovos`,
        isAiGenerated: false,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveToItem = () => {
    if (!activeItem || !generatedAd) return;
    const updated: BrickItem = {
      ...activeItem,
      generatedAd,
    };
    saveVehicle(updated);
    if (onSavedToItem) onSavedToItem(updated);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/70 p-6 md:p-8 text-white shadow-xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Gerador de Copywriting & Anúncios Turbo com IA
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Anúncios Irresistíveis para OLX, Marketplace & WhatsApp
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Crie títulos magnéticos, descrições persuasivas, proteções anti-golpe e tabelas de pagamento prontas para colar na OLX, Facebook Marketplace e enviar no WhatsApp com 1 clique.
          </p>
        </div>
      </div>

      {/* Main Grid: Controls vs Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Configuration Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* Select Item from Inventory */}
          <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-3xl space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" /> 1. Escolha o Produto do Estoque
            </h2>

            {vehicles.length > 0 ? (
              <div>
                <label className="text-[11px] font-semibold text-slate-400 mb-1.5 block">
                  Produto do seu BRICK
                </label>
                <select
                  value={selectedItemId}
                  onChange={(e) => {
                    setSelectedItemId(e.target.value);
                    setGeneratedAd(null);
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 font-medium"
                >
                  {vehicles.map((v) => {
                    const cat = getCategoryInfo(v.category);
                    return (
                      <option key={v.id} value={v.id}>
                        {cat.emoji} {v.model} - {formatBRL(v.salePrice || v.purchasePrice)} ({v.status === 'sold' ? 'Vendido' : 'Em Estoque'})
                      </option>
                    );
                  })}
                </select>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Modelo / Produto</label>
                  <input
                    type="text"
                    value={manualModel}
                    onChange={(e) => setManualModel(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">Preço Venda (R$)</label>
                    <input
                      type="number"
                      value={manualPrice}
                      onChange={(e) => setManualPrice(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">Condição</label>
                    <input
                      type="text"
                      value={manualCondition}
                      onChange={(e) => setManualCondition(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Active Item Mini Card */}
            {activeItem && (
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white truncate">{activeItem.model}</span>
                  <span className="text-amber-400 font-extrabold">{formatBRL(activeItem.salePrice || 0)}</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  {activeItem.storageOrSpecs && <span>{activeItem.storageOrSpecs} &bull; </span>}
                  <span>{activeItem.accessoriesIncluded || 'Sem acessórios extras'}</span>
                </div>
              </div>
            )}
          </div>

          {/* Strategy & Tone */}
          <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-3xl space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-400" /> 2. Canal de Venda & Tom do Anúncio
            </h2>

            {/* Platform Selector */}
            <div>
              <label className="text-[11px] font-semibold text-slate-400 mb-1.5 block">Canal Principal</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'marketplace', label: 'FB Marketplace', icon: '🛍️' },
                  { id: 'olx', label: 'OLX Brasil', icon: '📦' },
                  { id: 'whatsapp', label: 'WhatsApp / Status', icon: '💬' },
                  { id: 'instagram', label: 'Instagram Feed', icon: '📸' },
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPlatform(p.id as any)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border ${
                      platform === p.id
                        ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>{p.icon}</span>
                    <span>{p.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tone Selector */}
            <div>
              <label className="text-[11px] font-semibold text-slate-400 mb-1.5 block">Estilo da Redação</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'urgencia', label: '🔥 Urgência & Giro Hoje', desc: 'Preço promocional' },
                  { id: 'comercial', label: '💼 Profissional & Seguro', desc: 'Confiabilidade' },
                  { id: 'tecnico', label: '⚙️ Técnico & Specs', desc: 'Detalhes completos' },
                  { id: 'gamer', label: '🎮 Entusiasta / Gamer', desc: 'Linguagem dinâmica' },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTone(t.id as any)}
                    className={`p-2.5 rounded-xl text-left transition-all cursor-pointer border ${
                      tone === t.id
                        ? 'bg-amber-500/20 border-amber-500/50 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="text-xs font-bold">{t.label}</div>
                    <div className="text-[10px] text-slate-500">{t.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Toggles */}
            <div className="pt-2 border-t border-slate-800/80 space-y-2 text-xs">
              <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeAntiScam}
                  onChange={(e) => setIncludeAntiScam(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-700 text-amber-500 focus:ring-0"
                />
                <span>Incluir cláusula Anti-Golpe (teste presencial / sem motoboy)</span>
              </label>

              <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeCardRates}
                  onChange={(e) => setIncludeCardRates(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-700 text-amber-500 focus:ring-0"
                />
                <span>Incluir facilidade de Cartão até 12x/18x (com taxa)</span>
              </label>

              <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeTradeOption}
                  onChange={(e) => setIncludeTradeOption(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-700 text-amber-500 focus:ring-0"
                />
                <span>Incluir opção "Aceito Trocas com Volta"</span>
              </label>

              <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeWarranty}
                  onChange={(e) => setIncludeWarranty(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-700 text-amber-500 focus:ring-0"
                />
                <span>Destacar Garantia de Funcionamento & Procedência</span>
              </label>
            </div>

            {/* Generate Button */}
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs rounded-2xl shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Gerando Copy Magnética com IA...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Gerar Anúncio Turbo Agora</span>
                </>
              )}
            </button>
          </div>

        </div>

        {/* Right Column: Output & Live Preview (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {generatedAd ? (
            <div className="bg-slate-900/90 border border-slate-800 p-5 md:p-6 rounded-3xl space-y-5">
              
              {/* Header Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-bold text-white">Anúncio Pronto para Publicação</span>
                  {generatedAd.isAiGenerated && (
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 text-[10px] font-bold border border-amber-500/20">
                      Otimizado por IA
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {activeItem && (
                    <button
                      onClick={handleSaveToItem}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      {saveSuccess ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <FileText className="w-3.5 h-3.5" />}
                      <span>{saveSuccess ? 'Salvo no Item!' : 'Salvar no Cadastro'}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Title Section */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                  <span>📌 Título Magnético (Marketplace / OLX)</span>
                  <button
                    onClick={() => handleCopy(generatedAd.title, 'title')}
                    className="text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                  >
                    {copiedField === 'title' ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400 text-[10px]">Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span className="text-[10px]">Copiar Título</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-sm font-bold text-white select-all">
                  {generatedAd.title}
                </div>
              </div>

              {/* Bullets & Highlights */}
              {generatedAd.highlights && generatedAd.highlights.length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-xs font-bold text-slate-400">✨ Gatilhos & Pontos Fortes</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {generatedAd.highlights.map((h, i) => (
                      <div key={i} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 text-xs text-slate-300 flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Full Text Body */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                  <span>📝 Descrição Completa (Corpo do Anúncio)</span>
                  <button
                    onClick={() => handleCopy(generatedAd.fullText, 'fullText')}
                    className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 text-xs font-bold flex items-center gap-1.5 cursor-pointer border border-amber-500/30"
                  >
                    {copiedField === 'fullText' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar Descrição</span>
                      </>
                    )}
                  </button>
                </div>
                <textarea
                  readOnly
                  value={generatedAd.fullText}
                  rows={11}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs text-slate-200 font-mono leading-relaxed focus:outline-none select-all"
                />
              </div>

              {/* WhatsApp Quick Formatter */}
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
                    <MessageSquare className="w-4 h-4 text-emerald-400" />
                    <span>Versão Rápida para Conversas de WhatsApp</span>
                  </div>
                  <button
                    onClick={() => {
                      const waText = `*${generatedAd.title}*\n\n${generatedAd.fullText}`;
                      handleCopy(waText, 'waText');
                    }}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
                  >
                    {copiedField === 'waText' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedField === 'waText' ? 'Copiado!' : 'Copiar p/ WhatsApp'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-300">
                  Formatação otimizada com negritos (*texto*) para envio direto a clientes interessados ou grupos de BRICK.
                </p>
              </div>

            </div>
          ) : (
            <div className="bg-slate-900/50 border border-dashed border-slate-800 rounded-3xl p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Nenhum anúncio gerado ainda</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Selecione um produto do seu BRICK ao lado, configure os canais e clique em "Gerar Anúncio Turbo" para ver a mágica da IA.
              </p>
              <button
                onClick={handleGenerate}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-xs rounded-xl border border-slate-700 transition-all inline-flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Gerar Agora
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
