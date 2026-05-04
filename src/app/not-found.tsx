import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page Not Found",
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-linear-to-br from-emerald-50 via-slate-50 to-teal-50 flex items-center justify-center p-6 font-sans">
      <div className="text-center max-w-md">
        <p className="text-8xl font-extrabold text-emerald-600 leading-none mb-4">
          404
        </p>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">
          Page not found
        </h1>
        <p className="text-slate-500 text-sm mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          Back to calculator
        </Link>
      </div>
    </div>
  );
}
