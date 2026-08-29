export type ItemCategory =
  | 'consoles_games'
  | 'smartphones'
  | 'tv_audio'
  | 'vehicles'
  | 'computers'
  | 'tools'
  | 'appliances'
  | 'furniture'
  | 'watches_jewelry'
  | 'other';

export type ItemStatus = 'in_stock' | 'sold' | 'negotiating';
// Alias for backward compatibility
export type VehicleStatus = ItemStatus;

export type ItemCondition =
  | 'novo_lacrado'
  | 'seminovo_impecavel'
  | 'usado_bom'
  | 'com_detalhes'
  | 'para_conserto_pecas';

export type PaymentMethod = 'a_vista' | 'pix' | 'cartao_parcelado' | 'assume_divida' | 'com_troca';

export type SaleDealType = 'cash_only' | 'cash_and_trade' | 'trade_only';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  storeName?: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface TradeInDetails {
  hasTradeIn: boolean;
  dealType?: SaleDealType;
  cashReceived?: number; // Dinheiro / PIX recebido na volta da negociação
  model: string;
  brand?: string;
  category?: ItemCategory;
  condition?: ItemCondition;
  storageOrSpecs?: string;
  accessoriesIncluded?: string;
  description?: string;
  yearModel?: string;
  plate?: string;
  attributedValue: number; // Valor acordado na troca (R$)
  fipeValue: number; // Valor de mercado / FIPE do item recebido (R$)
  estimatedResaleCost: number; // Custo estimado de preparação/revisão para revender (R$)
  expectedSalePrice?: number; // Preço previsto de revenda (R$)
  effectiveEntryCost?: number; // Custo real de entrada calculado pelo sistema (R$)
  expectedResaleProfit?: number; // Lucro projetado na revenda do item recebido
  expectedResaleMarginPercent?: number; // Margem projetada na revenda do item recebido
}

export interface CategoryInfo {
  id: ItemCategory;
  name: string;
  iconName: string;
  emoji: string;
  marketPriceLabel: string; // Ex: "Tabela FIPE" para veículos, "Preço Médio de Mercado" para eletrônicos
  specsLabel: string; // Ex: "Armazenamento / Versão" ou "Motor / Câmbio"
  accessoriesPlaceholder: string;
  logisticsLabel: string; // "Combustível & Frete" ou "Entrega / Uber / Motoboy"
}

export interface BrickItem {
  id: string;
  userId: string; // Mandatory for Row Level Security (RLS) data isolation
  category: ItemCategory;

  // Identificação Básica
  model: string; // Título / Nome / Modelo (ex: Xbox Series S 512GB, Smart TV LG 55", Honda Civic)
  brand?: string; // Marca (ex: Microsoft, Sony, Apple, Samsung, LG, Honda)
  condition?: ItemCondition; // Estado de conservação
  storageOrSpecs?: string; // Armazenamento ou especificações (ex: 512GB SSD, 128GB, 55 polegadas, 2.0 Flex)
  accessoriesIncluded?: string; // Itens inclusos (ex: 2 controles + cabos + caixa, suporte)
  serialOrImei?: string; // IMEI, Serial Number ou NF
  batteryHealth?: number; // % saúde da bateria (para celulares / notebooks)
  voltage?: 'bivolt' | '110v' | '220v' | 'bateria';

  // Campos específicos de Veículos (opcionais quando for eletrônico/outros)
  yearModel?: string;
  plate?: string;
  color?: string;
  mileage?: number;

  status: ItemStatus;

  // A. Dados da Compra (Aquisição)
  purchasePrice: number;
  fipeValue: number; // Preço Médio de Mercado / Tabela FIPE de Referência
  paymentMethod: PaymentMethod;
  assumedDebts: number; // Débitos assumidos, pendências ou parcelas
  purchaseDate: string; // YYYY-MM-DD

  // B. Logística, Busca e Transporte / Frete
  distanceKm: number;
  fuelExpense: number; // Gasto com combustível, frete, motoboy ou Uber
  fuelPricePerLiter: number;
  avgConsumptionKmPerLiter?: number;
  additionalLogistics: number; // Pedágios, entrega, estacionamento, envio

  // C. Custos de Preparação, Limpeza, Conserto e Documentação
  mechanics: number; // Manutenção, conserto, troca de peças, pasta térmica, troca de tela
  bodyworkPaint: number; // Estética, carcaça, funilaria ou reparo cosmético
  detailing: number; // Limpeza detalhada, higienização, polimento
  tiresWheels: number; // Acessórios extras comprados (cabos, controles novos, pneus)
  documentation: number; // Vistoria, laudo, taxas, nota fiscal, desbloqueio
  commissions: number; // Comissão de indicador / intermediador
  marketing: number; // Anúncios OLX Turbo / Facebook Impulsionado
  hiddenDefectReservePercent: number; // Reserva de garantia / vícios ocultos (% sobre compra)
  notes?: string;

  // Fotos do Produto & Anúncio
  photos?: string[]; // URLs ou Base64 das fotos reais do item
  photoUrl?: string; // Foto principal (compatibilidade retroativa)

  // D. Dados da Venda (Fechamento)
  saleDealType?: SaleDealType;
  salePrice?: number;
  saleDate?: string; // YYYY-MM-DD
  cardFees?: number; // Taxas de maquininha ou intermediação
  tradeIn?: TradeInDetails;
  salePaymentMethod?: PaymentMethod; // Método de recebimento da venda

  // Comprovante de Pagamento PIX (quando vendido via Pix)
  pixReceiptUrl?: string; // Base64 ou URL do comprovante PIX
  pixReceiptName?: string; // Nome do arquivo do comprovante (ex: comprovante-pix.pdf / .jpg)
  pixReceiptDate?: string; // Data em que o comprovante foi anexado
  pixReceiptTransactionId?: string; // ID da transação ou autenticação bancária (opcional)

  // IA Cache & Metadados
  copilotAnalysis?: CopilotAnalysis;
  generatedAd?: GeneratedAdCopy;
  originItemId?: string; // ID do produto original que originou este item na troca (Genealogia)
  buyerName?: string;
  buyerDocument?: string;
  buyerPhone?: string;
  warrantyDays?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CardFeeRate {
  installments: number;
  label: string;
  feePercent: number;
}

export interface CardMachinePreset {
  id: string;
  name: string;
  brand: string;
  debitFee: number;
  credit1xFee: number;
  rates: CardFeeRate[];
}

export interface ReceiptData {
  id: string;
  itemModel: string;
  category: ItemCategory;
  serialOrImei?: string;
  storageOrSpecs?: string;
  accessoriesIncluded?: string;
  condition: ItemCondition;
  sellerName: string;
  sellerDocument?: string;
  sellerPhone?: string;
  sellerStoreName?: string;
  buyerName: string;
  buyerDocument?: string;
  buyerPhone?: string;
  saleDate: string;
  salePrice: number;
  paymentMethod: PaymentMethod | string;
  warrantyDays: number;
  warrantyNotes?: string;
  originDeclaration: boolean;
  notes?: string;
}

export interface AntiScamTestStep {
  id: string;
  title: string;
  description: string;
  critical: boolean;
  howToTest: string;
}

export interface TradeChainNode {
  itemId: string;
  model: string;
  category: ItemCategory;
  purchaseDate: string;
  purchaseCost: number;
  cashReceivedOnTrade?: number;
  effectiveEntryCost: number;
  resalePrice?: number;
  profit?: number;
  status: ItemStatus;
  soldDate?: string;
  children: TradeChainNode[];
}

// Keep Vehicle as alias for BrickItem so existing code stays 100% type safe
export type Vehicle = BrickItem;

export interface ItemMetrics {
  // Logística & Frete
  consumedFuelLiters: number;
  realLogisticsConsumption: number;
  totalLogisticsCost: number;

  // Preparação / Revisão
  hiddenDefectsCost: number;
  totalPreparationCost: number;

  // Custo Real Total de Entrada (R$)
  totalVehicleCost: number; // Custo Total do Item

  // Comparativo de Mercado (Deságio na Compra)
  fipeDiscountPercent: number; // negativo = abaixo do mercado (deságio favorável), positivo = ágio

  // Giro de Estoque
  daysInStock: number;
  isOverStockAlert: boolean; // > 30 dias

  // Venda & Lucro
  netProfit: number;
  realMarginPercent: number;
  dailyCapitalReturn: number;

  // Metas de Precificação
  breakEvenPrice: number;
  targetPrice15Percent: number;
  targetPrice20Percent: number;

  // Métricas de Troca / Rolo
  tradeInMetrics?: {
    combinedInvestedTotal: number;
    targetResaleForTradeCar: number;
    combinedEstimatedProfit: number;
    combinedEstimatedMarginPercent: number;
  };
}

export type VehicleMetrics = ItemMetrics;

export interface CopilotAnalysis {
  score: number;
  scoreLabel: string;
  diagnosis: string;
  strengths: string[];
  risks: string[];
  tacticalAdvice: string;
  idealPriceRange: {
    quickSale: number;
    targetPrice: number;
    maximumNegotiableDiscount: number;
  };
  generatedAt?: string;
}

export interface ClientWishlistItem {
  id: string;
  category?: ItemCategory;
  modelQuery: string; // Ex: "iPhone 13", "PlayStation 5", "Smart TV 55"
  maxBudget?: number; // Preço máximo que o cliente topa pagar
  notes?: string;
  createdAt: string;
}

export interface Client {
  id: string;
  userId: string;
  name: string;
  phone: string;
  document?: string;
  cityOrNeighborhood?: string;
  notes?: string;
  tags?: string[]; // Ex: ["Gamer", "Revendedor", "Compra no PIX", "Exigente"]
  totalPurchasesCount: number;
  totalSpent: number;
  wishlist: ClientWishlistItem[];
  createdAt: string;
  updatedAt: string;
}

export interface ClientMatch {
  client: Client;
  wishlistItem: ClientWishlistItem;
  matchingProduct: BrickItem;
  budgetDifference: number; // productPrice - maxBudget
}

export interface GeneratedAdCopy {
  title: string;
  highlights: string[];
  fullText: string;
  instagramCaption?: string;
  antiCuriousDisclaimer?: string;
  marketplaceTitle?: string;
  olxTitle?: string;
  generatedAt?: string;
  isAiGenerated?: boolean;
}

export interface NegotiationSimulation {
  proposedPrice: number;
  buyerMessage?: string;
  proposedProfit: number;
  proposedMargin: number;
  verdict: 'ACCEPT' | 'COUNTER' | 'REJECT';
  verdictLabel: string;
  verdictDescription: string;
  aiAnalysis?: string;
  suggestedCounterPrice?: number;
  options?: Array<{
    label: string;
    tone: string;
    message: string;
  }>;
}

export interface TaxReportSummary {
  year: number;
  totalVehiclesSold: number;
  grossRevenue: number;
  totalAcquisitionAndPrepCost: number;
  totalNetCapitalGain: number;
  exemptSalesTotal: number; // Vendas mensais <= R$ 35.000 (Regra bens de pequeno valor)
  taxableSalesTotal: number; // Vendas com valor superior tributáveis
  estimatedTaxDue: number; // 15% sobre ganho de capital líquido
  vehicles: Array<{
    vehicle: BrickItem;
    metrics: ItemMetrics;
    isExempt: boolean;
  }>;
}
