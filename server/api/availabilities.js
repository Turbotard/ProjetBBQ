import { MongoClient } from 'mongodb';
import { readBody, eventHandler } from 'h3';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
});

let db;

async function connectToDatabase() {
  if (!db) {
    try {
      await client.connect();
      db = client.db(process.env.YOUR_DB_NAME);
    } catch (error) {
      console.error('Failed to connect to MongoDB', error);
      throw error;
    }
  }
  return db;
}

export default eventHandler(async (event) => {
  const req = event.req;
  const res = event.res;

  try {
    const db = await connectToDatabase();
    const collection = db.collection('availabilities');

    if (req.method === 'POST') {
      const body = await readBody(event);
      const { pseudo, availabilities } = body;
      if (!pseudo || !availabilities) {
        console.error('Missing pseudo or availabilities', { pseudo, availabilities });
        res.statusCode = 400;
        res.end(JSON.stringify({ error: 'Missing pseudo or availabilities' }));
        return;
      }
      await collection.updateOne(
        { pseudo },
        { $set: { availabilities } },
        { upsert: true }
      );
      res.statusCode = 200;
      res.end(JSON.stringify({ message: 'Disponibilités sauvegardées!' }));
    } else if (req.method === 'GET') {
      const availabilities = await collection.find({}).toArray();
      res.statusCode = 200;
      res.end(JSON.stringify(availabilities));
    } else {
      console.error('Method not allowed', req.method);
      res.statusCode = 405;
      res.end(JSON.stringify({ error: 'Method not allowed' }));
    }
  } catch (error) {
    console.error('API error', error);
    res.statusCode = 500;
    res.end(JSON.stringify({ error: 'Internal Server Error' }));
  }
});
