"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface OrderForm {
  first_name: string;
  last_name: string;
  company: string;
  role: string;
  company_size: string;
  email: string;
  phone: string;
  drink: string;
  milk_type: string;
}

interface SuccessData {
  pickup_code: string;
  order: {
    first_name: string;
    last_name: string;
    drink: string;
  };
}

export default function RegisterPage() {
  const [formData, setFormData] = useState<OrderForm>({
    first_name: "",
    last_name: "",
    company: "",
    role: "",
    company_size: "",
    email: "",
    phone: "",
    drink: "",
    milk_type: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successData, setSuccessData] = useState<SuccessData | null>(null);
  const router = useRouter();

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        setSuccessData({
          pickup_code: data.pickup_code,
          order: {
            first_name: data.order.first_name,
            last_name: data.order.last_name,
            drink: data.order.drink,
          },
        });
      } else {
        const data = await response.json();
        setError(data.error || "Failed to create order");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleNewOrder = () => {
    setFormData({
      first_name: "",
      last_name: "",
      company: "",
      role: "",
      company_size: "",
      email: "",
      phone: "",
      drink: "",
      milk_type: "",
    });
    setSuccessData(null);
    setError("");
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  if (successData) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center mx-auto relative">
        <div className="max-w-xl w-full bg-white border border-gray-200 shadow-md p-8 rounded-lg relative z-10">
          <div className="absolute top-0 -left-40 w-32 md:w-48 z-0 md:block hidden">
            <Image
              src="/images/peek-1.svg"
              alt="Aplicación de Evento de Café"
              width={100}
              height={100}
              className="w-full object-cover"
            />
          </div>
          <div className="absolute bottom-0 -right-36 w-48 md:w-36 md:block hidden">
            <Image
              src="/images/peek-3.svg"
              alt="Aplicación de Evento de Café"
              width={100}
              height={100}
              className="w-full object-cover"
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
          <div className="mb-6 flex justify-center w-full mx-auto">
            <div className="flex items-center justify-center h-16! w-16! rounded-full bg-green-100">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <div className="pl-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-0">
                ¡Registro Exitoso!
              </h2>
              <p className="text-gray-600">
                El {successData.order.drink} de {successData.order.first_name}{" "}
                {successData.order.last_name} ya está preparándose.
              </p>
            </div>
          </div>

          <div className="bg-gray-100 rounded-lg p-6 mb-6 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Código de Recogida
            </h3>
            <div className="text-4xl font-mono font-bold text-black">
              {successData.pickup_code}
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Dale este código al cliente para la recogida
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleNewOrder}
              className="w-full text-white py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 bg-[#0075de] hover:bg-[#005bb7]"
            >
              Crear Otra Orden
            </button>
            <button
              onClick={handleLogout}
              className="w-full bg-gray-600 text-white py-3 px-4 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center mx-auto relative py-8">
      <div className="max-w-xl w-full bg-white border border-gray-200 shadow-md p-8 rounded-lg relative z-10">
        <div className="absolute bottom-32 -left-40 w-32 md:w-48 z-0 md:block hidden">
          <Image
            src="/images/peek-1.svg"
            alt="Aplicación de Evento de Café"
            width={100}
            height={100}
            className="w-full object-cover"
          />
        </div>
        <div className="absolute top-24 -right-34 w-48 md:w-36 md:block hidden">
          <Image
            src="/images/peek-3.svg"
            alt="Aplicación de Evento de Café"
            width={100}
            height={100}
            className="w-full object-cover"
          />
        </div>
        <div className="text-center">
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Registrar Asistente
          </h1>
          <p className="text-gray-600 mb-8">Crear una nueva orden de café</p>
        </div>

        <div className="max-w-md mx-auto">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="first_name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Nombre *
                </label>
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
                  value={formData.first_name}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label
                  htmlFor="last_name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Apellido *
                </label>
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
                  value={formData.last_name}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="company"
                className="block text-sm font-medium text-gray-700"
              >
                Compañía en la que trabajas *
              </label>
              <input
                type="text"
                id="company"
                name="company"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
                value={formData.company}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label
                htmlFor="role"
                className="block text-sm font-medium text-gray-700"
              >
                Rol *
              </label>
              <input
                type="text"
                id="role"
                name="role"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
                value={formData.role}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label
                htmlFor="company_size"
                className="block text-sm font-medium text-gray-700"
              >
                ¿Cuántos empleados tiene la empresa en la que trabajas? *
              </label>
              <select
                id="company_size"
                name="company_size"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
                value={formData.company_size}
                onChange={handleInputChange}
              >
                <option value="">Selecciona una opción</option>
                <option value="0-10">0 - 10</option>
                <option value="11-50">11 - 50</option>
                <option value="51-100">51 - 100</option>
                <option value="101-250">101 - 250</option>
                <option value="251-1000">251 - 1,000</option>
                <option value="1000+">1,000+</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email (profesional, de la compañía en la que trabajas) *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700"
              >
                Número whatsapp (lo necesitamos para mensajearte cuando esté
                listo tu café) *
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                required
                placeholder="e.g., 5551234567"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
                value={formData.phone}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label
                htmlFor="drink"
                className="block text-sm font-medium text-gray-700"
              >
                ¿Qué tipo de café quieres? *
              </label>
              <select
                id="drink"
                name="drink"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
                value={formData.drink}
                onChange={handleInputChange}
              >
                <option value="">Selecciona una bebida</option>
                <option value="Espresso">1 – Espresso</option>
                <option value="Americano">2 – Americano</option>
                <option value="Flat White">3 – Flat White</option>
                <option value="Latte">4 – Latte</option>
                <option value="Iced Americano">5 – Iced Americano</option>
                <option value="Iced Latte">6 – Iced Latte</option>
                <option value="Iced Matcha Latte">7 – Iced Matcha Latte</option>
                <option value="Iced Horchata Matcha">
                  8 – Iced Horchata Matcha
                </option>
                <option value="Iced Horchata Coffee">
                  9 – Iced Horchata Coffee
                </option>
              </select>
            </div>

            <div>
              <label
                htmlFor="milk_type"
                className="block text-sm font-medium text-gray-700"
              >
                ¿Qué tipo de leche? *
              </label>
              <select
                id="milk_type"
                name="milk_type"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
                value={formData.milk_type}
                onChange={handleInputChange}
              >
                <option value="">Selecciona un tipo de leche</option>
                <option value="Sin leche">Sin leche</option>
                <option value="Leche entera">Leche entera</option>
                <option value="Leche deslactosada">Leche deslactosada</option>
                <option value="Leche de avena Oatly">
                  Leche de avena Oatly
                </option>
              </select>
            </div>

            <div className="bg-gray-100 border border-gray-300 rounded-md p-4">
              <p className="text-sm text-gray-700">
                <strong>Nota:</strong> al llenar este formulario nos das tu
                consentimiento de que te mandemos un mail promocional de Notion,
                si es relevante para ti :)
              </p>
            </div>

            {error && (
              <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}

            <div className="space-y-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full text-white py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 bg-[#0075de] hover:bg-[#005bb7] disabled:hover:bg-[#0075de]"
              >
                {loading ? "Creando orden..." : "Crear orden"}
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="w-full bg-gray-600 text-white py-3 px-4 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cerrar sesión
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
