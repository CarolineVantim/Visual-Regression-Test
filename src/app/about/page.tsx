import Image from "next/image";

export default function About() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 sm:p-16 font-sans">
      <main className="max-w-2xl text-center space-y-8">
        <Image
          src="/next.svg"
          alt="Next.js logo"
          width={150}
          height={40}
          className="mx-auto dark:invert"
          priority
        />
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
          Sobre este projeto
        </h1>
        <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300">
          Este é um exemplo de nova página criada com Next.js 14 e Tailwind CSS. 
        </p>

        <a
          className="inline-flex items-center justify-center rounded-full bg-foreground text-background hover:bg-[#383838] dark:hover:bg-[#ccc] transition-colors font-medium text-sm sm:text-base h-10 sm:h-12 px-6"
        >
          Voltar para a Home
        </a>
      </main>

      <footer className="mt-16 text-sm text-gray-500 dark:text-gray-400">
        © {new Date().getFullYear()} - Criado com ❤️ usando Next.js
      </footer>
    </div>
  );
}
