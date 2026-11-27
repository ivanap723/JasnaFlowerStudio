// Workshop signup page: front-end only. Shows a confirmation; nothing is sent yet.
// Later: replace the body of the handler with a call to your backend.
const form = document.getElementById("signup-form");
const status = document.getElementById("form-status");

form.addEventListener("submit", (event) => {
  event.preventDefault();
  status.textContent = "Hvala na prijavi! Javićemo vam se uskoro.";
  form.reset();
});
