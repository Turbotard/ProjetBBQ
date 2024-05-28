import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
});

async function testConnection() {
  try {
    await client.connect();
    const db = client.db(process.env.YOUR_DB_NAME);
    console.log('Connected to database:', db.databaseName);
    await client.close();
  } catch (error) {
    console.error('Failed to connect to MongoDB', error);
  }
}

testConnection();
