import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TrendingUp, DollarSign, FileCheck, AlertCircle, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Dashboard = () => {
  const [totalProyectos, setTotalProyectos] = useState(0);
  const [totalMovimientos, setTotalMovimientos] = useState(0);
  const [totalGastos, setTotalGastos] = useState(0);
  const [totalBeneficiarios, setTotalBeneficiarios] = useState(0);
  const [totalUsuarios, setTotalUsuarios] = useState(0);
  const [totalComunidades, setTotalComunidades] = useState(0);

  const [executionData, setExecutionData] = useState([]);
  const [projectTypes, setProjectTypes] = useState([]);
  const [pendingReports, setPendingReports] = useState([]);

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/proyectos/')
      .then(response => setTotalProyectos(response.data.length))
      .catch(error => console.error('Error al obtener proyectos:', error));

    axios.get('http://127.0.0.1:8000/api/movimientos/')
      .then(response => setTotalMovimientos(response.data.length))
      .catch(error => console.error('Error al obtener movimientos:', error));

    axios.get('http://127.0.0.1:8000/api/gastos/')
      .then(response => setTotalGastos(response.data.reduce((acc, gasto) => acc + gasto.monto, 0)))
      .catch(error => console.error('Error al obtener gastos:', error));

    axios.get('http://127.0.0.1:8000/api/beneficiarios/')
      .then(response => setTotalBeneficiarios(response.data.length))
      .catch(error => console.error('Error al obtener beneficiarios:', error));

    axios.get('http://127.0.0.1:8000/api/usuarios/')
      .then(response => setTotalUsuarios(response.data.length))
      .catch(error => console.error('Error al obtener usuarios:', error));

    axios.get('http://127.0.0.1:8000/api/comunidades/')
      .then(response => setTotalComunidades(response.data.length))
      .catch(error => console.error('Error al obtener comunidades:', error));

    axios.get('http://127.0.0.1:8000/api/ejecucion-comunidades/')
      .then(response => setExecutionData(response.data))
      .catch(error => console.error('Error al obtener ejecución por comunidad:', error));

    axios.get('http://127.0.0.1:8000/api/tipos-proyecto/')
      .then(response => setProjectTypes(response.data))
      .catch(error => console.error('Error al obtener tipos de proyectos:', error));

    axios.get('http://127.0.0.1:8000/api/reportes-pendientes/')
      .then(response => setPendingReports(response.data))
      .catch(error => console.error('Error al obtener reportes pendientes:', error));
  }, []);

  if (!totalProyectos || !totalMovimientos || !totalGastos || !totalBeneficiarios || !totalUsuarios || !totalComunidades) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 text-dark"></h1>
          <p className="text-muted"></p>
        </div>
        <div className="d-flex gap-3">
          <Button className="btn btn-success">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Desembolso
          </Button>
          <Button className="btn btn-primary">
            <Plus className="w-4 h-4 mr-2" />
            Crear Proyecto
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="kpi-row">
        <div className="kpi-card">
          <div className="dashboard-card">
            <CardHeader>
              <div className="dashboard-card-title">Total Proyectos</div>
            </CardHeader>
            <CardContent>
              <div className="dashboard-card-content">{totalProyectos}</div>
            </CardContent>
          </div>
        </div>
        <div className="kpi-card">
          <div className="dashboard-card">
            <CardHeader>
              <div className="dashboard-card-title">Total Movimientos</div>
            </CardHeader>
            <CardContent>
              <div className="dashboard-card-content">{totalMovimientos}</div>
            </CardContent>
          </div>
        </div>
        <div className="kpi-card">
          <div className="dashboard-card">
            <CardHeader>
              <div className="dashboard-card-title">Total Gastos</div>
            </CardHeader>
            <CardContent>
              <div className="dashboard-card-content">${totalGastos.toLocaleString()}</div>
            </CardContent>
          </div>
        </div>
        <div className="kpi-card">
          <div className="dashboard-card">
            <CardHeader>
              <div className="dashboard-card-title">Total Comunidades</div>
            </CardHeader>
            <CardContent>
              <div className="dashboard-card-content">{totalComunidades}</div>
            </CardContent>
          </div>
        </div>
      </div>

       
      {/* Charts Row */}
      <div className="charts-row" style={{ display: 'flex', gap: '24px', marginBottom: '32px' }}>
        <div className="dashboard-card" style={{ flex: 1 }}>
          <CardHeader>
            <div className="dashboard-card-title">Ejecución por Comunidad</div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={executionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="comunidad" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value}M`, '']} />
                <Bar dataKey="presupuesto" fill="#E2E8F0" name="Presupuesto" />
                <Bar dataKey="ejecutado" fill="#3B82F6" name="Ejecutado" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </div>

        <div className="dashboard-card" style={{ flex: 1 }}>
          <CardHeader>
            <div className="dashboard-card-title">Tipos de Proyecto</div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={projectTypes}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="value"
                >
                  {projectTypes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, '']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="d-flex flex-wrap gap-2 mt-3">
              {projectTypes.map((type, index) => (
                <div key={index} className="d-flex align-items-center gap-2">
                  <div className="rounded-circle" style={{ width: '15px', height: '15px', backgroundColor: type.color }} />
                  <span className="text-muted small">{type.name} ({type.value}%)</span>
                </div>
              ))}
            </div>
          </CardContent>
        </div>
      </div>

      {/* Pending Reports Table */}
      <div className="dashboard-card" style={{ marginTop: '24px' }}>
        <CardHeader>
          <div className="dashboard-card-title">Rendiciones Pendientes</div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Comunidad</TableHead>
                <TableHead>Proyecto</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Documentos</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Vencimiento</TableHead>
                <TableHead>Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingReports.map((report, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{report.comunidad}</TableCell>
                  <TableCell>{report.proyecto}</TableCell>
                  <TableCell>{report.monto}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{report.documentos} archivos</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={report.estado === 'Pendiente' ? 'destructive' : 'secondary'}>
                      {report.estado}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted">{report.vencimiento}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">Revisar</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </div>
  
    </div>
  );
}

export default Dashboard;
