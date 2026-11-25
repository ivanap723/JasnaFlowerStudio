// Falling glitter that trails the mouse cursor on every page.
// Tweak the look with the settings below.
const GLITTER = {
  colors: ["#ffffff", "#ffffff", "#ffe9ec", "#f6d3d6", "#e8b4b8", "#fff3c4"],
  perMove: 2,          // new sparkles per mouse-move event (more when the mouse moves fast)
  maxCount: 350,       // safety limit
  gravity: 90,         // how fast sparkles fall (pixels per second squared)
  minSize: 1.5,
  maxSize: 4,
  minLife: 0.8,        // seconds a sparkle lasts
  maxLife: 1.8,
};

// No glitter on touch screens (no cursor) or when the visitor asked for less motion.
const hasMouse = window.matchMedia("(hover: hover)").matches;
const prefersLess = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (hasMouse && !prefersLess) startGlitter();

function startGlitter() {
  const canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  canvas.style.cssText = "position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:9999;";
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");

  function resize() {
    const ratio = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * ratio;
    canvas.height = window.innerHeight * ratio;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  }
  resize();
  window.addEventListener("resize", resize);

  const sparkles = [];
  let last = null;          // previous mouse position
  let running = false;
  let lastTime = 0;

  const random = (min, max) => min + Math.random() * (max - min);

  function addSparkle(x, y) {
    if (sparkles.length >= GLITTER.maxCount) return;
    sparkles.push({
      x: x + random(-6, 6),
      y: y + random(-6, 6),
      vx: random(-25, 25),
      vy: random(-15, 25),
      size: random(GLITTER.minSize, GLITTER.maxSize),
      life: 0,
      maxLife: random(GLITTER.minLife, GLITTER.maxLife),
      color: GLITTER.colors[Math.floor(Math.random() * GLITTER.colors.length)],
      phase: random(0, Math.PI * 2),   // makes each sparkle twinkle at its own pace
    });
  }

  document.addEventListener("mousemove", (event) => {
    // Fast movement leaves gaps, so also drop sparkles along the path since the last event.
    const distance = last ? Math.hypot(event.clientX - last.x, event.clientY - last.y) : 0;
    const count = GLITTER.perMove + Math.min(6, Math.floor(distance / 15));
    for (let i = 0; i < count; i++) {
      const t = last ? Math.random() : 1;
      addSparkle(
        last ? last.x + (event.clientX - last.x) * t : event.clientX,
        last ? last.y + (event.clientY - last.y) * t : event.clientY
      );
    }
    last = { x: event.clientX, y: event.clientY };
    if (!running) {
      running = true;
      lastTime = performance.now();
      requestAnimationFrame(frame);
    }
  });
  document.addEventListener("mouseleave", () => { last = null; });

  // Small 4-point star.
  function drawStar(x, y, size) {
    ctx.beginPath();
    ctx.moveTo(x, y - size);
    ctx.quadraticCurveTo(x, y, x + size, y);
    ctx.quadraticCurveTo(x, y, x, y + size);
    ctx.quadraticCurveTo(x, y, x - size, y);
    ctx.quadraticCurveTo(x, y, x, y - size);
    ctx.fill();
  }

  function frame(now) {
    const seconds = Math.min((now - lastTime) / 1000, 0.05);
    lastTime = now;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = sparkles.length - 1; i >= 0; i--) {
      const s = sparkles[i];
      s.life += seconds;
      if (s.life >= s.maxLife) { sparkles.splice(i, 1); continue; }
      s.vy += GLITTER.gravity * seconds;
      s.x += s.vx * seconds;
      s.y += s.vy * seconds;

      const fade = 1 - s.life / s.maxLife;
      const twinkle = 0.65 + 0.35 * Math.sin(s.life * 14 + s.phase);
      ctx.globalAlpha = fade * twinkle;
      ctx.fillStyle = s.color;
      ctx.shadowColor = s.color;
      ctx.shadowBlur = 8;
      drawStar(s.x, s.y, s.size * (0.6 + 0.4 * fade) * 1.6);
    }
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;

    if (sparkles.length > 0) requestAnimationFrame(frame);
    else running = false;     // nothing left to draw: stop until the mouse moves again
  }
}
