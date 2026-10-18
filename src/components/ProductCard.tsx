'use client';

import React from 'react';
import Image from 'next/image';
import { Product } from '../types/store';
import { Package, ArrowRight, Sparkles } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onSelectProduct: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelectProduct,
}) => {
  return (
    <div
      onClick={() => onSelectProduct(product)}
      className="group bg-white dark:bg-[#111219] rounded-2xl border border-neutral-200 dark:border-neutral-800/80 overflow-hidden hover:shadow-xl dark:hover:shadow-neutral-950/80 hover:border-neutral-400 dark:hover:border-neutral-700 transition-all duration-300 flex flex-col cursor-pointer"
    >
      {/* Imagem da Camisa */}
      <div className="relative aspect-4/5 bg-neutral-100 dark:bg-neutral-900 overflow-hidden">
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          unoptimized={product.images[0]?.startsWith('data:')}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Badges de Destaque */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
          <span
            className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm backdrop-blur-md ${
              product.gender === 'Masculino'
                ? 'bg-blue-100/95 dark:bg-blue-950/90 text-blue-900 dark:text-blue-200 border border-blue-300 dark:border-blue-800'
                : 'bg-rose-100/95 dark:bg-rose-950/90 text-rose-900 dark:text-rose-200 border border-rose-300 dark:border-rose-800'
            }`}
          >
            {product.gender}
          </span>
          {product.tag && (
            <span className="bg-white/90 dark:bg-neutral-950/85 backdrop-blur-md text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-800 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1 shadow-xs">
              <Sparkles className="w-2.5 h-2.5 text-amber-500 dark:text-amber-400" />
              {product.tag}
            </span>
          )}
        </div>

        {/* Peso para a Jadlog */}
        <div className="absolute bottom-3 right-3">
          <span className="bg-white/90 dark:bg-neutral-900/85 backdrop-blur-md text-neutral-800 dark:text-white border border-neutral-200/80 dark:border-transparent text-[10px] font-mono px-2 py-1 rounded-md flex items-center gap-1 shadow-sm">
            <Package className="w-3 h-3 text-neutral-500 dark:text-neutral-400" />
            {product.weightGrams}g
          </span>
        </div>
      </div>

      {/* Conteúdo do Card */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between bg-white dark:bg-[#111219]">
        <div>
          <div className="text-[11px] text-neutral-400 dark:text-neutral-500 font-semibold uppercase tracking-wider mb-1">
            {product.category} • {product.material}
          </div>
          <h3 className="font-bold text-neutral-950 dark:text-white text-base group-hover:text-neutral-700 dark:group-hover:text-neutral-300 transition-colors line-clamp-1">
            {product.name}
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2 mt-1">
            {product.subtitle}
          </p>
        </div>

        <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between">
          <div>
            <div className="text-[10px] text-neutral-400 dark:text-neutral-500 uppercase font-bold">Valor à Vista</div>
            <div className="text-lg font-black text-neutral-950 dark:text-white font-mono">
              R$ {product.priceBRL.toFixed(2).replace('.', ',')}
            </div>
          </div>

          <div className="flex items-center gap-1 text-xs font-bold text-neutral-900 dark:text-neutral-200 group-hover:translate-x-1 transition-transform">
            <span>Ver Detalhes</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </div>
  );
};
