require("dotenv").config({ path: ".env.local" });
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function testConnection() {
  try {
    const client = await pool.connect();
    console.log("Connected to PostgreSQL");
    const res = await client.query("SELECT version()");
    console.log("Version:", res.rows[0]);
    client.release();
  } catch (error) {
    console.error("Connection failed:", error);
  } finally {
    await pool.end();
  }
}

testConnection();
