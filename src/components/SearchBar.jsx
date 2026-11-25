import { useState } from "react";
import { useNavigate } from "react-router-dom";

// Searching sends the visitor to the Products page with ?search=... in the URL.
export default function SearchBar() {
  const [text, setText] = useState("");
  const navigate = useNavigate();

  function handleSubmit(event) {
    event.preventDefault();
    navigate(`/products?search=${encodeURIComponent(text.trim())}`);
  }

  return (
    <form className="search-bar" onSubmit={handleSubmit} role="search">
      <input
        type="search"
        placeholder="Search..."
        aria-label="Search products"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button type="submit">Search</button>
    </form>
  );
}
