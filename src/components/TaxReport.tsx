import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { generateTaxReport, formatBRL } from '../utils/calculations';
import { getCategoryInfo } from '../utils/categories';
import {
  FileSpreadsheet,
  Download,
  Printer,
  ShieldCheck,
  Info,
  Calendar,
  DollarSign,
  TrendingUp,
  Package,
} from 'lucide-react';

export const TaxReport: React.FC = () => {
  const { vehicles, currentUser } = useAuth();
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);

  const report = generateTaxReport(vehicles, selectedYear);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = [
      'Categoria',
      'Item/Modelo',
      'Data Venda',
      'Preco Venda (R$)',
      'Custo Aquisicao + Prep (R$)',
      'Ganho de Capital Liquido (R$)',
      'Status Isencao (Art 22 Lei 9250)',
    ];

    const rows = report.vehicles.map((v) => [
      `"${getCategoryInfo(v.vehicle.category).name.split('(')[0]}"`,
      `"${v.vehicle.model}"`,
      v.vehicle.saleDate || '',
      v.vehicle.salePrice || 0,
      v.metrics.totalVehicleCost.toFixed(2),
      v.metrics.netProfit.toFixed(2),
      v.isExempt ? 'Isento (Ate R$ 35 mil no mes)' : 'Tributavel (GCAP 15%)',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `relatorio_fiscal_brick_${selectedYear}_${currentUser?.id || 'tenant'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/80 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-semibold mb-2">
            <FileSpreadsheet className="w-3.5 h-3.5" />
            Módulo C: Memória Fiscal & Declaração de Ganho de Capital (GCAP)
          </div>
          <h1 className="text-2xl font-black text-white">
            Relatório de Ganho de Capital & IRPF ({selectedYear})
          </h1>
          <p className="text-xs text-slate-300 max-w-2xl mt-1">
            Organização contábil de bens móveis (eletrônicos, games, veículos, etc.) com apuração de isenção de pequeno valor (até R$ 35.000/mês - Art. 22 da Lei nº 9.250/95) e estimativa de imposto devido.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-purple-500 cursor-pointer"
          >
            <option value={currentYear}>{currentYear}</option>
            <option value={currentYear - 1}>{currentYear - 1}</option>
            <option value={currentYear - 2}>{currentYear - 2}</option>
          </select>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition-all flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-purple-400" />
            Exportar CSV
          </button>

          <button
            onClick={handlePrint}
            className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-600/20 transition-all flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            Imprimir
          </button>
        </div>
      </div>

      {/* Tax Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div className="text-slate-400 text-xs font-semibold mb-1">Itens Vendidos no Ano</div>
          <div className="text-2xl font-black text-white">{report.totalVehiclesSold}</div>
          <div className="text-[11px] text-slate-400 mt-1">Total de transações fechadas</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div className="text-slate-400 text-xs font-semibold mb-1">Faturamento Bruto Total</div>
          <div className="text-2xl font-black text-white">{formatBRL(report.grossRevenue)}</div>
          <div className="text-[11px] text-slate-400 mt-1">Custos totais: {formatBRL(report.totalAcquisitionAndPrepCost)}</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div className="text-slate-400 text-xs font-semibold mb-1">Ganho de Capital Líquido</div>
          <div className="text-2xl font-black text-emerald-400">{formatBRL(report.totalNetCapitalGain)}</div>
          <div className="text-[11px] text-emerald-400/80 mt-1">Lucro real apurado no período</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div className="text-slate-400 text-xs font-semibold mb-1">Estimativa de IR Devido (GCAP)</div>
          <div className="text-2xl font-black text-purple-400">{formatBRL(report.estimatedTaxDue)}</div>
          <div className="text-[11px] text-purple-300 mt-1">
            {report.taxableSalesTotal > 0 ? 'Incidente sobre vendas tributáveis' : '100% Isento por Pequeno Valor'}
          </div>
        </div>

      </div>

      {/* Tax Exemption Legal Notice */}
      <div className="bg-purple-950/20 border border-purple-500/30 rounded-3xl p-5 text-xs text-slate-300 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-bold text-purple-300">Regra de Isenção da Receita Federal (Pessoa Física):</div>
          <p className="text-slate-300 leading-relaxed">
            São isentos do Imposto sobre a Renda os ganhos de capital auferidos na alienação de bens e direitos de pequeno valor, cujo preço unitário de alienação, no mês em que esta se realizar, seja igual ou inferior a <strong>R$ 35.000,00</strong> (trinta e cinco mil reais) para qualquer bem móvel ou produto.
          </p>
        </div>
      </div>

      {/* Sold Items Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="px-6 py-4 border-b border-slate-800 font-black text-sm text-white flex items-center gap-2">
          <Package className="w-4 h-4 text-purple-400" /> Memória de Vendas Realizadas em {selectedYear}
        </div>

        {report.vehicles.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            Nenhum item marcado como vendido no ano de {selectedYear}.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 font-bold border-b border-slate-800 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-6 py-3.5">Categoria / Item</th>
                  <th className="px-4 py-3.5">Data Venda</th>
                  <th className="px-4 py-3.5">Preço Venda</th>
                  <th className="px-4 py-3.5">Custo Entrada</th>
                  <th className="px-4 py-3.5">Lucro Líquido</th>
                  <th className="px-6 py-3.5 text-right">Status Fiscal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {report.vehicles.map((row, idx) => {
                  const cat = getCategoryInfo(row.vehicle.category);
                  return (
                    <tr key={idx} className="hover:bg-slate-950/40 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-white flex items-center gap-2">
                          <span>{cat.emoji}</span>
                          <span>{row.vehicle.model}</span>
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {cat.name.split('(')[0]} {row.vehicle.brand ? `• ${row.vehicle.brand}` : ''}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-slate-300 font-mono">
                        {row.vehicle.saleDate || '-'}
                      </td>
                      <td className="px-4 py-4 font-bold text-white">
                        {formatBRL(row.vehicle.salePrice)}
                      </td>
                      <td className="px-4 py-4 text-amber-400 font-semibold">
                        {formatBRL(row.metrics.totalVehicleCost)}
                      </td>
                      <td className="px-4 py-4 font-bold text-emerald-400">
                        {formatBRL(row.metrics.netProfit)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {row.isExempt ? (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                            🟢 Isento (&le; R$ 35k/mês)
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/30 text-[10px] font-bold">
                            🟣 Tributável (GCAP 15%)
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
