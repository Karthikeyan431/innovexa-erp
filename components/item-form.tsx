"use client";

import { useState, type FormEvent } from "react";
import { Bilingual } from "@/components/bilingual";
import { Field, Message, SelectField, SubmitButton } from "@/components/auth-ui";
import type { BilingualText } from "@/lib/auth-text";
import {
  createItem,
  deleteItem,
  emptyItemInput,
  isDuplicateNameError,
  toItemInput,
  updateItem,
  UNITS,
  validateItem,
  type Item,
  type ItemFieldErrors,
  type ItemInput,
  type Unit,
} from "@/lib/items";
import { itemsText, unitText } from "@/lib/items-text";

function optional(label: BilingualText): BilingualText {
  return { ta: `${label.ta} (${itemsText.optional.ta})`, en: `${label.en} (${itemsText.optional.en})` };
}

type ItemFormProps = {
  /** The item to edit, or null to add a new one. */
  item: Item | null;
  categories: string[];
  onDone: (message: BilingualText) => void;
  onCancel: () => void;
};

export function ItemForm({ item, categories, onDone, onCancel }: ItemFormProps) {
  const [input, setInput] = useState<ItemInput>(item ? toItemInput(item) : emptyItemInput);
  const [fieldErrors, setFieldErrors] = useState<ItemFieldErrors>({});
  const [error, setError] = useState<BilingualText | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  function update<K extends keyof ItemInput>(key: K, value: ItemInput[K]) {
    setInput((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const { values, errors, ok } = validateItem(input);
    setFieldErrors(errors);
    if (!ok) return;

    setBusy(true);
    try {
      if (item) await updateItem(item.id, values);
      else await createItem(values);
      onDone(item ? itemsText.saved : itemsText.created);
    } catch (err) {
      console.error("Saving item failed:", err);
      if (isDuplicateNameError(err)) setFieldErrors({ name: itemsText.duplicateName });
      else setError(itemsText.saveFailed);
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!item) return;
    // First tap asks for confirmation, second tap deletes.
    if (!confirmingDelete) {
      setConfirmingDelete(true);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await deleteItem(item.id);
      onDone(itemsText.deleted);
    } catch (err) {
      console.error("Deleting item failed:", err);
      setError(itemsText.deleteFailed);
      setConfirmingDelete(false);
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <h2 className="text-lg font-semibold">
        <Bilingual text={item ? itemsText.editItemTitle : itemsText.newItemTitle} />
      </h2>

      <Field
        id="name"
        label={itemsText.name}
        value={input.name}
        onChange={(e) => update("name", e.target.value)}
        error={fieldErrors.name}
        maxLength={200}
        autoComplete="off"
        required
      />

      <Field
        id="category"
        label={optional(itemsText.category)}
        hint={itemsText.categoryHint}
        value={input.category}
        onChange={(e) => update("category", e.target.value)}
        list="item-categories"
        maxLength={100}
        autoComplete="off"
      />
      <datalist id="item-categories">
        {categories.map((category) => (
          <option key={category} value={category} />
        ))}
      </datalist>

      <SelectField id="unit" label={itemsText.unit} value={input.unit} onChange={(e) => update("unit", e.target.value as Unit)}>
        {UNITS.map((unit) => (
          <option key={unit} value={unit}>
            {unitText[unit].ta} · {unitText[unit].en}
          </option>
        ))}
      </SelectField>

      <div className="grid grid-cols-2 gap-3">
        <Field
          id="purchasePrice"
          label={optional(itemsText.purchasePrice)}
          value={input.purchasePrice}
          onChange={(e) => update("purchasePrice", e.target.value)}
          error={fieldErrors.purchasePrice}
          inputMode="decimal"
          autoComplete="off"
        />
        <Field
          id="sellingPrice"
          label={itemsText.sellingPrice}
          value={input.sellingPrice}
          onChange={(e) => update("sellingPrice", e.target.value)}
          error={fieldErrors.sellingPrice}
          inputMode="decimal"
          autoComplete="off"
          required
        />
      </div>

      <Field
        id="gstRate"
        label={itemsText.gstRate}
        hint={itemsText.gstHint}
        value={input.gstRate}
        onChange={(e) => update("gstRate", e.target.value)}
        error={fieldErrors.gstRate}
        inputMode="decimal"
        autoComplete="off"
        required
      />

      {error && <Message text={error} tone="error" />}
      <SubmitButton busy={busy} label={item ? itemsText.saveEdit : itemsText.saveNew} />
      <button
        type="button"
        onClick={onCancel}
        disabled={busy}
        className="min-h-12 w-full rounded-lg border border-zinc-300 px-4 py-2 font-medium disabled:opacity-60 dark:border-zinc-700"
      >
        <Bilingual text={itemsText.cancel} className="items-center" />
      </button>
      {item && (
        <button
          type="button"
          onClick={handleDelete}
          disabled={busy}
          className={
            confirmingDelete
              ? "min-h-12 w-full rounded-lg bg-red-600 px-4 py-2 font-medium text-white disabled:opacity-60"
              : "min-h-12 w-full rounded-lg border border-red-300 px-4 py-2 font-medium text-red-700 disabled:opacity-60 dark:border-red-800 dark:text-red-400"
          }
        >
          <Bilingual text={confirmingDelete ? itemsText.confirmDelete : itemsText.delete} className="items-center" />
        </button>
      )}
    </form>
  );
}
