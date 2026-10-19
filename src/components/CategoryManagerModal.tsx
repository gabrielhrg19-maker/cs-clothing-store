'use client';

import React, { useState } from 'react';
import { X, Plus, Trash2, Edit2, Check, Tags, RotateCcw } from 'lucide-react';

interface CategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: string[];
  onSaveCategories: (categories: string[]) => void;
}

export const CategoryManagerModal: React.FC<CategoryManagerModalProps> = ({
  isOpen,
  onClose,
  categories,
  onSaveCategories,
}) => {
  const [newCatName, setNewCatName] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCatName.trim();
    if (!trimmed) return;
    if (categories.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      setError('Esta categoria já existe.');
      return;
    }
    setError('');
    onSaveCategories([...categories, trimmed]);
    setNewCatName('');
  };

  const handleStartEdit = (index: number) => {
    setEditingIndex(index);
    setEditingValue(categories[index]);
  };

  const handleSaveEdit = (index: number) => {
    const trimmed = editingValue.trim();
    if (!trimmed) return;
    const copy = [...categories];
    copy[index] = trimmed;
    onSaveCategories(copy);
    setEditingIndex(null);
  };

  const handleDelete = (index: number) => {
    if (categories.length <= 1) {
      setError('Mantenha pelo menos uma categoria no catálogo.');
      return;
    }
    const catToDelete = categories[index];
    if (window.confirm(`Deseja remover a categoria "${catToDelete}" dos filtros da loja?`)) {
      onSaveCategories(categories.filter((_, i) => i !== index));
    }
  };

  const handleResetDefaults = () => {
    if (window.confirm('Restaurar categorias padrão (Casual, Original, Oversized, Streetwear)?')) {
      onSaveCategories(['Camisa Casual', 'Original', 'Oversized', 'Streetwear']);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white dark:bg-[#111219] rounded-3xl shadow-2xl overflow-hidden border border-neutral-300 dark:border-neutral-800 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-neutral-100 dark:bg-[#090a0f] text-neutral-950 dark:text-white p-5 flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-950/80 rounded-xl text-amber-700 dark:text-amber-400">
              <Tags className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-neutral-950 dark:text-white">
                Editar Categorias dos Filtros
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Altere, crie ou remova as categorias que aparecem na barra de filtros da loja
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-500 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 text-xs text-neutral-800 dark:text-neutral-200 max-h-[75vh] overflow-y-auto">
          {/* Adicionar Nova Categoria */}
          <form onSubmit={handleAdd} className="space-y-2">
            <label className="font-bold text-neutral-700 dark:text-neutral-300 block">
              + Adicionar Nova Categoria:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="Ex: Camisa Jeans, Camisa Estampada, Camisa Cropped..."
                className="flex-1 p-2.5 border border-neutral-300 dark:border-neutral-700 rounded-xl bg-neutral-50 dark:bg-[#161724] text-neutral-900 dark:text-white focus:bg-white dark:focus:bg-[#1c1d2e] text-xs font-medium"
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-neutral-950 dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-200 text-white dark:text-neutral-950 font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                Adicionar
              </button>
            </div>
            {error && <p className="text-rose-600 dark:text-rose-400 font-medium text-[11px]">{error}</p>}
          </form>

          {/* Lista de Categorias Atuais */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider text-[11px]">
                Categorias Ativas ({categories.length}):
              </span>
              <button
                type="button"
                onClick={handleResetDefaults}
                className="text-[11px] text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-white underline flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" /> Restaurar Padrões
              </button>
            </div>

            <div className="space-y-2">
              {categories.map((cat, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-neutral-50 dark:bg-[#161724] rounded-2xl border border-neutral-200 dark:border-neutral-800 flex items-center justify-between gap-3"
                >
                  {editingIndex === idx ? (
                    <div className="flex-1 flex gap-2">
                      <input
                        type="text"
                        value={editingValue}
                        onChange={(e) => setEditingValue(e.target.value)}
                        className="flex-1 p-1.5 border border-neutral-400 rounded-lg text-xs bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white font-bold"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(idx)}
                        className="p-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 cursor-pointer"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-bold flex items-center justify-center text-[10px]">
                        {idx + 1}
                      </span>
                      <span className="font-bold text-neutral-900 dark:text-white text-sm">{cat}</span>
                    </div>
                  )}

                  <div className="flex gap-1.5 shrink-0">
                    {editingIndex !== idx && (
                      <button
                        type="button"
                        onClick={() => handleStartEdit(idx)}
                        className="p-1.5 bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-lg transition-colors cursor-pointer"
                        title="Renomear Categoria"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDelete(idx)}
                      className="p-1.5 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 rounded-lg transition-colors cursor-pointer"
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

        <div className="p-4 bg-neutral-50 dark:bg-[#13141f] border-t border-neutral-200 dark:border-neutral-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-neutral-950 dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-200 text-white dark:text-neutral-950 rounded-xl font-bold text-xs transition-colors cursor-pointer"
          >
            Pronto, Salvar e Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
