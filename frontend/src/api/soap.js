import { URLS } from '../config.js';
import { medir } from './monitor.js';
import { filtrar } from './campos.js';

const NS = 'http://lunaria.local/soap';

const esc = (v) =>
  String(v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[c]));

// Construye el sobre XML: <Envelope><Body><Operación>…campos…</Operación></Body></Envelope>
function sobre(operacion, campos = {}) {
  const cuerpo = Object.entries(campos)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .flatMap(([k, v]) => [].concat(v).map((x) => `<tns:${k}>${esc(x)}</tns:${k}>`))
    .join('');
  return `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tns="${NS}">
  <soap:Body><tns:${operacion}>${cuerpo}</tns:${operacion}></soap:Body>
</soap:Envelope>`;
}

// Ayudantes para recorrer el XML ignorando prefijos de namespace
const hijos = (el, nombre) => [...el.children].filter((c) => c.localName === nombre);
const buscarEn = (el, nombre) => [...el.getElementsByTagName('*')].find((e) => e.localName === nombre);

function leerProducto(el) {
  const t = (n) => hijos(el, n)[0]?.textContent;
  return {
    id: t('id'),
    nombre: t('nombre'),
    descripcion: t('descripcion') ?? '',
    precio: Number(t('precio')),
    stock: Number(t('stock')),
    animo: t('animo'),
    notas: hijos(el, 'notas').map((n) => n.textContent),
    horasQuemado: t('horasQuemado') !== undefined ? Number(t('horasQuemado')) : undefined,
    color: t('color'),
  };
}

async function llamar(operacion, campos) {
  let res;
  try {
    res = await fetch(URLS.soap, {
      method: 'POST',
      headers: { 'Content-Type': 'text/xml; charset=utf-8', SOAPAction: `"${NS}/${operacion}"` },
      body: sobre(operacion, campos),
    });
  } catch {
    throw new Error('No se pudo conectar con SOAP. ¿Está encendido npm run dev:soap?');
  }
  const texto = await res.text();
  const xml = new DOMParser().parseFromString(texto, 'text/xml');
  // En SOAP los errores llegan como <Fault> (normalmente con HTTP 500)
  const falla = buscarEn(xml.documentElement, 'faultstring');
  if (falla) throw new Error(falla.textContent);
  if (!res.ok) throw new Error(`Error SOAP (HTTP ${res.status})`);
  const cuerpo = hijos(xml.documentElement, 'Body')[0];
  const respuesta = hijos(cuerpo, `${operacion}Response`)[0];
  return { datos: respuesta, bytes: new Blob([texto]).size };
}

export async function listar({ animo, busqueda } = {}) {
  const r = await medir('soap', 'listar', () => llamar('GetProductos', { animo, busqueda }));
  return hijos(r, 'producto').map(leerProducto);
}

export async function obtener(id) {
  const r = await medir('soap', 'obtener', () => llamar('GetProducto', { id }));
  return leerProducto(hijos(r, 'producto')[0]);
}

export async function crear(d) {
  const r = await medir('soap', 'crear', () => llamar('CrearProducto', filtrar(d)));
  return leerProducto(hijos(r, 'producto')[0]);
}

export async function actualizar(id, d) {
  const r = await medir('soap', 'actualizar', () => llamar('ActualizarProducto', { id, ...filtrar(d) }));
  return leerProducto(hijos(r, 'producto')[0]);
}

export async function eliminar(id) {
  await medir('soap', 'eliminar', () => llamar('EliminarProducto', { id }));
  return true;
}