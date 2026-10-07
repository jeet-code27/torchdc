"use client";

import * as React from "react";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";

export function StoreSearchBar() {
  const [query, setQuery] = React.useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/shop?search=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-5 pb-3">
      <form onSubmit={handleSearch} className="relative max-w-3xl mx-auto">
        <div className="relative flex items-center">
          <Search className="absolute left-5 w-5 h-5 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="What are you looking for today?"
            className="w-full h-13 pl-13 pr-6 bg-[#f4f5f4] hover:bg-[#ecefec] focus:bg-white text-gray-800 placeholder-gray-500 rounded-full border border-transparent focus:border-[#557954] focus:outline-hidden transition-all text-[15px] font-medium shadow-2xs"
          />
        </div>
      </form>
    </div>
  );
}
