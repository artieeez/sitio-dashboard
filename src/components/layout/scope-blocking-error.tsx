import { Button } from "@/components/ui/button";
import { ptBR } from "@/messages/pt-BR";

export function ScopeBlockingError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="p-6">
      <p className="text-sm text-red-600" role="alert">
        {ptBR.scope.initError}
      </p>
      <Button className="mt-3" type="button" onClick={onRetry}>
        {ptBR.scope.retry}
      </Button>
    </div>
  );
}
