const USER = "sequispe";
const REPO = "carta";
const FILE_PATH = "sugerencias.json";

function getToken(){
  return localStorage.getItem('github_token');
}

const editor = document.getElementById("editor");
const estado = document.getElementById("estado");
const iframe = document.getElementById("preview");

let shaActual = null;
let timeout = null;

/* ============================= */
/* CARGAR DESDE GITHUB */
/* ============================= */

async function cargarArchivo(){

  const TOKEN = getToken();
  if(!TOKEN){
    estado.textContent = "⚠️ Guardá el token primero en el admin principal";
    return;
  }

  const res = await fetch(
    `https://api.github.com/repos/${USER}/${REPO}/contents/${FILE_PATH}`,
    {
      headers:{
        Authorization:`token ${TOKEN}`
      }
    }
  );

  const data = await res.json();

  shaActual = data.sha;

  const contenido = JSON.parse(atob(data.content));

  editor.value = (contenido.es || [])
    .map(s => typeof s === "string" ? s : s.texto)
    .join("\n");
}

cargarArchivo();

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
/* GUARDAR EN GITHUB */
/* ============================= */

document.getElementById("guardar").onclick = async () => {

  const TOKEN = getToken();
  if(!TOKEN){
    estado.textContent = "⚠️ No hay token configurado";
    return;
  }

  const mensajes = editor.value
    .split("\n")
    .map(t => t.trim())
    .filter(Boolean);

  const nuevoJSON = {
    es: mensajes,
    en: mensajes,
    pt: mensajes
  };

  const contenidoCodificado = btoa(
    unescape(encodeURIComponent(JSON.stringify(nuevoJSON, null, 2)))
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
        message:"Actualizar sugerencias desde Mozo Digital",
        content:contenidoCodificado,
        sha:shaActual
      })
    }
  );

  if(res.ok){
    estado.textContent = "✅ Guardado correctamente en GitHub";
    cargarArchivo();
  }else{
    estado.textContent = "❌ Error al guardar";
  }

};
