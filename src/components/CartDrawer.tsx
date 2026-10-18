'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  CartItem,
  ShippingRate,
} from '../types/store';
import {
  calculatePackageMetrics,
  calculateJadlogRates,
} from '../lib/shipping';
import {
  X,
  Trash2,
  Truck,
  PackageCheck,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (index: number, quantity: number) => void;
  onRemoveItem: (index: number) => void;
  onClearCart?: () => void;
  onProceedToCheckout: (rate: ShippingRate, postalCode: string) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onProceedToCheckout,
}) => {
  const [cep, setCep] = useState('01310-100'); // Padrão SP para teste rápido
  const [selectedRate, setSelectedRate] = useState<ShippingRate | null>(null);

  if (!isOpen) return null;

  const metrics = calculatePackageMetrics(items);

  const subtotalBRL = items.reduce(
    (acc, it) => acc + it.product.priceBRL * it.quantity,
    0
  );

  const jadlogRates = items.length > 0
    ? calculateJadlogRates(cep, metrics, subtotalBRL)
    : [];

  const activeRate = selectedRate || (jadlogRates.length > 0 ? jadlogRates[0] : null);

  const calculateTotal = () => {
    const shippingPrice = activeRate ? activeRate.priceBRL : 0;
    return subtotalBRL + shippingPrice;
  };

  const handleCheckoutClick = () => {
    if (!activeRate) return;
    onProceedToCheckout(activeRate, cep);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-white dark:bg-[#0e0f16] h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        {/* Header da Sacola */}
        <div className="p-4 sm:p-5 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-50 dark:bg-[#13141f]">
          <div className="flex items-center gap-2">
            <h2 className="text-sm sm:text-base font-black text-neutral-950 dark:text-white uppercase font-mono tracking-wider">
              Sacola de Compras
            </h2>
            <span className="text-[11px] sm:text-xs bg-neutral-200 dark:bg-white text-neutral-800 dark:text-neutral-950 font-bold px-2 py-0.5 rounded-full border border-neutral-300 dark:border-transparent">
              {items.reduce((acc, it) => acc + it.quantity, 0)} camisas
            </span>
          </div>
          <div className="flex items-center gap-2">
            {items.length > 0 && onClearCart && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onClearCart();
                }}
                className="text-[11px] bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-300 border border-rose-200 dark:border-rose-800 px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                title="Esvaziar todas as camisas da sacola"
              >
                <Trash2 className="w-3 h-3 text-rose-500" />
                <span>Esvaziar</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-500 dark:text-neutral-400 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Corpo do Carrinho */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 sm:space-y-6">
          {items.length === 0 ? (
            <div className="text-center py-16 text-neutral-400 dark:text-neutral-500 space-y-3">
              <PackageCheck className="w-12 h-12 mx-auto stroke-1" />
              <p className="text-sm font-bold text-neutral-700 dark:text-neutral-300">Sua sacola está vazia.</p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Adicione camisas masculinas ou femininas à sua sacola para calcular o frete.</p>
            </div>
          ) : (
            <>
              {/* Lista de Camisas */}
              <div className="space-y-3">
                {items.map((item, idx) => (
                  <div
                    key={`${item.product.id}-${item.variant.id}-${idx}`}
                    className="flex gap-3 sm:gap-4 p-3 bg-neutral-50 dark:bg-[#141520] rounded-2xl border border-neutral-200 dark:border-neutral-800"
                  >
                    <div className="relative w-16 h-20 sm:w-20 sm:h-24 rounded-xl overflow-hidden bg-neutral-200 dark:bg-neutral-800 shrink-0 border border-neutral-200 dark:border-neutral-800">
                      <Image
                        src={item.product.images[0]}
                        alt={item.product.name}
                        fill
                        unoptimized={item.product.images[0]?.startsWith('data:')}
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="font-bold text-xs text-neutral-950 dark:text-white line-clamp-1">
                            {item.product.name}
                          </h4>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              onRemoveItem(idx);
                            }}
                            className="text-neutral-400 hover:text-rose-600 px-1.5 py-0.5 rounded hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-bold shrink-0"
                            title="Remover esta camisa da sacola"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                            <span className="text-rose-600 dark:text-rose-400">Remover</span>
                          </button>
                        </div>
                        <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                          Tamanho: <span className="font-bold text-neutral-900 dark:text-neutral-200">{item.variant.size}</span> • Cor: {item.variant.color}
                        </div>
                        <div className="text-[10px] text-neutral-400 dark:text-neutral-500 font-mono mt-0.5">
                          {item.product.weightGrams}g por peça
                        </div>
                      </div>

                      <div className="flex justify-between items-center mt-2">
                        <div className="flex items-center border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-xs">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              onUpdateQuantity(idx, item.quantity - 1);
                            }}
                            className="px-2.5 py-1 font-bold hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 cursor-pointer"
                            title={item.quantity === 1 ? "Remover camisa da sacola" : "Diminuir quantidade"}
                          >
                            {item.quantity === 1 ? <Trash2 className="w-3 h-3 text-rose-500 inline" /> : '-'}
                          </button>
                          <span className="px-2.5 py-0.5 font-bold text-neutral-900 dark:text-white">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              onUpdateQuantity(idx, item.quantity + 1);
                            }}
                            className="px-2.5 py-1 font-bold hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 cursor-pointer"
                          >
                            +
                          </button>
                        </div>

                        <div className="text-sm font-black font-mono text-neutral-950 dark:text-white">
                          R$ {(item.product.priceBRL * item.quantity).toFixed(2).replace('.', ',')}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Caixa de Cubagem Jadlog */}
              <div className="p-3.5 bg-neutral-50 dark:bg-[#13141f] border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white rounded-2xl text-xs space-y-2">
                <div className="flex items-center justify-between font-bold text-neutral-800 dark:text-neutral-200">
                  <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                    <Truck className="w-4 h-4" />
                    Cubagem Oficial Jadlog
                  </span>
                  <span className="text-neutral-500 dark:text-neutral-400 font-mono text-[11px]">
                    {metrics.maxDimensions.lengthCm}x{metrics.maxDimensions.widthCm}x{metrics.maxDimensions.heightCm} cm
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center pt-1 border-t border-neutral-200 dark:border-neutral-800">
                  <div className="bg-white dark:bg-[#191a27] border border-neutral-200 dark:border-neutral-800/60 p-2 rounded-xl shadow-2xs">
                    <div className="text-[10px] text-neutral-500 dark:text-neutral-400">Peso Real</div>
                    <div className="font-bold text-neutral-900 dark:text-neutral-100 font-mono">{metrics.totalWeightKg} kg</div>
                  </div>
                  <div className="bg-white dark:bg-[#191a27] border border-neutral-200 dark:border-neutral-800/60 p-2 rounded-xl shadow-2xs">
                    <div className="text-[10px] text-neutral-500 dark:text-neutral-400">Peso Cubado</div>
                    <div className="font-bold text-neutral-900 dark:text-neutral-100 font-mono">{metrics.volumetricWeightKg} kg</div>
                  </div>
                  <div className="bg-emerald-50 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-500/40 p-2 rounded-xl shadow-2xs">
                    <div className="text-[10px] text-emerald-800 dark:text-emerald-400 font-semibold">Peso Faturado</div>
                    <div className="font-bold text-emerald-700 dark:text-emerald-300 font-mono">{metrics.billableWeightKg} kg</div>
                  </div>
                </div>
              </div>

              {/* Simulador de Frete Jadlog */}
              <div className="p-4 bg-neutral-50 dark:bg-[#141520] rounded-2xl border border-neutral-200 dark:border-neutral-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    Cálculo de Frete Jadlog
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full">
                    Nacional
                  </span>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 block mb-1">
                    Digite seu CEP de Destino:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={cep}
                      onChange={(e) => setCep(e.target.value)}
                      placeholder="Ex: 01310-100"
                      className="flex-1 px-3 py-2 text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 focus:outline-neutral-900 font-mono bg-white dark:bg-[#1a1b28] text-neutral-900 dark:text-white"
                    />
                    <button className="px-3.5 py-2 bg-neutral-900 dark:bg-neutral-800 hover:bg-neutral-800 dark:hover:bg-neutral-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer">
                      Calcular
                    </button>
                  </div>
                </div>

                {/* Opções Jadlog */}
                <div className="space-y-2 pt-1">
                  {jadlogRates.map((rate) => {
                    const isSelected = activeRate?.id === rate.id;
                    return (
                      <div
                        key={rate.id}
                        onClick={() => setSelectedRate(rate)}
                        className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-emerald-50/80 dark:bg-white text-emerald-950 dark:text-neutral-950 border-2 border-emerald-600 dark:border-white shadow-md'
                            : 'bg-white dark:bg-[#181924] text-neutral-800 dark:text-neutral-200 border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-bold flex items-center gap-1.5">
                              {rate.serviceName}
                              <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                                isSelected ? 'bg-emerald-200 dark:bg-emerald-100 text-emerald-900 dark:text-emerald-950' : 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300'
                              }`}>
                                Jadlog Oficial
                              </span>
                            </div>
                            <div className={`text-[11px] mt-0.5 ${isSelected ? 'text-emerald-800 dark:text-neutral-600' : 'text-neutral-500 dark:text-neutral-400'}`}>
                              Prazo de entrega: <span className="font-bold">{rate.estimatedDays}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-black font-mono text-sm text-emerald-700 dark:text-emerald-600">
                              R$ {rate.priceBRL.toFixed(2).replace('.', ',')}
                            </div>
                          </div>
                        </div>
                        <p className={`text-[10px] mt-1.5 line-clamp-1 ${isSelected ? 'text-emerald-800/80 dark:text-neutral-600' : 'text-neutral-500 dark:text-neutral-400'}`}>
                          {rate.customsNote}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Rodapé da Sacola */}
        {items.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#13141f] space-y-3">
            <div className="space-y-1.5 text-xs text-neutral-600 dark:text-neutral-400">
              <div className="flex justify-between">
                <span>Subtotal das Camisas:</span>
                <span className="font-semibold font-mono text-neutral-900 dark:text-white">
                  R$ {subtotalBRL.toFixed(2).replace('.', ',')}
                </span>
              </div>
              <div className="flex justify-between">
                <span>
                  Frete ({activeRate ? activeRate.serviceName : 'Jadlog'}):
                </span>
                <span className="font-semibold font-mono text-neutral-900 dark:text-white">
                  {activeRate ? `R$ ${activeRate.priceBRL.toFixed(2).replace('.', ',')}` : '—'}
                </span>
              </div>
              <div className="flex justify-between text-base font-black text-neutral-950 dark:text-white pt-2 border-t border-neutral-200 dark:border-neutral-800">
                <span>Total do Pedido:</span>
                <span className="font-mono">R$ {calculateTotal().toFixed(2).replace('.', ',')}</span>
              </div>
            </div>

            <button
              onClick={handleCheckoutClick}
              disabled={!activeRate}
              className="w-full py-3.5 px-6 bg-neutral-950 dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-200 disabled:opacity-50 text-white dark:text-neutral-950 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Avançar para o Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {onClearCart && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onClearCart();
                }}
                className="w-full py-2 text-center text-[11px] text-neutral-400 hover:text-rose-600 font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5 pt-1"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                <span>Esvaziar e limpar toda a sacola</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
