import React from 'react';

const Card = ({ children, className = '', noPadding = false, ...props }) => {
    return (
        <div
            className={`bg-white rounded-xl border border-slate-200 shadow-card hover:shadow-card-hover transition-shadow duration-300 ${noPadding ? '' : 'p-6'} ${className}`}
            {...props}
        >
            {children}
        </div>
    );
};

export const CardHeader = ({ children, className = '' }) => (
    <div className={`mb-4 ${className}`}>
        {children}
    </div>
);

export const CardTitle = ({ children, className = '' }) => (
    <h3 className={`text-lg font-semibold text-slate-900 ${className}`}>
        {children}
    </h3>
);

export const CardContent = ({ children, className = '' }) => (
    <div className={className}>
        {children}
    </div>
);

export default Card;
