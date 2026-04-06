import { Link } from "@tanstack/react-router";
import { ptBR } from "@/messages/pt-BR";

export function RouteInvalidRecovery(props: {
  backTo: "/" | "/schools";
  linkLabel: string;
}) {
  return (
    <div className="p-6">
      <p className="text-sm text-amber-800 dark:text-amber-200" role="alert">
        {ptBR.shell.invalidRoute}
      </p>
      <Link
        to={props.backTo}
        className="mt-3 inline-block text-sm font-medium text-primary hover:underline"
      >
        ← {props.linkLabel}
      </Link>
    </div>
  );
}
