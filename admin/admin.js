const editor = document.getElementById("editor");
const estado = document.getElementById("estado");

/* CARGAR SUGERENCIAS */
fetch("../sugerencias.json", { cache:"no-store" })
  .then(r => r.json())
  .then(data => {
    editor.value = data.es.join("\n");
  })
  .catch(() => {
    estado.textContent = "⚠️ No se pudo cargar sugerencias";
  });
