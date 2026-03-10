"use client";

import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * Error Boundary for Product Images
 * 
 * Prevents image rendering errors from breaking parent components
 * CRITICAL: Ensures DELETE and other UI actions work even if images fail
 * 
 * Usage:
 * <ImageErrorBoundary>
 *   <ProductThumbnail fileId={...} productName={...} />
 * </ImageErrorBoundary>
 */
export class ImageErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): State {
    // Update state so next render shows fallback
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error but don't throw - this ensures parent components continue to work
    console.warn('Image Error Boundary caught error (non-blocking):', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Render fallback UI - a simple placeholder
      return this.props.fallback || (
        <div className="relative overflow-hidden bg-gray-100 w-full h-full">
          <div className="absolute inset-0 flex items-center justify-center">
            <svg 
              className="w-8 h-8 text-gray-300" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1} 
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
              />
            </svg>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
