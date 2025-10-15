"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface Order {
  id: string;
  created_at: string;
  first_name: string;
  last_name: string;
  company: string;
  role: string;
  company_size: string;
  email: string;
  phone: string;
  drink: string;
  milk_type: string;
  status: "queued" | "in_progress" | "ready" | "delivered";
  pickup_code: string;
  ready_at?: string;
  delivered_at?: string;
}

const statusColors = {
  queued: "bg-yellow-100 text-yellow-800",
  in_progress: "bg-blue-100 text-blue-800",
  ready: "bg-green-100 text-green-800",
  delivered: "bg-gray-100 text-gray-800",
};

const statusLabels = {
  queued: "En Espera",
  in_progress: "En Proceso",
  ready: "Listo",
  delivered: "Entregado",
};

export default function BarPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);
  const [filter, setFilter] = useState<
    "all" | "queued" | "in_progress" | "ready" | "delivered"
  >("all");
  const [retryCount, setRetryCount] = useState(0);
  const [lastFetchTime, setLastFetchTime] = useState<Date | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const router = useRouter();

  const fetchOrders = async (isRetry = false) => {
    try {
      const response = await fetch("/api/orders");
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders);
        setError(""); // Clear any previous errors
        setRetryCount(0); // Reset retry count on success
        setLastFetchTime(new Date());
      } else {
        const errorMessage = `Failed to fetch orders (${response.status})`;
        setError(errorMessage);
        if (isRetry) {
          setRetryCount((prev) => prev + 1);
        }
      }
    } catch {
      const errorMessage = "Error de red - verifica tu conexión";
      setError(errorMessage);
      if (isRetry) {
        setRetryCount((prev) => prev + 1);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setError("");
    setLoading(true);
    fetchOrders(true);
  };

  const updateOrderStatus = async (
    orderId: string,
    newStatus: "in_progress" | "ready" | "delivered"
  ) => {
    setUpdating(orderId);
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        await fetchOrders(); // Refresh the list
      } else {
        const data = await response.json();
        setError(data.error || "Error al actualizar la orden");
      }
    } catch {
      setError("Algo salió mal al actualizar la orden");
    } finally {
      setUpdating(null);
    }
  };

  const generateWhatsAppLink = (order: Order) => {
    // Drinks that don't use milk
    const drinksWithoutMilk = ["Espresso", "Americano", "Iced Americano"];
    const drinkUsesMilk = !drinksWithoutMilk.includes(order.drink);

    const milkText = drinkUsesMilk ? ` - ${order.milk_type}` : "";
    const message = `Hola ${order.first_name} ${order.last_name}! Tu café ${order.drink}${milkText} está listo. Código: ${order.pickup_code}. Pásalo a recoger en la barra!`;
    return `https://wa.me/${order.phone}?text=${encodeURIComponent(message)}`;
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("es-MX", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getNextStatus = (currentStatus: string) => {
    switch (currentStatus) {
      case "queued":
        return "in_progress";
      case "in_progress":
        return "ready";
      case "ready":
        return "delivered";
      default:
        return null;
    }
  };

  const getStatusAction = (currentStatus: string) => {
    switch (currentStatus) {
      case "queued":
        return "Iniciar";
      case "in_progress":
        return "Listo";
      case "ready":
        return "Entregado";
      default:
        return null;
    }
  };

  useEffect(() => {
    fetchOrders();

    // Poll every 5 seconds
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const filteredOrders =
    filter === "all"
      ? orders.filter((order) => order.status !== "delivered")
      : orders.filter((order) => order.status === filter);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0075de] mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando órdenes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
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
              onClick={() => setShowMenu(!showMenu)}
              className="bg-gray-100 text-gray-700 px-3 py-2 rounded-md border border-black hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
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
          <p className="text-gray-600 mt-2">
            Gestiona las órdenes de café y envía notificaciones de WhatsApp
          </p>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{error}</p>
                {retryCount > 0 && (
                  <p className="text-sm text-red-600 mt-1">
                    Intento de reintento {retryCount}
                  </p>
                )}
                {lastFetchTime && (
                  <p className="text-xs text-red-500 mt-1">
                    Última actualización exitosa:{" "}
                    {lastFetchTime.toLocaleTimeString()}
                  </p>
                )}
              </div>
              <button
                onClick={handleRetry}
                disabled={loading}
                className="ml-4 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
              >
                {loading ? "Reintentando..." : "Reintentar"}
              </button>
            </div>
          </div>
        )}

        {/* Filter buttons */}
        <div className="mb-6 flex flex-wrap gap-2 items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {(
              ["all", "queued", "in_progress", "ready", "delivered"] as const
            ).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  filter === status
                    ? "bg-[#0075de] text-white"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                }`}
              >
                {status === "all" ? "Todos" : statusLabels[status]}
                {status === "all"
                  ? ` (${
                      orders.filter((o) => o.status !== "delivered").length
                    })`
                  : ` (${orders.filter((o) => o.status === status).length})`}
              </button>
            ))}
            <button
              onClick={() => fetchOrders()}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              Actualizar
            </button>
          </div>
          <button
            onClick={() => router.push("/bar/coffee-management")}
            className="px-4 py-2 border-2 border-gray-400 text-gray-700 bg-white rounded-md hover:bg-gray-50 hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors"
          >
            ☕ Gestionar Café
          </button>
        </div>

        {/* Orders list */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No se encontraron órdenes</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <li key={order.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                statusColors[order.status]
                              }`}
                            >
                              {statusLabels[order.status]}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {order.first_name} {order.last_name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {order.drink} • {order.milk_type}
                            </p>
                            <p className="text-xs text-gray-400">
                              Code: {order.pickup_code}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">
                            {formatTime(order.created_at)}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {order.company} • {order.role}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      {getNextStatus(order.status) && (
                        <button
                          onClick={() =>
                            updateOrderStatus(
                              order.id,
                              getNextStatus(order.status) as
                                | "in_progress"
                                | "ready"
                                | "delivered"
                            )
                          }
                          disabled={updating === order.id}
                          className="bg-[#0075de] text-white px-3 py-1 rounded text-sm hover:bg-[#005bb7] focus:outline-none focus:ring-2 focus:ring-[#0075de] disabled:opacity-50"
                        >
                          {updating === order.id
                            ? "Actualizando..."
                            : getStatusAction(order.status)}
                        </button>
                      )}

                      {order.status === "ready" && (
                        <a
                          href={generateWhatsAppLink(order)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                          WhatsApp
                        </a>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
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
