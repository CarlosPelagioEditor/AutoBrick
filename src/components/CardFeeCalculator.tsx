import React, { useState } from 'react';
import {
  CreditCard,
  Copy,
  Check,
  Percent,
  TrendingDown,
  DollarSign,
  Share2,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { formatBRL, formatPercent } from '../utils/calculations';
import { CardMachinePreset } from '../types';

export const CARD_PRESETS: CardMachinePreset[] = [
  {
    id: 'infinitepay',
    name: 'InfinitePay (Smart)',
    brand: 'InfinitePay',
    debitFee: 0.75,
    credit1xFee: 2.89,
    rates: [
      { installments: 1, label: '1x (À Vista)', feePercent: 2.89 },
      { installments: 2, label: '2x', feePercent: 4.15 },
      { installments: 3, label: '3x', feePercent: 4.95 },
      { installments: 4, label: '4x', feePercent: 5.75 },
      { installments: 5, label: '5x', feePercent: 6.55 },
      { installments: 6, label: '6x', feePercent: 7.35 },
      { installments: 7, label: '7x', feePercent: 8.15 },
      { installments: 8, label: '8x', feePercent: 8.95 },
      { installments: 9, label: '9x', feePercent: 9.75 },
      { installments: 10, label: '10x', feePercent: 10.55 },
      { installments: 11, label: '11x', feePercent: 11.35 },
      { installments: 12, label: '12x', feePercent: 12.15 },
      { installments: 18, label: '18x', feePercent: 16.95 },
    ],
  },
  {
    id: 'ton_black',
    name: 'Ton (Plano Black/Pro)',
    brand: 'Ton Stone',
    debitFee: 0.99,
    credit1xFee: 3.19,
    rates: [
      { installments: 1, label: '1x (À Vista)', feePercent: 3.19 },
      { installments: 2, label: '2x', feePercent: 4.99 },
      { installments: 3, label: '3x', feePercent: 5.89 },
      { installments: 4, label: '4x', feePercent: 6.79 },
      { installments: 5, label: '5x', feePercent: 7.69 },
      { installments: 6, label: '6x', feePercent: 8.59 },
      { installments: 7, label: '7x', feePercent: 9.49 },
      { installments: 8, label: '8x', feePercent: 10.39 },
      { installments: 9, label: '9x', feePercent: 11.29 },
      { installments: 10, label: '10x', feePercent: 12.19 },
      { installments: 11, label: '11x', feePercent: 13.09 },
      { installments: 12, label: '12x', feePercent: 13.99 },
      { installments: 18, label: '18x', feePercent: 19.49 },
    ],
  },
  {
    id: 'mercadopago',
    name: 'Mercado Pago (Point Pro/Smart)',
    brand: 'Mercado Pago',
    debitFee: 1.49,
    credit1xFee: 4.49,
    rates: [
      { installments: 1, label: '1x (À Vista)', feePercent: 4.49 },
      { installments: 2, label: '2x', feePercent: 6.39 },
      { installments: 3, label: '3x', feePercent: 7.59 },
      { installments: 4, label: '4x', feePercent: 8.79 },
      { installments: 5, label: '5x', feePercent: 9.99 },
      { installments: 6, label: '6x', feePercent: 11.19 },
      { installments: 7, label: '7x', feePercent: 12.39 },
      { installments: 8, label: '8x', feePercent: 13.59 },
      { installments: 9, label: '9x', feePercent: 14.79 },
      { installments: 10, label: '10x', feePercent: 15.99 },
      { installments: 11, label: '11x', feePercent: 17.19 },
      { installments: 12, label: '12x', feePercent: 18.39 },
      { installments: 18, label: '18x', feePercent: 23.99 },
    ],
  },
  {
    id: 'pagbank',
    name: 'PagBank / PagSeguro',
    brand: 'PagBank',
    debitFee: 1.39,
    credit1xFee: 3.99,
    rates: [
      { installments: 1, label: '1x (À Vista)', feePercent: 3.99 },
      { installments: 2, label: '2x', feePercent: 5.79 },
      { installments: 3, label: '3x', feePercent: 6.99 },
      { installments: 4, label: '4x', feePercent: 8.19 },
      { installments: 5, label: '5x', feePercent: 9.39 },
      { installments: 6, label: '6x', feePercent: 10.59 },
      { installments: 8, label: '8x', feePercent: 12.99 },
      { installments: 10, label: '10x', feePercent: 15.39 },
      { installments: 12, label: '12x', feePercent: 17.79 },
      { installments: 18, label: '18x', feePercent: 22.99 },
    ],
  },
];

interface CardFeeCalculatorProps {
  initialAmount?: number;
  productName?: string;
}

export const CardFeeCalculator: React.FC<CardFeeCalculatorProps> = ({
  initialAmount = 1500,
  productName = 'Item do Estoque',
}) => {
  const [productTitle, setProductTitle] = useState<string>(productName);
  const [targetAmount, setTargetAmount] = useState<number>(initialAmount);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('infinitepay');
  const [mode, setMode] = useState<'pass_fees' | 'absorb_fees'>('pass_fees');
  const [copied, setCopied] = useState<boolean>(false);

  const currentPreset =
    CARD_PRESETS.find((p) => p.id === selectedPresetId) || CARD_PRESETS[0];

  // Calculations
  const debitCalculation = {
    feePercent: currentPreset.debitFee,
    chargeAmount:
      mode === 'pass_fees'
        ? targetAmount / (1 - currentPreset.debitFee / 100)
        : targetAmount,
    netReceived:
      mode === 'pass_fees'
        ? targetAmount
        : targetAmount * (1 - currentPreset.debitFee / 100),
    feeValue:
      mode === 'pass_fees'
        ? targetAmount / (1 - currentPreset.debitFee / 100) - targetAmount
        : targetAmount * (currentPreset.debitFee / 100),
  };

  const installmentsCalculations = currentPreset.rates.map((rate) => {
    const feeRate = rate.feePercent / 100;
    let chargeAmount: number;
    let netReceived: number;
    let feeValue: number;

    if (mode === 'pass_fees') {
      // Customer pays extra so seller receives targetAmount net
      chargeAmount = targetAmount / (1 - feeRate);
      netReceived = targetAmount;
      feeValue = chargeAmount - targetAmount;
    } else {
      // Seller absorbs fees
      chargeAmount = targetAmount;
      netReceived = targetAmount * (1 - feeRate);
      feeValue = targetAmount * feeRate;
    }

    const installmentAmount = chargeAmount / rate.installments;

    return {
      installments: rate.installments,
      label: rate.label,
      feePercent: rate.feePercent,
      chargeAmount,
      installmentAmount,
      netReceived,
      feeValue,
    };
  });

  const generateWhatsAppMessage = () => {
    let msg = `💳 *OPÇÕES DE PAGAMENTO NO CARTÃO*\n`;
    if (productTitle) {
      msg += `📦 *Produto:* ${productTitle}\n`;
    }
    msg += `💵 *À vista no PIX / Dinheiro:* ${formatBRL(targetAmount)}\n\n`;
    msg += `📊 *Condições Parceladas no Cartão:*\n`;

    installmentsCalculations.forEach((item) => {
      msg += `👉 *${item.installments}x de ${formatBRL(item.installmentAmount)}* (Total: ${formatBRL(item.chargeAmount)})\n`;
    });

    msg += `\n✅ *Aprovação na hora | Levamos a maquininha no local!*`;
    return msg;
  };

  const handleCopyWhatsApp = () => {
    const text = generateWhatsAppMessage();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/80 rounded-3xl p-6 text-white shadow-xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold mb-2">
          <CreditCard className="w-3.5 h-3.5" />
          Simulador & Repasse de Maquininha de Cartão
        </div>
        <h1 className="text-2xl font-black text-white">
          Calculadora de Taxas & Tabela Pronta para WhatsApp
        </h1>
        <p className="text-xs text-slate-300 max-w-2xl mt-1">
          Calcule em segundos o repasse exato de juros da maquininha (1x a 18x) para o cliente ou descubra quanto você recebe líquido sem perder a margem de lucro do seu brik.
        </p>
      </div>

      {/* Control Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Input parameters */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5">
          <h2 className="text-sm font-black text-amber-400 flex items-center gap-2">
            <Sliders className="w-4 h-4" /> Configuração da Venda
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Nome do Produto (Para a Mensagem):
              </label>
              <input
                type="text"
                value={productTitle}
                onChange={(e) => setProductTitle(e.target.value)}
                placeholder="Ex: iPhone 13 128GB, Xbox Series S..."
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-emerald-400 mb-1">
                {mode === 'pass_fees'
                  ? 'Valor Líquido que você quer receber (R$):'
                  : 'Valor Anunciado do Produto (R$):'}
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-400 font-bold text-sm">
                  R$
                </span>
                <input
                  type="number"
                  value={targetAmount || ''}
                  onChange={(e) => setTargetAmount(Number(e.target.value))}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-emerald-500/50 rounded-xl text-sm font-black text-emerald-400 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Modelo da Maquininha / Operadora:
              </label>
              <select
                value={selectedPresetId}
                onChange={(e) => setSelectedPresetId(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                {CARD_PRESETS.map((preset) => (
                  <option key={preset.id} value={preset.id}>
                    {preset.name} (Débito: {preset.debitFee}% | 1x: {preset.credit1xFee}%)
                  </option>
                ))}
              </select>
            </div>

            {/* Mode Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Quem paga as taxas da maquininha?
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMode('pass_fees')}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    mode === 'pass_fees'
                      ? 'bg-amber-500/10 border-amber-500 text-amber-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="text-xs font-black">Repassar ao Cliente</div>
                  <div className="text-[10px] opacity-80 mt-0.5">
                    Você recebe exatamente {formatBRL(targetAmount)}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setMode('absorb_fees')}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    mode === 'absorb_fees'
                      ? 'bg-sky-500/10 border-sky-500 text-sky-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="text-xs font-black">Assumir Taxas</div>
                  <div className="text-[10px] opacity-80 mt-0.5">
                    Taxas descontadas do seu lucro
                  </div>
                </button>
              </div>
            </div>

            {/* Copy Button */}
            <button
              type="button"
              onClick={handleCopyWhatsApp}
              className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>Tabela Copiada com Sucesso!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copiar Tabela Formatada para WhatsApp</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right 2 Columns: Installments Table */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-black text-white flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400" /> Tabela de Parcelamento (1x a 18x)
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Valores calculados automaticamente pela taxa real da operadora {currentPreset.name}.
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block">Débito ({currentPreset.debitFee}%):</span>
              <span className="text-xs font-black text-emerald-400">
                Cobrar {formatBRL(debitCalculation.chargeAmount)} (Líquido: {formatBRL(debitCalculation.netReceived)})
              </span>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 text-[11px] uppercase tracking-wider font-bold">
                <tr>
                  <th className="py-3 px-3.5">Parcelas</th>
                  <th className="py-3 px-3.5">Taxa (%)</th>
                  <th className="py-3 px-3.5">Valor da Parcela</th>
                  <th className="py-3 px-3.5">Total Cobrado</th>
                  <th className="py-3 px-3.5 text-right">Líquido na sua Conta</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-900/60 font-medium">
                {installmentsCalculations.map((item) => (
                  <tr
                    key={item.installments}
                    className="hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-2.5 px-3.5 font-bold text-white flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-slate-800 text-[10px] flex items-center justify-center text-amber-400 font-black">
                        {item.installments}
                      </span>
                      <span>{item.label}</span>
                    </td>
                    <td className="py-2.5 px-3.5 text-slate-400 font-mono">
                      {item.feePercent.toFixed(2)}%
                    </td>
                    <td className="py-2.5 px-3.5 font-black text-amber-400">
                      {formatBRL(item.installmentAmount)}
                    </td>
                    <td className="py-2.5 px-3.5 text-slate-300 font-bold">
                      {formatBRL(item.chargeAmount)}
                    </td>
                    <td className="py-2.5 px-3.5 text-right font-black text-emerald-400">
                      {formatBRL(item.netReceived)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Quick Preview of the WhatsApp message */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400 font-bold">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <Share2 className="w-3.5 h-3.5" /> Prévia da Mensagem do WhatsApp:
              </span>
              <button
                type="button"
                onClick={handleCopyWhatsApp}
                className="text-[11px] text-amber-400 hover:text-amber-300 cursor-pointer"
              >
                {copied ? 'Copiado!' : 'Copiar'}
              </button>
            </div>
            <pre className="text-[11px] text-slate-300 font-mono whitespace-pre-wrap leading-relaxed select-all">
              {generateWhatsAppMessage()}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
