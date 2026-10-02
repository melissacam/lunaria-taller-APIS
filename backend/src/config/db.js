import mongoose from 'mongoose';
//Abre la conexión con MongoDB Atlas usando la URI del .env
export async function conectarDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('Falta MONGODB_URI en el archivo .env');

  await mongoose.connect(uri);
  console.log(`MongoDB conectado → base "${mongoose.connection.name}"`);
}