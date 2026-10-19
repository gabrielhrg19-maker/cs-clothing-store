'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Product, ProductVariant, ShippingRate } from '../types/store';
import { X, Check, Package, Ruler, Truck, ShieldCheck, MapPin } from 'lucide-react';
import { calculatePackageMetrics, calculateJadlogRates } from '../lib/shipping';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, variant: ProductVariant, quantity: number) => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  onClose,
  onAddToCart,
}) => {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    product ? product.variants[0] : null
  );
  const [quantity, setQuantity] = useState(1);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [addedAnimation, setAddedAnimation] = useState(false);
  const [cepInput, setCepInput] = useState('');
  const [shippingRates, setShippingRates] = useState<ShippingRate[] | null>(null);

  if (!product) return null;

  const currentVariant = selectedVariant || product.variants[0];

  const handleAdd = () => {
    if (!currentVariant) return;
    onAddToCart(product, currentVariant, quantity);
    setAddedAnimation(true);
    setTimeout(() => {
      setAddedAnimation(false);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white dark:bg-[#111218] rounded-3xl shadow-2xl overflow-hidden my-4 sm:my-8 border border-neutral-200 dark:border-neutral-800">
        {/* Fechar */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 transition-colors shadow-sm cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Fotos do Produto */}
          <div className="bg-neutral-100 dark:bg-neutral-900 relative min-h-[300px] sm:min-h-[380px] md:min-h-[520px]">
            <Image
              src={product.images?.[0] || '/cs-clothing-logo.png'}
              alt={product.name}
              fill
              unoptimized={product.images?.[0]?.startsWith('data:')}
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
            <div className="absolute bottom-4 left-4 right-4 flex gap-2">
              <div className="bg-neutral-950/85 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-xl flex items-center gap-2">
                <Truck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Envio Nacional Jadlog</span>
                <span>•</span>
                <span>Embalagem: {product.weightGrams}g</span>
              </div>
            </div>
          </div>

          {/* Detalhes e Ações */}
          <div className="p-5 sm:p-8 flex flex-col justify-between max-h-[85vh] overflow-y-auto">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                  product.gender === 'Masculino'
                    ? 'bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300'
                    : product.gender === 'Feminino'
                    ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300'
                    : 'bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300'
                }`}>
                  {product.gender === 'Unissex' ? '✨ Roupa Unissex' : `Camisa ${product.gender}`}
                </span>
                <span className="text-neutral-300 dark:text-neutral-700">•</span>
                <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                  {product.category}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-neutral-950 dark:text-white tracking-tight">
                {product.name}
              </h2>
              <div className="text-xl sm:text-2xl font-black text-neutral-950 dark:text-white font-mono mt-1">
                R$ {product.priceBRL.toFixed(2).replace('.', ',')}
              </div>

              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-3 leading-relaxed">
                {product.description}
              </p>

              {/* Informações de Composição e Tecido */}
              <div className="mt-4 p-3.5 bg-neutral-50 dark:bg-[#161722] rounded-xl border border-neutral-200 dark:border-neutral-800/80 space-y-2 text-xs">
                <div className="flex items-center justify-between text-neutral-700 dark:text-neutral-300">
                  <span className="font-semibold">Tecido / Material:</span>
                  <span className="font-medium text-neutral-900 dark:text-white">{product.material}</span>
                </div>
                <div className="flex items-center justify-between text-neutral-700 dark:text-neutral-300">
                  <span className="font-semibold">Composição Têxtil:</span>
                  <span className="text-neutral-800 dark:text-neutral-200">{product.composition}</span>
                </div>
                <div className="flex items-center justify-between text-neutral-700 dark:text-neutral-300">
                  <span className="font-semibold">Transportadora Homologada:</span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1">
                    <Truck className="w-3 h-3" /> Jadlog (.Package e .Com)
                  </span>
                </div>
              </div>

              {/* Grade de Tamanhos */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                    Selecione o Tamanho & Cor
                  </label>
                  <button
                    onClick={() => setShowSizeGuide(!showSizeGuide)}
                    className="text-xs text-neutral-900 dark:text-neutral-300 hover:text-neutral-700 dark:hover:text-white underline font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Ruler className="w-3.5 h-3.5" />
                    {showSizeGuide ? 'Ocultar Medidas' : 'Guia de Medidas'}
                  </button>
                </div>

                {/* Tabela de Medidas */}
                {showSizeGuide && (
                  <div className="p-3 bg-neutral-100 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 mb-3 text-xs animate-in fade-in">
                    <div className="font-bold text-neutral-800 dark:text-neutral-200 mb-1">
                      Medidas Corporais ({product.gender === 'Masculino' ? 'Modelagem Masculina' : product.gender === 'Feminino' ? 'Modelagem Feminina' : 'Modelagem Unissex (Caimento Regular)'}):
                    </div>
                    <table className="w-full text-center border-collapse">
                      <thead>
                        <tr className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 text-[11px]">
                          <th className="py-1">Tam</th>
                          <th>Tórax/Busto</th>
                          <th>Comprimento</th>
                          <th>Manga</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800 text-neutral-700 dark:text-neutral-300">
                        {product.gender === 'Masculino' ? (
                          <>
                            <tr><td className="py-1 font-bold">P</td><td>102 cm</td><td>72 cm</td><td>64 cm</td></tr>
                            <tr><td className="py-1 font-bold">M</td><td>108 cm</td><td>74 cm</td><td>65 cm</td></tr>
                            <tr><td className="py-1 font-bold">G</td><td>114 cm</td><td>76 cm</td><td>66 cm</td></tr>
                            <tr><td className="py-1 font-bold">GG</td><td>120 cm</td><td>78 cm</td><td>67 cm</td></tr>
                          </>
                        ) : product.gender === 'Feminino' ? (
                          <>
                            <tr><td className="py-1 font-bold">PP</td><td>92 cm</td><td>66 cm</td><td>59 cm</td></tr>
                            <tr><td className="py-1 font-bold">P</td><td>98 cm</td><td>68 cm</td><td>60 cm</td></tr>
                            <tr><td className="py-1 font-bold">M</td><td>104 cm</td><td>70 cm</td><td>61 cm</td></tr>
                            <tr><td className="py-1 font-bold">G</td><td>110 cm</td><td>72 cm</td><td>62 cm</td></tr>
                          </>
                        ) : (
                          <>
                            <tr><td className="py-1 font-bold">P</td><td>104 cm</td><td>70 cm</td><td>62 cm</td></tr>
                            <tr><td className="py-1 font-bold">M</td><td>110 cm</td><td>73 cm</td><td>64 cm</td></tr>
                            <tr><td className="py-1 font-bold">G</td><td>116 cm</td><td>75 cm</td><td>65 cm</td></tr>
                            <tr><td className="py-1 font-bold">GG</td><td>122 cm</td><td>77 cm</td><td>66 cm</td></tr>
                          </>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Seletores de variantes */}
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v) => {
                    const isSelected = currentVariant?.id === v.id;
                    return (
                      <button
                        key={v.id}
                        onClick={() => setSelectedVariant(v)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 border-neutral-950 dark:border-white shadow-md'
                            : 'bg-white dark:bg-[#181924] text-neutral-800 dark:text-neutral-200 border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-600'
                        }`}
                      >
                        <span className="font-bold text-sm">{v.size}</span>
                        <span className="text-[11px] opacity-75">({v.color})</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quantidade */}
              <div className="mt-5 flex items-center gap-4">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                  Quantidade:
                </span>
                <div className="flex items-center border border-neutral-300 dark:border-neutral-700 rounded-lg overflow-hidden bg-neutral-50 dark:bg-neutral-900">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-1 text-sm font-bold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800 cursor-pointer"
                  >
                    -
                  </button>
                  <span className="px-3 py-1 text-sm font-bold text-neutral-900 dark:text-white bg-white dark:bg-[#161722]">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-1 text-sm font-bold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800 cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Cálculo de Frete Jadlog na Peça */}
            <div className="mt-5 pt-4 border-t border-neutral-200 dark:border-neutral-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  Calcular Frete Jadlog:
                </span>
                <span className="text-[10px] text-neutral-500 dark:text-neutral-400 font-mono">
                  Envio para todo o Brasil
                </span>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={cepInput}
                  onChange={(e) => setCepInput(e.target.value)}
                  placeholder="Digite seu CEP (Ex: 01310-100)"
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#161722] text-neutral-900 dark:text-white focus:bg-white dark:focus:bg-[#1b1d2a] font-mono"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (currentVariant) {
                      const singleItem = [{ product, variant: currentVariant, quantity }];
                      const metrics = calculatePackageMetrics(singleItem);
                      const rates = calculateJadlogRates(cepInput || '01310-100', metrics, product.priceBRL * quantity);
                      setShippingRates(rates);
                    }
                  }}
                  className="px-4 py-2 bg-neutral-900 dark:bg-neutral-800 hover:bg-neutral-800 dark:hover:bg-neutral-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
                >
                  Calcular
                </button>
              </div>

              {shippingRates && shippingRates.length > 0 && (
                <div className="space-y-1.5 pt-1 animate-in fade-in">
                  {shippingRates.map((r) => (
                    <div key={r.id} className="p-2 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg border border-emerald-200 dark:border-emerald-800/80 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-emerald-950 dark:text-emerald-200">{r.serviceName}</span>
                        <span className="text-[11px] text-emerald-800 dark:text-emerald-400 block">Prazo: {r.estimatedDays}</span>
                      </div>
                      <span className="font-bold font-mono text-emerald-900 dark:text-emerald-300">
                        R$ {r.priceBRL.toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Ações Inferiores */}
            <div className="mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-800 space-y-3">
              <button
                onClick={handleAdd}
                disabled={addedAnimation}
                className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm tracking-wide transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  addedAnimation
                    ? 'bg-emerald-600 text-white'
                    : 'bg-neutral-950 dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-200 text-white dark:text-neutral-950 shadow-lg'
                }`}
              >
                {addedAnimation ? (
                  <>
                    <Check className="w-4 h-4" />
                    Camisa Adicionada à Sacola!
                  </>
                ) : (
                  <>
                    <span>Adicionar à Sacola</span>
                    <span>•</span>
                    <span>R$ {(product.priceBRL * quantity).toFixed(2).replace('.', ',')}</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-neutral-500 dark:text-neutral-400">
                <Truck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Despacho em até 24h úteis via Jadlog com rastreio garantido</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
