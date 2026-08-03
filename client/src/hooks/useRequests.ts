import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { requestsApi } from "@/api/requests";
import type { RequestItem } from "@/types";

export const requestKeys = {
  all: ["requests"] as const,
};

export function useRequests() {
  return useQuery({ queryKey: requestKeys.all, queryFn: requestsApi.list });
}

export function useCreateRequest(requesterName: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Pick<RequestItem, "title" | "category" | "amount" | "notes">) =>
      requestsApi.create(input, requesterName),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: requestKeys.all }),
  });
}

export function useDecideRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: "approved" | "rejected" }) =>
      requestsApi.decide(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: requestKeys.all }),
  });
}
