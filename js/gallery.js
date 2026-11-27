// Gallery page: builds one carousel per entry in CAROUSELS.
// Photos live in images/gallery/<folder>/1.jpg, 2.jpg, ... <count>.jpg.
// To add photos: copy them into the folder, then raise `count`.
// To add a carousel: add one line with a new folder.
const CAROUSELS = [
  { title: "Venčanja", folder: "weddings", count: 35 },
  { title: "Buketi", folder: "bouquets", count: 6 },
  { title: "Novogodišnja dekoracija", folder: "new-year", count: 24 },
  { title: "Uskršnja dekoracija", folder: "easter", count: 6 },
  { title: "Dekoracija poslovnog prostora", folder: "offices", count: 14 },
];

const SPEED = 30;                // pixels per second (slow)
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function itemsFor(carousel) {
  return Array.from({ length: carousel.count }, (_, i) => ({
    src: `../images/gallery/${carousel.folder}/${i + 1}.jpg`,
    alt: `${carousel.title}, photo ${i + 1}`,
  }));
}

function renderItem(item, index) {
  return `<figure class="carousel-item" data-index="${index}" tabindex="0" role="button" aria-label="Enlarge photo"><img src="${item.src}" alt="${item.alt}" loading="lazy"></figure>`;
}

function renderCarousel(carousel) {
  const section = document.createElement("section");
  section.className = "carousel";
  section.setAttribute("aria-label", carousel.title);
  section.innerHTML = `
    <h3 class="carousel-title">${carousel.title}</h3>
    <div class="carousel-row">
      <button class="carousel-arrow" type="button" aria-label="Previous pictures" data-dir="-1">&#8249;</button>
      <div class="carousel-window"><div class="carousel-track"></div></div>
      <button class="carousel-arrow" type="button" aria-label="Next pictures" data-dir="1">&#8250;</button>
    </div>`;
  document.getElementById("carousels").appendChild(section);
  startCarousel(section, itemsFor(carousel));
}

// Fills the track with repeated copies of the items so it can loop forever,
// then moves it slowly to the left. Arrows add an extra eased movement.
function startCarousel(section, items) {
  const windowEl = section.querySelector(".carousel-window");
  const track = section.querySelector(".carousel-track");
  const setHtml = items.map(renderItem).join("");
  section.photos = items;   // the lightbox uses this list to move between photos

  track.innerHTML = setHtml;
  const setWidth = track.scrollWidth + parseFloat(getComputedStyle(track).columnGap);
  const copies = Math.ceil(windowEl.clientWidth / setWidth) + 2;
  track.innerHTML = setHtml.repeat(copies);

  let offset = 0;        // current scroll position in pixels
  let pending = 0;       // pixels still to move because of arrow clicks
  let last = performance.now();

  function frame(now) {
    const seconds = (now - last) / 1000;
    last = now;
    offset += reduceMotion ? 0 : SPEED * seconds;
    const step = pending * 0.1;           // ease toward the arrow target
    pending -= step;
    offset += step;
    offset = ((offset % setWidth) + setWidth) % setWidth;   // loop in both directions
    track.style.transform = `translateX(${-offset}px)`;
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  section.querySelectorAll(".carousel-arrow").forEach((button) => {
    button.addEventListener("click", () => {
      const item = track.firstElementChild;
      const step = item.offsetWidth + parseFloat(getComputedStyle(track).columnGap);  // one picture
      pending += Number(button.dataset.dir) * step;
    });
  });
}

// ----- Lightbox: click a picture to see it large. Arrows / arrow keys move through that
// carousel's photos; X, Esc or a click outside closes it. -----
const lightbox = document.createElement("div");
lightbox.className = "lightbox";
lightbox.setAttribute("role", "dialog");
lightbox.setAttribute("aria-modal", "true");
lightbox.setAttribute("aria-label", "Enlarged photo");
lightbox.hidden = true;
lightbox.innerHTML = `
  <button class="lightbox-close" type="button" aria-label="Close">&times;</button>
  <button class="lightbox-arrow lightbox-prev" type="button" aria-label="Previous photo">&#8249;</button>
  <img class="lightbox-image" alt="">
  <button class="lightbox-arrow lightbox-next" type="button" aria-label="Next photo">&#8250;</button>`;
document.body.appendChild(lightbox);

const lightboxImage = lightbox.querySelector(".lightbox-image");
const closeButton = lightbox.querySelector(".lightbox-close");
let focusBeforeOpen = null;
let photos = [];          // photos of the carousel that was clicked
let photoIndex = 0;

function showPhoto(index) {
  photoIndex = (index + photos.length) % photos.length;   // wraps around at both ends
  lightboxImage.src = photos[photoIndex].src;
  lightboxImage.alt = photos[photoIndex].alt;
}

function openLightbox(carouselPhotos, index) {
  focusBeforeOpen = document.activeElement;
  photos = carouselPhotos;
  showPhoto(index);
  lightbox.hidden = false;
  document.body.classList.add("lightbox-open");   // stops the page scrolling behind
  closeButton.focus();
}

function closeLightbox() {
  lightbox.hidden = true;
  document.body.classList.remove("lightbox-open");
  if (focusBeforeOpen) focusBeforeOpen.focus();
}

const carouselsEl = document.getElementById("carousels");
function openFromItem(item) {
  const section = item.closest(".carousel");
  openLightbox(section.photos, Number(item.dataset.index));
}

carouselsEl.addEventListener("click", (event) => {
  const item = event.target.closest(".carousel-item");
  if (item) openFromItem(item);
});
carouselsEl.addEventListener("keydown", (event) => {
  const item = event.target.closest(".carousel-item");
  if (item && (event.key === "Enter" || event.key === " ")) {
    event.preventDefault();
    openFromItem(item);
  }
});

closeButton.addEventListener("click", closeLightbox);
lightbox.querySelector(".lightbox-prev").addEventListener("click", () => showPhoto(photoIndex - 1));
lightbox.querySelector(".lightbox-next").addEventListener("click", () => showPhoto(photoIndex + 1));
lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) closeLightbox();   // click on the dark area
});
document.addEventListener("keydown", (event) => {
  if (lightbox.hidden) return;
  if (event.key === "Escape") closeLightbox();
  if (event.key === "ArrowLeft") showPhoto(photoIndex - 1);
  if (event.key === "ArrowRight") showPhoto(photoIndex + 1);
});

CAROUSELS.forEach(renderCarousel);
