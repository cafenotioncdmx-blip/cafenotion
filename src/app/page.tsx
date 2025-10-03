import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
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
        <div className="text-center">
          <p className="text-gray-600 md:mb-8 mb-4">
            Bienvenido al sistema de gestión del evento de café de 2 días
          </p>
        </div>

        <div className="space-y-4 max-w-md mx-auto">
          <Link
            href="/login"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 bg-[#0075de] hover:bg-[#005bb7]"
          >
            Acceder al Sistema
          </Link>

          <div className="text-center text-sm text-gray-500">
            <p>Elige tu rol:</p>
            <div className="mt-2 space-y-1">
              <p>
                <strong>Edecanes:</strong> Registrar asistentes
              </p>
              <p>
                <strong>Baristas:</strong> Gestionar pedidos de café
              </p>
              <p>
                <strong>Admin:</strong> Ver todas las órdenes y exportar datos
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
