import React from 'react';

const Spinner = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'h-5 h-5 border-2',
    md: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4',
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`animate-spin rounded-full border-t-brand-500 border-r-transparent border-b-brand-500 border-l-transparent ${sizeClasses[size]} border-solid`}
        style={{ borderColor: 'currentColor', borderTopColor: 'transparent' }}
      />
    </div>
  );
};

export default Spinner;
