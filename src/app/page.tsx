'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Header } from '../components/Header';
import { ProductCard } from '../components/ProductCard';
import { ProductModal } from '../components/ProductModal';
import { CartDrawer } from '../components/CartDrawer';
import { CheckoutModal } from '../components/CheckoutModal';
import { AdminLoginModal } from '../components/AdminLoginModal';
import { AdminCMSModal } from '../components/AdminCMSModal';
import { CategoryManagerModal } from '../components/CategoryManagerModal';
import { FloatingSocialButtons } from '../components/FloatingSocialButtons';
import { INITIAL_PRODUCTS, DEFAULT_SITE_SETTINGS } from '../data/products';
import { safeSetLocalStorage, safeGetStoredData } from '../lib/storage';
import {
  Product,
  ProductVariant,
  CartItem,
  ShippingRate,
  Order,
  SiteSettings,
} from '../types/store';
import {
  Truck,
  ShieldCheck,
  Package,
  Sparkles,
  ArrowRight,
  Lock,
  Edit,
  Edit2,
  Phone,
  Share2,
} from 'lucide-react';
import { AdvantageIcon, getColorClasses } from '../components/AdvantageIcon';

export default function HomePage() {
  // Estado de Produtos e Configurações com Persistência
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  // Tema (Dark / Light) com persistência - padrão 'light' (modo claro límpido e elegante)
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Filtros
  const [genderFilter, setGenderFilter] = useState<'Todos' | 'Masculino' | 'Feminino'>('Todos');
  const [categoryFilter, setCategoryFilter] = useState<string>('Todas');

  // Sacola e Modais
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isAdminCMSOpen, setIsAdminCMSOpen] = useState(false);
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);

  // Estado do Checkout
  const [checkoutRate, setCheckoutRate] = useState<ShippingRate | null>(null);
  const [checkoutZip, setCheckoutZip] = useState<string>('01310-100');


  // Carregar dados salvos com tolerância a falhas (IndexedDB, LocalStorage e Servidor)
  useEffect(() => {
    // 1. Tema (Dark / Light)
    try {
      const savedTheme = localStorage.getItem('cs_clothing_theme') as 'light' | 'dark' | null;
      if (savedTheme === 'dark') {
        setTheme('dark');
        document.documentElement.classList.add('dark');
        document.body.classList.add('dark');
      } else {
        setTheme('light');
        document.documentElement.classList.remove('dark');
        document.body.classList.remove('dark');
      }
    } catch (e) {}

    // 2. Autenticação ADM
    try {
      const savedAuth = localStorage.getItem('cs_clothing_admin_auth');
      if (savedAuth === 'true') setIsAdminLoggedIn(true);
    } catch (e) {}

    // 3. Sacola limpa
    try {
      const savedCart = localStorage.getItem('cs_clothing_cart');
      const hasCleanedDemo = localStorage.getItem('cs_clothing_cart_demo_cleared_v4');

      if (!hasCleanedDemo) {
        localStorage.removeItem('cs_clothing_cart');
        localStorage.setItem('cs_clothing_cart_demo_cleared_v4', 'true');
        setCartItems([]);
      } else if (savedCart) {
        try {
          const parsed = JSON.parse(savedCart);
          if (Array.isArray(parsed)) {
            setCartItems(parsed);
          }
        } catch (e) {
          console.error(e);
        }
      }
    } catch (e) {
      console.error('Erro ao ler sacola', e);
    }

    // 4. Carregamento ultra-seguro e sincronização bidirecional
    (async () => {
      // 4.1 Carregamento imediato do cache local (0ms de espera)
      const cachedProds = await safeGetStoredData<Product[]>('cs_clothing_products');
      if (cachedProds && Array.isArray(cachedProds) && cachedProds.length > 0) {
        setProducts(cachedProds);
      }

      const cachedSettings = await safeGetStoredData<SiteSettings>('cs_clothing_settings');
      if (cachedSettings && cachedSettings.storeName) {
        setSiteSettings(cachedSettings);
      }

      const cachedOrders = await safeGetStoredData<Order[]>('cs_clothing_orders');
      if (cachedOrders && Array.isArray(cachedOrders) && cachedOrders.length > 0) {
        setOrders(cachedOrders);
      }

      // 4.2 Busca dados no servidor com proteção contra sobrescrita indevida
      try {
        const res = await fetch('/api/store/data');
        if (res.ok) {
          const data = await res.json();

          // Sincronização inteligente de Produtos:
          if (Array.isArray(data.products) && data.products.length > 0) {
            setProducts(data.products);
            safeSetLocalStorage('cs_clothing_products', data.products);
          } else if (cachedProds && Array.isArray(cachedProds) && cachedProds.length > 0) {
            // Se o servidor estiver vazio, NUNCA apaga os dados locais: sobe o cache do usuário para o servidor
            console.log('Restaurando produtos locais para o servidor...');
            fetch('/api/store/data', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ products: cachedProds }),
            }).catch(() => {});
          }

          // Sincronização inteligente de Configurações:
          if (data.siteSettings && data.siteSettings.storeName) {
            setSiteSettings(data.siteSettings);
            safeSetLocalStorage('cs_clothing_settings', data.siteSettings);
          } else if (cachedSettings) {
            fetch('/api/store/data', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ siteSettings: cachedSettings }),
            }).catch(() => {});
          }

          // Sincronização inteligente de Pedidos:
          if (Array.isArray(data.orders) && data.orders.length > 0) {
            setOrders(data.orders);
            safeSetLocalStorage('cs_clothing_orders', data.orders);
          } else if (cachedOrders && cachedOrders.length > 0) {
            fetch('/api/store/data', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ orders: cachedOrders }),
            }).catch(() => {});
          }
        }
      } catch (err) {
        console.warn('Servidor offline ou iniciando, dados locais mantidos com segurança:', err);
      }
    })();
  }, []);

  // Salvar alterações de produtos permanentemente no servidor e cache local redundante
  const handleSaveProducts = async (newProducts: Product[]) => {
    setProducts(newProducts);
    safeSetLocalStorage('cs_clothing_products', newProducts);
    try {
      const res = await fetch('/api/store/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products: newProducts }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.products && Array.isArray(data.products)) {
          // Servidor descarregou imagens base64 em URLs limpas (/uploads/...)
          setProducts(data.products);
          safeSetLocalStorage('cs_clothing_products', data.products);
        }
      }
    } catch (e) {
      console.error('Erro ao salvar produtos no servidor:', e);
    }
  };

  // Salvar alterações de configurações permanentemente no servidor e cache local redundante
  const handleSaveSettings = async (newSettings: SiteSettings) => {
    setSiteSettings(newSettings);
    safeSetLocalStorage('cs_clothing_settings', newSettings);
    try {
      const res = await fetch('/api/store/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siteSettings: newSettings }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.siteSettings) {
          setSiteSettings(data.siteSettings);
          safeSetLocalStorage('cs_clothing_settings', data.siteSettings);
        }
      }
    } catch (e) {
      console.error('Erro ao salvar configurações no servidor:', e);
    }
  };

  // Salvar categorias dos filtros
  const handleSaveCategories = (newCategories: string[]) => {
    const updated = { ...siteSettings, categories: newCategories };
    handleSaveSettings(updated);
  };

  // Salvar status de pedido no servidor e cache local
  const handleUpdateOrderStatus = async (orderId: string, status: Order['status']) => {
    const updated = orders.map((o) => (o.id === orderId ? { ...o, status } : o));
    setOrders(updated);
    safeSetLocalStorage('cs_clothing_orders', updated);
    try {
      await fetch('/api/store/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orders: updated }),
      });
    } catch (e) {
      console.error('Erro ao atualizar status do pedido no servidor:', e);
    }
  };

  // Excluir pedido individualmente no servidor e cache local
  const handleDeleteOrder = async (orderId: string) => {
    const updated = orders.filter((o) => o.id !== orderId);
    setOrders(updated);
    safeSetLocalStorage('cs_clothing_orders', updated);
    try {
      await fetch('/api/store/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orders: updated }),
      });
    } catch (e) {
      console.error('Erro ao excluir pedido no servidor:', e);
    }
  };

  // Limpar todos os pedidos no servidor e cache local
  const handleClearAllOrders = async () => {
    setOrders([]);
    safeSetLocalStorage('cs_clothing_orders', []);
    try {
      await fetch('/api/store/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orders: [] }),
      });
    } catch (e) {
      console.error('Erro ao limpar pedidos no servidor:', e);
    }
  };

  // Restaurar dados originais no servidor e cache local
  const handleResetToDefault = async () => {
    setProducts(INITIAL_PRODUCTS);
    setSiteSettings(DEFAULT_SITE_SETTINGS);
    setOrders([]);
    safeSetLocalStorage('cs_clothing_products', INITIAL_PRODUCTS);
    safeSetLocalStorage('cs_clothing_settings', DEFAULT_SITE_SETTINGS);
    safeSetLocalStorage('cs_clothing_orders', []);
    try {
      await fetch('/api/store/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reset: true }),
      });
    } catch (e) {
      console.error('Erro ao restaurar padrões no servidor:', e);
    }
  };

  const handleLoginSuccess = () => {
    setIsAdminLoggedIn(true);
    try {
      localStorage.setItem('cs_clothing_admin_auth', 'true');
    } catch (e) {}
    setIsAdminLoginOpen(false);
    setIsAdminCMSOpen(true);
  };

  const handleLogout = () => {
    setIsAdminLoggedIn(false);
    try {
      localStorage.removeItem('cs_clothing_admin_auth');
    } catch (e) {}
  };

  const handleOpenAdmin = () => {
    if (isAdminLoggedIn) {
      setIsAdminCMSOpen(true);
    } else {
      setIsAdminLoginOpen(true);
    }
  };

  // Selecionar Tema (Claro / Escuro)
  const handleSelectTheme = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    try {
      localStorage.setItem('cs_clothing_theme', newTheme);
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark');
        document.body.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
        document.body.classList.remove('dark');
      }
    } catch (e) {}
  };

  // Alternar Tema Escuro / Claro
  const handleToggleTheme = () => {
    handleSelectTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // Ações da Sacola
  const handleClearCart = () => {
    setCartItems([]);
    try {
      localStorage.removeItem('cs_clothing_cart');
      localStorage.setItem('cs_clothing_cart', JSON.stringify([]));
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddToCart = (product: Product, variant: ProductVariant, quantity: number) => {
    setCartItems((prev) => {
      const existingIdx = prev.findIndex(
        (it) => it.product.id === product.id && it.variant.id === variant.id
      );
      let updated: CartItem[];
      if (existingIdx >= 0) {
        updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: updated[existingIdx].quantity + quantity,
        };
      } else {
        updated = [...prev, { product, variant, quantity }];
      }
      try {
        localStorage.setItem('cs_clothing_cart', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  const handleUpdateQuantity = (index: number, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(index);
      return;
    }
    setCartItems((prev) => {
      const copy = [...prev];
      if (copy[index]) {
        copy[index] = { ...copy[index], quantity };
      }
      try {
        localStorage.setItem('cs_clothing_cart', JSON.stringify(copy));
      } catch (e) {
        console.error(e);
      }
      return copy;
    });
  };

  const handleRemoveItem = (index: number) => {
    setCartItems((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      try {
        localStorage.setItem('cs_clothing_cart', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  const handleProceedToCheckout = (rate: ShippingRate, postalCode: string) => {
    setCheckoutRate(rate);
    setCheckoutZip(postalCode);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleOrderCompleted = async (order: Order) => {
    const updated = [order, ...orders];
    setOrders(updated);
    safeSetLocalStorage('cs_clothing_orders', updated);
    try {
      await fetch('/api/store/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orders: updated }),
      });
    } catch (e) {
      console.error('Erro ao salvar pedido no servidor:', e);
    }
    handleClearCart();
  };

  // Filtragem de Produtos
  const filteredProducts = products.filter((prod) => {
    if (genderFilter !== 'Todos' && prod.gender !== genderFilter) return false;
    if (categoryFilter !== 'Todas' && prod.category !== categoryFilter) return false;
    return true;
  });

  const cartCount = cartItems.reduce((acc, it) => acc + it.quantity, 0);
  const totalWeightGrams = cartItems.reduce(
    (acc, it) => acc + it.product.weightGrams * it.quantity,
    0
  );


  // Vantagens ativas da barra (filtradas para nunca ficarem vazias ou flutuando)
  const activeAdvantages = (
    siteSettings.advantages && siteSettings.advantages.length > 0
      ? siteSettings.advantages
      : DEFAULT_SITE_SETTINGS.advantages || []
  ).filter((adv) => adv.enabled !== false && adv.title && adv.title.trim().length > 0);

  const currentCategories = siteSettings.categories && siteSettings.categories.length > 0
    ? siteSettings.categories
    : ['Camisa Social', 'Camisa Linho', 'Camisa Casual', 'Camisa Polo'];

  const availableCategories = ['Todas', ...currentCategories];

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
      theme === 'dark'
        ? 'dark bg-[#07080b] text-neutral-100 selection:bg-white selection:text-neutral-950'
        : 'bg-[#f8f9fc] text-neutral-900 selection:bg-neutral-900 selection:text-white'
    }`}>
      {/* Header com Logo Oficial CS CLOTHING STORE */}
      <Header
        siteSettings={siteSettings}
        cartCount={cartCount}
        totalWeightGrams={totalWeightGrams}
        isAdminLoggedIn={isAdminLoggedIn}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onSelectTheme={handleSelectTheme}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAdmin={handleOpenAdmin}
        onSelectGenderFilter={setGenderFilter}
        currentGenderFilter={genderFilter}
      />

      <main className="flex-1">
        {/* Hero Banner Luxuoso & Moderno (Claro & Escuro) */}
        <section className="relative overflow-hidden py-14 sm:py-24 lg:py-28 bg-gradient-to-b from-[#fbfbfe] via-[#f1f3f9] to-[#e7ebf4] dark:from-[#090a0f] dark:via-[#090a0f] dark:to-[#090a0f] border-b border-neutral-200 dark:border-white/10 transition-colors duration-300">
          {/* Iluminação Ambiente Suave de Estúdio de Moda */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-0 left-10 w-96 h-96 bg-amber-500/10 dark:bg-emerald-500/5 rounded-full blur-[140px] pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/40 to-white/80 dark:via-black/20 dark:to-black/80 pointer-events-none" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
              <div className="lg:col-span-7 space-y-6">
                {/* Badge Elegante */}
                <div className="inline-flex items-center gap-2 bg-white/85 dark:bg-white/5 border border-neutral-300/80 dark:border-white/10 backdrop-blur-xl px-4 py-1.5 rounded-full text-xs font-semibold text-neutral-800 dark:text-neutral-200 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  <span>{siteSettings.heroBadge}</span>
                </div>

                {/* Título com Tipografia Editorial */}
                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08] text-neutral-950 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-br dark:from-white dark:via-neutral-100 dark:to-neutral-400">
                  {siteSettings.heroTitle}
                </h1>

                {/* Subtítulo Fluido */}
                <p className="text-xs sm:text-base text-neutral-600 dark:text-neutral-400 max-w-xl leading-relaxed font-normal">
                  {siteSettings.heroSubtitle}
                </p>

                {/* Botões de Ação de Alta Qualidade */}
                <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 pt-2 sm:pt-3">
                  <a
                    href="#catalogo"
                    className="px-5 sm:px-6 py-3 sm:py-3.5 bg-neutral-950 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg dark:shadow-[0_10px_30px_rgba(255,255,255,0.15)] flex items-center gap-2 cursor-pointer active:scale-95"
                  >
                    <span>Ver Coleção de Camisas</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>

                  <button
                    onClick={() => {
                      setGenderFilter('Masculino');
                      const el = document.getElementById('catalogo');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="px-3.5 sm:px-4 py-3 sm:py-3.5 bg-white hover:bg-neutral-100 text-neutral-800 border border-neutral-200 dark:bg-white/5 dark:hover:bg-white/10 dark:border-white/10 dark:text-white font-bold text-xs rounded-xl backdrop-blur-md transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
                  >
                    👔 Camisas Masculinas
                  </button>

                  <button
                    onClick={() => {
                      setGenderFilter('Feminino');
                      const el = document.getElementById('catalogo');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="px-3.5 sm:px-4 py-3 sm:py-3.5 bg-white hover:bg-neutral-100 text-neutral-800 border border-neutral-200 dark:bg-white/5 dark:hover:bg-white/10 dark:border-white/10 dark:text-white font-bold text-xs rounded-xl backdrop-blur-md transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
                  >
                    👗 Camisas Femininas
                  </button>

                  {isAdminLoggedIn && (
                    <button
                      onClick={() => setIsAdminCMSOpen(true)}
                      className="px-3.5 sm:px-4 py-3 sm:py-3.5 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-600/50 hover:bg-emerald-200 dark:hover:bg-emerald-900 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer backdrop-blur-md transition-all"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      Editar Conteúdo da Home
                    </button>
                  )}
                </div>
              </div>

              {/* Logo CS CLOTHING STORE com Design Escultural de Luxo */}
              <div className="lg:col-span-5 flex justify-center">
                <div className="relative group">
                  {/* Halo de luz sutil atrás do card */}
                  <div className="absolute -inset-2 bg-gradient-to-r from-amber-500/15 via-indigo-500/10 to-amber-500/10 dark:from-amber-500/10 dark:via-white/5 dark:to-indigo-500/10 rounded-3xl blur-2xl opacity-70 group-hover:opacity-100 transition-opacity duration-700" />

                  {/* Pedestal do Logo */}
                  <div className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-3xl p-6 sm:p-8 bg-white/95 dark:bg-gradient-to-b dark:from-[#14151e]/90 dark:to-[#07070a]/95 backdrop-blur-2xl border border-neutral-200/90 dark:border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.08),inset_0_1px_1px_rgba(255,255,255,0.9)] dark:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),inset_0_1px_1px_rgba(255,255,255,0.15)] flex flex-col items-center justify-center">
                    <div className="relative w-full h-full drop-shadow-[0_8px_16px_rgba(0,0,0,0.12)] dark:drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]">
                      <Image
                        src="/cs-clothing-logo.png"
                        alt="CS Clothing Store Logo"
                        fill
                        className="object-contain"
                        priority
                      />
                    </div>
                    <div className="mt-3 border border-neutral-200 dark:border-white/10 bg-neutral-100 dark:bg-black/60 backdrop-blur-md px-4 py-1 rounded-full text-[10px] font-mono tracking-widest text-neutral-700 dark:text-neutral-300 uppercase shadow-xs">
                      EST. 2026 • BRASIL
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Barra de Vantagens da Loja (100% Editável pelo Painel ADM) */}
        {activeAdvantages.length > 0 ? (
          <section className="bg-white dark:bg-[#0c0d13] border-b border-neutral-200 dark:border-neutral-800 py-6 transition-colors">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div
                className={`grid gap-4 sm:gap-6 items-start ${
                  activeAdvantages.length === 1
                    ? 'grid-cols-1 max-w-md mx-auto'
                    : activeAdvantages.length === 2
                    ? 'grid-cols-1 sm:grid-cols-2 max-w-3xl mx-auto'
                    : activeAdvantages.length === 3
                    ? 'grid-cols-1 sm:grid-cols-3 max-w-5xl mx-auto'
                    : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
                }`}
              >
                {activeAdvantages.map((adv) => {
                  const colorCls = getColorClasses(adv.color);

                  return (
                    <div key={adv.id} className="flex items-start gap-3 p-2 sm:p-0">
                      <div className={`p-2.5 rounded-2xl shrink-0 ${colorCls} shadow-2xs`}>
                        <AdvantageIcon iconId={adv.icon} />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-neutral-950 dark:text-white">{adv.title}</h4>
                        {adv.description && (
                          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 leading-relaxed">
                            {adv.description}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {isAdminLoggedIn && (
                <div className="mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800 flex justify-end">
                  <button
                    onClick={() => setIsAdminCMSOpen(true)}
                    className="text-[11px] text-amber-700 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 font-bold flex items-center gap-1 cursor-pointer bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-800"
                  >
                    <Edit className="w-3 h-3" /> Gerenciar / Alterar Ícones Desta Barra
                  </button>
                </div>
              )}
            </div>
          </section>
        ) : (
          isAdminLoggedIn && (
            <div className="bg-amber-50/60 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-800 py-3 px-4 text-center text-xs text-amber-900 dark:text-amber-300 flex items-center justify-center gap-2">
              <span>A barra de vantagens está oculta (todos os cards foram apagados).</span>
              <button
                onClick={() => setIsAdminCMSOpen(true)}
                className="font-bold underline cursor-pointer hover:text-amber-950 dark:hover:text-white"
              >
                + Adicionar Vantagens & Escolher Ícones
              </button>
            </div>
          )
        )}

        {/* Catálogo de Camisas Masculinas e Femininas */}
        <section id="catalogo" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                  Catálogo CS Clothing Store
                </span>
                {isAdminLoggedIn && (
                  <button
                    onClick={() => setIsAdminCMSOpen(true)}
                    className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-bold underline flex items-center gap-1 cursor-pointer"
                  >
                    <Edit className="w-3 h-3" /> Gerenciar Peças no Painel
                  </button>
                )}
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-neutral-950 dark:text-white tracking-tight mt-1">
                {genderFilter === 'Todos'
                  ? 'Todas as Camisas'
                  : genderFilter === 'Masculino'
                  ? 'Camisas Masculinas'
                  : 'Camisas Femininas'}
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                Exibindo {filteredProducts.length} modelo(s) com pronta entrega e envio rápido para todo o Brasil.
              </p>
            </div>

            {/* Filtros de Gênero e Categoria */}
            <div className="flex flex-wrap gap-2 items-center">
              {/* Botões de Gênero */}
              <div className="flex bg-neutral-200 dark:bg-[#13141f] p-1 rounded-xl text-xs font-bold border border-transparent dark:border-neutral-800">
                <button
                  onClick={() => setGenderFilter('Todos')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    genderFilter === 'Todos' ? 'bg-white dark:bg-[#202230] text-neutral-950 dark:text-white shadow-xs' : 'text-neutral-600 dark:text-neutral-400'
                  }`}
                >
                  Todas
                </button>
                <button
                  onClick={() => setGenderFilter('Masculino')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    genderFilter === 'Masculino' ? 'bg-white dark:bg-blue-950 text-blue-900 dark:text-blue-300 shadow-xs' : 'text-neutral-600 dark:text-neutral-400'
                  }`}
                >
                  Masculinas
                </button>
                <button
                  onClick={() => setGenderFilter('Feminino')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    genderFilter === 'Feminino' ? 'bg-white dark:bg-rose-950 text-rose-900 dark:text-rose-300 shadow-xs' : 'text-neutral-600 dark:text-neutral-400'
                  }`}
                >
                  Femininas
                </button>
              </div>

              {/* Categorias Dinâmicas & Editáveis */}
              <div className="flex flex-wrap gap-1.5 items-center">
                {availableCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      categoryFilter === cat
                        ? 'bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 shadow-xs'
                        : 'bg-white dark:bg-[#12131b] text-neutral-600 dark:text-neutral-300 border border-neutral-300 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-700'
                    }`}
                  >
                    {cat}
                  </button>
                ))}

                {/* Botão de Edição das Categorias (Visível exclusivamente quando logado como ADM) */}
                {isAdminLoggedIn && (
                  <button
                    onClick={() => setIsCategoryManagerOpen(true)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800 flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ml-1"
                    title="Editar, adicionar ou remover as categorias desta lista"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                    <span>Editar Categorias</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Grid de Cards de Camisas */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-16 sm:py-20 bg-white dark:bg-[#0e0f17] rounded-3xl border border-neutral-200 dark:border-neutral-800 space-y-3">
              <Package className="w-12 h-12 text-neutral-300 dark:text-neutral-600 mx-auto" />
              <h4 className="text-base font-bold text-neutral-800 dark:text-neutral-200">Nenhuma camisa encontrada neste filtro.</h4>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Tente selecionar outro gênero ou categoria.</p>
              <button
                onClick={() => {
                  setGenderFilter('Todos');
                  setCategoryFilter('Todas');
                }}
                className="px-4 py-2 bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 rounded-xl text-xs font-bold cursor-pointer"
              >
                Limpar Filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onSelectProduct={(p) => setSelectedProduct(p)}
                />
              ))}
            </div>
          )}
        </section>

        {/* Banner Minimalista de Garantia & Qualidade CS Clothing */}
        <section className="bg-white dark:bg-[#0a0b10] border-t border-neutral-200 dark:border-neutral-800 py-12 sm:py-16 transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
            <span className="text-xs font-mono font-bold tracking-widest text-neutral-400 dark:text-neutral-500 uppercase">
              CS CLOTHING STORE • CAMISARIA CONTEMPORÂNEA
            </span>
            <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-neutral-950 dark:text-white tracking-tight max-w-xl mx-auto">
              Camisas com acabamento impecável e caimento autoral.
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-lg mx-auto leading-relaxed">
              Confeccionadas com matérias-primas de alto padrão. O cálculo de frete é realizado de forma automática e transparente ao selecionar suas peças ou na finalização do pedido.
            </p>
          </div>
        </section>
      </main>

      {/* Footer Profissional com Logo CS CLOTHING STORE */}
      <footer className="bg-white dark:bg-[#07080c] border-t border-neutral-200 dark:border-neutral-800 py-12 text-xs text-neutral-500 dark:text-neutral-400 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 bg-black rounded-xl overflow-hidden border border-neutral-800 shrink-0">
                  <Image
                    src="/cs-clothing-logo.png"
                    alt="CS Clothing Store"
                    fill
                    className="object-contain p-1"
                  />
                </div>
                <div>
                  <span className="text-base font-black tracking-wider text-neutral-950 dark:text-white font-mono uppercase block">
                    {siteSettings.storeName}
                  </span>
                  <span className="text-[10px] text-neutral-400 uppercase tracking-widest">
                    Camisaria Fina
                  </span>
                </div>
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Marca especializada em camisas masculinas e femininas de alto padrão com acabamento de alfaiataria fina.
              </p>
            </div>

            <div>
              <h5 className="font-bold text-neutral-900 dark:text-white mb-2 uppercase tracking-wider text-[11px]">
                Navegação
              </h5>
              <ul className="space-y-1.5">
                <li>
                  <button onClick={() => setGenderFilter('Masculino')} className="hover:text-neutral-950 dark:hover:text-white cursor-pointer">
                    • Camisas Masculinas
                  </button>
                </li>
                <li>
                  <button onClick={() => setGenderFilter('Feminino')} className="hover:text-neutral-950 dark:hover:text-white cursor-pointer">
                    • Camisas Femininas
                  </button>
                </li>
                <li>
                  <a href="#catalogo" className="hover:text-neutral-950 dark:hover:text-white cursor-pointer">
                    • Coleção Completa 2026
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h5 className="font-bold text-neutral-900 dark:text-white mb-2 uppercase tracking-wider text-[11px]">
                Atendimento & Loja
              </h5>
              <ul className="space-y-1.5 text-neutral-600 dark:text-neutral-400">
                <li className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-neutral-400" />
                  <a
                    href={`https://wa.me/55${(siteSettings.whatsappNumber || '').replace(/\D/g, '').replace(/^55/, '') || '11987654321'}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
                  >
                    {siteSettings.whatsappNumber}
                  </a>
                </li>
                <li className="flex items-center gap-1.5">
                  <Share2 className="w-3.5 h-3.5 text-neutral-400" />
                  <a
                    href={(siteSettings.instagramHandle || '').startsWith('http') ? siteSettings.instagramHandle : `https://instagram.com/${(siteSettings.instagramHandle || '').replace('@', '').trim() || 'csclothingstore'}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-pink-600 dark:hover:text-pink-400 transition-colors cursor-pointer"
                  >
                    {siteSettings.instagramHandle}
                  </a>
                </li>
                <li className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-semibold">
                  <Truck className="w-3.5 h-3.5" />
                  <span>Envio Express com Código de Rastreio</span>
                </li>
              </ul>
            </div>

            <div>
              <h5 className="font-bold text-neutral-900 dark:text-white mb-2 uppercase tracking-wider text-[11px]">
                Gerenciamento da Loja
              </h5>
              <button
                onClick={handleOpenAdmin}
                className="px-4 py-2.5 bg-neutral-950 dark:bg-neutral-800 hover:bg-neutral-800 dark:hover:bg-neutral-700 text-white rounded-xl font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                {isAdminLoggedIn ? (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    Abrir Painel de Controle ADM
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                    Acessar Login ADM
                  </>
                )}
              </button>
              {isAdminLoggedIn && (
                <button
                  onClick={handleLogout}
                  className="text-[11px] text-rose-600 dark:text-rose-400 hover:text-rose-800 dark:hover:text-rose-300 font-semibold underline block cursor-pointer mt-1.5"
                >
                  Sair do Modo Administrador
                </button>
              )}
              <p className="text-[10px] text-neutral-400 mt-1.5">
                {isAdminLoggedIn
                  ? 'Você está autenticado. Edite produtos, categorias e pedidos.'
                  : 'Acesso exclusivo para administradores da loja.'}
              </p>
            </div>
          </div>

          <div className="pt-6 border-t border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
            <div>© 2026 {siteSettings.storeName}. Todos os direitos reservados.</div>
            <div className="flex gap-4">
              <span>Compra 100% Segura & Pix</span>
              <span>•</span>
              <span>Envio Protegido com Rastreamento</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Modais */}
      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        onProceedToCheckout={handleProceedToCheckout}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cartItems}
        selectedRate={checkoutRate}
        postalCode={checkoutZip}
        onOrderCompleted={handleOrderCompleted}
        mercadoPagoAccessToken={siteSettings.mercadoPagoAccessToken}
        isAdminLoggedIn={isAdminLoggedIn}
      />

      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        siteSettings={siteSettings}
      />

      <AdminCMSModal
        isOpen={isAdminCMSOpen}
        onClose={() => setIsAdminCMSOpen(false)}
        products={products}
        siteSettings={siteSettings}
        orders={orders}
        onSaveProducts={handleSaveProducts}
        onSaveSettings={handleSaveSettings}
        onUpdateOrderStatus={handleUpdateOrderStatus}
        onDeleteOrder={handleDeleteOrder}
        onClearAllOrders={handleClearAllOrders}
        onResetToDefault={handleResetToDefault}
        onLogout={handleLogout}
      />

      <CategoryManagerModal
        isOpen={isCategoryManagerOpen}
        onClose={() => setIsCategoryManagerOpen(false)}
        categories={currentCategories}
        onSaveCategories={handleSaveCategories}
      />

      {/* Botões Flutuantes com Efeito Giratório: WhatsApp & Instagram */}
      <FloatingSocialButtons
        whatsappNumber={siteSettings.whatsappNumber}
        instagramHandle={siteSettings.instagramHandle}
      />
    </div>
  );
}
