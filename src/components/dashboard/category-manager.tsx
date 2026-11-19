"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Edit3, LoaderCircle, Plus, Save, Tags, Trash2, X } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { api, ApiError } from "@/lib/api";
import { ConfirmDialog } from "@/components/dashboard/confirm-dialog";
import type { Category } from "@/types/api";

export function CategoryManager() {
  const { token } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [name, setName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const [editing, setEditing] = useState<Category | null>(null);
  const [editName, setEditName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const [deleting, setDeleting] = useState<Category | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function load() {
    if (!token) return;
    setIsLoading(true);
    setError("");
    try {
      setCategories(await api.getStoreCategories(token));
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Erro ao carregar categorias",
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token || name.trim().length < 2) return;

    setIsCreating(true);
    setError("");
    setSuccess("");
    try {
      const category = await api.createCategory(token, { name: name.trim() });
      setCategories((current) =>
        [...current, category].sort((a, b) => a.name.localeCompare(b.name)),
      );
      setName("");
      setSuccess(`Categoria “${category.name}” criada.`);
    } catch (requestError) {
      setError(
        requestError instanceof ApiError
          ? requestError.message
          : "Não foi possível criar a categoria.",
      );
    } finally {
      setIsCreating(false);
    }
  }

  async function saveEdit(category: Category) {
    if (!token || editName.trim().length < 2) return;

    setIsSaving(true);
    setError("");
    setSuccess("");
    try {
      const updated = await api.updateCategory(token, category.id, {
        name: editName.trim(),
      });
      setCategories((current) =>
        current
          .map((item) => (item.id === updated.id ? updated : item))
          .sort((a, b) => a.name.localeCompare(b.name)),
      );
      setEditing(null);
      setSuccess("Categoria atualizada.");
    } catch (requestError) {
      setError(
        requestError instanceof ApiError
          ? requestError.message
          : "Não foi possível atualizar a categoria.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function confirmDelete() {
    if (!token || !deleting) return;

    setIsDeleting(true);
    setError("");
    setSuccess("");
    try {
      await api.deleteCategory(token, deleting.id);
      setCategories((current) =>
        current.filter((item) => item.id !== deleting.id),
      );
      setSuccess(`Categoria “${deleting.name}” removida.`);
      setDeleting(null);
    } catch (requestError) {
      setError(
        requestError instanceof ApiError
          ? requestError.message
          : "Não foi possível remover a categoria.",
      );
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700" role="alert">
          {error}
        </p>
      )}
      {success && (
        <p className="rounded-2xl bg-green-50 px-4 py-3 text-sm font-bold text-green-700" role="status">
          {success}
        </p>
      )}

      <form
        onSubmit={create}
        className="flex flex-col gap-3 rounded-3xl border border-primary/10 bg-white p-5 shadow-card sm:flex-row sm:items-end"
      >
        <label className="flex-1">
          <span className="field-label">Nova categoria</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            minLength={2}
            maxLength={80}
            className="field"
            placeholder="Ex.: Colares, Brincos, Bolsas..."
          />
        </label>
        <button
          type="submit"
          disabled={isCreating || name.trim().length < 2}
          className="btn-primary shrink-0"
        >
          {isCreating ? (
            <LoaderCircle size={17} className="animate-spin" />
          ) : (
            <Plus size={17} />
          )}
          Adicionar
        </button>
      </form>

      {isLoading ? (
        <LoaderCircle className="animate-spin text-primary" size={28} />
      ) : categories.length === 0 ? (
        <div className="rounded-[2rem] border border-dashed border-primary/20 bg-white p-12 text-center">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-primary-light text-primary">
            <Tags size={30} />
          </span>
          <h2 className="mt-5 font-display text-2xl font-bold text-text-title">
            Nenhuma categoria ainda
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-text-secondary">
            Crie categorias para organizar o catálogo e facilitar a busca dos
            clientes.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-primary/10 bg-white shadow-card">
          <ul className="divide-y divide-primary/10">
            {categories.map((category) => (
              <li
                key={category.id}
                className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                {editing?.id === category.id ? (
                  <div className="flex flex-1 gap-2">
                    <input
                      value={editName}
                      onChange={(event) => setEditName(event.target.value)}
                      className="field"
                      maxLength={80}
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => saveEdit(category)}
                      disabled={isSaving}
                      className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary text-white disabled:opacity-60"
                      aria-label="Salvar categoria"
                    >
                      {isSaving ? (
                        <LoaderCircle size={17} className="animate-spin" />
                      ) : (
                        <Save size={17} />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditing(null)}
                      className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-primary/15 text-text-secondary"
                      aria-label="Cancelar edição"
                    >
                      <X size={17} />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="min-w-0">
                      <p className="truncate font-bold text-text-title">
                        {category.name}
                      </p>
                      <p className="text-xs text-text-secondary">
                        /{category.slug}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setEditing(category);
                          setEditName(category.name);
                        }}
                        className="grid h-9 w-9 place-items-center rounded-xl text-text-secondary transition hover:bg-primary-light hover:text-primary"
                        aria-label={`Editar ${category.name}`}
                      >
                        <Edit3 size={17} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleting(category)}
                        className="grid h-9 w-9 place-items-center rounded-xl text-text-secondary transition hover:bg-red-50 hover:text-red-600"
                        aria-label={`Remover ${category.name}`}
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      <ConfirmDialog
        isOpen={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={confirmDelete}
        title="Remover categoria"
        message={
          deleting
            ? `Remover “${deleting.name}”? Os produtos continuam no catálogo, mas ficarão sem categoria.`
            : ""
        }
        confirmLabel="Remover"
        variant="destructive"
        isLoading={isDeleting}
      />
    </div>
  );
}
