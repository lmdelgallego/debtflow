import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between px-6 py-4 border-b border-border">
        <span className="text-lg font-semibold tracking-tight">DebtFlow</span>
        <div className="flex items-center gap-3">
          <Link
            href="/signin"
            className={buttonVariants({ variant: 'ghost', size: 'sm' })}
          >
            Iniciar sesión
          </Link>
          <Link
            href="/signup"
            className={buttonVariants({ size: 'sm' })}
          >
            Comenzar
          </Link>
        </div>
      </header>
      <MaxWidthWrapper className="flex-1 flex flex-col items-center justify-center text-center py-20">
        <div className="mx-auto mb-6 flex max-w-fit items-center justify-center space-x-2 rounded-full border border-border bg-card px-6 py-2">
          <p className="text-sm font-medium text-muted-foreground">
            Gestiona tus deudas con el método avalancha
          </p>
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
          Tu centro de control <span className="text-primary">financiero</span>
        </h1>
        <p className="max-w-xl text-muted-foreground mb-8">
          DebtFlow te ayuda a rastrear ingresos, gastos y deudas para calcular tu flujo de caja disponible y recomendar el orden óptimo de pago.
        </p>
        <Link
          href="/signup"
          className={buttonVariants({ size: 'lg' })}
        >
          Comienza gratis
        </Link>
      </MaxWidthWrapper>
    </div>
  );
}
