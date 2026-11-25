// Contact page: front-end only. Shows a confirmation; no message is sent yet.
// Later: replace the body of the handler with a call to your backend.
const form = document.getElementById("contact-form");
const status = document.getElementById("form-status");

form.addEventListener("submit", (event) => {
  event.preventDefault();
  status.textContent = "Thank you! We'll get back to you soon.";
  form.reset();
});
