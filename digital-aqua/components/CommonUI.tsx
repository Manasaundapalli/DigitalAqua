import React, { ChangeEventHandler } from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  className,
  ...props
}) => {
  const baseStyles = "font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center justify-center transition-colors duration-150";
  
  const sizeStyles = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  const variantStyles = {
    primary: "bg-primary hover:bg-primary-dark text-white focus:ring-primary-dark",
    secondary: "bg-secondary hover:bg-secondary-dark text-primary-dark focus:ring-secondary-dark",
    danger: "bg-danger hover:bg-red-700 text-white focus:ring-red-700",
    outline: "bg-transparent hover:bg-neutral-light border border-primary text-primary hover:text-primary-dark focus:ring-primary",
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${props.disabled || isLoading ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      disabled={props.disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Spinner size="sm" className="mr-2" />
      ) : icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
};

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ label, name, error, icon, className, ...props }) => {
  return (
    <div className="w-full">
      {label && <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <div className="relative">
        {icon && <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">{icon}</div>}
        <input
          id={name}
          name={name}
          className={`block w-full px-3 py-2 border ${error ? 'border-danger' : 'border-neutral-DEFAULT'} rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm ${icon ? 'pl-10' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
};

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string | number; label: string }[];
  placeholder?: string; // Explicitly define placeholder prop
}

export const Select: React.FC<SelectProps> = ({ 
    label, 
    name, 
    error, 
    options, 
    placeholder, // Destructure placeholder
    className, 
    ...props 
}) => {
  return (
    <div className="w-full">
      {label && <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <select
        id={name}
        name={name}
        className={`block w-full px-3 py-2 border ${error ? 'border-danger' : 'border-neutral-DEFAULT'} bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm ${className}`}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>} {/* Use destructured placeholder */}
        {options.map(option => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
};

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  actions?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, className, title, actions }) => {
  return (
    <div className={`bg-white shadow-lg rounded-xl overflow-hidden ${className}`}>
      {(title || actions) && (
        <div className="px-4 py-3 sm:px-6 border-b border-neutral-light flex justify-between items-center">
          {title && <h3 className="text-lg leading-6 font-medium text-gray-900">{title}</h3>}
          {actions && <div>{actions}</div>}
        </div>
      )}
      <div className="p-4 sm:p-6">
        {children}
      </div>
    </div>
  );
};

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ size = 'md', color = 'text-primary', className }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };
  return (
    <div className={`animate-spin rounded-full border-t-2 border-b-2 border-transparent ${sizeClasses[size]} ${color} ${className}`} style={{ borderTopColor: 'currentColor', borderBottomColor: 'currentColor' }}></div>
  );
};

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full mx-4'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 transition-opacity duration-300 ease-in-out">
      <div className={`bg-white rounded-lg shadow-xl transform transition-all duration-300 ease-in-out w-full ${sizeClasses[size]} m-4`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-light">
          {title && <h3 className="text-xl font-semibold text-gray-800">{title}</h3>}
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[80vh]">
          {children}
        </div>
      </div>
    </div>
  );
};

export const FileInput: React.FC<InputProps> = ({ label, name, error, className, onChange, ...props }) => {
  return (
    <div className="w-full">
      {label && <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <input
        type="file"
        id={name}
        name={name}
        onChange={onChange}
        className={`block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-light file:text-primary-dark hover:file:bg-primary ${error ? 'border-danger' : 'border-neutral-DEFAULT'} rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
};

export const Alert: React.FC<{ type?: 'success' | 'warning' | 'danger' | 'info', message: string, className?: string }> = ({ type = 'info', message, className }) => {
  const typeStyles = {
    success: 'bg-green-100 border-green-400 text-green-700',
    warning: 'bg-yellow-100 border-yellow-400 text-yellow-700',
    danger: 'bg-red-100 border-red-400 text-red-700',
    info: 'bg-blue-100 border-blue-400 text-blue-700',
  };
  return (
    <div className={`border-l-4 p-4 rounded-md ${typeStyles[type]} ${className}`} role="alert">
      <p className="font-medium">{type.charAt(0).toUpperCase() + type.slice(1)}</p>
      <p>{message}</p>
    </div>
  );
};
