import { BrickItem, ItemMetrics, NegotiationSimulation, TaxReportSummary } from '../types';

/**
 * Format currency to Brazilian Real (BRL)
 */
export function formatBRL(value: number | undefined | null): string {
  if (value === undefined || value === null || isNaN(value)) return 'R$ 0,00';
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

/**
 * Format percentage with 1 or 2 decimals
 */
export function formatPercent(value: number | undefined | null, decimals = 1): string {
  if (value === undefined || value === null || isNaN(value)) return '0,0%';
  return `${value.toFixed(decimals).replace('.', ',')}%`;
}

/**
 * Parse date string safely avoiding timezone shifts
 */
export function parseDateString(dateStr?: string): Date {
  if (!dateStr) return new Date();
  if (dateStr.includes('T')) {
    return new Date(dateStr);
  }
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    return new Date(year, month, day);
  }
  return new Date(dateStr);
}

/**
 * Format ISO date string (YYYY-MM-DD) to Brazilian date (DD/MM/AAAA)
 */
export function formatDateBR(dateStr?: string): string {
  if (!dateStr) return '-';
  try {
    const date = parseDateString(dateStr);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return dateStr;
  }
}

/**
 * Calculate difference in days between two ISO date strings (YYYY-MM-DD)
 */
export function calculateDaysBetween(startDateStr: string, endDateStr?: string): number {
  if (!startDateStr) return 0;
  const start = parseDateString(startDateStr);
  const end = endDateStr ? parseDateString(endDateStr) : new Date();

  // Set to midnight UTC for accurate day difference
  const utcStart = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
  const utcEnd = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());

  const diffTime = utcEnd - utcStart;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(diffDays, 0);
}

export interface InventoryDuration {
  days: number;
  formattedText: string;
  startDateFormatted: string;
  endDateFormatted: string;
  isSold: boolean;
  speedCategory: 'fast' | 'normal' | 'slow';
  speedBadge: {
    label: string;
    colorClasses: string;
    emoji: string;
  };
}

/**
 * Get rich human-readable duration details from registration/purchase date to sale date or today
 */
export function getInventoryDurationDetails(
  purchaseDateStr: string,
  saleDateStr?: string,
  isSold = false
): InventoryDuration {
  const days = calculateDaysBetween(purchaseDateStr, isSold ? saleDateStr : undefined);
  const startDateFormatted = formatDateBR(purchaseDateStr);
  const endDateFormatted =
    isSold && saleDateStr
      ? formatDateBR(saleDateStr)
      : formatDateBR(new Date().toISOString().split('T')[0]);

  let speedCategory: 'fast' | 'normal' | 'slow' = 'fast';
  let speedBadge = {
    label: 'Giro Rápido (≤ 15d)',
    colorClasses: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    emoji: '⚡',
  };

  if (days > 30) {
    speedCategory = 'slow';
    speedBadge = {
      label: 'Giro Lento (> 30d)',
      colorClasses: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      emoji: '⚠️',
    };
  } else if (days > 15) {
    speedCategory = 'normal';
    speedBadge = {
      label: 'Giro Médio (16-30d)',
      colorClasses: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
      emoji: '⏳',
    };
  }

  let formattedText = '';
  if (days === 0) {
    formattedText = isSold ? 'Vendido no mesmo dia da compra' : 'Cadastrado hoje';
  } else if (days === 1) {
    formattedText = isSold ? 'Vendido em 1 dia' : 'Em estoque há 1 dia';
  } else {
    if (days >= 30) {
      const months = Math.floor(days / 30);
      const remainingDays = days % 30;
      const monthStr = months === 1 ? '1 mês' : `${months} meses`;
      const dayStr = remainingDays > 0 ? ` e ${remainingDays} dia${remainingDays > 1 ? 's' : ''}` : '';
      formattedText = isSold
        ? `Vendido em ${days} dias (${monthStr}${dayStr})`
        : `Em estoque há ${days} dias (${monthStr}${dayStr})`;
    } else {
      formattedText = isSold ? `Vendido em ${days} dias` : `Em estoque há ${days} dias`;
    }
  }

  return {
    days,
    formattedText,
    startDateFormatted,
    endDateFormatted,
    isSold,
    speedCategory,
    speedBadge,
  };
}

/**
 * Core calculation engine for ANY Brick item / product
 */
export function calculateVehicleMetrics(vehicle: BrickItem): ItemMetrics {
  const purchasePrice = Number(vehicle.purchasePrice) || 0;
  const fipeValue = Number(vehicle.fipeValue) || 1;
  const assumedDebts = Number(vehicle.assumedDebts) || 0;
  const fuelExpense = Number(vehicle.fuelExpense) || 0;
  const fuelPrice = Number(vehicle.fuelPricePerLiter) > 0 ? Number(vehicle.fuelPricePerLiter) : 5.89;
  const distanceKm = Number(vehicle.distanceKm) || 0;
  const additionalLogistics = Number(vehicle.additionalLogistics) || 0;

  // 1. Litros de Combustível / Frete (L)
  const consumedFuelLiters = fuelPrice > 0 ? fuelExpense / fuelPrice : 0;

  // 2. Consumo Real ou Eficiência de Logística (km/L)
  const realLogisticsConsumption =
    consumedFuelLiters > 0 && distanceKm > 0 ? distanceKm / consumedFuelLiters : (vehicle.avgConsumptionKmPerLiter || 10);

  // 3. Custo Total de Logística / Frete (R$)
  const totalLogisticsCost = fuelExpense + additionalLogistics;

  // 4. Custo de Preparação & Reserva de Garantia/Vícios
  const hiddenReservePercent = Number(vehicle.hiddenDefectReservePercent) || 0;
  const hiddenDefectsCost = (purchasePrice * hiddenReservePercent) / 100;

  const mechanics = Number(vehicle.mechanics) || 0;
  const bodyworkPaint = Number(vehicle.bodyworkPaint) || 0;
  const detailing = Number(vehicle.detailing) || 0;
  const tiresWheels = Number(vehicle.tiresWheels) || 0;
  const documentation = Number(vehicle.documentation) || 0;
  const commissions = Number(vehicle.commissions) || 0;
  const marketing = Number(vehicle.marketing) || 0;

  const totalPreparationCost =
    mechanics +
    bodyworkPaint +
    detailing +
    tiresWheels +
    documentation +
    commissions +
    marketing +
    hiddenDefectsCost;

  // 5. Custo Total de Entrada / Custo Real do Item (R$)
  const cardFees = Number(vehicle.cardFees) || 0;
  const totalVehicleCost = purchasePrice + assumedDebts + totalLogisticsCost + totalPreparationCost + cardFees;

  // 6. Deságio/Vantagem em Relação ao Preço de Mercado / FIPE (%)
  // Formula: ((Valor Pago - Mercado) / Mercado) * 100
  const fipeDiscountPercent = fipeValue > 0 ? ((purchasePrice - fipeValue) / fipeValue) * 100 : 0;

  // 7. Métricas de Giro de Estoque
  const isSold = vehicle.status === 'sold';
  const daysInStock = calculateDaysBetween(vehicle.purchaseDate, isSold ? vehicle.saleDate : undefined);
  const isOverStockAlert = !isSold && daysInStock > 30;

  // 8. Lucro e Margem
  const salePrice = Number(vehicle.salePrice) || 0;
  const netProfit = salePrice > 0 ? salePrice - totalVehicleCost : 0;
  const realMarginPercent = salePrice > 0 ? (netProfit / salePrice) * 100 : 0;

  // Rendimento Diário do Capital (R$/dia de estoque)
  const dailyCapitalReturn = daysInStock > 0 && netProfit > 0 ? netProfit / daysInStock : 0;

  // 9. Metas de Precificação
  // Ponto de Equilíbrio (Zero a Zero)
  const breakEvenPrice = totalVehicleCost;
  // Preço Meta com 15% de Margem Líquida
  // Formula: Custo Total / (1 - 0.15)
  const targetPrice15Percent = totalVehicleCost > 0 ? totalVehicleCost / 0.85 : 0;
  // Preço Meta com 20% de Margem
  const targetPrice20Percent = totalVehicleCost > 0 ? totalVehicleCost / 0.8 : 0;

  // 10. Cálculos de Troca / Rolo Combinado (se houver)
  let tradeInMetrics: ItemMetrics['tradeInMetrics'] = undefined;
  if (vehicle.tradeIn && vehicle.tradeIn.hasTradeIn && vehicle.tradeIn.attributedValue > 0) {
    const tradeAttributed = Number(vehicle.tradeIn.attributedValue) || 0;
    const tradePrep = Number(vehicle.tradeIn.estimatedResaleCost) || 0;
    const combinedInvested = totalVehicleCost + tradePrep;

    // Preço que precisamos vender o item recebido na troca para fechar a operação
    const targetResaleForTradeCar = Math.max(combinedInvested - (salePrice - tradeAttributed), 0);
    const expectedResale = Number(vehicle.tradeIn.expectedSalePrice) || vehicle.tradeIn.fipeValue || tradeAttributed * 1.15;
    const combinedProfit = (salePrice - tradeAttributed) + expectedResale - combinedInvested;
    const combinedMargin = (combinedProfit / (salePrice + expectedResale)) * 100;

    tradeInMetrics = {
      combinedInvestedTotal: combinedInvested,
      targetResaleForTradeCar,
      combinedEstimatedProfit: combinedProfit,
      combinedEstimatedMarginPercent: combinedMargin,
    };
  }

  return {
    consumedFuelLiters,
    realLogisticsConsumption,
    totalLogisticsCost,
    hiddenDefectsCost,
    totalPreparationCost,
    totalVehicleCost,
    fipeDiscountPercent,
    daysInStock,
    isOverStockAlert,
    netProfit,
    realMarginPercent,
    dailyCapitalReturn,
    breakEvenPrice,
    targetPrice15Percent,
    targetPrice20Percent,
    tradeInMetrics,
  };
}

/**
 * Evaluate counter offer for real-time negotiation
 */
export function evaluateCounterOffer(
  totalCost: number,
  proposedPrice: number,
  targetMarginPercent = 15
): NegotiationSimulation {
  const proposedProfit = proposedPrice - totalCost;
  const proposedMargin = proposedPrice > 0 ? (proposedProfit / proposedPrice) * 100 : 0;

  // Target Counter Price to preserve minimum required margin
  const safeMarginDec = Math.max(targetMarginPercent / 100, 0.05);
  const suggestedCounterPrice = Math.round(totalCost / (1 - safeMarginDec));

  let verdict: 'ACCEPT' | 'COUNTER' | 'REJECT';
  let verdictLabel: string;
  let verdictDescription: string;

  if (proposedMargin >= targetMarginPercent) {
    verdict = 'ACCEPT';
    verdictLabel = '🟢 Aceitar Imediatamente';
    verdictDescription = `A proposta garante lucro líquido de ${formatBRL(proposedProfit)} e margem de ${formatPercent(proposedMargin)}, atingindo sua meta de ${targetMarginPercent}%.`;
  } else if (proposedMargin >= 8) {
    verdict = 'COUNTER';
    verdictLabel = '🟡 Fazer Contraproposta';
    verdictDescription = `A proposta deixa lucro de ${formatBRL(proposedProfit)} (${formatPercent(proposedMargin)}), abaixo da meta (${targetMarginPercent}%), mas ainda positiva. Envie contraproposta de ${formatBRL(suggestedCounterPrice)}.`;
  } else {
    verdict = 'REJECT';
    verdictLabel = '🔴 Recusar Oferta';
    verdictDescription = proposedProfit <= 0
      ? `Prejuízo de ${formatBRL(Math.abs(proposedProfit))}. Não cobre nem o custo de entrada (${formatBRL(totalCost)}).`
      : `Margem muito baixa de ${formatPercent(proposedMargin)} (${formatBRL(proposedProfit)}), não compensa o risco e a garantia.`;
  }

  return {
    proposedPrice,
    proposedProfit,
    proposedMargin,
    verdict,
    verdictLabel,
    verdictDescription,
    suggestedCounterPrice,
  };
}

/**
 * Generate Brazilian IRS (GCAP / IRPF) Tax Summary for movable assets
 */
export function generateTaxReport(vehicles: BrickItem[], year: number): TaxReportSummary {
  const soldInYear = vehicles.filter((v) => {
    if (v.status !== 'sold' || !v.saleDate) return false;
    const saleYear = new Date(v.saleDate).getFullYear();
    return saleYear === year;
  });

  // Calculate metrics for each item
  const mapped = soldInYear.map((v) => {
    const metrics = calculateVehicleMetrics(v);
    const salePrice = Number(v.salePrice) || 0;
    // Small value exemption: sales <= R$ 35,000 in the month
    const isExempt = salePrice <= 35000;
    return {
      vehicle: v,
      metrics,
      isExempt,
    };
  });

  const grossRevenue = mapped.reduce((acc, item) => acc + (Number(item.vehicle.salePrice) || 0), 0);
  const totalAcquisitionAndPrepCost = mapped.reduce(
    (acc, item) => acc + item.metrics.totalVehicleCost,
    0
  );
  const totalNetCapitalGain = Math.max(grossRevenue - totalAcquisitionAndPrepCost, 0);

  const exemptSalesTotal = mapped
    .filter((item) => item.isExempt)
    .reduce((acc, item) => acc + (Number(item.vehicle.salePrice) || 0), 0);

  const taxableSales = mapped.filter((item) => !item.isExempt);
  const taxableSalesTotal = taxableSales.reduce(
    (acc, item) => acc + (Number(item.vehicle.salePrice) || 0),
    0
  );

  const taxableGain = taxableSales.reduce((acc, item) => acc + Math.max(item.metrics.netProfit, 0), 0);
  const estimatedTaxDue = taxableGain * 0.15; // 15% rate on taxable gain of capital

  return {
    year,
    totalVehiclesSold: mapped.length,
    grossRevenue,
    totalAcquisitionAndPrepCost,
    totalNetCapitalGain,
    exemptSalesTotal,
    taxableSalesTotal,
    estimatedTaxDue,
    vehicles: mapped,
  };
}

export interface TradeSaleAnalysis {
  dealType: 'cash_only' | 'cash_and_trade' | 'trade_only';
  originalCost: number; // Custo total do item original sendo vendido
  nominalSalePrice: number; // Valor total nominal da negociação
  cashReceived: number; // Dinheiro / PIX recebido
  
  // Item recebido na troca
  tradeItemModel: string;
  tradeItemAttributedValue: number; // Valor acordado na troca
  tradeItemFipeOrMarket: number; // Valor médio de mercado
  tradeItemPrepCost: number; // Custo estimado de revisão/limpeza
  
  // Custo de Entrada Calculado pelo Sistema
  effectiveEntryCost: number; // Custo real que o item entrou no seu bolso
  totalInvestedInTradeItem: number; // effectiveEntryCost + tradeItemPrepCost
  
  // Projeções de Revenda
  expectedResalePrice: number; // Preço previsto para venda
  expectedResaleProfit: number; // Lucro projetado na revenda do item recebido
  expectedResaleMarginPercent: number; // Margem projetada na revenda do item recebido
  
  // Operação Consolidada
  combinedTotalRevenue: number;
  combinedTotalCosts: number;
  combinedNetProfit: number;
  combinedMarginPercent: number;
  
  // Metas de Precificação do Item Recebido
  breakEvenResalePrice: number; // Preço mínimo para não ter prejuízo
  targetResalePrice15Percent: number; // Preço sugerido com 15% de margem
  targetResalePrice25Percent: number; // Preço sugerido com 25% de margem
}

/**
 * Computes exact entry cost, resale targets, and combined profit for any trade-in deal
 */
export function calculateTradeSaleDetails(params: {
  dealType: 'cash_only' | 'cash_and_trade' | 'trade_only';
  originalItemCost: number;
  salePrice: number;
  cashReceived: number;
  tradeItemModel?: string;
  tradeItemAttributedValue?: number;
  tradeItemMarketPrice?: number;
  tradeItemPrepCost?: number;
  expectedResalePrice?: number;
  cardFees?: number;
}): TradeSaleAnalysis {
  const {
    dealType,
    originalItemCost,
    salePrice,
    cashReceived,
    tradeItemModel = 'Item Recebido na Troca',
    tradeItemAttributedValue = 0,
    tradeItemMarketPrice = 0,
    tradeItemPrepCost = 0,
    expectedResalePrice = 0,
    cardFees = 0,
  } = params;

  const totalOriginalCost = originalItemCost + cardFees;

  if (dealType === 'cash_only') {
    const nominalSale = Number(salePrice) || 0;
    const profit = nominalSale - totalOriginalCost;
    const margin = nominalSale > 0 ? (profit / nominalSale) * 100 : 0;
    return {
      dealType: 'cash_only',
      originalCost: totalOriginalCost,
      nominalSalePrice: nominalSale,
      cashReceived: nominalSale,
      tradeItemModel: '',
      tradeItemAttributedValue: 0,
      tradeItemFipeOrMarket: 0,
      tradeItemPrepCost: 0,
      effectiveEntryCost: 0,
      totalInvestedInTradeItem: 0,
      expectedResalePrice: 0,
      expectedResaleProfit: 0,
      expectedResaleMarginPercent: 0,
      combinedTotalRevenue: nominalSale,
      combinedTotalCosts: totalOriginalCost,
      combinedNetProfit: profit,
      combinedMarginPercent: margin,
      breakEvenResalePrice: 0,
      targetResalePrice15Percent: 0,
      targetResalePrice25Percent: 0,
    };
  }

  if (dealType === 'cash_and_trade') {
    const cash = Number(cashReceived) || 0;
    const attributed = Number(tradeItemAttributedValue) || 0;
    const prep = Number(tradeItemPrepCost) || 0;
    const nominalSale = cash + attributed || Number(salePrice) || 0;

    // Custo residual real: o que faltou o dinheiro cobrir do custo original
    // Se o dinheiro recebido já cobriu o custo original, o custo de entrada do novo item é R$ 0!
    const effectiveEntryCost = Math.max(totalOriginalCost - cash, 0);
    const totalInvestedInTradeItem = effectiveEntryCost + prep;

    // Preço previsto de revenda
    const expectedResale =
      Number(expectedResalePrice) > 0
        ? Number(expectedResalePrice)
        : Number(tradeItemMarketPrice) > 0
        ? Number(tradeItemMarketPrice)
        : attributed > 0
        ? Math.round(attributed * 1.15)
        : Math.round(totalInvestedInTradeItem * 1.3);

    const expectedResaleProfit = expectedResale - totalInvestedInTradeItem;
    const expectedResaleMarginPercent =
      expectedResale > 0 ? (expectedResaleProfit / expectedResale) * 100 : 0;

    // Consolidado
    const combinedTotalRevenue = cash + expectedResale;
    const combinedTotalCosts = totalOriginalCost + prep;
    const combinedNetProfit = combinedTotalRevenue - combinedTotalCosts;
    const combinedMarginPercent =
      combinedTotalRevenue > 0 ? (combinedNetProfit / combinedTotalRevenue) * 100 : 0;

    // Metas de revenda para o novo item
    const breakEvenResalePrice = totalInvestedInTradeItem;
    const targetResalePrice15Percent =
      totalInvestedInTradeItem > 0 ? Math.round(totalInvestedInTradeItem / 0.85) : 0;
    const targetResalePrice25Percent =
      totalInvestedInTradeItem > 0 ? Math.round(totalInvestedInTradeItem / 0.75) : 0;

    return {
      dealType: 'cash_and_trade',
      originalCost: totalOriginalCost,
      nominalSalePrice: nominalSale,
      cashReceived: cash,
      tradeItemModel,
      tradeItemAttributedValue: attributed,
      tradeItemFipeOrMarket: Number(tradeItemMarketPrice) || 0,
      tradeItemPrepCost: prep,
      effectiveEntryCost,
      totalInvestedInTradeItem,
      expectedResalePrice: expectedResale,
      expectedResaleProfit,
      expectedResaleMarginPercent,
      combinedTotalRevenue,
      combinedTotalCosts,
      combinedNetProfit,
      combinedMarginPercent,
      breakEvenResalePrice,
      targetResalePrice15Percent,
      targetResalePrice25Percent,
    };
  }

  // dealType === 'trade_only' (Troca 100% sem dinheiro)
  const attributed = Number(tradeItemAttributedValue) || Number(salePrice) || Number(tradeItemMarketPrice) || totalOriginalCost;
  const prep = Number(tradeItemPrepCost) || 0;
  const nominalSale = attributed;

  // Custo de entrada do item recebido é exatamente o custo total que tínhamos investido no item entregue
  const effectiveEntryCost = totalOriginalCost;
  const totalInvestedInTradeItem = effectiveEntryCost + prep;

  const expectedResale =
    Number(expectedResalePrice) > 0
      ? Number(expectedResalePrice)
      : Number(tradeItemMarketPrice) > 0
      ? Number(tradeItemMarketPrice)
      : Math.round(totalInvestedInTradeItem * 1.3);

  const expectedResaleProfit = expectedResale - totalInvestedInTradeItem;
  const expectedResaleMarginPercent =
    expectedResale > 0 ? (expectedResaleProfit / expectedResale) * 100 : 0;

  const combinedTotalRevenue = expectedResale;
  const combinedTotalCosts = totalOriginalCost + prep;
  const combinedNetProfit = combinedTotalRevenue - combinedTotalCosts;
  const combinedMarginPercent =
    combinedTotalRevenue > 0 ? (combinedNetProfit / combinedTotalRevenue) * 100 : 0;

  const breakEvenResalePrice = totalInvestedInTradeItem;
  const targetResalePrice15Percent =
    totalInvestedInTradeItem > 0 ? Math.round(totalInvestedInTradeItem / 0.85) : 0;
  const targetResalePrice25Percent =
    totalInvestedInTradeItem > 0 ? Math.round(totalInvestedInTradeItem / 0.75) : 0;

  return {
    dealType: 'trade_only',
    originalCost: totalOriginalCost,
    nominalSalePrice: nominalSale,
    cashReceived: 0,
    tradeItemModel,
    tradeItemAttributedValue: attributed,
    tradeItemFipeOrMarket: Number(tradeItemMarketPrice) || 0,
    tradeItemPrepCost: prep,
    effectiveEntryCost,
    totalInvestedInTradeItem,
    expectedResalePrice: expectedResale,
    expectedResaleProfit,
    expectedResaleMarginPercent,
    combinedTotalRevenue,
    combinedTotalCosts,
    combinedNetProfit,
    combinedMarginPercent,
    breakEvenResalePrice,
    targetResalePrice15Percent,
    targetResalePrice25Percent,
  };
}
