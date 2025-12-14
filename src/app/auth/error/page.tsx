import { Suspense } from "react";

export default function AuthError() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Authentication Error
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            There was a problem signing you in. Please try again.
          </p>
          <div className="mt-4">
            <a
              href="/auth/login"
              className="text-indigo-600 hover:text-indigo-500"
            >
              Back to Login
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}