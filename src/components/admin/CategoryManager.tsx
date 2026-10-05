"use client";

import { startTransition, useActionState, useRef, useState, useTransition } from "react";
import { createCategory, deleteCategory, renameCategory, type FormState } from "@/app/admin/actions";

type Row = { id: string; name: string; count: number };

export function CategoryManager({ categories }: { categories: Row[] }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState(async (prev: FormState, data: FormData) => {
    const res = await createCategory(prev, data);
    if (res?.ok) formRef.current?.reset();
    return res;
  }, undefined);

  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px] lg:items-start">
      <div className="overflow-hidden rounded-3xl border border-line bg-paper">
        {categories.length === 0 && (
          <p className="px-6 py-16 text-center text-sm text-muted">No categories yet — add your first one.</p>
        )}
        <ul className="divide-y divide-line">
          {categories.map((c) => (
            <CategoryRow key={c.id} category={c} />
          ))}
        </ul>
      </div>

      <form
        ref={formRef}
        onSubmit={(e) => {
          e.preventDefault();
          const data = new FormData(e.currentTarget);
          startTransition(() => action(data));
        }}
        className="rounded-3xl border border-line bg-paper p-6"
      >
        <p className="font-display text-2xl font-semibold text-forest">New Category</p>
        <label className="mt-5 block">
          <span className="eyebrow mb-2 block text-muted">Name</span>
          <input name="name" required className="field" placeholder="e.g. Agarbatti" />
        </label>
        {state?.error && <p className="mt-3 text-sm text-rose">{state.error}</p>}
        <button
          disabled={pending}
          className="eyebrow mt-5 w-full rounded-full bg-forest py-3.5 text-paper transition hover:bg-forest-2 disabled:opacity-60"
        >
          {pending ? "Adding…" : "Add Category"}
        </button>
      </form>
    </div>
  );
}

function CategoryRow({ category }: { category: Row }) {
  const [editing, setEditing] = useState(false);
  const [state, action, pending] = useActionState(async (prev: FormState, data: FormData) => {
    const res = await renameCategory(prev, data);
    if (res?.ok) setEditing(false);
    return res;
  }, undefined);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, startDelete] = useTransition();

  function onDelete() {
    if (!confirm(`Delete category “${category.name}”?`)) return;
    setDeleteError(null);
    startDelete(async () => {
      const res = await deleteCategory(category.id);
      if (res?.error) setDeleteError(res.error);
    });
  }

  return (
    <li className="px-6 py-4">
      {editing ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const data = new FormData(e.currentTarget);
            startTransition(() => action(data));
          }}
          className="flex flex-wrap items-center gap-2"
        >
          <input type="hidden" name="id" value={category.id} />
          <input name="name" defaultValue={category.name} required autoFocus className="field flex-1" />
          <button disabled={pending} className="eyebrow rounded-full bg-forest px-5 py-3 text-paper disabled:opacity-60">
            {pending ? "Saving…" : "Save"}
          </button>
          <button type="button" onClick={() => setEditing(false)} className="eyebrow px-3 py-3 text-muted">
            Cancel
          </button>
        </form>
      ) : (
        <div className="flex items-center gap-4">
          <div className="min-w-0 flex-1">
            <p className="font-display truncate text-xl font-semibold text-ink">{category.name}</p>
            <p className="text-xs text-muted">
              {category.count} {category.count === 1 ? "product" : "products"}
            </p>
          </div>
          <button
            onClick={() => setEditing(true)}
            className="rounded-full px-3 py-1.5 text-sm font-medium text-forest transition hover:bg-ivory"
          >
            Rename
          </button>
          <button
            onClick={onDelete}
            disabled={deleting}
            className="rounded-full px-3 py-1.5 text-sm text-muted transition hover:bg-rose/10 hover:text-rose disabled:opacity-50"
          >
            Delete
          </button>
        </div>
      )}
      {(state?.error || deleteError) && <p className="mt-2 text-sm text-rose">{state?.error ?? deleteError}</p>}
    </li>
  );
}
