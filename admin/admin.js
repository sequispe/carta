const USER = "sequispe";
const REPO = "carta";
const FILE_PATH = "sugerencias.json";
const BRANCH = "main";

// ⚠️ PEGÁ TU TOKEN ACA
const TOKEN = "PEGAR_TU_TOKEN_AQUI";

const textarea = document.getElementById("json-editor");
const btnGuardar = document.getElementById("guardar");

let shaActual = null;

/* ============================= */
/* CARGAR JSON DESDE GITHUB */
/* ============================= */

async function cargarJSON() {
  const url = `https://api.github.com/repos/${USER}/${REPO}/contents/${FILE_PATH}`;

  const res = await fetch(url, {
    headers: {
      Authorization: `token ${TOKEN}`
    }
  });

  if (!res.ok) {
    alert("Error cargando JSON");
    return;
  }

  const data = await res.json();
  shaActual = data.sha;

  const contenido = atob(data.content);
  textarea.value = contenido;
}

/* ============================= */
/* GUARDAR JSON */
/* ============================= */

async function guardarJSON() {

  const contenidoNuevo = textarea.value;

  const url = `https://api.github.com/repos/${USER}/${REPO}/contents/${FILE_PATH}`;

  const res = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `token ${TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      message: "Actualización desde admin",
      content: btoa(unescape(encodeURIComponent(contenidoNuevo))),
      sha: shaActual,
      branch: BRANCH
    })
  });

  if (res.ok) {
    alert("Guardado correctamente ✅");
    cargarJSON();
  } else {
    alert("Error al guardar ❌");
  }
}

/* ============================= */

btnGuardar.addEventListener("click", guardarJSON);

cargarJSON();
const USER = "sequispe";
const REPO = "carta";
const FILE_PATH = "sugerencias.json";
const BRANCH = "main";

// ⚠️ PEGÁ TU TOKEN ACA
const TOKEN = "PEGAR_TU_TOKEN_AQUI";

const textarea = document.getElementById("json-editor");
const btnGuardar = document.getElementById("guardar");

let shaActual = null;

/* ============================= */
/* CARGAR JSON DESDE GITHUB */
/* ============================= */

async function cargarJSON() {
  const url = `https://api.github.com/repos/${USER}/${REPO}/contents/${FILE_PATH}`;

  const res = await fetch(url, {
    headers: {
      Authorization: `token ${TOKEN}`
    }
  });

  if (!res.ok) {
    alert("Error cargando JSON");
    return;
  }

  const data = await res.json();
  shaActual = data.sha;

  const contenido = atob(data.content);
  textarea.value = contenido;
}

/* ============================= */
/* GUARDAR JSON */
/* ============================= */

async function guardarJSON() {

  const contenidoNuevo = textarea.value;

  const url = `https://api.github.com/repos/${USER}/${REPO}/contents/${FILE_PATH}`;

  const res = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `token ${TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      message: "Actualización desde admin",
      content: btoa(unescape(encodeURIComponent(contenidoNuevo))),
      sha: shaActual,
      branch: BRANCH
    })
  });

  if (res.ok) {
    alert("Guardado correctamente ✅");
    cargarJSON();
  } else {
    alert("Error al guardar ❌");
  }
}

/* ============================= */

btnGuardar.addEventListener("click", guardarJSON);

cargarJSON();
