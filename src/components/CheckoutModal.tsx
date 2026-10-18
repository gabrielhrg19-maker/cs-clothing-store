'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import {
  X,
  CreditCard,
  Lock,
  Truck,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  QrCode,
  Copy,
  Check,
  RefreshCw,
  AlertCircle,
  Clock,
  Sparkles,
  ExternalLink,
  ChevronLeft,
} from 'lucide-react';
import { CartItem, ShippingRate, Order } from '../types/store';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  selectedRate: ShippingRate | null;
  postalCode: string;
  onOrderCompleted: (order: Order) => void;
  mercadoPagoAccessToken?: string;
  isAdminLoggedIn?: boolean;
}

interface PixData {
  id: number;
  qrCode: string;
  qrCodeBase64: string;
  ticketUrl?: string;
  status: string;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  selectedRate,
  postalCode,
  onOrderCompleted,
  mercadoPagoAccessToken,
  isAdminLoggedIn,
}) => {
  // Dados do formulário
  const [fullName, setFullName] = useState('Marcos Silva Pereira');
  const [email, setEmail] = useState('marcos.silva@exemplo.com');
  const [phone, setPhone] = useState('(11) 98877-6655');
  const [street, setStreet] = useState('Av. Paulista');
  const [number, setNumber] = useState('1578');
  const [complement, setComplement] = useState('Apto 84');
  const [city, setCity] = useState('São Paulo');
  const [state, setState] = useState('SP');
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'card'>('pix');

  // Dados do Cartão
  const [cardNumber, setCardNumber] = useState('•••• •••• •••• 4242');
  const [cardName, setCardName] = useState('MARCOS S PEREIRA');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('888');
  const [cardInstallments, setCardInstallments] = useState('1');

  // Estados de Fluxo
  const [step, setStep] = useState<'form' | 'pix_screen' | 'success'>('form');
  const [isProcessing, setIsProcessing] = useState(false);
  const [pixData, setPixData] = useState<PixData | null>(null);
  const [pixError, setPixError] = useState('');
  const [copiedPix, setCopiedPix] = useState(false);
  const [countdown, setCountdown] = useState(900); // 15 minutos
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [paymentNotification, setPaymentNotification] = useState<{
    type: 'pending' | 'error';
    title: string;
    message: string;
  } | null>(null);

  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // Limpar estados ao fechar ou abrir
  useEffect(() => {
    if (!isOpen) {
      if (pollingRef.current) clearInterval(pollingRef.current);
      setStep('form');
      setIsProcessing(false);
      setPixData(null);
      setPixError('');
      setCopiedPix(false);
      setCountdown(900);
      setCreatedOrder(null);
      setPaymentNotification(null);
    }
  }, [isOpen]);

  // Contagem regressiva de expiração do Pix
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 'pix_screen' && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  // Polling automático de verificação de pagamento Pix via Mercado Pago
  useEffect(() => {
    if (step === 'pix_screen' && pixData?.id) {
      pollingRef.current = setInterval(async () => {
        try {
          const res = await fetch(
            `/api/mercadopago/pix?id=${pixData.id}&token=${encodeURIComponent(
              mercadoPagoAccessToken || ''
            )}`
          );
          if (res.ok) {
            const data = await res.json();
            if (data.isPaid || data.status === 'approved') {
              if (pollingRef.current) clearInterval(pollingRef.current);
              handleFinalizeOrder('Pix', pixData.id.toString(), pixData.qrCode);
            }
          }
        } catch (e) {
          console.error('Erro na checagem automática do Pix:', e);
        }
      }, 4000);
    }

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [step, pixData, mercadoPagoAccessToken]);

  if (!isOpen) return null;

  const subtotalBRL = items.reduce((acc, it) => acc + it.product.priceBRL * it.quantity, 0);
  const shippingPrice = selectedRate ? selectedRate.priceBRL : 0;
  const total = subtotalBRL + shippingPrice;

  // Finalização do pedido e criação do registro
  const handleFinalizeOrder = (method: 'Pix' | 'Cartão de Crédito', pixId?: string, pixCode?: string) => {
    const orderNum = `#CS-${Math.floor(1000 + Math.random() * 9000)}`;
    const trackingCode = `JADBR${Math.floor(100000000 + Math.random() * 900000000)}`;

    const order: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: orderNum,
      createdAt: new Date().toISOString(),
      items,
      shippingAddress: {
        fullName,
        email,
        phone,
        postalCode,
        state,
        city,
        street,
        number,
        complement,
      },
      selectedRate: selectedRate || {
        id: 'jad-package',
        carrier: 'Jadlog',
        serviceName: 'Jadlog .Package',
        serviceCode: '.PACKAGE',
        priceBRL: 24.9,
        estimatedDays: '3 a 6 dias úteis',
        logoBadge: 'Jadlog .Package',
      },
      subtotal: subtotalBRL,
      shippingCost: shippingPrice,
      total,
      status: 'Pronto para Coleta',
      trackingNumber: trackingCode,
      paymentMethod: method,
      pixPaymentId: pixId,
      pixQrCode: pixCode,
    };

    setCreatedOrder(order);
    setStep('success');
    onOrderCompleted(order);
  };

  // Submissão do formulário de checkout
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();

    if (paymentMethod === 'card') {
      setIsProcessing(true);
      setTimeout(() => {
        setIsProcessing(false);
        handleFinalizeOrder('Cartão de Crédito');
      }, 1500);
      return;
    }

    // Se for PIX, chamamos a API oficial do Mercado Pago para gerar o QR Code
    setIsProcessing(true);
    setPixError('');

    try {
      const names = fullName.trim().split(' ');
      const firstName = names[0] || 'Cliente';
      const lastName = names.slice(1).join(' ') || 'CS Clothing';

      const res = await fetch('/api/mercadopago/pix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: total,
          description: `Pedido CS Clothing Store - ${items.length} camisa(s)`,
          email,
          firstName,
          lastName,
          customToken: mercadoPagoAccessToken,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Falha ao gerar o QR Code Pix no Mercado Pago.');
      }

      setPixData({
        id: data.id,
        qrCode: data.qrCode,
        qrCodeBase64: data.qrCodeBase64,
        ticketUrl: data.ticketUrl,
        status: data.status,
      });

      setCountdown(900);
      setStep('pix_screen');
    } catch (err: any) {
      console.error(err);
      setPixError(err.message || 'Erro ao conectar ao Mercado Pago. Tente novamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Copiar código Pix para a área de transferência
  const handleCopyPix = () => {
    if (!pixData?.qrCode) return;
    navigator.clipboard.writeText(pixData.qrCode);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 2500);
  };

  // Verificação manual imediata (Confirmar se já está pago)
  const handleManualCheck = async () => {
    if (!pixData?.id) return;
    setIsCheckingStatus(true);
    setPaymentNotification(null);
    try {
      const res = await fetch(
        `/api/mercadopago/pix?id=${pixData.id}&token=${encodeURIComponent(
          mercadoPagoAccessToken || ''
        )}`
      );
      if (res.ok) {
        const data = await res.json();
        if (data.isPaid || data.status === 'approved') {
          handleFinalizeOrder('Pix', pixData.id.toString(), pixData.qrCode);
          return;
        }
      }
      setPaymentNotification({
        type: 'pending',
        title: 'Pagamento ainda não identificado',
        message:
          'O Mercado Pago ainda está processando a compensação do seu Pix. Se você já realizou a transferência pelo aplicativo do seu banco, o sistema reconhece em poucos segundos. Aguarde um instante e tente confirmar novamente.',
      });
    } catch (e) {
      setPaymentNotification({
        type: 'error',
        title: 'Não foi possível verificar no momento',
        message:
          'Houve uma instabilidade momentânea na conexão com o sistema do banco. Por favor, aguarde alguns instantes e tente novamente.',
      });
    } finally {
      setIsCheckingStatus(false);
    }
  };

  // Formatação do tempo MM:SS
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#10111a] rounded-3xl shadow-2xl overflow-hidden my-6 border border-neutral-200 dark:border-neutral-800">
        {/* Header do Checkout */}
        <div className="bg-neutral-100 dark:bg-[#090a0f] text-neutral-950 dark:text-white p-5 flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-bold text-base text-neutral-950 dark:text-white">
              {step === 'pix_screen' ? 'Pagamento PIX Instantâneo' : 'Checkout Seguro SSL'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-500 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ================= ESTADO 1: TELA DO PIX COM QR CODE OFICIAL ================= */}
        {step === 'pix_screen' && pixData && (
          <div className="p-6 sm:p-8 space-y-6 text-center max-h-[85vh] overflow-y-auto">
            {/* Cabeçalho do Pix */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-3.5 py-1 rounded-full text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>Aguardando Pagamento • Expira em {formatTime(countdown)}</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-neutral-950 dark:text-white tracking-tight">
                Pague com QR Code ou Pix Copia e Cola
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-md mx-auto">
                Abra o aplicativo do seu banco ou carteira digital, escolha pagar com Pix e aponte a câmera para o QR Code abaixo.
              </p>
            </div>

            {/* Valor em Destaque */}
            <div className="p-4 bg-emerald-50 dark:bg-[#181926] text-emerald-950 dark:text-white rounded-2xl max-w-sm mx-auto shadow-xs flex items-center justify-between px-6 border border-emerald-200 dark:border-neutral-800">
              <div className="text-left">
                <span className="text-[10px] uppercase tracking-wider text-emerald-700 dark:text-neutral-400 font-bold block">
                  Valor Total do Pedido
                </span>
                <span className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold">
                  Frete Jadlog incluso
                </span>
              </div>
              <div className="text-xl sm:text-2xl font-mono font-black text-emerald-950 dark:text-white">
                R$ {total.toFixed(2).replace('.', ',')}
              </div>
            </div>

            {/* Imagem Oficial do QR Code Base64 retornado pelo Mercado Pago */}
            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="relative p-3 bg-white rounded-2xl border-2 border-emerald-500/40 shadow-xl inline-block">
                {pixData.qrCodeBase64 ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={
                      pixData.qrCodeBase64.startsWith('data:')
                        ? pixData.qrCodeBase64
                        : `data:image/png;base64,${pixData.qrCodeBase64}`
                    }
                    alt="QR Code Pix Mercado Pago"
                    className="w-56 h-56 sm:w-64 sm:h-64 object-contain rounded-xl"
                  />
                ) : (
                  <div className="w-56 h-56 flex items-center justify-center bg-neutral-100 rounded-xl">
                    <QrCode className="w-16 h-16 text-neutral-400 animate-pulse" />
                  </div>
                )}

                <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-neutral-950 text-white px-3 py-0.5 rounded-full text-[10px] font-mono tracking-wider font-bold shadow-md">
                  MERCADO PAGO
                </div>
              </div>

              <span className="text-[11px] text-neutral-400 font-medium">
                ID do Pagamento: <strong className="text-neutral-700 dark:text-neutral-300">{pixData.id}</strong>
              </span>
            </div>

            {/* Pix Copia e Cola */}
            <div className="max-w-md mx-auto space-y-2 text-left">
              <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200 flex items-center justify-between">
                <span>Código Pix (Copia e Cola):</span>
                <span className="text-[10px] text-neutral-500 dark:text-neutral-400 font-normal">Clique abaixo para copiar</span>
              </label>

              <div className="relative">
                <textarea
                  readOnly
                  rows={2}
                  value={pixData.qrCode}
                  className="w-full p-2.5 pr-20 text-[11px] font-mono bg-neutral-50 dark:bg-[#161724] border border-neutral-300 dark:border-neutral-700 rounded-xl text-neutral-700 dark:text-neutral-200 select-all focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleCopyPix}
                  className={`absolute right-2 top-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer ${
                    copiedPix
                      ? 'bg-emerald-600 text-white'
                      : 'bg-neutral-950 dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-200 text-white dark:text-neutral-950'
                  }`}
                >
                  {copiedPix ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Status de Polling & Ações */}
            <div className="max-w-md mx-auto pt-2 space-y-3">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300 text-xs flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 text-emerald-600 dark:text-emerald-400 animate-spin" />
                <span>Identificando pagamento automaticamente em tempo real...</span>
              </div>

              {/* Notificação Customizada de Status (Substitui o alert feio do navegador) */}
              {paymentNotification && (
                <div
                  className={`p-4 rounded-2xl border text-xs space-y-2.5 shadow-md transition-all animate-in fade-in slide-in-from-top-2 duration-200 ${
                    paymentNotification.type === 'pending'
                      ? 'bg-amber-50/95 border-amber-300 text-amber-950'
                      : 'bg-rose-50/95 border-rose-300 text-rose-950'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 font-bold text-sm">
                      <Clock className="w-4 h-4 text-amber-600 animate-pulse shrink-0" />
                      <span>{paymentNotification.title}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPaymentNotification(null)}
                      className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="leading-relaxed text-neutral-700">
                    {paymentNotification.message}
                  </p>

                  {/* Se for o Lojista/Admin conectado, opção de aprovação para teste no painel */}
                  {isAdminLoggedIn && (
                    <div className="pt-2 border-t border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <span className="text-[11px] text-amber-900 font-semibold flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        Ambiente de Testes (Admin)
                      </span>
                      <button
                        type="button"
                        onClick={() => handleFinalizeOrder('Pix', pixData.id.toString(), pixData.qrCode)}
                        className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-[11px] font-bold transition-all cursor-pointer shadow-xs"
                      >
                        Aprovar Pedido Agora (Admin)
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Botão Principal: Confirmar se já está pago */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleManualCheck}
                  disabled={isCheckingStatus}
                  className="w-full py-3.5 bg-neutral-950 dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-200 disabled:opacity-50 text-white dark:text-neutral-950 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-[0.99]"
                >
                  {isCheckingStatus ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-emerald-400 dark:text-emerald-600" />
                      <span>Verificando com o Mercado Pago...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
                      <span>Confirmar se já está pago</span>
                    </>
                  )}
                </button>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setStep('form')}
                  className="text-xs text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-white underline font-semibold flex items-center gap-1 mx-auto cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> Voltar e alterar forma de pagamento
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= ESTADO 2: SUCESSO DO PEDIDO ================= */}
        {step === 'success' && createdOrder && (
          <div className="p-6 sm:p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-neutral-950 dark:text-white tracking-tight">
              Pagamento Confirmado & Pedido Emitido!
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 max-w-md mx-auto">
              Seu pedido <strong>{createdOrder.orderNumber}</strong> foi aprovado com sucesso. As camisas já foram enviadas para conferência e despacho pela <strong>Jadlog</strong>.
            </p>

            <div className="p-4 bg-neutral-50 dark:bg-[#161724] rounded-2xl border border-neutral-200 dark:border-neutral-800 max-w-md mx-auto text-xs text-left space-y-2.5 font-mono">
              <div className="flex justify-between">
                <span className="text-neutral-500 dark:text-neutral-400 font-sans">Forma de Pagamento:</span>
                <span className="font-bold text-neutral-950 dark:text-white font-sans">{createdOrder.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500 dark:text-neutral-400 font-sans">Modalidade Jadlog:</span>
                <span className="font-bold text-neutral-900 dark:text-neutral-200 font-sans">{createdOrder.selectedRate.serviceName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500 dark:text-neutral-400 font-sans">Código de Rastreamento:</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-400">{createdOrder.trackingNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500 dark:text-neutral-400 font-sans">Previsão de Entrega:</span>
                <span className="font-bold text-neutral-900 dark:text-neutral-200 font-sans">{createdOrder.selectedRate.estimatedDays}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-neutral-200 dark:border-neutral-800">
                <span className="text-neutral-500 dark:text-neutral-400 font-sans">Total Pago:</span>
                <span className="font-bold text-neutral-950 dark:text-white text-sm">
                  R$ {createdOrder.total.toFixed(2).replace('.', ',')}
                </span>
              </div>
            </div>

            <div className="pt-4 flex justify-center gap-3">
              <button
                onClick={onClose}
                className="px-8 py-3 bg-neutral-950 dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-200 text-white dark:text-neutral-950 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer uppercase tracking-wider"
              >
                <span>Concluir e Voltar à Loja</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ================= ESTADO 3: FORMULÁRIO INICIAL DE CHECKOUT ================= */}
        {step === 'form' && (
          <form onSubmit={handleSubmitForm} className="p-6 space-y-6 text-xs max-h-[82vh] overflow-y-auto">
            {/* Mensagem de Erro do Pix se houver */}
            {pixError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Atenção:</span> {pixError}
                </div>
              </div>
            )}

            {/* Resumo do Frete Jadlog */}
            {selectedRate && (
              <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-emerald-600 text-white shrink-0">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-emerald-950 dark:text-emerald-200">{selectedRate.serviceName}</div>
                    <div className="text-[11px] text-emerald-800 dark:text-emerald-400">
                      Prazo: {selectedRate.estimatedDays} • Seguro ad valorem incluso
                    </div>
                  </div>
                </div>
                <div className="font-bold font-mono text-sm text-emerald-950 dark:text-emerald-200 shrink-0">
                  R$ {selectedRate.priceBRL.toFixed(2).replace('.', ',')}
                </div>
              </div>
            )}

            {/* Dados do Cliente */}
            <div className="space-y-3">
              <h4 className="font-bold text-sm text-neutral-900 dark:text-white border-b border-neutral-200 dark:border-neutral-800 pb-1.5">
                1. Informações de Entrega (Brasil)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-neutral-700 dark:text-neutral-300 block mb-1">Nome Completo:</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full p-2.5 border border-neutral-300 dark:border-neutral-700 rounded-xl bg-white dark:bg-[#161724] text-neutral-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-neutral-700 dark:text-neutral-300 block mb-1">E-mail para Rastreio & Pix:</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2.5 border border-neutral-300 dark:border-neutral-700 rounded-xl bg-white dark:bg-[#161724] text-neutral-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="font-bold text-neutral-700 dark:text-neutral-300 block mb-1">Rua / Avenida:</label>
                  <input
                    type="text"
                    required
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    className="w-full p-2.5 border border-neutral-300 dark:border-neutral-700 rounded-xl bg-white dark:bg-[#161724] text-neutral-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-neutral-700 dark:text-neutral-300 block mb-1">Número:</label>
                  <input
                    type="text"
                    required
                    value={number}
                    onChange={(e) => setNumber(e.target.value)}
                    className="w-full p-2.5 border border-neutral-300 dark:border-neutral-700 rounded-xl bg-white dark:bg-[#161724] text-neutral-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-neutral-700 dark:text-neutral-300 block mb-1">Complemento:</label>
                  <input
                    type="text"
                    value={complement}
                    onChange={(e) => setComplement(e.target.value)}
                    className="w-full p-2.5 border border-neutral-300 dark:border-neutral-700 rounded-xl bg-white dark:bg-[#161724] text-neutral-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-neutral-700 dark:text-neutral-300 block mb-1">Cidade:</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full p-2.5 border border-neutral-300 dark:border-neutral-700 rounded-xl bg-white dark:bg-[#161724] text-neutral-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-neutral-700 dark:text-neutral-300 block mb-1">UF / Estado:</label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full p-2.5 border border-neutral-300 dark:border-neutral-700 rounded-xl bg-white dark:bg-[#161724] text-neutral-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Pagamento */}
            <div className="space-y-3">
              <h4 className="font-bold text-sm text-neutral-900 dark:text-white border-b border-neutral-200 dark:border-neutral-800 pb-1.5 flex items-center justify-between">
                <span>2. Forma de Pagamento</span>
                <span className="text-[11px] text-neutral-500 dark:text-neutral-400 font-normal flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Mercado Pago Protegido
                </span>
              </h4>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('pix')}
                  className={`p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                    paymentMethod === 'pix'
                      ? 'border-neutral-950 dark:border-white bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 shadow-md'
                      : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#161724] hover:bg-neutral-100 dark:hover:bg-[#1c1d2e] text-neutral-800 dark:text-neutral-200'
                  }`}
                >
                  <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-sm">Pix Instantâneo</div>
                    <div className="text-[10px] opacity-75">QR Code & Copia e Cola</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                    paymentMethod === 'card'
                      ? 'border-neutral-950 dark:border-white bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 shadow-md'
                      : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#161724] hover:bg-neutral-100 dark:hover:bg-[#1c1d2e] text-neutral-800 dark:text-neutral-200'
                  }`}
                >
                  <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400 shrink-0">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-sm">Cartão de Crédito</div>
                    <div className="text-[10px] opacity-75">Até 6x sem juros</div>
                  </div>
                </button>
              </div>

              {/* Formulário do Cartão se selecionado */}
              {paymentMethod === 'card' && (
                <div className="p-4 bg-neutral-50 dark:bg-[#161724] rounded-2xl border border-neutral-200 dark:border-neutral-800 space-y-3 mt-3">
                  <div>
                    <label className="font-bold text-neutral-700 dark:text-neutral-300 block mb-1">Número do Cartão:</label>
                    <input
                      type="text"
                      required
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full p-2.5 border border-neutral-300 dark:border-neutral-700 rounded-xl bg-white dark:bg-[#1c1d2e] font-mono text-neutral-900 dark:text-white"
                      placeholder="0000 0000 0000 0000"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-neutral-700 dark:text-neutral-300 block mb-1">Nome no Cartão:</label>
                      <input
                        type="text"
                        required
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        className="w-full p-2.5 border border-neutral-300 dark:border-neutral-700 rounded-xl bg-white dark:bg-[#1c1d2e] uppercase text-neutral-900 dark:text-white"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="font-bold text-neutral-700 dark:text-neutral-300 block mb-1">Validade:</label>
                        <input
                          type="text"
                          required
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="w-full p-2.5 border border-neutral-300 dark:border-neutral-700 rounded-xl bg-white dark:bg-[#1c1d2e] font-mono text-center text-neutral-900 dark:text-white"
                          placeholder="MM/AA"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-neutral-700 dark:text-neutral-300 block mb-1">CVV:</label>
                        <input
                          type="text"
                          required
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          className="w-full p-2.5 border border-neutral-300 dark:border-neutral-700 rounded-xl bg-white dark:bg-[#1c1d2e] font-mono text-center text-neutral-900 dark:text-white"
                          placeholder="123"
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="font-bold text-neutral-700 dark:text-neutral-300 block mb-1">Parcelamento:</label>
                    <select
                      value={cardInstallments}
                      onChange={(e) => setCardInstallments(e.target.value)}
                      className="w-full p-2.5 border border-neutral-300 dark:border-neutral-700 rounded-xl bg-white dark:bg-[#1c1d2e] font-bold text-neutral-900 dark:text-white"
                    >
                      <option value="1">1x de R$ {total.toFixed(2).replace('.', ',')} sem juros</option>
                      <option value="2">2x de R$ {(total / 2).toFixed(2).replace('.', ',')} sem juros</option>
                      <option value="3">3x de R$ {(total / 3).toFixed(2).replace('.', ',')} sem juros</option>
                      <option value="6">6x de R$ {(total / 6).toFixed(2).replace('.', ',')} sem juros</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Resumo e Botão de Ação */}
            <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800 space-y-3">
              <div className="flex justify-between text-sm font-black text-neutral-950 dark:text-white">
                <span>Total a Pagar (com frete Jadlog):</span>
                <span className="font-mono text-base">R$ {total.toFixed(2).replace('.', ',')}</span>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-4 bg-neutral-950 dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-200 disabled:opacity-50 text-white dark:text-neutral-950 font-bold rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer text-xs uppercase tracking-wider"
              >
                {isProcessing ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    {paymentMethod === 'pix'
                      ? 'Gerando QR Code Oficial no Mercado Pago...'
                      : 'Processando Pagamento com Cartão...'}
                  </span>
                ) : paymentMethod === 'pix' ? (
                  <>
                    <QrCode className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
                    <span>Gerar QR Code Pix Mercado Pago</span>
                    <span>•</span>
                    <span>R$ {total.toFixed(2).replace('.', ',')}</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 text-sky-400 dark:text-sky-600" />
                    <span>Finalizar com Cartão de Crédito</span>
                    <span>•</span>
                    <span>R$ {total.toFixed(2).replace('.', ',')}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
