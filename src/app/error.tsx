"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="grid min-h-screen place-items-center px-5 text-center">
      <div>
        <span className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-red-50 text-red-600">
          <AlertTriangle size={34} />
        </span>
        <h1 className="mt-6 font-display text-4xl font-bold text-text-title">Algo deu errado</h1>
        <p className="mx-auto mt-3 max-w-md text-text-secondary">
          Não foi possível carregar esta página. Verifique sua conexão e tente novamente.
        </p>
        <button type="button" onClick={reset} className="btn-primary mt-7">
          <RotateCcw size={17} /> Tentar novamente
        </button>
      </div>
    </main>
  );
}
