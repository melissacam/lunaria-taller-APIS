import { montarLayout } from '../ui/layout.js';
import { api } from '../api/index.js';
import { obtenerItems, cambiarCantidad, quitar, vaciar } from '../store/carrito.js';
import { esc, dinero, velaSvg } from '../ui/util.js';

montarLayout('carrito');

const IVA = 0.15;   // porcentaje de IVA; cámbialo si tu docente pide otro
const app = document.getElementById('app');
const cliente = { nombre: '', correo: '' };   // se conserva al redibujar

const redondear = (n) => Math.round(n * 100) / 100;

function calcular(lineas) {
  const subtotal = redondear(lineas.reduce((s, l) => s + l.precio * l.cantidad, 0));
  const iva = redondear(subtotal * IVA);
  return { subtotal, iva, total: redondear(subtotal + iva) };
}

/* ---------- Vista del carrito ---------- */
function fila(i) {
  return `
  <li class="flex items-center gap-4 rounded-[1.5rem_0.5rem_1.5rem_0.5rem] bg-white/70 p-4">
    <div class="h-20 w-16 shrink-0">${velaSvg(i.color)}</div>
    <div class="flex-1">
      <h3 class="font-display text-lg font-bold leading-tight">${esc(i.nombre)}</h3>
      <p class="text-sm opacity-60">${dinero(i.precio)} c/u</p>
    </div>
    <div class="flex items-center gap-2">
      <button data-menos="${esc(i.id)}" class="h-8 w-8 rounded-full bg-white text-lg" aria-label="Quitar una unidad">−</button>
      <span class="w-6 text-center font-bold">${i.cantidad}</span>
      <button data-mas="${esc(i.id)}" class="h-8 w-8 rounded-full bg-white text-lg disabled:opacity-30" aria-label="Agregar una unidad" ${i.cantidad >= i.stock ? 'disabled' : ''}>+</button>
    </div>
    <p class="w-24 text-right font-bold">${dinero(i.precio * i.cantidad)}</p>
    <button data-quitar="${esc(i.id)}" class="opacity-50 hover:opacity-100" aria-label="Eliminar del carrito">✕</button>
  </li>`;
}

function pintarCarrito() {
  const items = obtenerItems();
  if (!items.length) {
    app.innerHTML = `
      <div class="rounded-[2.5rem_1rem_2.5rem_1rem] bg-white/60 p-12 text-center">
        <p class="font-display text-2xl">Tu carrito está vacío, y la casa también huele a poco.</p>
        <a href="/index.html" class="mt-6 inline-block rounded-full bg-ciruela px-6 py-3 font-medium text-crema">Ver las velas</a>
      </div>`;
    return;
  }
  const t = calcular(items);
  app.innerHTML = `
  <div class="grid gap-10 lg:grid-cols-[1.6fr_1fr]">
    <ul class="space-y-4">${items.map(fila).join('')}</ul>
    <aside class="h-fit rounded-[2.5rem_1rem_2.5rem_1rem] bg-white/70 p-7 shadow-[0_18px_40px_-24px_rgba(74,63,92,.45)]">
      <h2 class="font-display text-2xl font-bold">Resumen</h2>
      <dl class="mt-5 space-y-2 text-sm">
        <div class="flex justify-between"><dt>Subtotal</dt><dd>${dinero(t.subtotal)}</dd></div>
        <div class="flex justify-between"><dt>IVA (${Math.round(IVA * 100)}%)</dt><dd>${dinero(t.iva)}</dd></div>
        <div class="flex justify-between border-t border-ciruela/15 pt-3 font-display text-xl font-bold"><dt>Total</dt><dd>${dinero(t.total)}</dd></div>
      </dl>
      <form id="compra" novalidate class="mt-6 space-y-4">
        <label class="block text-sm">Nombre completo
          <input data-campo="nombre" value="${esc(cliente.nombre)}" maxlength="80" autocomplete="name"
            class="mt-1 w-full border-0 border-b-2 border-ciruela/20 bg-transparent py-1.5 outline-none focus:border-ciruela" />
        </label>
        <label class="block text-sm">Correo
          <input data-campo="correo" type="email" value="${esc(cliente.correo)}" maxlength="80" autocomplete="email"
            class="mt-1 w-full border-0 border-b-2 border-ciruela/20 bg-transparent py-1.5 outline-none focus:border-ciruela" />
        </label>
        <p id="error" role="alert" class="min-h-5 text-sm text-rose-700"></p>
        <button type="submit" class="w-full rounded-full bg-ciruela py-3 font-medium text-crema disabled:opacity-50">Comprar</button>
      </form>
      <p class="mt-3 text-xs opacity-60">Los precios y el stock se confirman con la API al comprar.</p>
    </aside>
  </div>`;
}

/* ---------- Compra ---------- */
async function comprar() {
  const items = obtenerItems();

  // 1. Releer cada producto desde la API: se usa el precio y el stock REALES, no los del navegador
  const actuales = await Promise.all(items.map((i) => api.obtener(i.id)));
  const lineas = items.map((i, n) => {
    const p = actuales[n];
    if (p.stock < i.cantidad) {
      throw new Error(`Stock insuficiente de "${p.nombre}": quedan ${p.stock}.`);
    }
    return { id: p.id, nombre: p.nombre, precio: p.precio, cantidad: i.cantidad, stockActual: p.stock };
  });

  // 2. Descontar el stock en la base de datos (PUT / mutation / ActualizarProducto)
  for (const l of lineas) {
    await api.actualizar(l.id, { stock: l.stockActual - l.cantidad });
  }

  // 3. Armar la factura
  const ahora = new Date();
  const numero = `LUN-${ahora.toISOString().slice(0, 10).replaceAll('-', '')}-${String(Math.floor(Math.random() * 9000) + 1000)}`;
  return {
    numero,
    fecha: ahora.toLocaleString('es-EC'),
    cliente: { nombre: cliente.nombre.trim(), correo: cliente.correo.trim() },
    lineas,
    ...calcular(lineas),
  };
}

/* ---------- Vista de la factura ---------- */
function pintarFactura(f) {
  app.innerHTML = `
  <article class="mx-auto max-w-2xl rounded-[2.5rem_1rem_2.5rem_1rem] bg-white p-10 shadow-[0_18px_40px_-24px_rgba(74,63,92,.45)] print:shadow-none">
    <header class="flex items-start justify-between border-b border-dashed border-ciruela/30 pb-6">
      <div>
        <p class="font-display text-3xl font-bold">Lunaria<span class="text-brasa">.</span></p>
        <p class="text-xs opacity-60">velas para cada ánimo</p>
      </div>
      <div class="text-right text-sm">
        <p class="font-bold">Factura ${esc(f.numero)}</p>
        <p class="opacity-60">${esc(f.fecha)}</p>
      </div>
    </header>
    <p class="mt-6 text-sm"><span class="opacity-60">Cliente:</span> ${esc(f.cliente.nombre)} · ${esc(f.cliente.correo)}</p>
    <table class="mt-6 w-full text-sm">
      <thead>
        <tr class="border-b border-ciruela/20 text-left">
          <th class="py-2">Producto</th><th class="text-right">Cant.</th><th class="text-right">P. unit.</th><th class="text-right">Subtotal</th>
        </tr>
      </thead>
      <tbody>
        ${f.lineas.map((l) => `
          <tr class="border-b border-ciruela/10">
            <td class="py-2">${esc(l.nombre)}</td>
            <td class="text-right">${l.cantidad}</td>
            <td class="text-right">${dinero(l.precio)}</td>
            <td class="text-right">${dinero(l.precio * l.cantidad)}</td>
          </tr>`).join('')}
      </tbody>
    </table>
    <dl class="ml-auto mt-6 w-56 space-y-1 text-sm">
      <div class="flex justify-between"><dt>Subtotal</dt><dd>${dinero(f.subtotal)}</dd></div>
      <div class="flex justify-between"><dt>IVA (${Math.round(IVA * 100)}%)</dt><dd>${dinero(f.iva)}</dd></div>
      <div class="flex justify-between border-t border-ciruela/20 pt-2 font-display text-xl font-bold"><dt>Total</dt><dd>${dinero(f.total)}</dd></div>
    </dl>
    <p class="mt-8 text-center text-xs opacity-60">Gracias por encender Lunaria. Documento de práctica académica, sin validez tributaria.</p>
    <div class="mt-6 flex justify-center gap-3 print:hidden">
      <button data-imprimir class="rounded-full bg-ciruela px-5 py-2.5 font-medium text-crema">Imprimir / guardar PDF</button>
      <a href="/index.html" class="rounded-full bg-lila px-5 py-2.5 font-medium">Seguir comprando</a>
    </div>
  </article>`;
}

/* ---------- Eventos ---------- */
app.addEventListener('click', (e) => {
  const cantidadDe = (id) => obtenerItems().find((i) => i.id === id)?.cantidad ?? 1;
  const mas = e.target.closest('[data-mas]');
  const menos = e.target.closest('[data-menos]');
  const borrar = e.target.closest('[data-quitar]');
  if (mas) { cambiarCantidad(mas.dataset.mas, cantidadDe(mas.dataset.mas) + 1); pintarCarrito(); }
  else if (menos) { cambiarCantidad(menos.dataset.menos, cantidadDe(menos.dataset.menos) - 1); pintarCarrito(); }
  else if (borrar) { quitar(borrar.dataset.quitar); pintarCarrito(); }
  else if (e.target.closest('[data-imprimir]')) window.print();
});

app.addEventListener('input', (e) => {
  const campo = e.target.dataset.campo;
  if (campo) cliente[campo] = e.target.value;
});

app.addEventListener('submit', async (e) => {
  e.preventDefault();
  const error = app.querySelector('#error');
  const boton = e.target.querySelector('button[type="submit"]');

  if (cliente.nombre.trim().length < 3) { error.textContent = 'Escribe tu nombre completo.'; return; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cliente.correo.trim())) { error.textContent = 'Escribe un correo válido.'; return; }

  error.textContent = '';
  boton.disabled = true;
  boton.textContent = 'Procesando…';
  try {
    const factura = await comprar();
    vaciar();
    pintarFactura(factura);
  } catch (err) {
    error.textContent = err.message;
    boton.disabled = false;
    boton.textContent = 'Comprar';
  }
});

pintarCarrito();