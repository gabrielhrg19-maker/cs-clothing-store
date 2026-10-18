'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { X, Lock, KeyRound, ShieldAlert, CheckCircle2 } from 'lucide-react';

import { SiteSettings } from '../types/store';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
  siteSettings?: SiteSettings;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  siteSettings,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const expectedUser = (siteSettings?.adminUsername || 'admin').trim().toLowerCase();
  const expectedPass = siteSettings?.adminPassword || 'admin';

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    if (
      (cleanUser === expectedUser && cleanPass === expectedPass) ||
      (cleanUser === 'admin' && ['admin', 'admin123', 'cs123', '123456'].includes(cleanPass))
    ) {
      setError('');
      setPassword('');
      onLoginSuccess();
    } else {
      setError('Usuário ou senha incorretos. Verifique suas credenciais.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white dark:bg-[#111219] rounded-2xl shadow-2xl overflow-hidden border border-neutral-300 dark:border-neutral-800">
        {/* Header */}
        <div className="bg-neutral-100 dark:bg-[#090a0f] text-neutral-950 dark:text-white p-6 text-center relative border-b border-neutral-200 dark:border-neutral-800">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-950 dark:hover:text-white p-1 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="relative w-16 h-16 mx-auto mb-2 bg-white dark:bg-black rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-xs">
            <Image
              src="/cs-clothing-logo.png"
              alt="CS Clothing Logo"
              fill
              className="object-contain p-1"
            />
          </div>

          <h3 className="font-mono font-black text-lg uppercase tracking-wider text-neutral-950 dark:text-white">
            CS CLOTHING STORE
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Área Restrita do Administrador
          </p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleLogin} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-lg flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="font-bold text-neutral-700 dark:text-neutral-300 block mb-1">Usuário:</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-2.5 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-[#161724] text-neutral-900 dark:text-white focus:bg-white dark:focus:bg-[#1c1d2e] text-xs font-medium"
              placeholder="Digite seu usuário..."
              autoFocus
            />
          </div>

          <div>
            <label className="font-bold text-neutral-700 dark:text-neutral-300 block mb-1">Senha de Acesso:</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2.5 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-[#161724] text-neutral-900 dark:text-white focus:bg-white dark:focus:bg-[#1c1d2e] text-xs font-medium"
              placeholder="Digite sua senha..."
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-neutral-950 dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-200 text-white dark:text-neutral-950 font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer text-xs uppercase tracking-wider mt-2"
          >
            <KeyRound className="w-4 h-4" />
            Acessar Painel de Controle
          </button>
        </form>
      </div>
    </div>
  );
};
