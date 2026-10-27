import type { BilingualText } from "@/lib/auth-text";
import { itemsText } from "@/lib/items-text";
import { getSupabaseClient } from "@/lib/supabase";

// Same list as the unit check constraint in supabase/migrations.
export const UNITS = ["pcs", "kg", "g", "l", "ml", "m", "box", "pack", "dozen"] as const;
export type Unit = (typeof UNITS)[number];

export type Item = {
  id: string;
  name: string;
  category: string | null;
  unit: Unit;
  purchase_price: number | null;
  selling_price: number;
  gst_rate: number;
};

/** Form values before validation. Empty strings mean "not filled in". */
export type ItemInput = {
  name: string;
  category: string;
  unit: Unit;
  purchasePrice: string;
  sellingPrice: string;
  gstRate: string;
};

export type ItemField = "name" | "purchasePrice" | "sellingPrice" | "gstRate";
export type ItemFieldErrors = Partial<Record<ItemField, BilingualText>>;

export const emptyItemInput: ItemInput = {
  name: "",
  category: "",
  unit: "pcs",
  purchasePrice: "",
  sellingPrice: "",
  gstRate: "0",
};

const ITEM_COLUMNS = "id, name, category, unit, purchase_price, selling_price, gst_rate";
const PRICE_PATTERN = /^\d{1,10}(\.\d{1,2})?$/;
const GST_PATTERN = /^\d{1,3}(\.\d{1,2})?$/;

export function toItemInput(item: Item): ItemInput {
  return {
    name: item.name,
    category: item.category ?? "",
    unit: item.unit,
    purchasePrice: item.purchase_price === null ? "" : String(item.purchase_price),
    sellingPrice: String(item.selling_price),
    gstRate: String(item.gst_rate),
  };
}

/** Cleans up the form values and checks them. */
export function validateItem(input: ItemInput) {
  const purchasePrice = input.purchasePrice.replace(/[,\s]/g, "");
  const sellingPrice = input.sellingPrice.replace(/[,\s]/g, "");
  const gstRate = input.gstRate.replace(/[%\s]/g, "");

  const errors: ItemFieldErrors = {};
  if (!input.name.trim()) errors.name = itemsText.nameRequired;
  if (purchasePrice && !PRICE_PATTERN.test(purchasePrice)) errors.purchasePrice = itemsText.invalidPrice;
  if (!sellingPrice) errors.sellingPrice = itemsText.sellingPriceRequired;
  else if (!PRICE_PATTERN.test(sellingPrice)) errors.sellingPrice = itemsText.invalidPrice;
  if (!GST_PATTERN.test(gstRate) || Number(gstRate) > 100) errors.gstRate = itemsText.invalidGst;

  const values = {
    name: input.name.trim(),
    category: input.category.trim() || null,
    unit: input.unit,
    purchase_price: purchasePrice ? Number(purchasePrice) : null,
    selling_price: Number(sellingPrice),
    gst_rate: Number(gstRate),
  };

  return { values, errors, ok: Object.keys(errors).length === 0 };
}

export type CleanItemValues = ReturnType<typeof validateItem>["values"];

// Row-level security limits every query below to the user's own business,
// so no business_id filter is needed. Inserts get business_id from the
// column default (current_business_id()).

export async function listMyItems(): Promise<Item[]> {
  const { data, error } = await getSupabaseClient().from("items").select(ITEM_COLUMNS).order("name");
  if (error) throw error;
  return data as Item[];
}

export async function createItem(values: CleanItemValues): Promise<void> {
  const { error } = await getSupabaseClient().from("items").insert(values);
  if (error) throw error;
}

export async function updateItem(id: string, values: CleanItemValues): Promise<void> {
  const { data, error } = await getSupabaseClient().from("items").update(values).eq("id", id).select("id");
  if (error) throw error;
  if (!data?.length) throw new Error("Item not found or not editable");
}

export async function deleteItem(id: string): Promise<void> {
  const { data, error } = await getSupabaseClient().from("items").delete().eq("id", id).select("id");
  if (error) throw error;
  if (!data?.length) throw new Error("Item not found or not deletable");
}

/** True when a save failed because the item name is already used. */
export function isDuplicateNameError(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === "23505";
}

const rupees = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" });

export function formatRupees(value: number): string {
  return rupees.format(value);
}
