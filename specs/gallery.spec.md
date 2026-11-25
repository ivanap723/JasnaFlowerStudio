## Handoff Spec: Gallery (`gallery.html`)

### Overview
Portfolio page. Five stacked carousels with cursive titles: Weddings, Bouquets, New year decoration, Easter, Office decor. 86 photos in total.

### Layout
Each carousel: title, then a row with a left arrow, the picture window and a right arrow. Pictures are 4:3, 320px wide (240px on mobile), 16px gap.

### Content (where to edit)
`CAROUSELS` in `js/gallery.js`: `{ title, folder, count }`. Photos are `images/gallery/<folder>/1.jpg ... <count>.jpg` (1200px wide JPEGs converted from the originals). Styles: `css/gallery.css`.

### States and Interactions
| Element | State | Behavior |
|---------|-------|----------|
| Track | Idle | Moves left slowly (30px/s), loops forever, never stops |
| Picture | Hover | Scales to 104% with a white glow (like the menu links) |
| Arrow | Click | Eased jump of 340px forward or back; auto-movement continues |
| Window edges | Always | Pictures fade out/in over the outer 12% on each side |

### Responsive Behavior
Smaller pictures and arrows at <=768px. Window always fills the space between the arrows.

### Edge Cases
- **Few photos**: the set is repeated until it fills the window, so the loop has no gaps.
- **Alt text**: generated ("Weddings, photo 3"); replace with real descriptions later.
- **Reduced motion** (OS setting): automatic movement is off; arrows still work.
- **Broken image**: tile keeps its background and border.
- **Many photos**: images use `loading="lazy"`.

### Accessibility Notes
Each carousel is a `<section>` labelled with its title. Arrows are buttons with `aria-label`s. Every photo needs meaningful `alt` text. Open question: add a pause control, since constantly moving content can be hard to use for some people.
