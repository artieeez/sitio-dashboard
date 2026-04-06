import { createFileRoute, Link } from "@tanstack/react-router";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ptBR } from "@/messages/pt-BR";

export const Route = createFileRoute("/")({ component: HomePage });

function HomePage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6">
      <h1 className="text-lg font-medium">Sítio — Viagens escolares</h1>
      <Link to="/schools" className={cn(buttonVariants({ size: "lg" }))}>
        {ptBR.entities.schools}
      </Link>
    </div>
  );
}
