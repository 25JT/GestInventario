/**
 * Configuración centralizada de rutas de la API del servidor.
 * Lee la variable de entorno 'Ruta' definida en el archivo .env
 */

const rawRuta =
  (typeof import.meta !== "undefined" && import.meta.env && (import.meta.env.Ruta || import.meta.env.PUBLIC_RUTA || import.meta.env.PUBLIC_API_URL)) ||
  "http://localhost:3000/api";

// Limpia posibles espacios y elimina la barra final para evitar duplicaciones como '//auth'
export const Ruta = String(rawRuta).trim().replace(/\/+$/, "");

export default Ruta;
