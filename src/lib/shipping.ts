import { CartItem, ShippingRate } from '../types/store';

export interface PackageMetrics {
  totalWeightGrams: number;
  totalWeightKg: number;
  volumetricWeightKg: number;
  billableWeightKg: number;
  maxDimensions: {
    lengthCm: number;
    widthCm: number;
    heightCm: number;
  };
}

/**
 * Calcula o peso e cubagem do pacote somando as camisas do carrinho
 */
export function calculatePackageMetrics(items: CartItem[]): PackageMetrics {
  if (items.length === 0) {
    return {
      totalWeightGrams: 0,
      totalWeightKg: 0,
      volumetricWeightKg: 0,
      billableWeightKg: 0,
      maxDimensions: { lengthCm: 0, widthCm: 0, heightCm: 0 },
    };
  }

  let totalWeightGrams = 0;
  let accumulatedHeightCm = 0;
  let maxLengthCm = 0;
  let maxWidthCm = 0;

  for (const item of items) {
    const qty = item.quantity;
    totalWeightGrams += item.product.weightGrams * qty;
    // Camisas dobradas em envelope ou caixa
    accumulatedHeightCm += (item.product.packageDimensions?.heightCm || 3) * qty;
    maxLengthCm = Math.max(maxLengthCm, item.product.packageDimensions?.lengthCm || 30);
    maxWidthCm = Math.max(maxWidthCm, item.product.packageDimensions?.widthCm || 22);
  }

  // Embalagem padrão mínima
  maxLengthCm = Math.max(maxLengthCm, 28);
  maxWidthCm = Math.max(maxWidthCm, 20);
  accumulatedHeightCm = Math.max(accumulatedHeightCm, 4);

  const totalWeightKg = Number((totalWeightGrams / 1000).toFixed(2));
  // Fórmula de cubagem oficial Jadlog: (C x L x A) / 6000
  const volumetricWeightKg = Number(((maxLengthCm * maxWidthCm * accumulatedHeightCm) / 6000).toFixed(2));
  // Peso considerado para cobrança (o maior entre o real e cubado)
  const billableWeightKg = Math.max(totalWeightKg, volumetricWeightKg, 0.3);

  return {
    totalWeightGrams,
    totalWeightKg,
    volumetricWeightKg,
    billableWeightKg,
    maxDimensions: {
      lengthCm: maxLengthCm,
      widthCm: maxWidthCm,
      heightCm: accumulatedHeightCm,
    },
  };
}

/**
 * Calcula frete Nacional com a transportadora JADLOG (.Package e .Com)
 */
export function calculateJadlogRates(cep: string, metrics: PackageMetrics, cartValueBRL: number): ShippingRate[] {
  const cleanCep = cep.replace(/\D/g, '');
  if (cleanCep.length < 8) return [];

  const weight = metrics.billableWeightKg;
  const firstDigit = cleanCep.charAt(0);

  let basePackage = 17.90;
  let baseCom = 26.50;
  let daysPackage = '2 a 4 dias úteis';
  let daysCom = '1 a 2 dias úteis';

  // Simulação de zonas tarifárias da Jadlog
  if (['0', '1'].includes(firstDigit)) {
    // SP Capital e Interior de SP
    basePackage = 15.90 + weight * 2.8;
    baseCom = 22.90 + weight * 4.2;
    daysPackage = '1 a 3 dias úteis';
    daysCom = '1 a 2 dias úteis';
  } else if (['2', '3', '8'].includes(firstDigit)) {
    // RJ, ES, MG, PR, SC
    basePackage = 21.90 + weight * 3.8;
    baseCom = 31.90 + weight * 5.5;
    daysPackage = '3 a 5 dias úteis';
    daysCom = '2 a 3 dias úteis';
  } else if (['7', '9'].includes(firstDigit)) {
    // DF, GO, MT, MS, RS
    basePackage = 26.50 + weight * 4.5;
    baseCom = 37.90 + weight * 6.5;
    daysPackage = '4 a 6 dias úteis';
    daysCom = '2 a 4 dias úteis';
  } else {
    // Nordeste e Norte
    basePackage = 32.90 + weight * 5.8;
    baseCom = 46.90 + weight * 8.5;
    daysPackage = '5 a 8 dias úteis';
    daysCom = '3 a 5 dias úteis';
  }

  // Seguro ad valorem Jadlog (0.5% sobre o valor das camisas)
  const insurance = cartValueBRL * 0.005;
  const pricePackage = Math.round((basePackage + insurance) * 100) / 100;
  const priceCom = Math.round((baseCom + insurance) * 100) / 100;

  return [
    {
      id: 'jadlog-package',
      carrier: 'Jadlog',
      serviceName: 'Jadlog .Package',
      serviceCode: 'JAD_PKG',
      priceBRL: pricePackage,
      estimatedDays: daysPackage,
      customsNote: 'Melhor custo-benefício para envio de camisas. Rastreio detalhado.',
      logoBadge: 'Jadlog .Package (Econômico)',
    },
    {
      id: 'jadlog-com',
      carrier: 'Jadlog',
      serviceName: 'Jadlog .Com (Expresso)',
      serviceCode: 'JAD_COM',
      priceBRL: priceCom,
      estimatedDays: daysCom,
      customsNote: 'Entrega prioritária rápida com prazo reduzido.',
      logoBadge: 'Jadlog .Com (Mais Rápido)',
    },
  ];
}
