"use client";

import { useState, type FormEvent, useEffect } from "react";
import { LoaderCircle, X, ImagePlus, Trash2 } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { api, ApiError } from "@/lib/api";
import type { Product, Category } from "@/types/api";

interface ProductFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  product?: Product | null;
}

export function ProductFormDialog({ isOpen, onClose, onSuccess, product }: ProductFormDialogProps) {
  const { token } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    comparePrice: "",
    stock: "",
    installments: "",
    categoryId: "",
    isActive: true,
  });

  useEffect(() => {
    if (token) {
      api.getStoreCategories(token).then(setCategories).catch(console.error);
    }
  }, [token]);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description || "",
        price: String(product.price),
        comparePrice: String(product.comparePrice || ""),
        stock: String(product.stock),
        installments: String(product.installments || ""),
        categoryId: product.categoryId || "",
        isActive: product.isActive,
      });
      setImages(product.images || []);
    } else {
      setFormData({
        name: "",
        description: "",
        price: "",
        comparePrice: "",
        stock: "",
        installments: "",
        categoryId: "",
        isActive: true,
      });
      setImages([]);
      setImageFiles([]);
    }
  }, [product]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!token) return;

    setIsSubmitting(true);
    setError("");

    try {
      const uploadedImages = await uploadImages();
      const allImages = [...images.filter((i) => !i.startsWith("blob:")), ...uploadedImages];

      const payload = {
        name: formData.name,
        description: formData.description || undefined,
        price: Number(formData.price),
        comparePrice: formData.comparePrice ? Number(formData.comparePrice) : undefined,
        stock: Number(formData.stock),
        installments: formData.installments ? Number(formData.installments) : undefined,
        categoryId: formData.categoryId || undefined,
        isActive: formData.isActive,
        images: allImages,
      };

      if (product) {
        await api.updateProduct(token, product.id, payload);
      } else {
        await api.createProduct(token, payload);
      }

      onSuccess();
      onClose();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Erro ao salvar produto");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function uploadImages() {
    if (!token || imageFiles.length === 0) return [];
    const formData = new FormData();
    imageFiles.forEach((file) => formData.append("file", file));
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1"}/uploads/image`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    if (!res.ok) throw new Error("Erro no upload");
    const data = await res.json();
    return [data.url];
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    setImageFiles((prev) => [...prev, ...files]);
    files.forEach((file) => {
      const url = URL.createObjectURL(file);
      setImages((prev) => [...prev, url]);
    });
  }

  function removeImage(index: number) {
    const img = images[index];
    if (img.startsWith("blob:")) {
      setImageFiles((prev) => prev.filter((_, i) => i !== index));
    }
    setImages((prev) => prev.filter((_, i) => i !== index));
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-text-title/35 backdrop-blur p-4" onClick={onClose}>
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 flex items-center justify-between border-b border-primary/10 bg-white/95 backdrop-blur px-5 py-4 rounded-t-2xl">
          <h2 className="font-display text-xl font-bold">{product ? "Editar produto" : "Novo produto"}</h2>
          <button onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full text-text-secondary hover:bg-primary-light hover:text-primary">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {error && (
            <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700" role="alert">
              {error}
            </p>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="sm:col-span-2">
              <span className="field-label">Nome *</span>
              <input
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="field"
                placeholder="Nome do produto"
              />
            </label>

            <label className="sm:col-span-2">
              <span className="field-label">Descrição</span>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="field resize-none"
                placeholder="Descreva o produto..."
              />
            </label>

            <label>
              <span className="field-label">Preço *</span>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="field"
                placeholder="0,00"
              />
            </label>

            <label>
              <span className="field-label">Preço de comparação</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.comparePrice}
                onChange={(e) => setFormData({ ...formData, comparePrice: e.target.value })}
                className="field"
                placeholder="Preço original (opcional)"
              />
            </label>

            <label>
              <span className="field-label">Estoque *</span>
              <input
                type="number"
                min="0"
                required
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                className="field"
                placeholder="0"
              />
            </label>

            <label>
              <span className="field-label">Parcelas</span>
              <input
                type="number"
                min="1"
                max="12"
                value={formData.installments}
                onChange={(e) => setFormData({ ...formData, installments: e.target.value })}
                className="field"
                placeholder="1"
              />
            </label>

            <label className="sm:col-span-2">
              <span className="field-label">Imagens</span>
              <div className="grid gap-3 sm:grid-cols-4">
                {images.map((image, index) => (
                  <div key={index} className="relative aspect-square rounded-xl overflow-hidden bg-primary/5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={image} alt="" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute right-1 top-1 grid h-7 w-7 place-items-center rounded-full bg-red-500 text-white hover:bg-red-600"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                <label className="relative aspect-square rounded-xl border-2 border-dashed border-primary/20 bg-white cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <div className="flex h-full flex-col items-center justify-center gap-2 text-primary">
                    <ImagePlus size={28} />
                    <span className="text-sm font-bold">Adicionar</span>
                  </div>
                </label>
              </div>
              <p className="mt-2 text-xs text-text-secondary">Clique ou arraste para adicionar imagens (máx. 5MB cada)</p>
            </label>

            <label className="sm:col-span-2">
              <span className="field-label">Categoria</span>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="field"
              >
                <option value="">Selecione uma categoria</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </label>

            <label className="flex items-center gap-3 sm:col-span-2">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="h-4 w-4 rounded border-primary/30 text-primary focus:ring-primary"
              />
              <span className="font-bold text-text-title">Produto ativo</span>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-primary/10">
            <button type="button" onClick={onClose} disabled={isSubmitting} className="btn-secondary">
              Cancelar
            </button>
            <button type="submit" disabled={isSubmitting} className="btn-primary">
              {isSubmitting ? <LoaderCircle size={18} className="animate-spin mr-2" /> : null}
              {product ? "Salvar alterações" : "Criar produto"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}