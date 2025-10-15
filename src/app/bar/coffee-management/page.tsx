"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface CoffeeOption {
  id: string;
  name: string;
  display_name: string;
  uses_milk: boolean;
  enabled: boolean;
  sort_order: number;
}

export default function CoffeeManagementPage() {
  const [coffeeOptions, setCoffeeOptions] = useState<CoffeeOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);
  const router = useRouter();

  const fetchCoffeeOptions = async () => {
    try {
      const response = await fetch("/api/coffee-options");
      if (response.ok) {
        const data = await response.json();
        setCoffeeOptions(data.coffee_options);
        setError("");
      } else {
        setError("Error al cargar las opciones de café");
      }
    } catch {
      setError("Error de red - verifica tu conexión");
    } finally {
      setLoading(false);
    }
  };

  const toggleCoffeeOption = async (id: string, currentEnabled: boolean) => {
    setUpdating(id);
    setError(""); // Clear any previous errors

    // Optimistically update the UI immediately
    setCoffeeOptions((prevOptions) =>
      prevOptions.map((option) =>
        option.id === id ? { ...option, enabled: !currentEnabled } : option
      )
    );

    try {
      const response = await fetch("/api/coffee-options", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, enabled: !currentEnabled }),
      });

      if (!response.ok) {
        // Revert the optimistic update if the API call failed
        setCoffeeOptions((prevOptions) =>
          prevOptions.map((option) =>
            option.id === id ? { ...option, enabled: currentEnabled } : option
          )
        );
        const data = await response.json();
        setError(data.error || "Error al actualizar la opción");
      }
    } catch {
      // Revert the optimistic update if there was a network error
      setCoffeeOptions((prevOptions) =>
        prevOptions.map((option) =>
          option.id === id ? { ...option, enabled: currentEnabled } : option
        )
      );
      setError("Error de red - verifica tu conexión");
    } finally {
      setUpdating(null);
    }
  };

  useEffect(() => {
    fetchCoffeeOptions();
  }, []);

  const handleBackToBar = () => {
    router.push("/bar");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0075de] mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando opciones de café...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <div className="flex justify-center h-24 items-center md:mb-8 mb-0">
              <div className="md:w-28 w-20">
                <Image
                  src="/images/icon.svg"
                  alt="Aplicación de Evento de Café"
                  width={100}
                  height={100}
                  className="w-full object-cover"
                />
              </div>
              <div className="md:w-48 w-32">
                <Image
                  src="/images/logo.svg"
                  alt="Aplicación de Evento de Café"
                  width={100}
                  height={100}
                  className="w-full object-cover"
                />
              </div>
            </div>

            <button
              onClick={handleBackToBar}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              ← Volver a Bar
            </button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Gestión de Opciones de Café
          </h1>
          <p className="text-gray-600">
            Activa o desactiva las opciones de café disponibles para registro
          </p>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            <p className="font-medium">{error}</p>
          </div>
        )}

        {/* Coffee Options List */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          {coffeeOptions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">
                No se encontraron opciones de café
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {coffeeOptions.map((option) => (
                <li key={option.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              option.enabled
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {option.enabled ? "Activo" : "Inactivo"}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {option.display_name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {option.uses_milk
                              ? "Con opciones de leche"
                              : "Sin leche"}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <button
                        onClick={() =>
                          toggleCoffeeOption(option.id, option.enabled)
                        }
                        disabled={updating === option.id}
                        className={`px-4 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 ${
                          option.enabled
                            ? "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500"
                            : "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500"
                        }`}
                      >
                        {updating === option.id
                          ? "Actualizando..."
                          : option.enabled
                          ? "Desactivar"
                          : "Activar"}
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-blue-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Información</h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  • Las opciones desactivadas no aparecerán en el formulario de
                  registro
                </p>
                <p>• Los cambios se aplican inmediatamente</p>
                <p>• Las órdenes existentes no se ven afectadas</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
