import mongoose from 'mongoose';
import { conectarDB } from './config/db.js';
import { Producto } from './models/Producto.js';

//Borra y llena la colección con 8 velas de ejemplo

const velas = [
  { nombre: 'Bruma de Lavanda', descripcion: 'Una pausa en forma de vela para cerrar el día.', precio: 14.5, stock: 25, animo: 'calma', notas: ['lavanda', 'camomila', 'vainilla'], horasQuemado: 40, color: '#D9CFF2' },
  { nombre: 'Té Blanco y Luna', descripcion: 'Ligera, limpia, casi silenciosa.', precio: 16, stock: 18, animo: 'calma', notas: ['té blanco', 'pera', 'almizcle'], horasQuemado: 35, color: '#CFE3F5' },
  { nombre: 'Café de Escritorio', descripcion: 'Para sentarse a trabajar sin distraerse.', precio: 15, stock: 30, animo: 'foco', notas: ['café', 'cedro', 'cardamomo'], horasQuemado: 45, color: '#FFD9C7' },
  { nombre: 'Menta Helada', descripcion: 'Un golpe de aire fresco para la mente cansada.', precio: 13, stock: 22, animo: 'foco', notas: ['menta', 'eucalipto', 'limón'], horasQuemado: 30, color: '#CDEBDD' },
  { nombre: 'Verano del 99', descripcion: 'Huele a patio, a sandía y a vacaciones largas.', precio: 17, stock: 12, animo: 'nostalgia', notas: ['sandía', 'coco', 'tierra mojada'], horasQuemado: 40, color: '#FFE6B8' },
  { nombre: 'Biblioteca Antigua', descripcion: 'Papel viejo, madera y tardes de lluvia.', precio: 18.5, stock: 10, animo: 'nostalgia', notas: ['papel', 'sándalo', 'tabaco suave'], horasQuemado: 50, color: '#EAD7C3' },
  { nombre: 'Mandarina al Alba', descripcion: 'Despierta el cuerpo antes que el despertador.', precio: 14, stock: 28, animo: 'energia', notas: ['mandarina', 'jengibre', 'pomelo'], horasQuemado: 35, color: '#FFE0B0' },
  { nombre: 'Cita a las Ocho', descripcion: 'Cálida, un poco misteriosa, nada tímida.', precio: 19, stock: 15, animo: 'romance', notas: ['rosa', 'ámbar', 'pimienta rosa'], horasQuemado: 45, color: '#F7CFE0' },
];

async function main() {
  await conectarDB();
  await Producto.deleteMany({});
  const creados = await Producto.insertMany(velas);
  console.log(`Seed completado: ${creados.length} productos insertados`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('Error en el seed:', err.message);
  process.exit(1);
});