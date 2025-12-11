require("dotenv").config({ path: ".env.local" });
const { MongoClient } = require("mongodb");

async function countMongoUsers() {
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const database = client.db("clintonstack");
    const users = database.collection("users");
    const userCount = await users.countDocuments();
    console.log(`Total users in MongoDB: ${userCount}`);
  } catch (error) {
    console.error("Error counting MongoDB users:", error);
  } finally {
    await client.close();
  }
}

countMongoUsers();
