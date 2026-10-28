import gsap from "gsap";

/**
 * Control del Modal de Registro de Gastos Operativos
 */
export function openExpenseModal() {
  const modal = document.getElementById("expenseModalOverlay") || document.getElementById("expenseModal");
  const panel = document.getElementById("expenseModalContainer") || document.getElementById("expenseModalPanel");
  if (!modal || !panel) return;

  modal.classList.remove("hidden");
  document.body.style.overflow = "hidden";

  gsap.fromTo(
    modal,
    { opacity: 0 },
    { opacity: 1, duration: 0.2, ease: "power2.out" }
  );

  gsap.fromTo(
    panel,
    { scale: 0.94, y: 20, opacity: 0 },
    { scale: 1, y: 0, opacity: 1, duration: 0.25, ease: "power2.out" }
  );
}

export function closeExpenseModal() {
  const modal = document.getElementById("expenseModalOverlay") || document.getElementById("expenseModal");
  const panel = document.getElementById("expenseModalContainer") || document.getElementById("expenseModalPanel");
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
 * Notificación Toast fluida para el módulo de Gastos
 * @param {string} message 
 * @param {'success' | 'info' | 'warning'} type 
 */
let toastTimeline = null;
export function showExpenseToast(message, type = "success") {
  const toast = document.getElementById("expenseToast");
  const toastMsg = document.getElementById("expenseToastMsg");
  const toastIcon = document.getElementById("expenseToastIcon");

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
 * Inicialización de micro-animaciones, filtros interactivos y cálculo de gastos
 */
export function initGastos() {
  if (typeof window === "undefined") return;

  // 1. Animación suave para los anillos del gráfico SVG Donut
  const donutSegments = document.querySelectorAll(".donut-segment");
  if (donutSegments.length > 0) {
    gsap.fromTo(
      donutSegments,
      { opacity: 0.4, scale: 0.95, transformOrigin: "50% 50%" },
      {
        opacity: 1,
        scale: 1,
        duration: 0.65,
        stagger: 0.08,
        ease: "power2.out",
        clearProps: "transform",
      }
    );
  }

  // 2. Micro-interacción de elevación para las tarjetas de KPIs
  document.querySelectorAll(".expense-kpi-card").forEach((card) => {
    card.addEventListener("mouseenter", () => {
      gsap.to(card, { y: -2, duration: 0.18, ease: "power1.out" });
    });
    card.addEventListener("mouseleave", () => {
      gsap.to(card, { y: 0, duration: 0.22, ease: "power1.out", clearProps: "transform" });
    });
  });

  // 3. Filtrado en vivo por concepto y por categoría
  const searchInput = document.getElementById("expense-search");
  const categorySelect = document.getElementById("expense-category-filter");
  const resetBtn = document.getElementById("btn-reset-expense-filters");

  function applyExpenseFilters() {
    const q = (searchInput?.value || "").toLowerCase().trim();
    const cat = (categorySelect?.value || "").toLowerCase().trim();

    const rows = document.querySelectorAll(".expense-row");
    let visibleCount = 0;
    let accumulated = 0;

    rows.forEach((row) => {
      const text = row.textContent?.toLowerCase() || "";
      const rowCat = (row.getAttribute("data-category") || "").toLowerCase();
      const amount = parseFloat(row.getAttribute("data-amount") || "0");

      const matchesQ = !q || text.includes(q);
      const matchesCat = !cat || cat === "todas las categorías" || rowCat.includes(cat);

      if (matchesQ && matchesCat) {
        row.style.display = "";
        visibleCount++;
        accumulated += amount;
      } else {
        row.style.display = "none";
      }
    });

    const countEl = document.getElementById("expense-matches-count");
    const accumEl = document.getElementById("expense-accum-total");
    if (countEl) countEl.textContent = `${visibleCount} egresos`;
    if (accumEl) accumEl.textContent = `$${accumulated.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} acumulado`;
  }

  if (searchInput) searchInput.addEventListener("input", applyExpenseFilters);
  if (categorySelect) categorySelect.addEventListener("change", applyExpenseFilters);

  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      if (searchInput) searchInput.value = "";
      if (categorySelect) categorySelect.value = "Todas las Categorías";
      applyExpenseFilters();
      showExpenseToast("Filtros restablecidos.", "info");
    });
  }

  // 4. Modal de nuevo gasto
  const btnNewExpense = document.getElementById("btn-new-expense");
  const btnNewReceipt = document.getElementById("btn-new-receipt");
  const btnCloseModal = document.getElementById("closeModalBtn") || document.getElementById("btn-close-expense-modal");
  const btnCancelModal = document.getElementById("cancelModalBtn") || document.getElementById("btn-cancel-expense-modal");
  const modalBackdrop = document.getElementById("expenseModalOverlay") || document.getElementById("expenseModal");

  if (btnNewExpense) btnNewExpense.addEventListener("click", openExpenseModal);
  if (btnNewReceipt) btnNewReceipt.addEventListener("click", openExpenseModal);
  if (btnCloseModal) btnCloseModal.addEventListener("click", closeExpenseModal);
  if (btnCancelModal) btnCancelModal.addEventListener("click", closeExpenseModal);

  if (modalBackdrop) {
    modalBackdrop.addEventListener("click", (e) => {
      if (e.target === modalBackdrop) {
        closeExpenseModal();
      }
    });
  }

  // Atajo de escape para cerrar modal
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      const modal = document.getElementById("expenseModalOverlay") || document.getElementById("expenseModal");
      if (modal && !modal.classList.contains("hidden")) {
        closeExpenseModal();
      }
    }
  });
}
