"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { Bilingual } from "@/components/bilingual";
import { Field, FieldShell, LinkButton, Message, SubmitButton, TextAreaField } from "@/components/auth-ui";
import { authText, type BilingualText } from "@/lib/auth-text";
import {
  createMyBusiness,
  getLogoUrl,
  loadMyBusiness,
  LOGO_TYPES,
  updateMyBusiness,
  uploadMyLogo,
  validateBusiness,
  type Business,
  type BusinessInput,
  type BusinessLanguage,
  type FieldErrors,
} from "@/lib/business";
import { businessText } from "@/lib/business-text";
import { useRequireUser } from "@/lib/use-require-user";
import { cn } from "@/lib/utils";

const emptyInput: BusinessInput = { name: "", phone: "", address: "", gstin: "", upiId: "", language: "ta" };

function optional(label: BilingualText): BilingualText {
  return { ta: `${label.ta} (${businessText.optional.ta})`, en: `${label.en} (${businessText.optional.en})` };
}

function toInput(business: Business): BusinessInput {
  return {
    name: business.name,
    phone: business.phone ?? "",
    address: business.address ?? "",
    gstin: business.gstin ?? "",
    upiId: business.upi_id ?? "",
    language: business.language,
  };
}

type Status = { tone: "error" | "success"; text: BilingualText } | null;

export function BusinessForm() {
  const user = useRequireUser();
  const [loading, setLoading] = useState(true);
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [input, setInput] = useState<BusinessInput>(emptyInput);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<Status>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    loadMyBusiness(user.id)
      .then(async (business) => {
        if (cancelled || !business) return;
        setBusinessId(business.id);
        setInput(toInput(business));
        if (business.logo_path) {
          const url = await getLogoUrl(business.logo_path);
          if (!cancelled) setLogoUrl(url);
        }
      })
      .catch((error) => {
        console.error("Loading business failed:", error);
        if (!cancelled) setStatus({ tone: "error", text: businessText.loadFailed });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  // Free the local preview URL when it changes or the page closes.
  useEffect(() => {
    return () => {
      if (logoPreview) URL.revokeObjectURL(logoPreview);
    };
  }, [logoPreview]);

  function update<K extends keyof BusinessInput>(key: K, value: BusinessInput[K]) {
    setInput((current) => ({ ...current, [key]: value }));
  }

  function handleLogoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setLogoFile(file);
    setLogoPreview(file ? URL.createObjectURL(file) : null);
    setFieldErrors((current) => ({ ...current, logo: validateBusiness(input, file).errors.logo }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);

    const { values, errors, ok } = validateBusiness(input, logoFile);
    setFieldErrors(errors);
    if (!ok) return;

    setBusy(true);
    let savedId = businessId;
    try {
      if (savedId) {
        await updateMyBusiness(savedId, values);
      } else {
        savedId = await createMyBusiness(values);
        setBusinessId(savedId);
      }
      // Show the cleaned-up values (e.g. GSTIN in capitals).
      setInput({
        name: values.name,
        phone: values.phone ?? "",
        address: values.address ?? "",
        gstin: values.gstin ?? "",
        upiId: values.upi_id ?? "",
        language: values.language,
      });
    } catch (error) {
      console.error("Saving business failed:", error);
      setStatus({ tone: "error", text: businessText.saveFailed });
      setBusy(false);
      return;
    }

    const wasCreated = !businessId;
    if (logoFile) {
      try {
        const path = await uploadMyLogo(savedId, logoFile);
        setLogoUrl(await getLogoUrl(path));
        setLogoFile(null);
        setLogoPreview(null);
      } catch (error) {
        console.error("Uploading logo failed:", error);
        setStatus({ tone: "error", text: businessText.logoUploadFailed });
        setBusy(false);
        return;
      }
    }

    setStatus({ tone: "success", text: wasCreated ? businessText.created : businessText.saved });
    setBusy(false);
  }

  if (!user || loading) {
    return <Bilingual text={authText.loading} className="text-sm opacity-70" />;
  }

  const shownLogo = logoPreview ?? logoUrl;

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      {!businessId && <Bilingual text={businessText.setupIntro} className="text-sm" />}

      <Field
        id="name"
        label={businessText.name}
        value={input.name}
        onChange={(e) => update("name", e.target.value)}
        error={fieldErrors.name}
        autoComplete="organization"
        maxLength={200}
        required
      />

      <FieldShell id="logo" label={optional(businessText.logo)} hint={businessText.logoHint} error={fieldErrors.logo}>
        <div className="flex items-center gap-3">
          <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-zinc-300 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900">
            {shownLogo && (
              // eslint-disable-next-line @next/next/no-img-element -- private signed URL / local preview
              <img src={shownLogo} alt="" className="size-full object-contain" />
            )}
          </div>
          <input
            id="logo"
            type="file"
            accept={LOGO_TYPES.join(",")}
            onChange={handleLogoChange}
            aria-invalid={fieldErrors.logo ? true : undefined}
            className="w-full min-w-0 text-sm file:mr-3 file:min-h-11 file:rounded-lg file:border file:border-zinc-300 file:bg-white file:px-3 file:text-sm file:font-medium dark:file:border-zinc-700 dark:file:bg-zinc-900 dark:file:text-zinc-100"
          />
        </div>
      </FieldShell>

      <TextAreaField
        id="address"
        label={optional(businessText.address)}
        value={input.address}
        onChange={(e) => update("address", e.target.value)}
        autoComplete="street-address"
        rows={3}
        maxLength={500}
      />

      <Field
        id="phone"
        type="tel"
        inputMode="tel"
        label={optional(businessText.phone)}
        hint={businessText.phoneHint}
        value={input.phone}
        onChange={(e) => update("phone", e.target.value)}
        error={fieldErrors.phone}
        autoComplete="tel"
        maxLength={20}
      />

      <Field
        id="gstin"
        label={optional(businessText.gstin)}
        hint={businessText.gstinHint}
        value={input.gstin}
        onChange={(e) => update("gstin", e.target.value.toUpperCase())}
        error={fieldErrors.gstin}
        autoCapitalize="characters"
        autoCorrect="off"
        spellCheck={false}
        maxLength={20}
      />

      <Field
        id="upiId"
        label={optional(businessText.upiId)}
        hint={businessText.upiHint}
        value={input.upiId}
        onChange={(e) => update("upiId", e.target.value)}
        error={fieldErrors.upiId}
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        maxLength={100}
      />

      <fieldset className="flex flex-col gap-1.5">
        <legend className="mb-1.5 text-sm font-medium">
          <Bilingual text={businessText.language} />
        </legend>
        <div className="grid grid-cols-2 gap-3">
          {(
            [
              ["ta", businessText.tamil],
              ["en", businessText.english],
            ] as [BusinessLanguage, BilingualText][]
          ).map(([value, text]) => (
            <label
              key={value}
              className={cn(
                "flex min-h-12 cursor-pointer items-center gap-2 rounded-lg border px-3 py-2",
                input.language === value
                  ? "border-zinc-900 ring-2 ring-zinc-900/20 dark:border-zinc-100 dark:ring-zinc-100/20"
                  : "border-zinc-300 dark:border-zinc-700",
              )}
            >
              <input
                type="radio"
                name="language"
                value={value}
                checked={input.language === value}
                onChange={() => update("language", value)}
                className="size-4"
              />
              <Bilingual text={text} className="text-sm" />
            </label>
          ))}
        </div>
      </fieldset>

      {status && <Message text={status.text} tone={status.tone} />}
      <SubmitButton busy={busy} label={businessId ? businessText.saveButton : businessText.createButton} />
      <LinkButton href="/dashboard" text={businessText.backToDashboard} variant="secondary" />
    </form>
  );
}
