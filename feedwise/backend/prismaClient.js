const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

let prisma;

try {
  prisma = new PrismaClient();
  console.log("Database Engine Successfully Bridged");
} catch (e) {
  console.error("Prisma Core failed to attach:", e);
}

module.exports = prisma;
