export type Role = "requester" | "approver" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  active: boolean;
}

export type RequestStatus = "pending" | "approved" | "rejected";

export interface RequestItem {
  id: string;
  title: string;
  category: string;
  amount: number;
  status: RequestStatus;
  requesterName: string;
  createdAt: string;
  notes?: string;
}
