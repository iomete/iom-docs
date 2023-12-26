import { MagnifyingGlass } from "@phosphor-icons/react";

function Search({ searchInputHandle }) {
  const handleChange = (e) => {
    searchInputHandle(e.target.value);
  };

  return (
    <div style={{ display: "flex", alignItems: "center", width: "100%", position: "relative" }}>
      <input
        type="text"
        onChange={handleChange}
        placeholder="Search..."
        style={{
          width: "100%",
          padding: "16px",
          borderRadius: "5px",
          border: "1px solid #ccc",
          fontSize: "18px",
        }}
      />
      <MagnifyingGlass size={18} style={{ marginRight: 12, position: "absolute", right: 0 }} />
    </div>
  );
}

export default Search;
