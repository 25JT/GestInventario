import gsap from "gsap";

/**
 * Módulo de Animaciones e Interactividad para Servicios Técnicos
 */
let activeTab = "catalog";

/**
 * Alternancia fluida entre Catálogo de Servicios y Órdenes de Trabajo
 * @param {'catalog' | 'orders'} tab 
 */
export function switchServiceTab(tab) {
  if (tab === activeTab) return;
  activeTab = tab;

  const btnCatalog = document.getElementById("tab-service-catalog");
  const btnOrders = document.getElementById("tab-service-orders");
  const viewCatalog = document.getElementById("view-service-catalog");
  const viewOrders = document.getElementById("view-service-orders");

  if (!btnCatalog || !btnOrders || !viewCatalog || !viewOrders) return;

  if (tab === "catalog") {
    btnCatalog.className =
      "px-3.5 py-2.5 text-[13px] font-semibold text-secondary-container bg-surface-container-lowest rounded-t-xl shadow-xs flex items-center gap-2 cursor-pointer transition-all";
    btnOrders.className =
      "px-3.5 py-2.5 text-[13px] font-medium text-on-surface-variant hover:text-on-surface rounded-t-xl hover:bg-surface-container/50 transition-colors flex items-center gap-2 cursor-pointer";

    gsap.to(viewOrders, {
      opacity: 0,
      y: 8,
      duration: 0.16,
      ease: "power2.in",
      onComplete: () => {
        viewOrders.classList.add("hidden");
        viewCatalog.classList.remove("hidden");
        gsap.fromTo(
          viewCatalog,
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.24, ease: "power2.out", clearProps: "transform,opacity" }
        );
      },
    });
  } else {
    btnOrders.className =
      "px-3.5 py-2.5 text-[13px] font-semibold text-secondary-container bg-surface-container-lowest rounded-t-xl shadow-xs flex items-center gap-2 cursor-pointer transition-all";
    btnCatalog.className =
      "px-3.5 py-2.5 text-[13px] font-medium text-on-surface-variant hover:text-on-surface rounded-t-xl hover:bg-surface-container/50 transition-colors flex items-center gap-2 cursor-pointer";

    gsap.to(viewCatalog, {
      opacity: 0,
      y: 8,
      duration: 0.16,
      ease: "power2.in",
      onComplete: () => {
        viewCatalog.classList.add("hidden");
        viewOrders.classList.remove("hidden");
        gsap.fromTo(
          viewOrders,
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.24, ease: "power2.out", clearProps: "transform,opacity" }
        );
      },
    });
  }
}

/**
 * Control del Modal de Registro de Servicios
 */
export function openServiceModal() {
  const modal = document.getElementById("serviceModal");
  const panel = document.getElementById("serviceModalPanel");
  if (!modal || !panel) return;

  modal.classList.remove("hidden");
  document.body.style.overflow = "hidden";

  gsap.fromTo(modal, { opacity: 0 }, { opacity: 1, duration: 0.2, ease: "power2.out" });
  gsap.fromTo(
    panel,
    { scale: 0.92, y: 16, opacity: 0 },
    { scale: 1, y: 0, opacity: 1, duration: 0.25, ease: "power2.out" }
  );
}

export function closeServiceModal() {
  const modal = document.getElementById("serviceModal");
  const panel = document.getElementById("serviceModalPanel");
  if (!modal || !panel) return;

  document.body.style.overflow = "";

  gsap.to(panel, {
    scale: 0.95,
    opacity: 0,
    duration: 0.18,
    ease: "power2.in",
  });

  gsap.to(modal, {
    opacity: 0,
    duration: 0.18,
    ease: "power2.in",
    onComplete: () => {
      modal.classList.add("hidden");
    },
  });
}

/**
 * Notificación Toast para Servicios
 * @param {string} message 
 * @param {'success' | 'info' | 'warning'} type 
 */
let toastTimeline = null;
export function showServiceToast(message, type = "success") {
  const toast = document.getElementById("serviceToast");
  const toastMsg = document.getElementById("serviceToastMsg");
  const toastIcon = document.getElementById("serviceToastIcon");

  if (!toast || !toastMsg) return;

  toastMsg.textContent = message;

  if (toastIcon) {
    if (type === "warning") {
      toastIcon.textContent = "warning";
      toast.className =
        "fixed bottom-6 right-6 z-50 bg-error text-on-error px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 transition-all";
    } else if (type === "info") {
      toastIcon.textContent = "info";
      toast.className =
        "fixed bottom-6 right-6 z-50 bg-surface-container-high text-on-surface px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 border border-surface-container transition-all";
    } else {
      toastIcon.textContent = "check_circle";
      toast.className =
        "fixed bottom-6 right-6 z-50 bg-primary text-on-primary px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 transition-all";
    }
  }

  if (toastTimeline) toastTimeline.kill();

  toast.classList.remove("hidden", "pointer-events-none");

  toastTimeline = gsap.timeline();
  toastTimeline
    .fromTo(
      toast,
      { y: 50, opacity: 0, scale: 0.92 },
      { y: 0, opacity: 1, scale: 1, duration: 0.3, ease: "back.out(1.5)" }
    )
    .to(toast, {
      y: 50,
      opacity: 0,
      scale: 0.92,
      duration: 0.22,
      ease: "power2.in",
      delay: 3.2,
      onComplete: () => {
        toast.classList.add("hidden", "pointer-events-none");
      },
    });
}

/**
 * Inicialización de micro-animaciones, filtrado de servicios y listeners
 */
export function initServicios() {
  if (typeof window === "undefined") return;

  // 1. Micro-interacción en tarjetas KPI
  document.querySelectorAll(".service-kpi-card").forEach((card) => {
    card.addEventListener("mouseenter", () => {
      gsap.to(card, { y: -2, duration: 0.18, ease: "power1.out" });
    });
    card.addEventListener("mouseleave", () => {
      gsap.to(card, { y: 0, duration: 0.22, ease: "power1.out", clearProps: "transform" });
    });
  });

  // 2. Filtrado en vivo de servicios
  const searchInput = document.getElementById("service-search-input");
  const categoryFilter = document.getElementById("service-category-filter");
  const rateFilter = document.getElementById("service-rate-filter");
  const statusFilter = document.getElementById("service-status-filter");
  const resetBtn = document.getElementById("btn-reset-service-filters");

  function applyServiceFilters() {
    const q = (searchInput?.value || "").toLowerCase().trim();
    const cat = (categoryFilter?.value || "").toLowerCase().trim();
    const rate = (rateFilter?.value || "").toLowerCase().trim();
    const status = (statusFilter?.value || "").toLowerCase().trim();

    const rows = document.querySelectorAll(".service-row");
    let visibleCount = 0;

    rows.forEach((row) => {
      const text = row.textContent?.toLowerCase() || "";
      const rowCat = (row.getAttribute("data-category") || "").toLowerCase();
      const rowRate = (row.getAttribute("data-rate") || "").toLowerCase();
      const rowStatus = (row.getAttribute("data-status") || "").toLowerCase();

      const matchesQ = !q || text.includes(q);
      const matchesCat = !cat || cat === "categoría: todas" || rowCat.includes(cat);
      const matchesRate = !rate || rate === "tarifa: todas" || rowRate.includes(rate);
      const matchesStatus = !status || status === "estado: todos" || rowStatus.includes(status);

      if (matchesQ && matchesCat && matchesRate && matchesStatus) {
        row.style.display = "";
        visibleCount++;
      } else {
        row.style.display = "none";
      }
    });

    const counter = document.getElementById("service-visible-count");
    if (counter) {
      counter.textContent = `${visibleCount}`;
    }
  }

  if (searchInput) searchInput.addEventListener("input", applyServiceFilters);
  if (categoryFilter) categoryFilter.addEventListener("change", applyServiceFilters);
  if (rateFilter) rateFilter.addEventListener("change", applyServiceFilters);
  if (statusFilter) statusFilter.addEventListener("change", applyServiceFilters);

  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      if (searchInput) searchInput.value = "";
      if (categoryFilter) categoryFilter.value = "Categoría: Todas";
      if (rateFilter) rateFilter.value = "Tarifa: Todas";
      if (statusFilter) statusFilter.value = "Estado: Todos";
      applyServiceFilters();
      showServiceToast("Filtros restablecidos.", "info");
    });
  }

  // 3. Atajos de teclado (Esc)
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      const modal = document.getElementById("serviceModal");
      if (modal && !modal.classList.contains("hidden")) {
        closeServiceModal();
      } else if (searchInput && document.activeElement === searchInput) {
        searchInput.value = "";
        applyServiceFilters();
        searchInput.blur();
      }
    }
  });

  // 4. Modal listeners
  const btnNewService = document.getElementById("btn-new-service");
  const btnCloseModal = document.getElementById("btn-close-service-modal");
  const btnCancelModal = document.getElementById("btn-cancel-service-modal");
  const modalBackdrop = document.getElementById("serviceModal");

  if (btnNewService) btnNewService.addEventListener("click", openServiceModal);
  if (btnCloseModal) btnCloseModal.addEventListener("click", closeServiceModal);
  if (btnCancelModal) btnCancelModal.addEventListener("click", closeServiceModal);

  if (modalBackdrop) {
    modalBackdrop.addEventListener("click", (e) => {
      if (e.target === modalBackdrop) {
        closeServiceModal();
      }
    });
  }
}
