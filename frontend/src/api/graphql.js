import { URLS } from '../config.js';
import { medir } from './monitor.js';
import { filtrar } from './campos.js';

// GraphQL: yo elijo qué campos quiero. La lista pide menos que el detalle.
const LISTA = 'id nombre precio stock animo notas color';
const DETALLE = `${LISTA} descripcion horasQuemado`;

async function ejecutar(query, variables) {
  let res;
  try {
    res = await fetch(URLS.graphql, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables }),
    });
  } catch {
    throw new Error('No se pudo conectar con GraphQL. ¿Está encendido npm run dev:graphql?');
  }
  const texto = await res.text();
  const json = JSON.parse(texto);
  // En GraphQL los errores llegan con HTTP 200, dentro de "errors"
  if (json.errors?.length) throw new Error(json.errors[0].message);
  return { datos: json.data, bytes: new Blob([texto]).size };
}

export async function listar({ animo, busqueda } = {}) {
  const datos = await medir('graphql', 'listar', () =>
    ejecutar(
      `query ($animo: Animo, $busqueda: String) {
         productos(animo: $animo, busqueda: $busqueda) { ${LISTA} }
       }`,
      { animo, busqueda }
    ));
  return datos.productos;
}

export async function obtener(id) {
  const datos = await medir('graphql', 'obtener', () =>
    ejecutar(`query ($id: ID!) { producto(id: $id) { ${DETALLE} } }`, { id }));
  return datos.producto;
}

export async function crear(d) {
  const datos = await medir('graphql', 'crear', () =>
    ejecutar(
      `mutation ($input: ProductoInput!) { crearProducto(input: $input) { ${DETALLE} } }`,
      { input: filtrar(d) }
    ));
  return datos.crearProducto;
}

export async function actualizar(id, d) {
  const datos = await medir('graphql', 'actualizar', () =>
    ejecutar(
      `mutation ($id: ID!, $input: ProductoActualizarInput!) {
         actualizarProducto(id: $id, input: $input) { ${DETALLE} }
       }`,
      { id, input: filtrar(d) }
    ));
  return datos.actualizarProducto;
}

export async function eliminar(id) {
  await medir('graphql', 'eliminar', () =>
    ejecutar(`mutation ($id: ID!) { eliminarProducto(id: $id) }`, { id }));
  return true;
}