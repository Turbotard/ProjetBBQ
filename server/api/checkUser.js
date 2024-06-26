import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';
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
  const body = await readBody(event);
  const { pseudo, password } = body;

  if (!pseudo || !password) {
    return {
      status: 400,
      body: { error: 'Missing pseudo or password' },
    };
  }

  try {
    const db = await connectToDatabase();
    const collection = db.collection('users');

    const user = await collection.findOne({ pseudo });
    if (!user) {
      return {
        status: 400,
        body: { error: 'Invalid pseudo or password' },
      };
    }

    const isValid = bcrypt.compareSync(password, user.password);
    if (!isValid) {
      return {
        status: 400,
        body: { error: 'Invalid pseudo or password' },
      };
    }

    return {
      status: 200,
      body: { message: 'Login successful' },
    };
  } catch (error) {
    console.error('API error', error);
    return {
      status: 500,
      body: { error: 'Internal Server Error' },
    };
  }
});
