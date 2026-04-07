import { createFileRoute } from "@tanstack/react-router";
import { ptBR } from "@/messages/pt-BR";

export const Route = createFileRoute("/schools/$schoolId/home")({
  component: SchoolHomePage,
});

function SchoolHomePage() {
  return (
    <div className="p-6">
      <h1 className="text-lg font-medium">{ptBR.nav.home}</h1>
      <p className="text-muted-foreground text-sm">
        {ptBR.scope.homePlaceholder}
      </p>
    </div>
  );
}
