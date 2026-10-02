import express from 'express';
import cors from 'cors';
import { conectarDB } from '../config/db.js';
import { ErrorNegocio } from '../services/productoService.js';
import productosRoutes from './routes/productos.routes.js';

const app = express();

app.use(cors());           // permite que el frontend (otro puerto) llame a la API
app.use(express.json());   // convierte el body JSON en req.body

app.use('/api/productos', productosRoutes);

// Ruta inexistente
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Manejo central de errores (debe tener 4 parámetros)
app.use((err, req, res, next) => {
  if (err instanceof ErrorNegocio) {
    return res.status(err.codigo).json({ error: err.message });
  }
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

const puerto = process.env.REST_PORT || 3001;
await conectarDB();
app.listen(puerto, () => console.log(`API REST en http://localhost:${puerto}/api`));

//probar npm run dev:rest