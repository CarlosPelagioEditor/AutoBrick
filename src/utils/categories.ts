import { ItemCategory, CategoryInfo } from '../types';

export const CATEGORIES_CONFIG: Record<ItemCategory, CategoryInfo> = {
  consoles_games: {
    id: 'consoles_games',
    name: 'Games & Consoles (Xbox, PS, Switch)',
    iconName: 'Gamepad2',
    emoji: '🎮',
    marketPriceLabel: 'Preço Médio de Mercado',
    specsLabel: 'Armazenamento & Versão (ex: 512GB, 1TB)',
    accessoriesPlaceholder: 'Ex: 2 Controles originais, Cabo HDMI 2.1, 3 Jogos em mídia física, Caixa original',
    logisticsLabel: 'Frete, Entrega ou Uber',
  },
  smartphones: {
    id: 'smartphones',
    name: 'Celulares & Smartphones (iPhone, Samsung)',
    iconName: 'Smartphone',
    emoji: '📱',
    marketPriceLabel: 'Preço de Mercado (Usado/Seminovo)',
    specsLabel: 'Memória / Cor (ex: 128GB, 256GB Grafite)',
    accessoriesPlaceholder: 'Ex: Caixa original, Cabo USB-C original, Carregador 20W, 2 Capinhas',
    logisticsLabel: 'Uber / Motoboy / Envio',
  },
  tv_audio: {
    id: 'tv_audio',
    name: 'TVs & Áudio (Smart TV, Som, Home Theater)',
    iconName: 'Tv',
    emoji: '📺',
    marketPriceLabel: 'Preço Médio de Mercado',
    specsLabel: 'Polegadas & Resolução (ex: 55" 4K UHD)',
    accessoriesPlaceholder: 'Ex: Controle remoto original Smart Magic, Suporte de parede, Cabo de força',
    logisticsLabel: 'Frete / Freteiro / Busca de Carro',
  },
  vehicles: {
    id: 'vehicles',
    name: 'Veículos (Carros, Motos, Ciclomotores)',
    iconName: 'Car',
    emoji: '🚗',
    marketPriceLabel: 'Tabela FIPE Oficial',
    specsLabel: 'Motor, Câmbio & Versão',
    accessoriesPlaceholder: 'Ex: Manual do proprietário, Chave reserva, Rodas liga leve, Multimídia',
    logisticsLabel: 'Combustível, Pedágio & Guincho',
  },
  computers: {
    id: 'computers',
    name: 'Informática & PC Gamer (Notebook, PC, GPU)',
    iconName: 'Laptop',
    emoji: '💻',
    marketPriceLabel: 'Preço Médio de Mercado',
    specsLabel: 'Processador / RAM / Placa de Vídeo',
    accessoriesPlaceholder: 'Ex: Carregador original, Mouse gamer, Teclado mecânico, Mochila',
    logisticsLabel: 'Frete / Entrega / Motoboy',
  },
  tools: {
    id: 'tools',
    name: 'Ferramentas & Equipamentos',
    iconName: 'Wrench',
    emoji: '🛠️',
    marketPriceLabel: 'Preço de Referência de Mercado',
    specsLabel: 'Potência, Voltagem & Modelo',
    accessoriesPlaceholder: 'Ex: Maleta de transporte, 2 Baterias 18V, Carregador rápido, Brocas',
    logisticsLabel: 'Transporte / Frete',
  },
  appliances: {
    id: 'appliances',
    name: 'Eletrodomésticos & Casa (Geladeiras, Airfryer)',
    iconName: 'Refrigerator',
    emoji: '🧊',
    marketPriceLabel: 'Preço de Mercado',
    specsLabel: 'Capacidade (Litros) & Voltagem',
    accessoriesPlaceholder: 'Ex: Manual, Prateleiras de vidro, Pés niveladores',
    logisticsLabel: 'Frete / Carreto',
  },
  furniture: {
    id: 'furniture',
    name: 'Móveis & Decoração',
    iconName: 'Armchair',
    emoji: '🛋️',
    marketPriceLabel: 'Preço Médio de Usado',
    specsLabel: 'Dimensões & Material',
    accessoriesPlaceholder: 'Ex: Almofadas, Parafusos de montagem',
    logisticsLabel: 'Carreto / Desmontagem',
  },
  watches_jewelry: {
    id: 'watches_jewelry',
    name: 'Relógios, Joias & Acessórios',
    iconName: 'Watch',
    emoji: '⌚',
    marketPriceLabel: 'Preço de Mercado / Avaliação',
    specsLabel: 'Material / Mecanismo / Tamanho',
    accessoriesPlaceholder: 'Ex: Certificado de autenticidade, Elos extras, Estojo original',
    logisticsLabel: 'Envio seguro / Entrega em local público',
  },
  other: {
    id: 'other',
    name: 'Outros Produtos & Lotes do Brik',
    iconName: 'Package',
    emoji: '📦',
    marketPriceLabel: 'Valor de Referência / Mercado',
    specsLabel: 'Especificações Gerais',
    accessoriesPlaceholder: 'Ex: Acessórios inclusos e itens do pacote',
    logisticsLabel: 'Custos de Busca / Entrega',
  },
};

export const CATEGORIES_LIST = Object.values(CATEGORIES_CONFIG);

export function getCategoryInfo(categoryId?: ItemCategory): CategoryInfo {
  if (!categoryId || !CATEGORIES_CONFIG[categoryId]) {
    return CATEGORIES_CONFIG.other;
  }
  return CATEGORIES_CONFIG[categoryId];
}

// Preset Quick Templates for Fast Data Entry
export interface ItemPreset {
  label: string;
  category: ItemCategory;
  model: string;
  brand: string;
  storageOrSpecs: string;
  accessoriesIncluded: string;
  purchasePrice: number;
  fipeValue: number;
  condition: 'novo_lacrado' | 'seminovo_impecavel' | 'usado_bom' | 'com_detalhes';
  prepCosts: {
    mechanics: number;
    detailing: number;
    marketing: number;
    reservePercent: number;
  };
}

export const ITEM_PRESETS: ItemPreset[] = [
  {
    label: '🎮 Xbox Series S 512GB (Seminovo)',
    category: 'consoles_games',
    model: 'Xbox Series S 512GB SSD Branco',
    brand: 'Microsoft',
    storageOrSpecs: '512GB NVMe SSD Digital',
    accessoriesIncluded: '1 Controle original branco, Cabo HDMI 2.1, Cabo de força, Caixa original',
    purchasePrice: 1350,
    fipeValue: 1900,
    condition: 'seminovo_impecavel',
    prepCosts: { mechanics: 0, detailing: 40, marketing: 30, reservePercent: 3 },
  },
  {
    label: '🎮 Xbox Series X 1TB (Top)',
    category: 'consoles_games',
    model: 'Xbox Series X 1TB SSD 4K Preto',
    brand: 'Microsoft',
    storageOrSpecs: '1TB NVMe SSD Leitor 4K Blu-ray',
    accessoriesIncluded: '2 Controles originais sem fio, 3 Jogos mídia física, Cabo HDMI ultra high speed',
    purchasePrice: 2600,
    fipeValue: 3500,
    condition: 'seminovo_impecavel',
    prepCosts: { mechanics: 0, detailing: 50, marketing: 40, reservePercent: 3 },
  },
  {
    label: '📱 iPhone 13 128GB (Saúde 88%)',
    category: 'smartphones',
    model: 'iPhone 13 128GB Meia-Noite',
    brand: 'Apple',
    storageOrSpecs: '128GB / Bateria 88% / Face ID 100%',
    accessoriesIncluded: 'Cabo USB-C original, Película 3D nova aplicada, Capinha MagSafe anti-impacto',
    purchasePrice: 2100,
    fipeValue: 2900,
    condition: 'seminovo_impecavel',
    prepCosts: { mechanics: 0, detailing: 30, marketing: 35, reservePercent: 3 },
  },
  {
    label: '📱 iPhone 14 Pro 128GB',
    category: 'smartphones',
    model: 'iPhone 14 Pro 128GB Roxo Profundo',
    brand: 'Apple',
    storageOrSpecs: '128GB / Bateria 89% / Dynamic Island',
    accessoriesIncluded: 'Caixa original com mesmo IMEI, Cabo original, Fonte 20W e 2 capas',
    purchasePrice: 3300,
    fipeValue: 4400,
    condition: 'seminovo_impecavel',
    prepCosts: { mechanics: 0, detailing: 35, marketing: 50, reservePercent: 3 },
  },
  {
    label: '📺 Smart TV Samsung 55" 4K',
    category: 'tv_audio',
    model: 'Smart TV Samsung 55" Crystal UHD 4K',
    brand: 'Samsung',
    storageOrSpecs: '55 Polegadas / 4K HDR / Wi-Fi & Bluetooth',
    accessoriesIncluded: 'Controle remoto SolarCell original, Pés de apoio, Cabo de força, Testada 100%',
    purchasePrice: 1100,
    fipeValue: 1850,
    condition: 'seminovo_impecavel',
    prepCosts: { mechanics: 0, detailing: 40, marketing: 30, reservePercent: 3 },
  },
  {
    label: '📺 Smart TV LG 50" 4K ThinQ AI',
    category: 'tv_audio',
    model: 'Smart TV LG 50" 4K UHD AI ThinQ',
    brand: 'LG',
    storageOrSpecs: '50 Polegadas / 4K / WebOS',
    accessoriesIncluded: 'Controle Smart Magic com comando de voz, Base, Cabo de energia',
    purchasePrice: 950,
    fipeValue: 1650,
    condition: 'usado_bom',
    prepCosts: { mechanics: 0, detailing: 30, marketing: 25, reservePercent: 3 },
  },
  {
    label: '💻 Notebook Dell Core i7 16GB',
    category: 'computers',
    model: 'Notebook Dell Inspiron 15 Core i7 16GB',
    brand: 'Dell',
    storageOrSpecs: 'Intel Core i7 11ª Ger / 16GB RAM / SSD 512GB NVMe / Tela Full HD',
    accessoriesIncluded: 'Carregador original Dell 65W, Formatado com Windows 11 Pro e Office ativado',
    purchasePrice: 1500,
    fipeValue: 2400,
    condition: 'seminovo_impecavel',
    prepCosts: { mechanics: 80, detailing: 40, marketing: 35, reservePercent: 3 },
  },
  {
    label: '🛠️ Furadeira / Parafusadeira DeWalt 20V',
    category: 'tools',
    model: 'Parafusadeira e Furadeira de Impacto DeWalt 20V Max',
    brand: 'DeWalt',
    storageOrSpecs: 'Motor Brushless / Mandril 1/2" / 20V Max',
    accessoriesIncluded: '2 Baterias de 2.0Ah, Carregador bivolt, Maleta TSTAK original',
    purchasePrice: 450,
    fipeValue: 850,
    condition: 'usado_bom',
    prepCosts: { mechanics: 0, detailing: 25, marketing: 20, reservePercent: 3 },
  },
  {
    label: '🚗 Honda Civic LXR 2.0 2016',
    category: 'vehicles',
    model: 'Honda Civic LXR 2.0 16V Flexone Aut.',
    brand: 'Honda',
    storageOrSpecs: '2.0 Flexone 155cv Câmbio Automático 5M',
    accessoriesIncluded: 'Manual do proprietário, Chave reserva, Câmera de ré, Rodas aro 17',
    purchasePrice: 63000,
    fipeValue: 74500,
    condition: 'seminovo_impecavel',
    prepCosts: { mechanics: 1200, detailing: 450, marketing: 150, reservePercent: 3.5 },
  },
];
