import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { loginSchema, type LoginValues } from "@/lib/schemas";
import { useAuth } from "@/context/AuthContext";
import { Button, Input, Select } from "@/components/ui";

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? "/requests";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "dana@example.com", password: "password", role: "requester" },
  });

  if (isAuthenticated) return <Navigate to={from} replace />;

  const onSubmit = async (values: LoginValues) => {
    await login(values.email, values.role);
    navigate(from, { replace: true });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-sm space-y-4 rounded-lg border border-slate-200 bg-white p-6"
      >
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Sign in</h1>
          <p className="mt-1 text-sm text-slate-500">Demo auth: pick a role to explore the app.</p>
        </div>

        <Input label="Email" type="email" error={errors.email?.message} {...register("email")} />
        <Input
          label="Password"
          type="password"
          error={errors.password?.message}
          {...register("password")}
        />
        <Select label="Role" error={errors.role?.message} {...register("role")}>
          <option value="requester">Requester</option>
          <option value="approver">Approver</option>
          <option value="admin">Admin</option>
        </Select>

        <Button type="submit" className="w-full" isLoading={isSubmitting}>
          Sign in
        </Button>
      </form>
    </div>
  );
}
