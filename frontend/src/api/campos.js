export const CAMPOS = ['nombre', 'descripcion', 'precio', 'stock', 'animo', 'notas', 'horasQuemado', 'color'];

// Deja solo los campos válidos, para que las tres APIs reciban exactamente lo mismo
export const filtrar = (datos) =>
  Object.fromEntries(CAMPOS.filter((c) => datos[c] !== undefined).map((c) => [c, datos[c]]));