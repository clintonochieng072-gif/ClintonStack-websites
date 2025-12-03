import React from "react";

interface SearchBarProps {
  onSearch: (formData: any) => void;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = Object.fromEntries(
      new FormData(e.target as HTMLFormElement).entries()
    );
    onSearch(formData);
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white shadow-lg rounded-2xl p-5 mt-8">
      <form
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
        onSubmit={handleSubmit}
      >
        <input
          type="text"
          name="keyword"
          placeholder="Search by name or location"
          className="border rounded-xl p-3"
        />
        <select name="category" className="border rounded-xl p-3">
          <option value="">All Categories</option>
          <option value="house">House</option>
          <option value="apartment">Apartment</option>
          <option value="villa">Villa</option>
          <option value="land">Land</option>
        </select>
        <input
          type="number"
          name="minPrice"
          placeholder="Min Price"
          className="border rounded-xl p-3"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white rounded-xl px-4 py-3 md:px-6 font-medium hover:bg-blue-700 transition"
        >
          Search
        </button>
      </form>
    </div>
  );
}
