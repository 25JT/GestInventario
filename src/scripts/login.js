/**
 * Servicio de Autenticación / Login
 * Se encarga de enviar las credenciales al backend y gestionar el almacenamiento de la sesión.
 */

import { Ruta, checkLocalServerHealth } from "./apiConfig.js";

// Exportamos Ruta y API_BASE_URL para compatibilidad
export { Ruta };
export const API_BASE_URL = Ruta;

/**
 * Inicia sesión con el identificador corporativo y contraseña.
 * @param {Object} credenciales
 * @param {string} credenciales.identifier - Correo corporativo o usuario
 * @param {string} credenciales.password - Contraseña de acceso
 * @param {string} credenciales.role - Rol seleccionado ('vendedor' | 'administrativo' | 'admin')
 * @param {boolean} credenciales.rememberSession - Recordar estación de trabajo
 * @returns {Promise<{success: boolean, user?: Object, token?: string, message?: string}>}
 */
export async function iniciarSesion({ identifier, password, role = "vendedor", rememberSession = true }) {


  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ identifier, password, role, rememberSession }),
    });

    if (response.ok) {
      const data = await response.json();
      const storage = rememberSession ? localStorage : sessionStorage;
      if (data.token) {
        storage.setItem("stock_auth_token", data.token);
        localStorage.setItem("stock_auth_token", data.token); // Mantener en localStorage para persistencia
        localStorage.setItem("stock_auth_issued_at", String(Date.now()));
      }
      if (data.user) {
        storage.setItem("stock_auth_user", JSON.stringify(data.user));
        localStorage.setItem("stock_auth_user", JSON.stringify(data.user));
      }

      return {
        success: true,
        user: data.user,
        token: data.token,
        message: data.message || "Inicio de sesión exitoso.",
      };
    } else {
      const err = await response.json().catch(() => ({}));
      return {
        success: false,
        message: err.message || `Credenciales incorrectas o error en autenticación (${response.status})`,
      };
    }
  } catch (error) {
    console.error("Error al conectar con el servidor de autenticación:", error);
    checkLocalServerHealth();
    return {
      success: false,
      message: "No se pudo establecer conexión con el servidor backend. Verifica tu conexión a internet o el estado del sistema.",
    };
  }
}

/**
 * Valida la sesión activa y renueva el token rotándolo cada 24 horas.
 * Si el token sigue vigente, actualiza los datos y renueva la validez.
 * Si expiró o es inválido, limpia la sesión y retorna falso.
 */
export async function verificarYRefrescarSesion() {
  if (typeof window === "undefined") return { valid: false };

  const token =
    localStorage.getItem("stock_auth_token") ||
    sessionStorage.getItem("stock_auth_token");

  if (!token || token.startsWith("demo-token-")) {
    localStorage.removeItem("stock_auth_token");
    localStorage.removeItem("stock_auth_user");
    localStorage.removeItem("stock_auth_issued_at");
    sessionStorage.removeItem("stock_auth_token");
    sessionStorage.removeItem("stock_auth_user");
    return { valid: false };
  }

  try {
    const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.ok) {
      const data = await res.json();
      if (data.token) {
        localStorage.setItem("stock_auth_token", data.token);
        sessionStorage.setItem("stock_auth_token", data.token);
        localStorage.setItem("stock_auth_issued_at", String(Date.now()));
      }
      if (data.user) {
        localStorage.setItem("stock_auth_user", JSON.stringify(data.user));
        sessionStorage.setItem("stock_auth_user", JSON.stringify(data.user));
      }
      return { valid: true, user: data.user, token: data.token };
    }

    // Si el servidor respondió 401 o 403 (token expirado > 24h o inválido)
    localStorage.removeItem("stock_auth_token");
    localStorage.removeItem("stock_auth_user");
    localStorage.removeItem("stock_auth_issued_at");
    sessionStorage.removeItem("stock_auth_token");
    sessionStorage.removeItem("stock_auth_user");
    return { valid: false };
  } catch (err) {
    console.warn("No se pudo contactar el servidor para refrescar token, manteniendo sesión local:", err);
    // Si no hay red momentáneamente pero tenemos usuario guardado
    const localUser = localStorage.getItem("stock_auth_user") || sessionStorage.getItem("stock_auth_user");
    return { valid: Boolean(localUser), user: localUser ? JSON.parse(localUser) : null, token };
  }
}

/**
 * Cierra la sesión activa y redirige al inicio
 */
export function cerrarSesion() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("stock_auth_token");
  localStorage.removeItem("stock_auth_user");
  localStorage.removeItem("stock_auth_issued_at");
  sessionStorage.removeItem("stock_auth_token");
  sessionStorage.removeItem("stock_auth_user");
  window.location.href = "/";
}
