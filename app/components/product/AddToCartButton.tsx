"use client";

import { useState } from "react";

interface AddToCartButtonProps {
  productId: number;
  productName?: string;
  price: number;
  isInStock: boolean;
  quantity?: number;
  maxQuantity?: number;
  isLoading?: boolean;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "secondary" | "outline";
  showQuantity?: boolean;
  onAddToCart: (productId: number, quantity: number) => void;
  onQuantityChange?: (quantity: number) => void;
  className?: string;
}

export function AddToCartButton({
  productId,
  productName,
  price,
  isInStock,
  quantity = 1,
  maxQuantity = 10,
  isLoading = false,
  disabled = false,
  size = "md",
  variant = "primary",
  showQuantity = true,
  onAddToCart,
  onQuantityChange,
  className = "",
}: AddToCartButtonProps) {
  const [localQuantity, setLocalQuantity] = useState(quantity);
  const [isAdding, setIsAdding] = useState(false);

  const handleQuantityChange = (newQuantity: number) => {
    const clampedQuantity = Math.max(1, Math.min(maxQuantity, newQuantity));
    setLocalQuantity(clampedQuantity);
    onQuantityChange?.(clampedQuantity);
  };

  const handleAddToCart = async () => {
    if (!isInStock || disabled || isLoading) return;

    setIsAdding(true);
    try {
      await onAddToCart(productId, localQuantity);
    } finally {
      setIsAdding(false);
    }
  };

  // Size classes
  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  // Variant classes
  const variantClasses = {
    primary: "bg-blue-600 text-white border-blue-600 hover:bg-blue-700 hover:border-blue-700",
    secondary: "bg-gray-600 text-white border-gray-600 hover:bg-gray-700 hover:border-gray-700",
    outline: "bg-white text-blue-600 border-blue-600 hover:bg-blue-50",
  };

  const disabledClasses = "bg-gray-300 text-gray-500 border-gray-300 cursor-not-allowed";

  const isButtonDisabled = !isInStock || disabled || isLoading || isAdding;

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Quantity Selector */}
      {showQuantity && isInStock && (
        <div className="flex items-center space-x-3">
          <label htmlFor="quantity" className="text-sm font-medium text-gray-700">
            Quantity:
          </label>
          <div className="flex items-center border border-gray-300 rounded-md">
            <button
              type="button"
              className="p-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => handleQuantityChange(localQuantity - 1)}
              disabled={localQuantity <= 1 || isButtonDisabled}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>
            <input
              id="quantity"
              type="number"
              min="1"
              max={maxQuantity}
              value={localQuantity}
              onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
              className="w-16 text-center border-0 focus:ring-0 focus:outline-none"
              disabled={isButtonDisabled}
            />
            <button
              type="button"
              className="p-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => handleQuantityChange(localQuantity + 1)}
              disabled={localQuantity >= maxQuantity || isButtonDisabled}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
          </div>
          {maxQuantity > 1 && (
            <span className="text-sm text-gray-500">
              (Max: {maxQuantity})
            </span>
          )}
        </div>
      )}

      {/* Add to Cart Button */}
      <button
        type="button"
        className={`
          w-full rounded-md border font-medium transition-colors duration-200 flex items-center justify-center space-x-2
          ${sizeClasses[size]}
          ${isButtonDisabled ? disabledClasses : variantClasses[variant]}
        `}
        onClick={handleAddToCart}
        disabled={isButtonDisabled}
      >
        {(isLoading || isAdding) && (
          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        
        {!isInStock ? (
          <span>Out of Stock</span>
        ) : (isLoading || isAdding) ? (
          <span>Adding...</span>
        ) : (
          <>
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
            </svg>
            <span>
              Add to Cart
              {showQuantity && localQuantity > 1 && ` (${localQuantity})`}
            </span>
          </>
        )}
      </button>

      {/* Price Summary */}
      {showQuantity && localQuantity > 1 && (
        <div className="text-center text-sm text-gray-600">
          Total: <span className="font-medium text-gray-900">{(price * localQuantity).toFixed(2)} DT</span>
          {productName && (
            <div className="text-xs text-gray-500 mt-1">
              {localQuantity}x {productName}
            </div>
          )}
        </div>
      )}

      {/* Stock indicator */}
      {isInStock && maxQuantity <= 5 && (
        <div className="text-center text-sm text-orange-600">
          Only {maxQuantity} left in stock!
        </div>
      )}
    </div>
  );
}

export default AddToCartButton;