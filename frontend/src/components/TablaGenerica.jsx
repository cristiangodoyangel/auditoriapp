import React, { useState, useMemo } from 'react';

function TablaGenerica({ columns, data, renderCell, emptyText = 'Sin datos aún', className = '', rowsPerPage = 8 }) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState(rowsPerPage);


  const filteredData = useMemo(() => {
    if (!search) return data;
    return data.filter(row =>
      columns.some(col => {
        const value = String(row[col.key] ?? '').toLowerCase();
        return value.includes(search.toLowerCase());
      })
    );
  }, [search, data, columns]);


  const totalPages = Math.max(1, Math.ceil(filteredData.length / rows));
  const pagedData = filteredData.slice((page - 1) * rows, page * rows);

  React.useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [totalPages, page]);

  return (
    <div className="w-full space-y-4">

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="form-control w-full md:w-1/3">
          <input
            type="text"
            className="input input-bordered" 
            placeholder="Buscar..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <div className="form-control w-full md:w-auto flex flex-row md:items-center gap-2 justify-end">
          <div className="input-group">
            <span className="px-3">Filas:</span>
            <select
              className="select select-bordered  md:w-15 md:h-7" 
              value={rows}
              onChange={e => { setRows(Number(e.target.value)); setPage(1); }}
            >
              <option value={8}>8</option>
              <option value={10}>10</option>
              <option value={15}>15</option>
            </select>
          </div>
        </div>
      </div>
     
      

     
      <div className={`overflow-x-auto rounded-box border border-base-content/20 bg-base-100 ${className}`}>
        
      
        <table className="table">
      
          <thead className="bg-base-200">
            <tr>
              <th>#</th> 
              {columns.map(col => (
                <th key={col.key}>{col.label}</th>
              ))}
            </tr>
          </thead>

       
          <tbody>
            {pagedData.length === 0 ? (
              <tr>
        
                <td colSpan={columns.length + 1} className="text-center p-8 text-base-content/70">
                  {emptyText}
                </td>
              </tr>
            ) : (
              pagedData.map((row, idx) => (
                <tr key={row.id || idx}>
                  <th>{(page - 1) * rows + idx + 1}</th> 
                  {columns.map(col => (
                    <td key={col.key}>
                      {renderCell ? renderCell(row, col) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>

        </table>
      </div>



      {totalPages > 1 && (
        <div className="flex justify-between items-center">
          <span className="text-sm text-base-content/70">
            Página {page} de {totalPages} (Filas {filteredData.length})
          </span>
          <div className="join">
            <button
              className="join-item btn btn-outline btn-sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Anterior
            </button>
            <button
              className="join-item btn btn-outline btn-sm"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Siguiente
            </button>
          </div>
        </div>
      )}


    </div>
  );
}

export default TablaGenerica;