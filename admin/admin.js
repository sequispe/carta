const editor = document.getElementById("editor");
const estado = document.getElementById("estado");
const iframe = document.getElementById("preview");

let timeout = null;
let dataGlobal = {};
let idiomaActual = "es";

fetch("../sugerencias.json",{cache:"no-store"})
.then(r=>r.json())
.then(d=>{
  dataGlobal = d;
  editor.value = (d[idiomaActual]||[]).join("\n");
});

document.getElementById("idiomaSelect").addEventListener("change",(e)=>{
  idiomaActual = e.target.value;
  editor.value = (dataGlobal[idiomaActual]||[]).join("\n");
});

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

  dataGlobal[idiomaActual] =
    editor.value.split("\n").filter(Boolean);

  const json = JSON.stringify(dataGlobal,null,2);

  navigator.clipboard.writeText(json);

  estado.textContent = "📋 JSON copiado";
};

