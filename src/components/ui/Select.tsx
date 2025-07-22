import React from "react";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: SelectOption[];
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  error?: string;
}

export default function Select({
  name,
  value,
  onChange,
  options,
  placeholder,
  required = false,
  disabled = false,
  className = "",
  error,
}: SelectProps) {
  const baseClasses = "border rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent";
  const errorClasses = error ? "border-red-500 focus:ring-red-500" : "border-gray-300";
  const disabledClasses = disabled ? "opacity-50 cursor-not-allowed" : "";
  
  return (
    <div className="flex flex-col">
      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className={`${baseClasses} ${errorClasses} ${disabledClasses} ${className}`}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <span className="text-red-500 text-sm mt-1">{error}</span>}
    </div>
  );
} 