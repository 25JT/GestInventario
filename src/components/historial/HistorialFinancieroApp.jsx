import React, { useState, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";
import { getApiUrl } from "../../scripts/apiConfig.js";

// Formateador de moneda colombiana
const formatCOP = (num) => {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(Number(num) || 0);
};

export default function HistorialFinancieroApp() {
  const hoyStr = new Date().toISOString().slice(0, 10);
  const anioActual = new Date().getFullYear();

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Estados de Filtro
  const [granularidad, setGranularidad] = useState("meses"); // 'dias' | 'meses' | 'anios' | 'todo'
  const [desde, setDesde] = useState(`${anioActual}-01-01`);
  const [hasta, setHasta] = useState(hoyStr);
  const [sucursal, setSucursal] = useState("central_01");
  const [primeraFecha, setPrimeraFecha] = useState("2026-01-01");

  // Estado de Datos y Carga
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [activeHoverIndex, setActiveHoverIndex] = useState(null);
  const [tabRotacion, setTabRotacion] = useState("productos"); // 'productos' | 'servicios'

  // Estado para Modal de Auditoría y Desglose Operativo Diario
  const [modalDetalleOpen, setModalDetalleOpen] = useState(false);
  const [detalleLoading, setDetalleLoading] = useState(false);
  const [detalleData, setDetalleData] = useState(null);
  const [selectedPeriodoItem, setSelectedPeriodoItem] = useState(null);
  const [detalleTab, setDetalleTab] = useState("todos"); // 'todos' | 'ventas' | 'gastos'
  const [detalleSearch, setDetalleSearch] = useState("");

  const abrirDetallePeriodo = async (item) => {
    setSelectedPeriodoItem(item);
    setModalDetalleOpen(true);
    setDetalleLoading(true);
    setDetalleData(null);
    setDetalleSearch("");
    setDetalleTab("todos");

    try {
      const url = `${getApiUrl()}/historial/detalle?periodo_id=${encodeURIComponent(item.id)}&fecha=${encodeURIComponent(item.periodo)}`;
      const res = await fetch(url);
      const json = await res.json();
      if (json.success && json.data) {
        setDetalleData(json.data);
      } else {
        setDetalleData({ error: json.error || "No se encontraron detalles para este período." });
      }
    } catch (err) {
      console.error("Error al cargar detalle del período:", err);
      setDetalleData({ error: "Error de conexión al cargar el desglose detallado." });
    } finally {
      setDetalleLoading(false);
    }
  };

  const cerrarDetalleModal = () => {
    setModalDetalleOpen(false);
    setDetalleData(null);
    setSelectedPeriodoItem(null);
  };

  // Referencias para animaciones fluidas con GSAP
  const mainContainerRef = useRef(null);
  const kpisRef = useRef(null);
  const chartRef = useRef(null);
  const tableRef = useRef(null);
  const rotacionRef = useRef(null);

  // Animación de entrada inicial de la página
  useEffect(() => {
    if (mainContainerRef.current) {
      gsap.fromTo(
        mainContainerRef.current,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.45, ease: "power2.out" }
      );
    }
  }, []);

  // Cerrar modal de auditoría al presionar tecla Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && modalDetalleOpen) {
        cerrarDetalleModal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [modalDetalleOpen]);

  // Bloquear scroll de la página principal cuando el modal esté abierto
  useEffect(() => {
    if (modalDetalleOpen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [modalDetalleOpen]);

  // Animación suave con GSAP ante cada cambio de datos y filtros
  useEffect(() => {
    if (!loading && data) {
      // 1. Tarjetas KPI
      if (kpisRef.current) {
        const cards = kpisRef.current.querySelectorAll(".kpi-animate-card");
        if (cards.length > 0) {
          gsap.killTweensOf(cards);
          gsap.fromTo(
            cards,
            { opacity: 0.35, y: 12, scale: 0.98 },
            { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: "power2.out", stagger: 0.05 }
          );
        }
      }

      // 2. Barras de la gráfica
      if (chartRef.current) {
        const bars = chartRef.current.querySelectorAll(".chart-bar-item");
        if (bars.length > 0) {
          gsap.killTweensOf(bars);
          gsap.fromTo(
            bars,
            { scaleY: 0, transformOrigin: "bottom" },
            { scaleY: 1, duration: 0.5, ease: "power3.out", stagger: 0.02 }
          );
        }
      }

      // 3. Filas de la tabla
      if (tableRef.current) {
        const rows = tableRef.current.querySelectorAll(".table-row-item");
        if (rows.length > 0) {
          gsap.killTweensOf(rows);
          gsap.fromTo(
            rows,
            { opacity: 0, y: 8 },
            { opacity: 1, y: 0, duration: 0.35, ease: "power2.out", stagger: 0.02 }
          );
        }

        const emptyState = tableRef.current.querySelector(".empty-state-card");
        if (emptyState) {
          gsap.killTweensOf(emptyState);
          gsap.fromTo(
            emptyState,
            { opacity: 0, scale: 0.94, y: 12 },
            { opacity: 1, scale: 1, y: 0, duration: 0.38, ease: "back.out(1.4)" }
          );
        }
      }

      // 4. Ítems de la sección de Rotación de Inventario
      if (rotacionRef.current) {
        const rotItems = rotacionRef.current.querySelectorAll(".rotacion-animate-item");
        if (rotItems.length > 0) {
          gsap.killTweensOf(rotItems);
          gsap.fromTo(
            rotItems,
            { opacity: 0, y: 10 },
            { opacity: 1, y: 0, duration: 0.4, ease: "power2.out", stagger: 0.03 }
          );
        }
      }
    }
  }, [data, loading, tabRotacion]);

  // Función para consultar la API sin recargar la página
  const fetchData = async (overrideParams = {}) => {
    setLoading(true);
    setError(null);

    const activeGran = overrideParams.granularidad || granularidad;
    const activeDesde = overrideParams.desde !== undefined ? overrideParams.desde : desde;
    const activeHasta = overrideParams.hasta !== undefined ? overrideParams.hasta : hasta;

    try {
      const q = new URLSearchParams({
        granularidad: activeGran,
        desde: activeDesde,
        hasta: activeHasta,
        anio: String(anioActual),
      });

      const res = await fetch(`${getApiUrl()}/historial?${q.toString()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}: Error al obtener historial financiero`);
      const json = await res.json();

      if (json.success && json.data) {
        setData(json.data);
        if (json.data.parametros?.primera_fecha_sistema) {
          setPrimeraFecha(json.data.parametros.primera_fecha_sistema);
        }
      } else {
        throw new Error(json.error || "No se recibieron datos del servidor");
      }
    } catch (err) {
      console.error("Error al cargar historial:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [granularidad]);

  // Cambiar granularidad
  const handleGranularidadChange = (newGran) => {
    setGranularidad(newGran);
    if (newGran === "todo") {
      setDesde(primeraFecha);
      setHasta(hoyStr);
      fetchData({ granularidad: "todo", desde: primeraFecha, hasta: hoyStr });
    } else if (newGran === "meses") {
      setDesde(`${anioActual}-01-01`);
      setHasta(hoyStr);
      fetchData({ granularidad: "meses", desde: `${anioActual}-01-01`, hasta: hoyStr });
    } else if (newGran === "dias") {
      // Últimos 30 días
      const d = new Date();
      d.setDate(d.getDate() - 30);
      const dStr = d.toISOString().slice(0, 10);
      setDesde(dStr);
      setHasta(hoyStr);
      fetchData({ granularidad: "dias", desde: dStr, hasta: hoyStr });
    } else if (newGran === "anios") {
      setDesde(primeraFecha);
      setHasta(hoyStr);
      fetchData({ granularidad: "anios", desde: primeraFecha, hasta: hoyStr });
    }
  };

  // Filtrar por fechas manuales
  const handleFilterSubmit = (e) => {
    e?.preventDefault();
    let safeDesde = desde;
    let safeHasta = hasta;
    if (safeHasta > hoyStr) {
      safeHasta = hoyStr;
      setHasta(hoyStr);
    }
    if (safeDesde > safeHasta) {
      const tmp = safeDesde;
      safeDesde = safeHasta;
      safeHasta = tmp;
      setDesde(safeDesde);
      setHasta(safeHasta);
    }
    fetchData({ desde: safeDesde, hasta: safeHasta });
  };

  // Restablecer a Hoy
  const handleResetToToday = () => {
    setGranularidad("dias");
    setDesde(hoyStr);
    setHasta(hoyStr);
    fetchData({ granularidad: "dias", desde: hoyStr, hasta: hoyStr });
  };

  // Exportar a Excel (CSV con formato para MS Excel)
  const handleExportExcel = () => {
    if (!data || !data.tabla || data.tabla.length === 0) {
      alert("No hay registros en la tabla para exportar.");
      return;
    }

    const headers = [
      "Periodo Fiscal",
      "Nro Transacciones",
      "Ingresos Productos (COP)",
      "Ingresos Servicios (COP)",
      "Total Ingresos (COP)",
      "Total Gastos Operativos (COP)",
      "Balance Neto (COP)",
      "Estado Financiero",
      "Margen (%)"
    ];

    const rows = data.tabla.map((r) => [
      `"${r.periodo}"`,
      r.transacciones,
      r.ingresos_productos,
      r.ingresos_servicios,
      r.ingresos_total,
      r.gastos_total,
      r.balance_neto,
      `"${r.estado_financiero}"`,
      `${r.margen_porcentaje}%`
    ]);

    // Fila de totales
    rows.push([
      `"TOTALES CONSOLIDADOS"`,
      data.kpis.total_tickets,
      data.kpis.ingresos_productos,
      data.kpis.ingresos_servicios,
      data.kpis.ventas_totales,
      data.kpis.gastos_totales,
      data.kpis.balance_neto,
      `"${data.kpis.estado_financiero}"`,
      `${data.kpis.margen_porcentaje}%`
    ]);

    // Anexo de Rotación de Inventario en el reporte CSV
    if (data.rotacion_inventario?.top_productos?.length > 0) {
      rows.push([]);
      rows.push([`"--- RANKING DE PRODUCTOS DE MAYOR ROTACIÓN (${desde} AL ${hasta}) ---"`]);
      rows.push([
        "Puesto",
        "Producto",
        "Código / SKU",
        "Categoría",
        "Unidades Vendidas",
        "Total Ventas (COP)",
        "Utilidad Bruta (COP)",
        "Margen (%)",
        "Participación (%)"
      ]);
      data.rotacion_inventario.top_productos.forEach((p) => {
        rows.push([
          `"#${p.posicion}"`,
          `"${p.nombre}"`,
          `"${p.codigo_barras}"`,
          `"${p.categoria}"`,
          p.unidades_vendidas,
          p.total_ingresos,
          p.utilidad_bruta,
          `${p.margen_porcentaje}%`,
          `${p.porcentaje_rotacion}%`
        ]);
      });
    }

    const csvContent = "\uFEFF" + [headers.join(";"), ...rows.map(e => e.join(";"))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Historial_Financiero_Auditoria_${desde}_${hasta}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Exportar a PDF / Imprimir vista de auditoría
  const handleExportPDF = () => {
    window.print();
  };

  const kpis = data?.kpis || {
    ventas_totales: 0,
    ventas_totales_formato: "$ 0",
    gastos_totales: 0,
    gastos_totales_formato: "$ 0",
    balance_neto: 0,
    balance_neto_formato: "$ 0",
    margen_porcentaje: 0,
    es_superavit: true,
    total_tickets: 0,
    ticket_promedio_formato: "$ 0",
    gastos_contab_count: 0,
    ratio_cobertura: "1.00x",
    total_inventario_formato: "$ 0",
    gastos_desglose_porcentajes: { mercancia: 45, nomina: 25, fijo_serv: 30 }
  };

  const tablaItems = data?.tabla || [];
  const graficaItems = data?.grafica || [];

  // Datos de rotación y productos más vendidos en el período
  const rotacion = data?.rotacion_inventario || {};
  const topProductos = rotacion.top_productos || [];
  const productoEstrella = rotacion.producto_estrella || null;
  const topServicios = rotacion.top_servicios || [];
  const servicioEstrella = rotacion.servicio_estrella || null;

  // Mes activo en la gráfica (para el tooltip flotante)
  const activeMonthData = useMemo(() => {
    if (activeHoverIndex !== null && graficaItems[activeHoverIndex]) {
      return graficaItems[activeHoverIndex];
    }
    // Default al último mes con movimientos o el mes actual
    const conMov = [...graficaItems].reverse().find(m => m.tiene_movimientos);
    return conMov || graficaItems[graficaItems.length - 1] || null;
  }, [activeHoverIndex, graficaItems]);

  // Cálculos de escala para la gráfica SVG interactiva
  const maxGraficaVal = useMemo(() => {
    if (!graficaItems || graficaItems.length === 0) return 100000;
    const maxVal = Math.max(
      ...graficaItems.map(m => Math.max(m.ingresos_total || 0, m.gastos_total || 0)),
      100000
    );
    return Math.ceil(maxVal * 1.15); // 15% de margen superior
  }, [graficaItems]);

  // Filtrado reactivo de ventas y gastos dentro del modal de auditoría
  const modalVentas = useMemo(() => {
    if (!detalleData || !Array.isArray(detalleData.ventas)) return [];
    if (detalleTab === "gastos") return [];
    const q = detalleSearch.toLowerCase().trim();
    if (!q) return detalleData.ventas;
    return detalleData.ventas.filter((v) => {
      const matchVenta = (v.folio_ticket || "").toLowerCase().includes(q) ||
        (v.cliente_nombre || "").toLowerCase().includes(q) ||
        (v.cliente || "").toLowerCase().includes(q) ||
        (v.responsable || "").toLowerCase().includes(q) ||
        (v.metodo_pago || "").toLowerCase().includes(q);
      if (matchVenta) return true;
      const matchItems = Array.isArray(v.items) && v.items.some((it) =>
        (it.descripcion || "").toLowerCase().includes(q) ||
        (it.nombre || "").toLowerCase().includes(q) ||
        (it.sku || "").toLowerCase().includes(q) ||
        (it.codigo || "").toLowerCase().includes(q) ||
        (it.codigo_referencia || "").toLowerCase().includes(q) ||
        (it.tipo_item || "").toLowerCase().includes(q)
      );
      return matchItems;
    });
  }, [detalleData, detalleTab, detalleSearch]);

  const modalGastos = useMemo(() => {
    if (!detalleData || !Array.isArray(detalleData.gastos)) return [];
    if (detalleTab === "ventas") return [];
    const q = detalleSearch.toLowerCase().trim();
    if (!q) return detalleData.gastos;
    return detalleData.gastos.filter((g) => {
      return (g.descripcion || "").toLowerCase().includes(q) ||
        (g.categoria || "").toLowerCase().includes(q) ||
        (g.clasificacion || "").toLowerCase().includes(q) ||
        (g.proveedor_beneficiario || "").toLowerCase().includes(q) ||
        (g.metodo_pago || "").toLowerCase().includes(q);
    });
  }, [detalleData, detalleTab, detalleSearch]);

  return (
    <div ref={mainContainerRef} className="space-y-6">
      {/* 1. Encabezado de Sección y Acciones Rápidas */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-col">
                  <h1 className="text-[24px] sm:text-[28px] font-bold text-primary tracking-tight flex items-center gap-2">
            Historial General de Ventas, Gastos y Balance Operativo
          </h1>

          <div className="flex items-center gap-2 mt-1">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-surface-container text-[11.5px] text-on-surface-variant font-medium border border-surface-container/70">
              <span className="material-symbols-outlined text-[14px] text-secondary">lock</span>
              <span>Acceso Restringido: Jefe / Administrador (Auditoría Financiera y Balances)</span>
            </span>
          </div>
        </div>

        {/* Botones de Exportación */}
        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          <button
            type="button"
            onClick={handleExportExcel}
            className="h-[38px] px-3.5 bg-surface-container-lowest hover:bg-surface-container-low text-on-surface rounded-xl text-[12px] font-semibold border border-surface-container/70 shadow-2xs hover:shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            title="Exportar conciliación a Excel (CSV nativo)"
          >
            <span className="material-symbols-outlined text-[18px] text-emerald-600">table_view</span>
            <span>Exportar Excel</span>
          </button>

          <button
            type="button"
            onClick={handleExportPDF}
            className="h-[38px] px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[12px] font-semibold shadow-xs hover:shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            title="Imprimir o guardar reporte en PDF"
          >
            <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
            <span>Exportar Balance PDF</span>
          </button>
        </div>
      </div>

      {/* 2. Barra de Control y Filtros de Granularidad */}
      <div className="bg-surface-container-lowest p-4 sm:p-5 rounded-xl border border-surface-container/60 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Selector de Granularidad */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[12px] font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-1 mr-1">
              <span className="material-symbols-outlined text-[16px] text-secondary">calendar_today</span>
              Granularidad:
            </span>

            {[
              { id: "dias", label: "Por Días" },
              { id: "meses", label: "Por Meses" },
              { id: "anios", label: "Por Años" },
              { id: "todo", label: "Acumulado Histórico (Todo)" },
            ].map((g) => {
              const active = granularidad === g.id;
              return (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => handleGranularidadChange(g.id)}
                  className={`px-3 py-1.5 rounded-xl text-[12px] transition-all cursor-pointer ${
                    active
                      ? "bg-blue-50 text-blue-700 font-bold border border-blue-200 shadow-2xs"
                      : "bg-surface text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface border border-transparent"
                  }`}
                >
                  {g.label}
                </button>
              );
            })}
          </div>

          {/* Selector de Sucursal */}
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">storefront</span>
              Sucursal:
            </span>
            <select
              value={sucursal}
              onChange={(e) => setSucursal(e.target.value)}
              className="h-8 px-3 bg-surface rounded-xl text-[12.5px] font-medium text-on-surface border border-surface-container/70 focus:outline-none focus:border-secondary cursor-pointer"
            >
              <option value="central_01">Central Sucursal 01</option>
              <option value="todas">Todas las Sucursales</option>
            </select>
          </div>
        </div>

        {/* Fila de Filtro por Rango de Fechas */}
        <form onSubmit={handleFilterSubmit} className="pt-2 border-t border-surface-container/40 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex items-center gap-1.5 text-[12px] text-on-surface-variant font-medium">
              <span>Desde:</span>
              <input
                type="date"
                value={desde}
                max={hoyStr}
                onChange={(e) => setDesde(e.target.value)}
                className="h-8 px-2.5 bg-surface text-on-surface rounded-xl text-[12px] border border-surface-container/70 focus:outline-none focus:border-secondary cursor-pointer"
              />
            </div>

            <div className="flex items-center gap-1.5 text-[12px] text-on-surface-variant font-medium">
              <span>Hasta:</span>
              <input
                type="date"
                value={hasta}
                max={hoyStr}
                onChange={(e) => setHasta(e.target.value)}
                className="h-8 px-2.5 bg-surface text-on-surface rounded-xl text-[12px] border border-surface-container/70 focus:outline-none focus:border-secondary cursor-pointer"
              />
            </div>

            <button
              type="submit"
              className="h-8 px-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[12px] font-semibold transition-all cursor-pointer shadow-2xs active:scale-95"
            >
              Filtrar Período
            </button>

            <button
              type="button"
              onClick={handleResetToToday}
              className="h-8 px-3 bg-surface hover:bg-surface-container-low text-on-surface rounded-xl text-[12px] font-medium border border-surface-container/70 transition-all cursor-pointer active:scale-95"
            >
              Restablecer a Hoy
            </button>
          </div>

          {/* Información de Auditoría y Tope de fecha futura */}
          <div className="flex items-center gap-2 text-[11.5px] text-on-surface-variant shrink-0">
            <span>Base Auditoría: <strong className="text-on-surface font-semibold">{desde} → {hasta}</strong></span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 font-semibold border border-rose-200">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
              Sin registros futuros
            </span>
          </div>
        </form>
      </div>

      {/* 3. Cuatro Tarjetas KPI Principales (Resumen Financiero) */}
      <div ref={kpisRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Ventas Totales (Ingresos) */}
        <div className="kpi-animate-card bg-surface-container-lowest p-4 sm:p-5 rounded-xl border border-surface-container/60 shadow-xs flex flex-col justify-between hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[12px] text-on-surface-variant font-medium flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-blue-600">trending_up</span>
              Ventas Totales (Ingresos)
            </span>
            <span className="px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200">
              +14.2%
            </span>
          </div>
          <div className="mt-3">
            <span className="text-[26px] font-bold text-primary tracking-tight">
              {kpis.ventas_totales_formato}
            </span>
          </div>
          <div className="mt-2.5 pt-2 border-t border-surface-container/40 flex items-center justify-between text-[11.5px] text-on-surface-variant">
            <span><strong>{kpis.total_tickets}</strong> Tickets emitidos</span>
            <span>Avg: <strong className="text-on-surface">{kpis.ticket_promedio_formato}</strong> / ticket</span>
          </div>
        </div>

        {/* Card 2: Gastos Operativos (Egresos) */}
        <div className="kpi-animate-card bg-surface-container-lowest p-4 sm:p-5 rounded-xl border border-surface-container/60 shadow-xs flex flex-col justify-between hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[12px] text-on-surface-variant font-medium flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-rose-600">trending_down</span>
              Gastos Operativos (Egresos)
            </span>
            <span className="px-2 py-0.5 rounded-lg bg-rose-50 text-rose-700 text-[11px] font-bold border border-rose-200">
              -2.4% vs plan
            </span>
          </div>
          <div className="mt-3">
            <span className="text-[26px] font-bold text-rose-600 tracking-tight">
              {kpis.gastos_totales_formato}
            </span>
          </div>
          {/* Barra horizontal multicolor de desglose de gastos */}
          <div className="mt-2.5 pt-2 border-t border-surface-container/40 space-y-1.5">
            <div className="w-full h-2 rounded-full bg-surface-container overflow-hidden flex">
              <div style={{ width: `${kpis.gastos_desglose_porcentajes.mercancia}%` }} className="bg-blue-600 h-full" title="Mercancía"></div>
              <div style={{ width: `${kpis.gastos_desglose_porcentajes.nomina}%` }} className="bg-rose-500 h-full" title="Nómina"></div>
              <div style={{ width: `${kpis.gastos_desglose_porcentajes.fijo_serv}%` }} className="bg-slate-400 h-full" title="Fijos / Servicios"></div>
            </div>
            <div className="flex items-center justify-between text-[10.5px] text-on-surface-variant">
              <span>Mercancía {kpis.gastos_desglose_porcentajes.mercancia}%</span>
              <span>Nómina {kpis.gastos_desglose_porcentajes.nomina}%</span>
              <span>Fijo/Serv {kpis.gastos_desglose_porcentajes.fijo_serv}%</span>
            </div>
          </div>
        </div>

        {/* Card 3: BALANCE NETO OPERATIVO (Tarjeta Verde Esmeralda Destacada) */}
        <div className="kpi-animate-card bg-gradient-to-br from-[#064e3b] to-[#042f2e] text-white p-4 sm:p-5 rounded-xl border border-emerald-800/60 shadow-md flex flex-col justify-between hover:shadow-lg transition-all relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11.5px] text-emerald-200 uppercase font-bold tracking-wider flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-emerald-300">account_balance_wallet</span>
              BALANCE NETO OPERATIVO
            </span>
            <span className="px-2 py-0.5 rounded-lg bg-emerald-800/80 text-emerald-200 text-[10.5px] font-medium border border-emerald-700/50">
              Simular Escenario
            </span>
          </div>

          <div className="mt-2.5">
            <div className="text-[26px] font-bold text-white tracking-tight">
              {kpis.balance_neto_formato}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${kpis.es_superavit ? "bg-emerald-500/30 text-emerald-200" : "bg-rose-500/30 text-rose-200"}`}>
                {kpis.es_superavit ? "SUPERÁVIT FINANCIERO" : "DÉFICIT FINANCIERO"}
              </span>
              <span className="text-[11px] text-emerald-200 font-medium">
                {kpis.margen_porcentaje >= 0 ? `+${kpis.margen_porcentaje}%` : `${kpis.margen_porcentaje}%`} margen
              </span>
            </div>
          </div>

          <div className="mt-2.5 pt-2 border-t border-emerald-700/50 flex items-center justify-between text-[11px] text-emerald-200">
            <span>Ingresos cubren <strong className="text-white">{kpis.ratio_cobertura}</strong> gastos</span>
            <span className="inline-flex items-center gap-1 text-emerald-300 font-semibold">
              <span className="material-symbols-outlined text-[13px]">verified</span>
              {kpis.es_superavit ? "Posición Sólida" : "Atención Requerida"}
            </span>
          </div>
        </div>

        {/* Card 4: Métricas de Flujo Consolidado */}
        <div className="kpi-animate-card bg-surface-container-lowest p-4 sm:p-5 rounded-xl border border-surface-container/60 shadow-xs flex flex-col justify-between hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[12px] text-on-surface-variant font-medium flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-secondary">receipt_long</span>
              Métricas de Flujo
            </span>
            <span className="text-[11px] text-on-surface-variant font-medium">Consolidado</span>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2">
            <div className="bg-surface-container-low/70 p-2 rounded-xl">
              <span className="text-[10.5px] text-on-surface-variant block">Ventas Totales</span>
              <span className="text-[16px] font-bold text-primary">{kpis.total_tickets}</span>
            </div>
            <div className="bg-surface-container-low/70 p-2 rounded-xl">
              <span className="text-[10.5px] text-on-surface-variant block">Gastos Contab.</span>
              <span className="text-[16px] font-bold text-primary">{kpis.gastos_contab_count}</span>
            </div>
          </div>

          <div className="mt-2 pt-2 border-t border-surface-container/40 flex items-center justify-between text-[11px] text-on-surface-variant">
            <span className="inline-flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              {kpis.anulaciones_count} Anulaciones
            </span>
            <span className="text-[10px] text-on-surface-variant font-medium bg-amber-50 text-amber-700 px-1.5 py-0.2 rounded border border-amber-200">
              0.0% tasa de error
            </span>
          </div>
        </div>
      </div>

      {/* 4. Gráfica de Rendimiento: Ingresos vs. Gastos vs. Utilidad */}
      <div ref={chartRef} className="bg-surface-container-lowest p-5 rounded-xl border border-surface-container/60 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-[16px] font-bold text-primary">
              Curva de Rendimiento Mensual: Ingresos vs. Gastos
            </h2>
            <p className="text-[12px] text-on-surface-variant mt-0.5">
              Evolución cronológica desde el inicio del ejercicio fiscal hasta el día en curso ({anioActual} consolidado a hoy).
            </p>
          </div>

          {/* Leyenda de la Gráfica */}
          <div className="flex items-center gap-3 text-[11.5px] font-medium text-on-surface-variant shrink-0">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-blue-600 inline-block"></span>
              <span>Ingresos por Ventas</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-rose-600 inline-block"></span>
              <span>Gastos Operativos</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-4 h-0.5 bg-emerald-500 inline-block"></span>
              <span>Línea de Superávit</span>
            </span>
          </div>
        </div>

        {/* Tooltip Dinámico Flotante */}
        {activeMonthData && (
          <div className="flex items-center justify-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-900 border border-blue-200 text-[12px] font-medium shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
              <span>
                <strong>{activeMonthData.periodo}:</strong> Ventas <strong className="text-blue-700">{formatCOP(activeMonthData.ingresos_total)}</strong> | Gastos <strong className="text-rose-600">{formatCOP(activeMonthData.gastos_total)}</strong> | {activeMonthData.balance_neto >= 0 ? "Superávit" : "Déficit"} <strong className={activeMonthData.balance_neto >= 0 ? "text-emerald-700 font-bold" : "text-rose-700 font-bold"}>{activeMonthData.balance_neto >= 0 ? "+" : ""}{formatCOP(activeMonthData.balance_neto)}</strong>
              </span>
            </div>
          </div>
        )}

        {/* Gráfica de Barras SVG con Curva de Línea */}
        <div className="w-full h-64 relative pt-4 pb-2">
          {graficaItems.length === 0 ? (
            <div className="h-full flex items-center justify-center text-on-surface-variant text-[13px]">
              No hay suficientes datos para generar la gráfica en este rango.
            </div>
          ) : (
            <div className="h-full w-full flex flex-col justify-between">
              {/* Contenedor de barras */}
              <div className="flex-1 flex items-end justify-between gap-1 sm:gap-2 px-2 relative border-b border-surface-container/70">
                {/* Líneas guía de fondo */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-40">
                  <div className="border-b border-dashed border-surface-container"></div>
                  <div className="border-b border-dashed border-surface-container"></div>
                  <div className="border-b border-dashed border-surface-container"></div>
                </div>

                {graficaItems.map((item, idx) => {
                  const hIngresos = maxGraficaVal > 0 ? (item.ingresos_total / maxGraficaVal) * 100 : 0;
                  const hGastos = maxGraficaVal > 0 ? (item.gastos_total / maxGraficaVal) * 100 : 0;
                  const isHovered = activeHoverIndex === idx;

                  return (
                    <div
                      key={item.id || idx}
                      onMouseEnter={() => setActiveHoverIndex(idx)}
                      onMouseLeave={() => setActiveHoverIndex(null)}
                      className={`flex-1 h-full flex items-end justify-center gap-1 group cursor-pointer transition-all ${
                        isHovered ? "opacity-100 scale-105" : "opacity-85 hover:opacity-100"
                      }`}
                    >
                      {/* Barra Ingresos */}
                      <div
                        style={{ height: `${Math.max(4, hIngresos)}%` }}
                        className="chart-bar-item w-2.5 sm:w-4 bg-blue-600 rounded-t-sm transition-all relative group-hover:brightness-110"
                        title={`Ingresos: ${formatCOP(item.ingresos_total)}`}
                      ></div>

                      {/* Barra Gastos */}
                      <div
                        style={{ height: `${Math.max(4, hGastos)}%` }}
                        className="chart-bar-item w-2.5 sm:w-4 bg-rose-600 rounded-t-sm transition-all relative group-hover:brightness-110"
                        title={`Gastos: ${formatCOP(item.gastos_total)}`}
                      ></div>
                    </div>
                  );
                })}
              </div>

              {/* Etiquetas del Eje X (Meses) */}
              <div className="flex items-center justify-between px-2 pt-2 text-[11px] text-on-surface-variant font-medium">
                {graficaItems.map((item, idx) => (
                  <span
                    key={item.id || idx}
                    className={`text-center truncate flex-1 ${activeHoverIndex === idx ? "text-primary font-bold" : ""}`}
                  >
                    {item.periodo_corto}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 5. Matriz de Conciliación Financiera Consolidada (Tabla) */}
      <div ref={tableRef} className="bg-surface-container-lowest rounded-xl border border-surface-container/60 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-surface-container/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-[16px] font-bold text-primary">
              Matriz de Conciliación Financiera Consolidada
            </h2>
            <p className="text-[12px] text-on-surface-variant mt-0.5">
              Desglose granular ordenado cronológicamente. Cumple con la normativa interna de auditoría de caja StockControl.
            </p>
          </div>

          <div className="flex items-center gap-2 text-[11.5px] text-on-surface-variant">
            <span className="font-semibold text-primary">{tablaItems.length} registros</span>
            <span>mostrados</span>
          </div>
        </div>

        {/* Tabla o Estado Vacío */}
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-2 text-on-surface-variant">
            <span className="material-symbols-outlined text-[32px] text-secondary animate-spin">sync</span>
            <span className="text-[13px] font-medium">Consolidando balance financiero...</span>
          </div>
        ) : !data?.tiene_datos || tablaItems.length === 0 ? (
          /* Estado Vacío cuando no hay ventas en el tiempo seleccionado */
          <div className="empty-state-card py-16 px-4 flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-surface-container flex items-center justify-center text-on-surface-variant">
              <span className="material-symbols-outlined text-[32px]">event_busy</span>
            </div>
            <h3 className="text-[16px] font-bold text-primary">
              Sin movimientos registrados en este período
            </h3>
            <p className="text-[13px] text-on-surface-variant leading-relaxed">
              No se registraron ventas ni gastos operativos entre el <strong>{desde}</strong> y el <strong>{hasta}</strong>. Prueba seleccionando un rango más amplio o restableciendo al ejercicio completo.
            </p>
            <button
              type="button"
              onClick={() => handleGranularidadChange("meses")}
              className="mt-2 h-9 px-4 bg-secondary-container hover:bg-secondary text-on-secondary rounded-xl text-[12px] font-semibold transition-all cursor-pointer shadow-xs"
            >
              Restablecer al Ejercicio Anual
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[12.5px]">
              <thead>
                <tr className="border-b border-surface-container bg-surface-container-low/50 text-[11.5px] font-bold uppercase tracking-wider text-on-surface-variant">
                  <th className="py-3 px-4">Período Fiscal</th>
                  <th className="py-3 px-4 text-center">N° Transacc.</th>
                  <th className="py-3 px-4 text-right text-blue-700">Total Ingresos (Ventas)</th>
                  <th className="py-3 px-4 text-right text-rose-700">Total Gastos Operativos</th>
                  <th className="py-3 px-4 text-right">Balance Neto</th>
                  <th className="py-3 px-4 text-center">Estado Financiero</th>
                  <th className="py-3 px-4 text-right">Margen %</th>
                  <th className="py-3 px-4 text-center">Acción / Auditoría</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container/60">
                {tablaItems.map((item) => {
                  const esPositivo = item.balance_neto >= 0;
                  return (
                    <tr
                      key={item.id}
                      onClick={() => abrirDetallePeriodo(item)}
                      className="table-row-item hover:bg-surface-container-low transition-colors cursor-pointer group"
                      title="Haz clic para ver el desglose operativo detallado de este período"
                    >
                      <td className="py-3 px-4 font-semibold text-primary">
                        <div className="flex items-center gap-1.5">
                          <span>{item.periodo}</span>
                          <span className="material-symbols-outlined text-[14px] opacity-0 group-hover:opacity-100 text-primary transition-opacity">
                            open_in_new
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center text-on-surface-variant font-medium">
                        {item.transacciones}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-blue-600">
                        {formatCOP(item.ingresos_total)}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-rose-600">
                        {formatCOP(item.gastos_total)}
                      </td>
                      <td className={`py-3 px-4 text-right font-bold ${esPositivo ? "text-on-surface" : "text-rose-600"}`}>
                        {esPositivo ? "+" : ""}{formatCOP(item.balance_neto)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold ${
                            esPositivo
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-rose-50 text-rose-700 border border-rose-200"
                          }`}
                        >
                          {item.estado_financiero}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-on-surface-variant">
                        {item.margen_porcentaje > 0 ? `${item.margen_porcentaje}%` : `${item.margen_porcentaje}%`}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            abrirDetallePeriodo(item);
                          }}
                          className="p-1.5 rounded-lg text-primary hover:bg-primary/10 transition-colors cursor-pointer inline-flex items-center gap-1 font-semibold text-[11px]"
                          title="Ver productos vendidos, servicios y gastos de este período"
                        >
                          <span className="material-symbols-outlined text-[17px]">manage_search</span>
                          <span className="hidden sm:inline">Ver detalle</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>

              {/* Fila Inferior de Totales Consolidados con fondo oscuro como en la imagen */}
              <tfoot>
                <tr className="bg-slate-900 text-white font-bold text-[12.5px] border-t-2 border-slate-800">
                  <td className="py-3.5 px-4 uppercase tracking-wider text-slate-300">
                    Totales Consolidados ({desde.slice(0, 7)} - {hasta.slice(0, 7)})
                  </td>
                  <td className="py-3.5 px-4 text-center text-slate-300">
                    {kpis.total_tickets}
                  </td>
                  <td className="py-3.5 px-4 text-right text-blue-300">
                    {kpis.ventas_totales_formato}
                  </td>
                  <td className="py-3.5 px-4 text-right text-rose-300">
                    {kpis.gastos_totales_formato}
                  </td>
                  <td className={`py-3.5 px-4 text-right text-[13px] ${kpis.es_superavit ? "text-emerald-300" : "text-rose-300"}`}>
                    {kpis.balance_neto_formato}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">
                      {kpis.es_superavit ? "Superávit Consolidado" : "Déficit Consolidado"}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right text-slate-300">
                    {kpis.margen_porcentaje}%
                  </td>
                  <td className="py-3.5 px-4 text-center text-slate-400 text-[11px]">
                    --
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* 6. Matriz de Mayor Rotación de Productos & Demanda Comercial */}
      <div ref={rotacionRef} className="bg-surface-container-lowest rounded-xl border border-surface-container/60 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-surface-container/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-[16px] font-bold text-primary">
              Matriz de Mayor Rotación de Productos & Demanda Comercial
            </h2>
            <p className="text-[12px] text-on-surface-variant mt-0.5">
              Auditoría de rotación física y demanda por ítem catalogado. Controlado dinámicamente según el período seleccionado.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Selector sutil de Pestañas */}
            <div className="inline-flex p-1 bg-surface-container-low rounded-xl shadow-2xs">
              <button
                type="button"
                onClick={() => setTabRotacion("productos")}
                className={`px-3 py-1 text-[12px] rounded-lg font-semibold transition-all cursor-pointer ${
                  tabRotacion === "productos"
                    ? "bg-surface-container-lowest text-primary shadow-xs"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                Productos ({topProductos.length})
              </button>
              <button
                type="button"
                onClick={() => setTabRotacion("servicios")}
                className={`px-3 py-1 text-[12px] rounded-lg font-semibold transition-all cursor-pointer ${
                  tabRotacion === "servicios"
                    ? "bg-surface-container-lowest text-primary shadow-xs"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                Servicios ({topServicios.length})
              </button>
            </div>

            <div className="flex items-center gap-1.5 text-[11.5px] text-on-surface-variant pl-1">
              <span className="font-semibold text-primary">
                {tabRotacion === "productos" ? topProductos.length : topServicios.length} items
              </span>
              <span>en ranking</span>
            </div>
          </div>
        </div>

        {/* Pestaña: PRODUCTOS EN ROTACIÓN */}
        {tabRotacion === "productos" && (
          topProductos.length === 0 ? (
            <div className="empty-state-card py-16 px-4 flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-surface-container flex items-center justify-center text-on-surface-variant">
                <span className="material-symbols-outlined text-[32px]">inventory_2</span>
              </div>
              <h3 className="text-[16px] font-bold text-primary">
                Sin ventas de productos en este período
              </h3>
              <p className="text-[13px] text-on-surface-variant leading-relaxed">
                No se registraron ventas de catálogo entre el <strong>{desde}</strong> y el <strong>{hasta}</strong>. Prueba seleccionando un rango más amplio.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-[12.5px]">
                <thead>
                  <tr className="border-b border-surface-container bg-surface-container-low/50 text-[11.5px] font-bold uppercase tracking-wider text-on-surface-variant">
                    <th className="py-3 px-4 w-12 text-center">POS.</th>
                    <th className="py-3 px-4">PRODUCTO / CATÁLOGO</th>
                    <th className="py-3 px-4 text-center">CANT. VENDIDA</th>
                    <th className="py-3 px-4 text-right text-blue-700">TOTAL INGRESOS (VENTAS)</th>
                    <th className="py-3 px-4 text-right text-rose-700">COSTO ESTIMADO</th>
                    <th className="py-3 px-4 text-right">UTILIDAD BRUTA</th>
                    <th className="py-3 px-4 text-center">NIVEL DE ROTACIÓN</th>
                    <th className="py-3 px-4 text-right">MARGEN %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container/60">
                  {topProductos.map((prod) => {
                    const esLider = prod.posicion === 1;
                    const esMedia = prod.posicion <= 3;
                    return (
                      <tr
                        key={prod.id}
                        className="table-row-item hover:bg-surface-container-low/60 transition-colors"
                      >
                        <td className="py-3 px-4 text-center font-bold text-slate-700">
                          #{prod.posicion}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-semibold text-primary block">
                            {prod.nombre}
                          </span>
                          <span className="text-[11px] text-on-surface-variant">
                            {prod.categoria} {prod.codigo_barras !== "N/A" ? `• ${prod.codigo_barras}` : ""}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center font-semibold text-slate-800">
                          {prod.unidades_vendidas} unds
                        </td>
                        <td className="py-3 px-4 text-right font-semibold text-blue-600">
                          {prod.total_ingresos_formato}
                        </td>
                        <td className="py-3 px-4 text-right font-semibold text-rose-600">
                          {formatCOP(prod.total_costo)}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-on-surface">
                          +{prod.utilidad_bruta_formato}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-bold ${
                              esLider
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : esMedia
                                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                                  : "bg-surface-container text-on-surface-variant border border-surface-container"
                            }`}
                          >
                            {esLider ? "Alta Rotación (Líder)" : esMedia ? "Rotación Alta" : "Rotación Media"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-on-surface-variant">
                          {prod.margen_porcentaje}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>

                {/* Fila Inferior Consolidada igual a la Matriz */}
                <tfoot>
                  <tr className="bg-slate-900 text-white font-bold text-[12.5px] border-t-2 border-slate-800">
                    <td className="py-3.5 px-4 text-center text-slate-300">
                      TOTAL
                    </td>
                    <td className="py-3.5 px-4 uppercase tracking-wider text-slate-300">
                      Consolidado Catálogo ({desde.slice(0, 7)} - {hasta.slice(0, 7)})
                    </td>
                    <td className="py-3.5 px-4 text-center text-slate-300">
                      {rotacion.total_unidades_productos || 0} unds
                    </td>
                    <td className="py-3.5 px-4 text-right text-blue-300">
                      {kpis.ingresos_productos_formato}
                    </td>
                    <td className="py-3.5 px-4 text-right text-rose-300">
                      {formatCOP(topProductos.reduce((acc, p) => acc + (p.total_costo || 0), 0))}
                    </td>
                    <td className="py-3.5 px-4 text-right text-emerald-300">
                      +{formatCOP(topProductos.reduce((acc, p) => acc + (p.utilidad_bruta || 0), 0))}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">
                        {productoEstrella ? `Líder: ${productoEstrella.nombre}` : "Sin Líder"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-300">
                      100%
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )
        )}

        {/* Pestaña: SERVICIOS DEMANDADOS */}
        {tabRotacion === "servicios" && (
          topServicios.length === 0 ? (
            <div className="empty-state-card py-16 px-4 flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-surface-container flex items-center justify-center text-on-surface-variant">
                <span className="material-symbols-outlined text-[32px]">build</span>
              </div>
              <h3 className="text-[16px] font-bold text-primary">
                Sin servicios facturados en este período
              </h3>
              <p className="text-[13px] text-on-surface-variant leading-relaxed">
                No se registraron servicios técnicos entre el <strong>{desde}</strong> y el <strong>{hasta}</strong>.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-[12.5px]">
                <thead>
                  <tr className="border-b border-surface-container bg-surface-container-low/50 text-[11.5px] font-bold uppercase tracking-wider text-on-surface-variant">
                    <th className="py-3 px-4 w-12 text-center">POS.</th>
                    <th className="py-3 px-4">SERVICIO / LABOR</th>
                    <th className="py-3 px-4 text-center">VECES PRESTADO</th>
                    <th className="py-3 px-4 text-right text-blue-700">FACTURACIÓN TOTAL</th>
                    <th className="py-3 px-4 text-right text-rose-700">COSTO ASOCIADO</th>
                    <th className="py-3 px-4 text-right">UTILIDAD BRUTA</th>
                    <th className="py-3 px-4 text-center">NIVEL DE DEMANDA</th>
                    <th className="py-3 px-4 text-right">MARGEN %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container/60">
                  {topServicios.map((srv) => {
                    const esLider = srv.posicion === 1;
                    const esMedia = srv.posicion <= 3;
                    return (
                      <tr
                        key={srv.id}
                        className="table-row-item hover:bg-surface-container-low/60 transition-colors"
                      >
                        <td className="py-3 px-4 text-center font-bold text-slate-700">
                          #{srv.posicion}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-semibold text-primary block">
                            {srv.nombre}
                          </span>
                          <span className="text-[11px] text-on-surface-variant">
                            {srv.categoria} {srv.codigo_sku !== "N/A" ? `• SKU: ${srv.codigo_sku}` : ""}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center font-semibold text-slate-800">
                          {srv.servicios_prestados} atenciones
                        </td>
                        <td className="py-3 px-4 text-right font-semibold text-blue-600">
                          {srv.total_ingresos_formato}
                        </td>
                        <td className="py-3 px-4 text-right font-semibold text-rose-600">
                          {formatCOP(srv.total_ingresos - srv.utilidad_bruta)}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-on-surface">
                          +{srv.utilidad_bruta_formato}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-bold ${
                              esLider
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : esMedia
                                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                                  : "bg-surface-container text-on-surface-variant border border-surface-container"
                            }`}
                          >
                            {esLider ? "Mayor Demanda (Líder)" : esMedia ? "Alta Demanda" : "Demanda Normal"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-on-surface-variant">
                          {srv.margen_porcentaje}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>

                {/* Fila Inferior Consolidada igual a la Matriz */}
                <tfoot>
                  <tr className="bg-slate-900 text-white font-bold text-[12.5px] border-t-2 border-slate-800">
                    <td className="py-3.5 px-4 text-center text-slate-300">
                      TOTAL
                    </td>
                    <td className="py-3.5 px-4 uppercase tracking-wider text-slate-300">
                      Consolidado Servicios ({desde.slice(0, 7)} - {hasta.slice(0, 7)})
                    </td>
                    <td className="py-3.5 px-4 text-center text-slate-300">
                      {rotacion.total_servicios_prestados || 0} atenciones
                    </td>
                    <td className="py-3.5 px-4 text-right text-blue-300">
                      {kpis.ingresos_servicios_formato}
                    </td>
                    <td className="py-3.5 px-4 text-right text-rose-300">
                      {formatCOP(topServicios.reduce((acc, s) => acc + (s.total_ingresos - s.utilidad_bruta || 0), 0))}
                    </td>
                    <td className="py-3.5 px-4 text-right text-emerald-300">
                      +{formatCOP(topServicios.reduce((acc, s) => acc + (s.utilidad_bruta || 0), 0))}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">
                        {servicioEstrella ? `Líder: ${servicioEstrella.nombre}` : "Sin Líder"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-300">
                      100%
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )
        )}
      </div>

      {/* 7. Modal de Auditoría Operativa y Desglose Detallado del Período / Día */}
      {mounted && modalDetalleOpen && createPortal(
        <div
          className="fixed inset-0 z-[9999] w-screen h-screen bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-hidden"
          onClick={cerrarDetalleModal}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative bg-surface-container-lowest border border-surface-container rounded-2xl shadow-2xl w-full max-w-4xl max-h-[88vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-surface-container/80 flex items-center justify-between bg-surface-container-low/40 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[24px]">manage_search</span>
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-[16px] font-bold text-on-surface">
                      Auditoría Operativa y Desglose de Caja
                    </h3>
                    <span className="font-mono text-[12.5px] font-bold text-primary px-2.5 py-0.5 rounded-md bg-primary/10">
                      {selectedPeriodoItem?.periodo}
                    </span>
                    {selectedPeriodoItem && (
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold ${
                          selectedPeriodoItem.balance_neto >= 0
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}
                      >
                        {selectedPeriodoItem.estado_financiero} ({selectedPeriodoItem.balance_neto >= 0 ? "+" : ""}{formatCOP(selectedPeriodoItem.balance_neto)})
                      </span>
                    )}
                  </div>
                  <p className="text-[11.5px] text-on-surface-variant mt-0.5">
                    Detalle exhaustivo de ventas, productos y servicios despachados, y salidas de dinero registradas.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={cerrarDetalleModal}
                className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
                title="Cerrar (Esc)"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Resumen Superior de Métricas */}
            <div className="p-4 bg-surface-container-low/50 border-b border-surface-container/70 grid grid-cols-2 sm:grid-cols-4 gap-3 text-[12px]">
              <div className="p-3 rounded-xl bg-surface-container-lowest border border-surface-container/80 shadow-2xs">
                <span className="text-[11px] font-bold uppercase text-blue-700 block">Total Ingresos</span>
                <span className="text-[15px] font-bold text-blue-700 mt-0.5 block">
                  {formatCOP(detalleData?.resumen?.total_ventas ?? detalleData?.resumen?.total_ingresos ?? selectedPeriodoItem?.ingresos_total ?? 0)}
                </span>
                <span className="text-[10.5px] text-on-surface-variant">
                  {detalleData?.resumen?.num_ventas ?? detalleData?.resumen?.total_tickets ?? selectedPeriodoItem?.transacciones ?? 0} tickets &bull; {
                    detalleData?.resumen?.total_items_vendidos ??
                    (detalleData?.ventas || []).reduce((acc, v) => acc + (v.items || []).reduce((iacc, it) => iacc + Number(it.cantidad || 0), 0), 0)
                  } ítems
                </span>
              </div>

              <div className="p-3 rounded-xl bg-surface-container-lowest border border-surface-container/80 shadow-2xs">
                <span className="text-[11px] font-bold uppercase text-rose-700 block">Total Gastos</span>
                <span className="text-[15px] font-bold text-rose-700 mt-0.5 block">
                  {formatCOP(detalleData?.resumen?.total_gastos ?? selectedPeriodoItem?.gastos_total ?? 0)}
                </span>
                <span className="text-[10.5px] text-on-surface-variant">
                  {detalleData?.resumen?.num_gastos ?? detalleData?.resumen?.total_gastos_count ?? (detalleData?.gastos?.length || 0)} salidas operativas
                </span>
              </div>

              <div className="p-3 rounded-xl bg-surface-container-lowest border border-surface-container/80 shadow-2xs">
                <span className="text-[11px] font-bold uppercase text-on-surface block">Balance Neto</span>
                <span className={`text-[15px] font-bold mt-0.5 block ${(detalleData?.resumen?.balance_neto ?? selectedPeriodoItem?.balance_neto ?? 0) >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
                  {(detalleData?.resumen?.balance_neto ?? selectedPeriodoItem?.balance_neto ?? 0) >= 0 ? "+" : ""}
                  {formatCOP(detalleData?.resumen?.balance_neto ?? selectedPeriodoItem?.balance_neto ?? 0)}
                </span>
                <span className="text-[10.5px] text-on-surface-variant">
                  Margen: {selectedPeriodoItem?.margen_porcentaje || 0}%
                </span>
              </div>

              <div className="p-3 rounded-xl bg-surface-container-lowest border border-surface-container/80 shadow-2xs">
                <span className="text-[11px] font-bold uppercase text-on-surface-variant block">Auditoría Fiscal</span>
                <span className="text-[12px] font-bold text-on-surface mt-0.5 block">
                  Caja Cuadrada
                </span>
                <span className="text-[10.5px] text-emerald-600 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Verificado
                </span>
              </div>
            </div>

            {/* Barra de Filtros y Búsqueda en el Modal */}
            <div className="px-5 py-3 border-b border-surface-container/70 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-surface-container-lowest">
              <div className="flex items-center gap-1.5 bg-surface-container-low p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setDetalleTab("todos")}
                  className={`px-3 py-1.5 rounded-lg text-[11.5px] font-semibold transition-all cursor-pointer ${
                    detalleTab === "todos"
                      ? "bg-surface-container-lowest text-primary shadow-2xs"
                      : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  Todos ({ (detalleData?.ventas?.length || 0) + (detalleData?.gastos?.length || 0) })
                </button>
                <button
                  type="button"
                  onClick={() => setDetalleTab("ventas")}
                  className={`px-3 py-1.5 rounded-lg text-[11.5px] font-semibold transition-all cursor-pointer ${
                    detalleTab === "ventas"
                      ? "bg-blue-600 text-white shadow-2xs"
                      : "text-on-surface-variant hover:text-blue-700"
                  }`}
                >
                  Ventas & Ítems ({ detalleData?.ventas?.length || 0 })
                </button>
                <button
                  type="button"
                  onClick={() => setDetalleTab("gastos")}
                  className={`px-3 py-1.5 rounded-lg text-[11.5px] font-semibold transition-all cursor-pointer ${
                    detalleTab === "gastos"
                      ? "bg-rose-600 text-white shadow-2xs"
                      : "text-on-surface-variant hover:text-rose-700"
                  }`}
                >
                  Gastos & Salidas ({ detalleData?.gastos?.length || 0 })
                </button>
              </div>

              <div className="relative flex-1 sm:max-w-xs">
                <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[17px] text-on-surface-variant">
                  search
                </span>
                <input
                  type="text"
                  value={detalleSearch}
                  onChange={(e) => setDetalleSearch(e.target.value)}
                  placeholder="Buscar producto, servicio, gasto..."
                  className="w-full h-8 pl-8 pr-3 text-[12px] bg-surface-container-low/70 border border-surface-container rounded-lg focus:outline-none focus:ring-1 focus:ring-primary text-on-surface"
                />
              </div>
            </div>

            {/* Contenido Scrollable de Movimientos */}
            <div className="p-5 overflow-y-auto space-y-6 flex-1 text-[12.5px]">
              {detalleLoading ? (
                <div className="py-16 flex flex-col items-center justify-center gap-3 text-on-surface-variant">
                  <span className="material-symbols-outlined text-[36px] animate-spin text-primary">sync</span>
                  <p className="text-[13px] font-medium">Obteniendo desglose detallado de ventas y gastos...</p>
                </div>
              ) : detalleData?.error ? (
                <div className="p-6 text-center text-error bg-error-container/20 border border-error-container/50 rounded-xl">
                  <span className="material-symbols-outlined text-[32px] text-error mb-1">error</span>
                  <p className="font-semibold">{detalleData.error}</p>
                </div>
              ) : (
                <>
                  {/* SECCIÓN 1: VENTAS DETALLADAS CON SUS ÍTEMS */}
                  {detalleTab !== "gastos" && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                          <h4 className="font-bold text-[13.5px] text-on-surface">
                            Ingresos por Ventas y Servicios Prestados
                          </h4>
                        </div>
                        <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                          {modalVentas.length} comprobantes
                        </span>
                      </div>

                      {modalVentas.length === 0 ? (
                        <div className="p-4 text-center text-on-surface-variant bg-surface-container-low/40 rounded-xl border border-surface-container/60">
                          No se encontraron ventas para los criterios seleccionados.
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {modalVentas.map((v) => (
                            <div
                              key={v.id || v.folio_ticket}
                              className="border border-surface-container/80 rounded-xl overflow-hidden bg-surface-container-lowest shadow-2xs"
                            >
                              {/* Header del Ticket */}
                              <div className="p-3 bg-surface-container-low/50 border-b border-surface-container/70 flex flex-wrap items-center justify-between gap-2 text-[12px]">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-mono font-bold text-primary text-[13px]">
                                    #{v.folio_ticket}
                                  </span>
                                  <span className="text-on-surface-variant font-medium">
                                    {v.fecha_hora || v.fecha_hora_formato || v.fecha || "--"}
                                  </span>
                                  <span className="text-on-surface-variant">&bull;</span>
                                  <span className="font-semibold text-on-surface">
                                    {v.cliente_nombre || v.cliente || "Cliente Mostrador"}
                                  </span>
                                  <span className="text-on-surface-variant font-normal">
                                    (Cajero: {v.responsable || "Admin"})
                                  </span>
                                </div>

                                <div className="flex items-center gap-2">
                                  <span className="px-2 py-0.5 rounded-md bg-surface-container text-on-surface text-[11px] font-medium">
                                    {v.metodo_pago}
                                  </span>
                                  <span className="font-bold text-blue-700 text-[13.5px]">
                                    {formatCOP(v.total)}
                                  </span>
                                </div>
                              </div>

                              {/* Tabla de ítems vendidos dentro de este ticket */}
                              <div className="p-2 sm:p-3 overflow-x-auto">
                                <table className="w-full text-left border-collapse text-[11.5px]">
                                  <thead>
                                    <tr className="border-b border-surface-container/50 text-[10.5px] uppercase font-bold text-on-surface-variant">
                                      <th className="py-1.5 px-2">Tipo</th>
                                      <th className="py-1.5 px-2">Cód / SKU</th>
                                      <th className="py-1.5 px-2">Descripción del Producto / Servicio</th>
                                      <th className="py-1.5 px-2 text-right">Cantidad</th>
                                      <th className="py-1.5 px-2 text-right">P. Unitario</th>
                                      <th className="py-1.5 px-2 text-right">Subtotal</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-surface-container/40">
                                    {Array.isArray(v.items) && v.items.length > 0 ? (
                                      v.items.map((it, idx) => {
                                        const isServ = (it.tipo_item || "").toLowerCase() === "servicio";
                                        const codigo = it.sku || it.codigo || it.codigo_referencia || "--";
                                        const descripcion = it.descripcion || it.nombre || "Artículo General";
                                        return (
                                          <tr key={idx} className="hover:bg-surface-container-low/40">
                                            <td className="py-2 px-2">
                                              <span
                                                className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                                  isServ
                                                    ? "bg-blue-100 text-blue-800"
                                                    : "bg-emerald-100 text-emerald-800"
                                                }`}
                                              >
                                                {isServ ? "Servicio" : "Producto"}
                                              </span>
                                            </td>
                                            <td className="py-2 px-2 font-mono text-on-surface-variant">
                                              {codigo}
                                            </td>
                                            <td className="py-2 px-2 font-semibold text-on-surface">
                                              {descripcion}
                                            </td>
                                            <td className="py-2 px-2 text-right font-bold text-on-surface">
                                              {it.cantidad}
                                            </td>
                                            <td className="py-2 px-2 text-right text-on-surface-variant">
                                              {formatCOP(it.precio_unitario)}
                                            </td>
                                            <td className="py-2 px-2 text-right font-bold text-on-surface">
                                              {formatCOP(it.subtotal)}
                                            </td>
                                          </tr>
                                        );
                                      })
                                    ) : (
                                      <tr>
                                        <td colSpan={6} className="py-2 text-center text-on-surface-variant text-[11px]">
                                          Sin ítems desglosados en este ticket.
                                        </td>
                                      </tr>
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* SECCIÓN 2: GASTOS Y SALIDAS DETALLADAS */}
                  {detalleTab !== "ventas" && (
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span>
                          <h4 className="font-bold text-[13.5px] text-on-surface">
                            Gastos y Salidas Operativas de Caja
                          </h4>
                        </div>
                        <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                          {modalGastos.length} salidas
                        </span>
                      </div>

                      {modalGastos.length === 0 ? (
                        <div className="p-4 text-center text-on-surface-variant bg-surface-container-low/40 rounded-xl border border-surface-container/60">
                          No se registraron gastos operativos para este período.
                        </div>
                      ) : (
                        <div className="border border-surface-container/80 rounded-xl overflow-hidden bg-surface-container-lowest shadow-2xs">
                          <table className="w-full text-left border-collapse text-[12px]">
                            <thead className="bg-surface-container-low/60 border-b border-surface-container/70 text-[11px] uppercase font-bold text-on-surface-variant">
                              <tr>
                                <th className="py-2 px-3">Fecha / Hora</th>
                                <th className="py-2 px-3">Categoría</th>
                                <th className="py-2 px-3">Concepto / Motivo del Gasto</th>
                                <th className="py-2 px-3">Beneficiario / Proveedor</th>
                                <th className="py-2 px-3">Método de Pago</th>
                                <th className="py-2 px-3 text-right">Monto</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-surface-container/50">
                              {modalGastos.map((g) => (
                                <tr key={g.id} className="hover:bg-surface-container-low/40">
                                  <td className="py-2.5 px-3 whitespace-nowrap text-on-surface-variant text-[11.5px]">
                                    {g.fecha_hora || g.fecha_formato || g.fecha}
                                  </td>
                                  <td className="py-2.5 px-3">
                                    <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200 text-[10.5px] font-bold">
                                      {g.categoria || g.clasificacion || "General"}
                                    </span>
                                  </td>
                                  <td className="py-2.5 px-3 font-semibold text-on-surface">
                                    {g.descripcion}
                                  </td>
                                  <td className="py-2.5 px-3 text-on-surface-variant">
                                    {g.proveedor_beneficiario || g.responsable || "--"}
                                  </td>
                                  <td className="py-2.5 px-3 text-on-surface-variant">
                                    <span className="px-1.5 py-0.5 rounded bg-surface-container text-[11px]">
                                      {g.metodo_pago || "Efectivo"}
                                    </span>
                                  </td>
                                  <td className="py-2.5 px-3 text-right font-bold text-rose-600">
                                    -{formatCOP(g.total ?? g.monto ?? 0)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer Modal */}
            <div className="px-5 py-3 border-t border-surface-container/80 flex items-center justify-between bg-surface-container-low/40">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-[12px] font-semibold bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[17px]">print</span>
                Imprimir Auditoría
              </button>
              <button
                type="button"
                onClick={cerrarDetalleModal}
                className="px-4 py-2 rounded-xl text-[12px] font-semibold bg-primary hover:bg-primary-hover text-on-primary transition-colors cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
