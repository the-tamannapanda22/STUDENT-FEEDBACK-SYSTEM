const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS UploadedFile (
      id INT AUTO_INCREMENT PRIMARY KEY,
      fileName VARCHAR(191) NOT NULL,
      fileType VARCHAR(191) NOT NULL,
      uploadedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      courseId INT NOT NULL,
      CONSTRAINT UploadedFile_courseId_fkey FOREIGN KEY (courseId) REFERENCES Course(id) ON DELETE CASCADE ON UPDATE CASCADE
    );
  `);
  
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS ManualFeedbackRecord (
      id INT AUTO_INCREMENT PRIMARY KEY,
      uploadedFileId INT NOT NULL,
      studentIdentifier VARCHAR(191),
      responses JSON NOT NULL,
      CONSTRAINT ManualFeedbackRecord_uploadedFileId_fkey FOREIGN KEY (uploadedFileId) REFERENCES UploadedFile(id) ON DELETE CASCADE ON UPDATE CASCADE
    );
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS AnalysisResult (
      id INT AUTO_INCREMENT PRIMARY KEY,
      uploadedFileId INT NOT NULL UNIQUE,
      questionAverages JSON,
      overallSummary JSON,
      createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      CONSTRAINT AnalysisResult_uploadedFileId_fkey FOREIGN KEY (uploadedFileId) REFERENCES UploadedFile(id) ON DELETE CASCADE ON UPDATE CASCADE
    );
  `);

  console.log('Tables created');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
