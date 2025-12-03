import React, { forwardRef } from 'react';

const Input = forwardRef(({
    label,
    error,
    helperText,
    className = '',
    type = 'text',
    id,
    ...props
}, ref) => {
    const inputId = id || props.name;

    return (
        <div className="w-full">
            {label && (
                <label htmlFor={inputId} className="block text-sm font-medium text-slate-700 mb-1.5">
                    {label}
                </label>
            )}
            <div className="relative">
                <input
                    ref={ref}
                    id={inputId}
                    type={type}
                    className={`
            flex h-10 w-full rounded-lg border bg-white px-3 py-2 text-sm transition-all duration-200
            file:border-0 file:bg-transparent file:text-sm file:font-medium
            placeholder:text-slate-400 
            focus:outline-none focus:ring-2 focus:ring-offset-0
            disabled:cursor-not-allowed disabled:opacity-50
            ${error
                            ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                            : 'border-slate-300 focus:border-blue-500 focus:ring-blue-500/20 hover:border-slate-400'
                        }
            ${className}
          `}
                    {...props}
                />
            </div>
            {error && (
                <p className="mt-1.5 text-xs text-red-600 font-medium flex items-center animate-in slide-in-from-top-1 fade-in duration-200">
                    <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {error}
                </p>
            )}
            {helperText && !error && (
                <p className="mt-1.5 text-xs text-slate-500">{helperText}</p>
            )}
        </div>
    );
});

Input.displayName = 'Input';

export default Input;
