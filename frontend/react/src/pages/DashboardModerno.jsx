import React, { useState, useEffect } from 'react';
import { getDashboardKPIs } from '../services/apiService';
import { getUser } from '../services/authService';

const Dashboard = () => {
  const [kpis, setKpis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const user = getUser();

  useEffect(() => {
    loadKPIs();
  }, []);

  const loadKPIs = async () => {
    try {
      const data = await getDashboardKPIs();
      setKpis(data);
    } catch (err) {
      setError('Error al cargar los datos del dashboard');
      console.error('Error fetching KPIs:', err);
    } finally {
      setLoading(false);
    }
  };

  // Iconos SVG
  const DollarIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
    </svg>
  );

  const TrendingUpIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  );

  const FileCheckIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );

  const AlertIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );

  const PlusIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  );

  const kpiData = [
    {
      title: 'Fondos Recibidos',
      value: '$2.450.000.000',
      change: '+12%',
      icon: DollarIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Ejecutado',
      value: '$1.890.000.000',
      change: '+8%',
      icon: TrendingUpIcon,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50'
    },
    {
      title: 'Saldo Disponible',
      value: '$560.000.000',
      change: '-3%',
      icon: FileCheckIcon,
      color: 'text-slate-600',
      bgColor: 'bg-slate-50'
    },
    {
      title: '% Rendido',
      value: '77%',
      change: '+5%',
      icon: AlertIcon,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50'
    }
  ];

  const executionData = [
    { comunidad: 'Pueblo Alto', ejecutado: 450, presupuesto: 500 },
    { comunidad: 'Valle Verde', ejecutado: 380, presupuesto: 420 },
    { comunidad: 'Cerro Azul', ejecutado: 290, presupuesto: 350 },
    { comunidad: 'Rio Norte', ejecutado: 200, presupuesto: 280 },
    { comunidad: 'Las Flores', ejecutado: 570, presupuesto: 600 },
  ];

  const projectTypes = [
    { name: 'Becas', value: 45, color: '#3B82F6' },
    { name: 'Vehículos', value: 25, color: '#10B981' },
    { name: 'Terrenos', value: 20, color: '#F59E0B' },
    { name: 'Otros', value: 10, color: '#6B7280' },
  ];

  const pendingReports = [
    {
      comunidad: 'Pueblo Alto',
      proyecto: 'Becas Universitarias 2024',
      monto: '$45.000.000',
      documentos: 12,
      estado: 'Pendiente',
      vencimiento: '2024-01-15'
    },
    {
      comunidad: 'Valle Verde',
      proyecto: 'Compra Camioneta',
      monto: '$28.000.000',
      documentos: 8,
      estado: 'En Revisión',
      vencimiento: '2024-01-20'
    },
    {
      comunidad: 'Cerro Azul',
      proyecto: 'Terreno Comunitario',
      monto: '$85.000.000',
      documentos: 15,
      estado: 'Pendiente',
      vencimiento: '2024-01-25'
    },
    {
      comunidad: 'Rio Norte',
      proyecto: 'Equipamiento Médico',
      monto: '$32.500.000',
      documentos: 9,
      estado: 'Aprobado',
      vencimiento: '2024-02-01'
    },
    {
      comunidad: 'Las Flores',
      proyecto: 'Centro Comunitario',
      monto: '$120.000.000',
      documentos: 23,
      estado: 'En Revisión',
      vencimiento: '2024-02-10'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Panel de Control</h1>
            <p className="text-lg text-slate-600">Resumen general de fondos y proyectos comunitarios</p>
            <div className="mt-2 text-sm text-slate-500">
              Última actualización: {new Date().toLocaleDateString('es-ES')}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <button className="inline-flex items-center justify-center px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
              <PlusIcon />
              <span className="ml-2">Nuevo Desembolso</span>
            </button>
            <button className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
              <PlusIcon />
              <span className="ml-2">Crear Proyecto</span>
            </button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpiData.map((kpi, index) => {
            const Icon = kpi.icon;
            return (
              <div key={index} className="bg-white rounded-xl border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <div className="flex items-center justify-between p-6 pb-3">
                  <h3 className="text-sm font-medium text-slate-600">{kpi.title}</h3>
                  <div className={`p-3 rounded-lg ${kpi.bgColor} ring-2 ring-white`}>
                    <Icon className={`w-5 h-5 ${kpi.color}`} />
                  </div>
                </div>
                <div className="px-6 pb-6">
                  <div className="text-3xl font-bold text-slate-900 mb-1">{kpi.value}</div>
                  <p className="text-sm text-slate-600">
                    <span className={`font-semibold ${kpi.change.startsWith('+') ? 'text-emerald-600' : 'text-red-600'}`}>
                      {kpi.change}
                    </span>
                    {' '}respecto al año anterior
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Execution by Community */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-slate-900">Ejecución por Comunidad</h2>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                {executionData.map((item, index) => (
                  <div key={index} className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-slate-700">{item.comunidad}</span>
                      <span className="text-sm text-slate-600 font-medium">
                        ${item.ejecutado}M / ${item.presupuesto}M
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500 ease-out" 
                        style={{ width: `${(item.ejecutado / item.presupuesto) * 100}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-slate-500">
                      {Math.round((item.ejecutado / item.presupuesto) * 100)}% ejecutado
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Project Types */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-slate-900">Tipos de Proyecto</h2>
            </div>
            <div className="p-6">
              <div className="flex justify-center mb-8">
                <div className="relative w-48 h-48">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    {projectTypes.map((type, index) => {
                      const angle = (type.value / 100) * 360;
                      const prevAngle = projectTypes.slice(0, index).reduce((sum, t) => sum + (t.value / 100) * 360, 0);
                      const radius = 35;
                      const startX = 50 + radius * Math.cos((prevAngle * Math.PI) / 180);
                      const startY = 50 + radius * Math.sin((prevAngle * Math.PI) / 180);
                      const endX = 50 + radius * Math.cos(((prevAngle + angle) * Math.PI) / 180);
                      const endY = 50 + radius * Math.sin(((prevAngle + angle) * Math.PI) / 180);
                      const largeArcFlag = angle > 180 ? 1 : 0;
                      
                      return (
                        <path
                          key={index}
                          d={`M 50 50 L ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY} Z`}
                          fill={type.color}
                          className="hover:opacity-80 transition-opacity cursor-pointer"
                        />
                      );
                    })}
                  </svg>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {projectTypes.map((type, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full flex-shrink-0" 
                      style={{ backgroundColor: type.color }}
                    />
                    <span className="text-sm font-medium text-slate-700">{type.name}</span>
                    <span className="text-sm font-bold text-slate-900">({type.value}%)</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Pending Reports Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-slate-900">Rendiciones Pendientes</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Comunidad</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Proyecto</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Monto</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Documentos</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Estado</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Vencimiento</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pendingReports.map((report, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{report.comunidad}</td>
                    <td className="px-6 py-4 text-slate-700">{report.proyecto}</td>
                    <td className="px-6 py-4 font-bold text-emerald-600">{report.monto}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {report.documentos} archivos
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        report.estado === 'Pendiente' 
                          ? 'bg-red-100 text-red-800' 
                          : report.estado === 'Aprobado'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {report.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{report.vencimiento}</td>
                    <td className="px-6 py-4">
                      <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                        Revisar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Error de Conexión
                </h3>
                <p className="mt-1 text-sm text-red-700">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;