// Direcciones de las tres APIs (se pueden sobreescribir con variables VITE_*)
export const URLS = {
  rest: import.meta.env.VITE_REST_URL ?? 'http://localhost:3001/api',
  graphql: import.meta.env.VITE_GRAPHQL_URL ?? 'http://localhost:3002/graphql',
  soap: import.meta.env.VITE_SOAP_URL ?? 'http://localhost:3003/soap',
};