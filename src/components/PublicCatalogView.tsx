import React, { useState } from 'react';
import {
  ShoppingBag,
  Share2,
  Copy,
  Check,
  Search,
  ExternalLink,
  MessageCircle,
  Tag,
  ShieldCheck,
  Sparkles,
  Filter,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { BrickItem, ItemCategory } from '../types';
import { formatBRL, calculateVehicleMetrics } from '../utils/calculations';
import { getCategoryInfo } from '../utils/categories';
import { ImageViewerModal } from './ImageViewerModal';
import { Camera } from 'lucide-react';

export const PublicCatalogView: React.FC = () => {
  const { vehicles, currentUser } = useAuth();

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copied, setCopied] = useState<boolean>(false);
  const [sellerWhatsapp, setSellerWhatsapp] = useState<string>('5511999999999');
  const [previewPhotoItem, setPreviewPhotoItem] = useState<{ photos: string[]; title: string; index?: number } | null>(null);

  // Filter in-stock items only
  const inStockItems = vehicles.filter((v) => v.status === 'in_stock');

  const filteredItems = inStockItems.filter((item) => {
    const matchesSearch =
      item.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.brand && item.brand.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.storageOrSpecs && item.storageOrSpecs.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'all' || item.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const generateCatalogWhatsAppText = () => {
    let msg = `🔥 *CATÁLOGO DE PRODUTOS DISPONÍVEIS - ${currentUser?.storeName || 'BRICK MASTER'}* 🔥\n`;
    msg += `✅ *Produtos revisados, com garantia e pronta entrega!*\n\n`;

    filteredItems.forEach((item, index) => {
      const cat = getCategoryInfo(item.category);
      const metrics = calculateVehicleMetrics(item);
      const displayPrice = item.salePrice || metrics.targetPrice15Percent;

      msg += `${index + 1}. *${cat.emoji} ${item.model}*\n`;
      if (item.storageOrSpecs) msg += `   • Detalhes: ${item.storageOrSpecs}\n`;
      if (item.accessoriesIncluded) msg += `   • Acessórios: ${item.accessoriesIncluded}\n`;
      msg += `   💰 *Valor: ${formatBRL(displayPrice)}* (Aceitamos PIX, Cartão até 18x ou Trocas com volta)\n\n`;
    });

    msg += `📲 *Para negociar ou tirar dúvidas, me chame no WhatsApp agora!*`;
    return msg;
  };

  const handleCopyCatalog = () => {
    const text = generateCatalogWhatsAppText();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenItemWhatsapp = (item: BrickItem) => {
    const metrics = calculateVehicleMetrics(item);
    const price = item.salePrice || metrics.targetPrice15Percent;
    const text = encodeURIComponent(
      `Olá! Vi o produto "${item.model}" anunciado no catálogo por ${formatBRL(price)} e gostaria de negociar!`
    );
    const cleanNumber = sellerWhatsapp.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanNumber}?text=${text}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 border border-amber-500/30 rounded-3xl p-6 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <img
              src="/logo.png"
              alt="Logo"
              className="w-14 h-14 rounded-2xl object-cover border border-amber-500/40 shadow-lg shadow-amber-500/10 shrink-0 hidden sm:block"
              referrerPolicy="no-referrer"
            />
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold mb-2">
                <ShoppingBag className="w-3.5 h-3.5" />
                Vitrine Pública & Catálogo para WhatsApp &bull; BRICK MASTER
              </div>
              <h1 className="text-2xl font-black text-white">
                Catálogo Digital de Vendas ({inStockItems.length} itens ativos)
              </h1>
              <p className="text-xs text-slate-300 max-w-2xl mt-1">
                Vitrine limpa e profissional para enviar aos seus clientes. Exibe apenas os preços de venda e especificações, sem revelar seus custos de compra.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCopyCatalog}
            className="px-5 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-2xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all shrink-0 cursor-pointer active:scale-95"
          >
            {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
            <span>{copied ? 'Catálogo Copiado!' : 'Copiar Catálogo para WhatsApp'}</span>
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por modelo, marca ou capacidade..."
            className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-bold focus:outline-none focus:border-amber-500 cursor-pointer w-full sm:w-auto"
          >
            <option value="all">Todas as Categorias</option>
            <option value="consoles_games">🎮 Videogames & Jogos</option>
            <option value="smartphones">📱 Celulares & Tablets</option>
            <option value="tv_audio">📺 TVs & Som</option>
            <option value="computers">💻 Notebooks & PCs</option>
            <option value="vehicles">🚗 Veículos & Motos</option>
            <option value="tools">🛠️ Ferramentas</option>
            <option value="appliances">🔌 Eletrodomésticos</option>
          </select>
        </div>
      </div>

      {/* Product Grid */}
      {filteredItems.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-400 space-y-3">
          <ShoppingBag className="w-12 h-12 mx-auto text-slate-600 stroke-[1.5]" />
          <div className="text-base font-bold text-white">Nenhum produto em estoque encontrado</div>
          <p className="text-xs max-w-sm mx-auto">
            Cadastre novos produtos no Estoque para que eles apareçam nesta vitrine comercial.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => {
            const cat = getCategoryInfo(item.category);
            const metrics = calculateVehicleMetrics(item);
            const displayPrice = item.salePrice || metrics.targetPrice15Percent;

            return (
              <div
                key={item.id}
                className="bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-3xl p-5 flex flex-col justify-between space-y-4 transition-all group shadow-md"
              >
                <div className="space-y-3">
                  {/* Photo Display if available */}
                  {item.photos && item.photos.length > 0 && (
                    <div
                      onClick={() => setPreviewPhotoItem({ photos: item.photos!, title: item.model, index: 0 })}
                      className="w-full h-44 rounded-2xl overflow-hidden border border-slate-800 relative group/pic cursor-zoom-in bg-slate-950 shadow-inner"
                    >
                      <img
                        src={item.photos[0]}
                        alt={item.model}
                        className="w-full h-full object-cover group-hover/pic:scale-105 transition-transform duration-300"
                      />
                      {item.photos.length > 1 && (
                        <span className="absolute bottom-2 right-2 px-2 py-1 rounded-lg bg-slate-950/85 text-amber-300 text-xs font-black border border-amber-500/30 flex items-center gap-1 backdrop-blur-sm shadow">
                          <Camera className="w-3.5 h-3.5" />
                          {item.photos.length} fotos
                        </span>
                      )}
                    </div>
                  )}

                  {/* Category & Badge */}
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1.5 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                      <span>{cat.emoji}</span>
                      <span>{cat.name}</span>
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Testado & Garantia
                    </span>
                  </div>

                  {/* Title & Specs */}
                  <div>
                    <h3 className="text-base font-black text-white group-hover:text-amber-400 transition-colors">
                      {item.model}
                    </h3>
                    {item.storageOrSpecs && (
                      <p className="text-xs text-slate-300 mt-1 font-medium">
                        {item.storageOrSpecs}
                      </p>
                    )}
                  </div>

                  {/* Accessories */}
                  {item.accessoriesIncluded && (
                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-[11px] text-slate-400">
                      <span className="text-slate-500 font-bold block text-[10px]">Acessórios Inclusos:</span>
                      {item.accessoriesIncluded}
                    </div>
                  )}
                </div>

                {/* Price & CTA */}
                <div className="pt-3 border-t border-slate-800 space-y-3">
                  <div className="flex items-baseline justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Preço À Vista</span>
                    <span className="text-xl font-black text-emerald-400">
                      {formatBRL(displayPrice)}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOpenItemWhatsapp(item)}
                    className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Tenho Interesse / Negociar</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Catalog Lightbox */}
      {previewPhotoItem && (
        <ImageViewerModal
          isOpen={!!previewPhotoItem}
          onClose={() => setPreviewPhotoItem(null)}
          photos={previewPhotoItem.photos}
          title={previewPhotoItem.title}
          initialIndex={previewPhotoItem.index || 0}
        />
      )}
    </div>
  );
};
