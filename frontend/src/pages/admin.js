import { montarLayout } from '../ui/layout.js';
import { api, obtenerApiActiva } from '../api/index.js';
import { ANIMOS, esc, dinero, colorSeguro } from '../ui/util.js';

montarLayout('admin');

const $ = (s) => document.querySelector(s);
const lista = $('#lista'), estado = $('#estado'), via = $('#via'), dlg = $('#dlg');

const PALETA = ['#D9CFF2', '#CFE3F5', '#CDEBDD', '#FFD9C7', '#FFE6B8', '#F7CFE0', '#EAD7C3'];
const INPUT = 'mt-1 w-full border-0 border-b-2 border-ciruela/20 bg-transparent py-1.5 outline-none focus:border-ciruela';

let productos = [];
let peticion = 0;

/* ---------- Tabla ---------- */
function fila(p) {
  return `
  <tr class="border-b border-ciruela/10">
    <td class="py-3 pr-3"><span class="inline-block h-6 w-6 rounded-full border border-ciruela/10 align-middle" style="background:${colorSeguro(p.color)}"></span></td>
    <td class="py-3 font-medium">${esc(p.nombre)}</td>
    <td class="hidden py-3 sm:table-cell">${esc(ANIMOS[p.animo]?.etiqueta ?? p.animo)}</td>
    <td class="py-3 text-right">${dinero(p.precio)}</td>
    <td class="py-3 text-right ${p.stock <= 5 ? 'font-bold text-rose-700' : ''}">${esc(p.stock)}</td>
    <td class="whitespace-nowrap py-3 pl-4 text-right">
      <button data-editar="${esc(p.id)}" class="rounded-full bg-white/70 px-3 py-1 hover:bg-white">Editar</button>
      <button data-borrar="${esc(p.id)}" class="rounded-full bg-white/70 px-3 py-1 hover:bg-rose-100">Eliminar</button>
    </td>
  </tr>`;
}

function pintar() {
  lista.innerHTML = productos.map(fila).join('');
  estado.textContent = productos.length
    ? `${productos.length} ${productos.length === 1 ? 'vela' : 'velas'} en el catálogo · el stock bajo (5 o menos) se marca en rojo`
    : 'Todavía no hay velas. Crea la primera.';
}

async function cargar() {
  const mia = ++peticion;
  via.innerHTML = `Administrando con <strong>${esc(obtenerApiActiva().toUpperCase())}</strong>. Cambia de API arriba y haz la misma operación para compararlas.`;
  estado.textContent = 'Cargando…';
  try {
    const datos = await api.listar();
    if (mia !== peticion) return;
    productos = datos;
    pintar();
  } catch (e) {
    if (mia !== peticion) return;
    productos = [];
    lista.innerHTML = '';
    estado.textContent = e.message;
  }
}

/* ---------- Formulario (crear / editar) ---------- */
function formulario(p) {
  const v = p ?? { nombre: '', descripcion: '', precio: '', stock: '', animo: 'calma', notas: [], horasQuemado: 30, color: PALETA[0] };
  const color = colorSeguro(v.color);
  const colores = PALETA.some((c) => c.toLowerCase() === color.toLowerCase()) ? PALETA : [color, ...PALETA];

  return `
  <form id="form" novalidate class="p-8" data-id="${esc(p?.id ?? '')}">
    <div class="flex items-start justify-between">
      <h2 class="font-display text-3xl font-bold">${p ? 'Editar vela' : 'Nueva vela'}</h2>
      <button type="button" data-cerrar class="rounded-full bg-white/70 px-3 py-1 text-sm" aria-label="Cerrar">✕</button>
    </div>

    <div class="mt-6 grid gap-5 sm:grid-cols-2">
      <label class="block text-sm sm:col-span-2">Nombre
        <input name="nombre" value="${esc(v.nombre)}" maxlength="80" class="${INPUT}" />
      </label>
      <label class="block text-sm sm:col-span-2">Descripción
        <textarea name="descripcion" rows="3" maxlength="500" class="${INPUT} resize-none">${esc(v.descripcion)}</textarea>
      </label>
      <label class="block text-sm">Precio (USD)
        <input name="precio" type="number" min="0" step="0.01" value="${esc(v.precio)}" class="${INPUT}" />
      </label>
      <label class="block text-sm">Stock
        <input name="stock" type="number" min="0" step="1" value="${esc(v.stock)}" class="${INPUT}" />
      </label>
      <label class="block text-sm">Ánimo
        <select name="animo" class="${INPUT}">
          ${Object.entries(ANIMOS).map(([id, a]) => `<option value="${id}" ${v.animo === id ? 'selected' : ''}>${a.etiqueta}</option>`).join('')}
        </select>
      </label>
      <label class="block text-sm">Horas de quemado
        <input name="horasQuemado" type="number" min="1" step="1" value="${esc(v.horasQuemado ?? 30)}" class="${INPUT}" />
      </label>
      <label class="block text-sm sm:col-span-2">Notas olfativas (separadas por coma)
        <input name="notas" value="${esc((v.notas ?? []).join(', '))}" placeholder="lavanda, vainilla, cedro" class="${INPUT}" />
      </label>
      <fieldset class="sm:col-span-2">
        <legend class="text-sm">Color de la vela</legend>
        <div class="mt-2 flex flex-wrap gap-3">
          ${colores.map((c) => `
            <label class="cursor-pointer">
              <input type="radio" name="color" value="${c}" class="peer sr-only" ${c.toLowerCase() === color.toLowerCase() ? 'checked' : ''} />
              <span class="block h-9 w-9 rounded-full border border-ciruela/15 peer-checked:ring-2 peer-checked:ring-ciruela peer-checked:ring-offset-2 peer-focus-visible:ring-2" style="background:${c}"></span>
            </label>`).join('')}
        </div>
      </fieldset>
    </div>

    <p id="error" role="alert" class="mt-5 min-h-5 text-sm text-rose-700"></p>
    <div class="mt-2 flex justify-end gap-3">
      <button type="button" data-cerrar class="rounded-full bg-white/70 px-5 py-2.5">Cancelar</button>
      <button type="submit" class="rounded-full bg-ciruela px-6 py-2.5 font-medium text-crema disabled:opacity-50">Guardar</button>
    </div>
  </form>`;
}

function leer(form) {
  const crudo = Object.fromEntries(new FormData(form));
  return {
    crudo,
    datos: {
      nombre: crudo.nombre.trim(),
      descripcion: crudo.descripcion.trim(),
      precio: Number(crudo.precio),
      stock: Number(crudo.stock),
      animo: crudo.animo,
      horasQuemado: Number(crudo.horasQuemado),
      notas: crudo.notas.split(',').map((n) => n.trim()).filter(Boolean),
      color: crudo.color,
    },
  };
}

// Validación en el cliente (la API vuelve a validar: nunca se confía solo en el navegador)
function validar({ crudo, datos }) {
  if (datos.nombre.length < 2) return 'El nombre debe tener al menos 2 caracteres.';
  if (crudo.precio === '' || !(datos.precio >= 0)) return 'Ingresa un precio válido (0 o más).';
  if (crudo.stock === '' || !Number.isInteger(datos.stock) || datos.stock < 0) return 'El stock debe ser un entero de 0 o más.';
  if (!Number.isInteger(datos.horasQuemado) || datos.horasQuemado < 1) return 'Las horas de quemado deben ser un entero de 1 o más.';
  if (!ANIMOS[datos.animo]) return 'Elige un ánimo.';
  return null;
}

/* ---------- Diálogo ---------- */
const abrir = () => { if (!dlg.open) dlg.showModal(); };

function avisar(texto) {
  const el = document.createElement('div');
  el.className = 'aparece fixed bottom-4 right-4 z-50 rounded-full bg-ciruela px-5 py-3 text-sm font-medium text-crema shadow-lg';
  el.textContent = texto;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2500);
}

async function abrirEditar(id) {
  dlg.innerHTML = '<p class="p-10">Cargando…</p>';
  abrir();
  try {
    dlg.innerHTML = formulario(await api.obtener(id));
  } catch (e) {
    dlg.innerHTML = `<div class="p-10"><p>${esc(e.message)}</p><button data-cerrar class="mt-4 rounded-full bg-white/70 px-4 py-2">Cerrar</button></div>`;
  }
}

function confirmarBorrado(p) {
  dlg.innerHTML = `
    <div class="p-8">
      <h2 class="font-display text-2xl font-bold">¿Eliminar "${esc(p.nombre)}"?</h2>
      <p class="mt-3 opacity-80">Se borrará de la base de datos y no se puede deshacer.</p>
      <p id="error" role="alert" class="mt-4 min-h-5 text-sm text-rose-700"></p>
      <div class="mt-4 flex justify-end gap-3">
        <button data-cerrar class="rounded-full bg-white/70 px-5 py-2.5">Cancelar</button>
        <button data-confirmar="${esc(p.id)}" class="rounded-full bg-rose-700 px-5 py-2.5 font-medium text-white disabled:opacity-50">Eliminar</button>
      </div>
    </div>`;
  abrir();
}

/* ---------- Eventos ---------- */
$('#nueva').addEventListener('click', () => { dlg.innerHTML = formulario(null); abrir(); });

lista.addEventListener('click', (e) => {
  const ed = e.target.closest('[data-editar]');
  const bo = e.target.closest('[data-borrar]');
  if (ed) abrirEditar(ed.dataset.editar);
  if (bo) confirmarBorrado(productos.find((p) => p.id === bo.dataset.borrar));
});

dlg.addEventListener('click', async (e) => {
  if (e.target === dlg || e.target.closest('[data-cerrar]')) return dlg.close();

  const conf = e.target.closest('[data-confirmar]');
  if (!conf) return;
  conf.disabled = true;
  try {
    await api.eliminar(conf.dataset.confirmar);
    dlg.close();
    avisar('Vela eliminada');
    cargar();
  } catch (err) {
    dlg.querySelector('#error').textContent = err.message;
    conf.disabled = false;
  }
});

dlg.addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const error = form.querySelector('#error');
  const boton = form.querySelector('button[type="submit"]');
  const lectura = leer(form);

  const problema = validar(lectura);
  if (problema) { error.textContent = problema; return; }

  error.textContent = '';
  boton.disabled = true;
  boton.textContent = 'Guardando…';
  const id = form.dataset.id;
  try {
    if (id) await api.actualizar(id, lectura.datos);
    else await api.crear(lectura.datos);
    dlg.close();
    avisar(id ? 'Vela actualizada' : 'Vela creada');
    cargar();
  } catch (err) {
    error.textContent = err.message;   // error que devolvió la API (400, Fault, errors…)
    boton.disabled = false;
    boton.textContent = 'Guardar';
  }
});

window.addEventListener('api-cambiada', cargar);
cargar();