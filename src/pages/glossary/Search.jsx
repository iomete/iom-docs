import { MagnifyingGlass } from "@phosphor-icons/react";

function Search({ searchInputHandle }) {
  const handleChange = (e) => {
    searchInputHandle(e.target.value);
  };

  return (
    <div className="relative text-gray-600 w-full">
      <input
        type="text"
        onChange={handleChange}
        placeholder="Search..."
        className="bg-white h-12 px-5 pr-10 rounded-md text-sm focus:outline-none w-full"
      />
      <span className="absolute right-0 top-0 mt-3 mr-4">
        <MagnifyingGlass size={22} />
      </span>
    </div>
  );
}

export default Search;
