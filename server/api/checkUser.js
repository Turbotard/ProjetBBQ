import { MongoClient } from 'mongodb';
import { readBody, eventHandler } from 'h3';
import bcrypt from 'bcrypt';

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
      const { pseudo, password } = body;

      if (!pseudo || !password) {
        console.error('Missing pseudo or password', { pseudo, password });
        res.statusCode = 400;
        res.end(JSON.stringify({ error: 'Missing pseudo or password' }));
        return;
      }

      // Check if user exists
      const user = await collection.findOne({ pseudo });

      if (user) {
        // Verify password
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
          res.statusCode = 401;
          res.end(JSON.stringify({ error: 'Incorrect password' }));
          return;
        }
      } else {
        // Hash the password and create user
        const hashedPassword = await bcrypt.hash(password, 10);
        await collection.insertOne({ pseudo, password: hashedPassword });
      }

      res.statusCode = 200;
      res.end(JSON.stringify({ message: 'Authenticated successfully!' }));
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
