"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";

function LoginForm() {
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ passcode }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(
          "Login successful, role:",
          data.role,
          "redirecting to:",
          redirectTo
        );

        // Determine the correct redirect based on role
        let targetUrl = redirectTo;
        if (redirectTo === "/" || redirectTo === "/login") {
          // If no specific redirect, go to role-specific page
          switch (data.role) {
            case "register":
              targetUrl = "/register";
              break;
            case "bar":
              targetUrl = "/bar";
              break;
            case "admin":
              targetUrl = "/admin";
              break;
            default:
              targetUrl = "/";
          }
        }

        console.log("Final redirect URL:", targetUrl);
        // Force a hard redirect to ensure middleware runs
        window.location.replace(targetUrl);
      } else {
        const data = await response.json();
        setError(data.error || "Invalid passcode");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center mx-auto relative">
      <div className="max-w-xl w-full bg-white border border-gray-200 shadow-md p-8 rounded-lg relative z-10">
        <div className="absolute md:top-0 md:-left-40 left-0 -top-20 w-32 md:w-48 z-0">
          <Image
            src="/images/peek-4.svg"
            alt="Aplicación de Evento de Café"
            width={100}
            height={100}
            className="w-full object-cover md:hidden"
          />
          <Image
            src="/images/peek-1.svg"
            alt="Aplicación de Evento de Café"
            width={100}
            height={100}
            className="w-full object-cover hidden md:block"
          />
        </div>
        <div className="absolute md:bottom-0 md:-right-32 -bottom-32 right-0 w-36 md:w-36">
          <Image
            src="/images/peek-2.svg"
            alt="Aplicación de Evento de Café"
            width={100}
            height={100}
            className="w-full object-cover md:hidden"
          />
          <Image
            src="/images/peek-3.svg"
            alt="Aplicación de Evento de Café"
            width={100}
            height={100}
            className="w-full object-cover hidden md:block"
          />
        </div>
        <div className="flex justify-center h-24 items-center mb-8">
          <div className="w-28">
            <Image
              src="/images/icon.svg"
              alt="Aplicación de Evento de Café"
              width={100}
              height={100}
              className="w-full object-cover"
            />
          </div>
          <div className="w-48">
            <Image
              src="/images/logo.svg"
              alt="Aplicación de Evento de Café"
              width={100}
              height={100}
              className="w-full object-cover"
            />
          </div>
        </div>
        <div className="text-center">
          <p className="text-gray-600 mb-8">
            Ingresa tu código de acceso para continuar
          </p>
        </div>
        <div className="space-y-4 max-w-md mx-auto">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="passcode" className="sr-only">
                Código de acceso
              </label>
              <input
                id="passcode"
                name="passcode"
                type="password"
                required
                className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-black focus:border-black focus:z-10 sm:text-sm"
                placeholder="Ingresa tu código de acceso"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm text-center">{error}</div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 bg-[#0075de] hover:bg-[#005bb7] disabled:hover:bg-[#0075de]"
              >
                {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
