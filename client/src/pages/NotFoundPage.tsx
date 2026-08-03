import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center">
      <h1 className="text-2xl font-semibold text-slate-900">404 - Page not found</h1>
      <p className="mt-2 text-sm text-slate-500">The page you requested does not exist.</p>
      <Link to="/" className="mt-6 text-sm font-medium text-slate-900 underline">
        Back to app
      </Link>
    </div>
  );
}
