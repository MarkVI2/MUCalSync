"use client";

import { useState, useEffect, useRef } from "react";

interface DropdownProps {
  label: string;
  options: readonly string[];
  onSelect: (value: string) => void;
  disabled?: boolean;
  value?: string;
}

const Dropdown: React.FC<DropdownProps> = ({
  label,
  options,
  onSelect,
  disabled = false,
  value,
}: DropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full px-6 py-3 rounded-xl border 
          transition-all duration-300 
          ${
            disabled
              ? "bg-slate-100 text-slate-400 cursor-not-allowed"
              : "bg-white/80 hover:bg-[#C993BF] text-[#916C80] hover:text-white border-pink-100"
          } shadow-md backdrop-blur-sm`}>
        <div className="flex items-center justify-between">
          <span className="font-medium">{value || label}</span>
          <svg
            className={`w-5 h-5 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </button>

      {isOpen && (
        <ul
          className="absolute z-20 w-full mt-2 py-2 bg-white/90 backdrop-blur-md 
          rounded-xl border border-pink-100 shadow-xl">
          {options.map((option) => (
            <li key={option}>
              <button
                onClick={() => {
                  onSelect(option);
                  setIsOpen(false);
                }}
                className="w-full px-6 py-2 text-left transition-colors duration-200
                  text-[#C993BF] hover:bg-[#C993BF] hover:text-white">
                {option}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Dropdown;
