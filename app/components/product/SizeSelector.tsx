"use client";

import { useState } from "react";

interface SizeSelectorProps {
  sizes: number[];
  selectedSize: number | null;
  onSizeChange: (size: number) => void;
  label?: string;
  className?: string;
  disabled?: boolean;
}

export function SizeSelector({
  sizes,
  selectedSize,
  onSizeChange,
  label = "Size",
  className = "",
  disabled = false,
}: SizeSelectorProps) {
  const [hoveredSize, setHoveredSize] = useState<number | null>(null);

  if (!sizes || sizes.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Label */}
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-900">{label}</label>
          {selectedSize && (
            <span className="text-sm text-gray-500">{selectedSize}ml</span>
          )}
        </div>
      )}

      {/* Size Options */}
      <div className="flex flex-wrap gap-3">
        {sizes.map((size) => {
          const isSelected = selectedSize === size;
          const isHovered = hoveredSize === size;

          return (
            <button
              key={size}
              className={`
                relative min-w-[80px] px-4 py-3 rounded-lg border-2 text-center transition-all duration-200 font-medium
                ${
                  isSelected
                    ? "border-gray-900 bg-gray-900 text-white shadow-md"
                    : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:shadow-sm"
                }
                ${isHovered && !isSelected ? "border-gray-400" : ""}
                ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
              `}
              onClick={() => !disabled && onSizeChange(size)}
              onMouseEnter={() => !disabled && setHoveredSize(size)}
              onMouseLeave={() => setHoveredSize(null)}
              disabled={disabled}
            >
              <div className="text-base font-semibold">{size}ml</div>
            </button>
          );
        })}
      </div>

      {/* Selected size display */}
      {selectedSize && (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>Selected: {selectedSize}ml</span>
        </div>
      )}
    </div>
  );
}

export default SizeSelector;