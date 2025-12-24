// src/components/public/SearchSection.tsx
"use client";

import { Search, Loader2 } from "lucide-react";
import { useState } from "react";

interface SearchSectionProps {
  site: any;
}

export default function SearchSection({ site }: SearchSectionProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [filters, setFilters] = useState({
    type: "",
    price: "",
    bedrooms: "",
    location: "",
  });

  const handleSearch = async () => {
    if (!searchQuery.trim() && !Object.values(filters).some(v => v)) return;

    setIsSearching(true);
    try {
      // Build query parameters
      const params = new URLSearchParams();
      if (searchQuery.trim()) {
        params.append('keyword', searchQuery.trim());
      }
      if (filters.type) {
        params.append('propertyType', filters.type);
      }
      if (filters.location) {
        params.append('location', filters.location);
      }
      if (filters.bedrooms) {
        params.append('bedrooms', filters.bedrooms);
      }

      // Map price ranges to min/max
      if (filters.price) {
        switch (filters.price) {
          case 'under-5m':
            params.append('maxPrice', '5000000');
            break;
          case '5m-15m':
            params.append('minPrice', '5000000');
            params.append('maxPrice', '15000000');
            break;
          case '15m-50m':
            params.append('minPrice', '15000000');
            params.append('maxPrice', '50000000');
            break;
          case 'over-50m':
            params.append('minPrice', '50000000');
            break;
        }
      }

      const response = await fetch(`/api/properties/search?${params.toString()}`);
      const data = await response.json();

      if (response.ok) {
        console.log("Search results:", data.properties);
        // Here you could navigate to results page or update state
        // For now, just log the results
      } else {
        console.error("Search failed:", data.error);
      }
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <section className="py-12 bg-white border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Find Your Perfect Property
          </h2>
          <p className="text-gray-600">
            Search through our extensive collection of premium properties
          </p>
        </div>

        <div className="bg-gray-50 rounded-2xl shadow-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
            {/* Search Input */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Location, property type, or keywords..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:border-emerald-500 focus:outline-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
            </div>

            {/* Property Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property Type
              </label>
              <select
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:border-emerald-500 focus:outline-none"
                value={filters.type}
                onChange={(e) => handleFilterChange("type", e.target.value)}
              >
                <option value="">All Types</option>
                <option value="apartment">Apartments</option>
                <option value="house">Houses</option>
                <option value="villa">Villas</option>
                <option value="commercial">Commercial</option>
                <option value="land">Land</option>
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price Range
              </label>
              <select
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:border-emerald-500 focus:outline-none"
                value={filters.price}
                onChange={(e) => handleFilterChange("price", e.target.value)}
              >
                <option value="">Any Price</option>
                <option value="under-5m">Under KSh 5M</option>
                <option value="5m-15m">KSh 5M - 15M</option>
                <option value="15m-50m">KSh 15M - 50M</option>
                <option value="over-50m">Over KSh 50M</option>
              </select>
            </div>

            {/* Bedrooms */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bedrooms
              </label>
              <select
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:border-emerald-500 focus:outline-none"
                value={filters.bedrooms}
                onChange={(e) => handleFilterChange("bedrooms", e.target.value)}
              >
                <option value="">Any</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
                <option value="4">4+</option>
                <option value="5">5+</option>
              </select>
            </div>
          </div>

          {/* Search Button */}
          <div className="flex justify-center">
            <button
              onClick={handleSearch}
              disabled={isSearching || (!searchQuery.trim() && !Object.values(filters).some(v => v))}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
            >
              {isSearching ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Search Properties
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}