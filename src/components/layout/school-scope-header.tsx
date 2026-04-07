import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { School } from "@/lib/schemas/school";
import { ptBR } from "@/messages/pt-BR";

function initialsFromTitle(title?: string | null) {
  const value = title?.trim();
  if (!value) return "ES";
  return value
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function SchoolScopeAvatar({ school }: { school: School | null }) {
  const title = school?.title?.trim() || ptBR.scope.noSchoolSelected;
  return (
    <Avatar size="sm" variant="rounded">
      {school?.faviconUrl ? (
        <AvatarImage src={school.faviconUrl} alt={title} />
      ) : null}
      <AvatarFallback>{initialsFromTitle(school?.title)}</AvatarFallback>
    </Avatar>
  );
}

export function SchoolScopeSummary({ school }: { school: School | null }) {
  const title = school?.title?.trim() || ptBR.scope.noSchoolSelected;
  return (
    <div className="flex min-w-0 flex-1 items-center gap-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0">
      <SchoolScopeAvatar school={school} />
      <div className="min-w-0 group-data-[collapsible=icon]:hidden">
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
