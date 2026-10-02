import mongoose from 'mongoose';

export const ANIMOS = ['calma', 'foco', 'nostalgia', 'energia', 'romance'];

const productoSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true, trim: true, maxlength: 80 },
    descripcion: { type: String, trim: true, maxlength: 500, default: '' },
    precio: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    animo: { type: String, required: true, enum: ANIMOS },
    notas: { type: [String], default: [] },
    horasQuemado: { type: Number, min: 1, default: 30 },
    color: { type: String, default: '#D9CFF2' },
    activo: { type: Boolean, default: true },
  },
  { timestamps: true }
);

productoSchema.index({ animo: 1, precio: 1 });
productoSchema.index({ nombre: 'text', descripcion: 'text' });

export const Producto = mongoose.model('Producto', productoSchema);