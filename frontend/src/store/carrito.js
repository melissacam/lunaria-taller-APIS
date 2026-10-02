const CLAVE = 'lunaria:carrito';

const leer = () => {
  try { return JSON.parse(localStorage.getItem(CLAVE)) ?? []; } catch { return []; }
};

function guardar(items) {
  localStorage.setItem(CLAVE, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent('carrito-actualizado'));
}

export const obtenerItems = leer;
export const contar = () => leer().reduce((s, i) => s + i.cantidad, 0);
export const total = () => leer().reduce((s, i) => s + i.cantidad * i.precio, 0);

export function agregar(p) {
  const items = leer();
  const existente = items.find((i) => i.id === p.id);
  if (existente) {
    if (existente.cantidad < p.stock) existente.cantidad++;   // nunca más que el stock
  } else {
    items.push({ id: p.id, nombre: p.nombre, precio: p.precio, color: p.color, stock: p.stock, cantidad: 1 });
  }
  guardar(items);
}

export function cambiarCantidad(id, cantidad) {
  const items = leer();
  const item = items.find((i) => i.id === id);
  if (!item) return;
  item.cantidad = Math.max(1, Math.min(cantidad, item.stock));
  guardar(items);
}

export const quitar = (id) => guardar(leer().filter((i) => i.id !== id));
export const vaciar = () => guardar([]);