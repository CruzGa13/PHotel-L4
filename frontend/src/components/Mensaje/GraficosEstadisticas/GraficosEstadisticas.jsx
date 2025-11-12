import { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import styles from './GraficosEstadisticas.module.css';

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function GraficosEstadisticas({ mensajes }) {
  
  // Calcular tendencias por día de la semana
  const tendenciasPorDia = useMemo(() => {
    const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const contadores = new Array(7).fill(0);
    
    mensajes.forEach(msg => {
      const fecha = new Date(msg.fecha);
      const dia = fecha.getDay();
      contadores[dia]++;
    });
    
    return {
      labels: dias,
      datasets: [{
        label: 'Emails Recibidos',
        data: contadores,
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
        borderRadius: 8,
      }]
    };
  }, [mensajes]);

  // Distribución por estado (dona)
  const distribucionEstado = useMemo(() => {
    const pendientes = mensajes.filter(m => m.estado === 'Pendiente').length;
    const respondidos = mensajes.filter(m => m.estado === 'Respondido').length;
    const archivados = mensajes.filter(m => m.estado === 'Archivado').length;
    
    return {
      labels: ['Pendientes', 'Respondidos', 'Archivados'],
      datasets: [{
        data: [pendientes, respondidos, archivados],
        backgroundColor: [
          'rgba(251, 191, 36, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(107, 114, 128, 0.8)',
        ],
        borderColor: [
          'rgba(251, 191, 36, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(107, 114, 128, 1)',
        ],
        borderWidth: 2,
      }]
    };
  }, [mensajes]);

  // Tiempo promedio de respuesta
  const tiempoPromedioRespuesta = useMemo(() => {
    const respondidos = mensajes.filter(m => m.estado === 'Respondido');
    
    if (respondidos.length === 0) return { horas: 0, minutos: 0 };
    
    let totalMinutos = 0;
    respondidos.forEach(msg => {
      // Simular tiempo de respuesta (en realidad necesitaríamos fechaRespuesta en BD)
      // Por ahora, calculamos desde fechaRecibido hasta ahora
      const recibido = new Date(msg.fecha);
      const ahora = new Date();
      const diff = ahora - recibido;
      const minutos = Math.floor(diff / (1000 * 60));
      totalMinutos += minutos;
    });
    
    const promedioMinutos = Math.floor(totalMinutos / respondidos.length);
    const horas = Math.floor(promedioMinutos / 60);
    const minutos = promedioMinutos % 60;
    
    return { horas, minutos };
  }, [mensajes]);

  // Opciones de gráficos
  const opcionesDonut = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 15,
          font: {
            size: 12,
            family: "'Segoe UI', sans-serif"
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: { size: 14 },
        bodyFont: { size: 13 },
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    }
  };

  const opcionesBarras = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: { size: 14 },
        bodyFont: { size: 13 }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          font: {
            size: 11
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      x: {
        ticks: {
          font: {
            size: 11
          }
        },
        grid: {
          display: false
        }
      }
    }
  };

  return (
    <div className={styles.graficosContainer}>
      <h2 className={styles.mainTitle}>📊 Análisis Visual</h2>
      
      <div className={styles.graficosGrid}>
        {/* Gráfico de distribución por estado */}
        <div className={styles.graficoCard}>
          <h3 className={styles.cardTitle}>
            <span className={styles.iconTitle}>🎯</span>
            Distribución por Estado
          </h3>
          <div className={styles.chartWrapper}>
            <Doughnut data={distribucionEstado} options={opcionesDonut} />
          </div>
        </div>

        {/* Gráfico de tendencias por día */}
        <div className={styles.graficoCard}>
          <h3 className={styles.cardTitle}>
            <span className={styles.iconTitle}>📈</span>
            Tendencia Semanal
          </h3>
          <div className={styles.chartWrapper}>
            <Bar data={tendenciasPorDia} options={opcionesBarras} />
          </div>
        </div>

        {/* Tiempo promedio de respuesta */}
        <div className={styles.metricaCard}>
          <div className={styles.metricaIcon}>⏱️</div>
          <h3 className={styles.metricaTitle}>Tiempo Promedio de Respuesta</h3>
          <div className={styles.metricaValor}>
            <span className={styles.numero}>{tiempoPromedioRespuesta.horas}</span>
            <span className={styles.unidad}>h</span>
            <span className={styles.separador}>:</span>
            <span className={styles.numero}>{tiempoPromedioRespuesta.minutos}</span>
            <span className={styles.unidad}>min</span>
          </div>
          <p className={styles.metricaDescripcion}>
            Basado en {mensajes.filter(m => m.estado === 'Respondido').length} emails respondidos
          </p>
        </div>
      </div>
    </div>
  );
}
