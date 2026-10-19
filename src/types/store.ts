export type Currency = 'BRL';

export interface ProductVariant {
  id: string;
  size: 'PP' | 'P' | 'M' | 'G' | 'GG';
  color: string;
  stock: number;
}

export interface Product {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  gender: 'Masculino' | 'Feminino' | 'Unissex';
  category: string;
  material: string;
  composition: string;
  weightGrams: number;
  packageDimensions: {
    lengthCm: number;
    widthCm: number;
    heightCm: number;
  };
  priceBRL: number;
  images: string[];
  variants: ProductVariant[];
  tag?: string;
  featured?: boolean;
}

export interface CartItem {
  product: Product;
  variant: ProductVariant;
  quantity: number;
}

export interface ShippingRate {
  id: string;
  carrier: 'Jadlog';
  serviceName: string;
  serviceCode: string;
  priceBRL: number;
  estimatedDays: string;
  customsNote?: string;
  logoBadge: string;
}

export interface ShippingAddress {
  fullName: string;
  email: string;
  phone: string;
  postalCode: string;
  state: string;
  city: string;
  street: string;
  number: string;
  complement?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  items: CartItem[];
  shippingAddress: ShippingAddress;
  selectedRate: ShippingRate;
  subtotal: number;
  shippingCost: number;
  total: number;
  status: 'Pendente' | 'Pago' | 'Pronto para Coleta' | 'Em Trânsito Jadlog' | 'Entregue';
  trackingNumber: string;
  paymentMethod?: 'Pix' | 'Cartão de Crédito';
  pixPaymentId?: string;
  pixQrCode?: string;
}

export interface StoreAdvantage {
  id: string;
  title: string;
  description: string;
  icon: string;
  color?: string;
  enabled?: boolean;
}

export interface SiteSettings {
  storeName: string;
  topBannerText: string;
  heroBadge: string;
  heroTitle: string;
  heroSubtitle: string;
  whatsappNumber: string;
  instagramHandle: string;
  jadlogOriginCep: string;
  jadlogPickupAddress: string;
  categories: string[];
  advantages?: StoreAdvantage[];
  adminUsername?: string;
  adminPassword?: string;
  mercadoPagoAccessToken?: string;
}
