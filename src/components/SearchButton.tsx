"use client";

import { useState } from "react";
import { SearchModal } from "./SearchModal";

export function SearchButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        aria-label="Procurar"
        onClick={() => setIsOpen(true)}
        className="ml-2 flex items-center gap-2 rounded-full border border-gray-300 px-4 py-1.5 text-sm text-gray-500 transition-colors hover:border-gray-400 hover:text-gray-800"
      >
        <span className="hidden sm:inline">Procurar</span>
        <svg width="16" height="16" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
          <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z" />
        </svg>
      </button>

      <SearchModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
