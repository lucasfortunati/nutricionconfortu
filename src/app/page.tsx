import { Calculator } from "@/components/calculator/Calculator";
import { DisclaimerBanner } from "@/components/layout/DisclaimerBanner";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-zinc-950">
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6">
        <header className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Calculadora de requerimiento calórico
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Calculá tu TMB, tu gasto energético total y la distribución de macronutrientes según tu objetivo.
          </p>
        </header>

        <DisclaimerBanner />

        <Calculator />
      </main>
    </div>
  );
}
