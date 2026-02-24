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
/* PEDIR TOKEN */
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
/* DECODIFICAR UTF-8 CORRECTO */
/* ============================= */
function decodeUTF8(base64) {
  return new TextDecoder("utf-8").decode(
    Uint8Array.from(atob(base64), c => c.charCodeAt(0))
  );
}

/* ============================= */
/* ENCODIFICAR UTF-8 CORRECTO */
/* ============================= */
function encodeUTF8(str) {
  const bytes = new TextEncoder().encode(str);
  let binary = "";
  bytes.forEach(b => binary += String.fromCharCode(b));
  return btoa(binary);
}

/* ============================= */
/* CARGAR JSON */
/* ============================= */
async function cargarJSON() {
  pedirToken();
  if (!TOKEN) return;

  estado.textContent = "Cargando...";

  const url = `https://api.github.com/repos/${USER}/${REPO}/contents/${FILE_PATH}`;

  const res = await fetch(url, {
    headers: {
      Authorization: `token ${TOKEN}`
    }
  });

  if (!res.ok) {
    estado.textContent = "Error ❌";
    alert("Error cargando JSON");
    return;
  }

  const data = await res.json();
  shaActual = data.sha;

  const contenido = decodeUTF8(data.content);
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

  const contenidoBase64 = encodeUTF8(contenidoNuevo);

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
    cargarJSON(); // refresca SHA
  } else {
    estado.textContent = "Error al guardar ❌";
    alert("Error al guardar");
  }
}

/* ============================= */
/* BOTÓN GUARDAR */
/* ============================= */
btnGuardar.addEventListener("click", guardarJSON);

/* ============================= */
/* EMOJIS */
/* ============================= */
document.querySelectorAll(".emoji-list button").forEach(btn => {
  btn.addEventListener("click", () => {
    const emoji = btn.textContent;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    textarea.value =
      textarea.value.substring(0, start) +
      emoji +
      textarea.value.substring(end);

    textarea.focus();
    textarea.selectionStart = textarea.selectionEnd = start + emoji.length;
  });
});

/* ============================= */
/* INICIAR */
/* ============================= */
cargarJSON();
