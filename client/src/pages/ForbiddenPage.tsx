import { Link } from "react-router-dom";

export default function ForbiddenPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center">
      <h1 className="text-2xl font-semibold text-slate-900">403 - Not authorized</h1>
      <p className="mt-2 text-sm text-slate-500">Your role does not have access to this page.</p>
      <Link to="/" className="mt-6 text-sm font-medium text-slate-900 underline">
        Back to app
      </Link>
    </div>
  );
}
