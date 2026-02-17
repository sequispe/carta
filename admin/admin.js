const USER = "sequispe";
const REPO = "carta";
const FILE_PATH = "sugerencias.json";

/* ============================= */
/* TOKEN */
/* ============================= */

function getToken(){
  return localStorage.getItem("github_token");
}

/* ============================= */
/* ELEMENTOS */
/* ============================= */

const editor = document.getElementById("editor");
const estado = document.getElementById("estado");
const idiomaSelect = document.getElementById("idiomaSelect");
const iframe = document.getElementById("preview");
const nombreLocalInput = document.getElementById("nombreLocal");

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

  // Asegurar estructura mínima
  contenidoActual.config = contenidoActual.config || {};
  contenidoActual.es = contenidoActual.es || [];
  contenidoActual.en = contenidoActual.en || [];
  contenidoActual.pt = contenidoActual.pt || [];

  nombreLocalInput.value =
    contenidoActual.config.nombreLocal || "";

  actualizarEstadosVisuales();
}

cargarArchivo();

/* ============================= */
/* ACTUALIZAR ESTADOS VISUALES */
/* ============================= */

function actualizarEstadosVisuales(){

  const idioma = idiomaSelect.value;
  const lista = contenidoActual[idioma] || [];
  const hoy = new Date();
  const horaActual = hoy.getHours();

  editor.value = lista.map(item => {

    // STRING SIMPLE
    if(typeof item === "string"){
      return `⚪ ${item}`;
    }

    // 🎄 FECHA
    if(item.fecha){
      const [dia, mes] = item.fecha.split("-").map(n=>parseInt(n));
      const activo =
        dia === hoy.getDate() &&
        mes === (hoy.getMonth()+1);

      const icono = activo ? "🎄🟢" : "🎄🔴";
      return `${icono} ${item.texto} | fecha:${item.fecha}`;
    }

    // ⏰ HORARIO
    if(item.desde !== undefined){
      const activo =
        horaActual >= item.desde &&
        horaActual < item.hasta;

      const icono = activo ? "🟢" : "🔴";
      return `${icono} ${item.texto} | ${item.desde}-${item.hasta}`;
    }

    return "";

  }).join("\n");
}

/* ============================= */
/* CAMBIO DE IDIOMA */
/* ============================= */

idiomaSelect.addEventListener("change", actualizarEstadosVisuales);

/* ============================= */
/* ACTUALIZACIÓN AUTOMÁTICA */
/* ============================= */

setInterval(() => {
  actualizarEstadosVisuales();
}, 3000);

/* ============================= */
/* PREVIEW EN VIVO */
/* ============================= */

editor.addEventListener("input", () => {

  clearTimeout(timeout);

 setTimeout(() => {
  tele.style.opacity = "0";

  setTimeout(() => {
    tele.innerHTML = "";
    tele.style.opacity = "1";

    indexLetra = 0;
    indexMensaje++;
    if (indexMensaje >= mensajes.length) indexMensaje = 0;

    escribirMensaje();
  }, 400);

}, pausaEntreMensajes);

    const idioma = idiomaSelect.value;

    const mensajes = editor.value
      .split("\n")
      .map(t => t.trim())
      .filter(Boolean)
      .map(linea => {

        // Quitar iconos visuales
        linea = linea.replace(/^🎄🟢|^🎄🔴|^🟢|^🔴|^⚪/, "").trim();

        if(linea.includes("|")){

          const [texto, condicion] =
            linea.split("|").map(x=>x.trim());

          // FECHA
          if(condicion.startsWith("fecha:")){
            const fecha =
              condicion.replace("fecha:", "").trim();
            return { texto, fecha };
          }

          // HORARIO
          if(condicion.includes("-")){
            const [desde, hasta] =
              condicion.split("-")
              .map(x=>parseInt(x.trim()));
            return { texto, desde, hasta };
          }
        }

        // TEXTO SIMPLE
        return linea;
      });

    contenidoActual[idioma] = mensajes;

    // Enviar solo texto plano al preview
    iframe.contentWindow.postMessage(
      mensajes.map(m =>
        typeof m === "string" ? m : m.texto
      ),
      "*"
    );

    estado.textContent = "👁 Preview en vivo";

  }, 500);
});

/* ============================= */
/* EMOJIS CLICKEABLES */
/* ============================= */

document.querySelectorAll(".emoji-list button")
.forEach(btn => {

  btn.addEventListener("click", () => {

    const emoji = btn.textContent;
    const start = editor.selectionStart;
    const end = editor.selectionEnd;

    editor.value =
      editor.value.substring(0, start) +
      emoji +
      editor.value.substring(end);

    editor.focus();
    editor.selectionStart =
      editor.selectionEnd =
      start + emoji.length;

    editor.dispatchEvent(new Event("input"));
  });

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

  // Guardar nombre del local
  contenidoActual.config = contenidoActual.config || {};
  contenidoActual.config.nombreLocal =
    nombreLocalInput.value.trim();

  const contenidoCodificado = btoa(
    unescape(
      encodeURIComponent(
        JSON.stringify(contenidoActual, null, 2)
      )
    )
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
    estado.textContent = "✅ Guardado correctamente";
    cargarArchivo();
  }else{
    estado.textContent = "❌ Error al guardar";
  }
};
