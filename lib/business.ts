import type { BilingualText } from "@/lib/auth-text";
import { businessText } from "@/lib/business-text";
import { getSupabaseClient } from "@/lib/supabase";

export type BusinessLanguage = "ta" | "en";

export type Business = {
  id: string;
  name: string;
  phone: string | null;
  address: string | null;
  gstin: string | null;
  upi_id: string | null;
  language: BusinessLanguage;
  logo_path: string | null;
};

/** Form values before validation. Empty strings mean "not filled in". */
export type BusinessInput = {
  name: string;
  phone: string;
  address: string;
  gstin: string;
  upiId: string;
  language: BusinessLanguage;
};

export type BusinessField = "name" | "phone" | "gstin" | "upiId" | "logo";
export type FieldErrors = Partial<Record<BusinessField, BilingualText>>;

export const LOGO_BUCKET = "business-logos";
export const LOGO_TYPES = ["image/png", "image/jpeg", "image/webp"];
export const LOGO_MAX_BYTES = 2 * 1024 * 1024;

// Same rules as the check constraints in supabase/migrations.
const GSTIN_PATTERN = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
const UPI_PATTERN = /^[A-Za-z0-9._-]{2,255}@[A-Za-z]{2,64}$/;
const PHONE_PATTERN = /^\+?[0-9]{10,13}$/;

const BUSINESS_COLUMNS = "id, name, phone, address, gstin, upi_id, language, logo_path";

/** Cleans up the form values and checks them. Returns either clean values or errors. */
export function validateBusiness(input: BusinessInput, logo: File | null) {
  const values = {
    name: input.name.trim(),
    phone: input.phone.replace(/[\s-]/g, "") || null,
    address: input.address.trim() || null,
    gstin: input.gstin.replace(/\s/g, "").toUpperCase() || null,
    upi_id: input.upiId.trim() || null,
    language: input.language,
  };

  const errors: FieldErrors = {};
  if (!values.name) errors.name = businessText.nameRequired;
  if (values.phone && !PHONE_PATTERN.test(values.phone)) errors.phone = businessText.invalidPhone;
  if (values.gstin && !GSTIN_PATTERN.test(values.gstin)) errors.gstin = businessText.invalidGstin;
  if (values.upi_id && !UPI_PATTERN.test(values.upi_id)) errors.upiId = businessText.invalidUpi;
  if (logo && !LOGO_TYPES.includes(logo.type)) errors.logo = businessText.logoWrongType;
  else if (logo && logo.size > LOGO_MAX_BYTES) errors.logo = businessText.logoTooLarge;

  return { values, errors, ok: Object.keys(errors).length === 0 };
}

export type CleanBusinessValues = ReturnType<typeof validateBusiness>["values"];

/** Loads the business linked to the user's profile, or null if they have none yet. */
export async function loadMyBusiness(userId: string): Promise<Business | null> {
  const supabase = getSupabaseClient();

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("business_id")
    .eq("id", userId)
    .maybeSingle();
  if (profileError) throw profileError;
  if (!profile) return null;

  const { data: business, error } = await supabase
    .from("businesses")
    .select(BUSINESS_COLUMNS)
    .eq("id", profile.business_id)
    .single();
  if (error) throw error;
  return business as Business;
}

/** Creates a business and links it to the current user as owner. Returns the new id. */
export async function createMyBusiness(values: CleanBusinessValues): Promise<string> {
  const { data, error } = await getSupabaseClient().rpc("create_business_for_current_user", {
    p_name: values.name,
    p_phone: values.phone,
    p_address: values.address,
    p_gstin: values.gstin,
    p_upi_id: values.upi_id,
    p_language: values.language,
  });
  if (error) throw error;
  return data as string;
}

/** Updates the user's own business. Row-level security blocks any other business. */
export async function updateMyBusiness(id: string, values: CleanBusinessValues): Promise<void> {
  const { data, error } = await getSupabaseClient()
    .from("businesses")
    .update(values)
    .eq("id", id)
    .select("id");
  if (error) throw error;
  if (!data?.length) throw new Error("Business not found or not editable");
}

/** Uploads (or replaces) the business logo and records its path. Returns the path. */
export async function uploadMyLogo(businessId: string, file: File): Promise<string> {
  const supabase = getSupabaseClient();
  const path = `${businessId}/logo`;

  const { error: uploadError } = await supabase.storage
    .from(LOGO_BUCKET)
    .upload(path, file, { upsert: true, contentType: file.type, cacheControl: "60" });
  if (uploadError) throw uploadError;

  const { error } = await supabase.from("businesses").update({ logo_path: path }).eq("id", businessId);
  if (error) throw error;
  return path;
}

/** Short-lived link for showing the private logo. */
export async function getLogoUrl(path: string): Promise<string | null> {
  const { data } = await getSupabaseClient().storage.from(LOGO_BUCKET).createSignedUrl(path, 60 * 60);
  return data?.signedUrl ?? null;
}
