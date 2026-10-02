const oyentes = new Set();

export const alRegistrar = (fn) => oyentes.add(fn);

// Ejecuta una petición, mide cuánto tarda y avisa a quien esté escuchando
export async function medir(api, etiqueta, fn) {
  const inicio = performance.now();
  const { datos, bytes } = await fn();
  const ms = Math.round(performance.now() - inicio);
  oyentes.forEach((o) => o({ api, etiqueta, ms, bytes }));
  return datos;
}