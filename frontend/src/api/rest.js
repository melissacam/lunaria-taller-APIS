import { URLS } from '../config.js';
import { medir } from './monitor.js';
import { filtrar } from './campos.js';

const norm = (p) => ({ ...p, id: p._id ?? p.id }); // Mongo devuelve _id

async function pedir(ruta, opciones = {}) {
  let res;
  try {
    res = await fetch(`${URLS.rest}${ruta}`, {
      headers: { 'Content-Type': 'application/json' },
      ...opciones,
    });
  } catch {
    throw new Error('No se pudo conectar con la API REST. ¿Está encendido npm run dev:rest?');
  }
  const texto = await res.text();
  const datos = texto ? JSON.parse(texto) : null;
  if (!res.ok) throw new Error(datos?.error ?? `Error REST (HTTP ${res.status})`);
  return { datos, bytes: new Blob([texto]).size };
}

export async function listar({ animo, busqueda } = {}) {
  const qs = new URLSearchParams();
  if (animo) qs.set('animo', animo);
  if (busqueda) qs.set('busqueda', busqueda);
  const q = qs.toString();
  const datos = await medir('rest', 'listar', () => pedir(`/productos${q ? `?${q}` : ''}`));
  return datos.map(norm);
}

export const obtener = async (id) =>
  norm(await medir('rest', 'obtener', () => pedir(`/productos/${id}`)));

export const crear = async (d) =>
  norm(await medir('rest', 'crear', () =>
    pedir('/productos', { method: 'POST', body: JSON.stringify(filtrar(d)) })));

export const actualizar = async (id, d) =>
  norm(await medir('rest', 'actualizar', () =>
    pedir(`/productos/${id}`, { method: 'PUT', body: JSON.stringify(filtrar(d)) })));

export const eliminar = async (id) => {
  await medir('rest', 'eliminar', () => pedir(`/productos/${id}`, { method: 'DELETE' }));
  return true;
};