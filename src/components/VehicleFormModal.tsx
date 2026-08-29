import React, { useState, useEffect } from 'react';
import { BrickItem, ItemCategory, ItemCondition, PaymentMethod, ItemStatus } from '../types';
import {
  calculateVehicleMetrics,
  formatBRL,
  formatPercent,
  getInventoryDurationDetails,
} from '../utils/calculations';
import { CATEGORIES_CONFIG, CATEGORIES_LIST, ITEM_PRESETS, getCategoryInfo } from '../utils/categories';
import { PhotoUploader } from './PhotoUploader';
import { ImageViewerModal } from './ImageViewerModal';
import {
  X,
  Sparkles,
  DollarSign,
  Package,
  Wrench,
  Truck,
  Repeat,
  Info,
  Check,
  Gamepad2,
  Smartphone,
  Tv,
  Car,
  Laptop,
  Flame,
  Zap,
  Trash2,
  Clock,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
} from 'lucide-react';

interface VehicleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: BrickItem) => void;
  onDelete?: (id: string) => void;
  initialVehicle?: BrickItem | null;
}

const defaultItem: Partial<BrickItem> = {
  category: 'consoles_games',
  model: '',
  brand: '',
  condition: 'seminovo_impecavel',
  storageOrSpecs: '',
  accessoriesIncluded: '',
  serialOrImei: '',
  status: 'in_stock',
  purchasePrice: 1500,
  fipeValue: 2200,
  paymentMethod: 'pix',
  assumedDebts: 0,
  purchaseDate: new Date().toISOString().split('T')[0],
  distanceKm: 20,
  fuelExpense: 30,
  fuelPricePerLiter: 5.89,
  avgConsumptionKmPerLiter: 12,
  additionalLogistics: 0,
  mechanics: 0,
  bodyworkPaint: 0,
  detailing: 40,
  tiresWheels: 0,
  documentation: 0,
  commissions: 0,
  marketing: 30,
  hiddenDefectReservePercent: 3.0,
  notes: '',
  salePrice: 2150,
  cardFees: 0,
  photos: [],
  yearModel: '',
  plate: '',
  color: '',
  mileage: 0,
  tradeIn: {
    hasTradeIn: false,
    model: '',
    attributedValue: 0,
    fipeValue: 0,
    estimatedResaleCost: 0,
  },
};

export const VehicleFormModal: React.FC<VehicleFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialVehicle,
}) => {
  const [formData, setFormData] = useState<Partial<BrickItem>>(defaultItem);
  const [activeSection, setActiveSection] = useState<'A' | 'B' | 'C' | 'D'>('A');
  const [previewPhotoIndex, setPreviewPhotoIndex] = useState<number | null>(null);

  useEffect(() => {
    if (initialVehicle) {
      const existingPhotos = initialVehicle.photos || (initialVehicle.photoUrl ? [initialVehicle.photoUrl] : []);
      setFormData({
        ...initialVehicle,
        photos: existingPhotos,
        category: initialVehicle.category || (initialVehicle.plate ? 'vehicles' : 'other'),
        tradeIn: initialVehicle.tradeIn || {
          hasTradeIn: false,
          model: '',
          attributedValue: 0,
          fipeValue: 0,
          estimatedResaleCost: 0,
        },
      });
    } else {
      setFormData({
        ...defaultItem,
        photos: [],
        id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        purchaseDate: new Date().toISOString().split('T')[0],
      });
    }
    setActiveSection('A');
  }, [initialVehicle, isOpen]);

  if (!isOpen) return null;

  const currentCategory = getCategoryInfo(formData.category);
  const isVehicleCategory = formData.category === 'vehicles';

  const handleDeleteItem = () => {
    if (initialVehicle && onDelete) {
      if (confirm(`Deseja realmente excluir permanentemente "${initialVehicle.model}" do seu BRICK?`)) {
        onDelete(initialVehicle.id);
        onClose();
      }
    }
  };

  const handleChange = (field: keyof BrickItem, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleTradeInChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      tradeIn: {
        ...(prev.tradeIn || {
          hasTradeIn: true,
          model: '',
          attributedValue: 0,
          fipeValue: 0,
          estimatedResaleCost: 0,
        }),
        [field]: value,
      },
    }));
  };

  const applyPreset = (preset: typeof ITEM_PRESETS[0]) => {
    setFormData((prev) => ({
      ...prev,
      category: preset.category,
      model: preset.model,
      brand: preset.brand,
      storageOrSpecs: preset.storageOrSpecs,
      accessoriesIncluded: preset.accessoriesIncluded,
      purchasePrice: preset.purchasePrice,
      fipeValue: preset.fipeValue,
      condition: preset.condition,
      mechanics: preset.prepCosts.mechanics,
      detailing: preset.prepCosts.detailing,
      marketing: preset.prepCosts.marketing,
      hiddenDefectReservePercent: preset.prepCosts.reservePercent,
      salePrice: Math.round(preset.fipeValue * 0.95),
    }));
  };

  // Compute live metrics
  const itemForMetrics: BrickItem = {
    ...(formData as BrickItem),
    id: formData.id || 'temp',
    userId: formData.userId || 'current',
    category: formData.category || 'other',
    model: formData.model || 'Novo Item',
    status: (formData.status as ItemStatus) || 'in_stock',
    purchasePrice: Number(formData.purchasePrice) || 0,
    fipeValue: Number(formData.fipeValue) || 1,
    paymentMethod: formData.paymentMethod || 'pix',
    assumedDebts: Number(formData.assumedDebts) || 0,
    purchaseDate: formData.purchaseDate || new Date().toISOString().split('T')[0],
    distanceKm: Number(formData.distanceKm) || 0,
    fuelExpense: Number(formData.fuelExpense) || 0,
    fuelPricePerLiter: Number(formData.fuelPricePerLiter) || 5.89,
    additionalLogistics: Number(formData.additionalLogistics) || 0,
    mechanics: Number(formData.mechanics) || 0,
    bodyworkPaint: Number(formData.bodyworkPaint) || 0,
    detailing: Number(formData.detailing) || 0,
    tiresWheels: Number(formData.tiresWheels) || 0,
    documentation: Number(formData.documentation) || 0,
    commissions: Number(formData.commissions) || 0,
    marketing: Number(formData.marketing) || 0,
    hiddenDefectReservePercent: Number(formData.hiddenDefectReservePercent) || 0,
    photos: formData.photos || [],
    photoUrl: (formData.photos && formData.photos.length > 0) ? formData.photos[0] : (formData.photoUrl || undefined),
    createdAt: formData.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const metrics = calculateVehicleMetrics(itemForMetrics);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.model?.trim()) {
      setActiveSection('A');
      alert('Por favor, informe o nome ou modelo do produto.');
      return;
    }
    if (!formData.purchasePrice || formData.purchasePrice <= 0) {
      setActiveSection('A');
      alert('Por favor, informe um valor de compra válido.');
      return;
    }

    onSave(itemForMetrics);
    onClose();
  };

  const sections = [
    { id: 'A', label: '1. Produto & Compra', icon: Package },
    { id: 'B', label: '2. Frete & Busca', icon: Truck },
    { id: 'C', label: '3. Limpeza & Custos', icon: Wrench },
    { id: 'D', label: '4. Venda & Trocas', icon: DollarSign },
  ] as const;

  return (
    <div
      id="vehicle-form-modal-overlay"
      className="fixed inset-0 z-50 overflow-hidden bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-0 sm:p-4 md:p-6 animate-in fade-in duration-200"
    >
      <div
        id="vehicle-form-modal-container"
        className="bg-slate-900 border-0 sm:border sm:border-slate-700/80 rounded-none sm:rounded-3xl w-full max-w-5xl h-[100dvh] sm:h-auto sm:max-h-[92vh] overflow-hidden shadow-2xl flex flex-col text-slate-100"
      >
        
        {/* Modal Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 text-xl sm:text-2xl font-bold shrink-0">
              {currentCategory.emoji}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black text-white truncate">
                  {initialVehicle ? 'Editar Item do BRICK' : 'Cadastrar Novo Item'}
                </h2>
                <span className="text-[11px] sm:text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 shrink-0">
                  {currentCategory.name.split('(')[0]}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 truncate hidden xs:block">
                Xbox, Celulares, TVs, Carros, Informática e Eletros com cálculo de lucro exato.
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center"
            title="Fechar formulário"
          >
            <X className="w-6 h-6 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Quick Presets Bar (Horizontal Scroll) */}
        {!initialVehicle && (
          <div className="px-4 sm:px-6 py-2 bg-slate-950/90 border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto text-xs no-scrollbar shrink-0">
            <span className="text-amber-400 font-bold flex items-center gap-1 shrink-0 text-xs">
              <Zap className="w-3.5 h-3.5" /> Modelos Rápidos:
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto py-1">
              {ITEM_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className="shrink-0 px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-amber-500/20 hover:border-amber-500/50 border border-slate-700 text-slate-200 hover:text-amber-300 transition-all text-xs font-semibold active:scale-95"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Category Selector (Touch-Friendly Responsive Carousel / Grid) */}
        <div className="px-4 sm:px-6 py-2.5 bg-slate-900/95 border-b border-slate-800 shrink-0">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
              Categoria do Produto:
            </label>
            <span className="text-[11px] text-amber-400 font-bold sm:hidden">
              {currentCategory.emoji} {currentCategory.name.split('(')[0]}
            </span>
          </div>

          <div className="flex sm:grid sm:grid-cols-5 gap-2 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
            {CATEGORIES_LIST.map((cat) => {
              const isSelected = formData.category === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleChange('category', cat.id)}
                  className={`p-2 sm:p-2.5 rounded-2xl border text-left transition-all flex items-center gap-2 shrink-0 min-w-[135px] sm:min-w-0 ${
                    isSelected
                      ? 'bg-amber-500/20 border-amber-500 text-white shadow-sm ring-2 ring-amber-500/40'
                      : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
                  }`}
                >
                  <span className="text-xl sm:text-lg shrink-0">{cat.emoji}</span>
                  <div className="overflow-hidden min-w-0">
                    <div className={`text-xs font-bold truncate ${isSelected ? 'text-amber-300' : 'text-slate-300'}`}>
                      {cat.name.split('(')[0]}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section Step Tabs */}
        <div className="px-3 sm:px-6 py-2 bg-slate-950/60 border-b border-slate-800 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
          {sections.map((sec) => {
            const Icon = sec.icon;
            const isActive = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => setActiveSection(sec.id as any)}
                className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 min-h-[38px] ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800 bg-slate-900/60 border border-slate-800'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="whitespace-nowrap">{sec.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 pb-24 sm:pb-6">
          
          {/* SECTION A: Identificação & Compra */}
          {activeSection === 'A' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              
              {/* Box 1: Dados do Produto */}
              <div className="bg-slate-950/70 border border-slate-800/90 rounded-2xl p-4 sm:p-5 space-y-4">
                <h3 className="text-sm font-black text-amber-400 flex items-center gap-2">
                  <Package className="w-4 h-4 text-amber-400" /> 1. Dados Principais do Produto
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 sm:gap-4">
                  
                  {/* Nome / Modelo */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-200 mb-1.5">
                      Nome / Modelo do Produto *
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Xbox Series X 1TB, Smart TV LG 55 4K, iPhone 14 Pro..."
                      value={formData.model || ''}
                      onChange={(e) => handleChange('model', e.target.value)}
                      required
                      className="w-full px-3.5 py-3 sm:py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-base sm:text-sm text-white placeholder-slate-500 font-medium focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  {/* Marca */}
                  <div>
                    <label className="block text-xs font-bold text-slate-200 mb-1.5">
                      Marca / Fabricante
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Microsoft, Apple, Samsung, LG, Honda..."
                      value={formData.brand || ''}
                      onChange={(e) => handleChange('brand', e.target.value)}
                      className="w-full px-3.5 py-3 sm:py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-base sm:text-sm text-white placeholder-slate-500 font-medium focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  {/* Estado / Condição */}
                  <div>
                    <label className="block text-xs font-bold text-slate-200 mb-1.5">
                      Estado de Conservação
                    </label>
                    <select
                      value={formData.condition || 'seminovo_impecavel'}
                      onChange={(e) => handleChange('condition', e.target.value as ItemCondition)}
                      className="w-full px-3 py-3 sm:py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-base sm:text-sm text-white font-medium focus:outline-none focus:border-amber-500 cursor-pointer"
                    >
                      <option value="novo_lacrado">✨ Novo Lacrado (Na Caixa)</option>
                      <option value="seminovo_impecavel">💎 Seminovo Impecável (Sem marcas)</option>
                      <option value="usado_bom">👍 Usado em Bom Estado</option>
                      <option value="com_detalhes">⚠️ Com Marcas de Uso / Detalhes</option>
                      <option value="para_conserto_pecas">🛠️ Para Conserto / Peças</option>
                    </select>
                  </div>

                  {/* Especificações ou Armazenamento */}
                  <div>
                    <label className="block text-xs font-bold text-slate-200 mb-1.5">
                      {currentCategory.specsLabel}
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: 512GB SSD, 128GB, 55 4K, 16GB RAM..."
                      value={formData.storageOrSpecs || ''}
                      onChange={(e) => handleChange('storageOrSpecs', e.target.value)}
                      className="w-full px-3.5 py-3 sm:py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-base sm:text-sm text-white placeholder-slate-500 font-medium focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  {/* Serial / IMEI / NF */}
                  <div>
                    <label className="block text-xs font-bold text-slate-200 mb-1.5">
                      Serial Number / IMEI / NF
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: IMEI limpo, Serial do console ou NF..."
                      value={formData.serialOrImei || ''}
                      onChange={(e) => handleChange('serialOrImei', e.target.value)}
                      className="w-full px-3.5 py-3 sm:py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-base sm:text-sm text-white placeholder-slate-500 font-medium focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  {/* O que acompanha / Acessórios */}
                  <div className="sm:col-span-2 md:col-span-3">
                    <label className="block text-xs font-bold text-slate-200 mb-1.5">
                      O que Acompanha / Acessórios Inclusos
                    </label>
                    <input
                      type="text"
                      placeholder={currentCategory.accessoriesPlaceholder}
                      value={formData.accessoriesIncluded || ''}
                      onChange={(e) => handleChange('accessoriesIncluded', e.target.value)}
                      className="w-full px-3.5 py-3 sm:py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-base sm:text-sm text-white placeholder-slate-500 font-medium focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  {/* Campos Específicos para Veículos */}
                  {isVehicleCategory && (
                    <>
                      <div>
                        <label className="block text-xs font-bold text-slate-200 mb-1.5">
                          Ano / Modelo
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: 2018/2019"
                          value={formData.yearModel || ''}
                          onChange={(e) => handleChange('yearModel', e.target.value)}
                          className="w-full px-3.5 py-3 sm:py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-base sm:text-sm text-white font-medium focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-200 mb-1.5">
                          Placa Mercosul
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: BRA2E19"
                          value={formData.plate || ''}
                          onChange={(e) => handleChange('plate', e.target.value.toUpperCase())}
                          className="w-full px-3.5 py-3 sm:py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-base sm:text-sm text-white font-mono uppercase focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-200 mb-1.5">
                          Quilometragem (KM)
                        </label>
                        <input
                          type="number"
                          value={formData.mileage || ''}
                          onChange={(e) => handleChange('mileage', Number(e.target.value))}
                          className="w-full px-3.5 py-3 sm:py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-base sm:text-sm text-white font-medium focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </>
                  )}

                  {/* Saúde da bateria para celulares/notebooks */}
                  {(formData.category === 'smartphones' || formData.category === 'computers') && (
                    <div>
                      <label className="block text-xs font-bold text-slate-200 mb-1.5">
                        Saúde da Bateria (%)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        placeholder="Ex: 88"
                        value={formData.batteryHealth || ''}
                        onChange={(e) => handleChange('batteryHealth', Number(e.target.value))}
                        className="w-full px-3.5 py-3 sm:py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-base sm:text-sm text-white font-medium focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  )}

                </div>
              </div>

              {/* Box 1.5: Fotos do Produto */}
              <div className="bg-slate-950/70 border border-slate-800/90 rounded-2xl p-4 sm:p-5 space-y-3">
                <PhotoUploader
                  photos={formData.photos || []}
                  onChange={(newPhotos) => handleChange('photos', newPhotos)}
                  maxPhotos={8}
                  onPreviewPhoto={(photoUrl, index) => setPreviewPhotoIndex(index)}
                />
              </div>

              {/* Box 2: Valores Financeiros de Compra */}
              <div className="bg-slate-950/70 border border-slate-800/90 rounded-2xl p-4 sm:p-5 space-y-4">
                <h3 className="text-sm font-black text-amber-400 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-400" /> 2. Valores Financeiros de Aquisição
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-4">
                  
                  {/* Valor Pago na Compra */}
                  <div>
                    <label className="block text-xs font-black text-emerald-400 mb-1.5">
                      Valor Pago na Compra (R$) *
                    </label>
                    <input
                      type="number"
                      value={formData.purchasePrice || ''}
                      onChange={(e) => handleChange('purchasePrice', Number(e.target.value))}
                      required
                      className="w-full px-3.5 py-3 sm:py-2.5 bg-slate-900 border-2 border-emerald-500/50 rounded-xl text-base sm:text-sm font-black text-emerald-300 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
                    />
                  </div>

                  {/* Preço de Referência de Mercado / FIPE */}
                  <div>
                    <label className="block text-xs font-bold text-sky-400 mb-1.5">
                      {currentCategory.marketPriceLabel} (R$) *
                    </label>
                    <input
                      type="number"
                      value={formData.fipeValue || ''}
                      onChange={(e) => handleChange('fipeValue', Number(e.target.value))}
                      required
                      className="w-full px-3.5 py-3 sm:py-2.5 bg-slate-900 border border-sky-500/40 rounded-xl text-base sm:text-sm font-bold text-sky-300 focus:outline-none focus:border-sky-400"
                    />
                  </div>

                  {/* Forma de Pagamento */}
                  <div>
                    <label className="block text-xs font-bold text-slate-200 mb-1.5">
                      Forma de Pagamento
                    </label>
                    <select
                      value={formData.paymentMethod || 'pix'}
                      onChange={(e) => handleChange('paymentMethod', e.target.value as PaymentMethod)}
                      className="w-full px-3 py-3 sm:py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-base sm:text-sm text-white font-medium focus:outline-none focus:border-amber-500 cursor-pointer"
                    >
                      <option value="pix">⚡ PIX no Ato</option>
                      <option value="a_vista">💵 Dinheiro À Vista</option>
                      <option value="cartao_parcelado">💳 Cartão de Crédito</option>
                      <option value="com_troca">🔄 Com Troca / Rolo</option>
                      <option value="assume_divida">📑 Assume Dívida / Pendências</option>
                    </select>
                  </div>

                  {/* Débitos / Pendências Assumidas */}
                  <div>
                    <label className="block text-xs font-bold text-slate-200 mb-1.5">
                      Débitos / Pendências Assumidas (R$)
                    </label>
                    <input
                      type="number"
                      value={formData.assumedDebts || 0}
                      onChange={(e) => handleChange('assumedDebts', Number(e.target.value))}
                      className="w-full px-3.5 py-3 sm:py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-base sm:text-sm text-white font-medium focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* Data da Compra */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-200 mb-1.5">
                      Data da Compra / Entrada
                    </label>
                    <input
                      type="date"
                      value={formData.purchaseDate || ''}
                      onChange={(e) => handleChange('purchaseDate', e.target.value)}
                      className="w-full px-3.5 py-3 sm:py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-base sm:text-sm text-white font-medium focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* Deságio / Margem de Compra Badge */}
                <div className="p-3 sm:p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div className="text-xs text-slate-400">
                    Deságio na Entrada vs. Mercado:
                  </div>
                  <div className="font-extrabold text-xs sm:text-sm text-emerald-400">
                    {metrics.fipeDiscountPercent < 0
                      ? `${Math.abs(metrics.fipeDiscountPercent).toFixed(1)}% abaixo do mercado (Margem na compra!)`
                      : `${metrics.fipeDiscountPercent.toFixed(1)}% acima do mercado`}
                  </div>
                </div>
              </div>

              {/* Next Step Nav Button */}
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setActiveSection('B')}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-400 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <span>Avançar para Frete & Logística</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          )}

          {/* SECTION B: Logística & Frete */}
          {activeSection === 'B' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="bg-slate-950/70 border border-slate-800/90 rounded-2xl p-4 sm:p-5 space-y-4">
                <h3 className="text-sm font-black text-amber-400 flex items-center gap-2">
                  <Truck className="w-4 h-4 text-amber-400" /> Logística, Frete, Busca e Deslocamento
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Gasto para ir buscar o produto, Uber, combustível do carro, freteiro, motoboy ou pedágios.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-200 mb-1.5">
                      Gasto com Frete / Combustível / Uber (R$)
                    </label>
                    <input
                      type="number"
                      value={formData.fuelExpense || 0}
                      onChange={(e) => handleChange('fuelExpense', Number(e.target.value))}
                      className="w-full px-3.5 py-3 sm:py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-base sm:text-sm text-white font-medium focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-200 mb-1.5">
                      Distância Percorrida (KM)
                    </label>
                    <input
                      type="number"
                      value={formData.distanceKm || 0}
                      onChange={(e) => handleChange('distanceKm', Number(e.target.value))}
                      className="w-full px-3.5 py-3 sm:py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-base sm:text-sm text-white font-medium focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-200 mb-1.5">
                      Outros Custos de Transporte / Pedágios (R$)
                    </label>
                    <input
                      type="number"
                      value={formData.additionalLogistics || 0}
                      onChange={(e) => handleChange('additionalLogistics', Number(e.target.value))}
                      className="w-full px-3.5 py-3 sm:py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-base sm:text-sm text-white font-medium focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs sm:text-sm">
                  <span className="text-slate-400">Total de Despesas de Logística:</span>
                  <span className="font-black text-amber-400">{formatBRL(metrics.totalLogisticsCost)}</span>
                </div>
              </div>

              {/* Nav Buttons */}
              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setActiveSection('A')}
                  className="px-4 py-3 rounded-xl border border-slate-700 text-slate-300 text-xs sm:text-sm font-bold flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Voltar</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSection('C')}
                  className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-400 font-bold text-xs sm:text-sm flex items-center gap-2 active:scale-95"
                >
                  <span>Avançar para Limpeza & Custos</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* SECTION C: Limpeza, Conserto & Custos de Preparação */}
          {activeSection === 'C' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="bg-slate-950/70 border border-slate-800/90 rounded-2xl p-4 sm:p-5 space-y-4">
                <h3 className="text-sm font-black text-amber-400 flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-amber-400" /> Preparação, Conserto, Limpeza e Melhorias
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Discrimine cada centavo investido para deixar o item 100% valorizado e pronto para giro rápido.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 sm:gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-200 mb-1.5">
                      {isVehicleCategory ? 'Mecânica / Elétrica (R$)' : 'Conserto / Peças / Pasta Térmica (R$)'}
                    </label>
                    <input
                      type="number"
                      value={formData.mechanics || 0}
                      onChange={(e) => handleChange('mechanics', Number(e.target.value))}
                      className="w-full px-3.5 py-3 sm:py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-base sm:text-sm text-white font-medium focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-200 mb-1.5">
                      {isVehicleCategory ? 'Funilaria & Pintura (R$)' : 'Estética / Carcaça / Reparo (R$)'}
                    </label>
                    <input
                      type="number"
                      value={formData.bodyworkPaint || 0}
                      onChange={(e) => handleChange('bodyworkPaint', Number(e.target.value))}
                      className="w-full px-3.5 py-3 sm:py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-base sm:text-sm text-white font-medium focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-200 mb-1.5">
                      Limpeza Técnica / Higienização / Película (R$)
                    </label>
                    <input
                      type="number"
                      value={formData.detailing || 0}
                      onChange={(e) => handleChange('detailing', Number(e.target.value))}
                      className="w-full px-3.5 py-3 sm:py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-base sm:text-sm text-white font-medium focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-200 mb-1.5">
                      {isVehicleCategory ? 'Pneus & Rodas (R$)' : 'Cabos / Acessórios Extras Adquiridos (R$)'}
                    </label>
                    <input
                      type="number"
                      value={formData.tiresWheels || 0}
                      onChange={(e) => handleChange('tiresWheels', Number(e.target.value))}
                      className="w-full px-3.5 py-3 sm:py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-base sm:text-sm text-white font-medium focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-200 mb-1.5">
                      {isVehicleCategory ? 'Documentação & Vistoria (R$)' : 'Taxas / Laudo / Desbloqueio (R$)'}
                    </label>
                    <input
                      type="number"
                      value={formData.documentation || 0}
                      onChange={(e) => handleChange('documentation', Number(e.target.value))}
                      className="w-full px-3.5 py-3 sm:py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-base sm:text-sm text-white font-medium focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-200 mb-1.5">
                      Comissão de Indicação / Alce (R$)
                    </label>
                    <input
                      type="number"
                      value={formData.commissions || 0}
                      onChange={(e) => handleChange('commissions', Number(e.target.value))}
                      className="w-full px-3.5 py-3 sm:py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-base sm:text-sm text-white font-medium focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-200 mb-1.5">
                      Marketing / Anúncios OLX Turbo / Face (R$)
                    </label>
                    <input
                      type="number"
                      value={formData.marketing || 0}
                      onChange={(e) => handleChange('marketing', Number(e.target.value))}
                      className="w-full px-3.5 py-3 sm:py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-base sm:text-sm text-white font-medium focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-200 mb-1.5">
                      Reserva de Garantia / Vícios Ocultos (%)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={formData.hiddenDefectReservePercent || 3}
                      onChange={(e) => handleChange('hiddenDefectReservePercent', Number(e.target.value))}
                      className="w-full px-3.5 py-3 sm:py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-base sm:text-sm text-white font-medium focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="sm:col-span-2 md:col-span-3">
                    <label className="block text-xs font-bold text-slate-200 mb-1.5">
                      Notas & Observações do BRICK
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Ex: Console sem marcas, tudo testado na tomada, controle extra original..."
                      value={formData.notes || ''}
                      onChange={(e) => handleChange('notes', e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-base sm:text-sm text-white placeholder-slate-500 font-medium focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs sm:text-sm">
                  <span className="text-slate-400">Total de Custos de Preparação:</span>
                  <span className="font-black text-amber-400">{formatBRL(metrics.totalPreparationCost)}</span>
                </div>
              </div>

              {/* Nav Buttons */}
              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setActiveSection('B')}
                  className="px-4 py-3 rounded-xl border border-slate-700 text-slate-300 text-xs sm:text-sm font-bold flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Voltar</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSection('D')}
                  className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-400 font-bold text-xs sm:text-sm flex items-center gap-2 active:scale-95"
                >
                  <span>Avançar para Venda & Trocas</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* SECTION D: Venda & Trocas (Rolo) */}
          {activeSection === 'D' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              
              {/* Box 1: Precificação de Venda */}
              <div className="bg-slate-950/70 border border-slate-800/90 rounded-2xl p-4 sm:p-5 space-y-4">
                <h3 className="text-sm font-black text-amber-400 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-400" /> Precificação & Status no Estoque
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-200 mb-1.5">
                      Preço de Anúncio / Venda (R$)
                    </label>
                    <input
                      type="number"
                      value={formData.salePrice || ''}
                      onChange={(e) => handleChange('salePrice', Number(e.target.value))}
                      className="w-full px-3.5 py-3 sm:py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-base sm:text-sm font-bold text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-200 mb-1.5">
                      Status no Estoque
                    </label>
                    <select
                      value={formData.status || 'in_stock'}
                      onChange={(e) => handleChange('status', e.target.value as ItemStatus)}
                      className="w-full px-3 py-3 sm:py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-base sm:text-sm text-white font-medium focus:outline-none focus:border-amber-500 cursor-pointer"
                    >
                      <option value="in_stock">📦 Em Estoque (Disponível)</option>
                      <option value="negotiating">💬 Em Negociação</option>
                      <option value="sold">✅ Vendido (Finalizado)</option>
                    </select>
                  </div>

                  {formData.status === 'sold' && (
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-200 mb-1.5">
                        Data da Venda *
                      </label>
                      <input
                        type="date"
                        value={formData.saleDate || new Date().toISOString().split('T')[0]}
                        onChange={(e) => handleChange('saleDate', e.target.value)}
                        className="w-full px-3.5 py-3 sm:py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-base sm:text-sm text-white font-medium focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  )}
                </div>

                {/* TEMPO DE CADASTRO ATÉ A VENDA / EM ESTOQUE PREVIEW */}
                {(() => {
                  const isSold = formData.status === 'sold';
                  const duration = getInventoryDurationDetails(
                    formData.purchaseDate || new Date().toISOString().split('T')[0],
                    formData.saleDate,
                    isSold
                  );
                  return (
                    <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                        <div>
                          <div className="font-bold text-white text-xs sm:text-sm">
                            {isSold
                              ? `Vendido em ${duration.days} ${duration.days === 1 ? 'dia' : 'dias'}`
                              : `Tempo em Estoque: ${duration.days} ${duration.days === 1 ? 'dia' : 'dias'}`}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            Entrada: {duration.startDateFormatted} {isSold ? `➔ Venda: ${duration.endDateFormatted}` : `(Até hoje: ${duration.endDateFormatted})`}
                          </div>
                        </div>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full border text-[10px] font-bold ${duration.speedBadge.colorClasses} shrink-0`}>
                        {duration.speedBadge.emoji} {duration.speedBadge.label}
                      </span>
                    </div>
                  );
                })()}

              </div>

              {/* Box 2: Troca / Rolo */}
              <div className="bg-slate-950/70 border border-slate-800/90 rounded-2xl p-4 sm:p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-sky-400 flex items-center gap-2">
                    <Repeat className="w-4 h-4" /> Aceitou Troca / Rolo com outro Item?
                  </h3>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.tradeIn?.hasTradeIn || false}
                      onChange={(e) => handleTradeInChange('hasTradeIn', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-500"></div>
                  </label>
                </div>

                {formData.tradeIn?.hasTradeIn && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4 pt-3 border-t border-slate-800">
                    <div className="sm:col-span-3">
                      <label className="block text-xs font-bold text-slate-200 mb-1.5">
                        Descrição do Item Recebido na Troca
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Peguei um Xbox One S + R$ 1.000 de volta, ou iPhone 12..."
                        value={formData.tradeIn.model || ''}
                        onChange={(e) => handleTradeInChange('model', e.target.value)}
                        className="w-full px-3.5 py-3 sm:py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-base sm:text-sm text-white font-medium focus:outline-none focus:border-sky-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-200 mb-1.5">
                        Valor Pago no Item da Troca (R$)
                      </label>
                      <input
                        type="number"
                        value={formData.tradeIn.attributedValue || 0}
                        onChange={(e) => handleTradeInChange('attributedValue', Number(e.target.value))}
                        className="w-full px-3.5 py-3 sm:py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-base sm:text-sm text-white font-medium focus:outline-none focus:border-sky-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-200 mb-1.5">
                        Valor de Mercado do Item (R$)
                      </label>
                      <input
                        type="number"
                        value={formData.tradeIn.fipeValue || 0}
                        onChange={(e) => handleTradeInChange('fipeValue', Number(e.target.value))}
                        className="w-full px-3.5 py-3 sm:py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-base sm:text-sm text-white font-medium focus:outline-none focus:border-sky-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-200 mb-1.5">
                        Custo de Preparação do 2º Item (R$)
                      </label>
                      <input
                        type="number"
                        value={formData.tradeIn.estimatedResaleCost || 0}
                        onChange={(e) => handleTradeInChange('estimatedResaleCost', Number(e.target.value))}
                        className="w-full px-3.5 py-3 sm:py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-base sm:text-sm text-white font-medium focus:outline-none focus:border-sky-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Nav Buttons */}
              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setActiveSection('C')}
                  className="px-4 py-3 rounded-xl border border-slate-700 text-slate-300 text-xs sm:text-sm font-bold flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Voltar</span>
                </button>
              </div>
            </div>
          )}

          {/* Bottom Live Calculation Summary Bar */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-amber-500/30 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <div className="text-[11px] text-slate-400 font-medium">Custo Total de Entrada:</div>
              <div className="text-base sm:text-lg font-black text-amber-400">{formatBRL(metrics.totalVehicleCost)}</div>
            </div>

            <div>
              <div className="text-[11px] text-slate-400 font-medium">Lucro Líquido Previsto:</div>
              <div className={`text-base sm:text-lg font-black ${metrics.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {formatBRL(metrics.netProfit)} ({formatPercent(metrics.realMarginPercent)})
              </div>
            </div>

            <div>
              <div className="text-[11px] text-slate-400 font-medium">Preço Meta (15% Margem):</div>
              <div className="text-base sm:text-lg font-black text-sky-400">{formatBRL(metrics.targetPrice15Percent)}</div>
            </div>
          </div>

          {/* Sticky Mobile/Desktop Action Buttons */}
          <div className="flex items-center justify-between gap-3 pt-2">
            {initialVehicle && onDelete ? (
              <button
                type="button"
                onClick={handleDeleteItem}
                className="px-4 py-3 rounded-xl border border-rose-500/30 hover:border-rose-500/60 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 min-h-[44px]"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden xs:inline">Excluir</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-3 rounded-xl border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 text-xs sm:text-sm font-bold transition-all min-h-[44px]"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 min-h-[44px]"
              >
                <Check className="w-5 h-5 stroke-[3]" />
                <span>Salvar Item no BRICK</span>
              </button>
            </div>
          </div>

        </form>
      </div>

      {/* Fullscreen Photo Lightbox */}
      {previewPhotoIndex !== null && (
        <ImageViewerModal
          isOpen={previewPhotoIndex !== null}
          onClose={() => setPreviewPhotoIndex(null)}
          photos={formData.photos || []}
          initialIndex={previewPhotoIndex}
          title={formData.model || 'Fotos do Produto'}
        />
      )}
    </div>
  );
};

