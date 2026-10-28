import gsap from "gsap";

/**
 * Control del Drawer deslizante lateral para Agregar/Editar Producto
 */
let isDrawerOpen = false;

export function openProductDrawer() {
  const backdrop = document.getElementById("drawer-backdrop");
  const panel = document.getElementById("drawer-panel");
  if (!backdrop || !panel) return;

  isDrawerOpen = true;

  // Bloquear scroll de la página de fondo
  document.body.style.overflow = "hidden";

  backdrop.classList.remove("hidden", "pointer-events-none");
  panel.classList.remove("pointer-events-none");

  const tl = gsap.timeline();
  tl.fromTo(
    backdrop,
    { opacity: 0 },
    { opacity: 1, duration: 0.25, ease: "power2.out" }
  ).fromTo(
    panel,
    { x: "100%" },
    { x: "0%", duration: 0.35, ease: "power3.out" },
    0
  );
}

export function closeProductDrawer() {
  const backdrop = document.getElementById("drawer-backdrop");
  const panel = document.getElementById("drawer-panel");
  if (!backdrop || !panel) return;

  isDrawerOpen = false;
  document.body.style.overflow = "";

  const tl = gsap.timeline({
    onComplete: () => {
      backdrop.classList.add("hidden", "pointer-events-none");
      panel.classList.add("pointer-events-none");
    },
  });

  tl.to(panel, {
    x: "100%",
    duration: 0.28,
    ease: "power3.in",
  }).to(
    backdrop,
    {
      opacity: 0,
      duration: 0.2,
      ease: "power2.in",
    },
    0.05
  );
}

/**
 * Notificación Toast fluida con GSAP
 * @param {string} message 
 * @param {'success' | 'info' | 'warning'} type 
 */
let toastTimeline = null;
export function showInventoryToast(message, type = "success") {
  const toast = document.getElementById("inventory-toast");
  const toastText = document.getElementById("inventory-toast-text");
  const toastIcon = document.getElementById("inventory-toast-icon");

  if (!toast) return;

  if (toastText) toastText.textContent = message;

  if (toastIcon) {
    if (type === "warning") {
      toastIcon.textContent = "warning";
      toast.className =
        "fixed bottom-6 right-6 bg-error text-on-error px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 z-50 transition-all";
    } else {
      toastIcon.textContent = "check_circle";
      toast.className =
        "fixed bottom-6 right-6 bg-primary text-on-primary px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 z-50 transition-all";
    }
  }

  if (toastTimeline) toastTimeline.kill();

  toast.classList.remove("pointer-events-none");

  toastTimeline = gsap.timeline();
  toastTimeline
    .fromTo(
      toast,
      { y: 50, opacity: 0, scale: 0.92 },
      { y: 0, opacity: 1, scale: 1, duration: 0.32, ease: "back.out(1.5)" }
    )
    .to(toast, {
      y: 50,
      opacity: 0,
      scale: 0.92,
      duration: 0.25,
      ease: "power2.in",
      delay: 3.5,
      onComplete: () => {
        toast.classList.add("pointer-events-none");
      },
    });
}

/**
 * Inicialización limpia de eventos, micro-animaciones y cálculo de márgenes
 * Sin parpadeo blanco (FOUC) en carga inicial
 */
export function initInventoryAnimations() {
  if (typeof window === "undefined") return;

  // 1. Limpieza de transformaciones residuales sin forzar opacidad a 0
  const kpiCards = document.querySelectorAll(".inv-kpi-card");
  gsap.set(kpiCards, { opacity: 1, clearProps: "transform" });

  // 2. Micro-interacción de elevación sutil en tarjetas KPI
  kpiCards.forEach((card) => {
    card.addEventListener("mouseenter", () => {
      gsap.to(card, { y: -2, duration: 0.2, ease: "power1.out" });
    });
    card.addEventListener("mouseleave", () => {
      gsap.to(card, { y: 0, duration: 0.25, ease: "power1.out", clearProps: "transform" });
    });
  });

  // 3. Cálculo dinámico de margen en el formulario del Drawer
  const costInput = document.getElementById("drawer-cost");
  const priceInput = document.getElementById("drawer-price");
  const marginOutput = document.getElementById("drawer-margin");

  function calcMargin() {
    if (!costInput || !priceInput || !marginOutput) return;
    const cost = parseFloat(costInput.value) || 0;
    const price = parseFloat(priceInput.value) || 0;

    if (price > 0 && price >= cost) {
      const margin = (((price - cost) / price) * 100).toFixed(1);
      marginOutput.textContent = `+${margin}%`;
      marginOutput.classList.remove("text-error", "bg-error-container/40");
      marginOutput.classList.add("text-on-tertiary-container", "bg-surface-container-high");
    } else if (price > 0 && price < cost) {
      const loss = (((cost - price) / price) * 100).toFixed(1);
      marginOutput.textContent = `-${loss}%`;
      marginOutput.classList.remove("text-on-tertiary-container", "bg-surface-container-high");
      marginOutput.classList.add("text-error", "bg-error-container/40");
    } else {
      marginOutput.textContent = "0.0%";
      marginOutput.classList.remove("text-error", "bg-error-container/40");
      marginOutput.classList.add("text-on-tertiary-container", "bg-surface-container-high");
    }
  }

  if (costInput && priceInput) {
    costInput.addEventListener("input", calcMargin);
    priceInput.addEventListener("input", calcMargin);
  }

  // 4. Filtrado en tiempo real en la tabla
  const searchInput = document.getElementById("inventory-search");
  const categoryFilter = document.getElementById("filter-category");
  const statusFilter = document.getElementById("filter-status");
  const resetFiltersBtn = document.getElementById("btn-reset-filters");

  function applyFilters() {
    const query = (searchInput?.value || "").toLowerCase().trim();
    const category = (categoryFilter?.value || "").toLowerCase();
    const status = (statusFilter?.value || "").toLowerCase();

    const rows = document.querySelectorAll(".inventory-row");
    let visibleCount = 0;

    rows.forEach((row) => {
      const text = row.textContent?.toLowerCase() || "";
      const rowCategory = (row.getAttribute("data-category") || "").toLowerCase();
      const rowStatus = (row.getAttribute("data-status") || "").toLowerCase();

      const matchesQuery = !query || text.includes(query);
      const matchesCategory = !category || rowCategory === category;
      const matchesStatus = !status || rowStatus === status;

      if (matchesQuery && matchesCategory && matchesStatus) {
        row.style.display = "";
        visibleCount++;
      } else {
        row.style.display = "none";
      }
    });

    const counter = document.getElementById("inventory-visible-count");
    if (counter) {
      counter.textContent = `${visibleCount}`;
    }
  }

  if (searchInput) searchInput.addEventListener("input", applyFilters);
  if (categoryFilter) categoryFilter.addEventListener("change", applyFilters);
  if (statusFilter) statusFilter.addEventListener("change", applyFilters);

  if (resetFiltersBtn) {
    resetFiltersBtn.addEventListener("click", () => {
      if (searchInput) searchInput.value = "";
      if (categoryFilter) categoryFilter.value = "";
      if (statusFilter) statusFilter.value = "";
      applyFilters();
      showInventoryToast("Filtros restablecidos.", "info");
    });
  }

  // 5. Atajo de teclado 'Esc' para limpiar buscador o cerrar Drawer
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (isDrawerOpen) {
        closeProductDrawer();
      } else if (searchInput && document.activeElement === searchInput) {
        searchInput.value = "";
        applyFilters();
        searchInput.blur();
      }
    }
  });

  // 6. Configuración de botones del Drawer
  const btnOpenDrawer = document.getElementById("btn-open-drawer");
  const btnCloseDrawer = document.getElementById("btn-close-drawer");
  const btnCancelDrawer = document.getElementById("btn-cancel-drawer");
  const btnSaveDrawer = document.getElementById("btn-save-drawer");
  const drawerBackdrop = document.getElementById("drawer-backdrop");

  if (btnOpenDrawer) btnOpenDrawer.addEventListener("click", openProductDrawer);
  if (btnCloseDrawer) btnCloseDrawer.addEventListener("click", closeProductDrawer);
  if (btnCancelDrawer) btnCancelDrawer.addEventListener("click", closeProductDrawer);

  if (drawerBackdrop) {
    drawerBackdrop.addEventListener("click", (e) => {
      if (e.target === drawerBackdrop) {
        closeProductDrawer();
      }
    });
  }

  if (btnSaveDrawer) {
    btnSaveDrawer.addEventListener("click", () => {
      closeProductDrawer();
      showInventoryToast("Producto guardado con éxito. Existencias sincronizadas.");
    });
  }

  // 7. Acciones rápidas de fila (Ajuste rápido, kardex, eliminar)
  document.querySelectorAll("[data-action='quick-adjust']").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const sku = btn.getAttribute("data-sku") || "SKU";
      showInventoryToast(`Ajuste rápido de existencias abierto para ${sku}.`, "info");
    });
  });

  document.querySelectorAll("[data-action='kardex']").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const sku = btn.getAttribute("data-sku") || "SKU";
      showInventoryToast(`Consultando Kárdex de movimientos de ${sku}...`, "info");
    });
  });

  document.querySelectorAll("[data-action='delete-item']").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const row = btn.closest("tr");
      const sku = btn.getAttribute("data-sku") || "SKU";
      if (confirm(`¿Confirma eliminar ${sku} del catálogo activo?`)) {
        if (row) {
          gsap.to(row, {
            opacity: 0,
            x: -20,
            duration: 0.25,
            onComplete: () => {
              row.remove();
              applyFilters();
              showInventoryToast(`Ítem ${sku} retirado del inventario.`, "warning");
            },
          });
        }
      }
    });
  });

  // 8. Event listeners preparados para los dos futuros componentes:
  // "Agregar Categoría" y "Carga Masiva"
  const btnCategory = document.getElementById("btn-open-category");
  if (btnCategory) {
    btnCategory.addEventListener("click", () => {
      if (window.onOpenCategoryModal) {
        window.onOpenCategoryModal();
      } else {
        showInventoryToast("Módulo de Categorías listo para vincular el componente.", "info");
      }
    });
  }

  const btnBulkUpload = document.getElementById("btn-bulk-upload");
  if (btnBulkUpload) {
    btnBulkUpload.addEventListener("click", () => {
      if (window.onOpenBulkUploadModal) {
        window.onOpenBulkUploadModal();
      } else {
        showInventoryToast("Módulo de Carga Masiva listo para vincular el componente.", "info");
      }
    });
  }
}
