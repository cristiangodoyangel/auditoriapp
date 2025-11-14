import React, { useState, useMemo } from 'react';

/**
 * Componente reutilizable para mostrar tablas con encabezados y filas personalizadas, búsqueda y paginación.
 * @param {Array} columns - [{ key: 'nombre', label: 'Nombre' }, ...]
 * @param {Array} data - Array de objetos a mostrar.
 * @param {Function} renderCell - (row, col) => contenido personalizado (opcional)
 * @param {String} emptyText - Texto a mostrar si no hay datos.
 * @param {String} className - Clases extra para la tabla.
 * @param {Number} rowsPerPage - Cantidad de filas por página.
 */
function TablaGenerica({ columns, data, renderCell, emptyText = 'Sin datos aún', className = '', rowsPerPage = 8 }) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState(rowsPerPage);

  // Filtrar por búsqueda en cualquier columna
  const filteredData = useMemo(() => {
    if (!search) return data;
    return data.filter(row =>
      columns.some(col => {
        const value = String(row[col.key] ?? '').toLowerCase();
        return value.includes(search.toLowerCase());
      })
    );
  }, [search, data, columns]);

  // Paginación
  const totalPages = Math.max(1, Math.ceil(filteredData.length / rows));
  const pagedData = filteredData.slice((page - 1) * rows, page * rows);

  // Cambiar página si la búsqueda reduce el total
  React.useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [totalPages, page]);

  return (
    <div className={`overflow-x-auto`}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2 gap-2">
        <input
          type="text"
          className="border rounded-lg px-3 py-2 w-full md:w-1/3"
          placeholder="Buscar..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
        />
        <div className="flex gap-2 items-center">
          <label className="text-taupe font-semibold">Filas:</label>
          <select
            className="border rounded px-2 py-1"
            value={rows}
            onChange={e => { setRows(Number(e.target.value)); setPage(1); }}
          >
            <option value={8}>8</option>
            <option value={10}>10</option>
            <option value={15}>15</option>
          </select>
        </div>
      </div>
      <table
        className={`min-w-full bg-white rounded-lg shadow border border-[2px] border-[#4B2992] ${className}`}
        style={{ borderCollapse: 'collapse' }}
      >
        <thead className="bg-taupe text-white">
          <tr>
            {columns.map(col => (
              <th
                key={col.key}
                className="px-4 py-2 text-left border-b-2 border-[#4B2992] border-r border-[#4B2992]"
                style={{ borderRight: '1px solid #4B2992', borderBottom: '2px solid #4B2992' }}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {pagedData.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="text-center text-taupe py-4 border-b border-[#4B2992]">{emptyText}</td>
            </tr>
          ) : (
            pagedData.map((row, idx) => (
              <tr
                key={row.id || idx}
                className="transition-colors duration-150"
                style={{ cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F3F4F6'} // gray-100
                onMouseLeave={e => e.currentTarget.style.backgroundColor = ''}
              >
                {columns.map((col, cidx) => (
                  <td
                    key={col.key}
                    className="px-4 py-2 text-left border-b border-[#4B2992] border-r border-[#4B2992]"
                    style={{ borderRight: cidx === columns.length - 1 ? 'none' : '1px solid #4B2992', borderBottom: '1px solid #4B2992' }}
                  >
                    {renderCell ? renderCell(row, col) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
      {/* Paginación debajo de la tabla */}
      <div className="flex justify-end items-center gap-2 mt-4">
        <button
          className="px-3 py-1 rounded-lg border bg-white text-indigo font-bold disabled:opacity-50"
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
        >Anterior</button>
        <span className="text-taupe">Página {page} de {totalPages}</span>
        <button
          className="px-3 py-1 rounded-lg border bg-white text-indigo font-bold disabled:opacity-50"
          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
        >Siguiente</button>
      </div>
    </div>
  );
}

export default TablaGenerica;
