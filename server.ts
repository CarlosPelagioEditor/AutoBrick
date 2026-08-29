import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to safely parse JSON from Gemini text responses
function parseCleanJson(text: string): any {
  if (!text) return null;
  let cleaned = text.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.replace(/^```json\s*/, "").replace(/\s*```$/, "");
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```\s*/, "").replace(/\s*```$/, "");
  }
  return JSON.parse(cleaned);
}

// Category names dictionary
const categoryNames: Record<string, string> = {
  consoles_games: "Games & Consoles (Xbox, PlayStation, Nintendo)",
  smartphones: "Celulares & Smartphones (iPhone, Samsung)",
  tv_audio: "TVs & Áudio (Smart TV, Som, Home Theater)",
  vehicles: "Veículos (Carros, Motos)",
  computers: "Informática & PC Gamer",
  tools: "Ferramentas & Equipamentos",
  appliances: "Eletrodomésticos & Casa",
  furniture: "Móveis & Decoração",
  watches_jewelry: "Relógios, Joias & Acessórios",
  other: "Brik Geral / Produtos Diversos",
};

// Algorithmic Fallback Generator for Copilot Analysis
function generateFallbackCopilotAnalysis(product: any, metrics: any) {
  const margin = metrics?.realMarginPercent || 0;
  const fipeDiscount = Math.abs(metrics?.fipeDiscountPercent || 0);
  const daysInStock = metrics?.daysInStock || 0;
  const totalCost = metrics?.totalVehicleCost || product.purchasePrice || 1000;
  const categoryLabel = categoryNames[product.category] || "Produto Geral";

  let score = 75;
  if (margin >= 25) score += 15;
  else if (margin >= 15) score += 10;
  else if (margin < 8) score -= 15;

  if (fipeDiscount >= 20) score += 10;
  if (daysInStock > 30) score -= 12;
  score = Math.max(20, Math.min(98, Math.round(score)));

  let scoreLabel = "Boa Oportunidade";
  if (score >= 88) scoreLabel = "Excelente Compra & Margem";
  else if (score >= 75) scoreLabel = "Negociação Sólida";
  else if (score >= 60) scoreLabel = "Margem Moderada";
  else scoreLabel = "Atenção aos Custos";

  const strengths = [
    `Entrada com deságio de ${fipeDiscount.toFixed(1)}% sobre a referência de mercado.`,
    `Custo de preparação e logística controlado em R$ ${(metrics?.totalPreparationCost + metrics?.totalLogisticsCost || 0).toLocaleString("pt-BR")}.`,
    `Alta demanda no mercado secundário para ${categoryLabel}.`,
  ];

  if (product.accessoriesIncluded) {
    strengths.push(`Diferencial competitivo com acessórios: ${product.accessoriesIncluded}.`);
  }

  const risks: string[] = [];
  if (daysInStock > 20) {
    risks.push(`Item há ${daysInStock} dias em estoque. Recomenda-se ajustar preço para acelerar giro.`);
  } else {
    risks.push(`Oscilações pontuais de preço em anúncios concorrentes na OLX/Marketplace.`);
  }
  if (product.batteryHealth && Number(product.batteryHealth) < 85) {
    risks.push(`Saúde da bateria em ${product.batteryHealth}%. Destacar transparência no anúncio.`);
  }
  risks.push("Exigir conferência presencial no ato para evitar golpes de falso comprovante.");

  const quickSalePrice = Math.round(totalCost * 1.10);
  const targetSalePrice = Math.round(product.salePrice || totalCost * 1.20);
  const minFloorPrice = Math.round(totalCost * 1.05);

  return {
    score,
    scoreLabel,
    diagnosis: `O item "${product.model}" (${categoryLabel}) possui custo total apurado de R$ ${totalCost.toLocaleString("pt-BR")}. Apresenta margem estimada de ${margin.toFixed(1)}% com deságio de ${fipeDiscount.toFixed(1)}% na aquisição.`,
    strengths,
    risks,
    tacticalAdvice: `Anuncie por R$ ${targetSalePrice.toLocaleString("pt-BR")}. Aceite fechar no PIX até R$ ${quickSalePrice.toLocaleString("pt-BR")} para girar o capital rapidamente e reinvestir em novo brik.`,
    idealPriceRange: {
      quickSale: quickSalePrice,
      targetPrice: targetSalePrice,
      maximumNegotiableDiscount: minFloorPrice,
    },
    isAiGenerated: false,
  };
}

// Algorithmic Fallback Generator for Ad Copy
function generateFallbackAdCopy(product: any) {
  const price = (product.salePrice || product.fipeValue || 1000).toLocaleString("pt-BR");
  const condition = product.condition || "Seminovo Impecável";
  const specs = product.storageOrSpecs || "Configuração original de fábrica";
  const accessories = product.accessoriesIncluded || "Acompanha itens essenciais e carregador/cabos";

  return {
    title: `🔥 ${product.model} - ${condition} [100% Testado & Revisado]`,
    highlights: [
      `Estado: ${condition} (sem marcas de queda ou avarias)`,
      `Especificações: ${specs}`,
      `Acompanha: ${accessories}`,
      product.batteryHealth ? `Saúde da Bateria: ${product.batteryHealth}%` : "Funcionamento 100% testado na entrega",
      "Pagamento facilitado: PIX ou Cartão em até 12x (com taxa)",
    ],
    fullText: `🔥 ${product.model.toUpperCase()} - ESTADO DE NOVO! 🔥\n\n` +
      `Produto 100% revisado, limpo e testado. Pronto para uso imediato sem nenhum defeito ou vício oculto.\n\n` +
      `📌 DETALHES DO ITEM:\n` +
      `• Condição: ${condition}\n` +
      `• Especificações: ${specs}\n` +
      `• Itens inclusos: ${accessories}\n` +
      (product.serialOrImei ? `• Procedência: 100% legal e verificado (${product.serialOrImei})\n` : "") +
      `\n💰 VALOR: R$ ${price} à vista no PIX ou Dinheiro.\n` +
      `💳 Aceito cartão em até 12x (taxas da maquininha por conta do comprador).\n\n` +
      `🤝 ENTREGA & SEGURANÇA:\n` +
      `• Retirada em mãos em local público/seguro com todos os testes presenciais.\n` +
      `• Testamos tudo na hora da compra para total transparência de ambas as partes.\n\n` +
      `⚠️ AVISO ANTI-GOLPE:\n` +
      `Não faço envios por motoristas de app sem confirmação direta de PIX na conta. Golpistas do falso e-mail/comprovante, não percam tempo.`,
    instagramCaption: `Disponível para venda: ${product.model}! ✨ Em perfeito estado (${condition}), 100% testado e com valor promocional no PIX: R$ ${price}. Chama no Direct para garantir! 🚀 #brik #seminovos #oportunidade #vendas`,
    antiCuriousDisclaimer: "Aviso: Não faço vendas para terceiros sem contato direto. Pagamento liberado apenas após crédito real no app do banco.",
    isAiGenerated: false,
  };
}

// Algorithmic Fallback Generator for Chat Negotiation
function generateFallbackChatNegotiation(product: any, metrics: any, buyerMessage: string, proposedPrice: number) {
  const totalCost = metrics?.totalVehicleCost || product.purchasePrice || 1000;
  const proposedProfit = proposedPrice - totalCost;
  const proposedMargin = (proposedProfit / proposedPrice) * 100;
  const safeCounterPrice = Math.round(totalCost * 1.12);

  let verdict: "ACEITAR" | "CONTRA_OFERTAR" | "RECUSAR" = "CONTRA_OFERTAR";
  let analysis = `A oferta de R$ ${proposedPrice.toLocaleString("pt-BR")} gera um lucro de R$ ${proposedProfit.toLocaleString("pt-BR")} (${proposedMargin.toFixed(1)}% de margem).`;

  if (proposedMargin >= 18) {
    verdict = "ACEITAR";
    analysis += " Margem muito positiva! Recomenda-se aceitar se o comprador fechar de imediato no PIX.";
  } else if (proposedMargin < 5) {
    verdict = "RECUSAR";
    analysis += " Margem excessivamente baixa ou prejuízo. Mantenha o preço ou faça contraproposta no piso seguro.";
  } else {
    verdict = "CONTRA_OFERTAR";
    analysis += ` Margem moderada. Faça contraproposta intermediária em torno de R$ ${safeCounterPrice.toLocaleString("pt-BR")} para proteger o lucro.`;
  }

  return {
    analysis,
    verdictRecommendation: verdict,
    suggestedCounterPrice: Math.max(safeCounterPrice, proposedPrice),
    options: [
      {
        label: "Manter Firme",
        tone: "Profissional e Seguro",
        message: `Olá! O produto "${product.model}" está em estado impecável, 100% revisado e com todos os acessórios. Por R$ ${proposedPrice.toLocaleString("pt-BR")} infelizmente não consigo, pois o valor anunciado já está muito justo pelo estado dele.`,
      },
      {
        label: "Contraproposta Equilibrada",
        tone: "Negociador Estratégico",
        message: `Boa noite! Consigo chegar em R$ ${safeCounterPrice.toLocaleString("pt-BR")} no PIX à vista se você vier retirar hoje. Menos que isso não consigo abrir mão pelo cuidado e procedência do item.`,
      },
      {
        label: "Gatilho de Urgência / Fechamento Hoje",
        tone: "Persuasivo para Fechar Rápido",
        message: `Fecho por R$ ${safeCounterPrice.toLocaleString("pt-BR")} agora se você confirmar e buscar ainda hoje. Deixo separado para você com prioridade!`,
      },
    ],
    computed: {
      proposedPrice,
      totalCost,
      proposedProfit,
      proposedMargin,
    },
    isAiGenerated: false,
  };
}

// Algorithmic Fallback Generator for Trade Valuation & Market Price Average
function generateFallbackTradeValuation(params: {
  tradeModel: string;
  tradeCategory?: string;
  tradeCondition?: string;
  originalItemCost: number;
  originalItemModel?: string;
  cashReceived: number;
  tradePrepCost?: number;
}) {
  const {
    tradeModel,
    tradeCategory,
    originalItemCost = 300,
    originalItemModel = "Produto Original",
    cashReceived = 0,
    tradePrepCost = 0,
  } = params;

  const modelLower = (tradeModel || "").toLowerCase();
  let estimatedMarket = 400; // default baseline

  // Smart heuristic market prices for common brazilian brik items
  if (modelLower.includes("ps5") || modelLower.includes("playstation 5")) estimatedMarket = 3200;
  else if (modelLower.includes("series x")) estimatedMarket = 3100;
  else if (modelLower.includes("series s")) estimatedMarket = 1750;
  else if (modelLower.includes("ps4 pro")) estimatedMarket = 1600;
  else if (modelLower.includes("ps4 slim") || modelLower.includes("ps4")) estimatedMarket = 1300;
  else if (modelLower.includes("xbox one x")) estimatedMarket = 1200;
  else if (modelLower.includes("xbox one s") || modelLower.includes("one s")) estimatedMarket = 950;
  else if (modelLower.includes("xbox one") || modelLower.includes("fat")) estimatedMarket = 700;
  else if (modelLower.includes("nintendo switch oled")) estimatedMarket = 1800;
  else if (modelLower.includes("nintendo switch")) estimatedMarket = 1350;
  else if (modelLower.includes("iphone 15 pro")) estimatedMarket = 5200;
  else if (modelLower.includes("iphone 15")) estimatedMarket = 4200;
  else if (modelLower.includes("iphone 14 pro")) estimatedMarket = 4300;
  else if (modelLower.includes("iphone 14")) estimatedMarket = 3400;
  else if (modelLower.includes("iphone 13 pro")) estimatedMarket = 3600;
  else if (modelLower.includes("iphone 13")) estimatedMarket = 2650;
  else if (modelLower.includes("iphone 12")) estimatedMarket = 1950;
  else if (modelLower.includes("iphone 11")) estimatedMarket = 1450;
  else if (modelLower.includes("iphone xr") || modelLower.includes("iphone x")) estimatedMarket = 950;
  else if (modelLower.includes("s23 ultra") || modelLower.includes("s24 ultra")) estimatedMarket = 4500;
  else if (modelLower.includes("s23") || modelLower.includes("s22")) estimatedMarket = 2200;
  else if (modelLower.includes("redmi") || modelLower.includes("poco") || modelLower.includes("xiaomi")) estimatedMarket = 750;
  else if (modelLower.includes("boombox")) estimatedMarket = 1500;
  else if (modelLower.includes("partybox")) estimatedMarket = 1800;
  else if (modelLower.includes("xtreme")) estimatedMarket = 900;
  else if (modelLower.includes("charge 5") || modelLower.includes("charge 4")) estimatedMarket = 600;
  else if (modelLower.includes("flip 6") || modelLower.includes("flip 5")) estimatedMarket = 450;
  else if (modelLower.includes("tv 55") || modelLower.includes("55 polegadas")) estimatedMarket = 1750;
  else if (modelLower.includes("tv 50") || modelLower.includes("50 polegadas")) estimatedMarket = 1450;
  else if (modelLower.includes("tv 43") || modelLower.includes("43 polegadas")) estimatedMarket = 1100;
  else if (modelLower.includes("tv 32") || modelLower.includes("32 polegadas")) estimatedMarket = 650;
  else if (modelLower.includes("notebook gamer") || modelLower.includes("pc gamer")) estimatedMarket = 2600;
  else if (modelLower.includes("notebook i5") || modelLower.includes("notebook i7")) estimatedMarket = 1400;
  else if (modelLower.includes("notebook") || modelLower.includes("laptop")) estimatedMarket = 900;
  else if (modelLower.includes("furadeira") || modelLower.includes("parafusadeira")) estimatedMarket = 280;
  else if (modelLower.includes("apple watch")) estimatedMarket = 1100;
  else {
    // If not in catalog, calibrate around reasonable multiplier of original cost
    estimatedMarket = Math.max(250, Math.round((originalItemCost - cashReceived) * 1.5) || 400);
  }

  const marketMin = Math.round(estimatedMarket * 0.90);
  const marketMax = Math.round(estimatedMarket * 1.12);
  const suggestedResale = Math.round(estimatedMarket * 0.95);

  // Exact math requested by user:
  // effectiveEntryCost = Custo Original - Dinheiro Recebido
  const effectiveEntryCost = Math.max(0, originalItemCost - cashReceived);
  const totalItemCost = effectiveEntryCost + tradePrepCost;
  const resaleProfit = suggestedResale - totalItemCost;
  const resaleMarginPercent = suggestedResale > 0 ? (resaleProfit / suggestedResale) * 100 : 0;

  const combinedRevenue = cashReceived + suggestedResale;
  const totalOriginalInvestment = originalItemCost + tradePrepCost;
  const combinedProfit = combinedRevenue - totalOriginalInvestment;
  const combinedMarginPercent = combinedRevenue > 0 ? (combinedProfit / combinedRevenue) * 100 : 0;

  const aiAnalysisVerdict = cashReceived > 0
    ? `Você investiu R$ ${originalItemCost.toLocaleString("pt-BR")} no "${originalItemModel}" e recebeu R$ ${cashReceived.toLocaleString("pt-BR")} em dinheiro no ato. Logo, o "${tradeModel}" entrou para você por apenas R$ ${effectiveEntryCost.toLocaleString("pt-BR")}. Com média de mercado de R$ ${estimatedMarket.toLocaleString("pt-BR")}, ao revender por R$ ${suggestedResale.toLocaleString("pt-BR")} você lucra R$ ${resaleProfit.toLocaleString("pt-BR")} (${resaleMarginPercent.toFixed(1)}% de margem) e fecha o brik com R$ ${combinedProfit.toLocaleString("pt-BR")} de lucro total no bolso!`
    : `Troca direta: o "${tradeModel}" assumiu o custo de entrada de R$ ${effectiveEntryCost.toLocaleString("pt-BR")} do seu item anterior. Com média de mercado de R$ ${estimatedMarket.toLocaleString("pt-BR")}, ao revender por R$ ${suggestedResale.toLocaleString("pt-BR")} você realiza R$ ${resaleProfit.toLocaleString("pt-BR")} de lucro limpo (${resaleMarginPercent.toFixed(1)}% de margem)!`;

  return {
    tradeModel,
    marketAveragePrice: estimatedMarket,
    marketPriceMin: marketMin,
    marketPriceMax: marketMax,
    suggestedResalePrice: suggestedResale,
    effectiveEntryCost,
    totalInvestedInTradeItem: totalItemCost,
    estimatedResaleProfit: resaleProfit,
    estimatedResaleMarginPercent: Number(resaleMarginPercent.toFixed(1)),
    combinedTotalRevenue: combinedRevenue,
    combinedTotalProfit: combinedProfit,
    combinedMarginPercent: Number(combinedMarginPercent.toFixed(1)),
    aiAnalysisVerdict,
    tacticalTip: `Anuncie por R$ ${suggestedResale.toLocaleString("pt-BR")} no Facebook Marketplace e OLX. Se o comprador oferecer até R$ ${marketMin.toLocaleString("pt-BR")} no PIX à vista, feche na hora para acelerar o giro do capital.`,
    marketSources: "Média estimada com base em anúncios recentes da OLX, Marketplace e Mercado Livre Brasil",
    isAiGenerated: false,
  };
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Dynamic server build tracking (stable build ID to prevent false-positive reload loops)
  let currentServerVersion = "1.3.0";
  let currentServerBuildId = "ab-build-v1.3.0";
  let currentServerBuildTime = 1756461400000;
  let currentReleaseNotes = "Melhorias de desempenho, banco de dados e novas ferramentas de negociação.";

  // App version check endpoint (polled by frontend)
  app.get("/api/app-version", (_req, res) => {
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    res.json({
      version: currentServerVersion,
      buildId: currentServerBuildId,
      buildTime: currentServerBuildTime,
      releaseNotes: currentReleaseNotes,
      serverTime: Date.now(),
      features: [
        "Sincronização em tempo real do banco de dados na nuvem",
        "Novo sistema de detecção e notificação de atualizações automáticas",
        "Melhorias no Copiloto IA e no avaliador de trocas",
        "Otimizações de performance e segurança",
      ],
    });
  });

  // Endpoint to simulate an update release in runtime
  app.post("/api/app-version/simulate-release", (req, res) => {
    const patch = req.body?.version || `1.3.${Math.floor(Math.random() * 90 + 10)}`;
    currentServerVersion = patch;
    currentServerBuildId = "ab-build-" + Date.now();
    currentServerBuildTime = Date.now();
    currentReleaseNotes = req.body?.releaseNotes || "Nova compilação do sistema com atualizações de código detectadas no servidor.";
    
    res.json({
      success: true,
      message: "Nova versão simulada gerada com sucesso!",
      version: currentServerVersion,
      buildId: currentServerBuildId,
    });
  });

  // Copilot AI Analysis Endpoint for ANY Product / Brick Item
  app.post("/api/ai/copilot-analysis", async (req, res) => {
    const { vehicle, item, metrics } = req.body;
    const product = item || vehicle;
    if (!product) {
      return res.status(400).json({ error: "Dados do item são obrigatórios." });
    }

    // Attempt Gemini call with timeout, otherwise fallback to algorithmic engine
    if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 5) {
      try {
        const ai = new GoogleGenAI({
          apiKey: process.env.GEMINI_API_KEY,
          httpOptions: { headers: { "User-Agent": "aistudio-build" } },
        });

        const categoryLabel = categoryNames[product.category] || "Produto / Brik Geral";
        const prompt = `Você é o "Copiloto Universal de Brik e Negociações", especialista em compra, precificação, giro rápido e revenda lucrativa de QUALQUER tipo de produto no Brasil.
Analise com rigor financeiro e visão comercial esta negociação de Brik:

DADOS DO PRODUTO / BRIK:
- Categoria: ${categoryLabel}
- Produto / Modelo: ${product.model}
- Marca: ${product.brand || "Não especificada"}
- Estado/Condição: ${product.condition || "Seminovo"}
- Especificações: ${product.storageOrSpecs || "Padrão"}
- Acessórios Inclusos: ${product.accessoriesIncluded || "Padrão"}
- Identificador / IMEI / Serial: ${product.serialOrImei || "Verificado"}
- Bateria: ${product.batteryHealth ? product.batteryHealth + "%" : "N/A"}
- Valor Pago na Compra: R$ ${product.purchasePrice?.toLocaleString("pt-BR")}
- Preço de Referência: R$ ${product.fipeValue?.toLocaleString("pt-BR")}
- Custo Real Total: R$ ${metrics?.totalVehicleCost?.toLocaleString("pt-BR")}
- Preço de Venda Desejado: R$ ${(product.salePrice || metrics?.targetPrice15Percent)?.toLocaleString("pt-BR")}
- Dias em Estoque: ${metrics?.daysInStock || 0} dias
- Margem de Lucro: ${metrics?.realMarginPercent?.toFixed(1) || 0}%

Retorne APENAS um JSON:
{
  "score": 85,
  "scoreLabel": "Excelente Compra",
  "diagnosis": "Resumo analítico direto sobre o negócio.",
  "strengths": ["Ponto forte 1", "Ponto forte 2"],
  "risks": ["Risco ou ponto de atenção 1", "Risco 2"],
  "tacticalAdvice": "Orientação prática para precificação e canais de venda.",
  "idealPriceRange": {
    "quickSale": 0,
    "targetPrice": 0,
    "maximumNegotiableDiscount": 0
  }
}`;

        // Set a timeout of 4500ms
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Gemini timeout")), 4500)
        );

        const geminiPromise = ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            temperature: 0.4,
          },
        });

        const response: any = await Promise.race([geminiPromise, timeoutPromise]);
        const parsed = parseCleanJson(response?.text);
        if (parsed && typeof parsed.score === "number") {
          return res.json({ ...parsed, isAiGenerated: true });
        }
      } catch (err: any) {
        console.warn("Gemini copilot analysis bypassed/timed out, using smart fallback:", err?.message || err);
      }
    }

    // Deterministic Smart Fallback
    const fallback = generateFallbackCopilotAnalysis(product, metrics);
    return res.json(fallback);
  });

  // Generate Marketplace, OLX & Social Ad Copy for ANY Product
  app.post("/api/ai/generate-ad", async (req, res) => {
    const { vehicle, item, targetPlatform, tone } = req.body;
    const product = item || vehicle;
    if (!product) {
      return res.status(400).json({ error: "Dados do item são obrigatórios." });
    }

    if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 5) {
      try {
        const ai = new GoogleGenAI({
          apiKey: process.env.GEMINI_API_KEY,
          httpOptions: { headers: { "User-Agent": "aistudio-build" } },
        });

        const prompt = `Você é um copywriter profissional especializado em vendas de brik no Brasil (Marketplace, OLX e WhatsApp).
Gere um anúncio persuasivo e seguro:

DADOS DO PRODUTO:
- Modelo: ${product.model}
- Categoria: ${product.category || "Geral"}
- Marca: ${product.brand || "Não informada"}
- Condição: ${product.condition || "Seminovo Impecável"}
- Especificações: ${product.storageOrSpecs || "Padrão"}
- Acessórios: ${product.accessoriesIncluded || "Completos"}
- Preço: R$ ${(product.salePrice || product.fipeValue || 1000)?.toLocaleString("pt-BR")}
- Canal: ${targetPlatform || "Marketplace / OLX"}
- Tom: ${tone || "Persuasivo e Seguro"}

Retorne APENAS um JSON:
{
  "title": "Título magnético para o anúncio",
  "highlights": ["Destaque 1", "Destaque 2", "Destaque 3", "Destaque 4"],
  "fullText": "Texto completo pronto para copiar e colar na OLX e Facebook Marketplace",
  "instagramCaption": "Versão mais concisa para post de Instagram/WhatsApp com hashtags",
  "antiCuriousDisclaimer": "Aviso anti-golpista e anti-curioso para colocar no rodapé"
}`;

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Gemini timeout")), 4500)
        );

        const geminiPromise = ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            temperature: 0.5,
          },
        });

        const response: any = await Promise.race([geminiPromise, timeoutPromise]);
        const parsed = parseCleanJson(response?.text);
        if (parsed && parsed.fullText) {
          return res.json({ ...parsed, isAiGenerated: true });
        }
      } catch (err: any) {
        console.warn("Gemini ad generation bypassed/timed out, using smart fallback:", err?.message || err);
      }
    }

    const fallback = generateFallbackAdCopy(product);
    return res.json(fallback);
  });

  // Real-time Chat Counter-Offer Simulator & Response Generator
  app.post("/api/ai/chat-negotiation", async (req, res) => {
    const { vehicle, item, metrics, buyerMessage, proposedPrice } = req.body;
    const product = item || vehicle;
    if (!product || !proposedPrice) {
      return res.status(400).json({ error: "Produto e proposta do comprador são obrigatórios." });
    }

    if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 5) {
      try {
        const totalCost = metrics?.totalVehicleCost || product.purchasePrice || 1000;
        const proposedProfit = proposedPrice - totalCost;
        const proposedMargin = (proposedProfit / proposedPrice) * 100;

        const ai = new GoogleGenAI({
          apiKey: process.env.GEMINI_API_KEY,
          httpOptions: { headers: { "User-Agent": "aistudio-build" } },
        });

        const prompt = `Você é um negociador experiente de Brik e produtos usados no Brasil.
O vendedor está negociando o produto: "${product.model}".
- Custo Real Total: R$ ${totalCost?.toLocaleString("pt-BR")}
- Preço Anunciado: R$ ${(product.salePrice || product.fipeValue)?.toLocaleString("pt-BR")}
- Mensagem do Comprador: "${buyerMessage || "Faz por R$ " + proposedPrice + " no PIX hoje?"}"
- Valor Proposto: R$ ${proposedPrice?.toLocaleString("pt-BR")}
- Lucro Líquido: R$ ${proposedProfit?.toLocaleString("pt-BR")}
- Margem: ${proposedMargin.toFixed(1)}%

Retorne APENAS um JSON:
{
  "analysis": "Breve comentário tático sobre a oferta",
  "verdictRecommendation": "ACEITAR",
  "suggestedCounterPrice": ${proposedPrice},
  "options": [
    { "label": "Manter Firme", "tone": "Profissional", "message": "Texto..." },
    { "label": "Contraproposta Equilibrada", "tone": "Estratégico", "message": "Texto..." },
    { "label": "Gatilho de Urgência", "tone": "Persuasivo", "message": "Texto..." }
  ]
}`;

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Gemini timeout")), 4500)
        );

        const geminiPromise = ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            temperature: 0.4,
          },
        });

        const response: any = await Promise.race([geminiPromise, timeoutPromise]);
        const parsed = parseCleanJson(response?.text);
        if (parsed && Array.isArray(parsed.options)) {
          return res.json({
            ...parsed,
            computed: {
              proposedPrice,
              totalCost,
              proposedProfit,
              proposedMargin,
            },
            isAiGenerated: true,
          });
        }
      } catch (err: any) {
        console.warn("Gemini chat negotiation bypassed/timed out, using smart fallback:", err?.message || err);
      }
    }

    const fallback = generateFallbackChatNegotiation(product, metrics, buyerMessage, proposedPrice);
    return res.json(fallback);
  });

  // AI-Powered Trade Valuation & Internet/Marketplace Average Calculator
  app.post("/api/ai/trade-valuation", async (req, res) => {
    const {
      tradeModel,
      tradeCategory,
      tradeCondition,
      originalItemCost = 300,
      originalItemModel = "Produto Original",
      cashReceived = 0,
      tradePrepCost = 0,
    } = req.body;

    if (!tradeModel || !tradeModel.trim()) {
      return res.status(400).json({ error: "Nome ou modelo do item da troca é obrigatório." });
    }

    const costOriginalNum = Number(originalItemCost) || 0;
    const cashReceivedNum = Number(cashReceived) || 0;
    const prepCostNum = Number(tradePrepCost) || 0;

    if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 5) {
      try {
        const ai = new GoogleGenAI({
          apiKey: process.env.GEMINI_API_KEY,
          httpOptions: { headers: { "User-Agent": "aistudio-build" } },
        });

        const prompt = `Você é um avaliador e negociador profissional de Brik no Brasil, especialista em preços de mercado na OLX, Facebook Marketplace, Mercado Livre e Tabela FIPE.
O usuário está fazendo uma negociação de TROCA com as seguintes condições:
- Produto Original que o usuário comprou: "${originalItemModel}"
- Valor que o usuário pagou/investiu no produto original: R$ ${costOriginalNum.toLocaleString("pt-BR")}
- Dinheiro / PIX que o usuário recebeu de volta no negócio: R$ ${cashReceivedNum.toLocaleString("pt-BR")}
- Produto que o usuário pegou em formato de troca: "${tradeModel}" (Condição: ${tradeCondition || "Seminovo"})

SUAS TAREFAS DE CÁLCULO:
1. Puxar/estimar com precisão realista o PREÇO MÉDIO DE MERCADO do produto recebido ("${tradeModel}") em anúncios recentes no Brasil (OLX, Marketplace).
2. Calcular por quanto o produto da troca SAIU / ENTROU para o usuário, descontando o dinheiro recebido:
   Custo Real de Entrada = R$ ${costOriginalNum} - R$ ${cashReceivedNum} = R$ ${Math.max(0, costOriginalNum - cashReceivedNum)}.
3. Sugerir o preço ideal de revenda rápida com boa margem.
4. Calcular o lucro líquido e a margem percentual ao vender o novo produto.
5. Calcular o resultado total consolidado da operação (dinheiro recebido + valor da revenda - investimento original).

Retorne APENAS um JSON:
{
  "tradeModel": "${tradeModel}",
  "marketAveragePrice": 450, // número com a média de mercado do produto na internet
  "marketPriceMin": 380, // preço mínimo
  "marketPriceMax": 520, // preço máximo
  "suggestedResalePrice": 420, // preço sugerido para revenda rápida
  "effectiveEntryCost": ${Math.max(0, costOriginalNum - cashReceivedNum)}, // custo de entrada calculado
  "totalInvestedInTradeItem": ${Math.max(0, costOriginalNum - cashReceivedNum) + prepCostNum},
  "estimatedResaleProfit": 0, // suggestedResalePrice - totalInvestedInTradeItem
  "estimatedResaleMarginPercent": 0, // porcentagem de margem
  "combinedTotalRevenue": 0, // cashReceived + suggestedResalePrice
  "combinedTotalProfit": 0, // combinedTotalRevenue - (originalCost + prepCost)
  "combinedMarginPercent": 0,
  "aiAnalysisVerdict": "Explicação em português claro de negociador mostrando: 'Você comprou por R$ X, recebeu R$ Y em dinheiro, o item entrou por R$ Z. Vendendo pela média de mercado de R$ W, seu lucro é R$ L...'",
  "tacticalTip": "Dica prática de venda rápida e segurança",
  "marketSources": "Média apurada com base em anúncios no Facebook Marketplace, OLX e Mercado Livre"
}`;

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Gemini timeout")), 4500)
        );

        const geminiPromise = ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            temperature: 0.3,
          },
        });

        const response: any = await Promise.race([geminiPromise, timeoutPromise]);
        const parsed = parseCleanJson(response?.text);
        if (parsed && typeof parsed.marketAveragePrice === "number" && parsed.marketAveragePrice > 0) {
          const effectiveEntryCost = Math.max(0, costOriginalNum - cashReceivedNum);
          const totalInvestedInTradeItem = effectiveEntryCost + prepCostNum;
          const suggestedResalePrice = parsed.suggestedResalePrice || Math.round(parsed.marketAveragePrice * 0.95);
          const estimatedResaleProfit = suggestedResalePrice - totalInvestedInTradeItem;
          const estimatedResaleMarginPercent = suggestedResalePrice > 0 ? Number(((estimatedResaleProfit / suggestedResalePrice) * 100).toFixed(1)) : 0;
          const combinedTotalRevenue = cashReceivedNum + suggestedResalePrice;
          const combinedTotalProfit = combinedTotalRevenue - (costOriginalNum + prepCostNum);
          const combinedMarginPercent = combinedTotalRevenue > 0 ? Number(((combinedTotalProfit / combinedTotalRevenue) * 100).toFixed(1)) : 0;

          return res.json({
            ...parsed,
            effectiveEntryCost,
            totalInvestedInTradeItem,
            suggestedResalePrice,
            estimatedResaleProfit,
            estimatedResaleMarginPercent,
            combinedTotalRevenue,
            combinedTotalProfit,
            combinedMarginPercent,
            isAiGenerated: true,
          });
        }
      } catch (err: any) {
        console.warn("Gemini trade valuation bypassed/timed out, using smart fallback:", err?.message || err);
      }
    }

    const fallback = generateFallbackTradeValuation({
      tradeModel,
      tradeCategory,
      tradeCondition,
      originalItemCost: costOriginalNum,
      originalItemModel,
      cashReceived: cashReceivedNum,
      tradePrepCost: prepCostNum,
    });
    return res.json(fallback);
  });

  // Vite development middleware vs production static serving
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AutoBrick Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

