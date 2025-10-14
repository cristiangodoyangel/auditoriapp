// src/ui/table.jsx

import React from 'react';

const Table = ({ children }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full table-auto">{children}</table>
    </div>
  );
};

const TableHeader = ({ children }) => {
  return (
    <thead className="bg-gray-100">
      <tr>{children}</tr>
    </thead>
  );
};

const TableBody = ({ children }) => {
  return <tbody>{children}</tbody>;
};

const TableRow = ({ children }) => {
  return <tr>{children}</tr>;
};

const TableHead = ({ children }) => {
  return (
    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">
      {children}
    </th>
  );
};

const TableCell = ({ children }) => {
  return <td className="px-4 py-2 text-sm text-gray-600">{children}</td>;
};

export { Table, TableBody, TableCell, TableHead, TableHeader, TableRow };
