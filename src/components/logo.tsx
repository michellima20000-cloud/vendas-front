import Link from "next/link";
import { cn } from "@/lib/cn";

export function Logo({ inverse = false, className }: { inverse?: boolean; className?: string }) {
  return (
    <Link href="/" className={cn("inline-flex items-center gap-2", className)}>
      <span
        className={cn(
          "grid h-9 w-9 place-items-center rounded-xl bg-primary text-sm font-black text-white shadow-card",
          inverse && "bg-white/15 text-white backdrop-blur",
        )}
      >
        VB
      </span>
      <span className={cn("font-display text-xl font-bold", inverse ? "text-white" : "text-text-title")}>
        Vendas Black
      </span>
    </Link>
  );
}
