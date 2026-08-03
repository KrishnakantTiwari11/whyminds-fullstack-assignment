import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { Role } from "@/types";

const navItems: { to: string; label: string; roles: Role[] }[] = [
  { to: "/requests", label: "My Requests", roles: ["requester", "admin"] },
  { to: "/approvals", label: "Approvals", roles: ["approver", "admin"] },
  { to: "/admin", label: "Admin", roles: ["admin"] },
];

export function AppLayout() {
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-6">
            <span className="text-sm font-semibold text-slate-900">Approval Workflow</span>
            <nav className="flex gap-1">
              {navItems
                .filter((item) => hasRole(item.roles))
                .map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      cn(
                        "rounded-md px-3 py-1.5 text-sm",
                        isActive ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100",
                      )
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-600">
              {user?.name} &middot; <span className="capitalize">{user?.role}</span>
            </span>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                logout();
                navigate("/login", { replace: true });
              }}
            >
              <ArrowRightOnRectangleIcon className="h-4 w-4" /> Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
