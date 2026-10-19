import { Product, SiteSettings } from '../types/store';
import storeData from './store-data.json';

export const DEFAULT_SITE_SETTINGS: SiteSettings = (storeData.siteSettings || {
  storeName: 'CS CLOTHING STORE',
  topBannerText: 'Envio Expresso para todo o Brasil • Despacho em até 24h úteis',
  heroBadge: 'CASUAL • JOVEM • STREET • FITNESS',
  heroTitle: 'Seu estilo. Sua identidade.',
  heroSubtitle: 'Moda autoral e streetwear unissex para quem valoriza conforto, qualidade e personalidade. Peças exclusivas com caimento perfeito para todos os estilos.',
  whatsappNumber: '',
  instagramHandle: '',
  jadlogOriginCep: '01310-100',
  jadlogPickupAddress: 'CS Clothing Store CD • Rua Augusta, 1400 - Consolação, São Paulo - SP',
  categories: ['Camisa Casual', 'Original', 'Oversized', 'Streetwear'],
  adminUsername: 'admin',
  adminPassword: 'admin',
  mercadoPagoAccessToken: 'APP_USR-3345611795216825-031010-c151d4812a4f61dac62f4135483553a6-214542459',
  advantages: [
    {
      id: 'adv-1',
      title: 'Envio Expresso para Todo Brasil',
      description: 'Entregas ágeis e rastreadas com frete calculado diretamente no checkout.',
      icon: 'truck',
      color: 'emerald',
      enabled: true,
    },
    {
      id: 'adv-2',
      title: 'Coleção & Roupas Unissex',
      description: 'Modelagens autênticas com caimento moderno e tecidos premium para todos os estilos.',
      icon: 'sparkles',
      color: 'purple',
      enabled: true,
    },
    {
      id: 'adv-3',
      title: 'Linho Puro & Fio Nobre',
      description: 'Peças selecionadas com toque macio, corte impecável e durabilidade superior.',
      icon: 'sparkles',
      color: 'purple',
      enabled: true,
    },
    {
      id: 'adv-4',
      title: 'Compra 100% Segura & Pix',
      description: 'Pagamentos protegidos via Pix com aprovação imediata ou cartão parcelado.',
      icon: 'shield',
      color: 'amber',
      enabled: true,
    },
  ],
}) as SiteSettings;

export const INITIAL_PRODUCTS: Product[] = (storeData.products || []) as Product[];
