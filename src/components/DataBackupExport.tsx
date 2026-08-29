import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useUpdate } from '../context/UpdateContext';
import { calculateVehicleMetrics, formatBRL, formatDateBR, formatPercent } from '../utils/calculations';
import { getCategoryInfo } from '../utils/categories';
import { BrickItem } from '../types';
import {
  Download,
  Upload,
  FileSpreadsheet,
  Database,
  ShieldCheck,
  RefreshCw,
  Check,
  AlertTriangle,
  FileJson,
  Layers,
  ArrowDownToLine,
  Trash2,
  Users,
  Package,
  Cloud,
  Smartphone,
  Laptop,
  Sparkles,
  Zap,
  Clock,
} from 'lucide-react';

export const DataBackupExport: React.FC = () => {
  const {
    currentUser,
    vehicles,
    clients,
    exportData,
    importData,
    refreshVehicles,
    refreshClients,
    cloudSyncStatus,
    syncLocalToCloudNow,
    isCloudSyncing,
  } = useAuth();
  const {
    isOnline,
    checkForUpdatesManually,
    triggerTestUpdate,
    isChecking: isCheckingUpdate,
    isUpdateAvailable,
    newVersionInfo,
    openUpdateModal,
  } = useUpdate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [importMessage, setImportMessage] = useState<string>('');
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);
  const [cloudSyncSuccess, setCloudSyncSuccess] = useState<string | null>(null);
  const [updateCheckMessage, setUpdateCheckMessage] = useState<string | null>(null);

  const handleManualCheckUpdate = async () => {
    setUpdateCheckMessage(null);
    if (!isOnline) {
      setUpdateCheckMessage('Você está offline no momento. O sistema de atualização será ativado automaticamente assim que conectar à internet.');
      setTimeout(() => setUpdateCheckMessage(null), 5000);
      return;
    }
    const hasUpdate = await checkForUpdatesManually();
    if (!hasUpdate) {
      setUpdateCheckMessage('Seu AutoBrick já está na versão mais recente e sincronizado!');
      setTimeout(() => setUpdateCheckMessage(null), 4000);
    }
  };

  const handleCloudSync = async () => {
    setCloudSyncSuccess(null);
    const ok = await syncLocalToCloudNow();
    if (ok) {
      setCloudSyncSuccess('Todos os seus itens e clientes locais foram sincronizados na nuvem com sucesso!');
      setTimeout(() => setCloudSyncSuccess(null), 4000);
    } else {
      setImportStatus('error');
      setImportMessage('Não foi possível sincronizar com o banco de dados na nuvem.');
    }
  };

  // Helper to trigger browser download with UTF-8 BOM for Brazilian Excel compatibility
  const downloadCSV = (csvContent: string, fileName: string) => {
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // 1. Export Active Inventory to CSV
  const handleExportInventoryCSV = () => {
    const headers = [
      'ID',
      'Categoria',
      'Modelo / Produto',
      'Marca',
      'Condição',
      'Especificações / Memória',
      'Acessórios Inclusos',
      'Serial / IMEI',
      'Status',
      'Data de Compra',
      'Preço de Compra (R$)',
      'Preço Médio de Mercado (R$)',
      'Custo Logística/Frete (R$)',
      'Custo Preparação/Revisão (R$)',
      'Custo Real Total de Entrada (R$)',
      'Preço de Venda / Anunciado (R$)',
      'Lucro Previsto (R$)',
      'Margem Prevista (%)',
      'Dias em Estoque',
      'Observações',
    ];

    const rows = vehicles.map((v) => {
      const metrics = calculateVehicleMetrics(v);
      const cat = getCategoryInfo(v.category);
      return [
        `"${v.id}"`,
        `"${cat.name}"`,
        `"${v.model.replace(/"/g, '""')}"`,
        `"${(v.brand || '').replace(/"/g, '""')}"`,
        `"${v.condition || 'Seminovo'}"`,
        `"${(v.storageOrSpecs || '').replace(/"/g, '""')}"`,
        `"${(v.accessoriesIncluded || '').replace(/"/g, '""')}"`,
        `"${v.serialOrImei || v.plate || ''}"`,
        `"${v.status === 'sold' ? 'Vendido' : v.status === 'negotiating' ? 'Em Negociação' : 'Em Estoque'}"`,
        `"${v.purchaseDate}"`,
        v.purchasePrice.toFixed(2),
        v.fipeValue.toFixed(2),
        metrics.totalLogisticsCost.toFixed(2),
        metrics.totalPreparationCost.toFixed(2),
        metrics.totalVehicleCost.toFixed(2),
        (v.salePrice || metrics.targetPrice15Percent).toFixed(2),
        metrics.netProfit.toFixed(2),
        metrics.realMarginPercent.toFixed(2),
        metrics.daysInStock,
        `"${(v.notes || '').replace(/"/g, '""')}"`,
      ].join(';');
    });

    const csv = [headers.join(';'), ...rows].join('\r\n');
    const dateStr = new Date().toISOString().split('T')[0];
    downloadCSV(csv, `AUTOBRICK_Estoque_${dateStr}.csv`);
    setDownloadSuccess('inventory');
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  // 2. Export Sales & Profit History to CSV
  const handleExportSalesCSV = () => {
    const soldItems = vehicles.filter((v) => v.status === 'sold');
    const headers = [
      'ID Venda',
      'Data da Venda',
      'Modelo do Produto',
      'Categoria',
      'Comprador',
      'Telefone Comprador',
      'Documento Comprador',
      'Preço de Venda Realizado (R$)',
      'Custo Real de Entrada (R$)',
      'Taxas de Maquininha (R$)',
      'Lucro Líquido Realizado (R$)',
      'Margem Líquida Real (%)',
      'Dias até Vender',
      'Tipo de Negócio (Dinheiro/Troca)',
      'Item Recebido na Troca',
      'Volta em Dinheiro na Troca (R$)',
      'Garantia (Dias)',
    ];

    const rows = soldItems.map((v) => {
      const metrics = calculateVehicleMetrics(v);
      const cat = getCategoryInfo(v.category);
      return [
        `"${v.id}"`,
        `"${v.saleDate || v.updatedAt.split('T')[0]}"`,
        `"${v.model.replace(/"/g, '""')}"`,
        `"${cat.name}"`,
        `"${v.buyerName || 'Cliente Balcão'}"`,
        `"${v.buyerPhone || ''}"`,
        `"${v.buyerDocument || ''}"`,
        (v.salePrice || 0).toFixed(2),
        metrics.totalVehicleCost.toFixed(2),
        (v.cardFees || 0).toFixed(2),
        metrics.netProfit.toFixed(2),
        metrics.realMarginPercent.toFixed(2),
        metrics.daysInStock,
        `"${v.saleDealType || 'cash_only'}"`,
        `"${v.tradeIn?.model || 'Nenhum'}"`,
        (v.tradeIn?.cashReceived || 0).toFixed(2),
        v.warrantyDays || 90,
      ].join(';');
    });

    const csv = [headers.join(';'), ...rows].join('\r\n');
    const dateStr = new Date().toISOString().split('T')[0];
    downloadCSV(csv, `AUTOBRICK_Vendas_Lucros_${dateStr}.csv`);
    setDownloadSuccess('sales');
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  // 3. Export Clients & CRM to CSV
  const handleExportClientsCSV = () => {
    const headers = [
      'ID Cliente',
      'Nome Completo',
      'Telefone / WhatsApp',
      'CPF / Documento',
      'Cidade / Bairro',
      'Tags',
      'Total de Compras',
      'Total Gasto (R$)',
      'Lista de Desejos / Encomendas',
      'Observações',
      'Cadastrado em',
    ];

    const rows = clients.map((c) => {
      const wishlistText = c.wishlist
        .map((w) => `${w.modelQuery} (até ${w.maxBudget ? formatBRL(w.maxBudget) : 'sem teto'})`)
        .join(' | ');
      return [
        `"${c.id}"`,
        `"${c.name.replace(/"/g, '""')}"`,
        `"${c.phone}"`,
        `"${c.document || ''}"`,
        `"${c.cityOrNeighborhood || ''}"`,
        `"${(c.tags || []).join(', ')}"`,
        c.totalPurchasesCount,
        c.totalSpent.toFixed(2),
        `"${wishlistText.replace(/"/g, '""')}"`,
        `"${(c.notes || '').replace(/"/g, '""')}"`,
        `"${c.createdAt.split('T')[0]}"`,
      ].join(';');
    });

    const csv = [headers.join(';'), ...rows].join('\r\n');
    const dateStr = new Date().toISOString().split('T')[0];
    downloadCSV(csv, `AUTOBRICK_Clientes_CRM_${dateStr}.csv`);
    setDownloadSuccess('clients');
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  // Import JSON handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const success = importData(text);
        if (success) {
          setImportStatus('success');
          setImportMessage('Backup restaurado com sucesso! Seus dados e clientes foram sincronizados.');
          refreshVehicles();
          refreshClients();
        } else {
          setImportStatus('error');
          setImportMessage('Arquivo de backup inválido ou incompatível.');
        }
      } catch (err) {
        setImportStatus('error');
        setImportMessage('Erro ao ler arquivo JSON.');
      }
    };
    reader.readAsText(file);
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Aggregated Stats
  const soldCount = vehicles.filter((v) => v.status === 'sold').length;
  const inStockCount = vehicles.filter((v) => v.status === 'in_stock').length;

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/70 p-6 md:p-8 text-white shadow-xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            Central de Backup & Exportação de Dados
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Segurança, Planilhas Excel & Backup do BRICK
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Exporte suas planilhas de estoque e lucros em formato Excel/CSV para controle contábil, e faça backups completos em JSON para nunca perder seus dados de negociações e clientes.
          </p>
        </div>
      </div>

      {/* Database Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-black text-white">{vehicles.length} Itens</div>
            <div className="text-[11px] text-slate-400">{inStockCount} em estoque &bull; {soldCount} vendidos</div>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-black text-white">{clients.length} Clientes</div>
            <div className="text-[11px] text-slate-400">Cadastrados no Mini-CRM</div>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              cloudSyncStatus === 'online'
                ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                : 'bg-amber-500/10 border border-amber-500/20 text-amber-400'
            }`}>
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-black text-white flex items-center gap-2">
                {cloudSyncStatus === 'online' ? 'Nuvem Conectada' : 'Modo Local'}
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  cloudSyncStatus === 'online' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                }`}>
                  {cloudSyncStatus === 'online' ? 'Tempo Real' : 'Local'}
                </span>
              </div>
              <div className="text-[11px] text-slate-400">
                {cloudSyncStatus === 'online' ? 'Sincronizando entre Celular e PC' : 'Clique para sincronizar na Nuvem'}
              </div>
            </div>
          </div>

          <button
            onClick={handleCloudSync}
            disabled={isCloudSyncing}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isCloudSyncing ? 'animate-spin' : ''}`} />
            <span>Sincronizar</span>
          </button>
        </div>
      </div>

      {cloudSyncSuccess && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-xs text-emerald-300 flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{cloudSyncSuccess}</span>
        </div>
      )}

      {/* Export Section (Excel CSV) */}
      <div className="bg-slate-900/90 border border-slate-800 p-5 md:p-6 rounded-3xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-black text-white flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-400" /> Exportação para Excel / Google Sheets (CSV)
          </h2>
          <span className="text-xs text-slate-400">Compatível com Excel Brasil (UTF-8 com delimitador ponto e vírgula)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          
          {/* Card 1: Estoque Ativo */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-3 flex flex-col justify-between">
            <div className="space-y-1.5">
              <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">Estoque Completo</div>
              <h3 className="text-sm font-bold text-white">Planilha de Estoque & Custos</h3>
              <p className="text-xs text-slate-400">
                Lista de todos os produtos com custo de entrada, preparação, preço de mercado e margem prevista.
              </p>
            </div>
            <button
              onClick={handleExportInventoryCSV}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-xs rounded-xl border border-slate-700 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {downloadSuccess === 'inventory' ? <Check className="w-4 h-4 text-emerald-400" /> : <Download className="w-4 h-4" />}
              <span>{downloadSuccess === 'inventory' ? 'Baixado com Sucesso!' : 'Baixar Estoque (.csv)'}</span>
            </button>
          </div>

          {/* Card 2: Vendas & Lucros */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-3 flex flex-col justify-between">
            <div className="space-y-1.5">
              <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Financeiro</div>
              <h3 className="text-sm font-bold text-white">Relatório de Vendas & Lucros</h3>
              <p className="text-xs text-slate-400">
                Histórico detalhado de fechamentos, compradores, lucro líquido realizado e formas de pagamento.
              </p>
            </div>
            <button
              onClick={handleExportSalesCSV}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold text-xs rounded-xl border border-slate-700 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {downloadSuccess === 'sales' ? <Check className="w-4 h-4 text-emerald-400" /> : <Download className="w-4 h-4" />}
              <span>{downloadSuccess === 'sales' ? 'Baixado com Sucesso!' : 'Baixar Vendas (.csv)'}</span>
            </button>
          </div>

          {/* Card 3: Clientes & CRM */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-3 flex flex-col justify-between">
            <div className="space-y-1.5">
              <div className="text-xs font-bold text-sky-400 uppercase tracking-wider">Contatos Comerciais</div>
              <h3 className="text-sm font-bold text-white">Planilha de Clientes & CRM</h3>
              <p className="text-xs text-slate-400">
                Exporta contatos, telefones de WhatsApp, tags de clientes e histórico de compras acumuladas.
              </p>
            </div>
            <button
              onClick={handleExportClientsCSV}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-sky-400 font-bold text-xs rounded-xl border border-slate-700 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {downloadSuccess === 'clients' ? <Check className="w-4 h-4 text-emerald-400" /> : <Download className="w-4 h-4" />}
              <span>{downloadSuccess === 'clients' ? 'Baixado com Sucesso!' : 'Baixar Clientes (.csv)'}</span>
            </button>
          </div>

        </div>
      </div>

      {/* Backup Completo em JSON & Restauração */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Export JSON Full Backup */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 md:p-6 rounded-3xl space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <FileJson className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Backup Completo do Sistema (.json)</h3>
              <p className="text-xs text-slate-400">Salva todo o seu estoque, configurações, clientes e genealogia de trocas.</p>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Recomendamos baixar um arquivo de backup semanalmente para guardar no Google Drive ou enviar para seu próprio WhatsApp.
          </p>

          <button
            onClick={exportData}
            className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Baixar Backup Completo (.json)</span>
          </button>
        </div>

        {/* Restore JSON Backup */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 md:p-6 rounded-3xl space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Restaurar / Importar Backup</h3>
              <p className="text-xs text-slate-400">Carregue um arquivo JSON gerado anteriormente para recuperar seus dados.</p>
            </div>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Upload className="w-4 h-4 text-sky-400" />
            <span>Selecionar Arquivo de Backup (.json)</span>
          </button>

          {/* Status Message */}
          {importStatus === 'success' && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>{importMessage}</span>
            </div>
          )}

          {importStatus === 'error' && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{importMessage}</span>
            </div>
          )}
        </div>

        {/* Automatic System Update & Version Synchronizer */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 md:p-6 rounded-3xl space-y-4 md:col-span-2">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Atualizações Automáticas do Código & Sistema</h3>
                <p className="text-xs text-slate-400">
                  O AutoBrick monitora alterações no código e novas compilações para manter seu aplicativo sempre sincronizado.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border flex items-center gap-1.5 ${
                isOnline
                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                <span>{isOnline ? 'Conectado (Online)' : 'Modo Offline (Local)'}</span>
              </span>

              <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-amber-400">
                Versão v1.3.0
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={handleManualCheckUpdate}
              disabled={isCheckingUpdate}
              className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 text-amber-400 ${isCheckingUpdate ? 'animate-spin' : ''}`} />
              <span>{isCheckingUpdate ? 'Verificando Servidor...' : 'Verificar Atualizações Agora'}</span>
            </button>

            <button
              type="button"
              onClick={triggerTestUpdate}
              className="py-3 px-4 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-bold text-xs rounded-xl border border-amber-500/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Zap className="w-4 h-4 text-amber-400 fill-current" />
              <span>Simular Notificação & Testar Cronômetro (5 min)</span>
            </button>
          </div>

          {updateCheckMessage && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>{updateCheckMessage}</span>
            </div>
          )}

          {isUpdateAvailable && (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400 animate-spin" />
                <span>Nova versão detectada e aguardando aplicação!</span>
              </div>
              <button
                type="button"
                onClick={openUpdateModal}
                className="px-3 py-1 bg-amber-500 text-slate-950 font-black text-xs rounded-lg hover:bg-amber-400 transition-all cursor-pointer"
              >
                Abrir Notificação
              </button>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
