import Link from "next/link";
import { ArrowLeft, SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center px-5 text-center">
      <div>
        <span className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-primary-light text-primary">
          <SearchX size={34} />
        </span>
        <p className="mt-6 text-sm font-black uppercase tracking-[0.18em] text-primary">Erro 404</p>
        <h1 className="mt-2 font-display text-4xl font-bold text-text-title">Não encontramos esta página</h1>
        <p className="mx-auto mt-3 max-w-md text-text-secondary">
          O endereço pode ter mudado ou a loja não está mais disponível.
        </p>
        <Link href="/" className="btn-primary mt-7">
          <ArrowLeft size={17} /> Voltar ao início
        </Link>
      </div>
    </main>
  );
}
