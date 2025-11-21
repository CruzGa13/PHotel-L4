import { useState, useEffect, useRef } from 'react';
import { FaChartBar, FaChartLine, FaChartPie, FaFilter, FaEraser, FaSearch, FaCalendarAlt, FaFilePdf } from 'react-icons/fa';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import toast from 'react-hot-toast';
import styles from './AdminConsultasPage.module.css';

// Registrar componentes de Chart.js (incluido Filler para gráficos de área)
ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler);

// Plugin para fondo blanco en gráficos (para exportar PDF)
const backgroundColorPlugin = {
  id: 'customCanvasBackgroundColor',
  beforeDraw: (chart) => {
    const { ctx } = chart;
    ctx.save();
    ctx.globalCompositeOperation = 'destination-over';
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, chart.width, chart.height);
    ctx.restore();
  }
};

ChartJS.register(backgroundColorPlugin);

const API_BASE_URL = 'http://localhost:3000/api';

export default function AdminConsultasPage() {
  // Referencias para los gráficos
  const graficoBarrasRef = useRef(null);
  const graficoLineasRef = useRef(null);
  const graficoDonaRef = useRef(null);

  // Estados para filtros globales
  const [filtros, setFiltros] = useState({
    from: '2025-03-01',
    to: '2025-03-31',
    tipoHabitacionId: 'Todos',
    estado: 'Todos',
  });

  // Estados para tabla
  const [busquedaCliente, setBusquedaCliente] = useState('');
  const [metodoPago, setMetodoPago] = useState('Todos');
  const [paginaActual, setPaginaActual] = useState(1);
  const itemsPorPagina = 10;

  // Estados para datos de la API
  const [kpis, setKpis] = useState({
    ocupacionPromedio: '0.0',
    ingresosTotales: 0,
    totalReservas: 0,
    tasaCancelacion: '0.0',
  });
  const [graficosData, setGraficosData] = useState({
    ingresosPorDia: [],
    reservasPorTipo: [],
    estadosReserva: [],
  });
  const [reservas, setReservas] = useState([]);
  const [totalReservas, setTotalReservas] = useState(0);
  const [tiposHabitacion, setTiposHabitacion] = useState([]);

  // Estados de loading
  const [loadingResumen, setLoadingResumen] = useState(false);
  const [loadingReservas, setLoadingReservas] = useState(false);
  const [generandoPDF, setGenerandoPDF] = useState(false);

  // Cargar tipos de habitación al montar
  useEffect(() => {
    cargarTiposHabitacion();
  }, []);

  // Cargar resumen cuando cambian los filtros
  useEffect(() => {
    cargarResumen();
  }, [filtros]);

  // Cargar reservas cuando cambian filtros, búsqueda, método de pago o página
  useEffect(() => {
    cargarReservas();
  }, [filtros, busquedaCliente, metodoPago, paginaActual]);

  // ========================================
  // FUNCIONES DE CARGA DE DATOS
  // ========================================

  const cargarTiposHabitacion = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/tipos-habitacion`);
      if (response.ok) {
        const data = await response.json();
        setTiposHabitacion(data);
      }
    } catch (error) {
      console.error('Error al cargar tipos de habitación:', error);
    }
  };

  const cargarResumen = async () => {
    setLoadingResumen(true);
    try {
      const params = new URLSearchParams();
      if (filtros.from) params.append('from', filtros.from);
      if (filtros.to) params.append('to', filtros.to);
      if (filtros.tipoHabitacionId && filtros.tipoHabitacionId !== 'Todos') {
        params.append('tipoHabitacionId', filtros.tipoHabitacionId);
      }
      if (filtros.estado && filtros.estado !== 'Todos') {
        params.append('estado', filtros.estado);
      }
      if (filtros.operadorId && filtros.operadorId !== 'Todos') {
        params.append('operadorId', filtros.operadorId);
      }

      const response = await fetch(`${API_BASE_URL}/admin/consultas/resumen?${params}`);
      if (response.ok) {
        const data = await response.json();
        setKpis(data.kpis);
        setGraficosData(data.graficos);
      } else {
        throw new Error('Error al cargar resumen');
      }
    } catch (error) {
      console.error('Error al cargar resumen:', error);
      toast.error('Error al cargar datos del resumen');
    } finally {
      setLoadingResumen(false);
    }
  };

  const cargarReservas = async () => {
    setLoadingReservas(true);
    try {
      const params = new URLSearchParams();
      if (filtros.from) params.append('from', filtros.from);
      if (filtros.to) params.append('to', filtros.to);
      if (filtros.tipoHabitacionId && filtros.tipoHabitacionId !== 'Todos') {
        params.append('tipoHabitacionId', filtros.tipoHabitacionId);
      }
      if (filtros.estado && filtros.estado !== 'Todos') {
        params.append('estado', filtros.estado);
      }
      if (busquedaCliente) {
        params.append('busquedaCliente', busquedaCliente);
      }
      if (metodoPago && metodoPago !== 'Todos') {
        params.append('metodoPago', metodoPago);
      }
      params.append('page', paginaActual);
      params.append('pageSize', itemsPorPagina);

      const response = await fetch(`${API_BASE_URL}/admin/consultas/reservas?${params}`);
      if (response.ok) {
        const data = await response.json();
        setReservas(data.items);
        setTotalReservas(data.totalItems);
      } else {
        throw new Error('Error al cargar reservas');
      }
    } catch (error) {
      console.error('Error al cargar reservas:', error);
      toast.error('Error al cargar reservas');
    } finally {
      setLoadingReservas(false);
    }
  };

  // Limpiar filtros
  const limpiarFiltros = () => {
    setFiltros({
      from: '2025-03-01',
      to: '2025-03-31',
      tipoHabitacionId: 'Todos',
      estado: 'Todos',
    });
    setBusquedaCliente('');
    setMetodoPago('Todos');
    setPaginaActual(1);
  };

  // ========================================
  // DATOS PARA GRÁFICOS
  // ========================================

  // Gráfico de barras: Reservas por tipo de habitación
  const datosBarras = {
    labels: graficosData.reservasPorTipo.map((item) => item.tipoHabitacionNombre),
    datasets: [
      {
        label: 'Cantidad de Reservas',
        data: graficosData.reservasPorTipo.map((item) => item.cantidad),
        backgroundColor: 'rgba(147, 51, 234, 0.7)',
        borderColor: 'rgba(147, 51, 234, 1)',
        borderWidth: 2,
      },
    ],
  };

  // Gráfico de líneas: Ingresos por día
  const datosLineas = {
    labels: graficosData.ingresosPorDia.map((item) =>
      new Date(item.fecha).toLocaleDateString('es-AR')
    ),
    datasets: [
      {
        label: 'Ingresos ($)',
        data: graficosData.ingresosPorDia.map((item) => item.total),
        borderColor: 'rgba(147, 51, 234, 1)',
        backgroundColor: 'rgba(147, 51, 234, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  // Gráfico de dona: Estados de reservas
  const datosDona = {
    labels: graficosData.estadosReserva.map((item) => item.estado),
    datasets: [
      {
        data: graficosData.estadosReserva.map((item) => item.cantidad),
        backgroundColor: [
          'rgba(147, 51, 234, 0.8)',
          'rgba(192, 38, 211, 0.8)',
          'rgba(126, 34, 206, 0.8)',
          'rgba(107, 33, 168, 0.8)',
          'rgba(88, 28, 135, 0.8)',
          'rgba(76, 29, 149, 0.8)',
        ],
        borderColor: '#fff',
        borderWidth: 2,
      },
    ],
  };

  // ========================================
  // PAGINACIÓN
  // ========================================

  const totalPaginas = Math.ceil(totalReservas / itemsPorPagina);

  // ========================================
  // EXPORTAR PDF
  // ========================================

  const exportarPDF = async () => {
    setGenerandoPDF(true);

    try {
      // 1. Obtener imágenes base64 de los gráficos (con calidad reducida para reducir tamaño)
      const graficos = {};

      if (graficoBarrasRef.current) {
        const base64 = graficoBarrasRef.current.toBase64Image('image/jpeg', 0.7);
        graficos.reservasPorTipo = base64.replace(/^data:image\/jpeg;base64,/, '');
      }

      if (graficoLineasRef.current) {
        const base64 = graficoLineasRef.current.toBase64Image('image/jpeg', 0.7);
        graficos.ingresosPorDia = base64.replace(/^data:image\/jpeg;base64,/, '');
      }

      if (graficoDonaRef.current) {
        const base64 = graficoDonaRef.current.toBase64Image('image/jpeg', 0.7);
        graficos.estadosReserva = base64.replace(/^data:image\/jpeg;base64,/, '');
      }

      // 2. Preparar datos para enviar (solo filtros, el backend obtiene los datos)
      const payload = {
        filtros: {
          from: filtros.from,
          to: filtros.to,
          tipoHabitacionId: filtros.tipoHabitacionId,
          estado: filtros.estado,
          busquedaCliente,
          metodoPago,
        },
        graficos,
      };

      // 3. Hacer POST al backend
      const response = await fetch(`${API_BASE_URL}/reportes/reservas/pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Error al generar el PDF');
      }

      // 4. Descargar el PDF
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte-reservas-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('PDF generado exitosamente', {
        duration: 3000,
        style: {
          background: '#d1fae5',
          color: '#065f46',
        },
      });
    } catch (error) {
      console.error('Error al exportar PDF:', error);
      toast.error('Error al generar el PDF', {
        duration: 3000,
        style: {
          background: '#fee2e2',
          color: '#991b1b',
        },
      });
    } finally {
      setGenerandoPDF(false);
    }
  };

  // ========================================
  // RENDER
  // ========================================

  return (
    <div className={styles.page}>
      <div className={styles.containerMain}>
        {/* Breadcrumb */}
        <div className={styles.breadcrumb}>
          <span>Panel de Administrador</span>
          <span className={styles.sep}>/</span>
          <span className={styles.pink}>Consultas y Gráficos</span>
        </div>

        {/* Cabecera */}
        <div className={styles.headTop}>
          <div>
            <h2>
              <span className={styles.gradientText}>Consultas y Gráficos</span>
            </h2>
            <p className={styles.muted}>
              Análisis parametrizado de reservas, ingresos y ocupación del hotel
            </p>
          </div>
        </div>

        {/* ========================================
            FILTROS GLOBALES
            ======================================== */}
        <div className={styles.filtrosCard}>
          <div className={styles.filtrosHeader}>
            <FaFilter className={styles.filtroIcon} />
            <h3>Filtros de Consulta</h3>
          </div>

          <div className={styles.filtrosGrid}>
            {/* Fecha Desde */}
            <div className={styles.formGroup}>
              <label>
                <FaCalendarAlt /> Fecha Desde <span className={styles.required}>*</span>
              </label>
              <input
                type="date"
                value={filtros.from}
                onChange={(e) => setFiltros({ ...filtros, from: e.target.value })}
                className={styles.input}
              />
            </div>

            {/* Fecha Hasta */}
            <div className={styles.formGroup}>
              <label>
                <FaCalendarAlt /> Fecha Hasta <span className={styles.required}>*</span>
              </label>
              <input
                type="date"
                value={filtros.to}
                onChange={(e) => setFiltros({ ...filtros, to: e.target.value })}
                className={styles.input}
              />
            </div>

            {/* Tipo de Habitación */}
            <div className={styles.formGroup}>
              <label>Tipo de Habitación</label>
              <select
                value={filtros.tipoHabitacionId}
                onChange={(e) => setFiltros({ ...filtros, tipoHabitacionId: e.target.value })}
                className={styles.select}
              >
                <option value="Todos">Todos</option>
                {tiposHabitacion.map((tipo) => (
                  <option key={tipo.id} value={tipo.id}>
                    {tipo.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Estado de Reserva */}
            <div className={styles.formGroup}>
              <label>Estado de Reserva</label>
              <select
                value={filtros.estado}
                onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
                className={styles.select}
              >
                <option value="Todos">Todos</option>
                <option value="Pendiente">Pendiente</option>
                <option value="Confirmada">Confirmada</option>
                <option value="CheckIn">Check-In</option>
                <option value="CheckOut">Check-Out</option>
                <option value="Cancelada">Cancelada</option>
              </select>
            </div>
          </div>

          {/* Botón Limpiar Filtros - Debajo de los filtros */}
          <div style={{ marginTop: '15px', textAlign: 'right' }}>
            <button onClick={limpiarFiltros} className={styles.btnLimpiar}>
              <FaEraser /> Limpiar Filtros
            </button>
          </div>
        </div>

        {/* ========================================
            KPIs (CARDS)
            ======================================== */}
        <div className={styles.kpisGrid}>
          <div className={styles.kpiCard}>
            <div
              className={styles.kpiIcon}
              style={{ background: 'linear-gradient(135deg, #9333ea, #7e22ce)' }}
            >
              <FaChartBar />
            </div>
            <div className={styles.kpiContent}>
              <p className={styles.kpiLabel}>Ocupación Promedio</p>
              <h3 className={styles.kpiValue}>
                {loadingResumen ? '...' : `${kpis.ocupacionPromedio}%`}
              </h3>
            </div>
          </div>

          <div className={styles.kpiCard}>
            <div
              className={styles.kpiIcon}
              style={{ background: 'linear-gradient(135deg, #c026d3, #a21caf)' }}
            >
              <FaChartLine />
            </div>
            <div className={styles.kpiContent}>
              <p className={styles.kpiLabel}>Ingresos del Período</p>
              <h3 className={styles.kpiValue}>
                {loadingResumen
                  ? '...'
                  : `$${Number(kpis.ingresosTotales).toLocaleString('es-AR')}`}
              </h3>
            </div>
          </div>

          <div className={styles.kpiCard}>
            <div
              className={styles.kpiIcon}
              style={{ background: 'linear-gradient(135deg, #7e22ce, #6b21a8)' }}
            >
              <FaChartPie />
            </div>
            <div className={styles.kpiContent}>
              <p className={styles.kpiLabel}>Total de Reservas</p>
              <h3 className={styles.kpiValue}>
                {loadingResumen ? '...' : kpis.totalReservas}
              </h3>
            </div>
          </div>

          <div className={styles.kpiCard}>
            <div
              className={styles.kpiIcon}
              style={{ background: 'linear-gradient(135deg, #a21caf, #86198f)' }}
            >
              <FaChartBar />
            </div>
            <div className={styles.kpiContent}>
              <p className={styles.kpiLabel}>Tasa de Cancelación</p>
              <h3 className={styles.kpiValue}>
                {loadingResumen ? '...' : `${kpis.tasaCancelacion}%`}
              </h3>
            </div>
          </div>
        </div>

        {/* ========================================
            GRÁFICOS
            ======================================== */}
        <div className={styles.graficosGrid}>
          {/* Gráfico de Barras */}
          <div className={styles.graficoCard}>
            <h3 className={styles.graficoTitulo}>
              <FaChartBar /> Reservas por Tipo de Habitación
            </h3>
            <div className={styles.graficoContainer}>
              {loadingResumen ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                  Cargando...
                </div>
              ) : (
                <Bar
                  ref={graficoBarrasRef}
                  data={datosBarras}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: false },
                      title: { display: false },
                      customCanvasBackgroundColor: {
                        color: '#ffffff',
                      }
                    },
                    scales: {
                      y: { beginAtZero: true, ticks: { stepSize: 1 } },
                    },
                  }}
                />
              )}
            </div>
          </div>

          {/* Gráfico de Líneas */}
          <div className={styles.graficoCard}>
            <h3 className={styles.graficoTitulo}>
              <FaChartLine /> Ingresos por Día
            </h3>
            <div className={styles.graficoContainer}>
              {loadingResumen ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                  Cargando...
                </div>
              ) : (
                <Line
                  ref={graficoLineasRef}
                  data={datosLineas}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: false },
                      title: { display: false },
                      customCanvasBackgroundColor: {
                        color: '#ffffff',
                      }
                    },
                    scales: {
                      y: { beginAtZero: true },
                    },
                  }}
                />
              )}
            </div>
          </div>

          {/* Gráfico de Dona */}
          <div className={styles.graficoCard}>
            <h3 className={styles.graficoTitulo}>
              <FaChartPie /> Estados de Reservas
            </h3>
            <div className={styles.graficoContainer}>
              {loadingResumen ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                  Cargando...
                </div>
              ) : (
                <Doughnut
                  ref={graficoDonaRef}
                  data={datosDona}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: 'bottom' },
                      customCanvasBackgroundColor: {
                        color: '#ffffff',
                      }
                    },
                  }}
                />
              )}
            </div>
          </div>
        </div>

        {/* ========================================
            TABLA DE CONSULTAS PARAMETRIZADAS
            ======================================== */}
        <div className={styles.tablaCard}>
          <div className={styles.tablaHeader}>
            <h3>Detalle de Reservas</h3>
            <div className={styles.tablaFiltros}>
              <button
                onClick={exportarPDF}
                disabled={generandoPDF}
                className={styles.btnExportarPDF}
              >
                <FaFilePdf />
                {generandoPDF ? 'Generando PDF...' : 'Exportar PDF'}
              </button>
              <div className={styles.searchBox}>
                <FaSearch />
                <input
                  type="text"
                  placeholder="Buscar por cliente..."
                  value={busquedaCliente}
                  onChange={(e) => {
                    setBusquedaCliente(e.target.value);
                    setPaginaActual(1);
                  }}
                  className={styles.searchInput}
                />
              </div>
              <select
                value={metodoPago}
                onChange={(e) => {
                  setMetodoPago(e.target.value);
                  setPaginaActual(1);
                }}
                className={styles.selectSmall}
              >
                <option value="Todos">Todos los métodos</option>
                <option value="Efectivo">Efectivo</option>
                <option value="Tarjeta">Tarjeta</option>
                <option value="Transferencia">Transferencia</option>
              </select>
            </div>
          </div>

          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Fecha Ingreso</th>
                  <th>Fecha Egreso</th>
                  <th>Cliente</th>
                  <th>Tipo(s) de Habitación</th>
                  <th>Estado</th>
                  <th>Método de Pago</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {loadingReservas ? (
                  <tr>
                    <td colSpan="7" className={styles.noData}>
                      Cargando reservas...
                    </td>
                  </tr>
                ) : reservas.length === 0 ? (
                  <tr>
                    <td colSpan="7" className={styles.noData}>
                      No se encontraron reservas con los filtros seleccionados
                    </td>
                  </tr>
                ) : (
                  reservas.map((reserva) => (
                    <tr key={reserva.id}>
                      <td>{new Date(reserva.fechaIngreso).toLocaleDateString('es-AR')}</td>
                      <td>{new Date(reserva.fechaEgreso).toLocaleDateString('es-AR')}</td>
                      <td>
                        <div className={styles.clienteInfo}>
                          <strong>{reserva.cliente.nombreCompleto}</strong>
                          <small>{reserva.cliente.email}</small>
                        </div>
                      </td>
                      <td>{reserva.tipoHabitaciones.map((th) => th.nombre).join(', ')}</td>
                      <td>
                        <span className={`${styles.badge} ${styles[`badge${reserva.estado}`]}`}>
                          {reserva.estado}
                        </span>
                      </td>
                      <td>{reserva.metodoPago}</td>
                      <td className={styles.totalCell}>
                        ${Number(reserva.totalFinal).toLocaleString('es-AR')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          {totalPaginas > 1 && (
            <div className={styles.paginacion}>
              <button
                onClick={() => setPaginaActual((prev) => Math.max(prev - 1, 1))}
                disabled={paginaActual === 1}
                className={styles.btnPaginacion}
              >
                Anterior
              </button>
              <span className={styles.paginaInfo}>
                Página {paginaActual} de {totalPaginas}
              </span>
              <button
                onClick={() => setPaginaActual((prev) => Math.min(prev + 1, totalPaginas))}
                disabled={paginaActual === totalPaginas}
                className={styles.btnPaginacion}
              >
                Siguiente
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
