import React from 'react';

const Card = ({ children }) => {
  return (
    <div className="bg-white shadow-lg rounded-lg p-4">
      {children}
    </div>
  );
};

const CardHeader = ({ children }) => {
  return <div className="font-bold">{children}</div>;
};

const CardContent = ({ children }) => {
  return <div>{children}</div>;
};

const CardTitle = ({ children }) => {
  return <h3 className="text-xl">{children}</h3>;
};

export { Card, CardHeader, CardContent, CardTitle };
