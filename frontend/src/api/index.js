import * as rest from './rest.js';
import * as graphql from './graphql.js';
import * as soap from './soap.js';

const APIS = { rest, graphql, soap };
const CLAVE = 'lunaria:api';

export function obtenerApiActiva() {
  const guardada = localStorage.getItem(CLAVE);
  return APIS[guardada] ? guardada : 'rest';
}

export const fijarApiActiva = (nombre) => localStorage.setItem(CLAVE, nombre);

// El resto de la app solo usa "api.listar()", sin saber qué arquitectura hay detrás
export const api = {
  listar: (...a) => APIS[obtenerApiActiva()].listar(...a),
  obtener: (...a) => APIS[obtenerApiActiva()].obtener(...a),
  crear: (...a) => APIS[obtenerApiActiva()].crear(...a),
  actualizar: (...a) => APIS[obtenerApiActiva()].actualizar(...a),
  eliminar: (...a) => APIS[obtenerApiActiva()].eliminar(...a),
};