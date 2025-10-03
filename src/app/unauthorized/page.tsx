import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-gray-400">403</h1>
          <h2 className="text-2xl font-semibold text-gray-900 mt-4">
            Access Denied
          </h2>
          <p className="text-gray-600 mt-2">
            You don't have permission to access this page.
          </p>
        </div>
        <Link
          href="/login"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#0075de] hover:bg-[#005bb7] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0075de]"
        >
          Back to Login
        </Link>
      </div>
    </div>
  );
}
