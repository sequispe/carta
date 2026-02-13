document.addEventListener("DOMContentLoaded", () => {

const USER="sequispe";
const REPO="carta";

let idiomaActual=localStorage.getItem("idioma")||"es";
let productos=[],sugerencias=[],indice=0,intervalo=null;
let pausado=false;

const tele=document.getElementById("teleprompter-text");
const list=document.getElementById("product-list");
const cats=document.getElementById("category-buttons");

tele.onclick=()=>{
  pausado=!pausado;
  tele.style.animationPlayState=pausado?"paused":"running";
};

function loadSugerencias(){

  fetch("sugerencias.json",{cache:"no-store"})
  .then(r=>r.json())
  .then(d=>{

    const ahora = new Date().getHours();

    // Soporta texto simple o texto con horario
    sugerencias = (d[idiomaActual] || [])
      .filter(s => {
        if (typeof s === "string") return true;
        if (!s.desde) return true;
        return ahora >= s.desde && ahora < s.hasta;
      })
      .map(s => typeof s === "string" ? s : s.texto);

    indice = 0;

    mostrar();
  });

}

function mostrar(){

  const t = sugerencias[indice];

  tele.style.animation = "none";
  tele.offsetHeight;
  tele.textContent = t;

  const dist = tele.scrollWidth + window.innerWidth;
  const duracion = dist / 80; // velocidad real

  tele.style.animation = `scrollText ${duracion}s linear`;

  clearTimeout(intervalo);

  intervalo = setTimeout(()=>{
    next();
  }, duracion * 1000);

}

function next(){
  if(pausado) return;
  indice=(indice+1)%sugerencias.length;
  mostrar();
}

async function loadProductos(){
  let f="productos.json";
  if(idiomaActual==="en")f="productos-en.json";
  if(idiomaActual==="pt")f="productos-port.json";
  const url=`https://raw.githubusercontent.com/${USER}/${REPO}/main/${f}`;
  const res=await fetch(url,{cache:"no-store"});
  productos=await res.json();
  renderCats();
  render(productos);
}

function renderCats(){
  const c=["Todos",...new Set(productos.map(p=>p.categoria))];
  cats.innerHTML="";
  c.forEach(x=>{
    const b=document.createElement("button");
    b.textContent=x;
    b.onclick=()=>render(x==="Todos"?productos:productos.filter(p=>p.categoria===x));
    cats.appendChild(b);
  });
}

function render(arr){
  list.innerHTML="";
  arr.forEach(p=>{
    list.innerHTML+=`
    <div class="item">
      <img src="${p.imagen}">
      <h3>${p.nombre}</h3>
      <p>${p.descripcion||""}</p>
      <span class="price">$${p.precio}</span>
    </div>`;
  });
}

document.getElementById("btn-es").onclick=()=>{idioma("es")};
document.getElementById("btn-en").onclick=()=>{idioma("en")};
document.getElementById("btn-pt").onclick=()=>{idioma("pt")};

function idioma(i){
  idiomaActual=i;
  localStorage.setItem("idioma",i);
  start();
}
window.parent?.postMessage("ready", "*");

function start(){
  loadSugerencias();
  loadProductos();
}
 /* ===== PREVIEW DESDE ADMIN ===== */
window.addEventListener("message", e => {

  if (Array.isArray(e.data)) {

    sugerencias = e.data;
    indice = 0;

    clearInterval(intervalo);

    mostrar();

    intervalo = setInterval(next, 15000);
  }

});


start();
});
