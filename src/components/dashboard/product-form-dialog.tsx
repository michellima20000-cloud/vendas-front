"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { ImagePlus, LoaderCircle, Plus, Trash2, X } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { api, ApiError } from "@/lib/api";
import type { Category, Product } from "@/types/api";

interface ProductFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  product?: Product | null;
}

interface ImageItem {
  id: string;
  url: string;
  file?: File;
}

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const emptyForm = {
  name: "",
  description: "",
  price: "",
  comparePrice: "",
  stock: "",
  installments: "",
  categoryId: "",
  isActive: true,
};

export function ProductFormDialog({
  isOpen,
  onClose,
  onSuccess,
  product,
}: ProductFormDialogProps) {
  const { token } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [images, setImages] = useState<ImageItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState(emptyForm);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);

  useEffect(() => {
    if (!token || !isOpen) return;
    api
      .getStoreCategories(token)
      .then(setCategories)
      .catch(() => {
        /* categorias são opcionais no formulário */
      });
  }, [isOpen, token]);

  useEffect(() => {
    if (!isOpen) return;

    if (product) {
      setFormData({
        name: product.name,
        description: product.description || "",
        price: String(product.price),
        comparePrice: product.comparePrice ? String(product.comparePrice) : "",
        stock: String(product.stock),
        installments: product.installments ? String(product.installments) : "",
        categoryId: product.categoryId || "",
        isActive: product.isActive,
      });
      setImages(
        (product.images ?? []).map((url, index) => ({
          id: `existing-${index}-${url}`,
          url,
        })),
      );
    } else {
      setFormData(emptyForm);
      setImages([]);
    }

    setError("");
    setShowCategoryForm(false);
    setNewCategoryName("");
  }, [isOpen, product]);

  if (!isOpen) return null;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;

    setIsSubmitting(true);
    setError("");

    try {
      const newFiles = images
        .filter((image): image is ImageItem & { file: File } => Boolean(image.file))
        .map((image) => image.file);

      let uploadedUrls: string[] = [];
      if (newFiles.length) {
        try {
          uploadedUrls = (await api.uploadImages(token, newFiles)).urls;
        } catch (uploadError) {
          // Falha só no upload não deve apagar o que o usuário já preencheu.
          throw new ApiError(
            uploadError instanceof ApiError
              ? uploadError.message
              : "Não foi possível enviar a imagem. Tente novamente ou salve o produto sem imagem.",
            uploadError instanceof ApiError ? uploadError.status : 0,
          );
        }
      }

      let uploadedIndex = 0;
      const finalImages = images.map((image) =>
        image.file ? uploadedUrls[uploadedIndex++] : image.url,
      );

      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        price: Number(formData.price),
        comparePrice: formData.comparePrice
          ? Number(formData.comparePrice)
          : undefined,
        stock: Number(formData.stock || 0),
        installments: formData.installments
          ? Number(formData.installments)
          : undefined,
        categoryId: formData.categoryId || null,
        isActive: formData.isActive,
        images: finalImages,
      };

      if (product) {
        await api.updateProduct(token, product.id, payload);
      } else {
        await api.createProduct(token, payload);
      }

      onSuccess();
      onClose();
    } catch (requestError) {
      setError(
        requestError instanceof ApiError
          ? requestError.message
          : "Não foi possível salvar o produto. Tente novamente.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []);
    event.target.value = "";

    const invalid = files.find(
      (file) => !file.type.startsWith("image/") || file.size > MAX_IMAGE_SIZE,
    );
    if (invalid) {
      setError("Envie apenas imagens de até 5MB cada.");
      return;
    }

    const nextImages = files.map((file) => ({
      id: `${Date.now()}-${file.name}-${Math.random().toString(36).slice(2)}`,
      url: URL.createObjectURL(file),
      file,
    }));

    setImages((current) => [...current, ...nextImages].slice(0, 20));
    setError("");
  }

  function removeImage(image: ImageItem) {
    if (image.url.startsWith("blob:")) URL.revokeObjectURL(image.url);
    setImages((current) => current.filter((item) => item.id !== image.id));
  }

  async function createCategory() {
    const name = newCategoryName.trim();
    if (!token || name.length < 2) return;

    setIsCreatingCategory(true);
    setError("");
    try {
      const category = await api.createCategory(token, { name });
      setCategories((current) =>
        [...current, category].sort((a, b) => a.name.localeCompare(b.name)),
      );
      setFormData((current) => ({ ...current, categoryId: category.id }));
      setNewCategoryName("");
      setShowCategoryForm(false);
    } catch (requestError) {
      setError(
        requestError instanceof ApiError
          ? requestError.message
          : "Não foi possível criar a categoria.",
      );
    } finally {
      setIsCreatingCategory(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-text-title/35 p-4 backdrop-blur"
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-form-title"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sticky top-0 flex items-center justify-between rounded-t-2xl border-b border-primary/10 bg-white/95 px-5 py-4 backdrop-blur">
          <h2 id="product-form-title" className="font-display text-xl font-bold">
            {product ? "Editar produto" : "Novo produto"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="grid h-10 w-10 place-items-center rounded-full text-text-secondary hover:bg-primary-light hover:text-primary"
            aria-label="Fechar"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-5">
          {error && (
            <p
              className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700"
              role="alert"
            >
              {error}
            </p>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="sm:col-span-2">
              <span className="field-label">Nome *</span>
              <input
                required
                maxLength={160}
                value={formData.name}
                onChange={(event) =>
                  setFormData({ ...formData, name: event.target.value })
                }
                className="field"
                placeholder="Nome do produto"
              />
            </label>

            <label className="sm:col-span-2">
              <span className="field-label">Descrição</span>
              <textarea
                value={formData.description}
                onChange={(event) =>
                  setFormData({ ...formData, description: event.target.value })
                }
                rows={3}
                maxLength={5000}
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
                onChange={(event) =>
                  setFormData({ ...formData, price: event.target.value })
                }
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
                onChange={(event) =>
                  setFormData({ ...formData, comparePrice: event.target.value })
                }
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
                onChange={(event) =>
                  setFormData({ ...formData, stock: event.target.value })
                }
                className="field"
                placeholder="0"
              />
            </label>

            <label>
              <span className="field-label">Parcelas</span>
              <input
                type="number"
                min="1"
                max="120"
                value={formData.installments}
                onChange={(event) =>
                  setFormData({ ...formData, installments: event.target.value })
                }
                className="field"
                placeholder="1"
              />
            </label>

            <div className="sm:col-span-2">
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="text-sm font-bold text-text-title">Categoria</span>
                <div className="flex items-center gap-3 text-xs font-bold">
                  <Link
                    href="/painel/categorias"
                    className="text-text-secondary hover:text-primary"
                  >
                    Gerenciar
                  </Link>
                  <button
                    type="button"
                    onClick={() => setShowCategoryForm((value) => !value)}
                    className="inline-flex items-center gap-1 text-primary hover:underline"
                  >
                    <Plus size={13} /> Nova
                  </button>
                </div>
              </div>
              <select
                value={formData.categoryId}
                onChange={(event) =>
                  setFormData({ ...formData, categoryId: event.target.value })
                }
                className="field"
              >
                <option value="">Sem categoria</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>

              {showCategoryForm && (
                <div className="mt-3 flex gap-2">
                  <input
                    value={newCategoryName}
                    onChange={(event) => setNewCategoryName(event.target.value)}
                    className="field"
                    placeholder="Nome da nova categoria"
                    maxLength={80}
                  />
                  <button
                    type="button"
                    onClick={createCategory}
                    disabled={isCreatingCategory || newCategoryName.trim().length < 2}
                    className="btn-secondary shrink-0 !px-4"
                  >
                    {isCreatingCategory ? (
                      <LoaderCircle size={16} className="animate-spin" />
                    ) : (
                      "Criar"
                    )}
                  </button>
                </div>
              )}
            </div>

            <div className="sm:col-span-2">
              <span className="field-label">Imagens</span>
              <div className="grid gap-3 sm:grid-cols-4">
                {images.map((image) => (
                  <div
                    key={image.id}
                    className="relative aspect-square overflow-hidden rounded-xl bg-primary/5"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={image.url} alt="" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(image)}
                      className="absolute right-1 top-1 grid h-7 w-7 place-items-center rounded-full bg-red-500 text-white hover:bg-red-600"
                      aria-label="Remover imagem"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                <label className="relative aspect-square cursor-pointer rounded-xl border-2 border-dashed border-primary/20 bg-white transition hover:border-primary/40 hover:bg-primary/5">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    multiple
                    onChange={handleImageChange}
                    className="absolute inset-0 cursor-pointer opacity-0"
                  />
                  <div className="flex h-full flex-col items-center justify-center gap-2 text-primary">
                    <ImagePlus size={28} />
                    <span className="text-sm font-bold">Adicionar</span>
                  </div>
                </label>
              </div>
              <p className="mt-2 text-xs text-text-secondary">
                Até 20 imagens, 5MB cada. A primeira aparece como capa.
              </p>
            </div>

            <label className="flex items-center gap-3 sm:col-span-2">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(event) =>
                  setFormData({ ...formData, isActive: event.target.checked })
                }
                className="h-4 w-4 rounded border-primary/30 text-primary focus:ring-primary"
              />
              <span className="font-bold text-text-title">Produto ativo</span>
            </label>
          </div>

          <div className="flex justify-end gap-3 border-t border-primary/10 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="btn-secondary"
            >
              Cancelar
            </button>
            <button type="submit" disabled={isSubmitting} className="btn-primary">
              {isSubmitting && <LoaderCircle size={18} className="animate-spin" />}
              {product ? "Salvar alterações" : "Criar produto"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
