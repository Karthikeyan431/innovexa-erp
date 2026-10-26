import type { BilingualText } from "@/lib/auth-text";
import { cn } from "@/lib/utils";

/** Shows Tamil text with the English text under it. */
export function Bilingual({ text, className }: { text: BilingualText; className?: string }) {
  return (
    <span className={cn("flex flex-col", className)}>
      <span lang="ta">{text.ta}</span>
      <span lang="en" className="text-[0.85em] opacity-70">
        {text.en}
      </span>
    </span>
  );
}
