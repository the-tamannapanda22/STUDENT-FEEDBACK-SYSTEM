const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS ActionPlan (
      id INT AUTO_INCREMENT PRIMARY KEY,
      courseId INT NOT NULL UNIQUE,
      facultyId INT,
      status VARCHAR(191) NOT NULL DEFAULT 'PENDING',
      planText TEXT,
      createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      updatedAt DATETIME(3) NOT NULL,
      CONSTRAINT ActionPlan_courseId_fkey FOREIGN KEY (courseId) REFERENCES Course(id) ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT ActionPlan_facultyId_fkey FOREIGN KEY (facultyId) REFERENCES User(id) ON DELETE SET NULL ON UPDATE CASCADE
    );
  `);
  console.log('ActionPlan table created (if not exists)');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
