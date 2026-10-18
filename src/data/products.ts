import { Product, SiteSettings } from '../types/store';
import storeData from './store-data.json';

export const DEFAULT_SITE_SETTINGS: SiteSettings = (storeData.siteSettings || {
  storeName: 'CS CLOTHING STORE',
  topBannerText: 'Envio Expresso para todo o Brasil • Despacho em até 24h úteis',
  heroBadge: 'COLEÇÃO EXCLUSIVA DE CAMISAS MASCULINAS & FEMININAS',
  heroTitle: 'Elegância, Caimento Impecável e Estilo Autoral.',
  heroSubtitle: 'Camisas masculinas e femininas confeccionadas com tecidos nobres, do linho puro à alfaiataria premium. Elegância autoral e entrega expressa para todo o território nacional.',
  whatsappNumber: '',
  instagramHandle: '',
  jadlogOriginCep: '01310-100',
  jadlogPickupAddress: 'CS Clothing Store CD • Rua Augusta, 1400 - Consolação, São Paulo - SP',
  categories: ['Camisa Social', 'Camisa Casual'],
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
      title: 'Camisaria Especializada',
      description: 'Modelagens masculinas e femininas com tecidos nobres e acabamento alfaiataria.',
      icon: 'shirt',
      color: 'blue',
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
