import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { MoreVertical, Trash2, Undo2 } from "lucide-react";
import { useState } from "react";

import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { apiPatchJson } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import {
  type PassengerWithStatus,
  passengerWithStatusSchema,
} from "@/lib/schemas/passenger";
import { passengersListLink } from "@/lib/trip-payment-links";
import { cn } from "@/lib/utils";
import { ptBR } from "@/messages/pt-BR";

export function PassengerWorkspaceOptionsMenu(props: {
  tripId: string;
  passenger: PassengerWithStatus;
  schoolId?: string;
}) {
  const { tripId, passenger, schoolId } = props;
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [patchError, setPatchError] = useState<string | null>(null);

  const patchPassenger = useMutation({
    mutationFn: async (input: {
      passengerId: string;
      body: Record<string, unknown>;
    }) => {
      const raw = await apiPatchJson<unknown>(
        `/passengers/${input.passengerId}`,
        input.body,
      );
      return passengerWithStatusSchema.parse(raw);
    },
    onSuccess: async (_, vars) => {
      setPatchError(null);
      await qc.invalidateQueries({
        queryKey: queryKeys.passengers(tripId, false),
      });
      await qc.invalidateQueries({
        queryKey: queryKeys.passengers(tripId, true),
      });
      await qc.invalidateQueries({
        queryKey: queryKeys.payments(vars.passengerId),
      });
      await qc.invalidateQueries({
        queryKey: ["passengerAggregates", tripId],
      });
      if (vars.body.removed === true) {
        void navigate(passengersListLink({ tripId, schoolId }));
      }
    },
    onError: () => {
      setPatchError("Não foi possível atualizar o passageiro.");
    },
  });

  return (
    <div className="flex shrink-0 flex-col items-end gap-1">
      <DropdownMenu>
        <DropdownMenuTrigger
          className={cn(
            buttonVariants({ variant: "ghost", size: "icon-sm" }),
            "shrink-0",
          )}
          aria-label={ptBR.passengerWorkspace.optionsMenuAria}
        >
          <MoreVertical className="size-4" aria-hidden />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-40" sideOffset={4}>
          {passenger.removedAt ? (
            <DropdownMenuItem
              disabled={patchPassenger.isPending}
              onClick={() =>
                patchPassenger.mutate({
                  passengerId: passenger.id,
                  body: { removed: false },
                })
              }
            >
              <Undo2 className="size-4" aria-hidden />
              {ptBR.actions.restore}
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              variant="destructive"
              disabled={patchPassenger.isPending}
              onClick={() =>
                patchPassenger.mutate({
                  passengerId: passenger.id,
                  body: { removed: true },
                })
              }
            >
              <Trash2 className="size-4" aria-hidden />
              {ptBR.actions.delete}
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      {patchError ? (
        <p
          className="max-w-[12rem] text-right text-destructive text-xs"
          role="alert"
        >
          {patchError}
        </p>
      ) : null}
    </div>
  );
}
