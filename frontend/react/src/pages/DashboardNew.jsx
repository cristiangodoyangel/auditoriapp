import React, { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, FileCheck, AlertCircle, Plus } from '../components/ui/icons';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { getDashboardKPIs } from '../services/apiService';
import { getUser } from '../services/authService';

const kpiData = [
  {
    title: 'Fondos Recibidos',
    value: '$2.450.000.000',
    change: '+12%',
    icon: DollarSign,
    color: 'text-blue-600'
  },
  {
    title: 'Ejecutado',
    value: '$1.890.000.000',
    change: '+8%',
    icon: TrendingUp,
    color: 'text-emerald-600'
  },
  {
    title: 'Saldo Disponible',
    value: '$560.000.000',
    change: '-3%',
    icon: FileCheck,
    color: 'text-slate-600'
  },
  {
    title: '% Rendido',
    value: '77%',
    change: '+5%',
    icon: AlertCircle,
    color: 'text-amber-600'
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
  }
];

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
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-5">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Dashboard - {user?.comunidad?.nombre || 'Sistema Global'}
        </h3>
        <p className="mt-2 max-w-4xl text-sm text-gray-500">
          Resumen financiero y de proyectos
          {kpis?.periodo_actual && (
            <span> - Periodo {kpis.periodo_actual.año}</span>
          )}
        </p>
      </div>

      {/* KPIs Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Monto Total Asignado */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">$</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Monto Total Asignado
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {formatCurrency(kpis?.monto_total_asignado || 0)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Monto Gastado */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">-</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Monto Gastado
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {formatCurrency(kpis?.monto_gastado || 0)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Monto Disponible */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">+</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Monto Disponible
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {formatCurrency(kpis?.monto_disponible || 0)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Total Proyectos */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">#</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Proyectos
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {kpis?.total_proyectos || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Estados de Proyectos */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Estado de Proyectos
          </h3>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {kpis?.proyectos_pendientes || 0}
              </div>
              <div className="text-sm text-gray-500">Borradores</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {kpis?.proyectos_en_revision || 0}
              </div>
              <div className="text-sm text-gray-500">En Revisión</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {kpis?.proyectos_aprobados || 0}
              </div>
              <div className="text-sm text-gray-500">Aprobados</div>
            </div>
          </div>
        </div>
      </div>

      {/* Información del Periodo */}
      {kpis?.periodo_actual && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Información del Periodo {kpis.periodo_actual.año}
            </h3>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Monto Asignado</dt>
                <dd className="text-lg font-medium text-gray-900">
                  {formatCurrency(kpis.periodo_actual.monto_asignado)}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Saldo Anterior</dt>
                <dd className="text-lg font-medium text-gray-900">
                  {formatCurrency(kpis.periodo_actual.saldo_anterior)}
                </dd>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Información Global (Solo para Admin Consejo/Auditor) */}
      {user?.rol === 'Admin Consejo' || user?.rol === 'Auditor' ? (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Información Global
            </h3>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Total Comunidades</dt>
                <dd className="text-lg font-medium text-gray-900">
                  {kpis?.total_comunidades || 0}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Periodos Activos</dt>
                <dd className="text-lg font-medium text-gray-900">
                  {kpis?.periodos_activos || 0}
                </dd>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default Dashboard;