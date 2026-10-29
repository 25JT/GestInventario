import gsap from "gsap";

/**
 * Módulo de Animaciones e Interactividad para el Punto de Venta (POS) y Facturación
 */
let activeView = "pos";
let activePayment = "transfer";

/**
 * Transición fluida con GSAP entre Terminal POS y Facturación/Historial
 * @param {'pos' | 'history'} view 
 */
export function switchPosView(view) {
  if (view === activeView) return;
  activeView = view;

  const posView = document.getElementById("view-pos");
  const histView = document.getElementById("view-history");
  const tabPos = document.getElementById("tab-pos");
  const tabHist = document.getElementById("tab-history");

  if (!posView || !histView || !tabPos || !tabHist) return;

  const outTarget = view === "pos" ? histView : posView;
  const inTarget = view === "pos" ? posView : histView;

  // Actualizar estilos de los botones de pestaña
  if (view === "pos") {
    tabPos.classList.add("bg-surface-container-lowest", "text-primary", "shadow-xs", "font-semibold");
    tabPos.classList.remove("text-on-surface-variant");
    tabHist.classList.remove("bg-surface-container-lowest", "text-primary", "shadow-xs", "font-semibold");
    tabHist.classList.add("text-on-surface-variant");
  } else {
    tabHist.classList.add("bg-surface-container-lowest", "text-primary", "shadow-xs", "font-semibold");
    tabHist.classList.remove("text-on-surface-variant");
    tabPos.classList.remove("bg-surface-container-lowest", "text-primary", "shadow-xs", "font-semibold");
    tabPos.classList.add("text-on-surface-variant");
  }

  // Animación de salida y entrada suave
  gsap.killTweensOf([posView, histView]);
  gsap.to(outTarget, {
    opacity: 0,
    y: 10,
    duration: 0.18,
    ease: "power2.in",
    onComplete: () => {
      outTarget.classList.add("hidden");
      inTarget.classList.remove("hidden");
      gsap.fromTo(
        inTarget,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.28, ease: "power2.out", clearProps: "transform,opacity" }
      );
    },
  });
}

/**
 * Filtrado dinámico por categorías en el catálogo POS
 * @param {string} cat 
 * @param {HTMLElement} btn 
 */
export function filterCategoryPills(cat, btn) {
  document.querySelectorAll(".cat-pill").forEach((el) => {
    el.classList.remove("active-cat", "bg-primary", "text-on-primary", "shadow-xs", "font-semibold");
    el.classList.add("bg-surface-container-lowest", "text-on-surface", "hover:bg-surface-container-high", "font-medium");
  });

  btn.classList.add("active-cat", "bg-primary", "text-on-primary", "shadow-xs", "font-semibold");
  btn.classList.remove("bg-surface-container-lowest", "text-on-surface", "hover:bg-surface-container-high", "font-medium");

  const items = document.querySelectorAll(".product-item");
  const toShow = [];
  const toHide = [];

  items.forEach((item) => {
    const itemCats = item.getAttribute("data-category") || "";
    if (cat === "all" || itemCats.includes(cat)) {
      toShow.push(item);
    } else {
      toHide.push(item);
    }
  });

  if (toHide.length > 0) {
    gsap.to(toHide, {
      opacity: 0,
      scale: 0.95,
      duration: 0.15,
      ease: "power1.in",
      onComplete: () => {
        toHide.forEach((el) => el.classList.add("hidden"));
      },
    });
  }

  if (toShow.length > 0) {
    toShow.forEach((el) => {
      el.classList.remove("hidden");
    });
    gsap.fromTo(
      toShow,
      { opacity: 0, scale: 0.96 },
      { opacity: 1, scale: 1, duration: 0.22, stagger: 0.02, ease: "power2.out", clearProps: "transform,opacity" }
    );
  }
}

/**
 * Filtrado de búsqueda de productos en vivo
 */
export function filterProductsLive() {
  const input = document.getElementById("productSearch");
  if (!input) return;
  const q = input.value.toLowerCase().trim();
  const items = document.querySelectorAll(".product-item");

  items.forEach((item) => {
    const text = item.textContent?.toLowerCase() || "";
    if (!q || text.includes(q)) {
      item.classList.remove("hidden");
      item.style.opacity = "1";
    } else {
      item.classList.add("hidden");
    }
  });
}

export function formatCOP(num) {
  const n = Math.round(Number(num) || 0);
  return "$ " + n.toLocaleString("es-CO");
}

export function getActivePaymentMethod() {
  if (activePayment === "card") return "TARJETA";
  if (activePayment === "cash") return "EFECTIVO";
  return "TRANSFERENCIA";
}

/**
 * Recalcula subtotales, impuestos y totales de la orden
 */
export function recalcTicketTotals() {
  const rows = document.querySelectorAll(".cart-row");
  let subtotal = 0;
  let count = 0;

  rows.forEach((r) => {
    const p = parseFloat(r.getAttribute("data-price") || "0");
    const qtyEl = r.querySelector(".item-qty");
    const q = parseInt(qtyEl?.textContent || "0", 10);
    subtotal += p * q;
    count += q;
  });

  const tax = 0; // Precios en COP con impuestos incluidos
  const total = subtotal + tax;

  const countEl = document.getElementById("cartCount");
  const subtotalEl = document.getElementById("summarySubtotal");
  const taxEl = document.getElementById("summaryTax");
  const totalEl = document.getElementById("summaryTotal");
  const btnCheckoutLabel = document.getElementById("btnCheckoutLabel");

  if (countEl) countEl.textContent = `${count}`;
  if (subtotalEl) subtotalEl.textContent = formatCOP(subtotal);
  if (taxEl) taxEl.textContent = formatCOP(tax);
  if (totalEl) totalEl.textContent = formatCOP(total);
  if (btnCheckoutLabel) btnCheckoutLabel.textContent = `Cobrar y Facturar (${formatCOP(total)})`;
}

/**
 * Agrega un ítem al carrito o incrementa su cantidad con animación
 */
export function addProductToTicket(name, price, sku, category = "Producto", id = null, stock = 999, tipo = "FISICO") {
  const list = document.getElementById("cartItemsList");
  if (!list) return;

  const rows = Array.from(list.querySelectorAll(".cart-row"));
  const existingRow = rows.find((row) => {
    const rowId = row.getAttribute("data-id");
    const rowSku = row.getAttribute("data-sku");
    if (id && rowId) return rowId === id;
    if (sku && rowSku) return rowSku === sku;
    const titleEl = row.querySelector(".cart-item-title");
    return titleEl && titleEl.textContent?.trim() === name.trim();
  });

  const numericPrice = Number(price) || 0;
  const numStock = Number(stock) || 999;
  const isServicio = category === "Servicio" || (tipo || "").toUpperCase() === "SERVICIO";

  if (existingRow) {
    const qtyEl = existingRow.querySelector(".item-qty");
    if (qtyEl) {
      let currentQty = parseInt(qtyEl.textContent || "1", 10);
      if (!isServicio && currentQty >= numStock) {
        showPosToast(`Stock máximo alcanzado (${numStock} unid.)`, "warning");
        return;
      }
      currentQty += 1;
      qtyEl.textContent = `${currentQty}`;
      const itemTotalEl = existingRow.querySelector(".item-total");
      if (itemTotalEl) {
        itemTotalEl.textContent = formatCOP(numericPrice * currentQty);
      }
      gsap.fromTo(
        existingRow,
        { backgroundColor: "#dce9ff", scale: 1.02 },
        { backgroundColor: "transparent", scale: 1, duration: 0.35, ease: "power2.out" }
      );
    }
  } else {
    if (!isServicio && numStock <= 0) {
      showPosToast(`Artículo sin existencias (Stock: 0)`, "warning");
      return;
    }

    const newRow = document.createElement("div");
    newRow.className =
      "cart-row flex items-center justify-between p-2 sm:p-2.5 rounded-xl bg-surface hover:bg-surface-container transition-colors border border-surface-container/50";
    newRow.setAttribute("data-id", id || "");
    newRow.setAttribute("data-sku", sku || "");
    newRow.setAttribute("data-tipo", tipo || (isServicio ? "SERVICIO" : "FISICO"));
    newRow.setAttribute("data-price", String(numericPrice));
    newRow.setAttribute("data-stock", String(numStock));
    newRow.setAttribute("data-name", name);

    newRow.innerHTML = `
      <div class="flex flex-col min-w-0 flex-1 pr-2">
        <div class="flex items-center gap-1.5">
          <span class="cart-item-title text-[13px] font-semibold text-on-surface truncate">${name}</span>
          <span class="text-[10px] px-1.5 py-0.2 rounded font-semibold ${
            isServicio ? "bg-secondary-fixed text-on-secondary-fixed" : "bg-surface-container text-on-surface-variant"
          } shrink-0">${isServicio ? "Serv" : "Prod"}</span>
        </div>
        <span class="text-[11px] text-on-surface-variant">${formatCOP(numericPrice)} c/u &bull; SKU: ${sku || "N/A"}</span>
      </div>
      <div class="flex items-center gap-2 shrink-0">
        <div class="flex items-center bg-surface-container-lowest rounded-lg p-0.5 shadow-2xs border border-surface-container">
          <button type="button" class="btn-qty-minus w-6 h-6 flex items-center justify-center text-on-surface-variant hover:text-on-surface rounded font-bold hover:bg-surface-container transition-colors cursor-pointer">-</button>
          <span class="item-qty w-7 text-center text-[13px] font-bold text-on-surface">1</span>
          <button type="button" class="btn-qty-plus w-6 h-6 flex items-center justify-center text-on-surface-variant hover:text-on-surface rounded font-bold hover:bg-surface-container transition-colors cursor-pointer">+</button>
        </div>
        <span class="item-total text-[13px] font-bold text-on-surface w-20 text-right">${formatCOP(numericPrice)}</span>
        <button type="button" class="btn-remove-item p-1 text-on-surface-variant hover:text-error rounded-lg hover:bg-error-container/40 transition-colors cursor-pointer" title="Remover producto">
          <span class="material-symbols-outlined text-[16px]">close</span>
        </button>
      </div>
    `;

    list.appendChild(newRow);

    // Eventos de control dentro de la nueva fila
    const btnMinus = newRow.querySelector(".btn-qty-minus");
    const btnPlus = newRow.querySelector(".btn-qty-plus");
    const btnRemove = newRow.querySelector(".btn-remove-item");

    if (btnMinus) btnMinus.addEventListener("click", () => updateRowQuantity(newRow, -1));
    if (btnPlus) btnPlus.addEventListener("click", () => updateRowQuantity(newRow, 1));
    if (btnRemove) btnRemove.addEventListener("click", () => removeRowWithAnimation(newRow));

    gsap.fromTo(
      newRow,
      { opacity: 0, x: 20 },
      { opacity: 1, x: 0, duration: 0.25, ease: "power2.out" }
    );
  }

  recalcTicketTotals();
  showPosToast(`Agregado: ${name}`);
}

/**
 * Modifica la cantidad de un ítem en el carrito
 */
export function updateRowQuantity(row, delta) {
  const qtyEl = row.querySelector(".item-qty");
  const totalEl = row.querySelector(".item-total");
  const price = parseFloat(row.getAttribute("data-price") || "0");
  const maxStock = parseInt(row.getAttribute("data-stock") || "999", 10);
  const tipo = (row.getAttribute("data-tipo") || "").toUpperCase();
  if (!qtyEl || !totalEl) return;

  let currentQty = parseInt(qtyEl.textContent || "1", 10) + delta;

  if (delta > 0 && tipo !== "SERVICIO" && currentQty > maxStock) {
    showPosToast(`Stock máximo alcanzado (${maxStock} unid.)`, "warning");
    return;
  }

  if (currentQty <= 0) {
    removeRowWithAnimation(row);
  } else {
    qtyEl.textContent = `${currentQty}`;
    totalEl.textContent = formatCOP(price * currentQty);
    recalcTicketTotals();
  }
}

/**
 * Remueve una fila del carrito con animación fluida
 */
export function removeRowWithAnimation(row) {
  gsap.to(row, {
    opacity: 0,
    x: -24,
    duration: 0.2,
    ease: "power2.in",
    onComplete: () => {
      row.remove();
      recalcTicketTotals();
    },
  });
}

/**
 * Vacía el carrito de compras por completo
 */
export function clearActiveCart() {
  const list = document.getElementById("cartItemsList");
  if (!list) return;

  const rows = list.querySelectorAll(".cart-row");
  if (rows.length === 0) {
    showPosToast("El ticket ya está vacío.", "info");
    return;
  }

  gsap.to(rows, {
    opacity: 0,
    x: -20,
    stagger: 0.04,
    duration: 0.2,
    ease: "power2.in",
    onComplete: () => {
      list.innerHTML = "";
      recalcTicketTotals();
      showPosToast("Ticket reiniciado.", "info");
    },
  });
}

/**
 * Selección interactiva de método de pago
 * @param {'cash' | 'card' | 'transfer'} method 
 * @param {HTMLElement} btn 
 */
export function selectPaymentMethod(method, btn) {
  activePayment = method;
  document.querySelectorAll(".pay-btn").forEach((b) => {
    b.classList.remove("bg-primary", "text-on-primary", "shadow-xs");
    b.classList.add("bg-surface-container-low", "hover:bg-surface-container", "text-on-surface");
  });
  btn.classList.add("bg-primary", "text-on-primary", "shadow-xs");
  btn.classList.remove("bg-surface-container-low", "hover:bg-surface-container", "text-on-surface");

  gsap.fromTo(btn, { scale: 0.95 }, { scale: 1, duration: 0.2, ease: "back.out(2)" });
}

/**
 * Modal de Creación Rápida de Clientes
 */
export function openCustomerModal() {
  const modal = document.getElementById("customerModal");
  const modalPanel = document.getElementById("customerModalPanel");
  if (!modal || !modalPanel) return;

  modal.classList.remove("hidden");
  document.body.style.overflow = "hidden";

  gsap.fromTo(
    modal,
    { opacity: 0 },
    { opacity: 1, duration: 0.2, ease: "power2.out" }
  );

  gsap.fromTo(
    modalPanel,
    { scale: 0.92, y: 16, opacity: 0 },
    { scale: 1, y: 0, opacity: 1, duration: 0.25, ease: "power2.out" }
  );
}

export function closeCustomerModal() {
  const modal = document.getElementById("customerModal");
  const modalPanel = document.getElementById("customerModalPanel");
  if (!modal || !modalPanel) return;

  document.body.style.overflow = "";

  gsap.to(modalPanel, {
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
 * Notificación Toast de POS con GSAP
 * @param {string} message 
 * @param {'success' | 'info' | 'warning'} type 
 */
let toastTimeline = null;
export function showPosToast(message, type = "success") {
  const toast = document.getElementById("posToast");
  const toastMsg = document.getElementById("toastMessage");
  const toastIcon = document.getElementById("toastIcon");
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
 * Inicialización de eventos del módulo de ventas
 */
export function initVentas() {
  if (typeof window === "undefined") return;

  // 1. Vincular eventos a las filas existentes en el carrito
  document.querySelectorAll(".cart-row").forEach((row) => {
    const btnMinus = row.querySelector(".btn-qty-minus");
    const btnPlus = row.querySelector(".btn-qty-plus");
    const btnRemove = row.querySelector(".btn-remove-item");

    if (btnMinus) btnMinus.addEventListener("click", () => updateRowQuantity(row, -1));
    if (btnPlus) btnPlus.addEventListener("click", () => updateRowQuantity(row, 1));
    if (btnRemove) btnRemove.addEventListener("click", () => removeRowWithAnimation(row));
  });

  // 2. Micro-interacción de elevación para las tarjetas de productos
  document.querySelectorAll(".product-item").forEach((card) => {
    card.addEventListener("mouseenter", () => {
      gsap.to(card, { y: -2, duration: 0.18, ease: "power1.out" });
    });
    card.addEventListener("mouseleave", () => {
      gsap.to(card, { y: 0, duration: 0.22, ease: "power1.out", clearProps: "transform" });
    });
  });

  // 3. Atajos de teclado: F2 para búsqueda, F9 para cobrar, Esc para cerrar modal
  document.addEventListener("keydown", (e) => {
    if (e.key === "F2") {
      e.preventDefault();
      const input = document.getElementById("productSearch");
      if (input) input.focus();
    } else if (e.key === "F9") {
      e.preventDefault();
      const btn = document.getElementById("btnCheckoutAction");
      if (btn) btn.click();
    } else if (e.key === "Escape") {
      const modal = document.getElementById("customerModal");
      if (modal && !modal.classList.contains("hidden")) {
        closeCustomerModal();
      }
    }
  });

  recalcTicketTotals();
}
