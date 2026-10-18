'use client';

import React from 'react';

interface FloatingSocialButtonsProps {
  whatsappNumber: string;
  instagramHandle: string;
}

export const FloatingSocialButtons: React.FC<FloatingSocialButtonsProps> = ({
  whatsappNumber,
  instagramHandle,
}) => {
  const digitsOnly = (whatsappNumber || '').replace(/\D/g, '');
  // Se o usuário digitou com o DDI 55 (ex: 5511987654321), extrai para evitar duplicação do 55
  const phoneWithoutDDI = digitsOnly.length > 11 && digitsOnly.startsWith('55')
    ? digitsOnly.slice(2)
    : digitsOnly;
  const finalPhone = phoneWithoutDDI || '11987654321';

  const whatsappUrl = `https://wa.me/55${finalPhone}?text=${encodeURIComponent(
    'Olá! Gostaria de mais informações sobre as camisas da CS Clothing Store.'
  )}`;

  const rawInsta = (instagramHandle || '').trim();
  const instagramUrl = rawInsta.startsWith('http')
    ? rawInsta
    : `https://instagram.com/${rawInsta.replace('@', '').trim() || 'csclothingstore'}`;

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 flex flex-col items-end gap-2.5 sm:gap-3 pointer-events-auto select-none">
      {/* Botão Flutuante Instagram com Anel Giratório */}
      <a
        href={instagramUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Instagram CS Clothing Store"
        className="group relative flex items-center justify-center cursor-pointer"
      >
        {/* Anel Externo Giratório Contínuo */}
        <div className="absolute -inset-1.5 rounded-full bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 opacity-75 blur-xs group-hover:opacity-100 transition-opacity animate-[spin_6s_linear_infinite]" />
        <div className="absolute -inset-1 rounded-full border-2 border-dashed border-white/60 animate-[spin_10s_linear_infinite_reverse] pointer-events-none" />

        {/* Círculo Principal do Instagram */}
        <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white flex items-center justify-center shadow-[0_8px_20px_rgba(220,39,67,0.45)] group-hover:scale-110 group-active:scale-95 transition-all duration-300">
          {/* SVG Oficial Instagram */}
          <svg
            className="w-6 h-6 sm:w-7 sm:h-7 transition-transform group-hover:rotate-12 duration-300"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
          </svg>
        </div>

        {/* Tooltip Lateral ao passar o mouse */}
        <span className="absolute right-16 top-1/2 -translate-y-1/2 bg-neutral-950/90 text-white text-[11px] font-bold py-1.5 px-3 rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-lg backdrop-blur-md pointer-events-none border border-white/10 hidden sm:block">
          Siga no Instagram {instagramHandle}
        </span>
      </a>

      {/* Botão Flutuante WhatsApp com Anel Giratório e Pulso */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Atendimento WhatsApp CS Clothing Store"
        className="group relative flex items-center justify-center cursor-pointer"
      >
        {/* Anel Externo Giratório Contínuo */}
        <div className="absolute -inset-1.5 rounded-full bg-gradient-to-r from-emerald-400 via-teal-300 to-green-500 opacity-80 blur-xs group-hover:opacity-100 transition-opacity animate-[spin_5s_linear_infinite]" />
        <div className="absolute -inset-1 rounded-full border-2 border-dashed border-emerald-300/80 animate-[spin_8s_linear_infinite] pointer-events-none" />

        {/* Ponto Pulsante Indicador Online */}
        <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5 z-10">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-400 border-2 border-white" />
        </span>

        {/* Círculo Principal do WhatsApp */}
        <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-[0_8px_25px_rgba(37,211,102,0.5)] group-hover:scale-110 group-active:scale-95 transition-all duration-300">
          {/* SVG Oficial WhatsApp */}
          <svg
            className="w-6 h-6 sm:w-7 sm:h-7 transition-transform group-hover:rotate-12 duration-300 fill-current"
            viewBox="0 0 24 24"
          >
            <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.669-.699c.969.53 1.83.812 2.791.812 3.179 0 5.767-2.587 5.767-5.766.001-3.187-2.575-5.771-5.767-5.771zm3.393 8.163c-.144.405-.837.774-1.17.823-.312.045-.694.06-1.109-.074-.702-.227-1.572-.733-2.348-1.509-.998-.997-1.446-2.029-1.606-2.532-.16-.503-.016-.838.139-.994.137-.137.306-.273.458-.273.153 0 .28.006.398.019.124.013.266-.051.411.298.156.377.534 1.302.581 1.398.047.096.078.208.016.332-.062.124-.093.203-.187.312-.093.109-.197.243-.281.326-.094.094-.192.196-.083.383.109.187.483.796 1.037 1.288.712.634 1.312.83 1.499.923.187.094.296.078.405-.047.109-.125.468-.545.593-.732.125-.187.25-.156.421-.093.172.062 1.09.514 1.277.608.187.094.312.14.359.219.046.078.046.452-.098.857z" />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.985-1.399C8.423 21.492 10.155 22 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 1.818c4.518 0 8.182 3.664 8.182 8.182 0 4.518-3.664 8.182-8.182 8.182-1.614 0-3.11-.47-4.37-1.28l-.312-.202-2.955.828.835-2.893-.223-.332A8.145 8.145 0 0 1 3.818 12c0-4.518 3.664-8.182 8.182-8.182z"
            />
          </svg>
        </div>

        {/* Tooltip Lateral ao passar o mouse */}
        <span className="absolute right-16 top-1/2 -translate-y-1/2 bg-neutral-950/90 text-white text-[11px] font-bold py-1.5 px-3 rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-lg backdrop-blur-md pointer-events-none border border-white/10 hidden sm:block">
          Fale Conosco no WhatsApp
        </span>
      </a>
    </div>
  );
};
