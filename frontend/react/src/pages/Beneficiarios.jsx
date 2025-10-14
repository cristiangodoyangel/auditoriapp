import React, { useEffect, useMemo } from 'react';
import '../index.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'datatables.net-bs5/css/dataTables.bootstrap5.min.css';
import $ from 'jquery';
import 'datatables.net-bs5';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader } from '../ui/card';

const comunidades = ['San Pedro', 'Toconao', 'Socaire', 'Talabre', 'Camote', 'Peine', 'Machuca', 'Río Grande'];
const nombres = ['Juan', 'María', 'Cristian', 'Ana', 'Luis', 'Pedro', 'Sofía', 'Carlos', 'Elena', 'Miguel'];
const apellidos = ['Pérez', 'González', 'Godoy', 'Rojas', 'Mamani', 'López', 'Ramírez', 'Torres', 'Vega', 'Castro'];

const beneficiariosRandom = Array.from({ length: 30 }, (_, i) => ({
    id: i + 1,
    nombre: nombres[Math.floor(Math.random() * nombres.length)],
    apellido: apellidos[Math.floor(Math.random() * apellidos.length)],
    comunidad: comunidades[Math.floor(Math.random() * comunidades.length)],
    activo: Math.random() > 0.5,
}));

const Beneficiarios = () => {
    // Calculate statistics for charts
    const chartData = useMemo(() => {
        // Beneficiarios por comunidad
        const comunidadStats = comunidades.map(comunidad => {
            const beneficiariosComunidad = beneficiariosRandom.filter(b => b.comunidad === comunidad);
            const activos = beneficiariosComunidad.filter(b => b.activo).length;
            const inactivos = beneficiariosComunidad.length - activos;
            
            return {
                comunidad: comunidad.length > 8 ? comunidad.substring(0, 8) + '...' : comunidad,
                total: beneficiariosComunidad.length,
                activos,
                inactivos
            };
        });

        // Distribución activos vs inactivos
        const activosTotal = beneficiariosRandom.filter(b => b.activo).length;
        const inactivosTotal = beneficiariosRandom.length - activosTotal;
        
        const statusDistribution = [
            { name: 'Activos', value: activosTotal, color: '#7b4d1d' },
            { name: 'Inactivos', value: inactivosTotal, color: '#c8a97e' }
        ];

        return { comunidadStats, statusDistribution };
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            if ($.fn.dataTable.isDataTable('#beneficiariosTable')) {
                $('#beneficiariosTable').DataTable().clear().destroy();
            }
            $('#beneficiariosTable').DataTable({
                language: {
                    url: '/public/es-ES.json',
                },
                pageLength: 10,
                destroy: true,
            });
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="container py-4">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 className="h3 text-dark">Beneficiarios</h1>
                    <p className="text-muted">Gestión y análisis de socios beneficiarios por comunidad.</p>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="kpi-row">
                <div className="kpi-card">
                    <div className="dashboard-card">
                        <div className="dashboard-card-title">Total Beneficiarios</div>
                        <div className="dashboard-card-content">{beneficiariosRandom.length}</div>
                    </div>
                </div>
                <div className="kpi-card">
                    <div className="dashboard-card">
                        <div className="dashboard-card-title">Socios Activos</div>
                        <div className="dashboard-card-content text-success">
                            {beneficiariosRandom.filter(b => b.activo).length}
                        </div>
                    </div>
                </div>
                <div className="kpi-card">
                    <div className="dashboard-card">
                        <div className="dashboard-card-title">Socios Inactivos</div>
                        <div className="dashboard-card-content text-warning">
                            {beneficiariosRandom.filter(b => !b.activo).length}
                        </div>
                    </div>
                </div>
                <div className="kpi-card">
                    <div className="dashboard-card">
                        <div className="dashboard-card-title">Comunidades</div>
                        <div className="dashboard-card-content">{comunidades.length}</div>
                    </div>
                </div>
            </div>

            {/* Interactive Charts */}
            <div className="charts-row" style={{ display: 'flex', gap: '24px', marginBottom: '32px' }}>
                {/* Distribución por Status */}
                <div className="dashboard-card" style={{ flex: 1 }}>
                    <CardHeader>
                        <div className="dashboard-card-title">Distribución de Status</div>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={chartData.statusDistribution}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    dataKey="value"
                                    label={({name, value, percent}) => `${name}: ${value} (${(percent * 100).toFixed(1)}%)`}
                                >
                                    {chartData.statusDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => [`${value} socios`, '']} />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </div>

                {/* Beneficiarios por Comunidad */}
                <div className="dashboard-card" style={{ flex: 1 }}>
                    <CardHeader>
                        <div className="dashboard-card-title">Beneficiarios por Comunidad</div>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={chartData.comunidadStats}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis 
                                    dataKey="comunidad" 
                                    angle={-45}
                                    textAnchor="end"
                                    height={80}
                                />
                                <YAxis />
                                <Tooltip 
                                    formatter={(value, name) => [`${value} socios`, name === 'activos' ? 'Activos' : name === 'inactivos' ? 'Inactivos' : 'Total']}
                                />
                                <Legend />
                                <Bar dataKey="activos" fill="#7b4d1d" name="Activos" />
                                <Bar dataKey="inactivos" fill="#c8a97e" name="Inactivos" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </div>
            </div>
            
            <div className="dashboard-card dashboard-card-nohover" style={{ marginTop: '24px' }}>
                <div className="dashboard-card-title">Listado de Socios</div>
                <div className="dashboard-card-content2">
                    <div className="table-responsive">
                        <table id="beneficiariosTable" className="table table-bordered table-striped table-hover align-middle">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Nombre</th>
                                    <th>Apellido</th>
                                    <th>Comunidad</th>
                                    <th>Socio Activo</th>
                                </tr>
                            </thead>
                            <tbody>
                                {beneficiariosRandom.map((b, idx) => (
                                    <tr key={b.id}>
                                        <td>{idx + 1}</td>
                                        <td>{b.nombre}</td>
                                        <td>{b.apellido}</td>
                                        <td>{b.comunidad}</td>
                                        <td>
                                            <span
                                                className="badge"
                                                style={{
                                                    backgroundColor: b.activo ? '#7b4d1d' : '#c8a97e',
                                                    color: b.activo ? 'white' : '#4b2c09',
                                                    fontWeight: 'bold'
                                                }}
                                            >
                                                {b.activo ? 'Sí' : 'No'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Beneficiarios;