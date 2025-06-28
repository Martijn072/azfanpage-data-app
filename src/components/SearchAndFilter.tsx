
import { useState } from "react";
import { Search, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SearchAndFilterProps {
  searchQuery: string;
  selectedCategory: string;
  categories: string[];
  onSearchChange: (query: string) => void;
  onCategoryChange: (category: string) => void;
  onClearFilters: () => void;
}

export const SearchAndFilter = ({
  searchQuery,
  selectedCategory,
  categories,
  onSearchChange,
  onCategoryChange,
  onClearFilters
}: SearchAndFilterProps) => {
  const [showFilters, setShowFilters] = useState(false);

  const hasActiveFilters = searchQuery || (selectedCategory && selectedCategory !== 'Alle');

  return (
    <div className="mb-6 space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-premium-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Zoek artikelen..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-premium-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-az-red focus:border-transparent bg-white"
        />
      </div>

      {/* Filter Toggle and Clear */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2"
        >
          <Filter className="w-4 h-4" />
          Filters
          {hasActiveFilters && (
            <span className="bg-az-red text-white text-xs px-2 py-0.5 rounded-full">
              {[searchQuery, selectedCategory !== 'Alle' ? selectedCategory : null].filter(Boolean).length}
            </span>
          )}
        </Button>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            onClick={onClearFilters}
            className="text-premium-gray-600 hover:text-az-red flex items-center gap-1"
          >
            <X className="w-4 h-4" />
            Wis filters
          </Button>
        )}
      </div>

      {/* Category Filters */}
      {showFilters && (
        <div className="space-y-3">
          <h3 className="font-medium text-premium-gray-800">Categorie</h3>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => onCategoryChange(category)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedCategory === category
                    ? 'bg-az-red text-white shadow-md'
                    : 'bg-white text-premium-gray-600 hover:bg-premium-gray-100 border border-premium-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
