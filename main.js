document.addEventListener("DOMContentLoaded", () => {

const USER = "sequispe";
const REPO = "carta";

let idiomaActual = localStorage.getItem("idioma") || "es";

let productos = [];
let sugerencias = [];
let pausado = false;
let configGlobal = {};

/* ============================= */
/* ELEMENTOS */
/* ============================= */

const tele = document.getElementById("tele-track");
const list = document.getElementById("product-list");
const cats = document.getElementById("category-buttons");

/* ============================= */
/* PAUSAR AL TOCAR */
/* ============================= */

tele.addEventListener("click", () => {
  pausado = !pausado;
  tele.style.animationPlayState = pausado ? "paused" : "running";
});

/* ============================= */
/* SALUDO AUTOMÁTICO */
/* ============================= */

function obtenerSaludoAutomatico(){
  const hora = new Date().getHours();
  if(hora >= 5 && hora < 12) return "☀️ Buenos días";
  if(hora >= 12 && hora < 20) return "🌤 Buenas tardes";
  return "🌙 Buenas noches";
}

/* ============================= */
/* MENSAJE BASE */
/* ============================= */

function armarMensajeBase(config){

  const saludo = obtenerSaludoAutomatico();
  const nombre = config?.nombreLocal || "Nuestro local";

  let mensaje = `${saludo}, soy tu mozo digital. Bienvenidos a ${nombre}.`;

  if(config?.promo) mensaje += ` ${config.promo}`;
  if(config?.menu) mensaje += ` Hoy el menú del día es ${config.menu}.`;
  if(config?.extra) mensaje += ` ${config.extra}`;

  return mensaje;
}

/* ============================= */
/* TELEPROMPTER LOOP INFINITO */
/* ============================= */
function iniciarTeleprompter() {

  if (!sugerencias.length) return;

  const separador = "     ✦     ";
  const textoCompleto = sugerencias.join(separador) + separador;

  tele.textContent = textoCompleto + textoCompleto;

  // 🔥 Esperar un frame para asegurar render
  requestAnimationFrame(() => {

    const ancho = tele.scrollWidth / 2;

    if (ancho === 0) return; // evita bug si aún no cargó

    const velocidad = 75;
    const duracion = ancho / velocidad;

    tele.style.animation = "scrollText linear infinite";
    tele.style.animationDuration = `${duracion}s`;
    tele.style.animationDelay = "0s";

  });
}

/* ============================= */
/* ACTUALIZAR SALUDO */
/* ============================= */

setInterval(() => {
  if (!configGlobal) return;
  sugerencias[0] = armarMensajeBase(configGlobal);
  iniciarTeleprompter();
}, 60000);

/* ============================= */
/* CARGAR SUGERENCIAS */
/* ============================= */

function loadSugerencias() {

  // 🔥 1️⃣ Ver si hay guardadas
  const guardadas = localStorage.getItem("sugerenciasGuardadas");

  if (guardadas) {
    sugerencias = JSON.parse(guardadas);
    iniciarTeleprompter();
    return;
  }

  // 🔥 2️⃣ Si no hay, cargar JSON
  fetch("sugerencias.json", { cache: "no-store" })
    .then(r => r.json())
    .then(data => {

      configGlobal = data.config || {};
      const horaActual = new Date().getHours();

      sugerencias = (data[idiomaActual] || [])
        .filter(s => {
          if (typeof s === "string") return true;
          if (!s.desde) return true;
          return horaActual >= s.desde && horaActual < s.hasta;
        })
        .map(s => typeof s === "string" ? s : s.texto);

      const mensajeBase = armarMensajeBase(configGlobal);
      sugerencias.unshift(mensajeBase);

      if (sugerencias.length === 0) {
        sugerencias = ["Bienvenidos ☕"];
      }

      iniciarTeleprompter();
    });
}

/* ============================= */
/* CARGAR PRODUCTOS */
/* ============================= */

async function loadProductos() {

  let archivo = "productos.json";
  if (idiomaActual === "en") archivo = "productos-en.json";
  if (idiomaActual === "pt") archivo = "productos-port.json";

  const url = `https://raw.githubusercontent.com/${USER}/${REPO}/main/${archivo}`;

  const res = await fetch(url, { cache: "no-store" });
  productos = await res.json();

  renderCategorias();
  render(productos);
}

/* ============================= */
/* RENDER CATEGORÍAS */
/* ============================= */

function renderCategorias() {

  const categorias = ["Todos", ...new Set(productos.map(p => p.categoria))];
  cats.innerHTML = "";

  categorias.forEach(cat => {

    const btn = document.createElement("button");
    btn.textContent = cat;

    btn.onclick = () => {
      if (cat === "Todos") render(productos);
      else render(productos.filter(p => p.categoria === cat));
    };

    cats.appendChild(btn);
  });
}

/* ============================= */
/* RENDER PRODUCTOS */
/* ============================= */

function render(arr) {

  list.innerHTML = "";

  arr.forEach(p => {

    list.innerHTML += `
      <div class="item">
        <img src="${p.imagen}">
        <h3>${p.nombre}</h3>
        <p>${p.descripcion || ""}</p>
        <span class="price">$${p.precio}</span>
      </div>
    `;
  });
}

/* ============================= */
/* CAMBIO DE IDIOMA */
/* ============================= */

document.getElementById("btn-es").onclick = () => cambiarIdioma("es");
document.getElementById("btn-en").onclick = () => cambiarIdioma("en");
document.getElementById("btn-pt").onclick = () => cambiarIdioma("pt");

function cambiarIdioma(id) {
  idiomaActual = id;
  localStorage.setItem("idioma", id);
  iniciar();
}

/* ============================= */
/* ADMIN PREVIEW */
/* ============================= */

window.parent?.postMessage("ready", "*");

window.addEventListener("message", e => {

  if (Array.isArray(e.data)) {

    sugerencias = e.data;

    // 🔥 Guardar automáticamente
    localStorage.setItem("sugerenciasGuardadas", JSON.stringify(sugerencias));

    iniciarTeleprompter();
  }

  if (e.data === "ready") {
    e.source.postMessage(sugerencias, "*");
  }
});

/* ============================= */
/* INICIAR */
/* ============================= */

function iniciar() {
  loadSugerencias();
  loadProductos();
}

iniciar();

});
