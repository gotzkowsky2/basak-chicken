import React from "react";

interface InputProps {
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: "text" | "password" | "email" | "tel";
  required?: boolean;
  disabled?: boolean;
  className?: string;
  error?: string;
}

export default function Input({
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
  disabled = false,
  className = "",
  error,
}: InputProps) {
  const baseClasses = "border rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent";
  const errorClasses = error ? "border-red-500 focus:ring-red-500" : "border-gray-300";
  const disabledClasses = disabled ? "opacity-50 cursor-not-allowed" : "";
  
  return (
    <div className="flex flex-col">
      <input
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        type={type}
        required={required}
        disabled={disabled}
        className={`${baseClasses} ${errorClasses} ${disabledClasses} ${className}`}
      />
      {error && <span className="text-red-500 text-sm mt-1">{error}</span>}
    </div>
  );
} 