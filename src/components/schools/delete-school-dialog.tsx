import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import { Skeleton } from "@/components/ui/skeleton";
import { apiDelete, apiJson } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import type { School } from "@/lib/schemas/school";
import { schoolDeleteEligibilitySchema } from "@/lib/schemas/school";
import { ptBR } from "@/messages/pt-BR";

function schoolDisplayName(s: School): string {
  return s.title?.trim() || `${ptBR.entities.school} ${s.id.slice(0, 8)}…`;
}

export type DeleteSchoolDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  school: School | null;
  includeInactive: boolean;
};

export function DeleteSchoolDialog({
  open,
  onOpenChange,
  school,
  includeInactive,
}: DeleteSchoolDialogProps) {
  const qc = useQueryClient();
  const copy = ptBR.deleteSchoolDialog;

  const eligibilityQuery = useQuery({
    queryKey: queryKeys.schoolDeleteEligibility(school?.id ?? ""),
    queryFn: async () => {
      const id = school?.id;
      if (!id) {
        throw new Error("School id required for delete eligibility");
      }
      const raw = await apiJson<unknown>(`/schools/${id}/delete-eligibility`);
      return schoolDeleteEligibilitySchema.parse(raw);
    },
    enabled: open && school != null,
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const id = school?.id;
      if (!id) {
        throw new Error("School id required for delete");
      }
      await apiDelete(`/schools/${id}`);
    },
    onSuccess: async () => {
      const id = school?.id;
      await qc.invalidateQueries({
        queryKey: queryKeys.schools(includeInactive),
      });
      if (id) {
        await qc.invalidateQueries({ queryKey: queryKeys.school(id) });
      }
      onOpenChange(false);
    },
  });

  const el = eligibilityQuery.data;
  const loading = eligibilityQuery.isPending;
  const blocked =
    el != null &&
    (!el.canDelete ||
      el.errorCode === "WIX_NOT_CONFIGURED" ||
      el.errorCode === "WIX_QUERY_FAILED");
  const canConfirm =
    el?.canDelete === true && el.errorCode == null && !deleteMutation.isPending;

  let bodyText: string | null = null;
  if (el) {
    if (el.errorCode === "WIX_NOT_CONFIGURED") {
      bodyText = copy.wixNotConfigured;
    } else if (el.errorCode === "WIX_QUERY_FAILED") {
      bodyText = copy.wixQueryFailed;
    } else if (
      !el.canDelete &&
      el.productCount != null &&
      el.productCount > 0
    ) {
      bodyText = copy.cannotBlockedProducts(el.productCount);
    } else if (el.wixCollectionMissing) {
      bodyText = copy.orphanCollectionHint;
    } else if (el.hasWixCollection && el.productCount === 0) {
      bodyText = copy.emptyCollectionHint;
    }
  }

  const err = deleteMutation.error;
  const errStatus =
    err != null &&
    typeof err === "object" &&
    "status" in err &&
    typeof (err as { status: unknown }).status === "number"
      ? (err as { status: number }).status
      : null;
  const deleteError =
    err != null
      ? errStatus === 409
        ? copy.deleteConflict
        : copy.deleteFailed
      : null;

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (!next && !deleteMutation.isPending) {
          onOpenChange(false);
        }
      }}
    >
      <AlertDialogContent
        className="data-[size=default]:sm:max-w-lg"
        data-testid="delete-school-dialog"
      >
        <AlertDialogHeader>
          <AlertDialogTitle>{copy.title}</AlertDialogTitle>
          {school ? (
            <AlertDialogDescription>
              {copy.intro(schoolDisplayName(school))}
            </AlertDialogDescription>
          ) : null}
        </AlertDialogHeader>
        <div className="flex flex-col gap-3 text-sm">
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <p className="text-muted-foreground">{copy.checking}</p>
            </div>
          ) : eligibilityQuery.isError ? (
            <p className="text-destructive" role="alert">
              {copy.wixQueryFailed}
            </p>
          ) : bodyText ? (
            <p
              className={blocked ? "text-destructive" : "text-muted-foreground"}
            >
              {bodyText}
            </p>
          ) : null}
          {deleteError ? (
            <p className="text-destructive" role="alert">
              {deleteError}
            </p>
          ) : null}
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={deleteMutation.isPending}
            onClick={() => onOpenChange(false)}
          >
            {ptBR.actions.cancel}
          </AlertDialogCancel>
          <Button
            type="button"
            variant="destructive"
            disabled={!school || !canConfirm || loading}
            onClick={() => deleteMutation.mutate()}
          >
            {ptBR.actions.deletePermanently}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
