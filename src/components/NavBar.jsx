import { NavLink } from "react-router-dom";
import SearchBar from "./SearchBar.jsx";

// To add a new page to the menu, add one line here.
const links = [
  { to: "/", label: "Home" },
  { to: "/gallery", label: "Gallery" },
  { to: "/products", label: "Products" },
  { to: "/services", label: "Services" },
  { to: "/contact", label: "Contact" },
];

export default function NavBar() {
  return (
    <nav className="nav-bar">
      <ul className="nav-links">
        {links.map(({ to, label }) => (
          <li key={to}>
            <NavLink to={to} end>{label}</NavLink>
          </li>
        ))}
      </ul>
      <SearchBar />
    </nav>
  );
}
