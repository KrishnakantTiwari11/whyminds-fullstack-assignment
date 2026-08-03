import type { RequestItem, User } from "@/types";

/**
 * In-memory mock backend. Swap these functions for real `apiClient` calls
 * (see src/api/requests.ts) when a backend is available.
 */
const delay = (ms = 350) => new Promise((r) => setTimeout(r, ms));

let requests: RequestItem[] = [
  {
    id: "REQ-1001",
    title: "New laptop for onboarding",
    category: "Hardware",
    amount: 1899,
    status: "pending",
    requesterName: "Dana Lee",
    createdAt: "2026-07-14T10:12:00.000Z",
    notes: "Replacement for a failing machine.",
  },
  {
    id: "REQ-1002",
    title: "Design tool licenses (5 seats)",
    category: "Software",
    amount: 620,
    status: "approved",
    requesterName: "Dana Lee",
    createdAt: "2026-07-09T08:30:00.000Z",
  },
  {
    id: "REQ-1003",
    title: "Conference travel",
    category: "Travel",
    amount: 2400,
    status: "rejected",
    requesterName: "Sam Ortiz",
    createdAt: "2026-06-28T15:45:00.000Z",
    notes: "Out of budget this quarter.",
  },
  {
    id: "REQ-1004",
    title: "Team offsite catering",
    category: "Events",
    amount: 780,
    status: "pending",
    requesterName: "Sam Ortiz",
    createdAt: "2026-07-21T09:05:00.000Z",
  },
];

let users: User[] = [
  { id: "USR-1", name: "Dana Lee", email: "dana@example.com", role: "requester", active: true },
  { id: "USR-2", name: "Sam Ortiz", email: "sam@example.com", role: "requester", active: true },
  { id: "USR-3", name: "Priya Nair", email: "priya@example.com", role: "approver", active: true },
  { id: "USR-4", name: "Alex Kim", email: "alex@example.com", role: "admin", active: false },
];

export const mockDb = {
  async listRequests(): Promise<RequestItem[]> {
    await delay();
    return [...requests];
  },
  async createRequest(
    input: Pick<RequestItem, "title" | "category" | "amount" | "notes">,
    requesterName: string,
  ): Promise<RequestItem> {
    await delay();
    const item: RequestItem = {
      id: `REQ-${1000 + requests.length + 1}`,
      status: "pending",
      requesterName,
      createdAt: new Date().toISOString(),
      ...input,
    };
    requests = [item, ...requests];
    return item;
  },
  async decideRequest(id: string, status: "approved" | "rejected"): Promise<RequestItem> {
    await delay();
    requests = requests.map((r) => (r.id === id ? { ...r, status } : r));
    const found = requests.find((r) => r.id === id);
    if (!found) throw new Error("Request not found");
    return found;
  },
  async listUsers(): Promise<User[]> {
    await delay();
    return [...users];
  },
  async createUser(input: Omit<User, "id" | "active">): Promise<User> {
    await delay();
    const user: User = { id: `USR-${users.length + 1}`, active: true, ...input };
    users = [...users, user];
    return user;
  },
  async toggleUser(id: string): Promise<User> {
    await delay();
    users = users.map((u) => (u.id === id ? { ...u, active: !u.active } : u));
    const found = users.find((u) => u.id === id);
    if (!found) throw new Error("User not found");
    return found;
  },
};
