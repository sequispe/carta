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
    { headers:{ Authorization:`token ${TOKEN}` } }
  );

  const data = await res.json();

  shaActual = data.sha;
  const decoded = decodeURIComponent(
  escape(atob(data.content))
);

contenidoActual = JSON.parse(decoded);


  actualizarEstadosVisuales();
}

cargarArchivo();

/* ============================= */
/* ACTUALIZAR ESTADOS VISUALES */
/* ============================= */

function actualizarEstadosVisuales(){

  const idioma = idiomaSelect.value;
  const lista = contenidoActual[idioma] || [];
  const horaActual = new Date().getHours();

  editor.value = lista.map(item => {

  // 🎄 FECHA
if(item.fecha){
  const [dia, mes] = item.fecha.split("-").map(n=>parseInt(n));
  const hoy = new Date();
  const activo = dia === hoy.getDate() && mes === (hoy.getMonth()+1);

  const icono = activo ? "🎄🟢" : "🎄🔴";
  return `${icono} ${item.texto} | fecha:${item.fecha}`;
}

// ⏰ HORARIO
if(item.desde !== undefined){
  const horaActual = new Date().getHours();
  const activo = horaActual >= item.desde && horaActual < item.hasta;
  const icono = activo ? "🟢" : "🔴";
  return `${icono} ${item.texto} | ${item.desde}-${item.hasta}`;
}

  }).join("\n");
}
const emojisPorTipo = {
  cafe: ["☕","🥐","🍰","🍪","🧁","🍵","🍫","🧋"],
  fastfood: ["🍔","🍟","🌭","🍕","🥤","🧀","🔥","😋"],
  resto: ["🍷","🍽","🥩","🐟","🥗","🧀","🍾","✨"],
  bar: ["🍺","🍻","🥃","🍸","🎉","🎶","🔥","😎"],
  hotel: ["🏨","🍽","☕","🥂","✨","🛎","🌅","🌙"]
};

/* ============================= */
/* CAMBIO DE IDIOMA */
/* ============================= */

idiomaSelect.addEventListener("change", actualizarEstadosVisuales);

/* ============================= */
/* ACTUALIZACIÓN AUTOMÁTICA CADA MINUTO */
/* ============================= */

setInterval(() => {
  actualizarEstadosVisuales();
}, 60000);

/* ============================= */
/* PREVIEW EN VIVO */
/* ============================= */

editor.addEventListener("input", () => {

  clearTimeout(timeout);

  timeout = setTimeout(() => {

    const idioma = idiomaSelect.value;

    const mensajes = editor.value
      .split("\n")
      .map(t => t.trim())
      .filter(Boolean)
      .map(linea => {

        linea = linea.replace(/^🟢|^🔴|^⚪/, "").trim();

       if(linea.includes("|")){

  const [texto, condicion] = linea.split("|").map(x=>x.trim());

  // 🎄 FECHA
  if(condicion.startsWith("fecha:")){
    const fecha = condicion.replace("fecha:", "").trim();
    return { texto, fecha };
  }

  // ⏰ HORARIO
  if(condicion.includes("-")){
    const [desde, hasta] = condicion.split("-").map(x=>parseInt(x.trim()));
    return { texto, desde, hasta };
  }
}
        /* INSERTAR EMOJI EN POSICIÓN DEL CURSOR */

document.querySelectorAll(".emoji-list button").forEach(btn => {
  btn.addEventListener("click", () => {

    const emoji = btn.textContent;

    const start = editor.selectionStart;
    const end = editor.selectionEnd;

    editor.value =
      editor.value.substring(0, start) +
      emoji +
      editor.value.substring(end);

    editor.focus();
    editor.selectionStart = editor.selectionEnd = start + emoji.length;

    editor.dispatchEvent(new Event("input")); // actualiza preview
  });
});


          const [texto, rango] = linea.split("|").map(x=>x.trim());
          const [desde, hasta] = rango.split("-").map(x=>parseInt(x.trim()));
          return { texto, desde, hasta };
        }

        return linea;
      });

    contenidoActual[idioma] = mensajes;

    iframe.contentWindow.postMessage(
      mensajes.map(m => typeof m === "string" ? m : m.texto),
      "*"
    );

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
        message:`Actualizar sugerencias (${idiomaSelect.value})`,
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
