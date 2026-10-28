import gsap from "gsap";

/**
 * Inicialización de micro-animaciones fluidas para el Dashboard
 * Sin reinicio de opacidad a 0 ni parpadeos blancos (FOUC).
 */
export function initDashboardAnimations() {
  if (typeof window === "undefined") return;

  const ctx = gsap.context(() => {
    // 1. Limpieza de propiedades para garantizar render inmediato y estable
    const allCards = document.querySelectorAll(
      "#dash-subheader, .kpi-card, #dash-chart-card, #dash-stock-card, #dash-quick-actions, #dash-transactions-card"
    );
    gsap.set(allCards, { opacity: 1, clearProps: "transform" });

    // 2. Animación fluida de trazado para la línea SVG del gráfico financiero
    const salesLine = document.getElementById("chart-sales-line");
    if (salesLine) {
      try {
        const pathLength = salesLine.getTotalLength ? salesLine.getTotalLength() : 750;
        gsap.fromTo(
          salesLine,
          { strokeDasharray: pathLength, strokeDashoffset: pathLength },
          {
            strokeDashoffset: 0,
            duration: 1.1,
            ease: "power2.out",
            delay: 0.05,
          }
        );
      } catch (e) {
        // Fallback silencioso si no soporta getTotalLength
      }
    }

    // 3. Micro-interacción interactiva de elevación sutil para las tarjetas KPI
    const kpiCards = document.querySelectorAll(".kpi-card");
    kpiCards.forEach((card) => {
      card.addEventListener("mouseenter", () => {
        gsap.to(card, { y: -3, duration: 0.22, ease: "power1.out" });
      });
      card.addEventListener("mouseleave", () => {
        gsap.to(card, { y: 0, duration: 0.25, ease: "power1.out", clearProps: "transform" });
      });
    });
  });

  return () => ctx.revert();
}

/**
 * Animación suave de transición para el gráfico financiero interactivo
 * @param {'ventas' | 'gastos' | 'utilidad'} tab
 */
export function animateChartTransition(tab) {
  const chartSvg = document.getElementById("financial-svg-chart");
  const salesArea = document.getElementById("chart-sales-area");
  const salesLine = document.getElementById("chart-sales-line");
  const expenseArea = document.getElementById("chart-expense-area");
  const expenseLine = document.getElementById("chart-expense-line");
  const maxLabel = document.getElementById("chart-max-label");

  if (!chartSvg) return;

  // Curvas representativas según pestaña
  const curves = {
    ventas: {
      max: "$50k",
      salesArea: "M 0,130 Q 80,70 160,80 T 320,40 T 460,55 T 600,20 L 600,160 L 0,160 Z",
      salesLine: "M 0,130 Q 80,70 160,80 T 320,40 T 460,55 T 600,20",
      showExpense: true,
    },
    gastos: {
      max: "$25k",
      salesArea: "M 0,140 Q 80,105 160,115 T 320,85 T 460,95 T 600,70 L 600,160 L 0,160 Z",
      salesLine: "M 0,140 Q 80,105 160,115 T 320,85 T 460,95 T 600,70",
      showExpense: false,
    },
    utilidad: {
      max: "$40k",
      salesArea: "M 0,120 Q 80,50 160,65 T 320,30 T 460,40 T 600,15 L 600,160 L 0,160 Z",
      salesLine: "M 0,120 Q 80,50 160,65 T 320,30 T 460,40 T 600,15",
      showExpense: true,
    },
  };

  const selected = curves[tab] || curves.ventas;

  // Animación del contenedor de la gráfica
  gsap.fromTo(
    chartSvg,
    { opacity: 0.5, scaleY: 0.96 },
    {
      opacity: 1,
      scaleY: 1,
      duration: 0.35,
      ease: "power2.out",
      clearProps: "transform",
    }
  );

  if (salesArea) salesArea.setAttribute("d", selected.salesArea);
  if (salesLine) salesLine.setAttribute("d", selected.salesLine);
  if (maxLabel) maxLabel.textContent = selected.max;

  if (expenseArea && expenseLine) {
    gsap.to([expenseArea, expenseLine], {
      opacity: selected.showExpense ? 1 : 0.2,
      duration: 0.3,
    });
  }
}

/**
 * Muestra el toast de reorden con animación fluida de GSAP
 * @param {string} sku
 * @param {string} productName
 */
let toastTimeline = null;
export function showRestockToast(sku, productName) {
  const toast = document.getElementById("restock-toast");
  const title = document.getElementById("toast-title");
  const msg = document.getElementById("toast-msg");

  if (!toast) return;

  if (title) title.textContent = `Reorden: ${sku}`;
  if (msg) msg.textContent = `Solicitud de pedido enviada para "${productName}".`;

  if (toastTimeline) toastTimeline.kill();

  toast.classList.remove("pointer-events-none");

  toastTimeline = gsap.timeline();
  toastTimeline
    .fromTo(
      toast,
      { y: 60, opacity: 0, scale: 0.9 },
      { y: 0, opacity: 1, scale: 1, duration: 0.35, ease: "back.out(1.5)" }
    )
    .to(toast, {
      y: 60,
      opacity: 0,
      scale: 0.9,
      duration: 0.28,
      ease: "power2.in",
      delay: 3.2,
      onComplete: () => {
        toast.classList.add("pointer-events-none");
      },
    });
}
