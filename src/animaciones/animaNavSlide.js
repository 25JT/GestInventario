import gsap from "gsap";

/**
 * Estado reactivo del menú lateral
 */
let isSidebarOpenDesktop = true;
let isSidebarOpenMobile = false;
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

      // Nombre completo o nombre de pila
      const displayNameElements = document.querySelectorAll(
        "#user-display-name, [data-user-name]"
      );
      const name =
        user.name ||
        user.nombre ||
        (user.identifier ? user.identifier.split("@")[0] : "Colaborador");
      const lastname = user.lastname || user.apellido || "";
      const fullName = `${name} ${lastname}`.trim();

      displayNameElements.forEach((el) => {
        el.textContent = fullName;
      });

      // Nombre en bienvenida (ej. Dashboard)
      const welcomeName = document.getElementById("welcome-name");
      if (welcomeName) {
        welcomeName.textContent = name;
      }

      // Nombre de usuario (@usuario)
      const usernameEls = document.querySelectorAll(
        "#user-display-username, [data-user-username]"
      );
      const username = user.username || (name.slice(0, 2) + lastname.slice(0, 3)).toLowerCase();
      usernameEls.forEach((el) => {
        el.textContent = `@${username.replace(/^@/, "")}`;
      });

      // Rol de usuario
      const roleEls = document.querySelectorAll(
        "#user-role-badge, #user-display-role, [data-user-role]"
      );
      const role =
        user.roleName ||
        (user.role === "admin"
          ? "Jefe / Administrador"
          : user.role === "administrativo"
          ? "Administrativo"
          : "Vendedor POS");
      roleEls.forEach((el) => {
        el.textContent = role;
      });

      // Iniciales / Avatar
      const avatarEls = document.querySelectorAll(
        "#user-avatar, [data-user-avatar]"
      );
      const initials = (name.charAt(0) + (lastname.charAt(0) || name.charAt(1) || "")).toUpperCase();
      avatarEls.forEach((el) => {
        el.textContent = initials || "OP";
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
      (link.getAttribute("data-path") === "principal" && (currentPath.includes("DashPrincipal") || currentPath === ""));

    if (isCurrent) {
      link.classList.remove("text-on-surface-variant", "hover:bg-surface-container-low", "hover:text-on-surface");
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
 * Alterna el sidebar en dispositivos móviles (off-canvas con backdrop)
 */
export function toggleMobileSidebar(open) {
  const sidebar = document.getElementById("main-sidebar");
  const backdrop = document.getElementById("sidebar-backdrop");
  if (!sidebar || isAnimating) return;

  const shouldOpen = typeof open === "boolean" ? open : !isSidebarOpenMobile;
  isAnimating = true;

  if (shouldOpen) {
    if (backdrop) {
      backdrop.classList.remove("hidden");
      gsap.fromTo(
        backdrop,
        { opacity: 0 },
        { opacity: 1, duration: 0.25, ease: "power2.out" }
      );
    }

    gsap.fromTo(
      sidebar,
      { x: "-100%" },
      {
        x: "0%",
        duration: 0.35,
        ease: "power3.out",
        onComplete: () => {
          isSidebarOpenMobile = true;
          isAnimating = false;
        },
      }
    );
  } else {
    if (backdrop) {
      gsap.to(backdrop, {
        opacity: 0,
        duration: 0.25,
        ease: "power2.in",
        onComplete: () => backdrop.classList.add("hidden"),
      });
    }

    gsap.to(sidebar, {
      x: "-100%",
      duration: 0.3,
      ease: "power3.in",
      onComplete: () => {
        isSidebarOpenMobile = false;
        isAnimating = false;
      },
    });
  }
}

/**
 * Alterna el sidebar en pantallas de escritorio (colapso / expansión fluida)
 */
export function toggleDesktopSidebar(open) {
  const sidebar = document.getElementById("main-sidebar");
  const header = document.getElementById("top-header");
  const appContent = document.getElementById("app-content");

  if (!sidebar || isAnimating) return;

  const shouldOpen = typeof open === "boolean" ? open : !isSidebarOpenDesktop;
  isAnimating = true;

  const targetX = shouldOpen ? 0 : -256;
  const headerLeft = shouldOpen ? "16rem" : "0rem";
  const contentPaddingLeft = shouldOpen ? "16rem" : "0rem";

  const tl = gsap.timeline({
    defaults: { duration: 0.35, ease: "power3.out" },
    onComplete: () => {
      isSidebarOpenDesktop = shouldOpen;
      isAnimating = false;
    },
  });

  tl.to(sidebar, { x: targetX }, 0);
  if (header) {
    tl.to(header, { left: headerLeft }, 0);
  }
  if (appContent) {
    tl.to(appContent, { paddingLeft: contentPaddingLeft }, 0);
  }
}

/**
 * Función principal para alternar sidebar según tamaño de pantalla
 */
export function toggleSidebar() {
  const isDesktop = window.innerWidth >= 1024;
  if (isDesktop) {
    toggleDesktopSidebar();
  } else {
    toggleMobileSidebar();
  }
}

/**
 * Animación de entrada inicial para la barra superior y enlaces del sidebar
 */
export function animateNavEntrance() {
  const header = document.getElementById("top-header");
  const navItems = document.querySelectorAll("#main-sidebar nav a");
  const profileCard = document.getElementById("sidebar-user-card");

  if (header) {
    gsap.fromTo(
      header,
      { y: -20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.45, ease: "power2.out" }
    );
  }

  if (navItems.length > 0) {
    gsap.fromTo(
      navItems,
      { x: -16, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.4, stagger: 0.04, ease: "power2.out", delay: 0.1 }
    );
  }

  if (profileCard) {
    gsap.fromTo(
      profileCard,
      { y: 15, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.45, ease: "power2.out", delay: 0.25 }
    );
  }
}

/**
 * Inicializa todos los eventos, hidratación de sesión y animaciones de Nav & SlideBar
 */
export function initNavSlide() {
  if (typeof window === "undefined") return;

  // Hidratar datos de sesión
  hydrateUserSession();

  // Marcar enlace activo
  markActiveNavLink();

  // Animación de entrada
  animateNavEntrance();

  // Exponer toggleSidebar globalmente para llamadas desde onclick de HTML
  window.toggleSidebar = toggleSidebar;

  // Botón de menú hamburguesa
  const toggleBtns = document.querySelectorAll(
    "#btn-toggle-sidebar, [data-action='toggle-sidebar']"
  );
  toggleBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      toggleSidebar();
    });
  });

  // Botón cerrar en móvil
  const closeBtn = document.getElementById("btn-close-sidebar");
  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      toggleMobileSidebar(false);
    });
  }

  // Backdrop en móvil
  const backdrop = document.getElementById("sidebar-backdrop");
  if (backdrop) {
    backdrop.addEventListener("click", () => {
      toggleMobileSidebar(false);
    });
  }

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

  // Escuchar redimensionamiento de pantalla para resetear transformaciones si cambia de móvil a desktop
  window.addEventListener("resize", () => {
    const isDesktop = window.innerWidth >= 1024;
    const sidebar = document.getElementById("main-sidebar");
    const header = document.getElementById("top-header");
    const appContent = document.getElementById("app-content");
    const backdropEl = document.getElementById("sidebar-backdrop");

    if (isDesktop) {
      if (backdropEl) backdropEl.classList.add("hidden");
      isSidebarOpenMobile = false;
      if (sidebar) gsap.set(sidebar, { x: isSidebarOpenDesktop ? 0 : -256 });
      if (header) gsap.set(header, { left: isSidebarOpenDesktop ? "16rem" : "0rem" });
      if (appContent) gsap.set(appContent, { paddingLeft: isSidebarOpenDesktop ? "16rem" : "0rem" });
    } else {
      if (sidebar) gsap.set(sidebar, { x: isSidebarOpenMobile ? "0%" : "-100%" });
      if (header) gsap.set(header, { left: "0rem" });
      if (appContent) gsap.set(appContent, { paddingLeft: "0rem" });
    }
  });
}
