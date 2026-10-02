import { montarLayout } from '../ui/layout.js';
import { api } from '../api/index.js';
import { agregar } from '../store/carrito.js';
import { ANIMOS, esc, dinero, colorSeguro, velaSvg } from '../ui/util.js';

montarLayout('catalogo');

const $ = (s) => document.querySelector(s);
const moods = $('#moods'), buscar = $('#buscar'), grid = $('#grid'), estado = $('#estado'), modal = $('#modal');

let animo = '';        // ánimo seleccionado ('' = todos)
let busqueda = '';
let productos = [];
let detalle = null;
let peticion = 0;      // contador para descartar respuestas viejas

/* ---------- Selector de ánimo ---------- */
function pintarAnimos() {
  const opciones = [['', { etiqueta: 'Todas', fondo: '#ffffff' }], ...Object.entries(ANIMOS)];
  moods.innerHTML = opciones.map(([id, a], i) => {
    const activo = animo === id;
    return `<button data-animo="${id}"
      class="rounded-full border border-ciruela/15 px-5 py-2 text-sm font-medium transition hover:-translate-y-0.5 ${i % 2 ? 'rotate-1' : '-rotate-1'} ${activo ? 'bg-ciruela text-crema' : ''}"
      style="${activo ? '' : `background:${a.fondo}`}">${a.etiqueta}</button>`;
  }).join('');
  // El fondo de toda la página toma el color del ánimo
  document.body.style.setProperty('--ambiente', animo ? ANIMOS[animo].fondo : '#fff8f0');
}

/* ---------- Tarjeta de producto ---------- */
function tarjeta(p, i) {
  const color = colorSeguro(p.color);
  const a = ANIMOS[p.animo] ?? { etiqueta: p.animo, fondo: '#ffffff' };
  const agotado = p.stock === 0;
  return `
  <article data-id="${esc(p.id)}" tabindex="0"
    class="aparece relative cursor-pointer rounded-[2.5rem_1rem_2.5rem_1rem] border border-white/70 p-6 pt-8 shadow-[0_18px_40px_-24px_rgba(74,63,92,.45)] transition hover:-rotate-1"
    style="background:linear-gradient(160deg, ${color}88, #ffffffcc 65%); animation-delay:${i * 60}ms">
    <span class="absolute -top-3 left-6 -rotate-3 rounded-full px-3 py-1 text-xs font-bold" style="background:${a.fondo}">${esc(a.etiqueta)}</span>
    <div class="mx-auto h-36 w-28">${velaSvg(color)}</div>
    <h3 class="mt-4 font-display text-2xl font-bold leading-tight">${esc(p.nombre)}</h3>
    <ul class="mt-3 flex flex-wrap gap-1.5">
      ${(p.notas ?? []).map((n) => `<li class="rounded-full bg-white/70 px-2.5 py-0.5 text-xs">${esc(n)}</li>`).join('')}
    </ul>
    <div class="mt-5 flex items-center justify-between">
      <p class="font-display text-2xl font-bold">${dinero(p.precio)}</p>
      <button data-agregar="${esc(p.id)}" ${agotado ? 'disabled' : ''}
        class="rounded-full bg-ciruela px-4 py-2 text-sm font-medium text-crema transition hover:bg-ciruela/85 disabled:cursor-not-allowed disabled:opacity-40">
        ${agotado ? 'Agotada' : 'Agregar'}
      </button>
    </div>
  </article>`;
}

function pintar() {
  if (!productos.length) {
    grid.innerHTML = '';
    estado.textContent = 'Ninguna vela coincide… todavía.';
    return;
  }
  estado.textContent = `${productos.length} ${productos.length === 1 ? 'vela' : 'velas'}`;
  grid.innerHTML = productos.map(tarjeta).join('');
}

/* ---------- Carga de datos ---------- */
async function cargar() {
  const mia = ++peticion;
  estado.textContent = 'Encendiendo velas…';
  try {
    const lista = await api.listar({ animo: animo || undefined, busqueda: busqueda || undefined });
    if (mia !== peticion) return;   // llegó una respuesta más nueva: ignorar esta
    productos = lista;
    pintar();
  } catch (e) {
    if (mia !== peticion) return;
    productos = [];
    grid.innerHTML = '';
    estado.textContent = e.message;
  }
}

/* ---------- Detalle (modal) ---------- */
async function abrirDetalle(id) {
  modal.innerHTML = '<p class="p-10">Cargando…</p>';
  modal.showModal();
  try {
    detalle = await api.obtener(id);
    const color = colorSeguro(detalle.color);
    modal.innerHTML = `
      <div class="p-8" style="background:linear-gradient(160deg, ${color}66, transparent 60%)">
        <button data-cerrar class="float-right rounded-full bg-white/70 px-3 py-1 text-sm" aria-label="Cerrar">✕</button>
        <div class="mx-auto h-40 w-32">${velaSvg(color)}</div>
        <h2 class="mt-4 font-display text-3xl font-bold">${esc(detalle.nombre)}</h2>
        <p class="mt-3 opacity-80">${esc(detalle.descripcion) || 'Sin descripción.'}</p>
        <dl class="mt-5 grid grid-cols-3 gap-3 text-center text-sm">
          <div class="rounded-2xl bg-white/60 p-3"><dt class="opacity-60">Ánimo</dt><dd class="font-bold">${esc(ANIMOS[detalle.animo]?.etiqueta ?? detalle.animo)}</dd></div>
          <div class="rounded-2xl bg-white/60 p-3"><dt class="opacity-60">Quemado</dt><dd class="font-bold">${esc(detalle.horasQuemado ?? '—')} h</dd></div>
          <div class="rounded-2xl bg-white/60 p-3"><dt class="opacity-60">Stock</dt><dd class="font-bold">${esc(detalle.stock)}</dd></div>
        </dl>
        <ul class="mt-4 flex flex-wrap gap-1.5">${(detalle.notas ?? []).map((n) => `<li class="rounded-full bg-white/70 px-2.5 py-0.5 text-xs">${esc(n)}</li>`).join('')}</ul>
        <div class="mt-6 flex items-center justify-between">
          <p class="font-display text-3xl font-bold">${dinero(detalle.precio)}</p>
          <button data-agregar-detalle ${detalle.stock === 0 ? 'disabled' : ''}
            class="rounded-full bg-ciruela px-5 py-2.5 font-medium text-crema disabled:opacity-40">${detalle.stock === 0 ? 'Agotada' : 'Agregar al carrito'}</button>
        </div>
      </div>`;
  } catch (e) {
    modal.innerHTML = `<div class="p-10"><p>${esc(e.message)}</p><button data-cerrar class="mt-4 rounded-full bg-white/70 px-4 py-2">Cerrar</button></div>`;
  }
}

/* ---------- Eventos ---------- */
function confirmar(boton, producto) {
  if (!producto) return;
  agregar(producto);
  const texto = boton.textContent;
  boton.textContent = '¡Agregada!';
  setTimeout(() => (boton.textContent = texto), 1000);
}

moods.addEventListener('click', (e) => {
  const b = e.target.closest('[data-animo]');
  if (!b) return;
  animo = b.dataset.animo;
  pintarAnimos();
  cargar();
});

grid.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-agregar]');
  if (btn) return confirmar(btn, productos.find((p) => p.id === btn.dataset.agregar));
  const card = e.target.closest('[data-id]');
  if (card) abrirDetalle(card.dataset.id);
});
grid.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && e.target.matches('[data-id]')) abrirDetalle(e.target.dataset.id);
});

modal.addEventListener('click', (e) => {
  if (e.target === modal || e.target.closest('[data-cerrar]')) return modal.close();
  const btn = e.target.closest('[data-agregar-detalle]');
  if (btn) confirmar(btn, detalle);
});

// Espera 300 ms tras dejar de escribir para no lanzar una petición por tecla
let temporizador;
buscar.addEventListener('input', () => {
  clearTimeout(temporizador);
  temporizador = setTimeout(() => { busqueda = buscar.value.trim(); cargar(); }, 300);
});

window.addEventListener('api-cambiada', cargar);

pintarAnimos();
cargar();