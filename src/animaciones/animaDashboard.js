import gsap from "gsap";

/**
 * Animación de entrada inicial para los elementos del Panel de Control Ejecutivo
 */
export function initDashboardAnimations() {
  if (typeof window === "undefined") return;

  const ctx = gsap.context(() => {
    // 1. Cabecera y Barra de Comandos
    const subHeader = document.querySelector("#dash-subheader");
    if (subHeader) {
      gsap.fromTo(
        subHeader,
        { opacity: 0, y: -16 },
        { opacity: 1, y: 0, duration: 0.45, ease: "power2.out" }
      );
    }

    // 2. Tarjetas KPI con entrada en cascada
    const kpiCards = document.querySelectorAll(".kpi-card");
    if (kpiCards.length > 0) {
      gsap.fromTo(
        kpiCards,
        { opacity: 0, y: 24, scale: 0.97 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.45,
          stagger: 0.07,
          ease: "power2.out",
          delay: 0.08,
          clearProps: "transform",
        }
      );
    }

    // 3. Fila de Gráfica y Stock Crítico
    const chartCard = document.querySelector("#dash-chart-card");
    const stockCard = document.querySelector("#dash-stock-card");
    if (chartCard || stockCard) {
      gsap.fromTo(
        [chartCard, stockCard].filter(Boolean),
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.1,
          ease: "power2.out",
          delay: 0.18,
          clearProps: "transform",
        }
      );
    }

    // 4. Banner de Operaciones Rápidas
    const quickActions = document.querySelector("#dash-quick-actions");
    if (quickActions) {
      gsap.fromTo(
        quickActions,
        { opacity: 0, y: 16 },
        {
          opacity: 1,
          y: 0,
          duration: 0.45,
          ease: "power2.out",
          delay: 0.28,
          clearProps: "transform",
        }
      );
    }

    // 5. Tabla de Transacciones Recientes
    const tableCard = document.querySelector("#dash-transactions-card");
    if (tableCard) {
      gsap.fromTo(
        tableCard,
        { opacity: 0, y: 16 },
        {
          opacity: 1,
          y: 0,
          duration: 0.45,
          ease: "power2.out",
          delay: 0.35,
          clearProps: "transform",
        }
      );
    }
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
