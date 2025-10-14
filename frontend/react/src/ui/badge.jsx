import React from 'react';

const Badge = ({ children, variant }) => {
  const variantClasses = variant === "outline" ? "border border-gray-300 text-gray-600" : "bg-green-500 text-white";
  return (
    <span className={`px-2 py-1 text-xs rounded-full ${variantClasses}`}>
      {children}
    </span>
  );
};

export { Badge };
