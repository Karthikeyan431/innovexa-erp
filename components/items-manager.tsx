"use client";

import { useCallback, useEffect, useState } from "react";
import { Bilingual } from "@/components/bilingual";
import { ItemForm } from "@/components/item-form";
import { LinkButton, Message } from "@/components/auth-ui";
import { authText, type BilingualText } from "@/lib/auth-text";
import { loadMyBusiness } from "@/lib/business";
import { formatRupees, listMyItems, type Item } from "@/lib/items";
import { itemsText, unitText } from "@/lib/items-text";
import { useRequireUser } from "@/lib/use-require-user";

type Mode = { kind: "list" } | { kind: "new" } | { kind: "edit"; item: Item };
type Status = { tone: "error" | "success"; text: BilingualText } | null;

export function ItemsManager() {
  const user = useRequireUser();
  const [loading, setLoading] = useState(true);
  const [hasBusiness, setHasBusiness] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [mode, setMode] = useState<Mode>({ kind: "list" });
  const [status, setStatus] = useState<Status>(null);

  const refresh = useCallback(async () => {
    try {
      setItems(await listMyItems());
    } catch (error) {
      console.error("Loading items failed:", error);
      setStatus({ tone: "error", text: itemsText.loadFailed });
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    loadMyBusiness(user.id)
      .then(async (business) => {
        if (cancelled) return;
        setHasBusiness(Boolean(business));
        if (business) await refresh();
      })
      .catch((error) => {
        console.error("Loading business failed:", error);
        if (!cancelled) setStatus({ tone: "error", text: itemsText.loadFailed });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user, refresh]);

  if (!user || loading) {
    return <Bilingual text={authText.loading} className="text-sm opacity-70" />;
  }

  if (!hasBusiness) {
    return (
      <div className="flex flex-col gap-4">
        {status ? <Message text={status.text} tone={status.tone} /> : <Message text={itemsText.needBusiness} tone="error" />}
        <LinkButton href="/business" text={itemsText.openBusinessProfile} />
        <LinkButton href="/dashboard" text={itemsText.backToDashboard} variant="secondary" />
      </div>
    );
  }

  if (mode.kind !== "list") {
    const categories = [...new Set(items.map((item) => item.category).filter((c): c is string => Boolean(c)))].sort();
    return (
      <ItemForm
        key={mode.kind === "edit" ? mode.item.id : "new"}
        item={mode.kind === "edit" ? mode.item : null}
        categories={categories}
        onCancel={() => setMode({ kind: "list" })}
        onDone={async (message) => {
          await refresh();
          setStatus({ tone: "success", text: message });
          setMode({ kind: "list" });
        }}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        onClick={() => {
          setStatus(null);
          setMode({ kind: "new" });
        }}
        className="min-h-12 w-full rounded-lg bg-zinc-900 px-4 py-2 font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
      >
        <Bilingual text={{ ta: `+ ${itemsText.addItem.ta}`, en: itemsText.addItem.en }} className="items-center" />
      </button>

      {status && <Message text={status.text} tone={status.tone} />}

      {items.length === 0 ? (
        <Bilingual text={itemsText.emptyList} className="py-6 text-center text-sm opacity-80" />
      ) : (
        <>
          <p className="text-sm opacity-70">
            {items.length} {itemsText.itemCount.ta} · {items.length} {itemsText.itemCount.en}
          </p>
          <ul className="flex flex-col gap-3">
            {items.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => {
                    setStatus(null);
                    setMode({ kind: "edit", item });
                  }}
                  className="flex w-full flex-col gap-2 rounded-lg border border-zinc-200 px-3 py-3 text-left hover:border-zinc-400 dark:border-zinc-800 dark:hover:border-zinc-600"
                >
                  <span className="flex items-start justify-between gap-3">
                    <span className="min-w-0">
                      <span className="block break-words font-medium">{item.name}</span>
                      {item.category && <span className="block text-sm opacity-70">{item.category}</span>}
                    </span>
                    <span className="shrink-0 text-sm font-medium underline underline-offset-4">
                      {itemsText.edit.ta} · {itemsText.edit.en}
                    </span>
                  </span>
                  <span className="grid grid-cols-3 gap-2 text-sm">
                    <span>
                      <span className="block text-xs opacity-70">
                        {itemsText.sell.ta} · {itemsText.sell.en}
                      </span>
                      {formatRupees(item.selling_price)}
                    </span>
                    <span>
                      <span className="block text-xs opacity-70">
                        {itemsText.buy.ta} · {itemsText.buy.en}
                      </span>
                      {item.purchase_price === null ? "—" : formatRupees(item.purchase_price)}
                    </span>
                    <span>
                      <span className="block text-xs opacity-70">GST</span>
                      {item.gst_rate}%
                    </span>
                  </span>
                  <span className="text-xs opacity-70">
                    {unitText[item.unit].ta} · {unitText[item.unit].en}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      <LinkButton href="/dashboard" text={itemsText.backToDashboard} variant="secondary" />
    </div>
  );
}
