import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-6 text-center text-white">
      <div className="max-w-xl rounded-3xl border border-white/10 bg-zinc-950 p-8 shadow-2xl">
        <p className="text-sm font-bold uppercase tracking-[.3em] text-sun">404</p>
        <h1 className="mt-3 font-display text-4xl font-black text-white">Página não encontrada</h1>
        <p className="mt-4 text-zinc-300">A página que procura não está disponível ou foi movida.</p>
        <Link className="mt-6 inline-flex rounded-full bg-sun px-5 py-3 font-bold text-black" href="/">
          Voltar ao site
        </Link>
      </div>
    </main>
  );
}
