import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "./ProtectedRoute";
import LoginPage from "@/pages/LoginPage";
import RequesterPage from "@/pages/RequesterPage";
import ApproverPage from "@/pages/ApproverPage";
import AdminPage from "@/pages/AdminPage";
import ForbiddenPage from "@/pages/ForbiddenPage";
import NotFoundPage from "@/pages/NotFoundPage";

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  { path: "/forbidden", element: <ForbiddenPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: "/", element: <Navigate to="/requests" replace /> },
          {
            element: <ProtectedRoute roles={["requester", "admin"]} />,
            children: [{ path: "/requests", element: <RequesterPage /> }],
          },
          {
            element: <ProtectedRoute roles={["approver", "admin"]} />,
            children: [{ path: "/approvals", element: <ApproverPage /> }],
          },
          {
            element: <ProtectedRoute roles={["admin"]} />,
            children: [{ path: "/admin", element: <AdminPage /> }],
          },
        ],
      },
    ],
  },
  { path: "*", element: <NotFoundPage /> },
]);
