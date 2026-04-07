import { Pencil } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { School } from "@/lib/schemas/school";
import { ptBR } from "@/messages/pt-BR";

function initialsFromTitle(title?: string) {
  const value = title?.trim();
  if (!value) return "ES";
  return value
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function SchoolScopeHeader(props: {
  school: School | null;
  menuTrigger: React.ReactNode;
  onEditSchool: () => void;
}) {
  return (
    <div className="flex items-center gap-2">
      {props.menuTrigger}
      <Button
        variant="ghost"
        size="icon-sm"
        type="button"
        aria-label={ptBR.scope.editSchool}
        onClick={props.onEditSchool}
      >
        <Pencil className="size-4" />
      </Button>
    </div>
  );
}

export function SchoolScopeSummary({ school }: { school: School | null }) {
  const title = school?.title?.trim() || ptBR.scope.noSchoolSelected;
  return (
    <div className="flex min-w-0 items-center gap-2">
      <Avatar size="sm">
        {school?.faviconUrl ? (
          <AvatarImage src={school.faviconUrl} alt={title} />
        ) : null}
        <AvatarFallback>{initialsFromTitle(school?.title)}</AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <p className="truncate font-medium text-sm" title={title}>
          {title}
        </p>
        <p className="truncate text-muted-foreground text-xs">
          {ptBR.scope.placeholderUser}
        </p>
      </div>
    </div>
  );
}
