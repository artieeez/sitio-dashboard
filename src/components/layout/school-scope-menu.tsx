import { Link } from "@tanstack/react-router";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { School } from "@/lib/schemas/school";
import { ptBR } from "@/messages/pt-BR";

export function SchoolScopeMenu(props: {
  schools: School[];
  onSelectSchool: (schoolId: string) => void;
  children: React.ReactNode;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={props.children} />
      <DropdownMenuContent sideOffset={6}>
        {props.schools.map((school) => (
          <DropdownMenuItem
            key={school.id}
            onClick={() => props.onSelectSchool(school.id)}
          >
            {school.title?.trim() ||
              `${ptBR.entities.school} ${school.id.slice(0, 8)}…`}
          </DropdownMenuItem>
        ))}
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
