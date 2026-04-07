import { Moon, Sun } from "lucide-react";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import { ptBR } from "@/messages/pt-BR";
import { useThemeStore } from "@/stores/theme-store";

export function ModeToggle() {
  const toggleTheme = useThemeStore((s) => s.toggleTheme);

  return (
    <SidebarMenuButton
      type="button"
      onClick={() => toggleTheme()}
      tooltip={ptBR.theme.toggle}
      aria-label={ptBR.theme.toggle}
    >
      <span className="relative block size-4 shrink-0">
        <Sun className="size-4 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
        <Moon className="absolute inset-0 size-4 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
      </span>
      <span>{ptBR.theme.label}</span>
    </SidebarMenuButton>
  );
}
