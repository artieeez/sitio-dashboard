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

export type ActivateSchoolDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  school: School | null;
  includeInactive: boolean;
};

export function ActivateSchoolDialog({
  open,
  onOpenChange,
  school,
  includeInactive,
}: ActivateSchoolDialogProps) {
  const qc = useQueryClient();
  const copy = ptBR.activateSchoolDialog;

  const activateMutation = useMutation({
    mutationFn: async () => {
      const id = school?.id;
      if (!id) {
        throw new Error("School id required for activate");
      }
      await apiPostJson<void>(`/schools/${id}/activate`, {});
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

  const errMessage =
    activateMutation.error != null ? copy.activateFailed : null;

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (!next && !activateMutation.isPending) {
          onOpenChange(false);
        }
      }}
    >
      <AlertDialogContent
        className="data-[size=default]:sm:max-w-lg"
        data-testid="activate-school-dialog"
      >
        <AlertDialogHeader>
          <AlertDialogTitle>{copy.title}</AlertDialogTitle>
          {school ? (
            <AlertDialogDescription>
              {copy.intro(schoolDisplayName(school))}
            </AlertDialogDescription>
          ) : null}
        </AlertDialogHeader>
        {errMessage ? (
          <p className="text-sm text-destructive" role="alert">
            {errMessage}
          </p>
        ) : null}
        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={activateMutation.isPending}
            onClick={() => onOpenChange(false)}
          >
            {ptBR.actions.cancel}
          </AlertDialogCancel>
          <Button
            type="button"
            disabled={!school || activateMutation.isPending}
            onClick={() => activateMutation.mutate()}
          >
            {ptBR.actions.activate}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
