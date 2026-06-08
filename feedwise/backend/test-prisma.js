require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaMariaDb } = require('@prisma/adapter-mariadb');
const mariadb = require('mariadb');

async function testConnection() {
  try {
    const dbUrl = new URL(process.env.DATABASE_URL);
    const pool = mariadb.createPool({
      host: dbUrl.hostname,
      port: dbUrl.port ? parseInt(dbUrl.port) : 3306,
      user: dbUrl.username,
      password: dbUrl.password,
      database: dbUrl.pathname.slice(1),
      connectionLimit: 5
    });

    const adapter = new PrismaMariaDb(pool);
    const prisma = new PrismaClient({ adapter });
    
    const count = await prisma.user.count();
    console.log("Success with parsed pool! Users count:", count);
    process.exit(0);
  } catch (e) {
    console.error("Failed:", e);
    process.exit(1);
  }
}
testConnection();
