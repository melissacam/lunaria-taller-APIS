import * as servicio from '../../services/productoService.js';

// GET /api/productos?animo=calma&busqueda=lavanda
export const listar = async (req, res) => {
  const { animo, busqueda } = req.query;       // filtros opcionales por URL
  res.json(await servicio.listar({ animo, busqueda }));
};

// GET /api/productos/:id
export const obtener = async (req, res) => {
  res.json(await servicio.obtener(req.params.id));  // :id viene de la URL
};

// POST /api/productos  (los datos llegan en el body como JSON)
export const crear = async (req, res) => {
  res.status(201).json(await servicio.crear(req.body));  // 201 = Creado
};

// PUT /api/productos/:id
export const actualizar = async (req, res) => {
  res.json(await servicio.actualizar(req.params.id, req.body));
};

// DELETE /api/productos/:id
export const eliminar = async (req, res) => {
  await servicio.eliminar(req.params.id);
  res.status(204).end();                       // 204 = Sin contenido
};



//El controlador solo traduce HTTP a llamadas al servicio. 
// Lee los datos de la petición (params, query, body), 
// llama a la lógica y responde con el código HTTP correcto.
//  No toca la base de datos directamente.