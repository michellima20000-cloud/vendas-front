"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ArrowRight, Search } from "lucide-react";

export function StoreLookup() {
  const router = useRouter();
  const [value, setValue] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const slug = value
      .trim()
      .toLowerCase()
      .replace(/^https?:\/\/[^/]+\/loja\//, "")
      .replace(/[^a-z0-9-]+/g, "-")
      .replace(/(^-|-$)/g, "");
    if (slug) router.push(`/loja/${slug}`);
  }

  return (
    <form onSubmit={submit} className="mx-auto mt-8 flex max-w-xl flex-col gap-3 rounded-[1.6rem] bg-white p-2.5 shadow-card-hover sm:flex-row">
      <label className="flex min-w-0 flex-1 items-center gap-3 px-3">
        <Search size={20} className="shrink-0 text-primary" />
        <span className="sr-only">Endereço da loja</span>
        <input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          className="min-w-0 flex-1 bg-transparent py-2 text-sm text-text-title outline-none placeholder:text-text-secondary/70"
          placeholder="Digite o endereço da loja"
        />
      </label>
      <button type="submit" className="btn-primary w-full shrink-0 sm:w-auto">
        Visitar loja <ArrowRight size={17} />
      </button>
    </form>
  );
}
