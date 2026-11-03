/**
 * Configuración centralizada y dinámica de rutas de la API del servidor.
 * Detecta automáticamente si la aplicación se ejecuta en localhost o en Netlify.
 */

export function getBackendUrl() {
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    // Si estamos navegando en local (localhost, 127.0.0.1 o red local)
    if (host === "localhost" || host === "127.0.0.1" || host.startsWith("192.168.")) {
      return "http://localhost:3000";
    }
    // Si estamos en producción (Netlify o dominio en la nube)
    return "https://serverpapeleria.netlify.app";
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

export default Ruta;
