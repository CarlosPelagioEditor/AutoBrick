import React, { useState, useEffect, useMemo } from 'react';
import { BrickItem, ItemCategory, ItemCondition, PaymentMethod, SaleDealType } from '../types';
import { CATEGORIES_LIST, getCategoryInfo } from '../utils/categories';
import { PixReceiptUploader } from './PixReceiptUploader';
import { ImageViewerModal } from './ImageViewerModal';
import {
  calculateVehicleMetrics,
  calculateTradeSaleDetails,
  formatBRL,
  formatPercent,
  formatDateBR,
  getInventoryDurationDetails,
} from '../utils/calculations';
import {
  CheckCircle2,
  Calendar,
  DollarSign,
  Clock,
  TrendingUp,
  X,
  RotateCcw,
  Tag,
  ShieldCheck,
  Repeat,
  Layers,
  ArrowRight,
  PackagePlus,
  Sparkles,
  HelpCircle,
  Smartphone,
  Gamepad2,
  Tv,
  Car,
  Laptop,
  Wrench,
  Package,
  Search,
  Loader2,
  ChevronDown,
  ChevronUp,
  Globe,
} from 'lucide-react';

interface MarkSoldModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmSale?: (updatedItem: BrickItem, newTradeItem?: BrickItem) => void;
  onConfirm?: (updatedItem: BrickItem, newTradeItem?: BrickItem) => void;
  onRevertToStock?: (item: BrickItem) => void;
  item: BrickItem | null;
}

export const MarkSoldModal: React.FC<MarkSoldModalProps> = ({
  isOpen,
  onClose,
  onConfirmSale,
  onConfirm,
  onRevertToStock,
  item,
}) => {
  // Deal type selector
  const [dealType, setDealType] = useState<SaleDealType>('cash_only');

  // Common sale inputs
  const [saleDate, setSaleDate] = useState<string>('');
  const [cardFees, setCardFees] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');
  const [buyerInfo, setBuyerInfo] = useState<string>('');

  // Mode 1: Cash Only inputs
  const [cashSalePrice, setCashSalePrice] = useState<number>(0);
  const [cashPaymentMethod, setCashPaymentMethod] = useState<PaymentMethod>('pix');

  // Mode 2 & 3: Trade-in inputs
  const [cashReceivedInTrade, setCashReceivedInTrade] = useState<number>(0);
  const [tradePaymentMethod, setTradePaymentMethod] = useState<PaymentMethod>('pix');
  const [tradeCategory, setTradeCategory] = useState<ItemCategory>('consoles_games');
  const [tradeModel, setTradeModel] = useState<string>('');
  const [tradeBrand, setTradeBrand] = useState<string>('');
  const [tradeCondition, setTradeCondition] = useState<ItemCondition>('seminovo_impecavel');
  const [tradeSpecs, setTradeSpecs] = useState<string>('');
  const [tradeAccessories, setTradeAccessories] = useState<string>('');
  const [tradeDescription, setTradeDescription] = useState<string>('');
  const [tradeAttributedValue, setTradeAttributedValue] = useState<number>(0);
  const [tradeMarketPrice, setTradeMarketPrice] = useState<number>(0);
  const [tradePrepCost, setTradePrepCost] = useState<number>(0);
  const [tradeExpectedResalePrice, setTradeExpectedResalePrice] = useState<number>(0);
  const [autoAddToStock, setAutoAddToStock] = useState<boolean>(true);

  // Pix Receipt State
  const [pixReceiptUrl, setPixReceiptUrl] = useState<string | undefined>(undefined);
  const [pixReceiptName, setPixReceiptName] = useState<string | undefined>(undefined);
  const [pixReceiptDate, setPixReceiptDate] = useState<string | undefined>(undefined);
  const [pixReceiptTransactionId, setPixReceiptTransactionId] = useState<string | undefined>(undefined);
  const [previewPixReceipt, setPreviewPixReceipt] = useState<{ url: string; name?: string } | null>(null);

  // AI Valuation State
  const [isLoadingAiTrade, setIsLoadingAiTrade] = useState<boolean>(false);
  const [aiTradeValuation, setAiTradeValuation] = useState<any>(null);
  const [showAdvancedTradeDetails, setShowAdvancedTradeDetails] = useState<boolean>(false);

  // Initialize form when item opens
  useEffect(() => {
    if (item) {
      const defaultPrice =
        Number(item.salePrice) ||
        Math.round(item.purchasePrice * 1.2) ||
        item.purchasePrice + 200;

      const initialDate = item.saleDate || new Date().toISOString().split('T')[0];
      setSaleDate(initialDate);
      setCardFees(Number(item.cardFees) || 0);
      setNotes(item.notes || '');
      setBuyerInfo('');
      setAiTradeValuation(null);
      setShowAdvancedTradeDetails(false);

      // Pix Receipt initialization
      setPixReceiptUrl(item.pixReceiptUrl);
      setPixReceiptName(item.pixReceiptName);
      setPixReceiptDate(item.pixReceiptDate);
      setPixReceiptTransactionId(item.pixReceiptTransactionId);

      if (item.tradeIn && item.tradeIn.hasTradeIn) {
        setDealType(item.tradeIn.dealType || (item.tradeIn.cashReceived ? 'cash_and_trade' : 'trade_only'));
        setCashReceivedInTrade(Number(item.tradeIn.cashReceived) || 0);
        setTradeCategory(item.tradeIn.category || 'consoles_games');
        setTradeModel(item.tradeIn.model || '');
        setTradeBrand(item.tradeIn.brand || '');
        setTradeCondition(item.tradeIn.condition || 'seminovo_impecavel');
        setTradeSpecs(item.tradeIn.storageOrSpecs || '');
        setTradeAccessories(item.tradeIn.accessoriesIncluded || '');
        setTradeDescription(item.tradeIn.description || '');
        setTradeAttributedValue(Number(item.tradeIn.attributedValue) || 0);
        setTradeMarketPrice(Number(item.tradeIn.fipeValue) || 0);
        setTradePrepCost(Number(item.tradeIn.estimatedResaleCost) || 0);
        setTradeExpectedResalePrice(Number(item.tradeIn.expectedSalePrice) || 0);
      } else {
        setDealType('cash_only');
        setCashSalePrice(defaultPrice);
        setCashPaymentMethod(item.paymentMethod || 'pix');
        setCashReceivedInTrade(0);
        setTradeCategory('consoles_games');
        setTradeModel('');
        setTradeBrand('');
        setTradeCondition('seminovo_impecavel');
        setTradeSpecs('');
        setTradeAccessories('');
        setTradeDescription('');
        setTradeAttributedValue(0);
        setTradeMarketPrice(0);
        setTradePrepCost(0);
        setTradeExpectedResalePrice(0);
      }
    }
  }, [item, isOpen]);

  if (!isOpen || !item) return null;

  const categoryMeta = getCategoryInfo(item.category);
  const originalMetrics = calculateVehicleMetrics(item);
  const duration = getInventoryDurationDetails(item.purchaseDate, saleDate || new Date().toISOString().split('T')[0], true);

  // Auto calculate effective entry cost of the trade item
  const calculatedEffectiveCost = Math.max(
    0,
    originalMetrics.totalVehicleCost - (dealType === 'cash_and_trade' ? Number(cashReceivedInTrade) || 0 : 0)
  );

  // Function to call AI Trade Valuation API
  const handleQueryAiTradeValuation = async (overrideModel?: string) => {
    const modelToQuery = (overrideModel || tradeModel).trim();
    if (!modelToQuery) {
      alert('Por favor, informe o nome ou modelo do produto recebido na troca (ex: JBL Flip 6, iPhone 11, Xbox One S).');
      return;
    }

    setIsLoadingAiTrade(true);
    try {
      const res = await fetch('/api/ai/trade-valuation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tradeModel: modelToQuery,
          tradeCategory,
          tradeCondition,
          originalItemCost: originalMetrics.totalVehicleCost,
          originalItemModel: item.model,
          cashReceived: dealType === 'cash_and_trade' ? Number(cashReceivedInTrade) || 0 : 0,
          tradePrepCost: Number(tradePrepCost) || 0,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setAiTradeValuation(data);
        if (data.marketAveragePrice) {
          setTradeMarketPrice(data.marketAveragePrice);
        }
        if (data.suggestedResalePrice) {
          setTradeExpectedResalePrice(data.suggestedResalePrice);
        }
        if (data.effectiveEntryCost !== undefined) {
          setTradeAttributedValue(data.effectiveEntryCost);
        }
      }
    } catch (err) {
      console.error('Erro ao consultar avaliação da IA:', err);
    } finally {
      setIsLoadingAiTrade(false);
    }
  };

  // Real-time calculation analysis based on active deal type
  const tradeAnalysis = calculateTradeSaleDetails({
    dealType,
    originalItemCost: originalMetrics.totalVehicleCost,
    salePrice: dealType === 'cash_only' ? cashSalePrice : (dealType === 'cash_and_trade' ? cashReceivedInTrade + (tradeExpectedResalePrice || tradeMarketPrice || calculatedEffectiveCost) : (tradeExpectedResalePrice || tradeMarketPrice || calculatedEffectiveCost)),
    cashReceived: dealType === 'cash_only' ? cashSalePrice : (dealType === 'cash_and_trade' ? cashReceivedInTrade : 0),
    tradeItemModel: tradeModel || 'Item Recebido na Troca',
    tradeItemAttributedValue: calculatedEffectiveCost,
    tradeItemMarketPrice: tradeMarketPrice || (aiTradeValuation?.marketAveragePrice || 0),
    tradeItemPrepCost: tradePrepCost,
    expectedResalePrice: tradeExpectedResalePrice || (aiTradeValuation?.suggestedResalePrice || Math.round(calculatedEffectiveCost * 1.35)),
    cardFees: cardFees,
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!saleDate) {
      alert('Por favor, informe a data da venda.');
      return;
    }

    if (dealType === 'cash_only') {
      if (!cashSalePrice || cashSalePrice <= 0) {
        alert('Por favor, informe um valor de venda válido.');
        return;
      }
    } else {
      if (!tradeModel.trim()) {
        alert('Por favor, informe qual item/modelo foi recebido na troca.');
        return;
      }
      if (dealType === 'cash_and_trade' && cashReceivedInTrade < 0) {
        alert('Informe a quantia em dinheiro recebida no negócio.');
        return;
      }
    }

    // Build the sold item update
    const finalSalePrice =
      dealType === 'cash_only'
        ? Number(cashSalePrice)
        : dealType === 'cash_and_trade'
        ? Number(cashReceivedInTrade) + Number(tradeAttributedValue || tradeMarketPrice)
        : Number(tradeAttributedValue || tradeMarketPrice || originalMetrics.totalVehicleCost);

    const updatedSoldItem: BrickItem = {
      ...item,
      status: 'sold',
      saleDealType: dealType,
      salePrice: finalSalePrice,
      saleDate,
      cardFees: Number(cardFees) || 0,
      paymentMethod: dealType === 'cash_only' ? cashPaymentMethod : 'com_troca',
      salePaymentMethod: dealType === 'cash_only' ? cashPaymentMethod : tradePaymentMethod,
      pixReceiptUrl: pixReceiptUrl || undefined,
      pixReceiptName: pixReceiptName || undefined,
      pixReceiptDate: pixReceiptDate || undefined,
      pixReceiptTransactionId: pixReceiptTransactionId || undefined,
      notes: [
        notes.trim(),
        buyerInfo.trim() ? `Comprador: ${buyerInfo.trim()}` : '',
        dealType === 'cash_and_trade'
          ? `Vendido por R$ ${cashReceivedInTrade} em dinheiro + ${tradeModel} na troca (entrou com custo calculado de R$ ${tradeAnalysis.effectiveEntryCost}).`
          : dealType === 'trade_only'
          ? `Trocado direto pelo item "${tradeModel}" (entrou com custo calculado de R$ ${tradeAnalysis.effectiveEntryCost}).`
          : `Vendido somente em dinheiro por R$ ${cashSalePrice}.`,
      ]
        .filter(Boolean)
        .join(' | '),
      tradeIn:
        dealType !== 'cash_only'
          ? {
              hasTradeIn: true,
              dealType,
              cashReceived: dealType === 'cash_and_trade' ? Number(cashReceivedInTrade) : 0,
              model: tradeModel.trim(),
              brand: tradeBrand.trim() || undefined,
              category: tradeCategory,
              condition: tradeCondition,
              storageOrSpecs: tradeSpecs.trim() || undefined,
              accessoriesIncluded: tradeAccessories.trim() || undefined,
              description: tradeDescription.trim() || undefined,
              attributedValue: Number(tradeAttributedValue) || 0,
              fipeValue: Number(tradeMarketPrice) || 0,
              estimatedResaleCost: Number(tradePrepCost) || 0,
              expectedSalePrice: Number(tradeExpectedResalePrice) || tradeAnalysis.expectedResalePrice,
              effectiveEntryCost: tradeAnalysis.effectiveEntryCost,
              expectedResaleProfit: tradeAnalysis.expectedResaleProfit,
              expectedResaleMarginPercent: tradeAnalysis.expectedResaleMarginPercent,
            }
          : undefined,
      updatedAt: new Date().toISOString(),
    };

    // Optionally build the new inventory item if trade-in item was received
    let newInventoryItem: BrickItem | undefined = undefined;
    if (dealType !== 'cash_only' && autoAddToStock && tradeModel.trim()) {
      newInventoryItem = {
        id: `item_${Date.now()}_trade_${Math.random().toString(36).substring(2, 6)}`,
        userId: item.userId,
        category: tradeCategory,
        model: tradeModel.trim(),
        brand: tradeBrand.trim() || undefined,
        condition: tradeCondition,
        storageOrSpecs: tradeSpecs.trim() || undefined,
        accessoriesIncluded: tradeAccessories.trim() || undefined,
        status: 'in_stock',
        purchasePrice: tradeAnalysis.effectiveEntryCost, // Custo real de entrada calculado!
        fipeValue: Number(tradeMarketPrice) > 0 ? Number(tradeMarketPrice) : Math.round(tradeAnalysis.effectiveEntryCost * 1.3),
        paymentMethod: 'com_troca',
        assumedDebts: 0,
        purchaseDate: saleDate,
        distanceKm: 0,
        fuelExpense: 0,
        fuelPricePerLiter: 5.89,
        additionalLogistics: 0,
        mechanics: Number(tradePrepCost) || 0,
        bodyworkPaint: 0,
        detailing: 0,
        tiresWheels: 0,
        documentation: 0,
        commissions: 0,
        marketing: 0,
        hiddenDefectReservePercent: item.hiddenDefectReservePercent || 0,
        notes: `Entrou na troca da venda de "${item.model}" em ${formatDateBR(saleDate)}. Custo efetivo de entrada apurado: ${formatBRL(tradeAnalysis.effectiveEntryCost)}. ${tradeDescription}`.trim(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    const callback = onConfirmSale || onConfirm;
    if (callback) {
      callback(updatedSoldItem, newInventoryItem);
    }
    onClose();
  };

  const handleRevert = () => {
    if (confirm(`Deseja reverter o item "${item.model}" de volta para o status "Em Estoque"?`)) {
      if (onRevertToStock) {
        onRevertToStock({
          ...item,
          status: 'in_stock',
          saleDate: undefined,
          salePrice: undefined,
          saleDealType: undefined,
          salePaymentMethod: undefined,
          pixReceiptUrl: undefined,
          pixReceiptName: undefined,
          pixReceiptDate: undefined,
          pixReceiptTransactionId: undefined,
          tradeIn: undefined,
          updatedAt: new Date().toISOString(),
        });
      }
      onClose();
    }
  };

  return (
    <div
      id="mark-sold-modal-overlay"
      className="fixed inset-0 z-50 overflow-hidden bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-0 sm:p-4 md:p-6 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="mark-sold-modal-card"
        className="bg-slate-900 border-0 sm:border sm:border-slate-700/80 rounded-none sm:rounded-3xl w-full max-w-2xl h-[100dvh] sm:h-auto sm:max-h-[94vh] overflow-hidden shadow-2xl flex flex-col text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-xl font-bold shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-black text-white truncate">
                {item.status === 'sold' ? 'Editar Dados da Venda / Troca' : 'Marcar Item como Vendido'}
              </h2>
              <p className="text-xs text-slate-400 truncate">
                Apure o lucro líquido real, trocas e margem de revenda.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="w-6 h-6 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-5 pb-24 sm:pb-6">
          
          {/* Item Identification Card */}
          <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <span>{categoryMeta.emoji}</span>
                <span>{categoryMeta.name.split('(')[0]}</span>
              </span>
              <span className="text-xs text-slate-400 font-semibold">
                Custo de Entrada do seu Item: <strong className="text-amber-400 font-bold">{formatBRL(originalMetrics.totalVehicleCost)}</strong>
              </span>
            </div>

            <h3 className="text-base sm:text-sm font-black text-white">
              {item.model}
            </h3>

            <div className="text-xs text-slate-400 flex flex-wrap items-center gap-2">
              {item.brand && <span>{item.brand}</span>}
              {item.storageOrSpecs && <span>• {item.storageOrSpecs}</span>}
              {item.plate && <span className="font-mono bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">• Placa: {item.plate}</span>}
            </div>

            {/* Inventory Duration bar */}
            <div className="flex items-center justify-between bg-slate-900/80 px-3.5 sm:px-4 py-2.5 rounded-xl border border-slate-800 gap-2 mt-2">
              <div className="text-left text-[11px]">
                <div className="text-[10px] uppercase font-bold text-slate-500">Entrada</div>
                <div className="font-bold text-slate-200">{duration.startDateFormatted}</div>
              </div>
              <div className="flex flex-col items-center px-1">
                <span className="text-xs font-black text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                  {duration.days} {duration.days === 1 ? 'dia' : 'dias'} de giro
                </span>
              </div>
              <div className="text-right text-[11px]">
                <div className="text-[10px] uppercase font-bold text-slate-500">Venda</div>
                <div className="font-bold text-emerald-400">{duration.endDateFormatted}</div>
              </div>
            </div>
          </div>

          {/* 3 DEAL TYPE SELECTOR TABS */}
          <div className="space-y-2">
            <label className="block text-xs font-black text-slate-200">
              Como foi fechado o negócio? *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              
              {/* Option 1: Cash Only */}
              <button
                type="button"
                onClick={() => setDealType('cash_only')}
                className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between gap-1.5 min-h-[72px] ${
                  dealType === 'cash_only'
                    ? 'bg-emerald-500/15 border-emerald-500 text-white shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/30'
                    : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-lg">💵</span>
                  {dealType === 'cash_only' && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  )}
                </div>
                <div>
                  <div className={`text-xs font-black ${dealType === 'cash_only' ? 'text-emerald-300' : 'text-slate-200'}`}>
                    Somente Dinheiro
                  </div>
                  <div className="text-[10px] text-slate-400 leading-tight mt-0.5">
                    100% à vista, PIX ou cartão
                  </div>
                </div>
              </button>

              {/* Option 2: Cash + Trade */}
              <button
                type="button"
                onClick={() => setDealType('cash_and_trade')}
                className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between gap-1.5 min-h-[72px] ${
                  dealType === 'cash_and_trade'
                    ? 'bg-amber-500/15 border-amber-500 text-white shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/30'
                    : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-lg">🔄</span>
                  {dealType === 'cash_and_trade' && (
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  )}
                </div>
                <div>
                  <div className={`text-xs font-black ${dealType === 'cash_and_trade' ? 'text-amber-300' : 'text-slate-200'}`}>
                    Dinheiro + Troca
                  </div>
                  <div className="text-[10px] text-slate-400 leading-tight mt-0.5">
                    Volta em dinheiro + Produto
                  </div>
                </div>
              </button>

              {/* Option 3: Trade Only */}
              <button
                type="button"
                onClick={() => setDealType('trade_only')}
                className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between gap-1.5 min-h-[72px] ${
                  dealType === 'trade_only'
                    ? 'bg-sky-500/15 border-sky-500 text-white shadow-lg shadow-sky-500/10 ring-1 ring-sky-500/30'
                    : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-lg">🔁</span>
                  {dealType === 'trade_only' && (
                    <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
                  )}
                </div>
                <div>
                  <div className={`text-xs font-black ${dealType === 'trade_only' ? 'text-sky-300' : 'text-slate-200'}`}>
                    Somente Troca (Rolo)
                  </div>
                  <div className="text-[10px] text-slate-400 leading-tight mt-0.5">
                    Sem dinheiro / Troca direta
                  </div>
                </div>
              </button>

            </div>
          </div>

          {/* DYNAMIC FORM FIELDS */}

          {/* MODE 1: CASH ONLY FIELDS */}
          {dealType === 'cash_only' && (
            <div className="bg-slate-950/60 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center gap-2 text-xs font-black text-emerald-400 uppercase tracking-wider">
                <span>💵</span> Dados da Venda em Dinheiro
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-black text-emerald-400 mb-1.5">
                    Valor Total da Venda (R$) *
                  </label>
                  <input
                    type="number"
                    value={cashSalePrice || ''}
                    onChange={(e) => setCashSalePrice(Number(e.target.value))}
                    placeholder="Ex: 1800"
                    required
                    className="w-full px-3.5 py-3 sm:py-2.5 bg-slate-900 border-2 border-emerald-500/50 rounded-xl text-base sm:text-sm font-black text-white focus:outline-none focus:border-emerald-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1.5">
                    Data da Venda *
                  </label>
                  <input
                    type="date"
                    value={saleDate}
                    onChange={(e) => setSaleDate(e.target.value)}
                    required
                    className="w-full px-3.5 py-3 sm:py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-base sm:text-sm font-bold text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1.5">
                    Forma de Pagamento
                  </label>
                  <select
                    value={cashPaymentMethod}
                    onChange={(e) => setCashPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full px-3 py-3 sm:py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-base sm:text-sm text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="pix">⚡ PIX no Ato</option>
                    <option value="a_vista">💵 Dinheiro À Vista</option>
                    <option value="cartao_parcelado">💳 Cartão de Crédito</option>
                    <option value="assume_divida">📑 Assumiu Dívida</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1.5">
                    Taxas de Maquininha / Cartão (R$)
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={cardFees || ''}
                    onChange={(e) => setCardFees(Number(e.target.value))}
                    className="w-full px-3.5 py-3 sm:py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-base sm:text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Upload Comprovante PIX (quando selecionado PIX ou se já tiver comprovante anexado) */}
              {(cashPaymentMethod === 'pix' || pixReceiptUrl) && (
                <div className="pt-2">
                  <PixReceiptUploader
                    receiptUrl={pixReceiptUrl}
                    receiptName={pixReceiptName}
                    receiptDate={pixReceiptDate}
                    transactionId={pixReceiptTransactionId}
                    onChange={(data) => {
                      setPixReceiptUrl(data.receiptUrl);
                      setPixReceiptName(data.receiptName);
                      setPixReceiptDate(data.receiptDate);
                      setPixReceiptTransactionId(data.transactionId);
                    }}
                    onPreview={(url, name) => setPreviewPixReceipt({ url, name })}
                  />
                </div>
              )}
            </div>
          )}

          {/* MODE 2: CASH + TRADE FIELDS */}
          {dealType === 'cash_and_trade' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              
              {/* Cash Portion */}
              <div className="bg-slate-950/60 p-4 sm:p-5 rounded-2xl border border-amber-500/20 space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-black text-amber-400 uppercase tracking-wider">
                    <span>💰</span> Parte 1: Dinheiro Recebido no Negócio
                  </div>
                  <span className="text-[11px] text-amber-300/80 font-medium">
                    Entrada no PIX / Dinheiro
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-black text-amber-400 mb-1.5">
                      Quanto você pegou em dinheiro / PIX? (Volta em R$) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-400 font-black text-lg">R$</span>
                      <input
                        type="number"
                        value={cashReceivedInTrade || ''}
                        onChange={(e) => setCashReceivedInTrade(Number(e.target.value))}
                        placeholder="Ex: 100"
                        required
                        className="w-full pl-11 pr-3.5 py-3 sm:py-3 bg-slate-900 border-2 border-amber-500/50 rounded-xl text-lg sm:text-base font-black text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Este valor será abatido automaticamente do seu custo original de {formatBRL(originalMetrics.totalVehicleCost)}.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-200 mb-1.5">
                      Data do Fechamento *
                    </label>
                    <input
                      type="date"
                      value={saleDate}
                      onChange={(e) => setSaleDate(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm font-bold text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-200 mb-1.5">
                      Forma de Recebimento
                    </label>
                    <select
                      value={tradePaymentMethod}
                      onChange={(e) => setTradePaymentMethod(e.target.value as PaymentMethod)}
                      className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                    >
                      <option value="pix">⚡ PIX no Ato</option>
                      <option value="a_vista">💵 Dinheiro Vivo</option>
                      <option value="cartao_parcelado">💳 Cartão de Crédito</option>
                    </select>
                  </div>
                </div>

                {/* Upload Comprovante PIX (Troca com volta no Pix) */}
                {(tradePaymentMethod === 'pix' || pixReceiptUrl) && (
                  <div className="pt-2">
                    <PixReceiptUploader
                      receiptUrl={pixReceiptUrl}
                      receiptName={pixReceiptName}
                      receiptDate={pixReceiptDate}
                      transactionId={pixReceiptTransactionId}
                      onChange={(data) => {
                        setPixReceiptUrl(data.receiptUrl);
                        setPixReceiptName(data.receiptName);
                        setPixReceiptDate(data.receiptDate);
                        setPixReceiptTransactionId(data.transactionId);
                      }}
                      onPreview={(url, name) => setPreviewPixReceipt({ url, name })}
                    />
                  </div>
                )}
              </div>

              {/* Trade Item Details with AI Market Search */}
              <div className="bg-slate-950/70 p-4 sm:p-5 rounded-2xl border-2 border-sky-500/30 space-y-4 shadow-lg shadow-sky-950/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-black text-sky-400 uppercase tracking-wider">
                    <span>🔄</span> Parte 2: Produto Recebido na Troca
                  </div>
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-400 font-bold border border-sky-500/20 flex items-center gap-1">
                    <Globe className="w-3 h-3" /> Média da Internet
                  </span>
                </div>

                {/* Model / Name Input + AI Button */}
                <div className="space-y-2">
                  <label className="block text-xs font-black text-sky-300">
                    Qual produto você pegou em formato de troca? (Nome / Modelo) *
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        placeholder="Ex: Xbox One S 500GB, iPhone 11 64GB, JBL Flip 6, TV Samsung 43..."
                        value={tradeModel}
                        onChange={(e) => setTradeModel(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleQueryAiTradeValuation();
                          }
                        }}
                        required
                        className="w-full px-3.5 py-3 bg-slate-900 border-2 border-sky-500/50 rounded-xl text-base sm:text-sm font-bold text-white placeholder-slate-500 focus:outline-none focus:border-sky-400"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleQueryAiTradeValuation()}
                      disabled={isLoadingAiTrade || !tradeModel.trim()}
                      className="px-4 py-3 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs sm:text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition-all shrink-0 active:scale-95"
                    >
                      {isLoadingAiTrade ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-sky-200" />
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
                  <p className="text-[11px] text-slate-400">
                    A IA puxa a média de anúncios da OLX, Marketplace e Mercado Livre e calcula automaticamente o custo de entrada e o lucro da operação!
                  </p>
                </div>

                {/* AUTOMATED CALCULATION & AI RESULTS PANEL */}
                <div className="bg-gradient-to-br from-slate-900/90 to-slate-950/90 p-4 rounded-xl border border-sky-500/30 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-black text-white flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      Cálculo Automático do Negócio
                    </span>
                    <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-bold">
                      Sem necessidade de contas manuais
                    </span>
                  </div>

                  {/* Summary Metric Badges */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-slate-400 font-medium block">Custo de Entrada</span>
                      <span className="text-sm font-black text-amber-400 block">
                        {formatBRL(calculatedEffectiveCost)}
                      </span>
                      <span className="text-[9px] text-slate-500 block">
                        {formatBRL(originalMetrics.totalVehicleCost)} - {formatBRL(cashReceivedInTrade)}
                      </span>
                    </div>

                    <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-slate-400 font-medium block">Média na Internet</span>
                      <span className="text-sm font-black text-sky-400 block">
                        {tradeMarketPrice > 0 ? formatBRL(tradeMarketPrice) : 'Calculando...'}
                      </span>
                      <span className="text-[9px] text-slate-500 block">
                        OLX / Marketplace
                      </span>
                    </div>

                    <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-slate-400 font-medium block">Preço de Revenda</span>
                      <span className="text-sm font-black text-emerald-400 block">
                        {tradeExpectedResalePrice > 0 ? formatBRL(tradeExpectedResalePrice) : (tradeMarketPrice > 0 ? formatBRL(Math.round(tradeMarketPrice * 0.95)) : formatBRL(Math.round(calculatedEffectiveCost * 1.35)))}
                      </span>
                      <span className="text-[9px] text-slate-500 block">
                        Venda rápida
                      </span>
                    </div>

                    <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-slate-400 font-medium block">Lucro Líquido Previsto</span>
                      <span className="text-sm font-black text-emerald-400 block">
                        +{formatBRL(tradeAnalysis.expectedResaleProfit)}
                      </span>
                      <span className="text-[9px] text-emerald-400/80 font-bold block">
                        {tradeAnalysis.expectedResaleMarginPercent.toFixed(1)}% de margem
                      </span>
                    </div>
                  </div>

                  {/* AI Verdict Text Box */}
                  {aiTradeValuation && aiTradeValuation.aiAnalysisVerdict && (
                    <div className="bg-sky-950/30 p-3 rounded-lg border border-sky-500/30 text-xs text-sky-200 leading-relaxed">
                      <p className="font-semibold text-white mb-1 flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3 text-sky-400" /> Diagnóstico do Negócio pela IA:
                      </p>
                      <p className="text-sky-200/90">{aiTradeValuation.aiAnalysisVerdict}</p>
                      {aiTradeValuation.tacticalTip && (
                        <p className="text-[11px] text-amber-300/90 mt-1.5 pt-1.5 border-t border-sky-500/20 font-medium">
                          💡 Dica de Venda: {aiTradeValuation.tacticalTip}
                        </p>
                      )}
                    </div>
                  )}

                  {!aiTradeValuation && tradeModel.trim().length > 2 && !isLoadingAiTrade && (
                    <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">
                        Clique em <strong>"Calcular com IA"</strong> para puxar o preço de mercado exato do seu {tradeModel}!
                      </span>
                      <button
                        type="button"
                        onClick={() => handleQueryAiTradeValuation()}
                        className="text-[11px] text-sky-400 font-bold hover:underline"
                      >
                        Avaliar agora →
                      </button>
                    </div>
                  )}
                </div>

                {/* ACCORDION: ADVANCED / OPTIONAL PRODUCT DETAILS */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAdvancedTradeDetails(!showAdvancedTradeDetails)}
                    className="w-full flex items-center justify-between py-2 px-3 bg-slate-900/60 hover:bg-slate-900 text-xs text-slate-400 hover:text-slate-200 rounded-xl transition-colors border border-slate-800"
                  >
                    <span className="font-semibold flex items-center gap-1.5">
                      ⚙️ Opções e Ajustes Opcionais do Produto (Opcional)
                    </span>
                    {showAdvancedTradeDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  {showAdvancedTradeDetails && (
                    <div className="mt-3 p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 space-y-3 animate-in fade-in duration-150">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1">
                            Categoria do Item
                          </label>
                          <select
                            value={tradeCategory}
                            onChange={(e) => setTradeCategory(e.target.value as ItemCategory)}
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                          >
                            {CATEGORIES_LIST.map((cat) => (
                              <option key={cat.id} value={cat.id}>
                                {cat.emoji} {cat.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1">
                            Estado de Conservação
                          </label>
                          <select
                            value={tradeCondition}
                            onChange={(e) => setTradeCondition(e.target.value as ItemCondition)}
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                          >
                            <option value="novo_lacrado">✨ Novo Lacrado</option>
                            <option value="seminovo_impecavel">💎 Seminovo Impecável</option>
                            <option value="usado_bom">👍 Usado Bom</option>
                            <option value="com_detalhes">⚠️ Com Detalhes</option>
                            <option value="para_conserto_pecas">🛠️ Para Conserto / Peças</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1">
                            Preço Médio de Mercado Manual (R$)
                          </label>
                          <input
                            type="number"
                            placeholder="Ex: 450"
                            value={tradeMarketPrice || ''}
                            onChange={(e) => setTradeMarketPrice(Number(e.target.value))}
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1">
                            Preço que Pretende Revender (R$)
                          </label>
                          <input
                            type="number"
                            placeholder="Ex: 420"
                            value={tradeExpectedResalePrice || ''}
                            onChange={(e) => setTradeExpectedResalePrice(Number(e.target.value))}
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1">
                            Custo de Limpeza / Revisão (R$)
                          </label>
                          <input
                            type="number"
                            placeholder="0"
                            value={tradePrepCost || ''}
                            onChange={(e) => setTradePrepCost(Number(e.target.value))}
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1">
                            Acessórios / Cabos / Caixa
                          </label>
                          <input
                            type="text"
                            placeholder="Ex: Cabo original, caixa, manual"
                            value={tradeAccessories}
                            onChange={(e) => setTradeAccessories(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

              </div>

            </div>
          )}

          {/* MODE 3: TRADE ONLY FIELDS */}
          {dealType === 'trade_only' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              
              <div className="bg-slate-950/70 p-4 sm:p-5 rounded-2xl border-2 border-sky-500/30 space-y-4 shadow-lg shadow-sky-950/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-black text-sky-400 uppercase tracking-wider">
                    <span>🔁</span> Troca Direta (Sem Dinheiro)
                  </div>
                  <span className="text-[11px] text-amber-400 font-bold px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                    Custo migrado: {formatBRL(originalMetrics.totalVehicleCost)}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-200 mb-1.5">
                      Data da Troca *
                    </label>
                    <input
                      type="date"
                      value={saleDate}
                      onChange={(e) => setSaleDate(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm font-bold text-white focus:outline-none focus:border-sky-500 cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-200 mb-1.5">
                      Categoria do Item Recebido
                    </label>
                    <select
                      value={tradeCategory}
                      onChange={(e) => setTradeCategory(e.target.value as ItemCategory)}
                      className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-sky-500 cursor-pointer font-semibold"
                    >
                      {CATEGORIES_LIST.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.emoji} {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Model / Name Input + AI Button */}
                <div className="space-y-2">
                  <label className="block text-xs font-black text-sky-300">
                    Qual produto você pegou em formato de troca? (Nome / Modelo) *
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        placeholder="Ex: PlayStation 4 Slim 500GB, iPhone 12 128GB, Smart TV 50..."
                        value={tradeModel}
                        onChange={(e) => setTradeModel(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleQueryAiTradeValuation();
                          }
                        }}
                        required
                        className="w-full px-3.5 py-3 bg-slate-900 border-2 border-sky-500/50 rounded-xl text-base sm:text-sm font-bold text-white placeholder-slate-500 focus:outline-none focus:border-sky-400"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleQueryAiTradeValuation()}
                      disabled={isLoadingAiTrade || !tradeModel.trim()}
                      className="px-4 py-3 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs sm:text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition-all shrink-0 active:scale-95"
                    >
                      {isLoadingAiTrade ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-sky-200" />
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

                {/* AUTOMATED CALCULATION & AI RESULTS PANEL */}
                <div className="bg-gradient-to-br from-slate-900/90 to-slate-950/90 p-4 rounded-xl border border-sky-500/30 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-black text-white flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      Cálculo Automático de Troca Direta
                    </span>
                    <span className="text-[10px] text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full font-bold">
                      Custo 100% transferido
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-slate-400 font-medium block">Custo de Entrada</span>
                      <span className="text-sm font-black text-amber-400 block">
                        {formatBRL(originalMetrics.totalVehicleCost)}
                      </span>
                      <span className="text-[9px] text-slate-500 block">
                        Custo original do item
                      </span>
                    </div>

                    <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-slate-400 font-medium block">Média na Internet</span>
                      <span className="text-sm font-black text-sky-400 block">
                        {tradeMarketPrice > 0 ? formatBRL(tradeMarketPrice) : 'Calculando...'}
                      </span>
                      <span className="text-[9px] text-slate-500 block">
                        OLX / Marketplace
                      </span>
                    </div>

                    <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-slate-400 font-medium block">Preço de Revenda</span>
                      <span className="text-sm font-black text-emerald-400 block">
                        {tradeExpectedResalePrice > 0 ? formatBRL(tradeExpectedResalePrice) : (tradeMarketPrice > 0 ? formatBRL(Math.round(tradeMarketPrice * 0.95)) : formatBRL(Math.round(originalMetrics.totalVehicleCost * 1.35)))}
                      </span>
                      <span className="text-[9px] text-slate-500 block">
                        Venda rápida
                      </span>
                    </div>

                    <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-slate-400 font-medium block">Lucro Líquido Previsto</span>
                      <span className="text-sm font-black text-emerald-400 block">
                        +{formatBRL(tradeAnalysis.expectedResaleProfit)}
                      </span>
                      <span className="text-[9px] text-emerald-400/80 font-bold block">
                        {tradeAnalysis.expectedResaleMarginPercent.toFixed(1)}% de margem
                      </span>
                    </div>
                  </div>

                  {aiTradeValuation && aiTradeValuation.aiAnalysisVerdict && (
                    <div className="bg-sky-950/30 p-3 rounded-lg border border-sky-500/30 text-xs text-sky-200 leading-relaxed">
                      <p className="font-semibold text-white mb-1 flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3 text-sky-400" /> Diagnóstico do Negócio pela IA:
                      </p>
                      <p className="text-sky-200/90">{aiTradeValuation.aiAnalysisVerdict}</p>
                    </div>
                  )}
                </div>

                {/* ACCORDION: ADVANCED DETAILS */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAdvancedTradeDetails(!showAdvancedTradeDetails)}
                    className="w-full flex items-center justify-between py-2 px-3 bg-slate-900/60 hover:bg-slate-900 text-xs text-slate-400 hover:text-slate-200 rounded-xl transition-colors border border-slate-800"
                  >
                    <span className="font-semibold flex items-center gap-1.5">
                      ⚙️ Opções e Ajustes Opcionais do Produto (Opcional)
                    </span>
                    {showAdvancedTradeDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  {showAdvancedTradeDetails && (
                    <div className="mt-3 p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 space-y-3 animate-in fade-in duration-150">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1">
                            Estado de Conservação
                          </label>
                          <select
                            value={tradeCondition}
                            onChange={(e) => setTradeCondition(e.target.value as ItemCondition)}
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                          >
                            <option value="novo_lacrado">✨ Novo Lacrado</option>
                            <option value="seminovo_impecavel">💎 Seminovo Impecável</option>
                            <option value="usado_bom">👍 Usado Bom</option>
                            <option value="com_detalhes">⚠️ Com Detalhes</option>
                            <option value="para_conserto_pecas">🛠️ Para Conserto / Peças</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1">
                            Preço Médio de Mercado Manual (R$)
                          </label>
                          <input
                            type="number"
                            placeholder="Ex: 1400"
                            value={tradeMarketPrice || ''}
                            onChange={(e) => setTradeMarketPrice(Number(e.target.value))}
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1">
                            Preço que Pretende Revender (R$)
                          </label>
                          <input
                            type="number"
                            placeholder="Ex: 1350"
                            value={tradeExpectedResalePrice || ''}
                            onChange={(e) => setTradeExpectedResalePrice(Number(e.target.value))}
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1">
                            Custo de Limpeza / Revisão (R$)
                          </label>
                          <input
                            type="number"
                            placeholder="0"
                            value={tradePrepCost || ''}
                            onChange={(e) => setTradePrepCost(Number(e.target.value))}
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

              </div>

            </div>
          )}

          {/* COMPRADOR E OBSERVAÇÕES GERAIS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1.5">
                Nome do Comprador / Cliente (Opcional)
              </label>
              <input
                type="text"
                placeholder="Ex: Paulo Mendes (WhatsApp)"
                value={buyerInfo}
                onChange={(e) => setBuyerInfo(e.target.value)}
                className="w-full px-3.5 py-3 sm:py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-base sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-slate-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1.5">
                Notas / Local de Entrega (Opcional)
              </label>
              <input
                type="text"
                placeholder="Ex: Entregue no metrô, cliente testou na hora..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-3 sm:py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-base sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-slate-500"
              />
            </div>
          </div>

          {/* REAL-TIME FINANCIAL ANALYSIS DASHBOARD FOR THE USER */}

          {/* 1. SE FOR SOMENTE EM DINHEIRO */}
          {dealType === 'cash_only' && (
            <div className="bg-gradient-to-br from-emerald-950/40 via-slate-950 to-slate-900 p-4 sm:p-5 rounded-2xl border border-emerald-500/40 space-y-3 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  Apuração de Lucro Líquido
                </span>
                <span className="text-[11px] text-slate-400">
                  Custo: {formatBRL(originalMetrics.totalVehicleCost)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-slate-900/90 p-3.5 rounded-xl border border-slate-800">
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Lucro Líquido no Bolso</div>
                  <div className={`text-xl font-black ${tradeAnalysis.combinedNetProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {formatBRL(tradeAnalysis.combinedNetProfit)}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Margem Líquida Real</div>
                  <div className={`text-xl font-black ${tradeAnalysis.combinedMarginPercent >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {formatPercent(tradeAnalysis.combinedMarginPercent)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. SE FOR DINHEIRO + TROCA OU SOMENTE TROCA (CÁLCULO AUTOMÁTICO DE ENTRADA DO NOVO ITEM) */}
          {dealType !== 'cash_only' && (
            <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950/40 p-4 sm:p-5 rounded-2xl border-2 border-sky-500/40 space-y-4 shadow-xl">
              
              <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
                  <div>
                    <h4 className="text-sm font-black text-white">
                      Cálculo Automático de Entrada do Item Recebido
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      O sistema calculou exatamente por quanto o novo item entrou para você
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-300 text-[10px] font-extrabold">
                  ⚡ Auto-Calculado
                </span>
              </div>

              {/* Breakdown Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                
                {/* 1. Por quanto entrou */}
                <div className="bg-slate-950/90 p-3.5 rounded-xl border border-amber-500/30">
                  <div className="text-[10px] uppercase font-bold text-amber-400">
                    Custo Real de Entrada
                  </div>
                  <div className="text-lg font-black text-amber-300 mt-0.5">
                    {formatBRL(tradeAnalysis.effectiveEntryCost)}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 leading-tight">
                    {dealType === 'cash_and_trade'
                      ? `Custo residual (R$ ${originalMetrics.totalVehicleCost} - R$ ${cashReceivedInTrade} recebidos)`
                      : `Custo total do item entregue migrado`}
                  </div>
                </div>

                {/* 2. Custo total com revisão */}
                <div className="bg-slate-950/90 p-3.5 rounded-xl border border-slate-800">
                  <div className="text-[10px] uppercase font-bold text-slate-400">
                    Total Investido no Item
                  </div>
                  <div className="text-lg font-black text-white mt-0.5">
                    {formatBRL(tradeAnalysis.totalInvestedInTradeItem)}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 leading-tight">
                    Entrada + R$ {tradePrepCost} de revisão
                  </div>
                </div>

                {/* 3. Margem na Revenda do Item Recebido */}
                <div className="bg-slate-950/90 p-3.5 rounded-xl border border-emerald-500/30">
                  <div className="text-[10px] uppercase font-bold text-emerald-400">
                    Lucro Previsto na Revenda
                  </div>
                  <div className="text-lg font-black text-emerald-400 mt-0.5">
                    {formatBRL(tradeAnalysis.expectedResaleProfit)}
                  </div>
                  <div className="text-[10px] font-bold text-emerald-300 mt-1">
                    Margem: {formatPercent(tradeAnalysis.expectedResaleMarginPercent)} ao vender por {formatBRL(tradeAnalysis.expectedResalePrice)}
                  </div>
                </div>

              </div>

              {/* Consolidated Operation Summary */}
              <div className="bg-slate-950/95 p-3.5 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5 text-center sm:text-left">
                  <div className="text-[11px] font-bold text-slate-300">
                    🏆 Lucro Consolidado da Operação Inteira:
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {dealType === 'cash_and_trade'
                      ? `R$ ${cashReceivedInTrade} (dinheiro já recebido) + ${formatBRL(tradeAnalysis.expectedResalePrice)} (revenda) - Custos Totais`
                      : `Revenda do item (${formatBRL(tradeAnalysis.expectedResalePrice)}) - Custos Totais`}
                  </div>
                </div>
                <div className="text-right flex items-center gap-2">
                  <span className="text-lg font-black text-emerald-400">
                    {formatBRL(tradeAnalysis.combinedNetProfit)}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                    +{formatPercent(tradeAnalysis.combinedMarginPercent)}
                  </span>
                </div>
              </div>

              {/* 1-Click Action: Auto Add to Stock Switch */}
              <div className="bg-sky-950/30 p-3.5 rounded-xl border border-sky-500/30 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold shrink-0">
                    <PackagePlus className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-black text-sky-300">
                      Adicionar item recebido ao Estoque automaticamente
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Já cadastra "{tradeModel || 'Novo Item'}" como produto ativo com o custo de entrada calculado de {formatBRL(tradeAnalysis.effectiveEntryCost)}.
                    </div>
                  </div>
                </div>

                <input
                  type="checkbox"
                  checked={autoAddToStock}
                  onChange={(e) => setAutoAddToStock(e.target.checked)}
                  className="w-5 h-5 accent-sky-500 rounded cursor-pointer shrink-0"
                />
              </div>

            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-800">
            {item.status === 'sold' && onRevertToStock ? (
              <button
                type="button"
                onClick={handleRevert}
                className="px-3.5 py-3 rounded-xl border border-slate-700 hover:border-amber-500/50 bg-slate-800 text-amber-400 hover:text-amber-300 text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 min-h-[44px]"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Voltar para Estoque</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-3 rounded-xl border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 text-xs sm:text-sm font-bold transition-all min-h-[44px]"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-emerald-500/20 hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5 min-h-[44px]"
              >
                <CheckCircle2 className="w-4 h-4 stroke-[3]" />
                <span>Confirmar Fechamento</span>
              </button>
            </div>
          </div>

        </form>
      </div>

      {/* Pix Receipt Viewer Lightbox */}
      {previewPixReceipt && (
        <ImageViewerModal
          isOpen={!!previewPixReceipt}
          onClose={() => setPreviewPixReceipt(null)}
          photos={[previewPixReceipt.url]}
          title={`Comprovante PIX - ${item.model}`}
          isPixReceipt={true}
          fileName={previewPixReceipt.name}
        />
      )}
    </div>
  );
};
