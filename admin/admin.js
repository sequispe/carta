const editor = document.getElementById("editor");
const estado = document.getElementById("estado");
const iframe = document.getElementById("preview");

let timeout = null;

/* CARGAR SUGERENCIAS */
fetch("../sugerencias.json", { cache: "no-store" })
  .then(r => r.json())
  .then(data => {
    editor.value = data.es.join("\n");
  });

/* PREVIEW EN VIVO */
editor.addEventListener("input", () => {
  clearTimeout(timeout);

  timeout = setTimeout(() => {

    const mensajes = editor.value
      .split("\n")
      .map(t => t.trim())
      .filter(Boolean);

    iframe.contentWindow.postMessage(mensajes, "*");

    estado.textContent = "👁 Preview en vivo";

  }, 300);
});

/* CUANDO EL INDEX AVISA QUE ESTÁ LISTO */
window.addEventListener("message", e => {

  if (e.data === "ready") {

    iframe.contentWindow.postMessage(
      editor.value.split("\n").filter(Boolean),
      "*"
    );

  }

});

/* BOTÓN GUARDAR */
document.getElementById("guardar").onclick = () => {

  const data = {
    es: editor.value.split("\n").filter(Boolean)
  };

  const json = JSON.stringify(data, null, 2);

  navigator.clipboard.writeText(json);

  estado.textContent = "📋 JSON copiado · pegalo en sugerencias.json";

};
