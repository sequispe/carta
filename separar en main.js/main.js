document.addEventListener("DOMContentLoaded", () => {

  /* ================= CONFIG ================= */
  const USER = "sequispe";
  const REPO = "carta";

  let idiomaActual = localStorage.getItem("idioma") || "es";

  let productos = [];
  let sugerencias = [];
  let indiceSugerencia = 0;
  let intervaloTeleprompter = null;

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

        if (intervaloTeleprompter) clearInterval(intervaloTeleprompter);
        intervaloTeleprompter = setInterval(cambiarSugerencia, 15000);
      })
      .catch(() => {
        teleText.textContent = "";
      });
  }

  function mostrarSugerencia() {
    teleText.style.animation = "none";
    teleText.offsetHeight; // 🔥 fix Safari
    teleText.textContent = sugerencias[indiceSugerencia];
    teleText.style.animation = "scrollText 15s linear infinite";
  }

  function cambiarSugerencia() {
    indiceSugerencia = (indiceSugerencia + 1) % sugerencias.length;
    mostrarSugerencia();
  }

  /* ================= PRODUCTOS ================= */
  async function loadProductos() {
    let file = "productos.json";
    if (idiomaActual === "en") file = "productos-en.json";
    if (idiomaActual === "pt") file = "productos-port.json";

    const url = `https://raw.githubusercontent.com/${USER}/${REPO}/main/${file}`;

    try {
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
    } catch (e) {
      productList.innerHTML = `<div class="msg">⚠️ Error cargando productos</div>`;
    }
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

  /* ================= EVENTOS ================= */
  btnEs.onclick = () => cambiarIdioma("es");
  btnEn.onclick = () => cambiarIdioma("en");
  btnPt.onclick = () => cambiarIdioma("pt");

  function cambiarIdioma(id) {
    idiomaActual = id;
    localStorage.setItem("idioma", id);
    iniciar();
  }

  btnSearch.onclick = buscar;
  searchInput.addEventListener("keydown", e => {
    if (e.key === "Enter") buscar();
  });

  window.addEventListener("scroll", () => {
    btnUp.style.display = window.scrollY > 300 ? "block" : "none";
  });

  btnUp.onclick = () => window.scrollTo({ top: 0, behavior: "smooth" });

  /* ================= INICIO ================= */
  function iniciar() {
    loadSugerencias();
    loadProductos();
  }

  iniciar();
});
