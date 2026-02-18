const USER = "sequispe";
const REPO = "carta";
const FILE_PATH = "sugerencias.json";
const BRANCH = "main";

let TOKEN = localStorage.getItem("github_token");

const textarea = document.getElementById("editor");
const btnGuardar = document.getElementById("guardar");
const estado = document.getElementById("estado");

let shaActual = null;

/* ============================= */
/* PEDIR TOKEN SI NO EXISTE */
/* ============================= */
function pedirToken() {
  if (!TOKEN) {
    TOKEN = prompt("Pegá tu token de GitHub:");
    if (TOKEN) {
      localStorage.setItem("github_token", TOKEN);
    } else {
      alert("Necesitás el token para usar el admin");
    }
  }
}

/* ============================= */
/* CARGAR JSON */
/* ============================= */
async function cargarJSON() {
  pedirToken();
  if (!TOKEN) return;

  estado.textContent = "Cargando sugerencias...";

  const url = `https://api.github.com/repos/${USER}/${REPO}/contents/${FILE_PATH}`;

  const res = await fetch(url, {
    headers: {
      Authorization: `token ${TOKEN}`
    }
  });

  if (!res.ok) {
    estado.textContent = "Error cargando ❌";
    alert("Error cargando JSON ❌");
    return;
  }

  const data = await res.json();
  shaActual = data.sha;

  const contenido = atob(data.content);
  textarea.value = contenido;

  estado.textContent = "Cargado ✅";
}

/* ============================= */
/* GUARDAR JSON */
/* ============================= */
async function guardarJSON() {
  if (!TOKEN) return;

  estado.textContent = "Guardando...";

  const contenidoNuevo = textarea.value;

  const contenidoBase64 = btoa(
    new TextEncoder()
      .encode(contenidoNuevo)
      .reduce((data, byte) => data + String.fromCharCode(byte), "")
  );

  const url = `https://api.github.com/repos/${USER}/${REPO}/contents/${FILE_PATH}`;

  const res = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `token ${TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      message: "Actualización desde admin",
      content: contenidoBase64,
      sha: shaActual,
      branch: BRANCH
    })
  });

  if (res.ok) {
    estado.textContent = "Guardado correctamente ✅";
    alert("Guardado correctamente ✅");
    cargarJSON(); // recargar para actualizar SHA
  } else {
    estado.textContent = "Error al guardar ❌";
    alert("Error al guardar ❌");
  }
}

/* ============================= */
/* EVENTO BOTÓN GUARDAR */
/* ============================= */
btnGuardar.addEventListener("click", guardarJSON);

/* ============================= */
/* EMOJIS */
/* ============================= */
document.querySelectorAll(".emoji-list button").forEach(btn => {
  btn.addEventListener("click", () => {
    textarea.value += btn.textContent;
    textarea.focus();
  });
});

/* ============================= */
/* INICIAR */
/* ============================= */
cargarJSON();
