import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { apiPostJson } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import type { School } from "@/lib/schemas/school";
import { ptBR } from "@/messages/pt-BR";

function schoolDisplayName(s: School): string {
  return s.title?.trim() || `${ptBR.entities.school} ${s.id.slice(0, 8)}…`;
}

export type DeactivateSchoolDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  school: School | null;
  includeInactive: boolean;
};

export function DeactivateSchoolDialog({
  open,
  onOpenChange,
  school,
  includeInactive,
}: DeactivateSchoolDialogProps) {
  const qc = useQueryClient();
  const copy = ptBR.deactivateSchoolDialog;

  const deactivateMutation = useMutation({
    mutationFn: async () => {
      const id = school?.id;
      if (!id) {
        throw new Error("School id required for deactivate");
      }
      await apiPostJson<void>(`/schools/${id}/deactivate`, {});
    },
    onSuccess: async () => {
      const id = school?.id;
      await qc.invalidateQueries({
        queryKey: queryKeys.schools(includeInactive),
      });
      if (id) {
        await qc.invalidateQueries({ queryKey: queryKeys.school(id) });
      }
      await qc.invalidateQueries({ queryKey: queryKeys.scopeSchools() });
      onOpenChange(false);
    },
  });

  const err = deactivateMutation.error;
  const errMessage = err != null ? copy.deactivateFailed : null;

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (!next && !deactivateMutation.isPending) {
          onOpenChange(false);
        }
      }}
    >
      <AlertDialogContent
        className="data-[size=default]:sm:max-w-lg"
        data-testid="deactivate-school-dialog"
      >
        <AlertDialogHeader>
          <AlertDialogTitle>{copy.title}</AlertDialogTitle>
          {school ? (
            <AlertDialogDescription>
              {copy.intro(schoolDisplayName(school))}
            </AlertDialogDescription>
          ) : null}
        </AlertDialogHeader>
        {school ? (
          <p className="text-sm text-muted-foreground">{copy.hint}</p>
        ) : null}
        {errMessage ? (
          <p className="text-sm text-destructive" role="alert">
            {errMessage}
          </p>
        ) : null}
        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={deactivateMutation.isPending}
            onClick={() => onOpenChange(false)}
          >
            {ptBR.actions.cancel}
          </AlertDialogCancel>
          <Button
            type="button"
            variant="secondary"
            disabled={!school || deactivateMutation.isPending}
            onClick={() => deactivateMutation.mutate()}
          >
            {ptBR.actions.deactivate}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
