/**
 * Configuración centralizada y dinámica de rutas de la API del servidor.
 * Detecta automáticamente si la aplicación se ejecuta en localhost o en Netlify
 * y verifica en tiempo real la disponibilidad física del backend local.
 */

let isPinging = false;
let lastKnownState = null; // 'online' | 'offline'

/**
 * Comprueba de forma real si el servidor local está encendido y respondiendo
 */
export async function checkLocalServerHealth() {
  if (typeof window === "undefined") return;
  const host = window.location.hostname;
  const isLocal = host === "localhost" || host === "127.0.0.1" || host.startsWith("192.168.");

  // Solo realizar comprobación y logs cuando se navegue en entorno local
  if (!isLocal) return;

  if (isPinging) return;
  isPinging = true;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1200);

    const res = await fetch("http://localhost:3000/api/health", {
      method: "GET",
      signal: controller.signal,
    }).catch(() => null);

    clearTimeout(timeoutId);

    if (res && res.ok) {
      if (lastKnownState !== "online") {
        lastKnownState = "online";
        console.log(
          "%c🟢 LOCAL ACTIVO Y CONECTADO%c Backend local respondiendo en http://localhost:3000",
          "background: #16a34a; color: #ffffff; font-weight: bold; padding: 4px 8px; border-radius: 4px; font-size: 11px;",
          "color: #15803d; font-weight: bold; margin-left: 8px; font-size: 11px;"
        );
      }
    } else {
      if (lastKnownState !== "offline") {
        lastKnownState = "offline";
        console.warn(
          "%c🔴 LOCAL APAGADO / DESCONECTADO%c Servidor backend apagado o no responde en http://localhost:3000 (Inicia el backend con: cd ServerGestInventario && node server.js)",
          "background: #dc2626; color: #ffffff; font-weight: bold; padding: 4px 8px; border-radius: 4px; font-size: 11px;",
          "color: #dc2626; font-weight: bold; margin-left: 8px; font-size: 11px;"
        );
      }
    }
  } catch (err) {
    if (lastKnownState !== "offline") {
      lastKnownState = "offline";
      console.warn(
        "%c🔴 LOCAL APAGADO / DESCONECTADO%c Servidor backend apagado en http://localhost:3000",
        "background: #dc2626; color: #ffffff; font-weight: bold; padding: 4px 8px; border-radius: 4px; font-size: 11px;",
        "color: #dc2626; font-weight: bold; margin-left: 8px; font-size: 11px;"
      );
    }
  } finally {
    isPinging = false;
  }
}

export function getBackendUrl() {
  let url = "http://localhost:3000";

  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    // Si estamos navegando en local (localhost, 127.0.0.1 o red local)
    if (host === "localhost" || host === "127.0.0.1" || host.startsWith("192.168.")) {
      url = "http://localhost:3000";
      // Verificar estado real en segundo plano
      checkLocalServerHealth();
    } else {
      // Producción en la nube
      url = "https://serverpapeleria.netlify.app";
    }
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

// Registrar listener en Astro Transitions y carga de ventana
if (typeof document !== "undefined") {
  document.addEventListener("astro:page-load", () => {
    lastKnownState = null; // Reevaluar estado en cada transición de página
    checkLocalServerHealth();
  });
}

export default Ruta;
