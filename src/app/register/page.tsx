"use client";

import { useState, useEffect } from "react";
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

interface CoffeeOption {
  id: string;
  name: string;
  display_name: string;
  uses_milk: boolean;
  enabled: boolean;
  sort_order: number;
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
  const [coffeeOptions, setCoffeeOptions] = useState<CoffeeOption[]>([]);
  const [coffeeLoading, setCoffeeLoading] = useState(true);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "info" | "warning";
  } | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const router = useRouter();

  // Fetch coffee options on component mount and set up auto-refresh
  useEffect(() => {
    const fetchCoffeeOptions = async () => {
      try {
        const response = await fetch("/api/coffee-options?enabled_only=true", {
          cache: "no-store", // Prevent caching to get fresh data
        });
        if (response.ok) {
          const data = await response.json();
          const newOptions = data.coffee_options;

          // Check for changes if this is a refresh (not initial load)
          if (false && coffeeOptions.length > 0) {
            const currentEnabledNames = coffeeOptions.map(
              (opt: CoffeeOption) => opt.name
            );
            const newEnabledNames = newOptions.map(
              (opt: CoffeeOption) => opt.name
            );

            // Find newly enabled options
            const newlyEnabled = newOptions.filter(
              (opt: CoffeeOption) => !currentEnabledNames.includes(opt.name)
            );

            // Find newly disabled options
            const newlyDisabled = coffeeOptions.filter(
              (opt: CoffeeOption) => !newEnabledNames.includes(opt.name)
            );

            // Show notifications for changes
            if (newlyEnabled.length > 0) {
              const optionNames = newlyEnabled
                .map((opt: CoffeeOption) => opt.display_name)
                .join(", ");
              setNotification({
                message: `✅ ${optionNames} ${
                  newlyEnabled.length === 1 ? "está" : "están"
                } ahora disponible${newlyEnabled.length === 1 ? "" : "s"}`,
                type: "success",
              });
            }

            if (newlyDisabled.length > 0) {
              const optionNames = newlyDisabled
                .map((opt: CoffeeOption) => opt.display_name)
                .join(", ");
              setNotification({
                message: `⚠️ ${optionNames} ${
                  newlyDisabled.length === 1 ? "ya no está" : "ya no están"
                } disponible${newlyDisabled.length === 1 ? "" : "s"}`,
                type: "warning",
              });
            }
          }

          setCoffeeOptions(newOptions);
          setError(""); // Clear any previous errors
        } else {
          setError("Error al cargar las opciones de café");
        }
      } catch {
        setError("Error de red - verifica tu conexión");
      } finally {
        setCoffeeLoading(false);
      }
    };

    // Initial fetch only
    fetchCoffeeOptions();
  }, []); // Empty dependency array - only run on mount

  // Auto-dismiss notifications after 4 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Get current drink info
  const currentDrink = coffeeOptions.find(
    (option) => option.name === formData.drink
  );
  const currentDrinkUsesMilk = Boolean(currentDrink?.uses_milk);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    // If changing drink, check if new drink uses milk
    if (name === "drink") {
      const selectedDrink = coffeeOptions.find(
        (option) => option.name === value
      );
      if (selectedDrink && !selectedDrink.uses_milk) {
        setFormData((prev) => ({
          ...prev,
          [name]: value,
          milk_type: "", // Clear milk type for drinks without milk
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          [name]: value,
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validate that the selected drink is still available
    const selectedDrink = coffeeOptions.find(
      (option) => option.name === formData.drink
    );
    if (!selectedDrink || !selectedDrink.enabled) {
      setError(
        "La opción de café seleccionada ya no está disponible. Por favor, selecciona otra opción."
      );
      setLoading(false);
      return;
    }

    // Validate and correct milk type based on drink requirements
    let correctedMilkType = formData.milk_type;
    if (!selectedDrink.uses_milk) {
      // If drink doesn't use milk, always set to "Sin leche"
      correctedMilkType = "Sin leche";
    } else if (selectedDrink.uses_milk && !formData.milk_type) {
      // If drink uses milk but no milk selected, set default
      correctedMilkType = "Sin leche";
    }

    // Update form data with corrected milk type
    const correctedFormData = {
      ...formData,
      milk_type: correctedMilkType,
    };

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(correctedFormData),
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
          <div className="flex justify-between w-full items-center mb-8">
            <div className="flex h-24 items-center">
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
            <button
              type="button"
              onClick={() => setShowMenu(!showMenu)}
              className="bg-gray-100 text-gray-700 py-2 px-3 rounded-md border border-black hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 h-fit text-sm flex items-center gap-1"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <circle cx="12" cy="5" r="2" />
                <circle cx="12" cy="12" r="2" />
                <circle cx="12" cy="19" r="2" />
              </svg>
            </button>
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
          </div>
        </div>

        {/* Offcanvas Menu */}
        {showMenu && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/70"
              onClick={() => setShowMenu(false)}
            />

            {/* Offcanvas */}
            <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out">
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Menú</h2>
                  <button
                    onClick={() => setShowMenu(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                {/* Menu Items */}
                <div className="flex-1 p-6">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <g fillRule="evenodd" clipRule="evenodd">
                        <path d="M15.99 7.823a.75.75 0 0 1 1.061.021l3.49 3.637a.75.75 0 0 1 0 1.038l-3.49 3.637a.75.75 0 0 1-1.082-1.039l2.271-2.367h-6.967a.75.75 0 0 1 0-1.5h6.968l-2.272-2.367a.75.75 0 0 1 .022-1.06" />
                        <path d="M3.25 4A.75.75 0 0 1 4 3.25h9.455a.75.75 0 0 1 .75.75v3a.75.75 0 1 1-1.5 0V4.75H4.75v14.5h7.954V17a.75.75 0 0 1 1.5 0v3a.75.75 0 0 1-.75.75H4a.75.75 0 0 1-.75-.75z" />
                      </g>
                    </svg>
                    Cerrar sesión
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
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
          <div className="flex justify-between w-full">
            <div className="flex h-24 items-center md:mb-8 mb-0">
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
              type="button"
              onClick={() => setShowMenu(!showMenu)}
              className="bg-gray-100 text-gray-700 py-2 px-3 rounded-md border border-black hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 h-fit text-sm flex items-center gap-1"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <circle cx="12" cy="5" r="2" />
                <circle cx="12" cy="12" r="2" />
                <circle cx="12" cy="19" r="2" />
              </svg>
            </button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Regístrate</h1>
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
                disabled={coffeeLoading}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black disabled:opacity-50"
                value={formData.drink}
                onChange={handleInputChange}
              >
                <option value="">
                  {coffeeLoading
                    ? "Cargando opciones..."
                    : "Selecciona una bebida"}
                </option>
                {coffeeOptions.map((option) => (
                  <option key={option.id} value={option.name}>
                    {option.display_name}
                  </option>
                ))}
              </select>
            </div>

            {currentDrinkUsesMilk && (
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
                  required={currentDrinkUsesMilk}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
                  value={formData.milk_type}
                  onChange={handleInputChange}
                >
                  <option value="">Selecciona un tipo de leche</option>
                  <option value="Leche deslactosada">Leche deslactosada</option>
                  <option value="Leche de avena Oatly">
                    Leche de avena Oatly
                  </option>
                  <option value="Leche de almendra Califia">
                    Leche de almendra Califia
                  </option>
                  <option value="Leche de coco Califia">
                    Leche de coco Califia
                  </option>
                </select>
              </div>
            )}

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

            {notification && (
              <div
                className={`text-sm text-center p-3 rounded-md ${
                  notification.type === "success"
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : notification.type === "warning"
                    ? "bg-yellow-50 text-yellow-700 border border-yellow-200"
                    : "bg-blue-50 text-blue-700 border border-blue-200"
                }`}
              >
                {notification.message}
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
            </div>
          </form>
        </div>
      </div>

      {/* Offcanvas Menu */}
      {showMenu && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70"
            onClick={() => setShowMenu(false)}
          />

          {/* Offcanvas */}
          <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Menú</h2>
                <button
                  onClick={() => setShowMenu(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Menu Items */}
              <div className="flex-1 p-6">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <g fillRule="evenodd" clipRule="evenodd">
                      <path d="M15.99 7.823a.75.75 0 0 1 1.061.021l3.49 3.637a.75.75 0 0 1 0 1.038l-3.49 3.637a.75.75 0 0 1-1.082-1.039l2.271-2.367h-6.967a.75.75 0 0 1 0-1.5h6.968l-2.272-2.367a.75.75 0 0 1 .022-1.06" />
                      <path d="M3.25 4A.75.75 0 0 1 4 3.25h9.455a.75.75 0 0 1 .75.75v3a.75.75 0 1 1-1.5 0V4.75H4.75v14.5h7.954V17a.75.75 0 0 1 1.5 0v3a.75.75 0 0 1-.75.75H4a.75.75 0 0 1-.75-.75z" />
                    </g>
                  </svg>
                  Cerrar sesión
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
