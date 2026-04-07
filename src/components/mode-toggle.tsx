import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ptBR } from "@/messages/pt-BR";
import { useThemeStore } from "@/stores/theme-store";

export function ModeToggle() {
  const toggleTheme = useThemeStore((s) => s.toggleTheme);

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="relative"
      onClick={() => toggleTheme()}
      aria-label={ptBR.theme.toggle}
    >
      <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
    </Button>
  );
}
