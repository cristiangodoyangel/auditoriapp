import React from 'react';
import '../../dashboard-theme.css';

const Dashboard = () => {
  return (
    <main>
      {/* Encabezado */}
      <header className="dashboard-header">
        <h1>Sistema Auditoría - Comunidades Lickanantay</h1>
        <p>Panel de Control</p>
      </header>

      {/* Resumen General */}
      <section className="dashboard-panel">
        <div className="dashboard-section-title">Resumen General</div>
        <div
          style={{
            display: 'flex',
            gap: '2rem',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          <div className="dashboard-kpi">
            <div className="dashboard-kpi-title">Fondos Recibidos</div>
            <div className="dashboard-kpi-value">$0</div>
          </div>
          <div className="dashboard-kpi">
            <div className="dashboard-kpi-title">Ejecutado</div>
            <div className="dashboard-kpi-value">$0</div>
          </div>
          <div className="dashboard-kpi">
            <div className="dashboard-kpi-title">Saldo Disponible</div>
            <div className="dashboard-kpi-value">$0</div>
          </div>
          <div className="dashboard-kpi">
            <div className="dashboard-kpi-title">% Rendido</div>
            <div className="dashboard-kpi-value">0%</div>
          </div>
        </div>

        <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button className="dashboard-btn">+ Nuevo Desembolso</button>
          <button className="dashboard-btn">+ Crear Proyecto</button>
        </div>
      </section>

      {/* Ejemplo de Tabla */}
      <section className="dashboard-panel">
        <div className="dashboard-section-title">Ejemplo de Tabla</div>
        <table className="dashboard-table">
          <thead>
            <tr>
              <th>Comunidad</th>
              <th>Proyecto</th>
              <th>Monto</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Ejemplo</td>
              <td>Proyecto X</td>
              <td>$0</td>
              <td>Pendiente</td>
            </tr>
          </tbody>
        </table>
      </section>
    </main>
  );
};

export default Dashboard;
