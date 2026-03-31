import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from './client';

export type School = {
  id: string;
  name: string;
  externalRef: string | null;
};

export type Trip = {
  id: string;
  schoolId: string;
  title: string;
  code?: string | null;
};

export type InternalPassengerStatus = {
  id: string;
  fullName: string;
  paymentStatus: string;
  documentStatus: string;
  flagged: boolean;
};

export function useSchools() {
  return useQuery({
    queryKey: ['schools'],
    queryFn: () => apiFetch<{ items: School[] }>('/v1/schools'),
  });
}

export function useTrips(schoolId: string | undefined) {
  return useQuery({
    queryKey: ['trips', schoolId],
    enabled: !!schoolId,
    queryFn: () =>
      apiFetch<{ items: Trip[] }>(`/v1/schools/${schoolId}/trips`),
  });
}

export function usePassengerStatus(tripId: string | undefined) {
  return useQuery({
    queryKey: ['passengerStatus', tripId],
    enabled: !!tripId,
    queryFn: () =>
      apiFetch<{
        trip: Trip & { status?: string };
        passengers: InternalPassengerStatus[];
      }>(`/v1/trips/${tripId}/passengers/status`),
  });
}

export function useReconciliationPayments(status?: string) {
  return useQuery({
    queryKey: ['reconciliation', status],
    queryFn: () => {
      const q = status ? `?status=${encodeURIComponent(status)}` : '';
      return apiFetch<{
        items: {
          id: string;
          integrationSource: string;
          externalPaymentId: string;
          status: string;
          matchedPassengerId: string | null;
          tripId: string | null;
          suspectedDuplicate: boolean;
        }[];
      }>(`/v1/reconciliation/payments${q}`);
    },
  });
}

export function useManualPassenger(tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { fullName: string; studentDocument?: string }) =>
      apiFetch(`/v1/trips/${tripId}/passengers`, {
        method: 'POST',
        body,
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['passengerStatus', tripId] });
    },
  });
}
