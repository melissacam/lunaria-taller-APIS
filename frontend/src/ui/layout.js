import '../style.css';
import { obtenerApiActiva, fijarApiActiva } from '../api/index.js';
import { alRegistrar } from '../api/monitor.js';
import { contar } from '../store/carrito.js';

const APIS = [
  { id: 'rest', nombre: 'REST', tono: 'bg-menta' },
  { id: 'graphql', nombre: 'GraphQL', tono: 'bg-lila' },
  { id: 'soap', nombre: 'SOAP', tono: 'bg-bruma' },
];
const ENLACES = [
  { id: 'catalogo', texto: 'Catálogo', href: '/index.html' },
  { id: 'carrito', texto: 'Carrito', href: '/carrito.html' },
  { id: 'admin', texto: 'Taller', href: '/admin.html' },
];

export function montarLayout(activo) {
  const raiz = document.getElementById('navbar');

  function actualizarBadge() {
    const badge = raiz.querySelector('[data-badge]');
    if (!badge) return;
    const n = contar();
    badge.textContent = n;
    badge.classList.toggle('hidden', n === 0);
  }

  function dibujar() {
    const actual = obtenerApiActiva();
    raiz.innerHTML = `
      <header class="sticky top-0 z-30 border-b border-ciruela/10 bg-crema/80 backdrop-blur">
        <div class="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-8 gap-y-3 px-5 py-3">
          <a href="/index.html" class="font-display text-2xl font-bold tracking-tight">Lunaria<span class="text-brasa">.</span></a>
          <nav class="flex items-center gap-6 text-sm font-medium">
            ${ENLACES.map((e) => `
              <a href="${e.href}" class="pb-0.5 ${e.id === activo ? 'border-b-2 border-ciruela' : 'opacity-70 hover:opacity-100'}">
                ${e.texto}
                ${e.id === 'carrito' ? '<span data-badge class="ml-1 hidden rounded-full bg-brasa px-1.5 py-0.5 text-[10px] font-bold text-white"></span>' : ''}
              </a>`).join('')}
          </nav>
          <div class="flex items-center gap-2 text-xs" role="group" aria-label="API de conexión">
            <span class="opacity-60">vía</span>
            ${APIS.map((a) => `
              <button data-api="${a.id}" class="rounded-full px-3 py-1 font-bold transition ${a.id === actual ? `${a.tono} ring-2 ring-ciruela/40` : 'bg-white/60 hover:bg-white'}">${a.nombre}</button>`).join('')}
          </div>
        </div>
      </header>`;
    actualizarBadge();
  }

  raiz.addEventListener('click', (e) => {
    const boton = e.target.closest('[data-api]');
    if (!boton || boton.dataset.api === obtenerApiActiva()) return;
    fijarApiActiva(boton.dataset.api);
    dibujar();
    window.dispatchEvent(new CustomEvent('api-cambiada'));   // las páginas recargan sus datos
  });
  window.addEventListener('carrito-actualizado', actualizarBadge);

  // Indicador flotante: muestra por dónde viajó la última petición
  const chip = document.createElement('div');
  chip.className = 'fixed bottom-4 left-4 z-40 hidden rounded-full border border-ciruela/10 bg-white/90 px-4 py-2 text-xs font-medium shadow-lg';
  chip.setAttribute('aria-live', 'polite');
  document.body.appendChild(chip);
  alRegistrar(({ api, etiqueta, ms, bytes }) => {
    chip.classList.remove('hidden');
    chip.textContent = `${api.toUpperCase()} · ${etiqueta} · ${ms} ms · ${(bytes / 1024).toFixed(1)} KB`;
  });

  dibujar();
}