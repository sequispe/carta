document.addEventListener("DOMContentLoaded", () => {

const USER = "sequispe";
const REPO = "carta";

let idiomaActual = localStorage.getItem("idioma") || "es";

let productos = [];
let sugerencias = [];
let indice = 0;
let pausado = false;
let timeoutCambio = null;

const tele = document.getElementById("teleprompter-text");
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
/* CARGAR SUGERENCIAS */
/* ============================= */

function loadSugerencias() {

  fetch("sugerencias.json", { cache: "no-store" })
    .then(r => r.json())
    .then(data => {

      const horaActual = new Date().getHours();

      sugerencias = (data[idiomaActual] || [])
        .filter(s => {
          if (typeof s === "string") return true;
          if (!s.desde) return true;
          return horaActual >= s.desde && horaActual < s.hasta;
        })
        .map(s => typeof s === "string" ? s : s.texto);

      if (sugerencias.length === 0) {
        sugerencias = ["Bienvenidos ☕"];
      }

      indice = 0;
      mostrar();
    });
}

/* ============================= */
/* MOSTRAR TEXTO SIN PAUSAS */
/* ============================= */

function mostrar() {

  if (!sugerencias.length) return;

  const texto = sugerencias[indice];

  tele.style.animation = "none";
  tele.offsetHeight; // forzar reflow

  tele.textContent = texto;

  const distancia = tele.scrollWidth + window.innerWidth;

  const velocidad = 90; // más alto = más rápido
  const duracion = distancia / velocidad;

  tele.style.animation = `scrollText ${duracion}s linear`;

  clearTimeout(timeoutCambio);

  timeoutCambio = setTimeout(() => {
    if (!pausado) siguiente();
  }, duracion * 1000);
}

/* ============================= */
/* SIGUIENTE MENSAJE */
/* ============================= */

function siguiente() {
  indice = (indice + 1) % sugerencias.length;
  mostrar();
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
/* PREVIEW DESDE ADMIN */
/* ============================= */

window.parent?.postMessage("ready", "*");

window.addEventListener("message", e => {

  if (Array.isArray(e.data)) {
    sugerencias = e.data;
    indice = 0;
    mostrar();
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
