import React from 'react';
import {
  Truck,
  Sparkles,
  Package,
  ShieldCheck,
  Shirt,
  Repeat,
  CreditCard,
  Zap,
  Gem,
  Star,
  Lock,
  Clock,
  MessageCircle,
  CheckCircle2,
  Tag,
} from 'lucide-react';

export interface IconOption {
  id: string;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
}

export interface ColorOption {
  id: string;
  label: string;
  bgClass: string;
  textClass: string;
}

export const AVAILABLE_ICONS: IconOption[] = [
  { id: 'truck', label: 'Caminhão / Frete', Icon: Truck },
  { id: 'sparkles', label: 'Brilho / Especialidade', Icon: Sparkles },
  { id: 'package', label: 'Caixa / Pacote', Icon: Package },
  { id: 'shield', label: 'Escudo / Proteção', Icon: ShieldCheck },
  { id: 'shirt', label: 'Camisa / Alfaiataria', Icon: Shirt },
  { id: 'repeat', label: 'Troca Fácil / Devolução', Icon: Repeat },
  { id: 'credit-card', label: 'Cartão / Parcelamento', Icon: CreditCard },
  { id: 'zap', label: 'Raio / Envio Expresso', Icon: Zap },
  { id: 'gem', label: 'Diamante / Luxo', Icon: Gem },
  { id: 'star', label: 'Estrela / Destaque', Icon: Star },
  { id: 'lock', label: 'Cadeado / Compra Segura', Icon: Lock },
  { id: 'clock', label: 'Relógio / Pronta Entrega', Icon: Clock },
  { id: 'message-circle', label: 'WhatsApp / Atendimento', Icon: MessageCircle },
  { id: 'check-circle', label: 'Garantia / Verificado', Icon: CheckCircle2 },
  { id: 'tag', label: 'Etiqueta / Desconto', Icon: Tag },
];

export const AVAILABLE_COLORS: ColorOption[] = [
  { id: 'emerald', label: 'Verde Esmeralda', bgClass: 'bg-emerald-100', textClass: 'text-emerald-800' },
  { id: 'blue', label: 'Azul Nobre', bgClass: 'bg-blue-100', textClass: 'text-blue-800' },
  { id: 'amber', label: 'Âmbar / Ouro', bgClass: 'bg-amber-100', textClass: 'text-amber-800' },
  { id: 'purple', label: 'Roxo Premium', bgClass: 'bg-purple-100', textClass: 'text-purple-800' },
  { id: 'neutral', label: 'Grafite Neutro', bgClass: 'bg-neutral-100', textClass: 'text-neutral-800' },
  { id: 'rose', label: 'Rosa Alfaiataria', bgClass: 'bg-rose-100', textClass: 'text-rose-800' },
];

export const getIconComponent = (iconId: string) => {
  const found = AVAILABLE_ICONS.find((item) => item.id === iconId);
  return found ? found.Icon : Truck;
};

export const getColorClasses = (colorId?: string) => {
  const found = AVAILABLE_COLORS.find((item) => item.id === colorId);
  return found
    ? `${found.bgClass} ${found.textClass}`
    : 'bg-emerald-100 text-emerald-800';
};

interface AdvantageIconProps {
  iconId: string;
  colorId?: string;
  className?: string;
}

export const AdvantageIcon: React.FC<AdvantageIconProps> = ({
  iconId,
  colorId,
  className = 'w-5 h-5',
}) => {
  const IconComponent = getIconComponent(iconId);
  return <IconComponent className={className} />;
};
