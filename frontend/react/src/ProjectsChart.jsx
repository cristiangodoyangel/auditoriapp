// src/ProjectsChart.jsx
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Pueblo Alto', presupuesto: 500, ejecutado: 450 },
  { name: 'Valle Verde', presupuesto: 420, ejecutado: 380 },
  { name: 'Cerro Azul', presupuesto: 350, ejecutado: 290 },
  { name: 'Rio Norte', presupuesto: 280, ejecutado: 200 },
  { name: 'Las Flores', presupuesto: 600, ejecutado: 570 },
];

function ProjectsChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="presupuesto" fill="#8884d8" />
        <Bar dataKey="ejecutado" fill="#82ca9d" />
      </BarChart>
    </ResponsiveContainer>
  );
}

export default ProjectsChart;
