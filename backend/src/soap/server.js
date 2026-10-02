import fs from 'node:fs';
import express from 'express';
import cors from 'cors';
import soap from 'soap';
import { conectarDB } from '../config/db.js';
import * as servicio from '../services/productoService.js';
import { ErrorNegocio } from '../services/productoService.js';

const wsdl = fs.readFileSync(new URL('./productos.wsdl', import.meta.url), 'utf8');

// Mongo → formato del WSDL (_id pasa a ser id)
const aProducto = (p) => ({
  id: String(p._id),
  nombre: p.nombre,
  descripcion: p.descripcion,
  precio: p.precio,
  stock: p.stock,
  animo: p.animo,
  notas: p.notas,
  horasQuemado: p.horasQuemado,
  color: p.color,
});

// Un solo valor <notas> llega como string; varios llegan como array
const normalizar = ({ notas, ...resto }) => ({
  ...resto,
  ...(notas !== undefined && { notas: [].concat(notas) }),
});

// Errores → SOAP Fault (el formato de error propio de SOAP)
async function ejecutar(fn) {
  try {
    return await fn();
  } catch (e) {
    if (e instanceof ErrorNegocio) {
      throw { Fault: { faultcode: 'soap:Client', faultstring: e.message } };
    }
    console.error(e);
    throw { Fault: { faultcode: 'soap:Server', faultstring: 'Error interno del servidor' } };
  }
}

// Implementación de las operaciones declaradas en el WSDL
const servicios = {
  ProductosService: {
    ProductosPort: {
      GetProductos: (args = {}) =>
        ejecutar(async () => {
          const lista = await servicio.listar({ animo: args.animo, busqueda: args.busqueda });
          return { producto: lista.map(aProducto) };
        }),

      GetProducto: (args) =>
        ejecutar(async () => ({ producto: aProducto(await servicio.obtener(args.id)) })),

      CrearProducto: (args) =>
        ejecutar(async () => ({ producto: aProducto(await servicio.crear(normalizar(args))) })),

      ActualizarProducto: ({ id, ...campos }) =>
        ejecutar(async () => ({
          producto: aProducto(await servicio.actualizar(id, normalizar(campos))),
        })),

      EliminarProducto: (args) =>
        ejecutar(async () => {
          await servicio.eliminar(args.id);
          return { eliminado: true };
        }),
    },
  },
};

const app = express();
app.use(cors());   // permite que el frontend lo consuma (también responde el preflight)

const puerto = process.env.SOAP_PORT || 3003;
await conectarDB();
app.listen(puerto, () => {
  soap.listen(app, { path: '/soap', services: servicios, xml: wsdl });
  console.log(`API SOAP en http://localhost:${puerto}/soap  (WSDL: ?wsdl)`);
});

//probar npm run dev:soap