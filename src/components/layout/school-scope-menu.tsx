import { Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import type { School } from "@/lib/schemas/school";
import type { RecentSchoolEntry } from "@/lib/schemas/scope";
import { filterSchoolsByTitle, orderRecentSchools } from "@/lib/scope-search";
import { ptBR } from "@/messages/pt-BR";

export function SchoolScopeMenu(props: {
  schools: School[];
  recents: RecentSchoolEntry[];
  onSelectSchool: (schoolId: string) => void;
  children: React.ReactNode;
}) {
  const [query, setQuery] = useState("");
  const recentSchools = useMemo(
    () => orderRecentSchools(props.schools, props.recents),
    [props.schools, props.recents],
  );
  const filtered = useMemo(
    () => filterSchoolsByTitle(props.schools, query),
    [props.schools, query],
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={props.children} />
      <DropdownMenuContent sideOffset={6}>
        <div className="p-1">
          <Input
            value={query}
            onChange={(ev) => setQuery(ev.target.value)}
            placeholder={ptBR.scope.searchPlaceholder}
            aria-label={ptBR.scope.searchPlaceholder}
          />
        </div>
        {/* Base UI: GroupLabel must be inside Menu.Group */}
        <DropdownMenuGroup>
          <DropdownMenuLabel>{ptBR.scope.recents}</DropdownMenuLabel>
          {recentSchools.length === 0 ? (
            <DropdownMenuItem disabled>{ptBR.scope.noRecents}</DropdownMenuItem>
          ) : null}
          {recentSchools.map((school) => (
            <DropdownMenuItem
              key={school.id}
              onClick={() => props.onSelectSchool(school.id)}
            >
              {school.title?.trim() ||
                `${ptBR.entities.school} ${school.id.slice(0, 8)}…`}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel>{ptBR.scope.searchResults}</DropdownMenuLabel>
          {filtered.length === 0 ? (
            <DropdownMenuItem disabled>{ptBR.scope.noResults}</DropdownMenuItem>
          ) : null}
          {filtered.map((school) => (
            <DropdownMenuItem
              key={`search-${school.id}`}
              onClick={() => props.onSelectSchool(school.id)}
            >
              {school.title?.trim() ||
                `${ptBR.entities.school} ${school.id.slice(0, 8)}…`}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          render={<Link to="/schools/new" aria-label={ptBR.scope.addSchool} />}
        >
          {ptBR.scope.addSchool}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
