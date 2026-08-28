import React, { useState } from 'react';
import {
  FileText,
  Printer,
  Copy,
  Check,
  ShieldCheck,
  X,
  Share2,
  Calendar,
  UserCheck,
  Building,
  AlertTriangle,
} from 'lucide-react';
import { BrickItem, ReceiptData, ItemCategory } from '../types';
import { formatBRL, formatDateBR } from '../utils/calculations';
import { useAuth } from '../context/AuthContext';

interface ReceiptGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  item?: BrickItem | null;
}

export const ReceiptGeneratorModal: React.FC<ReceiptGeneratorModalProps> = ({
  isOpen,
  onClose,
  item,
}) => {
  const { currentUser, vehicles } = useAuth();

  const [selectedItemId, setSelectedItemId] = useState<string>(item?.id || (vehicles[0]?.id ?? ''));
  const activeItem = vehicles.find((v) => v.id === selectedItemId) || item || vehicles[0];

  const [receiptType, setReceiptType] = useState<'sale_receipt' | 'purchase_contract'>('sale_receipt');
  const [buyerName, setBuyerName] = useState<string>('');
  const [buyerDocument, setBuyerDocument] = useState<string>('');
  const [buyerPhone, setBuyerPhone] = useState<string>('');
  const [sellerName, setSellerName] = useState<string>(currentUser?.name || 'Carlos Silva');
  const [sellerDocument, setSellerDocument] = useState<string>('000.000.000-00');
  const [sellerPhone, setSellerPhone] = useState<string>('(11) 99999-9999');
  const [sellerStoreName, setSellerStoreName] = useState<string>(currentUser?.storeName || 'Brik Master & Eletrônicos');
  
  const [itemModel, setItemModel] = useState<string>(activeItem?.model || 'iPhone 13 128GB');
  const [serialOrImei, setSerialOrImei] = useState<string>(activeItem?.serialOrImei || '');
  const [storageOrSpecs, setStorageOrSpecs] = useState<string>(activeItem?.storageOrSpecs || '');
  const [accessoriesIncluded, setAccessoriesIncluded] = useState<string>(activeItem?.accessoriesIncluded || 'Cabo carregador original + capa');
  const [salePrice, setSalePrice] = useState<number>(activeItem?.salePrice || activeItem?.purchasePrice || 2500);
  const [warrantyDays, setWarrantyDays] = useState<number>(90);
  const [saleDate, setSaleDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<string>('PIX');

  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const generateReceiptTextWhatsApp = () => {
    if (receiptType === 'sale_receipt') {
      return `📄 *RECIBO DE VENDA & TERMO DE GARANTIA*\n` +
        `🏪 *Vendedor:* ${sellerStoreName || sellerName} (${sellerPhone})\n` +
        `👤 *Comprador:* ${buyerName || 'Cliente'} ${buyerDocument ? `(CPF: ${buyerDocument})` : ''}\n` +
        `📅 *Data da Negociação:* ${formatDateBR(saleDate)}\n\n` +
        `📦 *DADOS DO PRODUTO:*\n` +
        `• Modelo: ${itemModel}\n` +
        (storageOrSpecs ? `• Especificações: ${storageOrSpecs}\n` : '') +
        (serialOrImei ? `• IMEI / Serial: ${serialOrImei}\n` : '') +
        (accessoriesIncluded ? `• Acessórios Inclusos: ${accessoriesIncluded}\n` : '') +
        `• Valor Pago: ${formatBRL(salePrice)} (${paymentMethod})\n\n` +
        `🛡️ *TERMO DE GARANTIA:*\n` +
        `• Prazo de Garantia: *${warrantyDays} DIAS* a contar desta data.\n` +
        `• Cobertura: Vícios ocultos e funcionamento de componentes internos.\n` +
        `• Não cobre: Danos físicos, quedas, contato com água/líquidos ou violação de lacres.\n\n` +
        `✅ *Declaração de Procedência Legal:* O vendedor declara que o produto é de origem lícita e desbloqueado para uso imediato.`;
    } else {
      return `📄 *TERMO DE COMPRA & DECLARAÇÃO DE PROCEDÊNCIA*\n` +
        `🏪 *Comprador / Lojista:* ${sellerStoreName || sellerName} (CPF/CNPJ: ${sellerDocument})\n` +
        `👤 *Vendedor Original:* ${buyerName || '[Nome do Vendedor]'} (CPF: ${buyerDocument || '[CPF]'})\n` +
        `📅 *Data de Aquisição:* ${formatDateBR(saleDate)}\n\n` +
        `📦 *PRODUTO ADQUIRIDO:*\n` +
        `• Modelo: ${itemModel}\n` +
        (serialOrImei ? `• IMEI / Serial: ${serialOrImei}\n` : '') +
        `• Valor Pago na Aquisição: ${formatBRL(salePrice)}\n\n` +
        `⚖️ *DECLARAÇÃO DE NÃO-RECEPTAÇÃO (LEGAL):*\n` +
        `O vendedor declara, sob as penas da Lei (Art. 299 e 180 do Código Penal Brasileiro), ser o legítimo e único proprietário do bem acima discriminado, estando o mesmo livre de qualquer ônus, bloqueio judicial, queixa de roubo/furto ou pendência financeira.`;
    }
  };

  const handleCopyWhatsApp = () => {
    const text = generateReceiptTextWhatsApp();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 md:p-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl w-full max-w-4xl max-h-[96dvh] sm:max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white">
                Gerador de Recibo Oficial & Termo de Procedência
              </h2>
              <p className="text-xs text-slate-400">
                Documentação profissional com garantia legal de 90 dias e proteção jurídica.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Split view (Inputs vs. Live Document) */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Form (5 cols) */}
          <div className="lg:col-span-5 space-y-4 text-xs">
            {/* Receipt Type Toggle */}
            <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
              <button
                type="button"
                onClick={() => setReceiptType('sale_receipt')}
                className={`py-2 rounded-xl font-bold transition-all ${
                  receiptType === 'sale_receipt'
                    ? 'bg-amber-500 text-slate-950'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Recibo de Venda
              </button>
              <button
                type="button"
                onClick={() => setReceiptType('purchase_contract')}
                className={`py-2 rounded-xl font-bold transition-all ${
                  receiptType === 'purchase_contract'
                    ? 'bg-sky-500 text-slate-950'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Termo de Compra
              </button>
            </div>

            {/* Select Stock item */}
            {vehicles.length > 0 && (
              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  Preencher dados a partir do Estoque:
                </label>
                <select
                  value={selectedItemId}
                  onChange={(e) => {
                    setSelectedItemId(e.target.value);
                    const found = vehicles.find((v) => v.id === e.target.value);
                    if (found) {
                      setItemModel(found.model);
                      setSerialOrImei(found.serialOrImei || '');
                      setStorageOrSpecs(found.storageOrSpecs || '');
                      setAccessoriesIncluded(found.accessoriesIncluded || '');
                      setSalePrice(found.salePrice || found.purchasePrice);
                    }
                  }}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-medium focus:outline-none focus:border-amber-500"
                >
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.model} ({v.status === 'sold' ? 'Vendido' : 'Estoque'})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Product details */}
            <div className="space-y-3 bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800">
              <span className="font-black text-amber-400 block">Dados do Produto</span>
              <div>
                <label className="block text-slate-400 mb-1">Modelo / Título:</label>
                <input
                  type="text"
                  value={itemModel}
                  onChange={(e) => setItemModel(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">IMEI / Número de Série:</label>
                  <input
                    type="text"
                    value={serialOrImei}
                    onChange={(e) => setSerialOrImei(e.target.value)}
                    placeholder="Ex: 356789012345678"
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Valor Final (R$):</label>
                  <input
                    type="number"
                    value={salePrice || ''}
                    onChange={(e) => setSalePrice(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-emerald-500/50 rounded-lg text-emerald-400 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Acessórios Inclusos:</label>
                <input
                  type="text"
                  value={accessoriesIncluded}
                  onChange={(e) => setAccessoriesIncluded(e.target.value)}
                  placeholder="Ex: Caixa, cabo original, nota fiscal..."
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
              </div>
            </div>

            {/* People involved */}
            <div className="space-y-3 bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800">
              <span className="font-black text-sky-400 block">
                {receiptType === 'sale_receipt' ? 'Dados do Cliente / Comprador' : 'Dados do Vendedor Original'}
              </span>
              <div>
                <label className="block text-slate-400 mb-1">Nome Completo:</label>
                <input
                  type="text"
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  placeholder="Ex: João da Silva"
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">CPF ou RG:</label>
                  <input
                    type="text"
                    value={buyerDocument}
                    onChange={(e) => setBuyerDocument(e.target.value)}
                    placeholder="000.000.000-00"
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Telefone / Whats:</label>
                  <input
                    type="text"
                    value={buyerPhone}
                    onChange={(e) => setBuyerPhone(e.target.value)}
                    placeholder="(11) 9..."
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  />
                </div>
              </div>
            </div>

            {/* Warranty & Payment */}
            {receiptType === 'sale_receipt' && (
              <div className="grid grid-cols-2 gap-2 bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800">
                <div>
                  <label className="block text-slate-400 mb-1">Prazo de Garantia:</label>
                  <select
                    value={warrantyDays}
                    onChange={(e) => setWarrantyDays(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-bold"
                  >
                    <option value={90}>90 Dias (Legal CDC)</option>
                    <option value={60}>60 Dias</option>
                    <option value={30}>30 Dias (Cortesia)</option>
                    <option value={0}>Sem Garantia (Venda no Estado)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Forma de Pagamento:</label>
                  <input
                    type="text"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    placeholder="PIX, Cartão 10x, Dinheiro"
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Right Live Document Preview (7 cols) */}
          <div className="lg:col-span-7 flex flex-col space-y-4">
            
            {/* Printable Document Box */}
            <div className="flex-1 bg-white text-slate-950 p-6 rounded-2xl shadow-inner font-sans text-xs space-y-4 border border-slate-200">
              
              {/* Document Header */}
              <div className="border-b-2 border-slate-900 pb-3 flex items-start justify-between">
                <div>
                  <h1 className="text-base font-black uppercase tracking-tight text-slate-900">
                    {receiptType === 'sale_receipt' ? 'Recibo de Venda & Termo de Garantia' : 'Termo de Compra & Declaração de Procedência'}
                  </h1>
                  <p className="text-[10px] text-slate-600 font-bold">
                    {sellerStoreName || sellerName} &bull; Contato: {sellerPhone}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block">Data da Operação</span>
                  <span className="text-xs font-black text-slate-900">{formatDateBR(saleDate)}</span>
                </div>
              </div>

              {/* Parties */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200 text-[11px]">
                <div>
                  <span className="font-bold text-slate-500 block text-[9px] uppercase">
                    {receiptType === 'sale_receipt' ? 'Vendedor / Fornecedor' : 'Comprador / Adquirente'}
                  </span>
                  <div className="font-bold text-slate-900">{sellerStoreName || sellerName}</div>
                  <div className="text-slate-600">{sellerPhone}</div>
                </div>
                <div>
                  <span className="font-bold text-slate-500 block text-[9px] uppercase">
                    {receiptType === 'sale_receipt' ? 'Cliente / Comprador' : 'Vendedor Original'}
                  </span>
                  <div className="font-bold text-slate-900">{buyerName || '__________________________'}</div>
                  <div className="text-slate-600">
                    CPF: {buyerDocument || '___________________'} {buyerPhone && `| Tel: ${buyerPhone}`}
                  </div>
                </div>
              </div>

              {/* Item Description */}
              <div className="space-y-1 text-[11px]">
                <span className="font-bold text-slate-500 block text-[9px] uppercase">Descrição do Objeto</span>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="font-black text-slate-900 text-sm">{itemModel}</div>
                  {storageOrSpecs && <div className="text-slate-700">Especificações: {storageOrSpecs}</div>}
                  {serialOrImei && <div className="text-slate-700 font-mono">IMEI / Serial: {serialOrImei}</div>}
                  {accessoriesIncluded && <div className="text-slate-700">Acessórios: {accessoriesIncluded}</div>}
                  <div className="font-black text-emerald-800 pt-1 text-xs">
                    Valor Transacionado: {formatBRL(salePrice)} ({paymentMethod})
                  </div>
                </div>
              </div>

              {/* Terms and conditions */}
              <div className="text-[10px] text-slate-600 space-y-2 leading-relaxed">
                {receiptType === 'sale_receipt' ? (
                  <>
                    <p>
                      <strong>1. GARANTIA:</strong> Este produto possui <strong>{warrantyDays} dias de garantia</strong> contra defeitos internos de fabricação e vícios ocultos. A garantia não cobre danos por quedas, umidade, curto-circuito por carregador inadequado ou quebra de lacres.
                    </p>
                    <p>
                      <strong>2. PROCEDÊNCIA:</strong> O vendedor declara sob fé de seu grau a procedência legal do bem, estando liberado de qualquer bloqueio e pronto para uso.
                    </p>
                  </>
                ) : (
                  <p>
                    <strong>DECLARAÇÃO SOB PENA DA LEI:</strong> O vendedor declara ser o legítimo titular e proprietário do objeto negociado, assumindo toda e qualquer responsabilidade civil e criminal (Art. 180 do Código Penal) pela autenticidade, procedência e ausência de impedimentos ou restrições legais.
                  </p>
                )}
              </div>

              {/* Signatures */}
              <div className="pt-6 grid grid-cols-2 gap-8 text-center text-[10px] text-slate-700">
                <div className="border-t border-slate-400 pt-1">
                  <span className="font-bold">{sellerName}</span>
                  <div className="text-[9px] text-slate-500">{receiptType === 'sale_receipt' ? 'Vendedor' : 'Comprador'}</div>
                </div>
                <div className="border-t border-slate-400 pt-1">
                  <span className="font-bold">{buyerName || 'Assinatura do Cliente'}</span>
                  <div className="text-[9px] text-slate-500">{receiptType === 'sale_receipt' ? 'Comprador' : 'Vendedor Original'}</div>
                </div>
              </div>

            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
              <button
                type="button"
                onClick={handleCopyWhatsApp}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow flex items-center gap-2 transition-all cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copiado para WhatsApp!' : 'Copiar Texto para WhatsApp'}</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 flex items-center gap-2 transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir / Salvar PDF</span>
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
