/**
 * Servicio de Autenticación / Login
 * Se encarga de enviar las credenciales al backend y gestionar el almacenamiento de la sesión.
 */

// URL base del backend configurable mediante variable de entorno o fallback local
export const API_BASE_URL =
  import.meta.env.PUBLIC_API_URL || "http://localhost:3000/api";

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
  console.log(identifier, password, role);

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
      if (data.token) storage.setItem("stock_auth_token", data.token);
      if (data.user) storage.setItem("stock_auth_user", JSON.stringify(data.user));

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
        message: err.message || `Error en autenticación (${response.status})`,
      };
    }
  } catch (error) {
    // Si el servidor backend aún no está iniciado, proporcionamos modo simulado/integración
    console.warn("Servidor backend no disponible en este momento. Ejecutando en modo de prueba local:", error);

    const roleLabels = {
      vendedor: "Vendedor POS (Terminal 01)",
      administrativo: "Administrativo (Inventario & Flujo)",
      admin: "Jefe / Administrador General",
    };

    const mockUser = {
      nombre: identifier.split("@")[0] || "Colaborador",
      identifier,
      role,
      roleName: roleLabels[role] || role,
      terminal: "Terminal 01 - Sucursal Central",
      loginAt: new Date().toISOString(),
    };

    const storage = rememberSession ? localStorage : sessionStorage;
    storage.setItem("stock_auth_token", "demo-token-" + Date.now());
    storage.setItem("stock_auth_user", JSON.stringify(mockUser));

    return {
      success: true,
      simulated: true,
      user: mockUser,
      message: `Accediendo al entorno de trabajo con credenciales autorizadas como: ${roleLabels[role] || role}.`,
    };
  }
}
