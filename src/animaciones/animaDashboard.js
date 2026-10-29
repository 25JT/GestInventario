import gsap from "gsap";

/**
 * Animación fluida de entrada en cascada con GSAP para el Dashboard Ejecutivo
 * Sin parpadeo blanco (FOUC) gracias a la sincronización con el estado inicial.
 */
export function initDashboardAnimations() {
  if (typeof window === "undefined") return;

  // Liberar el estado de preparación para que GSAP tome control absoluto
  document.documentElement.classList.remove("dash-preparing");

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
        { opacity: 0, y: 22, scale: 0.98 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.45,
          stagger: 0.06,
          ease: "power2.out",
          delay: 0.06,
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
          duration: 0.48,
          stagger: 0.08,
          ease: "power2.out",
          delay: 0.16,
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
          delay: 0.24,
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
          delay: 0.3,
          clearProps: "transform",
        }
      );
    }

    // 6. Animación fluida de trazado para la línea SVG del gráfico financiero
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
            delay: 0.2,
          }
        );
      } catch (e) {
        // Fallback silencioso si no soporta getTotalLength
      }
    }

    // 7. Micro-interacción interactiva de elevación sutil para las tarjetas KPI
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
 * @param {object} [dynamicData] Datos reales provenientes de la API
 * @param {string} [currentPeriod] 'hoy' | 'semana' | 'mes'
 */
export function animateChartTransition(tab, dynamicData = null, currentPeriod = "mes") {
  const chartSvg = document.getElementById("financial-svg-chart");
  const salesArea = document.getElementById("chart-sales-area");
  const salesLine = document.getElementById("chart-sales-line");
  const expenseArea = document.getElementById("chart-expense-area");
  const expenseLine = document.getElementById("chart-expense-line");
  const maxLabel = document.getElementById("chart-max-label");
  const peakDot1 = document.getElementById("peak-dot-1");
  const peakDot2 = document.getElementById("peak-dot-2");

  if (!chartSvg) return;

  const periodoTxt = currentPeriod === "hoy" ? "Hoy" : currentPeriod === "semana" ? "Semana" : "Mes";

  // Curvas dinámicas si existen, o curvas de respaldo
  let salesAreaD = "M 0,130 Q 80,70 160,80 T 320,40 T 460,55 T 600,20 L 600,160 L 0,160 Z";
  let salesLineD = "M 0,130 Q 80,70 160,80 T 320,40 T 460,55 T 600,20";
  let expenseAreaD = "M 0,110 Q 75,95 150,115 T 300,105 T 450,120 T 600,95 L 600,160 L 0,160 Z";
  let expenseLineD = "M 0,110 Q 75,95 150,115 T 300,105 T 450,120 T 600,95";
  let maxText = `Pico Ventas (${periodoTxt}): $ 50.000`;
  let showExpense = true;

  if (dynamicData && dynamicData.svg) {
    if (tab === "ventas") {
      salesAreaD = dynamicData.svg.sales?.area || salesAreaD;
      salesLineD = dynamicData.svg.sales?.line || salesLineD;
      expenseAreaD = dynamicData.svg.expense?.area || expenseAreaD;
      expenseLineD = dynamicData.svg.expense?.line || expenseLineD;

      const pVentas = dynamicData.picos?.ventas_formato || dynamicData.totales?.ventas_formato || "$ 0";
      maxText = `Pico Ventas (${periodoTxt}): ${pVentas}`;
      showExpense = true;

      // Colocar dot 1 exactamente sobre el pico de ventas
      if (peakDot1) {
        const p = dynamicData.svg.sales?.peak;
        if (p && p.hasPeak) {
          peakDot1.setAttribute("cx", String(p.x));
          peakDot1.setAttribute("cy", String(p.y));
          peakDot1.setAttribute("fill", "#316bf3");
          peakDot1.style.display = "";
        } else {
          peakDot1.style.display = "none";
        }
      }

      // Colocar dot 2 sobre el pico de gastos
      if (peakDot2) {
        const pG = dynamicData.svg.expense?.peak;
        if (pG && pG.hasPeak) {
          peakDot2.setAttribute("cx", String(pG.x));
          peakDot2.setAttribute("cy", String(pG.y));
          peakDot2.setAttribute("fill", "#75777d");
          peakDot2.style.display = "";
        } else {
          peakDot2.style.display = "none";
        }
      }
    } else if (tab === "gastos") {
      salesAreaD = dynamicData.svg.expense?.area || salesAreaD;
      salesLineD = dynamicData.svg.expense?.line || salesLineD;

      const pGastos = dynamicData.picos?.gastos_formato || dynamicData.totales?.gastos_formato || "$ 0";
      maxText = `Pico Gastos (${periodoTxt}): ${pGastos}`;
      showExpense = false;

      // Dot 1 sobre el pico de gastos
      if (peakDot1) {
        const p = dynamicData.svg.expense?.peak;
        if (p && p.hasPeak) {
          peakDot1.setAttribute("cx", String(p.x));
          peakDot1.setAttribute("cy", String(p.y));
          peakDot1.setAttribute("fill", "#75777d");
          peakDot1.style.display = "";
        } else {
          peakDot1.style.display = "none";
        }
      }
      if (peakDot2) peakDot2.style.display = "none";
    } else if (tab === "utilidad") {
      salesAreaD = dynamicData.svg.utilidad?.area || salesAreaD;
      salesLineD = dynamicData.svg.utilidad?.line || salesLineD;
      expenseAreaD = dynamicData.svg.expense?.area || expenseAreaD;
      expenseLineD = dynamicData.svg.expense?.line || expenseLineD;

      const pUtilidad = dynamicData.totales?.utilidad_formato || "$ 0";
      maxText = `Balance Neto (${periodoTxt}): ${pUtilidad}`;
      showExpense = true;

      // Dot 1 sobre el pico de balance
      if (peakDot1) {
        const p = dynamicData.svg.utilidad?.peak;
        if (p && p.hasPeak) {
          peakDot1.setAttribute("cx", String(p.x));
          peakDot1.setAttribute("cy", String(p.y));
          peakDot1.setAttribute("fill", "#00a472");
          peakDot1.style.display = "";
        } else {
          peakDot1.style.display = "none";
        }
      }
      if (peakDot2) peakDot2.style.display = "none";
    }
  } else {
    // Curvas estáticas de fallback
    const curves = {
      ventas: {
        max: `Pico Ventas (${periodoTxt}): $ 50.000`,
        salesArea: "M 0,130 Q 80,70 160,80 T 320,40 T 460,55 T 600,20 L 600,160 L 0,160 Z",
        salesLine: "M 0,130 Q 80,70 160,80 T 320,40 T 460,55 T 600,20",
        showExpense: true,
      },
      gastos: {
        max: `Pico Gastos (${periodoTxt}): $ 25.000`,
        salesArea: "M 0,140 Q 80,105 160,115 T 320,85 T 460,95 T 600,70 L 600,160 L 0,160 Z",
        salesLine: "M 0,140 Q 80,105 160,115 T 320,85 T 460,95 T 600,70",
        showExpense: false,
      },
      utilidad: {
        max: `Balance Neto (${periodoTxt}): $ 40.000`,
        salesArea: "M 0,120 Q 80,50 160,65 T 320,30 T 460,40 T 600,15 L 600,160 L 0,160 Z",
        salesLine: "M 0,120 Q 80,50 160,65 T 320,30 T 460,40 T 600,15",
        showExpense: true,
      },
    };
    const selected = curves[tab] || curves.ventas;
    salesAreaD = selected.salesArea;
    salesLineD = selected.salesLine;
    maxText = selected.max;
    showExpense = selected.showExpense;
  }

  // Animación del contenedor de la gráfica
  gsap.fromTo(
    chartSvg,
    { opacity: 0.6, scaleY: 0.98 },
    {
      opacity: 1,
      scaleY: 1,
      duration: 0.35,
      ease: "power2.out",
      clearProps: "transform",
    }
  );

  if (salesArea) salesArea.setAttribute("d", salesAreaD);
  if (salesLine) salesLine.setAttribute("d", salesLineD);
  if (expenseArea && dynamicData?.svg?.expense?.area) expenseArea.setAttribute("d", expenseAreaD);
  if (expenseLine && dynamicData?.svg?.expense?.line) expenseLine.setAttribute("d", expenseLineD);
  if (maxLabel) maxLabel.textContent = maxText;

  if (expenseArea && expenseLine) {
    gsap.to([expenseArea, expenseLine], {
      opacity: showExpense ? 1 : 0.15,
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
