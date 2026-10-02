import { GraphQLError } from 'graphql';
import * as servicio from '../services/productoService.js';
import { ErrorNegocio } from '../services/productoService.js';

// Traduce los errores de negocio al formato de error de GraphQL
async function ejecutar(fn) {
  try {
    return await fn();
  } catch (e) {
    if (e instanceof ErrorNegocio) {
      throw new GraphQLError(e.message, {
        extensions: { code: e.codigo === 404 ? 'NOT_FOUND' : 'BAD_USER_INPUT' },
      });
    }
    throw e;
  }
}

export const resolvers = {
  // Mongo guarda "_id"; el esquema expone "id"
  Producto: { id: (p) => String(p._id) },

  Query: {
    productos: (_, args) => ejecutar(() => servicio.listar(args)),
    producto: (_, { id }) => ejecutar(() => servicio.obtener(id)),
  },

  Mutation: {
    crearProducto: (_, { input }) => ejecutar(() => servicio.crear(input)),
    actualizarProducto: (_, { id, input }) =>
      ejecutar(() => servicio.actualizar(id, input)),
    eliminarProducto: (_, { id }) =>
      ejecutar(async () => {
        await servicio.eliminar(id);
        return true;
      }),
  },
};