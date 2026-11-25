// Renders the shared header + menu bar on every page.
// To add a page to the menu, add one line to MENU_ITEMS.
const SITE_NAME = "Jasna Flower Studio";

const MENU_ITEMS = [
  { label: "Home", href: "index.html" },
  { label: "Gallery", href: "gallery.html" },
  { label: "Products", href: "products.html" },
  { label: "Services", href: "services.html" },
  { label: "Contact", href: "contact.html" },
];

function currentPage() {
  return location.pathname.split("/").pop() || "index.html";
}

function renderMenuLinks() {
  return MENU_ITEMS.map((item) => {
    const current = item.href === currentPage() ? ' aria-current="page"' : "";
    return `<li><a href="${item.href}"${current}>${item.label}</a></li>`;
  }).join("");
}

function renderHeader() {
  const searchTerm = new URLSearchParams(location.search).get("q") || "";
  document.getElementById("site-header").innerHTML = `
    <header>
      <h1 class="site-title">${SITE_NAME}</h1>
      <nav class="menu-bar" aria-label="Main">
        <ul class="menu-links">${renderMenuLinks()}</ul>
        <form class="search-form" role="search" action="products.html" method="get">
          <input type="search" name="q" aria-label="Search products" placeholder="Search…">
          <button class="button" type="submit">Search</button>
        </form>
      </nav>
    </header>`;
  document.querySelector(".search-form input").value = searchTerm;
}

// Big page titles (Home, Gallery) start exactly under the "Products" menu link.
// CSS reads the position from --title-left. On phones the menu wraps, so we skip it there.
function alignTitleWithProductsLink() {
  const link = document.querySelector('.menu-links a[href="products.html"]');
  if (!link) return;
  const isWide = window.innerWidth > 768;
  document.documentElement.style.setProperty("--title-left", isWide ? `${link.getBoundingClientRect().left}px` : "");
}

renderHeader();
alignTitleWithProductsLink();
window.addEventListener("resize", alignTitleWithProductsLink);
document.fonts.ready.then(alignTitleWithProductsLink);   // menu moves a little once the web font loads
