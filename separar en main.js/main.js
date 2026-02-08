document.addEventListener("DOMContentLoaded", () => {

  /* ================= CONFIG ================= */
  const USER = "sequispe";
  const REPO = "carta";

  let idiomaActual = localStorage.getItem("idioma") || "es";

  let productos = [];
  let sugerencias = [];
  let indiceSugerencia = 0;
  let telePausado = false;

  /* ================= ELEMENTOS ================= */
  const teleText = document.getElementById("teleprompter-text");
  const productList = document.getElementById("product-list");
  const categoryContainer = document.getElementById("category-buttons");

  const btnEs = document.getElementById("btn-es");
  const btnEn = document.getElementById("btn-en");
  const btnPt = document.getElementById("btn-pt");
  const btnUp = document.getElementById("btnUp");
  const searchInput = document.getElementById("search");
  const btnSearch = document.getElementById("btnSearch");

  /* ================= TELEPROMPTER ================= */

  function loadSugerencias() {
    fetch("sugerencias.json", { cache: "no-store" })
      .then(res => res.json())
      .then(data => {
        sugerencias = data[idiomaActual] || [];
        if (!sugerencias.length) {
          teleText.textContent = "";
          return;
        }
        indiceSugerencia = 0;
        mostrarSugerencia();
      });
  }

  function mostrarSugerencia() {
    if (telePausado) return;

    const texto = sugerencias[indiceSugerencia];
    const velocidad = 60; // px por segundo

    teleText.style.opacity = 0;

    setTimeout(() => {
      teleText.style.animation = "none";
      teleText.offsetHeight;

      teleText.textContent = texto;

      const anchoTexto = teleText.scrollWidth;
      const anchoPantalla = window.innerWidth;
      const distancia = anchoTexto + anchoPantalla;
      const duracion = distancia / velocidad;

      teleText.style.animation = `scrollText ${duracion}s linear forwards`;
      teleText.style.opacity = 1;

      setTimeout(() => {
        indiceSugerencia = (indiceSugerencia + 1) % sugerencias.length;
        mostrarSugerencia();
      }, duracion * 1000 + 800);

    }, 400);
  }

  teleText.addEventListener("click", () => {
    telePausado = !telePausado;
    teleText.style.animationPlayState = telePausado ? "paused" : "running";
    if (!telePausado) mostrarSugerencia();
  });

  /* ================= PRODUCTOS ================= */

  async function loadProductos() {
    let file = "productos.json";
    if (idiomaActual === "en") file = "productos-en.json";
    if (idiomaActual === "pt") file = "productos-port.json";

    const url = `https://raw.githubusercontent.com/${USER}/${REPO}/main/${file}`;

    const res = await fetch(url, { cache: "no-store" });
    const data = await res.json();

    productos = data.map(p => ({
      nombre: p.nombre || p.name || p.nome,
      descripcion: p.descripcion || p.description || p.descricao || "",
      precio: p.precio || p.price || p.preco,
      imagen: p.imagen || p.image || p.imagem,
      categoria: p.categoria || p.category
    }));

    renderCategorias();
    renderProductos(productos);
  }

  function renderCategorias() {
    const categorias = ["Todos", ...new Set(productos.map(p => p.categoria).filter(Boolean))];
    categoryContainer.innerHTML = "";

    categorias.forEach(cat => {
      const btn = document.createElement("button");
      btn.textContent = cat;
      btn.onclick = () => {
        const lista = cat === "Todos" ? productos : productos.filter(p => p.categoria === cat);
        renderProductos(lista);
      };
      categoryContainer.appendChild(btn);
    });
  }

  function renderProductos(lista) {
    productList.innerHTML = "";
    lista.forEach(p => {
      const div = document.createElement("div");
      div.className = "item";
      div.innerHTML = `
        <img src="${p.imagen}">
        <h3>${p.nombre}</h3>
        <p>${p.descripcion}</p>
        <span class="price">$${p.precio}</span>
      `;
      productList.appendChild(div);
    });
  }

  /* ================= BUSCADOR ================= */

  function buscar() {
    const q = searchInput.value.toLowerCase().trim();
    const res = productos.filter(p =>
      p.nombre.toLowerCase().includes(q) ||
      p.descripcion.toLowerCase().includes(q) ||
      (p.categoria || "").toLowerCase().includes(q)
    );
    renderProductos(res);
  }

  /* ================= IDIOMAS ================= */

  function cambiarIdioma(id) {
    idiomaActual = id;
    localStorage.setItem("idioma", id);
    iniciar();
  }

  btnEs.onclick = () => cambiarIdioma("es");
  btnEn.onclick = () => cambiarIdioma("en");
  btnPt.onclick = () => cambiarIdioma("pt");

  btnSearch.onclick = buscar;
  searchInput.addEventListener("keydown", e => e.key === "Enter" && buscar());

  btnUp.onclick = () => window.scrollTo({ top: 0, behavior: "smooth" });

  /* ================= INIT ================= */

  function iniciar() {
    loadSugerencias();
    loadProductos();
  }

  iniciar();
});
