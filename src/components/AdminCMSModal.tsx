'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  X,
  Plus,
  Trash2,
  Edit2,
  Save,
  Truck,
  Package,
  Settings,
  ShoppingBag,
  LogOut,
  CheckCircle2,
  RotateCcw,
  Barcode,
  Send,
  Sparkles,
  Upload,
  Tags,
  Check,
  ImageIcon,
  TrendingUp,
  DollarSign,
  Download,
  BarChart3,
  CreditCard,
  QrCode,
  FileSpreadsheet,
  ShieldCheck,
  Eye,
  EyeOff,
  Printer,
  Copy,
} from 'lucide-react';
import { Product, SiteSettings, Order, StoreAdvantage } from '../types/store';
import {
  AVAILABLE_ICONS,
  AVAILABLE_COLORS,
  AdvantageIcon,
  getColorClasses,
} from './AdvantageIcon';

interface AdminCMSModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  siteSettings: SiteSettings;
  orders: Order[];
  onSaveProducts: (products: Product[]) => void;
  onSaveSettings: (settings: SiteSettings) => void;
  onUpdateOrderStatus: (orderId: string, status: Order['status']) => void;
  onDeleteOrder?: (orderId: string) => void;
  onClearAllOrders?: () => void;
  onResetToDefault: () => void;
  onLogout: () => void;
}

export const AdminCMSModal: React.FC<AdminCMSModalProps> = ({
  isOpen,
  onClose,
  products,
  siteSettings,
  orders,
  onSaveProducts,
  onSaveSettings,
  onUpdateOrderStatus,
  onDeleteOrder,
  onClearAllOrders,
  onResetToDefault,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'sales' | 'settings' | 'orders'>('sales');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [tempSettings, setTempSettings] = useState<SiteSettings>({ ...siteSettings });
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [printingOrder, setPrintingOrder] = useState<Order | null>(null);
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);

  const handleCopyDispatchInfo = (ord: Order) => {
    const text = `=== CS CLOTHING STORE - DADOS PARA DESPACHO JADLOG ===
PEDIDO: ${ord.orderNumber}
RASTREAMENTO: ${ord.trackingNumber}
MODALIDADE: ${ord.selectedRate.serviceName}
VALOR DO FRETE: R$ ${ord.shippingCost.toFixed(2)}

DESTINATÁRIO:
Nome: ${ord.shippingAddress.fullName}
Telefone: ${ord.shippingAddress.phone || 'Não informado'}
Endereço: ${ord.shippingAddress.street}, ${ord.shippingAddress.number}${ord.shippingAddress.complement ? ' - ' + ord.shippingAddress.complement : ''}
Cidade / UF: ${ord.shippingAddress.city} - ${ord.shippingAddress.state}
CEP: ${ord.shippingAddress.postalCode}

REMETENTE:
Loja: ${siteSettings.storeName}
Origem: ${siteSettings.jadlogPickupAddress || 'CS Clothing Store CD'}
CEP Origem: ${siteSettings.jadlogOriginCep || '01310-100'}

CONTEÚDO:
${ord.items.map((it) => `- ${it.quantity}x ${it.product.name} (Tam: ${it.variant.size}, Cor: ${it.variant.color})`).join('\n')}
`;
    navigator.clipboard.writeText(text);
    setCopiedOrderId(ord.id);
    setTimeout(() => setCopiedOrderId(null), 2500);
  };

  useEffect(() => {
    if (isOpen) {
      setTempSettings({ ...siteSettings });
    }
  }, [siteSettings, isOpen]);

  const defaultAdvantages: StoreAdvantage[] = [
    {
      id: 'adv-1',
      title: 'Envio Oficial JADLOG',
      description: 'Modalidades .Package (econômico) e .Com (expresso) para todo o Brasil.',
      icon: 'truck',
      color: 'emerald',
      enabled: true,
    },
    {
      id: 'adv-2',
      title: 'Camisaria Especializada',
      description: 'Modelagens masculinas e femininas com tecidos nobres e acabamento alfaiataria.',
      icon: 'sparkles',
      color: 'blue',
      enabled: true,
    },
    {
      id: 'adv-3',
      title: 'Cubagem Automatizada',
      description: 'Fórmula oficial da Jadlog para evitar divergência de peso no despacho.',
      icon: 'package',
      color: 'neutral',
      enabled: true,
    },
    {
      id: 'adv-4',
      title: 'Compra 100% Segura',
      description: 'Pagamentos protegidos via Pix ou Cartão com confirmação e rastreio em tempo real.',
      icon: 'shield',
      color: 'amber',
      enabled: true,
    },
  ];

  const handleUpdateAdvantage = (
    idx: number,
    field: keyof StoreAdvantage,
    value: any
  ) => {
    const list = [...(tempSettings.advantages || defaultAdvantages)];
    list[idx] = { ...list[idx], [field]: value };
    const updated = { ...tempSettings, advantages: list };
    setTempSettings(updated);
    onSaveSettings(updated);
  };

  const handleDeleteAdvantage = (idx: number) => {
    const currentList = tempSettings.advantages || defaultAdvantages;
    const itemTitle = currentList[idx]?.title || `Card ${idx + 1}`;
    if (window.confirm(`Deseja apagar e fazer sumir o card "${itemTitle}" da barra do site?`)) {
      const updated = currentList.filter((_, i) => i !== idx);
      const newSettings = { ...tempSettings, advantages: updated };
      setTempSettings(newSettings);
      onSaveSettings(newSettings);
      triggerSuccess(`Card "${itemTitle}" apagado e salvo permanentemente!`);
    }
  };

  const handleToggleAdvantage = (idx: number) => {
    const list = [...(tempSettings.advantages || defaultAdvantages)];
    const currentStatus = list[idx].enabled !== false;
    list[idx] = { ...list[idx], enabled: !currentStatus };
    const newSettings = { ...tempSettings, advantages: list };
    setTempSettings(newSettings);
    onSaveSettings(newSettings);
    triggerSuccess(!currentStatus ? 'Card reativado no site e salvo!' : 'Card ocultado do site e salvo!');
  };

  const handleAddAdvantage = () => {
    const list = [...(tempSettings.advantages || defaultAdvantages)];
    const newAdv: StoreAdvantage = {
      id: `adv-${Date.now()}`,
      title: 'Nova Vantagem CS',
      description: 'Benefício exclusivo da camisaria para clientes de todo o Brasil.',
      icon: 'shirt',
      color: 'blue',
      enabled: true,
    };
    const newSettings = { ...tempSettings, advantages: [...list, newAdv] };
    setTempSettings(newSettings);
    onSaveSettings(newSettings);
    triggerSuccess('Novo card adicionado e salvo! Personalize o ícone e o texto.');
  };

  const handleRestoreDefaultAdvantages = () => {
    if (window.confirm('Deseja restaurar os 4 cards originais da barra de vantagens?')) {
      const newSettings = { ...tempSettings, advantages: defaultAdvantages };
      setTempSettings(newSettings);
      onSaveSettings(newSettings);
      triggerSuccess('Cards padrões restaurados e salvos com sucesso!');
    }
  };

  // Exportar Log de Vendas em CSV
  const handleExportSalesCSV = () => {
    if (orders.length === 0) return;
    const headers = ['Data', 'Hora', 'Pedido', 'Cliente', 'Email', 'Telefone', 'Cidade', 'UF', 'CEP', 'Itens', 'Pagamento', 'Subtotal', 'FreteJadlog', 'Total', 'Status', 'Rastreio'];
    const rows = orders.map((o) => {
      const dateObj = new Date(o.createdAt);
      const dateStr = dateObj.toLocaleDateString('pt-BR');
      const timeStr = dateObj.toLocaleTimeString('pt-BR');
      const itemsDesc = o.items.map((it) => `${it.quantity}x ${it.product.name} (${it.variant.size}/${it.variant.color})`).join('; ');
      return [
        dateStr,
        timeStr,
        o.orderNumber,
        `"${o.shippingAddress.fullName}"`,
        o.shippingAddress.email,
        o.shippingAddress.phone,
        `"${o.shippingAddress.city}"`,
        o.shippingAddress.state,
        o.shippingAddress.postalCode,
        `"${itemsDesc}"`,
        o.paymentMethod || 'Pix',
        o.subtotal.toFixed(2),
        o.shippingCost.toFixed(2),
        o.total.toFixed(2),
        o.status,
        o.trackingNumber
      ].join(',');
    });
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `log_vendas_cs_clothing_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Estados locais para categorias
  const [newCatInput, setNewCatInput] = useState('');
  const [editingCatIndex, setEditingCatIndex] = useState<number | null>(null);
  const [editingCatValue, setEditingCatValue] = useState('');

  if (!isOpen) return null;

  const currentCategories = tempSettings.categories || ['Camisa Social', 'Camisa Linho', 'Camisa Casual', 'Camisa Polo'];

  // Estado para novo produto
  const emptyNewProduct: Product = {
    id: `cs-${Date.now()}`,
    name: '',
    subtitle: '',
    description: '',
    gender: 'Masculino',
    category: currentCategories[0] || 'Camisa Social',
    material: 'Algodão Nobre',
    composition: '100% Algodão',
    weightGrams: 280,
    packageDimensions: { lengthCm: 32, widthCm: 24, heightCm: 3 },
    priceBRL: 199.90,
    images: ['https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1000&q=80'],
    variants: [
      { id: `v-${Date.now()}-p`, size: 'P', color: 'Branco', stock: 10 },
      { id: `v-${Date.now()}-m`, size: 'M', color: 'Branco', stock: 15 },
      { id: `v-${Date.now()}-g`, size: 'G', color: 'Branco', stock: 12 },
      { id: `v-${Date.now()}-gg`, size: 'GG', color: 'Branco', stock: 6 },
    ],
    tag: 'Novidade',
  };

  const handleStartCreate = () => {
    setEditingProduct(emptyNewProduct);
    setIsCreatingNew(true);
  };

  const handleStartEdit = (prod: Product) => {
    setEditingProduct({ ...prod });
    setIsCreatingNew(false);
  };

  const handleSaveProductForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || !editingProduct.name) return;

    let updatedList: Product[];
    if (isCreatingNew) {
      updatedList = [editingProduct, ...products];
    } else {
      updatedList = products.map((p) => (p.id === editingProduct.id ? editingProduct : p));
    }

    onSaveProducts(updatedList);
    setEditingProduct(null);
    setIsCreatingNew(false);
    triggerSuccess('Camisa salva no catálogo com sucesso!');
  };

  const handleDeleteProduct = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta camisa do catálogo?')) {
      const updated = products.filter((p) => p.id !== id);
      onSaveProducts(updated);
      triggerSuccess('Camisa removida com sucesso!');
    }
  };

  const handleSaveSettingsForm = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(tempSettings);
    triggerSuccess('Textos e configurações da loja atualizados!');
  };

  // Gerenciamento de Categorias
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const val = newCatInput.trim();
    if (!val) return;
    if (currentCategories.includes(val)) {
      alert('Esta categoria já existe.');
      return;
    }
    const updated = [...currentCategories, val];
    const newSettings = { ...tempSettings, categories: updated };
    setTempSettings(newSettings);
    onSaveSettings(newSettings);
    setNewCatInput('');
    triggerSuccess(`Categoria "${val}" adicionada aos filtros!`);
  };

  const handleSaveEditedCategory = (index: number) => {
    const val = editingCatValue.trim();
    if (!val) return;
    const updated = [...currentCategories];
    updated[index] = val;
    const newSettings = { ...tempSettings, categories: updated };
    setTempSettings(newSettings);
    onSaveSettings(newSettings);
    setEditingCatIndex(null);
    triggerSuccess('Categoria renomeada com sucesso!');
  };

  const handleDeleteCategory = (index: number) => {
    if (currentCategories.length <= 1) {
      alert('Mantenha pelo menos uma categoria cadastrada.');
      return;
    }
    const catName = currentCategories[index];
    if (window.confirm(`Deseja excluir a categoria "${catName}" dos filtros da loja?`)) {
      const updated = currentCategories.filter((_, i) => i !== index);
      const newSettings = { ...tempSettings, categories: updated };
      setTempSettings(newSettings);
      onSaveSettings(newSettings);
      triggerSuccess(`Categoria "${catName}" excluída!`);
    }
  };

  const triggerSuccess = (msg: string) => {
    setSaveSuccessMsg(msg);
    setTimeout(() => setSaveSuccessMsg(''), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/80 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-6xl bg-white rounded-3xl shadow-2xl overflow-hidden my-4 border border-neutral-300 flex flex-col max-h-[92vh]">
        {/* Header do Painel ADM */}
        <div className="bg-neutral-100 dark:bg-[#090a0f] text-neutral-950 dark:text-white p-3.5 sm:p-5 flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="relative w-10 h-10 sm:w-12 sm:h-12 bg-white dark:bg-black rounded-xl border border-neutral-300 dark:border-neutral-800 overflow-hidden shrink-0 shadow-2xs">
              <Image
                src="/cs-clothing-logo.png"
                alt="CS Clothing Store Logo"
                fill
                className="object-contain p-1"
              />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <h3 className="font-black text-sm sm:text-base tracking-wide text-neutral-950 dark:text-white font-mono uppercase truncate">
                  Painel de Controle ADM
                </h3>
                <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full uppercase shrink-0">
                  Admin
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-neutral-500 dark:text-neutral-400 hidden sm:block">
                Gerencie catálogo de camisas, fotos, categorias dos filtros, textos e expedição Jadlog.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="px-2.5 sm:px-3 py-1.5 bg-white dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-semibold rounded-lg border border-neutral-300 dark:border-neutral-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sair</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-500 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notificação Flutuante de Sucesso */}
        {saveSuccessMsg && (
          <div className="bg-emerald-600 text-white px-4 py-2 text-xs font-bold text-center flex items-center justify-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4" />
            {saveSuccessMsg}
          </div>
        )}

        {/* Abas de Navegação */}
        <div className="bg-neutral-100 border-b border-neutral-200 px-5 flex gap-2 overflow-x-auto">
          <button
            onClick={() => {
              setActiveTab('products');
              setEditingProduct(null);
            }}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'products'
                ? 'border-neutral-950 text-neutral-950 bg-white shadow-xs'
                : 'border-transparent text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            Camisas & Catálogo ({products.length})
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'categories'
                ? 'border-neutral-950 text-neutral-950 bg-white shadow-xs'
                : 'border-transparent text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Tags className="w-4 h-4 text-amber-600" />
            Categorias dos Filtros ({currentCategories.length})
          </button>

          <button
            onClick={() => setActiveTab('sales')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'sales'
                ? 'border-neutral-950 text-neutral-950 bg-white shadow-xs'
                : 'border-transparent text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            Log de Vendas ({orders.length})
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'settings'
                ? 'border-neutral-950 text-neutral-950 bg-white shadow-xs'
                : 'border-transparent text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Settings className="w-4 h-4 text-purple-600" />
            Configurações, Redes & Jadlog
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'orders'
                ? 'border-neutral-950 text-neutral-950 bg-white shadow-xs'
                : 'border-transparent text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Truck className="w-4 h-4 text-emerald-600" />
            Pedidos & Despacho Jadlog ({orders.length})
          </button>
        </div>

        {/* Corpo do Painel */}
        <div className="flex-1 overflow-y-auto p-6 bg-neutral-50 text-xs text-neutral-800">
          {/* ================= ABA 1: PRODUTOS ================= */}
          {activeTab === 'products' && (
            <div>
              {editingProduct ? (
                /* Formulário de Edição / Criação de Camisa */
                <form onSubmit={handleSaveProductForm} className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-xs space-y-6 max-w-4xl mx-auto">
                  <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
                    <h4 className="font-bold text-sm text-neutral-900 flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4 text-neutral-700" />
                      {isCreatingNew ? '+ Cadastrar Nova Camisa' : `Editar Camisa: ${editingProduct.name}`}
                    </h4>
                    <button
                      type="button"
                      onClick={() => setEditingProduct(null)}
                      className="text-neutral-500 hover:text-neutral-800 underline cursor-pointer"
                    >
                      Cancelar
                    </button>
                  </div>

                  {/* SEÇÃO DE FOTO DO PRODUTO COM UPLOAD */}
                  <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-3">
                    <label className="font-bold text-neutral-800 block text-xs flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <ImageIcon className="w-4 h-4 text-emerald-600" />
                        Foto da Camisa (Upload ou Link):
                      </span>
                      {editingProduct.images[0] && (
                        <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Foto pronta
                        </span>
                      )}
                    </label>

                    <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-start">
                      {/* Miniatura / Preview da Imagem */}
                      <div className="relative w-28 h-36 bg-neutral-200 rounded-xl overflow-hidden border-2 border-dashed border-neutral-300 shrink-0 flex items-center justify-center shadow-xs">
                        {editingProduct.images[0] ? (
                          <Image
                            src={editingProduct.images[0]}
                            alt="Preview da Camisa"
                            fill
                            unoptimized={editingProduct.images[0]?.startsWith('data:')}
                            className="object-cover"
                          />
                        ) : (
                          <div className="text-center p-2 text-neutral-400 text-[10px]">
                            Sem Foto
                          </div>
                        )}
                      </div>

                      <div className="flex-1 space-y-3 w-full">
                        {/* Opção 1: Upload de Arquivo Local */}
                        <div>
                          <span className="text-[11px] font-bold text-neutral-700 block mb-1">
                            Opção 1: Escolha a foto do seu Computador ou Celular:
                          </span>
                          <label className="flex items-center justify-center gap-2 px-4 py-2.5 bg-neutral-950 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-sm">
                            <Upload className="w-4 h-4 text-emerald-400" />
                            <span>Procurar Imagem no Dispositivo...</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = (uploadEvent) => {
                                    const base64 = uploadEvent.target?.result as string;
                                    const imgs = [...editingProduct.images];
                                    imgs[0] = base64;
                                    setEditingProduct({ ...editingProduct, images: imgs });
                                    triggerSuccess('Foto carregada do computador!');
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                          </label>
                        </div>

                        {/* Opção 2: URL da Imagem */}
                        <div>
                          <span className="text-[11px] font-bold text-neutral-500 block mb-1">
                            Opção 2: Ou digite o link (URL) da foto:
                          </span>
                          <input
                            type="text"
                            value={editingProduct.images[0]?.startsWith('data:') ? 'Arquivo carregado do computador' : (editingProduct.images[0] || '')}
                            onChange={(e) => {
                              const imgs = [...editingProduct.images];
                              imgs[0] = e.target.value;
                              setEditingProduct({ ...editingProduct, images: imgs });
                            }}
                            disabled={editingProduct.images[0]?.startsWith('data:')}
                            placeholder="https://images.unsplash.com/..."
                            className="w-full p-2 border border-neutral-300 rounded-lg bg-white text-xs disabled:bg-neutral-100 disabled:text-neutral-500 font-mono"
                          />
                          {editingProduct.images[0]?.startsWith('data:') && (
                            <button
                              type="button"
                              onClick={() => {
                                const imgs = [...editingProduct.images];
                                imgs[0] = '';
                                setEditingProduct({ ...editingProduct, images: imgs });
                              }}
                              className="text-[11px] text-rose-600 hover:underline font-bold mt-1 cursor-pointer block"
                            >
                              Remover foto e escolher outra
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Informações Básicas */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2">
                      <label className="font-bold text-neutral-700 block mb-1">Nome da Camisa:</label>
                      <input
                        type="text"
                        required
                        value={editingProduct.name}
                        onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                        className="w-full p-2.5 border border-neutral-300 rounded-xl bg-neutral-50 focus:bg-white"
                        placeholder="Ex: Camisa Linho Puro Manga Longa"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-neutral-700 block mb-1">Preço em Reais (R$):</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={editingProduct.priceBRL}
                        onChange={(e) => setEditingProduct({ ...editingProduct, priceBRL: parseFloat(e.target.value) || 0 })}
                        className="w-full p-2.5 border border-neutral-300 rounded-xl bg-neutral-50 focus:bg-white font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="font-bold text-neutral-700 block mb-1">Gênero:</label>
                      <select
                        value={editingProduct.gender}
                        onChange={(e) => setEditingProduct({ ...editingProduct, gender: e.target.value as any })}
                        className="w-full p-2.5 border border-neutral-300 rounded-xl bg-neutral-50 focus:bg-white font-medium"
                      >
                        <option value="Masculino">Camisa Masculina</option>
                        <option value="Feminino">Camisa Feminina</option>
                      </select>
                    </div>

                    {/* SELECT DINÂMICO DE CATEGORIAS */}
                    <div>
                      <label className="font-bold text-neutral-700 block mb-1 flex items-center justify-between">
                        <span>Categoria (Editável):</span>
                        <button
                          type="button"
                          onClick={() => setActiveTab('categories')}
                          className="text-[10px] text-amber-700 underline font-semibold cursor-pointer"
                        >
                          + Gerenciar
                        </button>
                      </label>
                      <select
                        value={editingProduct.category}
                        onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                        className="w-full p-2.5 border border-neutral-300 rounded-xl bg-neutral-50 focus:bg-white font-medium"
                      >
                        {currentCategories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="font-bold text-neutral-700 block mb-1">Tag Promocional:</label>
                      <input
                        type="text"
                        value={editingProduct.tag || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, tag: e.target.value })}
                        className="w-full p-2.5 border border-neutral-300 rounded-xl bg-neutral-50 focus:bg-white"
                        placeholder="Ex: Lançamento, Mais Vendida"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-neutral-700 block mb-1">Subtítulo / Tecido de Destaque:</label>
                    <input
                      type="text"
                      value={editingProduct.subtitle}
                      onChange={(e) => setEditingProduct({ ...editingProduct, subtitle: e.target.value })}
                      className="w-full p-2.5 border border-neutral-300 rounded-xl bg-neutral-50 focus:bg-white"
                      placeholder="Ex: Algodão Oxford Fio 80 com Tratamento Easy Iron"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-neutral-700 block mb-1">Descrição Detalhada:</label>
                    <textarea
                      rows={3}
                      value={editingProduct.description}
                      onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                      className="w-full p-2.5 border border-neutral-300 rounded-xl bg-neutral-50 focus:bg-white"
                      placeholder="Descreva o caimento, gola, punhos e estilo da peça..."
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="font-bold text-neutral-700 block mb-1">Composição Têxtil:</label>
                      <input
                        type="text"
                        value={editingProduct.composition}
                        onChange={(e) => setEditingProduct({ ...editingProduct, composition: e.target.value })}
                        className="w-full p-2.5 border border-neutral-300 rounded-xl bg-neutral-50 focus:bg-white"
                        placeholder="Ex: 100% Linho Natural"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-neutral-700 block mb-1">Peso da Peça (Gramas):</label>
                      <input
                        type="number"
                        value={editingProduct.weightGrams}
                        onChange={(e) => setEditingProduct({ ...editingProduct, weightGrams: parseInt(e.target.value) || 250 })}
                        className="w-full p-2.5 border border-neutral-300 rounded-xl bg-neutral-50 focus:bg-white font-mono"
                      />
                      <span className="text-[10px] text-neutral-500">Usado pela Jadlog para cálculo de frete</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-neutral-200 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setEditingProduct(null)}
                      className="px-4 py-2 border border-neutral-300 rounded-xl font-bold text-neutral-600 hover:bg-neutral-100 cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-neutral-950 text-white rounded-xl font-bold hover:bg-neutral-800 transition-colors flex items-center gap-1.5 cursor-pointer shadow-md"
                    >
                      <Save className="w-4 h-4" />
                      Salvar Camisa
                    </button>
                  </div>
                </form>
              ) : (
                /* Lista de Produtos */
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                      <h4 className="font-bold text-sm text-neutral-900">
                        Catálogo de Camisas Cadastradas
                      </h4>
                      <p className="text-xs text-neutral-500">
                        Você pode editar preços, fotos (upload direto), descrições ou cadastrar novas camisas masculinas e femininas.
                      </p>
                    </div>

                    <button
                      onClick={handleStartCreate}
                      className="px-4 py-2.5 bg-neutral-950 text-white rounded-xl font-bold text-xs hover:bg-neutral-800 transition-colors flex items-center gap-1.5 cursor-pointer shadow-md"
                    >
                      <Plus className="w-4 h-4" />
                      Adicionar Nova Camisa
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {products.map((prod) => (
                      <div
                        key={prod.id}
                        className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-xs flex gap-4 items-start"
                      >
                        <div className="relative w-20 h-24 bg-neutral-100 rounded-xl overflow-hidden shrink-0 border border-neutral-200">
                          <Image
                            src={prod.images[0]}
                            alt={prod.name}
                            fill
                            unoptimized={prod.images[0]?.startsWith('data:')}
                            className="object-cover"
                          />
                        </div>

                        <div className="flex-1 flex flex-col justify-between h-full">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                prod.gender === 'Masculino' ? 'bg-blue-100 text-blue-800' : 'bg-rose-100 text-rose-800'
                              }`}>
                                {prod.gender}
                              </span>
                              <span className="text-[10px] text-neutral-400">•</span>
                              <span className="text-[10px] text-neutral-600 font-bold bg-neutral-100 px-2 py-0.5 rounded-md">
                                {prod.category}
                              </span>
                            </div>
                            <h5 className="font-bold text-sm text-neutral-900 mt-1 line-clamp-1">
                              {prod.name}
                            </h5>
                            <div className="text-sm font-black text-neutral-950 font-mono mt-0.5">
                              R$ {prod.priceBRL.toFixed(2).replace('.', ',')}
                            </div>
                            <div className="text-[11px] text-neutral-500 mt-1">
                              Peso: {prod.weightGrams}g • {prod.variants.reduce((a, b) => a + b.stock, 0)} un. em estoque
                            </div>
                          </div>

                          <div className="flex gap-2 mt-3 pt-2 border-t border-neutral-100">
                            <button
                              onClick={() => handleStartEdit(prod)}
                              className="px-2.5 py-1 text-xs font-semibold bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <Edit2 className="w-3 h-3" /> Editar / Trocar Foto
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(prod.id)}
                              className="px-2.5 py-1 text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" /> Excluir
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================= ABA 2: GERENCIAR CATEGORIAS DOS FILTROS ================= */}
          {activeTab === 'categories' && (
            <div className="max-w-2xl mx-auto bg-white p-6 rounded-2xl border border-neutral-200 shadow-xs space-y-6">
              <div className="border-b border-neutral-200 pb-3">
                <h4 className="font-bold text-sm text-neutral-900 flex items-center gap-2">
                  <Tags className="w-4 h-4 text-amber-600" />
                  Gerenciador de Categorias dos Filtros
                </h4>
                <p className="text-xs text-neutral-500 mt-1">
                  Essas são exatamente as opções de categorias que aparecem na barra de filtros da loja (no catálogo). Você pode adicionar, renomear ou remover qualquer uma delas.
                </p>
              </div>

              {/* Form Adicionar Categoria */}
              <form onSubmit={handleAddCategory} className="space-y-2">
                <label className="font-bold text-neutral-700 block text-xs">
                  + Adicionar Nova Categoria:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCatInput}
                    onChange={(e) => setNewCatInput(e.target.value)}
                    placeholder="Ex: Camisa Jeans, Camisa Estampada, Camisa Seda, Camisa Cropped..."
                    className="flex-1 p-2.5 border border-neutral-300 rounded-xl bg-neutral-50 focus:bg-white text-xs font-medium"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-neutral-950 hover:bg-neutral-800 text-white font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    Adicionar Categoria
                  </button>
                </div>
              </form>

              {/* Lista das Categorias */}
              <div className="space-y-2 pt-2">
                <div className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                  Categorias Ativas ({currentCategories.length}):
                </div>

                <div className="space-y-2">
                  {currentCategories.map((cat, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 flex items-center justify-between gap-3"
                    >
                      {editingCatIndex === idx ? (
                        <div className="flex-1 flex gap-2">
                          <input
                            type="text"
                            value={editingCatValue}
                            onChange={(e) => setEditingCatValue(e.target.value)}
                            className="flex-1 p-1.5 border border-neutral-400 rounded-lg text-xs bg-white font-bold"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveEditedCategory(idx)}
                            className="p-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 cursor-pointer"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-neutral-200 text-neutral-700 font-bold flex items-center justify-center text-[10px]">
                            {idx + 1}
                          </span>
                          <span className="font-bold text-neutral-900 text-sm">{cat}</span>
                        </div>
                      )}

                      <div className="flex gap-1.5 shrink-0">
                        {editingCatIndex !== idx && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingCatIndex(idx);
                              setEditingCatValue(cat);
                            }}
                            className="p-1.5 bg-neutral-200 hover:bg-neutral-300 text-neutral-700 rounded-lg transition-colors cursor-pointer"
                            title="Renomear Categoria"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeleteCategory(idx)}
                          className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg transition-colors cursor-pointer"
                          title="Excluir Categoria"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ================= ABA DE LOG DE VENDAS & AUDITORIA ================= */}
          {activeTab === 'sales' && (
            <div className="space-y-6">
              {/* Header do Log de Vendas */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs">
                <div>
                  <h4 className="font-black text-base text-neutral-950 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                    Log de Vendas & Relatório Financeiro
                  </h4>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Histórico detalhado de compras, formas de pagamento e receita da CS CLOTHING STORE.
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleExportSalesCSV}
                    disabled={orders.length === 0}
                    className="px-4 py-2 bg-neutral-950 hover:bg-neutral-800 disabled:opacity-40 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-400" />
                    Exportar Planilha CSV
                  </button>
                </div>
              </div>

              {/* Cards de Métricas / KPIs */}
              {(() => {
                const totalRevenue = orders.reduce((acc, o) => acc + o.total, 0);
                const totalShirtsSubtotal = orders.reduce((acc, o) => acc + o.subtotal, 0);
                const totalShipping = orders.reduce((acc, o) => acc + o.shippingCost, 0);
                const totalShirtsSold = orders.reduce(
                  (acc, o) => acc + o.items.reduce((sum, it) => sum + it.quantity, 0),
                  0
                );
                const avgTicket = orders.length > 0 ? totalRevenue / orders.length : 0;

                return (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-xs">
                      <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider flex items-center justify-between">
                        <span>Faturamento Bruto</span>
                        <DollarSign className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div className="text-2xl font-black text-neutral-950 font-mono mt-1">
                        R$ {totalRevenue.toFixed(2).replace('.', ',')}
                      </div>
                      <div className="text-[11px] text-emerald-700 font-semibold mt-1">
                        R$ {totalShirtsSubtotal.toFixed(2).replace('.', ',')} em camisas
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-xs">
                      <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider flex items-center justify-between">
                        <span>Pedidos Concluídos</span>
                        <ShoppingBag className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="text-2xl font-black text-neutral-950 font-mono mt-1">
                        {orders.length}
                      </div>
                      <div className="text-[11px] text-neutral-500 mt-1">
                        Taxa de conversão 100% aprovada
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-xs">
                      <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider flex items-center justify-between">
                        <span>Camisas Vendidas</span>
                        <Package className="w-4 h-4 text-purple-600" />
                      </div>
                      <div className="text-2xl font-black text-neutral-950 font-mono mt-1">
                        {totalShirtsSold} peças
                      </div>
                      <div className="text-[11px] text-neutral-500 mt-1">
                        Despachadas via Jadlog
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-xs">
                      <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider flex items-center justify-between">
                        <span>Ticket Médio</span>
                        <BarChart3 className="w-4 h-4 text-amber-600" />
                      </div>
                      <div className="text-2xl font-black text-neutral-950 font-mono mt-1">
                        R$ {avgTicket.toFixed(2).replace('.', ',')}
                      </div>
                      <div className="text-[11px] text-neutral-500 mt-1">
                        R$ {totalShipping.toFixed(2).replace('.', ',')} em fretes Jadlog
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Tabela do Log de Vendas */}
              <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-xs">
                <div className="p-4 border-b border-neutral-200 flex justify-between items-center bg-neutral-50">
                  <span className="font-bold text-xs text-neutral-900 uppercase tracking-wider">
                    Registro de Transações ({orders.length})
                  </span>
                  <span className="text-[11px] text-neutral-500">
                    Ordenado por compras mais recentes
                  </span>
                </div>

                {orders.length === 0 ? (
                  <div className="p-12 text-center text-neutral-400 space-y-3">
                    <FileSpreadsheet className="w-12 h-12 mx-auto stroke-1" />
                    <p className="font-bold text-sm text-neutral-700">Nenhuma venda registrada até o momento.</p>
                    <p className="text-xs text-neutral-500">
                      Assim que um cliente concluir o checkout na loja, a venda e o frete Jadlog serão registrados aqui automaticamente.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-neutral-100 text-neutral-600 font-bold border-b border-neutral-200 text-[11px]">
                          <th className="py-3 px-3">Data / Hora</th>
                          <th className="py-3 px-3">Nº Pedido</th>
                          <th className="py-3 px-3">Cliente</th>
                          <th className="py-3 px-3">Cidade / UF</th>
                          <th className="py-3 px-3">Camisas Compradas</th>
                          <th className="py-3 px-3">Pagamento</th>
                          <th className="py-3 px-3 text-right">Subtotal</th>
                          <th className="py-3 px-3 text-right">Frete Jadlog</th>
                          <th className="py-3 px-3 text-right">Total</th>
                          <th className="py-3 px-3 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-200">
                        {orders.map((ord) => {
                          const dateObj = new Date(ord.createdAt);
                          const dateFormatted = dateObj.toLocaleDateString('pt-BR');
                          const timeFormatted = dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

                          return (
                            <tr key={ord.id} className="hover:bg-neutral-50 transition-colors">
                              <td className="py-3 px-3 font-mono text-[11px] text-neutral-500 whitespace-nowrap">
                                <div>{dateFormatted}</div>
                                <div className="text-[10px] text-neutral-400">{timeFormatted}</div>
                              </td>

                              <td className="py-3 px-3 font-mono font-bold text-neutral-900 whitespace-nowrap">
                                {ord.orderNumber}
                              </td>

                              <td className="py-3 px-3">
                                <div className="font-bold text-neutral-900">{ord.shippingAddress.fullName}</div>
                                <div className="text-[11px] text-neutral-500">{ord.shippingAddress.email}</div>
                              </td>

                              <td className="py-3 px-3 text-neutral-700 whitespace-nowrap">
                                <div>{ord.shippingAddress.city} / {ord.shippingAddress.state}</div>
                                <div className="text-[10px] text-neutral-400 font-mono">CEP: {ord.shippingAddress.postalCode}</div>
                              </td>

                              <td className="py-3 px-3">
                                <div className="space-y-0.5">
                                  {ord.items.map((it, i) => (
                                    <div key={i} className="text-neutral-800 line-clamp-1">
                                      <span className="font-bold text-neutral-950">{it.quantity}x</span> {it.product.name} ({it.variant.size})
                                    </div>
                                  ))}
                                </div>
                              </td>

                              <td className="py-3 px-3 whitespace-nowrap">
                                <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  ord.paymentMethod === 'Pix'
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                    : 'bg-blue-100 text-blue-800 border border-blue-300'
                                }`}>
                                  {ord.paymentMethod === 'Pix' ? <QrCode className="w-3 h-3" /> : <CreditCard className="w-3 h-3" />}
                                  {ord.paymentMethod || 'Pix'}
                                </span>
                              </td>

                              <td className="py-3 px-3 font-mono text-neutral-700 text-right whitespace-nowrap">
                                R$ {ord.subtotal.toFixed(2).replace('.', ',')}
                              </td>

                              <td className="py-3 px-3 font-mono text-emerald-700 font-semibold text-right whitespace-nowrap">
                                R$ {ord.shippingCost.toFixed(2).replace('.', ',')}
                              </td>

                              <td className="py-3 px-3 font-mono font-black text-neutral-950 text-right whitespace-nowrap">
                                R$ {ord.total.toFixed(2).replace('.', ',')}
                              </td>

                              <td className="py-3 px-3 text-center whitespace-nowrap">
                                <span className="bg-neutral-100 border border-neutral-300 text-neutral-800 text-[10px] font-bold px-2 py-0.5 rounded-md">
                                  {ord.status}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================= ABA 3: CONFIGURAÇÕES DO SITE ================= */}
          {activeTab === 'settings' && (
            <form onSubmit={handleSaveSettingsForm} className="max-w-3xl mx-auto bg-white p-6 rounded-2xl border border-neutral-200 shadow-xs space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 pb-3">
                <div>
                  <h4 className="font-bold text-sm text-neutral-900">
                    Textos e Identidade da Loja
                  </h4>
                  <p className="text-xs text-neutral-500">
                    Edite os títulos, contatos, avisos e parâmetros salvos permanentemente no servidor.
                  </p>
                </div>
                <button
                  type="submit"
                  className="px-5 py-2 bg-neutral-950 text-white rounded-xl text-xs font-bold hover:bg-neutral-800 transition-all flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <Save className="w-3.5 h-3.5" />
                  Salvar Alterações
                </button>
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">Nome da Loja:</label>
                <input
                  type="text"
                  required
                  value={tempSettings.storeName}
                  onChange={(e) => setTempSettings({ ...tempSettings, storeName: e.target.value })}
                  className="w-full p-2.5 border border-neutral-300 rounded-xl bg-neutral-50 focus:bg-white font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">Texto da Faixa Superior (Barra de Avisos da Loja):</label>
                <input
                  type="text"
                  required
                  value={tempSettings.topBannerText}
                  onChange={(e) => setTempSettings({ ...tempSettings, topBannerText: e.target.value })}
                  className="w-full p-2.5 border border-neutral-300 rounded-xl bg-neutral-50 focus:bg-white"
                />
              </div>

              {/* SEÇÃO REDES SOCIAIS & CONTATO (BOLINHAS FLUTUANTES) */}
              <div className="p-5 bg-gradient-to-br from-neutral-50 via-white to-emerald-50/30 rounded-2xl border border-neutral-300 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
                  <div>
                    <h5 className="font-bold text-sm text-neutral-900 flex items-center gap-2">
                      <span className="flex h-2.5 w-2.5 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                      </span>
                      Bolinhas Flutuantes da Home (WhatsApp & Instagram)
                    </h5>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Configure os contatos oficiais. Ao salvar, os botões flutuantes giratórios na página inicial e no rodapé atualizarão automaticamente.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* WhatsApp */}
                  <div className="p-4 bg-emerald-50/70 rounded-xl border border-emerald-200 space-y-2">
                    <label className="font-bold text-emerald-950 block text-xs flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-[#25D366] text-white flex items-center justify-center shrink-0 shadow-xs">
                          <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                            <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.669-.699c.969.53 1.83.812 2.791.812 3.179 0 5.767-2.587 5.767-5.766.001-3.187-2.575-5.771-5.767-5.771zm3.393 8.163c-.144.405-.837.774-1.17.823-.312.045-.694.06-1.109-.074-.702-.227-1.572-.733-2.348-1.509-.998-.997-1.446-2.029-1.606-2.532-.16-.503-.016-.838.139-.994.137-.137.306-.273.458-.273.153 0 .28.006.398.019.124.013.266-.051.411.298.156.377.534 1.302.581 1.398.047.096.078.208.016.332-.062.124-.093.203-.187.312-.093.109-.197.243-.281.326-.094.094-.192.196-.083.383.109.187.483.796 1.037 1.288.712.634 1.312.83 1.499.923.187.094.296.078.405-.047.109-.125.468-.545.593-.732.125-.187.25-.156.421-.093.172.062 1.09.514 1.277.608.187.094.312.14.359.219.046.078.046.452-.098.857z" />
                          </svg>
                        </div>
                        WhatsApp de Atendimento:
                      </span>
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: (11) 98765-4321 ou 11987654321"
                      value={tempSettings.whatsappNumber || ''}
                      onChange={(e) => setTempSettings({ ...tempSettings, whatsappNumber: e.target.value })}
                      className="w-full p-2.5 border border-emerald-300 rounded-lg bg-white font-mono text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                    <div className="flex items-center justify-between text-[11px] text-emerald-900 bg-emerald-100/60 p-2 rounded-lg">
                      <span className="font-semibold">Link da Bolinha:</span>
                      <span className="font-mono text-[10px] text-emerald-800 truncate max-w-[180px]">
                        wa.me/55{(tempSettings.whatsappNumber || '').replace(/\D/g, '').replace(/^55/, '') || '11987654321'}
                      </span>
                    </div>
                  </div>

                  {/* Instagram */}
                  <div className="p-4 bg-rose-50/70 rounded-xl border border-rose-200 space-y-2">
                    <label className="font-bold text-rose-950 block text-xs flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white flex items-center justify-center shrink-0 shadow-xs">
                          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                          </svg>
                        </div>
                        Instagram Oficial da Loja:
                      </span>
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: @csclothingstore ou csclothingstore"
                      value={tempSettings.instagramHandle || ''}
                      onChange={(e) => setTempSettings({ ...tempSettings, instagramHandle: e.target.value })}
                      className="w-full p-2.5 border border-rose-300 rounded-lg bg-white font-mono text-xs focus:ring-2 focus:ring-rose-500 outline-none"
                    />
                    <div className="flex items-center justify-between text-[11px] text-rose-950 bg-rose-100/60 p-2 rounded-lg">
                      <span className="font-semibold">Link da Bolinha:</span>
                      <span className="font-mono text-[10px] text-rose-900 truncate max-w-[180px]">
                        instagram.com/{(tempSettings.instagramHandle || '').replace('@', '').trim() || 'csclothingstore'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">Selo / Tag do Banner Principal:</label>
                <input
                  type="text"
                  value={tempSettings.heroBadge}
                  onChange={(e) => setTempSettings({ ...tempSettings, heroBadge: e.target.value })}
                  className="w-full p-2.5 border border-neutral-300 rounded-xl bg-neutral-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">Título de Destaque da Home:</label>
                <input
                  type="text"
                  value={tempSettings.heroTitle}
                  onChange={(e) => setTempSettings({ ...tempSettings, heroTitle: e.target.value })}
                  className="w-full p-2.5 border border-neutral-300 rounded-xl bg-neutral-50 focus:bg-white text-sm font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">Subtítulo / Descrição da Home:</label>
                <textarea
                  rows={2}
                  value={tempSettings.heroSubtitle}
                  onChange={(e) => setTempSettings({ ...tempSettings, heroSubtitle: e.target.value })}
                  className="w-full p-2.5 border border-neutral-300 rounded-xl bg-neutral-50 focus:bg-white"
                />
              </div>

              {/* Configurações Jadlog */}
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-3">
                <div className="font-bold text-emerald-950 flex items-center gap-2">
                  <Truck className="w-4 h-4 text-emerald-700" />
                  Parâmetros de Origem da Jadlog
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-emerald-900 block mb-1">CEP de Origem (Seu Armazém):</label>
                    <input
                      type="text"
                      value={tempSettings.jadlogOriginCep}
                      onChange={(e) => setTempSettings({ ...tempSettings, jadlogOriginCep: e.target.value })}
                      className="w-full p-2 border border-emerald-300 rounded-lg bg-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-emerald-900 block mb-1">Endereço de Coleta da Jadlog:</label>
                    <input
                      type="text"
                      value={tempSettings.jadlogPickupAddress}
                      onChange={(e) => setTempSettings({ ...tempSettings, jadlogPickupAddress: e.target.value })}
                      className="w-full p-2 border border-emerald-300 rounded-lg bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Barra de Vantagens da Loja (100% Editável & Gerenciável) */}
              <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-200 pb-3">
                  <div>
                    <div className="font-bold text-neutral-900 flex items-center gap-2 text-sm">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      Barra de Vantagens da Loja (Personalização & Ícones)
                    </div>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Você pode apagar e fazer sumir qualquer card, escolher novos ícones e cores, ou adicionar novos quando quiser.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={handleAddAdvantage}
                      className="px-3 py-1.5 bg-neutral-950 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" /> + Adicionar Card
                    </button>
                    <button
                      type="button"
                      onClick={handleRestoreDefaultAdvantages}
                      className="px-3 py-1.5 bg-white border border-neutral-300 hover:bg-neutral-100 text-neutral-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      title="Voltar para os 4 cards originais"
                    >
                      <RotateCcw className="w-3 h-3 text-neutral-500" /> Restaurar Padrões
                    </button>
                  </div>
                </div>

                {(tempSettings.advantages || defaultAdvantages).length === 0 ? (
                  <div className="p-8 text-center bg-white rounded-xl border border-dashed border-neutral-300 space-y-2">
                    <p className="text-xs font-bold text-neutral-600">Nenhum card ativo. A barra de vantagens está oculta no site.</p>
                    <button
                      type="button"
                      onClick={handleAddAdvantage}
                      className="px-4 py-2 bg-neutral-950 text-white rounded-xl text-xs font-bold"
                    >
                      + Criar Primeiro Card de Vantagem
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(tempSettings.advantages || defaultAdvantages).map((adv, idx) => {
                      const isEnabled = adv.enabled !== false;
                      const colorCls = getColorClasses(adv.color);

                      return (
                        <div
                          key={adv.id || idx}
                          className={`p-4 rounded-2xl border transition-all space-y-3 ${
                            isEnabled
                              ? 'bg-white border-neutral-200 shadow-2xs'
                              : 'bg-neutral-100/70 border-dashed border-neutral-300 opacity-60'
                          }`}
                        >
                          {/* Topo do Card com Status e Ações */}
                          <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-neutral-800">
                                Card #{idx + 1}
                              </span>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  isEnabled
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-neutral-200 text-neutral-600'
                                }`}
                              >
                                {isEnabled ? 'Ativo no Site' : 'Oculto / Sumido'}
                              </span>
                            </div>

                            <div className="flex items-center gap-1">
                              {/* Botão de Ocultar / Mostrar */}
                              <button
                                type="button"
                                onClick={() => handleToggleAdvantage(idx)}
                                className={`p-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                                  isEnabled
                                    ? 'hover:bg-neutral-100 text-neutral-600'
                                    : 'hover:bg-emerald-100 text-emerald-700'
                                }`}
                                title={isEnabled ? 'Ocultar / Fazer sumir temporariamente' : 'Ativar no site'}
                              >
                                {isEnabled ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                              </button>

                              {/* Botão de Apagar Definitivamente */}
                              <button
                                type="button"
                                onClick={() => handleDeleteAdvantage(idx)}
                                className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                                title="Apagar e sumir este card da barra"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Pré-visualização ao Vivo do Card */}
                          <div className="p-2.5 bg-neutral-50 rounded-xl border border-neutral-150 flex items-start gap-3">
                            <div className={`p-2 rounded-xl shrink-0 ${colorCls}`}>
                              <AdvantageIcon iconId={adv.icon} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="font-bold text-xs text-neutral-900 truncate">
                                {adv.title || '(Título vazio - não aparecerá)'}
                              </div>
                              <div className="text-[11px] text-neutral-500 line-clamp-1">
                                {adv.description || '(Sem descrição)'}
                              </div>
                            </div>
                          </div>

                          {/* Seleção do Ícone e Cor */}
                          <div className="grid grid-cols-2 gap-2.5">
                            <div>
                              <label className="text-[11px] font-bold text-neutral-700 block mb-1">
                                Escolher Ícone:
                              </label>
                              <select
                                value={adv.icon || 'truck'}
                                onChange={(e) => handleUpdateAdvantage(idx, 'icon', e.target.value)}
                                className="w-full p-2 border border-neutral-300 rounded-lg text-xs font-semibold bg-white cursor-pointer"
                              >
                                {AVAILABLE_ICONS.map((opt) => (
                                  <option key={opt.id} value={opt.id}>
                                    {opt.label}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="text-[11px] font-bold text-neutral-700 block mb-1">
                                Cor do Círculo:
                              </label>
                              <select
                                value={adv.color || 'emerald'}
                                onChange={(e) => handleUpdateAdvantage(idx, 'color', e.target.value)}
                                className="w-full p-2 border border-neutral-300 rounded-lg text-xs font-semibold bg-white cursor-pointer"
                              >
                                {AVAILABLE_COLORS.map((col) => (
                                  <option key={col.id} value={col.id}>
                                    {col.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>

                          {/* Título e Descrição */}
                          <div>
                            <label className="text-[11px] font-bold text-neutral-700 block mb-1">
                              Título do Card:
                            </label>
                            <input
                              type="text"
                              value={adv.title}
                              onChange={(e) => handleUpdateAdvantage(idx, 'title', e.target.value)}
                              placeholder="Ex: Envio Oficial JADLOG, Camisaria Fina..."
                              className="w-full p-2 border border-neutral-300 rounded-lg text-xs font-bold bg-neutral-50 focus:bg-white"
                            />
                          </div>

                          <div>
                            <label className="text-[11px] font-bold text-neutral-700 block mb-1">
                              Descrição / Detalhe:
                            </label>
                            <textarea
                              rows={2}
                              value={adv.description}
                              onChange={(e) => handleUpdateAdvantage(idx, 'description', e.target.value)}
                              placeholder="Breve explicação exibida logo abaixo do título..."
                              className="w-full p-2 border border-neutral-300 rounded-lg text-xs bg-neutral-50 focus:bg-white"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Integração Oficial Mercado Pago (PIX com QR Code) */}
              <div className="p-4 bg-sky-50/80 rounded-2xl border border-sky-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-sky-950 flex items-center gap-2 text-sm">
                    <QrCode className="w-4 h-4 text-sky-600" />
                    Integração Mercado Pago (PIX com QR Code Automático)
                  </div>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                    Homologado • Endpoint /v1/payments
                  </span>
                </div>
                <p className="text-xs text-sky-900 leading-relaxed">
                  Gera QR Codes dinâmicos reais e código Pix "Copia e Cola" instantâneo na finalização do pedido via API do Mercado Pago.
                </p>
                <div>
                  <label className="font-semibold text-sky-950 block mb-1 text-xs">
                    Access Token de Produção / Homologação (Bearer Token):
                  </label>
                  <input
                    type="password"
                    value={tempSettings.mercadoPagoAccessToken || 'APP_USR-3345611795216825-031010-c151d4812a4f61dac62f4135483553a6-214542459'}
                    onChange={(e) => setTempSettings({ ...tempSettings, mercadoPagoAccessToken: e.target.value })}
                    className="w-full p-2 border border-sky-300 rounded-lg bg-white font-mono text-xs"
                    placeholder="APP_USR-..."
                  />
                  <div className="mt-1.5 flex flex-wrap items-center justify-between gap-1 text-[11px] text-sky-700">
                    <span>Token ativo configurado com suporte a chave Idempotency e confirmação em tempo real.</span>
                    <a
                      href="https://www.mercadopago.com.br/developers/panel/app"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline font-bold hover:text-sky-950"
                    >
                      Painel de Desenvolvedores Mercado Pago ↗
                    </a>
                  </div>
                </div>
              </div>

              {/* Credenciais de Acesso ADM */}
              <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200 space-y-3">
                <div className="font-bold text-amber-950 flex items-center gap-2 text-sm">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  Segurança & Senha de Acesso do Administrador
                </div>
                <p className="text-xs text-neutral-600">
                  Altere o usuário e a senha para acessar este painel com total segurança e privacidade.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-neutral-700 block mb-1 text-xs">Usuário ADM:</label>
                    <input
                      type="text"
                      value={tempSettings.adminUsername || 'admin'}
                      onChange={(e) => setTempSettings({ ...tempSettings, adminUsername: e.target.value })}
                      className="w-full p-2 border border-neutral-300 rounded-lg bg-white text-xs font-medium"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-neutral-700 block mb-1 text-xs">Senha de Acesso ADM:</label>
                    <input
                      type="text"
                      value={tempSettings.adminPassword || 'admin'}
                      onChange={(e) => setTempSettings({ ...tempSettings, adminPassword: e.target.value })}
                      className="w-full p-2 border border-neutral-300 rounded-lg bg-white text-xs font-mono"
                      placeholder="Digite a nova senha..."
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Deseja restaurar as configurações e catálogo padrão originais?')) {
                      onResetToDefault();
                      triggerSuccess('Configurações originais restauradas com sucesso!');
                    }
                  }}
                  className="text-rose-600 hover:text-rose-800 underline font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Restaurar Padrões da Loja
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-neutral-950 text-white rounded-xl font-bold hover:bg-neutral-800 transition-colors flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <Save className="w-4 h-4" />
                  Salvar Textos do Site
                </button>
              </div>
            </form>
          )}

          {/* ================= ABA 4: PEDIDOS & JADLOG ================= */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <div className="flex flex-wrap justify-between items-center gap-2">
                <div>
                  <h4 className="font-bold text-sm text-neutral-900">
                    Pedidos & Fila de Expedição Jadlog
                  </h4>
                  <p className="text-xs text-neutral-500">
                    Acompanhe os pedidos de camisas feitos na loja e despache pela Jadlog (.Package ou .Com).
                  </p>
                </div>
                {orders.length > 0 && onClearAllOrders && (
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('Tem certeza que deseja apagar TODOS os pedidos da lista?')) {
                        onClearAllOrders();
                        triggerSuccess('Todos os pedidos foram removidos com sucesso!');
                      }
                    }}
                    className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
                    title="Excluir todos os pedidos de teste"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                    <span>Limpar Todos os Pedidos</span>
                  </button>
                )}
              </div>

              {orders.length === 0 ? (
                <div className="bg-white p-12 rounded-2xl border border-neutral-200 text-center space-y-2 text-neutral-400">
                  <Package className="w-10 h-10 mx-auto stroke-1" />
                  <p className="font-bold text-neutral-700">Nenhum pedido realizado ainda.</p>
                  <p className="text-xs">Assim que um cliente comprar no site, o pedido aparecerá aqui com o código de rastreamento Jadlog.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map((ord) => (
                    <div key={ord.id} className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-xs space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-100 pb-2">
                        <div>
                          <span className="font-bold text-sm text-neutral-950">{ord.orderNumber}</span>
                          <span className="text-neutral-400 mx-2">•</span>
                          <span className="text-neutral-500">{new Date(ord.createdAt).toLocaleDateString('pt-BR')} às {new Date(ord.createdAt).toLocaleTimeString('pt-BR')}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-semibold text-neutral-500">Status:</span>
                          <select
                            value={ord.status}
                            onChange={(e) => onUpdateOrderStatus(ord.id, e.target.value as any)}
                            className="p-1 border border-neutral-300 rounded font-bold bg-neutral-50 text-neutral-900"
                          >
                            <option value="Pendente">Pendente</option>
                            <option value="Pago">Pago</option>
                            <option value="Pronto para Coleta">Pronto para Coleta</option>
                            <option value="Em Trânsito Jadlog">Em Trânsito Jadlog</option>
                            <option value="Entregue">Entregue</option>
                          </select>
                          {ord.status === 'Pendente' && (
                            <button
                              type="button"
                              onClick={() => onUpdateOrderStatus(ord.id, 'Pago')}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold transition-all cursor-pointer shadow-xs flex items-center gap-1"
                              title="Confirmar que o pagamento deste pedido foi recebido"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Aprovar Pagamento
                            </button>
                          )}
                          {onDeleteOrder && (
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm(`Deseja excluir definitivamente o pedido ${ord.orderNumber}?`)) {
                                  onDeleteOrder(ord.id);
                                  triggerSuccess(`Pedido ${ord.orderNumber} excluído!`);
                                }
                              }}
                              className="p-1 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                              title="Excluir este pedido"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <div className="text-[10px] text-neutral-400 uppercase font-semibold">Cliente & Destino:</div>
                          <div className="font-bold text-neutral-900">{ord.shippingAddress.fullName}</div>
                          <div className="text-neutral-600">{ord.shippingAddress.street}, {ord.shippingAddress.number}</div>
                          <div className="text-neutral-600">{ord.shippingAddress.city} / {ord.shippingAddress.state} - CEP: {ord.shippingAddress.postalCode}</div>
                        </div>

                        <div>
                          <div className="text-[10px] text-neutral-400 uppercase font-semibold">Camisas do Pedido:</div>
                          <div className="space-y-1">
                            {ord.items.map((it, i) => (
                              <div key={i} className="text-neutral-700">
                                <strong>{it.quantity}x</strong> {it.product.name} ({it.variant.size} - {it.variant.color})
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                          <div className="text-[10px] text-emerald-800 uppercase font-bold">Transportadora Oficial:</div>
                          <div className="font-bold text-emerald-950">{ord.selectedRate.serviceName}</div>
                          <div className="text-neutral-700 font-mono mt-1">
                            Rastreio: <strong>{ord.trackingNumber}</strong>
                          </div>
                          <div className="font-black text-sm text-neutral-950 font-mono mt-1">
                            Total: R$ {ord.total.toFixed(2).replace('.', ',')}
                          </div>
                        </div>
                      </div>

                      {/* Barra de Ações Rápidas de Expedição Jadlog */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-neutral-100">
                        <div className="flex items-center gap-1.5 text-[11px] text-neutral-500">
                          <Truck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Expedição Jadlog:</span>
                          <span className="font-mono font-bold text-neutral-800 bg-neutral-100 px-1.5 py-0.5 rounded">
                            {ord.trackingNumber}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleCopyDispatchInfo(ord)}
                            className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
                            title="Copiar dados formatados para colar no sistema ou balcão da Jadlog"
                          >
                            {copiedOrderId === ord.id ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span className="text-emerald-700">Copiado!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5 text-neutral-500" />
                                <span>Copiar Dados de Envio</span>
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => setPrintingOrder(ord)}
                            className="px-3 py-1.5 bg-neutral-950 hover:bg-neutral-800 text-white rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
                            title="Visualizar e imprimir a etiqueta de envio padrão Jadlog"
                          >
                            <Printer className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Imprimir Etiqueta Jadlog</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal de Etiqueta de Envio Jadlog para Impressão */}
      {printingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-neutral-300 my-6">
            {/* Cabeçalho do Modal de Impressão */}
            <div className="bg-neutral-950 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Printer className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-sm">Etiqueta de Envio Jadlog</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Imprimir (Ctrl+P)
                </button>
                <button
                  type="button"
                  onClick={() => setPrintingOrder(null)}
                  className="p-1 rounded-lg text-neutral-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Corpo da Etiqueta Padrão de Despacho */}
            <div className="p-6 bg-white space-y-4 font-sans text-xs text-neutral-900 border-b border-neutral-200">
              <div className="border-2 border-neutral-950 p-4 rounded-xl space-y-4">
                <div className="flex items-center justify-between border-b-2 border-neutral-950 pb-3">
                  <div>
                    <span className="font-black text-base uppercase tracking-wider block font-mono">
                      {siteSettings.storeName}
                    </span>
                    <span className="text-[10px] text-neutral-600 block">Camisaria Especializada</span>
                  </div>
                  <div className="text-right">
                    <span className="inline-block bg-neutral-950 text-white text-[11px] font-black px-2.5 py-1 rounded uppercase tracking-wider">
                      {printingOrder.selectedRate.serviceName}
                    </span>
                    <span className="block text-[10px] font-mono text-neutral-500 mt-0.5">
                      Pedido: {printingOrder.orderNumber}
                    </span>
                  </div>
                </div>

                {/* Código de Rastreamento & Código de Barras Visual */}
                <div className="bg-neutral-50 p-3 rounded-lg border border-neutral-300 text-center space-y-1.5">
                  <span className="text-[10px] text-neutral-500 uppercase font-bold tracking-wider block">
                    Código de Postagem / Rastreio Jadlog:
                  </span>
                  <div className="font-mono text-lg font-black tracking-widest text-neutral-950">
                    {printingOrder.trackingNumber}
                  </div>
                  {/* Barras de Código de Barras Representativas em SVG */}
                  <div className="h-10 w-full flex items-center justify-center gap-0.5 px-4 overflow-hidden">
                    {[1, 3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 1, 2, 4, 1, 2, 3, 1, 4, 2, 1, 3, 2, 1, 4, 1, 2, 3, 1].map((w, i) => (
                      <div key={i} className="h-full bg-neutral-950" style={{ width: `${w * 2.5}px` }} />
                    ))}
                  </div>
                </div>

                {/* DESTINATÁRIO (Destaque Principal) */}
                <div className="border-2 border-neutral-950 p-3.5 rounded-lg space-y-1">
                  <div className="text-[10px] font-black uppercase text-white bg-neutral-950 px-2 py-0.5 rounded inline-block">
                    DESTINATÁRIO:
                  </div>
                  <div className="text-sm font-black text-neutral-950 mt-1">
                    {printingOrder.shippingAddress.fullName}
                  </div>
                  <div className="text-xs text-neutral-800">
                    {printingOrder.shippingAddress.street}, {printingOrder.shippingAddress.number}
                    {printingOrder.shippingAddress.complement ? ` - ${printingOrder.shippingAddress.complement}` : ''}
                  </div>
                  <div className="text-xs text-neutral-800">
                    {printingOrder.shippingAddress.city} / {printingOrder.shippingAddress.state}
                  </div>
                  <div className="text-base font-black font-mono tracking-wider text-neutral-950 pt-1">
                    CEP: {printingOrder.shippingAddress.postalCode}
                  </div>
                  {printingOrder.shippingAddress.phone && (
                    <div className="text-[11px] text-neutral-600">
                      Contato: {printingOrder.shippingAddress.phone}
                    </div>
                  )}
                </div>

                {/* REMETENTE */}
                <div className="border border-neutral-300 p-2.5 rounded-lg text-[11px] space-y-0.5 bg-neutral-50 text-neutral-700">
                  <span className="font-bold text-neutral-900 block text-[10px] uppercase">REMETENTE:</span>
                  <div>{siteSettings.storeName}</div>
                  <div>{siteSettings.jadlogPickupAddress || 'Rua Augusta, 1400 - São Paulo - SP'}</div>
                  <div className="font-mono">CEP: {siteSettings.jadlogOriginCep || '01310-100'}</div>
                </div>

                {/* DECLARAÇÃO DE CONTEÚDO RESUMIDA */}
                <div className="border border-dashed border-neutral-300 p-2.5 rounded-lg text-[10px] space-y-1 text-neutral-600">
                  <div className="font-bold text-neutral-800 uppercase flex justify-between">
                    <span>Conteúdo da Encomenda (Vestuário):</span>
                    <span>Peso Total: ~{(printingOrder.items.reduce((acc, it) => acc + (it.product.weightGrams * it.quantity), 0) / 1000).toFixed(2)} kg</span>
                  </div>
                  <div className="space-y-0.5 font-mono text-[9px]">
                    {printingOrder.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span>{it.quantity}x {it.product.name} ({it.variant.size} - {it.variant.color})</span>
                        <span>R$ {(it.product.priceBRL * it.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Rodapé com Instruções de Despacho */}
            <div className="p-4 bg-neutral-50 flex items-center justify-between text-xs text-neutral-500">
              <span>Cole esta etiqueta no envelope flyer de segurança (32x24cm).</span>
              <button
                type="button"
                onClick={() => setPrintingOrder(null)}
                className="px-4 py-1.5 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 rounded-lg font-bold cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
