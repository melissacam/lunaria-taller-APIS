export const typeDefs = /* GraphQL */ `
  enum Animo { calma foco nostalgia energia romance }

  type Producto {
    id: ID!
    nombre: String!
    descripcion: String
    precio: Float!
    stock: Int!
    animo: Animo!
    notas: [String!]!
    horasQuemado: Int
    color: String
    activo: Boolean!
  }

  input ProductoInput {
    nombre: String!
    descripcion: String
    precio: Float!
    stock: Int!
    animo: Animo!
    notas: [String!]
    horasQuemado: Int
    color: String
  }

  input ProductoActualizarInput {
    nombre: String
    descripcion: String
    precio: Float
    stock: Int
    animo: Animo
    notas: [String!]
    horasQuemado: Int
    color: String
    activo: Boolean
  }

  type Query {
    productos(animo: Animo, busqueda: String): [Producto!]!
    producto(id: ID!): Producto
  }

  type Mutation {
    crearProducto(input: ProductoInput!): Producto!
    actualizarProducto(id: ID!, input: ProductoActualizarInput!): Producto!
    eliminarProducto(id: ID!): Boolean!
  }
`;