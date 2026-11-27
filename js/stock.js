// Shared by the order pages: loads colors/bases and their stock status from the server.
// Returns [{ value, label, available, image }] for one category ("color" or "base").
// Photos follow one naming rule: images/order/<category>-<value>.jpg (e.g. color-crvena.jpg).
async function loadOptions(category) {
  const response = await fetch("/api/options");
  if (!response.ok) throw new Error(`Options request failed: ${response.status}`);
  const all = await response.json();
  return all
    .filter((o) => o.category === category)
    .map((o) => ({ ...o, image: `../images/order/${category}-${o.value}.jpg` }));
}
