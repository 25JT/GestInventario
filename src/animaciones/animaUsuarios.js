import gsap from "gsap";

/**
 * Control del Modal de Invitar / Registrar Usuario
 */
export function openUserModal() {
  const modal = document.getElementById("inviteUserModalOverlay") || document.getElementById("userModal");
  const panel = document.getElementById("inviteUserModalContainer") || document.getElementById("userModalPanel");
  if (!modal || !panel) return;

  modal.classList.remove("hidden");
  document.body.style.overflow = "hidden";

  gsap.killTweensOf([modal, panel]);
  gsap.fromTo(modal, { opacity: 0 }, { opacity: 1, duration: 0.2, ease: "power2.out" });
  gsap.fromTo(
    panel,
    { scale: 0.94, y: 16, opacity: 0 },
    { scale: 1, y: 0, opacity: 1, duration: 0.25, ease: "power2.out" }
  );
}

export function closeUserModal() {
  const modal = document.getElementById("inviteUserModalOverlay") || document.getElementById("userModal");
  const panel = document.getElementById("inviteUserModalContainer") || document.getElementById("userModalPanel");
  if (!modal || !panel) return;

  document.body.style.overflow = "";

  gsap.killTweensOf([modal, panel]);
  gsap.to(panel, {
    scale: 0.96,
    opacity: 0,
    duration: 0.16,
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
 * Notificación Toast para Usuarios y Roles
 * @param {string} message 
 * @param {'success' | 'info' | 'warning'} type 
 */
let toastTimeline = null;
export function showUserToast(message, type = "success") {
  const toast = document.getElementById("userToast");
  const toastMsg = document.getElementById("userToastMsg");
  const toastIcon = document.getElementById("userToastIcon");

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
      toastIcon.textContent = "verified_user";
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
 * Filtrado dinámico por pestañas de Rol
 * @param {'all' | 'jefe' | 'admin' | 'pos'} roleKey 
 * @param {HTMLElement} btn 
 */
export function filterRoleTab(roleKey, btn) {
  document.querySelectorAll(".role-tab-btn").forEach((b) => {
    b.className =
      "role-tab-btn px-3 py-1.5 rounded-lg text-on-surface-variant hover:text-on-surface text-[12px] font-medium transition-all flex items-center gap-2 cursor-pointer";
  });
  btn.className =
    "role-tab-btn px-3 py-1.5 rounded-lg bg-surface-container-lowest text-on-surface text-[12px] font-semibold shadow-xs transition-all flex items-center gap-2 cursor-pointer";

  const rows = document.querySelectorAll(".user-row");
  let visibleCount = 0;

  rows.forEach((row) => {
    const rowRole = (row.getAttribute("data-role-type") || "").toLowerCase();
    if (roleKey === "all" || rowRole === roleKey) {
      row.style.display = "";
      visibleCount++;
    } else {
      row.style.display = "none";
    }
  });

  const countEl = document.getElementById("user-visible-count");
  if (countEl) countEl.textContent = `${visibleCount}`;
}

/**
 * Inicialización de micro-animaciones, eventos y filtros
 */
export function initUsuarios() {
  if (typeof window === "undefined") return;

  // 1. Micro-interacción en tarjetas de métricas
  document.querySelectorAll(".user-metric-card").forEach((card) => {
    card.addEventListener("mouseenter", () => {
      gsap.to(card, { y: -2, duration: 0.18, ease: "power1.out" });
    });
    card.addEventListener("mouseleave", () => {
      gsap.to(card, { y: 0, duration: 0.22, ease: "power1.out", clearProps: "transform" });
    });
  });

  // 2. Buscador en tiempo real y selectores
  const searchInput = document.getElementById("user-search");
  const branchSelect = document.getElementById("user-branch-filter");
  const statusSelect = document.getElementById("user-status-filter");
  const resetBtn = document.getElementById("btn-reset-user-filters");

  function applyUserFilters() {
    const q = (searchInput?.value || "").toLowerCase().trim();
    const branch = (branchSelect?.value || "").toLowerCase().trim();
    const status = (statusSelect?.value || "").toLowerCase().trim();

    const rows = document.querySelectorAll(".user-row");
    let visibleCount = 0;

    rows.forEach((row) => {
      const text = row.textContent?.toLowerCase() || "";
      const rowBranch = (row.getAttribute("data-branch") || "").toLowerCase();
      const rowStatus = (row.getAttribute("data-status") || "").toLowerCase();

      const matchesQ = !q || text.includes(q);
      const matchesBranch = !branch || branch === "sucursal: todas" || rowBranch.includes(branch);
      const matchesStatus = !status || status === "todos los estados" || rowStatus.includes(status);

      if (matchesQ && matchesBranch && matchesStatus) {
        row.style.display = "";
        visibleCount++;
      } else {
        row.style.display = "none";
      }
    });

    const countEl = document.getElementById("user-visible-count");
    if (countEl) countEl.textContent = `${visibleCount}`;
  }

  if (searchInput) searchInput.addEventListener("input", applyUserFilters);
  if (branchSelect) branchSelect.addEventListener("change", applyUserFilters);
  if (statusSelect) statusSelect.addEventListener("change", applyUserFilters);

  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      if (searchInput) searchInput.value = "";
      if (branchSelect) branchSelect.value = "Sucursal: Todas";
      if (statusSelect) statusSelect.value = "Todos los estados";
      applyUserFilters();
      showUserToast("Filtros restablecidos.", "info");
    });
  }

  // 3. Modal de nuevo usuario
  const btnNewUser = document.getElementById("btn-new-user");
  const btnCloseModal = document.getElementById("btnCloseInviteModal") || document.getElementById("btn-close-user-modal");
  const btnCancelModal = document.getElementById("btnCancelInviteModal") || document.getElementById("btn-cancel-user-modal");
  const modalBackdrop = document.getElementById("inviteUserModalOverlay") || document.getElementById("userModal");

  if (btnNewUser) btnNewUser.addEventListener("click", openUserModal);
  if (btnCloseModal) btnCloseModal.addEventListener("click", closeUserModal);
  if (btnCancelModal) btnCancelModal.addEventListener("click", closeUserModal);

  if (modalBackdrop) {
    modalBackdrop.addEventListener("click", (e) => {
      if (e.target === modalBackdrop) {
        closeUserModal();
      }
    });
  }

  // Atajo de escape para cerrar modal
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      const modal = document.getElementById("inviteUserModalOverlay") || document.getElementById("userModal");
      if (modal && !modal.classList.contains("hidden")) {
        closeUserModal();
      }
    }
  });
}
