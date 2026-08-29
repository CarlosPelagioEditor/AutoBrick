import { BrickItem, User, Client } from '../types';

const STORAGE_USERS_KEY = 'autobrick_users_v2';
const STORAGE_ITEMS_KEY = 'autobrick_items_v2';
const STORAGE_CLIENTS_KEY = 'autobrick_clients_v1';

// Seed Initial Demo Clients with Wishlists
const INITIAL_CLIENTS: Client[] = [
  {
    id: 'cli_marcos_silva_01',
    userId: 'usr_carlos_brick_01',
    name: 'Marcos Vinícius Silva',
    phone: '(11) 98123-4567',
    document: '382.910.482-10',
    cityOrNeighborhood: 'Vila Mariana - São Paulo/SP',
    notes: 'Cliente fiel de videogames. Paga sempre no PIX à vista se o produto tiver caixa original.',
    tags: ['Gamer', 'Compra no PIX', 'Xbox & PlayStation'],
    totalPurchasesCount: 2,
    totalSpent: 4200,
    wishlist: [
      {
        id: 'wish_01',
        category: 'consoles_games',
        modelQuery: 'PlayStation 5 Slim com leitor',
        maxBudget: 3200,
        notes: 'Quer com pelo menos 1 controle original e mídia física',
        createdAt: '2026-08-20T10:00:00.000Z',
      },
    ],
    createdAt: '2026-06-15T14:00:00.000Z',
    updatedAt: '2026-08-20T10:00:00.000Z',
  },
  {
    id: 'cli_juliana_alves_02',
    userId: 'usr_carlos_brick_01',
    name: 'Juliana Alves Medeiros',
    phone: '(11) 97654-3210',
    cityOrNeighborhood: 'Pinheiros - São Paulo/SP',
    notes: 'Procura iPhones para a família. Exige saúde de bateria acima de 85% e sem marcas de queda.',
    tags: ['Apple', 'iPhones', 'Exigente', 'Cartão 12x'],
    totalPurchasesCount: 1,
    totalSpent: 3400,
    wishlist: [
      {
        id: 'wish_02',
        category: 'smartphones',
        modelQuery: 'iPhone 13 ou 14 Pro 128GB/256GB',
        maxBudget: 3500,
        notes: 'Cor de preferência: Branco, Grafite ou Roxo',
        createdAt: '2026-08-22T11:00:00.000Z',
      },
    ],
    createdAt: '2026-07-02T09:30:00.000Z',
    updatedAt: '2026-08-22T11:00:00.000Z',
  },
  {
    id: 'cli_rodrigo_motos_03',
    userId: 'usr_carlos_brick_01',
    name: 'Rodrigo Fontana (BRICK de Carros/Motos)',
    phone: '(11) 99887-1122',
    cityOrNeighborhood: 'São Bernardo do Campo/SP',
    notes: 'Negociante parceiro de veículos e motos. Aceita rolo com volta rápida.',
    tags: ['Revendedor', 'Veículos & Motos', 'Pega Rolo'],
    totalPurchasesCount: 3,
    totalSpent: 28500,
    wishlist: [
      {
        id: 'wish_03',
        category: 'vehicles',
        modelQuery: 'Honda CG 160 Fan ou Titan',
        maxBudget: 14000,
        notes: 'Documentação 2026 rigorosamente em dia para transferência imediata',
        createdAt: '2026-08-25T15:00:00.000Z',
      },
    ],
    createdAt: '2026-05-10T08:00:00.000Z',
    updatedAt: '2026-08-25T15:00:00.000Z',
  },
];

// Seed Initial Demo Users
const INITIAL_USERS: User[] = [
  {
    id: 'usr_carlos_brick_01',
    name: 'Carlos Henrique (Mestre do BRICK)',
    email: 'RcarlinhosO13H@gmail.com',
    phone: '(11) 98765-4321',
    storeName: 'CH BRICK Multiuso & Negócios Rápidos',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    createdAt: '2025-01-10T10:00:00.000Z',
  },
  {
    id: 'usr_mariana_motors_02',
    name: 'Mariana Duarte (BRICK & Trocas Express)',
    email: 'mariana@duartemotors.com.br',
    phone: '(41) 99123-8899',
    storeName: 'Duarte BRICK & Eletro-Eletrônicos',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    createdAt: '2025-02-15T14:30:00.000Z',
  },
];

// Seed Realistic Multi-Category Inventory for Carlos
const INITIAL_ITEMS: BrickItem[] = [
  {
    id: 'item_xbox_series_x_01',
    userId: 'usr_carlos_brick_01',
    category: 'consoles_games',
    model: 'Xbox Series X 1TB 4K Preto com 2 Controles',
    brand: 'Microsoft',
    condition: 'seminovo_impecavel',
    storageOrSpecs: '1TB NVMe SSD / 4K 120fps / Leitor Blu-ray',
    accessoriesIncluded: '2 Controles sem fio originais, 3 Jogos mídia física (Forza, Halo, GTA V), Cabo HDMI 2.1 e Caixa original',
    serialOrImei: 'SN-049281948201',
    status: 'in_stock',
    // Compra
    purchasePrice: 2400,
    fipeValue: 3400, // Preço médio de mercado
    paymentMethod: 'pix',
    assumedDebts: 0,
    purchaseDate: '2026-08-18',
    // Logística / Frete
    distanceKm: 25,
    fuelExpense: 35, // Uber / gasolina para buscar
    fuelPricePerLiter: 5.89,
    additionalLogistics: 0,
    // Preparação & Limpeza
    mechanics: 0,
    bodyworkPaint: 0,
    detailing: 40, // Limpeza interna e externa especializada
    tiresWheels: 0,
    documentation: 0,
    commissions: 50, // Comissão do amigo que indicou o BRICK
    marketing: 30, // Destaque na OLX
    hiddenDefectReservePercent: 3.0,
    notes: 'Console 100% silencioso, sem detalhes estéticos. Lacres de fábrica intactos.',
    salePrice: 3290,
    cardFees: 0,
    createdAt: '2026-08-18T10:00:00.000Z',
    updatedAt: '2026-08-20T12:00:00.000Z',
  },
  {
    id: 'item_iphone_14_pro_02',
    userId: 'usr_carlos_brick_01',
    category: 'smartphones',
    model: 'iPhone 14 Pro 128GB Roxo Profundo',
    brand: 'Apple',
    condition: 'seminovo_impecavel',
    storageOrSpecs: '128GB / Saúde Bateria 89% / Tela 120Hz ProMotion',
    accessoriesIncluded: 'Caixa original com mesmo IMEI, Cabo USB-C original, Carregador 20W e 2 capas MagSafe',
    serialOrImei: 'IMEI-358920194820194 (100% Limpo Anatel)',
    batteryHealth: 89,
    status: 'in_stock',
    // Compra
    purchasePrice: 3200,
    fipeValue: 4300,
    paymentMethod: 'pix',
    assumedDebts: 0,
    purchaseDate: '2026-08-21',
    // Logística
    distanceKm: 15,
    fuelExpense: 20,
    fuelPricePerLiter: 5.89,
    additionalLogistics: 0,
    // Preparação
    mechanics: 0,
    bodyworkPaint: 0,
    detailing: 25, // Película 3D nova aplicada
    tiresWheels: 0,
    documentation: 0,
    commissions: 0,
    marketing: 40,
    hiddenDefectReservePercent: 3.5,
    notes: 'Todas as peças originais Apple (sem avisos de tela/bateria). Face ID perfeito.',
    salePrice: 4150,
    cardFees: 0,
    createdAt: '2026-08-21T15:30:00.000Z',
    updatedAt: '2026-08-22T09:00:00.000Z',
  },
  {
    id: 'item_tv_lg_55_03',
    userId: 'usr_carlos_brick_01',
    category: 'tv_audio',
    model: 'Smart TV LG 55" 4K UHD ThinQ AI com Smart Magic',
    brand: 'LG',
    condition: 'seminovo_impecavel',
    storageOrSpecs: '55 Polegadas / 4K UHD / HDR10 Pro / Wi-Fi 5G & Bluetooth',
    accessoriesIncluded: 'Controle remoto Smart Magic original (cursor na tela), Suporte de parede + Pés originais, Cabo de força',
    serialOrImei: 'LG55UQ-948291',
    voltage: 'bivolt',
    status: 'in_stock',
    // Compra
    purchasePrice: 1100,
    fipeValue: 1850,
    paymentMethod: 'pix',
    assumedDebts: 0,
    purchaseDate: '2026-08-12',
    // Logística
    distanceKm: 30,
    fuelExpense: 45, // Freteiro para buscar a TV com segurança
    fuelPricePerLiter: 5.89,
    additionalLogistics: 0,
    // Preparação
    mechanics: 0,
    bodyworkPaint: 0,
    detailing: 30, // Higienização completa e teste de todas as entradas HDMI
    tiresWheels: 0,
    documentation: 0,
    commissions: 0,
    marketing: 25,
    hiddenDefectReservePercent: 3.0,
    notes: 'Tela perfeita, sem burn-in ou dead pixels. Excelente para sala ou games.',
    salePrice: 1750,
    cardFees: 0,
    createdAt: '2026-08-12T14:00:00.000Z',
    updatedAt: '2026-08-15T11:00:00.000Z',
  },
  {
    id: 'veh_civic_2016_01',
    userId: 'usr_carlos_brick_01',
    category: 'vehicles',
    model: 'Honda Civic LXR 2.0 16V Flexone Aut.',
    brand: 'Honda',
    yearModel: '2015/2016',
    plate: 'BRA2E19',
    color: 'Cinza Barium',
    mileage: 89400,
    condition: 'seminovo_impecavel',
    status: 'in_stock',
    // Compra
    purchasePrice: 63000,
    fipeValue: 74500,
    paymentMethod: 'a_vista',
    assumedDebts: 1450,
    purchaseDate: '2026-08-05',
    // Logística
    distanceKm: 180,
    fuelExpense: 220,
    fuelPricePerLiter: 5.89,
    avgConsumptionKmPerLiter: 11.2,
    additionalLogistics: 95,
    // Preparação
    mechanics: 1200,
    bodyworkPaint: 650,
    detailing: 450,
    tiresWheels: 800,
    documentation: 580,
    commissions: 500,
    marketing: 150,
    hiddenDefectReservePercent: 3.5,
    notes: 'Carro muito íntegro, interna impecável. Comprado de único dono com manual e chave reserva.',
    salePrice: 76900,
    cardFees: 0,
    createdAt: '2026-08-05T09:00:00.000Z',
    updatedAt: '2026-08-20T14:00:00.000Z',
  },
  {
    id: 'veh_gol_2021_02',
    userId: 'usr_carlos_brick_01',
    category: 'vehicles',
    model: 'Volkswagen Gol 1.6 MSI Flex Manual',
    brand: 'Volkswagen',
    yearModel: '2020/2021',
    plate: 'RKS4H88',
    color: 'Branco Cristal',
    mileage: 64200,
    condition: 'usado_bom',
    status: 'sold',
    // Compra
    purchasePrice: 42000,
    fipeValue: 51800,
    paymentMethod: 'a_vista',
    assumedDebts: 0,
    purchaseDate: '2026-07-10',
    // Logística
    distanceKm: 90,
    fuelExpense: 110,
    fuelPricePerLiter: 5.85,
    avgConsumptionKmPerLiter: 13.5,
    additionalLogistics: 40,
    // Preparação
    mechanics: 480,
    bodyworkPaint: 0,
    detailing: 250,
    tiresWheels: 350,
    documentation: 490,
    commissions: 300,
    marketing: 100,
    hiddenDefectReservePercent: 3,
    notes: 'Vendido para motorista de aplicativo à vista no PIX com lucro rápido.',
    salePrice: 50900,
    saleDate: '2026-07-28',
    cardFees: 0,
    createdAt: '2026-07-10T11:00:00.000Z',
    updatedAt: '2026-07-28T16:00:00.000Z',
  },
  {
    id: 'item_notebook_dell_04',
    userId: 'usr_carlos_brick_01',
    category: 'computers',
    model: 'Notebook Dell Inspiron Core i7 16GB RAM SSD 512GB',
    brand: 'Dell',
    condition: 'seminovo_impecavel',
    storageOrSpecs: 'Intel Core i7 11ª Ger / 16GB DDR4 / SSD 512GB NVMe / Tela 15.6" Full HD',
    accessoriesIncluded: 'Carregador original Dell 65W, Mouse sem fio Logitech, Formatado Windows 11',
    serialOrImei: 'DELL-TAG-849204',
    batteryHealth: 92,
    status: 'sold',
    // Compra
    purchasePrice: 1400,
    fipeValue: 2400,
    paymentMethod: 'pix',
    assumedDebts: 0,
    purchaseDate: '2026-07-15',
    distanceKm: 10,
    fuelExpense: 15,
    fuelPricePerLiter: 5.89,
    additionalLogistics: 0,
    mechanics: 60, // Troca de pasta térmica prata
    bodyworkPaint: 0,
    detailing: 30, // Limpeza técnica
    tiresWheels: 0,
    documentation: 0,
    commissions: 0,
    marketing: 30,
    hiddenDefectReservePercent: 3.0,
    notes: 'Vendido para estudante de engenharia em 6 dias.',
    salePrice: 2250,
    saleDate: '2026-07-21',
    cardFees: 0,
    createdAt: '2026-07-15T11:00:00.000Z',
    updatedAt: '2026-07-21T18:00:00.000Z',
  },
  {
    id: 'item_dewalt_tools_05',
    userId: 'usr_carlos_brick_01',
    category: 'tools',
    model: 'Kit Furadeira e Parafusadeira DeWalt 20V Max com 2 Baterias',
    brand: 'DeWalt',
    condition: 'usado_bom',
    storageOrSpecs: 'Motor Brushless / Mandril 1/2" / 20V Max Íon de Lítio',
    accessoriesIncluded: '2 Baterias 2.0Ah originais, Carregador rápido bivolt, Maleta TSTAK rígida',
    serialOrImei: 'DCD7781D2-9481',
    voltage: 'bivolt',
    status: 'in_stock',
    purchasePrice: 420,
    fipeValue: 850,
    paymentMethod: 'pix',
    assumedDebts: 0,
    purchaseDate: '2026-08-20',
    distanceKm: 12,
    fuelExpense: 15,
    fuelPricePerLiter: 5.89,
    additionalLogistics: 0,
    mechanics: 0,
    bodyworkPaint: 0,
    detailing: 20, // Limpeza de contatos e lubrificação do mandril
    tiresWheels: 0,
    documentation: 0,
    commissions: 0,
    marketing: 20,
    hiddenDefectReservePercent: 3.0,
    notes: 'Ferramenta robusta, baterias segurando 100% de carga.',
    salePrice: 780,
    cardFees: 0,
    createdAt: '2026-08-20T16:00:00.000Z',
    updatedAt: '2026-08-20T16:00:00.000Z',
  },
];

export const storageService = {
  // Users Management
  getUsers(): User[] {
    try {
      const data = localStorage.getItem(STORAGE_USERS_KEY);
      if (!data) {
        localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(INITIAL_USERS));
        return INITIAL_USERS;
      }
      const list: User[] = JSON.parse(data);
      // Ensure primary user email is up to date
      const carlos = list.find((u) => u.id === 'usr_carlos_brick_01');
      if (carlos && carlos.email !== 'RcarlinhosO13H@gmail.com') {
        carlos.email = 'RcarlinhosO13H@gmail.com';
        localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(list));
      }
      return list;
    } catch (e) {
      console.error('Error loading users:', e);
      return INITIAL_USERS;
    }
  },

  saveUser(user: User): void {
    const users = this.getUsers();
    const index = users.findIndex((u) => u.id === user.id);
    if (index >= 0) {
      users[index] = user;
    } else {
      users.push(user);
    }
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
  },

  // Items / Products Management with Strict RLS (Row-Level Security)
  getItems(): BrickItem[] {
    try {
      const data = localStorage.getItem(STORAGE_ITEMS_KEY);
      if (!data) {
        // Migrate or initialize
        localStorage.setItem(STORAGE_ITEMS_KEY, JSON.stringify(INITIAL_ITEMS));
        return INITIAL_ITEMS;
      }
      const parsed: BrickItem[] = JSON.parse(data);
      // Ensure each item has a valid category
      return parsed.map((item) => ({
        ...item,
        category: item.category || (item.plate || item.mileage ? 'vehicles' : 'other'),
      }));
    } catch (e) {
      console.error('Error loading items:', e);
      return INITIAL_ITEMS;
    }
  },

  getItemsByUserId(userId: string): BrickItem[] {
    const all = this.getItems();
    return all.filter((v) => v.userId === userId);
  },

  saveItem(item: BrickItem): BrickItem {
    const all = this.getItems();
    const index = all.findIndex((v) => v.id === item.id);
    const updated = {
      ...item,
      category: item.category || 'other',
      updatedAt: new Date().toISOString(),
    };

    if (index >= 0) {
      all[index] = updated;
    } else {
      updated.createdAt = updated.createdAt || new Date().toISOString();
      all.unshift(updated);
    }

    localStorage.setItem(STORAGE_ITEMS_KEY, JSON.stringify(all));
    return updated;
  },

  deleteItem(id: string): void {
    const all = this.getItems();
    const filtered = all.filter((v) => v.id !== id);
    localStorage.setItem(STORAGE_ITEMS_KEY, JSON.stringify(filtered));
  },

  // Clients (CRM)
  getClients(): Client[] {
    const raw = localStorage.getItem(STORAGE_CLIENTS_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_CLIENTS_KEY, JSON.stringify(INITIAL_CLIENTS));
      return INITIAL_CLIENTS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_CLIENTS;
    }
  },

  getClientsByUserId(userId: string): Client[] {
    return this.getClients().filter((c) => c.userId === userId);
  },

  saveClient(client: Client): Client {
    const all = this.getClients();
    const existingIndex = all.findIndex((c) => c.id === client.id);
    const now = new Date().toISOString();
    const updatedClient: Client = {
      ...client,
      updatedAt: now,
      createdAt: client.createdAt || now,
    };

    if (existingIndex >= 0) {
      all[existingIndex] = updatedClient;
    } else {
      all.unshift(updatedClient);
    }

    localStorage.setItem(STORAGE_CLIENTS_KEY, JSON.stringify(all));
    return updatedClient;
  },

  deleteClient(id: string): void {
    const all = this.getClients().filter((c) => c.id !== id);
    localStorage.setItem(STORAGE_CLIENTS_KEY, JSON.stringify(all));
  },

  // Aliases for compatibility
  getVehiclesByUserId(userId: string): BrickItem[] {
    return this.getItemsByUserId(userId);
  },

  saveVehicle(vehicle: BrickItem): BrickItem {
    return this.saveItem(vehicle);
  },

  deleteVehicle(id: string): void {
    this.deleteItem(id);
  },

  // Export / Backup
  exportDataForUser(userId: string): string {
    const user = this.getUsers().find((u) => u.id === userId);
    const items = this.getItemsByUserId(userId);
    const clients = this.getClientsByUserId(userId);
    const exportObject = {
      exportVersion: '3.0',
      system: 'AUTOBRICK & BRICK Universal Copilot & CRM',
      exportedAt: new Date().toISOString(),
      user,
      items,
      clients,
    };
    return JSON.stringify(exportObject, null, 2);
  },

  // Import / Restore
  importDataForUser(jsonString: string, currentUserId: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      const incomingItems: BrickItem[] = parsed.items || parsed.vehicles || [];
      const incomingClients: Client[] = parsed.clients || [];

      if (!Array.isArray(incomingItems)) {
        return false;
      }

      // Update items
      const allItems = this.getItems();
      const otherUsersItems = allItems.filter((v) => v.userId !== currentUserId);
      const sanitizedIncomingItems = incomingItems.map((item) => ({
        ...item,
        id: item.id || `item_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        userId: currentUserId,
        category: item.category || 'other',
        updatedAt: new Date().toISOString(),
      }));
      const mergedItems = [...sanitizedIncomingItems, ...otherUsersItems];
      localStorage.setItem(STORAGE_ITEMS_KEY, JSON.stringify(mergedItems));

      // Update clients if provided
      if (Array.isArray(incomingClients) && incomingClients.length > 0) {
        const allClients = this.getClients();
        const otherUsersClients = allClients.filter((c) => c.userId !== currentUserId);
        const sanitizedIncomingClients = incomingClients.map((client) => ({
          ...client,
          id: client.id || `cli_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          userId: currentUserId,
          updatedAt: new Date().toISOString(),
        }));
        const mergedClients = [...sanitizedIncomingClients, ...otherUsersClients];
        localStorage.setItem(STORAGE_CLIENTS_KEY, JSON.stringify(mergedClients));
      }

      return true;
    } catch (e) {
      console.error('Failed to import json data:', e);
      return false;
    }
  },
};
