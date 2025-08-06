import React, { useCallback } from 'react';

// Add debounced search to reduce API calls
export const useDebounceSearch = (searchFunction: (query: string) => void, delay: number = 300) => {
  return useCallback((query: string) => {
    const timeoutId = setTimeout(() => {
      if (query.trim()) {
        searchFunction(query);
      }
    }, delay);
    return () => clearTimeout(timeoutId);
  }, [searchFunction, delay]);
};

// Performance optimizations placeholder
export const performanceUtils = {
  debounce: useDebounceSearch,
  memo: React.memo
};
