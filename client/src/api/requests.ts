import { mockDb } from "./mockDb";
import type { RequestItem, User } from "@/types";
// import { apiClient } from "./client";

/**
 * Data access layer. Each function has the real axios call commented out
 * next to the mock so the swap is a one-line change.
 */
export const requestsApi = {
  list: (): Promise<RequestItem[]> =>
    // apiClient.get<RequestItem[]>("/requests").then((r) => r.data),
    mockDb.listRequests(),

  create: (
    input: Pick<RequestItem, "title" | "category" | "amount" | "notes">,
    requesterName: string,
  ): Promise<RequestItem> =>
    // apiClient.post<RequestItem>("/requests", input).then((r) => r.data),
    mockDb.createRequest(input, requesterName),

  decide: (id: string, status: "approved" | "rejected"): Promise<RequestItem> =>
    // apiClient.patch<RequestItem>(`/requests/${id}`, { status }).then((r) => r.data),
    mockDb.decideRequest(id, status),
};

export const usersApi = {
  list: (): Promise<User[]> => mockDb.listUsers(),
  create: (input: Omit<User, "id" | "active">): Promise<User> => mockDb.createUser(input),
  toggle: (id: string): Promise<User> => mockDb.toggleUser(id),
};
