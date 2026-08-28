import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { Client, ClientWishlistItem, BrickItem, ItemCategory } from '../types';
import { CATEGORIES_LIST, getCategoryInfo } from '../utils/categories';
import { formatBRL, formatDateBR } from '../utils/calculations';
import {
  Users,
  UserPlus,
  Search,
  MessageSquare,
  Sparkles,
  Phone,
  Tag,
  ShoppingBag,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Flame,
  Clock,
  Plus,
  X,
  Send,
  Heart,
  DollarSign,
  Package,
} from 'lucide-react';

export const ClientCrm: React.FC = () => {
  const { clients, vehicles, saveClient, deleteClient, currentUser } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTagFilter, setSelectedTagFilter] = useState<string>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [document, setDocument] = useState('');
  const [cityOrNeighborhood, setCityOrNeighborhood] = useState('');
  const [notes, setNotes] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [wishlistItems, setWishlistItems] = useState<ClientWishlistItem[]>([]);

  // Wishlist item form state
  const [newWishModel, setNewWishModel] = useState('');
  const [newWishCategory, setNewWishCategory] = useState<ItemCategory>('consoles_games');
  const [newWishBudget, setNewWishBudget] = useState('');
  const [newWishNotes, setNewWishNotes] = useState('');

  const inStockVehicles = useMemo(() => {
    return vehicles.filter((v) => v.status === 'in_stock');
  }, [vehicles]);

  // Compute Active Inventory Matches with Clients' Wishlists
  const inventoryMatches = useMemo(() => {
    const matches: Array<{
      client: Client;
      wishItem: ClientWishlistItem;
      product: BrickItem;
      priceDiff: number;
    }> = [];

    clients.forEach((client) => {
      client.wishlist.forEach((wish) => {
        const queryTerms = wish.modelQuery.toLowerCase().split(/\s+/).filter((t) => t.length > 1);

        inStockVehicles.forEach((product) => {
          const productText = `${product.model} ${product.brand || ''} ${product.storageOrSpecs || ''}`.toLowerCase();
          
          // Match if query terms appear in product title, or matching category with matching price range
          const termMatches = queryTerms.some((term) => productText.includes(term));
          const categoryMatches = wish.category ? product.category === wish.category : false;

          if (termMatches || categoryMatches) {
            const productPrice = product.salePrice || product.fipeValue || 0;
            const maxBudget = wish.maxBudget || productPrice * 1.2;
            const priceDiff = productPrice - (wish.maxBudget || productPrice);

            // If price is within reasonable range (max 20% above budget)
            if (productPrice <= maxBudget * 1.25) {
              matches.push({
                client,
                wishItem: wish,
                product,
                priceDiff,
              });
            }
          }
        });
      });
    });

    return matches;
  }, [clients, inStockVehicles]);

  // Open Form for New / Edit
  const handleOpenForm = (client?: Client) => {
    if (client) {
      setEditingClient(client);
      setName(client.name);
      setPhone(client.phone);
      setDocument(client.document || '');
      setCityOrNeighborhood(client.cityOrNeighborhood || '');
      setNotes(client.notes || '');
      setTagsInput((client.tags || []).join(', '));
      setWishlistItems(client.wishlist || []);
    } else {
      setEditingClient(null);
      setName('');
      setPhone('');
      setDocument('');
      setCityOrNeighborhood('');
      setNotes('');
      setTagsInput('Gamer, Compra no PIX');
      setWishlistItems([]);
    }
    setIsFormOpen(true);
  };

  const handleAddWishlistItem = () => {
    if (!newWishModel.trim()) return;
    const newItem: ClientWishlistItem = {
      id: `wish_${Date.now()}`,
      category: newWishCategory,
      modelQuery: newWishModel.trim(),
      maxBudget: newWishBudget ? Number(newWishBudget) : undefined,
      notes: newWishNotes.trim() || undefined,
      createdAt: new Date().toISOString(),
    };
    setWishlistItems([...wishlistItems, newItem]);
    setNewWishModel('');
    setNewWishBudget('');
    setNewWishNotes('');
  };

  const handleRemoveWishlistItem = (id: string) => {
    setWishlistItems(wishlistItems.filter((w) => w.id !== id));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    const parsedTags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const clientToSave: Client = {
      id: editingClient ? editingClient.id : `cli_${Date.now()}`,
      userId: currentUser?.id || 'default_user',
      name: name.trim(),
      phone: phone.trim(),
      document: document.trim() || undefined,
      cityOrNeighborhood: cityOrNeighborhood.trim() || undefined,
      notes: notes.trim() || undefined,
      tags: parsedTags,
      totalPurchasesCount: editingClient ? editingClient.totalPurchasesCount : 0,
      totalSpent: editingClient ? editingClient.totalSpent : 0,
      wishlist: wishlistItems,
      createdAt: editingClient ? editingClient.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveClient(clientToSave);
    setIsFormOpen(false);
  };

  // Generate customized WhatsApp Match pitch
  const handleOpenWhatsAppMatch = (client: Client, wishItem: ClientWishlistItem, product: BrickItem) => {
    const rawPhone = client.phone.replace(/\D/g, '');
    const cleanPhone = rawPhone.startsWith('55') ? rawPhone : `55${rawPhone}`;
    const priceFormatted = formatBRL(product.salePrice || 0);

    const message = `Fala ${client.name.split(' ')[0]}, tudo bem? 👊\n\n` +
      `Lembrei que você estava procurando um *${wishItem.modelQuery}*!\n\n` +
      `Acabou de entrar aqui no meu estoque um *${product.model}* em estado impecável (${product.condition || 'Seminovo'}) com ${product.accessoriesIncluded || 'acessórios completos'}.\n\n` +
      `Estou fazendo por *${priceFormatted}* à vista no PIX ou parcelo no cartão.\n\n` +
      `Separei pra te avisar com prioridade antes de postar nos grupos. Quer que eu segure pra você testar hoje?`;

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${cleanPhone}?text=${encoded}`, '_blank');
  };

  // Filtered clients list
  const filteredClients = useMemo(() => {
    return clients.filter((c) => {
      const matchSearch =
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone.includes(searchTerm) ||
        (c.cityOrNeighborhood || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.wishlist.some((w) => w.modelQuery.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchTag =
        selectedTagFilter === 'all' || (c.tags && c.tags.includes(selectedTagFilter));

      return matchSearch && matchTag;
    });
  }, [clients, searchTerm, selectedTagFilter]);

  // Collect all unique tags for filter tabs
  const allTags = useMemo(() => {
    const set = new Set<string>();
    clients.forEach((c) => {
      (c.tags || []).forEach((t) => set.add(t));
    });
    return Array.from(set);
  }, [clients]);

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/70 p-6 md:p-8 text-white shadow-xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
              <Users className="w-3.5 h-3.5 text-amber-400" />
              Mini-CRM de Compradores & Radar de Encomendas
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Gestão de Clientes & Match de Estoque
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Cadastre compradores frequentes, salve listas de desejos e encomendas ("quem quer o quê") e receba avisos automáticos de match para fechar vendas no WhatsApp antes mesmo de anunciar.
            </p>
          </div>

          <button
            onClick={() => handleOpenForm()}
            className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 cursor-pointer shrink-0"
          >
            <UserPlus className="w-4 h-4 stroke-[3]" />
            Novo Cliente / Encomenda
          </button>
        </div>
      </div>

      {/* Radar de Matches (Active Matches Section) */}
      {inventoryMatches.length > 0 && (
        <div className="bg-gradient-to-r from-amber-500/15 via-slate-900 to-slate-900 border-2 border-amber-500/40 p-5 md:p-6 rounded-3xl space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500 text-slate-950 font-black shrink-0">
                <Flame className="w-5 h-5 fill-slate-950" />
              </div>
              <div>
                <h2 className="text-base font-black text-amber-300">
                  🔥 Radar Ativo: {inventoryMatches.length} {inventoryMatches.length === 1 ? 'Match de Estoque Encontrado!' : 'Matches de Estoque Encontrados!'}
                </h2>
                <p className="text-xs text-slate-300">
                  Produtos que estão no seu estoque disponível combinam exatamente com as encomendas salvas dos seus clientes.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
            {inventoryMatches.map((match, idx) => {
              const clientFirstName = match.client.name.split(' ')[0];
              const productPrice = match.product.salePrice || 0;
              const maxBudget = match.wishItem.maxBudget;

              return (
                <div
                  key={`${match.client.id}-${match.product.id}-${idx}`}
                  className="bg-slate-950/90 border border-amber-500/30 hover:border-amber-500/60 p-4 rounded-2xl space-y-3 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-amber-400" />
                        {match.client.name}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                        {match.client.phone}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1 text-xs">
                      <div className="text-[11px] text-slate-400">
                        Procura: <span className="font-bold text-slate-200">{match.wishItem.modelQuery}</span>
                        {maxBudget && (
                          <span> (teto: {formatBRL(maxBudget)})</span>
                        )}
                      </div>
                      <div className="text-[11px] text-amber-400 font-bold flex items-center gap-1">
                        <Package className="w-3 h-3" />
                        No seu estoque: {match.product.model}
                      </div>
                      <div className="text-xs font-black text-emerald-400">
                        Preço: {formatBRL(productPrice)}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenWhatsAppMatch(match.client, match.wishItem, match.product)}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4 fill-slate-950" />
                    <span>Oferecer p/ {clientFirstName} no WhatsApp</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Search & Tag Filter Bar */}
      <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-3xl space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por nome, telefone ou produto desejado..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
            <button
              onClick={() => setSelectedTagFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedTagFilter === 'all'
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              Todos ({clients.length})
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTagFilter(tag)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedTagFilter === tag
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Clients Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClients.map((client) => {
          const rawPhone = client.phone.replace(/\D/g, '');
          const cleanPhone = rawPhone.startsWith('55') ? rawPhone : `55${rawPhone}`;

          return (
            <div
              key={client.id}
              className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 p-5 rounded-3xl space-y-4 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                
                {/* Header: Name, WhatsApp & Actions */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-black text-white">{client.name}</h3>
                    <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <Phone className="w-3 h-3 text-emerald-400" />
                      <a
                        href={`https://wa.me/${cleanPhone}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-400 hover:underline font-semibold font-mono"
                      >
                        {client.phone}
                      </a>
                    </div>
                    {client.cityOrNeighborhood && (
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        📍 {client.cityOrNeighborhood}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenForm(client)}
                      title="Editar Cliente"
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Excluir cliente "${client.name}"?`)) {
                          deleteClient(client.id);
                        }
                      }}
                      title="Excluir Cliente"
                      className="p-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Tags */}
                {client.tags && client.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {client.tags.map((t) => (
                      <span
                        key={t}
                        className="px-2 py-0.5 rounded-md bg-slate-950 text-amber-400 border border-slate-800 text-[10px] font-bold"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                )}

                {/* Wishlist / Encomendas */}
                <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                  <div className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5 text-rose-400" />
                    <span>Lista de Desejos / Encomendas:</span>
                  </div>

                  {client.wishlist && client.wishlist.length > 0 ? (
                    <div className="space-y-1.5">
                      {client.wishlist.map((w) => (
                        <div
                          key={w.id}
                          className="p-2 rounded-xl bg-slate-950 border border-slate-800/80 text-xs space-y-0.5"
                        >
                          <div className="flex items-center justify-between font-bold text-slate-200">
                            <span>{w.modelQuery}</span>
                            {w.maxBudget && (
                              <span className="text-amber-400 font-extrabold">{formatBRL(w.maxBudget)}</span>
                            )}
                          </div>
                          {w.notes && <div className="text-[10px] text-slate-400">{w.notes}</div>}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-[11px] text-slate-500 italic">
                      Nenhuma encomenda ativa no momento.
                    </div>
                  )}
                </div>

                {/* Notes */}
                {client.notes && (
                  <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60 text-[11px] text-slate-400">
                    "{client.notes}"
                  </div>
                )}

              </div>

              {/* Purchase History Stats */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <div>
                  <div className="text-[10px] text-slate-500">Histórico de Compras</div>
                  <div className="font-bold text-white">{client.totalPurchasesCount} compras</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-slate-500">Volume Total Gasto</div>
                  <div className="font-extrabold text-emerald-400">{formatBRL(client.totalSpent)}</div>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Modal: Client Create / Edit Form */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-3xl p-6 space-y-5 my-8 shadow-2xl">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-base font-black text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-400" />
                {editingClient ? 'Editar Cliente / Comprador' : 'Cadastrar Novo Cliente'}
              </h2>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Carlos Eduardo"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                    WhatsApp / Telefone *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="(11) 98765-4321"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                    Cidade / Bairro
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Tatuapé - SP"
                    value={cityOrNeighborhood}
                    onChange={(e) => setCityOrNeighborhood(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                    CPF / Documento (Opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="000.000.000-00"
                    value={document}
                    onChange={(e) => setDocument(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Tags de Classificação (separadas por vírgula)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Gamer, Paga no PIX, Revendedor, iPhones"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500"
                />
              </div>

              {/* Wishlist / Encomendas Section */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-rose-400" />
                  <span>Lista de Desejos / O que este cliente quer comprar?</span>
                </div>

                {wishlistItems.length > 0 && (
                  <div className="space-y-2">
                    {wishlistItems.map((w) => (
                      <div
                        key={w.id}
                        className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-bold text-white">{w.modelQuery}</div>
                          <div className="text-[11px] text-slate-400">
                            {w.maxBudget ? `Teto: ${formatBRL(w.maxBudget)}` : 'Sem teto'} &bull; {w.notes || 'Sem observações'}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveWishlistItem(w.id)}
                          className="p-1 rounded-lg text-rose-400 hover:bg-rose-500/20 cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add new wishlist item sub-form */}
                <div className="pt-2 border-t border-slate-800/80 space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="sm:col-span-2">
                      <input
                        type="text"
                        placeholder="Ex: PlayStation 5 com 2 controles"
                        value={newWishModel}
                        onChange={(e) => setNewWishModel(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        placeholder="Teto R$"
                        value={newWishBudget}
                        onChange={(e) => setNewWishBudget(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddWishlistItem}
                    className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-xs rounded-xl border border-slate-700 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Adicionar Encomenda na Lista
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Observações / Histórico de Negociações
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: Cliente prefere retirar no metrô. Já comprou um Xbox One e pagou no ato."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 hover:brightness-110 cursor-pointer"
                >
                  {editingClient ? 'Atualizar Cliente' : 'Salvar Cliente'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
