'use client';

import React from 'react';
import { X, Truck, ShieldCheck, CheckCircle2, Box, Layers, HelpCircle } from 'lucide-react';

interface LogisticsInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LogisticsInfoModal: React.FC<LogisticsInfoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden my-6 border border-neutral-200">
        <div className="bg-neutral-100 text-neutral-950 p-5 flex items-center justify-between border-b border-neutral-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-600 rounded-xl text-white shadow-xs">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-neutral-950">
                Logística Oficial: JADLOG (.Package e .Com)
              </h3>
              <p className="text-xs text-neutral-500">
                Como nossa loja calcula os fretes e despacha camisas para todo o Brasil
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-950 hover:bg-neutral-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 text-xs text-neutral-700 max-h-[75vh] overflow-y-auto">
          {/* Seção 1: Modalidades Jadlog */}
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-2">
            <div className="font-bold text-sm text-emerald-950 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              Modalidades Integradas no Site:
            </div>
            <ul className="list-disc pl-5 space-y-1 text-emerald-900 leading-relaxed">
              <li>
                <strong>Jadlog .Package:</strong> Modalidade rodoviária econômica. Para pacotes de camisas (peso leve entre 200g e 1.5kg), tem custo mais competitivo que os Correios em capitais e regiões metropolitanas.
              </li>
              <li>
                <strong>Jadlog .Com:</strong> Modalidade expressa prioritária. Ideal para clientes que precisam de entrega rápida porta a porta com prazo reduzido.
              </li>
            </ul>
          </div>

          {/* Seção 2: Cubagem de Camisas */}
          <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-2">
            <div className="font-bold text-neutral-900 flex items-center gap-1.5">
              <Box className="w-4 h-4 text-neutral-700" />
              Cálculo de Cubagem Automático (Sem Surpresas na Balança):
            </div>
            <p className="text-neutral-600 leading-relaxed">
              Roupas ocupam espaço volumétrico mas são leves. Nosso sistema aplica automaticamente a fórmula padrão da Jadlog:
            </p>
            <div className="p-2.5 bg-neutral-900 text-white rounded-xl font-mono text-center text-xs font-bold">
              Peso Volumétrico (kg) = (Comprimento × Largura × Altura em cm) ÷ 6.000
            </div>
            <p className="text-neutral-500 text-[11px]">
              O valor do frete é cotado pelo maior peso entre o real e o cubado. Assim, o lojista nunca paga diferença de frete na hora do despacho!
            </p>
          </div>

          {/* Seção 3: Boas Práticas */}
          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-2">
            <div className="font-bold text-amber-950 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-amber-700" />
              Dica de Embalagem para Camisas CS Clothing:
            </div>
            <p className="text-amber-900 text-[11px] leading-relaxed">
              Envie as camisas dobradas com papel de seda em <strong>envelopes plásticos de segurança tipo flyer inviolável</strong> (32x24cm). O volume fica baixo (altura de ~3cm), garantindo o frete mais barato da Jadlog para o cliente final!
            </p>
          </div>
        </div>

        <div className="p-4 bg-neutral-50 border-t border-neutral-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-neutral-950 text-white rounded-xl font-bold text-xs hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
