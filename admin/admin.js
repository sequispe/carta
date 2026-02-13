const USER = "sequispe";
const REPO = "carta";
const FILE_PATH = "sugerencias.json";

function getToken(){
  return localStorage.getItem('github_token');
}

const editor = document.getElementById("editor");
const estado = document.getElementById("estado");
const idiomaSelect = document.getElementById("idiomaSelect");
const iframe = document.getElementById("preview");

let shaActual = null;
let contenidoActual = {};
let timeout = null;

/* ============================= */
/* CARGAR DESDE GITHUB */
/* ============================= */

async function cargarArchivo(){

  const TOKEN = getToken();
  if(!TOKEN){
    estado.textContent = "⚠️ Guardá el token primero";
    return;
  }

  const res = await fetch(
    `https://api.github.com/repos/${USER}/${REPO}/contents/${FILE_PATH}`,
    {
      headers:{ Authorization:`token ${TOKEN}` }
    }
  );

  const data = await res.json();

  shaActual = data.sha;
  contenidoActual = JSON.parse(atob(data.content));

  cargarIdiomaEnEditor();
}

cargarArchivo();

/* ============================= */
/* CARGAR IDIOMA EN EDITOR */
/* ============================= */

function cargarIdiomaEnEditor(){
  const idioma = idiomaSelect.value;
  const lista = contenidoActual[idioma] || [];

  editor.value = lista
    .map(s => typeof s === "string" ? s : s.texto)
    .join("\n");
}

idiomaSelect.addEventListener("change", cargarIdiomaEnEditor);

/* ============================= */
/* PREVIEW EN VIVO */
/* ============================= */

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

/* ============================= */
/* GUARDAR */
/* ============================= */

document.getElementById("guardar").onclick = async () => {

  const TOKEN = getToken();
  if(!TOKEN){
    estado.textContent = "⚠️ No hay token";
    return;
  }

  const idioma = idiomaSelect.value;

  const mensajes = editor.value
    .split("\n")
    .map(t => t.trim())
    .filter(Boolean);

  contenidoActual[idioma] = mensajes;

  const contenidoCodificado = btoa(
    unescape(encodeURIComponent(JSON.stringify(contenidoActual, null, 2)))
  );

  const res = await fetch(
    `https://api.github.com/repos/${USER}/${REPO}/contents/${FILE_PATH}`,
    {
      method:"PUT",
      headers:{
        Authorization:`token ${TOKEN}`,
        "Content-Type":"application/json"
      },
      body:JSON.stringify({
        message:`Actualizar sugerencias (${idioma})`,
        content:contenidoCodificado,
        sha:shaActual
      })
    }
  );

  if(res.ok){
    estado.textContent = "✅ Guardado por idioma";
    cargarArchivo();
  }else{
    estado.textContent = "❌ Error al guardar";
  }

};
