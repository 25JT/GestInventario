/**
 * Configuración centralizada y dinámica de rutas de la API del servidor.
 * Detecta automáticamente si la aplicación se ejecuta en localhost o en Netlify.
 */

let lastLoggedUrl = "";

function notifyConnectionStatus(url) {
  if (typeof window === "undefined") return;
  // Solo mostrar mensaje cuando esté conectado a localhost:3000
  if (url.includes("localhost:3000") || url.includes("127.0.0.1:3000")) {
    if (lastLoggedUrl !== url) {
      lastLoggedUrl = url;
      console.log(
        "%c🟢 ACTIVO EN LOCAL%c Conectado a backend: http://localhost:3000",
        "background: #16a34a; color: #ffffff; font-weight: bold; padding: 4px 8px; border-radius: 4px; font-size: 12px;",
        "color: #15803d; font-weight: 700; margin-left: 8px; font-size: 12px;"
      );
    }
  }
}

export function getBackendUrl() {
  let url = "http://localhost:3000";

  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    // Si estamos navegando en local (localhost, 127.0.0.1 o red local)
    if (host === "localhost" || host === "127.0.0.1" || host.startsWith("192.168.")) {
      url = "http://localhost:3000";
    } else {
      // Producción en la nube
      url = "https://serverpapeleria.netlify.app";
    }
    notifyConnectionStatus(url);
    return url;
  }

  // En SSR / tiempo de compilación (Astro build)
  if (typeof process !== "undefined" && process.env?.NETLIFY) {
    return "https://serverpapeleria.netlify.app";
  }
  return "http://localhost:3000";
}

export function getApiUrl() {
  return `${getBackendUrl()}/api`;
}

// Variables directas compatibles con código existente
export const BackendUrl = getBackendUrl();
export const Ruta = getApiUrl();

// Registrar listener en Astro Transitions para registrarlo en cada navegación en local
if (typeof document !== "undefined") {
  document.addEventListener("astro:page-load", () => {
    lastLoggedUrl = "";
    getBackendUrl();
  });
}

export default Ruta;
