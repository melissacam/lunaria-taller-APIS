import mongoose from 'mongoose';
import { Producto } from '../models/Producto.js';

export class ErrorNegocio extends Error {
  constructor(mensaje, codigo = 400) {
    super(mensaje);
    this.codigo = codigo;
  }
}

function validarId(id) {
  if (!mongoose.isValidObjectId(id)) {
    throw new ErrorNegocio('ID de producto inválido', 400);
  }
}

export async function listar({ animo, busqueda } = {}) {
  const filtro = { activo: true };
  if (animo) filtro.animo = animo;
  if (busqueda) filtro.$text = { $search: busqueda };
  return Producto.find(filtro).sort({ createdAt: -1 }).lean();
}

export async function obtener(id) {
  validarId(id);
  const producto = await Producto.findById(id).lean();
  if (!producto) throw new ErrorNegocio('Producto no encontrado', 404);
  return producto;
}

export async function crear(datos) {
  try {
    const producto = await Producto.create(datos);
    return producto.toObject();
  } catch (e) {
    if (e.name === 'ValidationError') throw new ErrorNegocio(e.message, 400);
    throw e;
  }
}

export async function actualizar(id, datos) {
  validarId(id);
  try {
    const producto = await Producto.findByIdAndUpdate(id, datos, {
      new: true,
      runValidators: true,
    }).lean();
    if (!producto) throw new ErrorNegocio('Producto no encontrado', 404);
    return producto;
  } catch (e) {
    if (e.name === 'ValidationError') throw new ErrorNegocio(e.message, 400);
    throw e;
  }
}

export async function eliminar(id) {
  validarId(id);
  const producto = await Producto.findByIdAndDelete(id).lean();
  if (!producto) throw new ErrorNegocio('Producto no encontrado', 404);
  return producto;
}