import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const proyectos = ["Proyecto 1", "Proyecto 9", "Cristian Andrés Godoy Anglesdsdf"];
const monto_asignado = [50000000, 30000000, 96000000];
const monto_rendido = [44765745, 9250000, 0]; // Usa tus valores manuales

const barData = {
  labels: proyectos,
  datasets: [
    {
      label: 'Monto Asignado',
      data: monto_asignado,
      backgroundColor: '#3498db', // azul
    },
    {
      label: 'Monto Rendido',
      data: monto_rendido,
      backgroundColor: '#976733', // café
    },
  ],
};

const barOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'top' },
    title: { display: true, text: 'Comparativo por Proyecto' },
  },
  scales: {
    x: {
      ticks: {
        font: { size: 16 },
        maxRotation: 0,
        minRotation: 0,
      },
    },
    y: {
      ticks: {
        font: { size: 16 },
      },
    },
  },
};

const doughnutData = {
  labels: proyectos,
  datasets: [
    {
      label: 'Monto Total por Proyecto',
      data: monto_asignado,
      backgroundColor: [
        '#3498db', '#976733', '#e67e22', '#2ecc71', '#9b59b6', '#e74c3c'
      ],
    },
  ],
};

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'right', labels: { font: { size: 16 } } },
    title: { display: true, text: 'Distribución de Montos por Proyecto', font: { size: 18 } },
  },
};

const Resumen = () => {
  const [totalProyectosActivos, setTotalProyectosActivos] = useState(0);
  const [totalMontoAsignado, setTotalMontoAsignado] = useState(0);
  const [totalMontoRendido, setTotalMontoRendido] = useState(0);

  useEffect(() => {
    setTotalProyectosActivos(proyectos.length);
    setTotalMontoAsignado(monto_asignado.reduce((acc, monto) => acc + monto, 0));
    setTotalMontoRendido(monto_rendido.reduce((acc, monto) => acc + monto, 0));
  }, []);

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 text-dark">Resumen Comunidad - San Pedro de Atacama</h1>
          <p className="text-muted">Resumen de la comunidad y proyectos asociados.</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="kpi-row">
        <div className="kpi-card">
          <div className="dashboard-card">
            <CardHeader>
              <div className="dashboard-card-title">Proyectos Activos</div>
            </CardHeader>
            <CardContent>
              <div className="dashboard-card-content">{totalProyectosActivos}</div>
            </CardContent>
          </div>
        </div>
        <div className="kpi-card">
          <div className="dashboard-card">
            <CardHeader>
              <div className="dashboard-card-title">Monto Asignado</div>
            </CardHeader>
            <CardContent>
              <div className="dashboard-card-content">${totalMontoAsignado.toLocaleString()}</div>
            </CardContent>
          </div>
        </div>
        <div className="kpi-card">
          <div className="dashboard-card">
            <CardHeader>
              <div className="dashboard-card-title">Monto Rendido</div>
            </CardHeader>
            <CardContent>
              <div className="dashboard-card-content">${totalMontoRendido.toLocaleString()}</div>
            </CardContent>
          </div>
        </div>
        {/* Nueva card: Monto por Rendir */}
        <div className="kpi-card">
          <div className="dashboard-card">
            <CardHeader>
              <div className="dashboard-card-title">Monto por Rendir</div>
            </CardHeader>
            <CardContent>
              <div className="dashboard-card-content" style={{ color: 'red' }}>
                ${(totalMontoAsignado - totalMontoRendido).toLocaleString()}
              </div>
            </CardContent>
          </div>
        </div>
      </div>

      {/* Gráficos */}
 <div
  className="charts-row"
  style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: '48px',
    marginBottom: '32px',
    width: '100%',
    maxWidth: '1800px',
    margin: '0 auto',
  }}
>
  <div
    className="dashboard-card"
    style={{
      flex: '0 1 800px',
      minWidth: '700px',
      maxWidth: '900px',
      minHeight: '600px',
      margin: '0 12px',
    }}
  >
    <CardHeader>
      <div className="dashboard-card-title">
        Monto Asignado vs. Monto Rendido
      </div>
    </CardHeader>
    <CardContent style={{ height: '550px', width: '100%' }}>
      <Bar data={barData} options={barOptions} height={500} width={600} />
    </CardContent>
  </div>


<div
  className="dashboard-card"
  style={{
    flex: '0 1 400px',
    minWidth: '400px',
    maxWidth: '400px',
    minHeight: '600px',
    margin: '0 12px',
  }}
>
  <CardHeader>
    <div className="dashboard-card-title">
      Distribución de Montos por Proyecto
    </div>
  </CardHeader>
  <CardContent style={{ height: '550px', display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-start' }}>
    <div style={{ width: '280px', height: '300px' }}>
      <Doughnut data={doughnutData} options={doughnutOptions} height={280} width={280} />
    </div>
  </CardContent>
  <div className="dashboard-card-title">
      Montos asignados por proyecto,
      proyectos con mas monto asignado en la parte superior.
    </div>
</div>
</div>
    </div>
  );
};

export default Resumen;