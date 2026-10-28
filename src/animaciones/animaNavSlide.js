import gsap from "gsap";

/**
 * Estado del menú lateral
 * Inicia estrictamente cerrado en todas las pantallas hasta que el usuario pulse el botón de menú
 */
let isSidebarOpen = false;
let isAnimating = false;

/**
 * Carga los datos del usuario en el Sidebar y Navbar desde el almacenamiento de sesión
 */
export function hydrateUserSession() {
  if (typeof window === "undefined") return;

  try {
    const rawUser =
      localStorage.getItem("stock_auth_user") ||
      sessionStorage.getItem("stock_auth_user");

    if (rawUser) {
      const user = JSON.parse(rawUser);

      // Nombre
      const name = (
        user.name ||
        user.nombre ||
        (user.identifier ? user.identifier.split("@")[0] : "Colaborador")
      ).trim();
      const lastname = (user.lastname || user.apellido || "").trim();
      const fullName = `${name} ${lastname}`.trim();

      document
        .querySelectorAll("#user-display-name, [data-user-name]")
        .forEach((el) => {
          el.textContent = fullName || name;
        });

      const welcomeName = document.getElementById("welcome-name");
      if (welcomeName) {
        welcomeName.textContent = name;
      }

      // Nombre de usuario corporativo (@usuario)
      let generated = (
        name.slice(0, 2) + (lastname ? lastname.slice(0, 3) : "usr")
      )
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");

      let rawUsername = (user.username || "").trim().replace(/^@+/, "");
      if (!rawUsername || rawUsername === "." || rawUsername.length < 2) {
        rawUsername = generated || "colaborador";
      }

      document
        .querySelectorAll("#user-display-username, [data-user-username]")
        .forEach((el) => {
          el.textContent = `@${rawUsername}`;
        });

      // Rol
      const role =
        user.roleName ||
        (user.role === "admin"
          ? "Jefe / Administrador"
          : user.role === "administrativo"
          ? "Administrativo"
          : "Vendedor POS");

      document
        .querySelectorAll("#user-role-badge, #user-display-role, [data-user-role]")
        .forEach((el) => {
          el.textContent = role;
        });

      // Iniciales Avatar
      const initials =
        (
          name.charAt(0) + (lastname.charAt(0) || name.charAt(1) || "")
        ).toUpperCase() || "OP";

      document
        .querySelectorAll("#user-avatar, [data-user-avatar]")
        .forEach((el) => {
          el.textContent = initials;
        });
    }
  } catch (err) {
    console.error("Error al hidratar sesión en sidebar:", err);
  }
}

/**
 * Configura los enlaces activos del Sidebar según la ruta actual
 */
export function markActiveNavLink() {
  if (typeof window === "undefined") return;

  const currentPath = window.location.pathname.replace(/\/$/, "");
  const links = document.querySelectorAll("#main-sidebar nav a[data-path]");

  links.forEach((link) => {
    const linkPath = link.getAttribute("href")?.replace(/\/$/, "") || "";
    const isCurrent =
      linkPath === currentPath ||
      (currentPath === "" && linkPath === "/DashPrincipal") ||
      (link.getAttribute("data-path") === "principal" &&
        (currentPath.includes("DashPrincipal") || currentPath === ""));

    if (isCurrent) {
      link.classList.remove(
        "text-on-surface-variant",
        "hover:bg-surface-container-low",
        "hover:text-on-surface"
      );
      link.classList.add(
        "bg-primary-container",
        "text-on-primary",
        "font-semibold",
        "shadow-xs"
      );
      link.setAttribute("aria-current", "page");
    } else {
      link.classList.remove(
        "bg-primary-container",
        "text-on-primary",
        "font-semibold",
        "shadow-xs"
      );
      link.classList.add(
        "text-on-surface-variant",
        "hover:bg-surface-container-low",
        "hover:text-on-surface"
      );
      link.removeAttribute("aria-current");
    }
  });
}

/**
 * Abre el menú lateral con animación fluida de GSAP y bloquea el desplazamiento del fondo
 */
export function openSidebar() {
  const sidebar = document.getElementById("main-sidebar");
  const backdrop = document.getElementById("sidebar-backdrop");
  if (!sidebar || isAnimating) return;

  isAnimating = true;

  // Bloquear scroll de la página de fondo
  document.body.style.overflow = "hidden";
  document.body.style.touchAction = "none";

  // Hacer interactivo y visible el sidebar
  sidebar.classList.remove("pointer-events-none", "invisible");
  sidebar.setAttribute("aria-hidden", "false");

  // Animar aparición del telón de fondo
  if (backdrop) {
    backdrop.classList.remove("hidden");
    gsap.fromTo(
      backdrop,
      { opacity: 0 },
      { opacity: 1, duration: 0.25, ease: "power2.out" }
    );
  }

  const navLinks = sidebar.querySelectorAll("nav a");
  const profileCard = document.getElementById("sidebar-user-card");

  const tl = gsap.timeline({
    onComplete: () => {
      isSidebarOpen = true;
      isAnimating = false;
    },
  });

  // Deslizar el sidebar desde la izquierda
  tl.fromTo(
    sidebar,
    { x: "-100%" },
    { x: "0%", duration: 0.35, ease: "power3.out" },
    0
  );

  // Micro-animación en cascada para los ítems de navegación
  if (navLinks.length > 0) {
    tl.fromTo(
      navLinks,
      { x: -14, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.3, stagger: 0.03, ease: "power2.out" },
      0.08
    );
  }

  // Aparición suave de la tarjeta de usuario
  if (profileCard) {
    tl.fromTo(
      profileCard,
      { y: 12, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.35, ease: "power2.out" },
      0.15
    );
  }
}

/**
 * Cierra el menú lateral y restaura el desplazamiento del fondo
 */
export function closeSidebar() {
  const sidebar = document.getElementById("main-sidebar");
  const backdrop = document.getElementById("sidebar-backdrop");
  if (!sidebar || isAnimating) return;

  isAnimating = true;

  // Restaurar desplazamiento del fondo
  document.body.style.overflow = "";
  document.body.style.touchAction = "";

  sidebar.setAttribute("aria-hidden", "true");

  if (backdrop) {
    gsap.to(backdrop, {
      opacity: 0,
      duration: 0.22,
      ease: "power2.in",
      onComplete: () => backdrop.classList.add("hidden"),
    });
  }

  gsap.to(sidebar, {
    x: "-100%",
    duration: 0.28,
    ease: "power3.in",
    onComplete: () => {
      isSidebarOpen = false;
      isAnimating = false;
      sidebar.classList.add("pointer-events-none", "invisible");
    },
  });
}

/**
 * Alterna el estado del menú lateral (abrir / cerrar)
 */
export function toggleSidebar() {
  if (isSidebarOpen) {
    closeSidebar();
  } else {
    openSidebar();
  }
}

/**
 * Animación de entrada inicial para la barra superior
 */
export function animateNavEntrance() {
  const header = document.getElementById("top-header");
  if (header) {
    gsap.fromTo(
      header,
      { y: -16, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.4, ease: "power2.out" }
    );
  }
}

/**
 * Inicializa todos los eventos, enlaces, sesión y estado del menú lateral
 */
export function initNavSlide() {
  if (typeof window === "undefined") return;

  const sidebar = document.getElementById("main-sidebar");
  const backdrop = document.getElementById("sidebar-backdrop");

  // Estado inicial garantizado: 100% oculto al cargar la página
  if (sidebar) {
    sidebar.classList.add("pointer-events-none", "invisible");
    sidebar.setAttribute("aria-hidden", "true");
    gsap.set(sidebar, { x: "-100%" });
  }

  if (backdrop) {
    backdrop.classList.add("hidden");
    gsap.set(backdrop, { opacity: 0 });
  }

  document.body.style.overflow = "";
  document.body.style.touchAction = "";
  isSidebarOpen = false;
  isAnimating = false;

  // Hidratar datos de sesión
  hydrateUserSession();

  // Marcar enlace activo
  markActiveNavLink();

  // Animación de entrada solo para el navbar superior
  animateNavEntrance();

  // Exponer globalmente toggleSidebar, openSidebar y closeSidebar
  window.toggleSidebar = toggleSidebar;
  window.openSidebar = openSidebar;
  window.closeSidebar = closeSidebar;

  // Botones de alternar menú lateral
  const toggleBtns = document.querySelectorAll(
    "#btn-toggle-sidebar, [data-action='toggle-sidebar']"
  );
  toggleBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      toggleSidebar();
    });
  });

  // Botón cerrar dentro del sidebar
  const closeBtn = document.getElementById("btn-close-sidebar");
  if (closeBtn) {
    closeBtn.addEventListener("click", (e) => {
      e.preventDefault();
      closeSidebar();
    });
  }

  // Clic en el telón de fondo para cerrar
  if (backdrop) {
    backdrop.addEventListener("click", (e) => {
      e.preventDefault();
      closeSidebar();
    });
  }

  // Cerrar con la tecla Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isSidebarOpen) {
      closeSidebar();
    }
  });

  // Cerrar sidebar al hacer clic en cualquier enlace interno
  const navLinks = document.querySelectorAll("#main-sidebar nav a");
  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      closeSidebar();
    });
  });

  // Cerrar sesión
  const logoutBtns = document.querySelectorAll(
    "#logout-btn, [data-action='logout']"
  );
  logoutBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.removeItem("stock_auth_user");
      localStorage.removeItem("stock_auth_token");
      sessionStorage.removeItem("stock_auth_user");
      sessionStorage.removeItem("stock_auth_token");
      window.location.href = "/";
    });
  });
}
