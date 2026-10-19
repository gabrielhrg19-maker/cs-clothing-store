'use client';

import React from 'react';
import Image from 'next/image';
import { ShoppingBag, ShieldCheck, Sun, Moon } from 'lucide-react';
import { SiteSettings } from '../types/store';

interface HeaderProps {
  siteSettings: SiteSettings;
  cartCount: number;
  totalWeightGrams: number;
  isAdminLoggedIn: boolean;
  theme: 'light' | 'dark';
  onToggleTheme?: () => void;
  onSelectTheme?: (theme: 'light' | 'dark') => void;
  onOpenCart: () => void;
  onOpenAdmin: () => void;
  onOpenLogisticsInfo?: () => void;
  onSelectGenderFilter: (gender: 'Todos' | 'Masculino' | 'Feminino' | 'Unissex') => void;
  currentGenderFilter: 'Todos' | 'Masculino' | 'Feminino' | 'Unissex';
}

export const Header: React.FC<HeaderProps> = ({
  siteSettings,
  cartCount,
  totalWeightGrams,
  isAdminLoggedIn,
  theme,
  onToggleTheme,
  onSelectTheme,
  onOpenCart,
  onOpenAdmin,
  onSelectGenderFilter,
  currentGenderFilter,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#090a0f]/95 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800 transition-colors duration-200">
      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-2">
        {/* Logo CS CLOTHING STORE */}
        <div className="flex items-center gap-4 lg:gap-8 min-w-0">
          <a href="#" className="flex items-center gap-2.5 sm:gap-3 group shrink-0">
            <div className="relative w-10 h-10 sm:w-12 sm:h-12 bg-black rounded-xl overflow-hidden border border-neutral-800 shadow-md group-hover:scale-105 transition-transform shrink-0">
              <Image
                src="/cs-clothing-logo.png"
                alt="CS Clothing Store"
                fill
                className="object-contain p-1"
                priority
              />
            </div>
            <div className="min-w-0">
              <span className="text-sm sm:text-lg md:text-xl font-black tracking-wider text-neutral-950 dark:text-white uppercase font-mono block truncate">
                {siteSettings.storeName}
              </span>
              <span className="block text-[8px] sm:text-[10px] tracking-[0.2em] text-neutral-500 dark:text-neutral-400 uppercase -mt-0.5 truncate">
                Streetwear & Roupas Unisex
              </span>
            </div>
          </a>

          {/* Links de Categoria Rápida (Desktop) */}
          <nav className="hidden lg:flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
            <button
              onClick={() => onSelectGenderFilter('Unissex')}
              className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 font-bold ${
                currentGenderFilter === 'Unissex'
                  ? 'bg-purple-900 text-white shadow-sm ring-1 ring-purple-400/50'
                  : 'text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/40 bg-purple-50/60 dark:bg-purple-950/20'
              }`}
            >
              ✨ Unisex
            </button>
            <button
              onClick={() => onSelectGenderFilter('Masculino')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                currentGenderFilter === 'Masculino'
                  ? 'bg-blue-900 text-white shadow-sm'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-blue-900 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40'
              }`}
            >
              👔 Masculinas
            </button>
            <button
              onClick={() => onSelectGenderFilter('Feminino')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                currentGenderFilter === 'Feminino'
                  ? 'bg-rose-900 text-white shadow-sm'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-rose-900 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40'
              }`}
            >
              👗 Femininas
            </button>
            <button
              onClick={() => onSelectGenderFilter('Todos')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                currentGenderFilter === 'Todos'
                  ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 shadow-sm'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900'
              }`}
            >
              Todas as Peças
            </button>
          </nav>
        </div>

        {/* Right Actions: Dark Mode Toggle, Admin, Bag */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Seletor Claro / Escuro com feedback visual imediato */}
          <div className="flex items-center bg-neutral-100 dark:bg-neutral-900 p-0.5 sm:p-1 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-2xs">
            <button
              type="button"
              onClick={() => {
                if (onSelectTheme) onSelectTheme('light');
                else if (onToggleTheme && theme !== 'light') onToggleTheme();
              }}
              className={`p-1.5 sm:px-2.5 sm:py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                theme === 'light'
                  ? 'bg-white text-neutral-950 shadow-md font-black border border-neutral-200'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-300'
              }`}
              title="Ativar Modo Claro (Visual Branco e Elegante)"
              aria-label="Ativar Modo Claro"
            >
              <Sun className={`w-3.5 h-3.5 shrink-0 ${theme === 'light' ? 'text-amber-500 fill-amber-400' : 'text-neutral-400'}`} />
              <span className="hidden sm:inline">Claro</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (onSelectTheme) onSelectTheme('dark');
                else if (onToggleTheme && theme !== 'dark') onToggleTheme();
              }}
              className={`p-1.5 sm:px-2.5 sm:py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                theme === 'dark'
                  ? 'bg-[#181926] text-white shadow-md font-black border border-neutral-700/80'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-300'
              }`}
              title="Ativar Modo Escuro (Visual Dark Moderno)"
              aria-label="Ativar Modo Escuro"
            >
              <Moon className={`w-3.5 h-3.5 shrink-0 ${theme === 'dark' ? 'text-indigo-400 fill-indigo-400' : 'text-neutral-400'}`} />
              <span className="hidden sm:inline">Escuro</span>
            </button>
          </div>

          {/* Painel ADM Ativo (se logado) */}
          {isAdminLoggedIn && (
            <button
              onClick={onOpenAdmin}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs"
              title="Abrir Painel Administrativo"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="hidden sm:inline">Painel ADM</span>
              <span className="sm:hidden text-[10px]">ADM</span>
            </button>
          )}

          {/* Botão de Sacola */}
          <button
            onClick={onOpenCart}
            className="relative flex items-center gap-2 bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-all cursor-pointer shadow-md shrink-0"
            aria-label="Abrir sacola de compras"
          >
            <ShoppingBag className="w-4 h-4 shrink-0" />
            <span className="text-xs font-bold uppercase tracking-wider hidden sm:inline">Sacola</span>
            <span className="bg-white dark:bg-neutral-950 text-neutral-950 dark:text-white text-[11px] sm:text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {cartCount}
            </span>
            {cartCount > 0 && totalWeightGrams > 0 && (
              <span className="text-[10px] text-neutral-400 dark:text-neutral-500 hidden md:inline border-l border-neutral-700 dark:border-neutral-300 pl-2">
                {(totalWeightGrams / 1000).toFixed(2)}kg
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Sub-barra de Categorias para Mobile (Fácil navegação com o polegar) */}
      <div className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 overflow-x-auto border-t border-neutral-200/70 dark:border-neutral-800/70 bg-neutral-50/90 dark:bg-neutral-900/90 text-[11px] font-bold no-scrollbar">
        <button
          onClick={() => onSelectGenderFilter('Unissex')}
          className={`px-3 py-1 rounded-lg shrink-0 transition-all cursor-pointer flex items-center gap-1 font-bold ${
            currentGenderFilter === 'Unissex'
              ? 'bg-purple-900 text-white shadow-xs'
              : 'text-purple-700 dark:text-purple-300 bg-purple-100/60 dark:bg-purple-950/40'
          }`}
        >
          ✨ Unisex
        </button>
        <button
          onClick={() => onSelectGenderFilter('Masculino')}
          className={`px-3 py-1 rounded-lg shrink-0 transition-all cursor-pointer ${
            currentGenderFilter === 'Masculino'
              ? 'bg-blue-900 text-white'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-blue-50 dark:hover:bg-blue-950/40'
          }`}
        >
          👔 Masculinas
        </button>
        <button
          onClick={() => onSelectGenderFilter('Feminino')}
          className={`px-3 py-1 rounded-lg shrink-0 transition-all cursor-pointer ${
            currentGenderFilter === 'Feminino'
              ? 'bg-rose-900 text-white'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-rose-50 dark:hover:bg-rose-950/40'
          }`}
        >
          👗 Femininas
        </button>
        <button
          onClick={() => onSelectGenderFilter('Todos')}
          className={`px-3 py-1 rounded-lg shrink-0 transition-all cursor-pointer ${
            currentGenderFilter === 'Todos'
              ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/60 dark:hover:bg-neutral-800'
          }`}
        >
          Todas as Peças
        </button>
      </div>
    </header>
  );
};
