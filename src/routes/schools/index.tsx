import { createFileRoute } from "@tanstack/react-router";

import { ptBR } from "@/messages/pt-BR";

export const Route = createFileRoute("/schools/")({
  component: SchoolsIndexDetailPlaceholder,
});

function SchoolsIndexDetailPlaceholder() {
  return (
    <div className="p-6 text-sm text-muted-foreground">
      {ptBR.listDetail.selectSchoolPrompt}
    </div>
  );
}
