const prisma = require('../prismaClient');
const xlsx = require('xlsx');

const uploadFeedback = async (req, res) => {
  try {
    const { courseId, fileTypes } = req.body;
    
    if (!courseId) {
      return res.status(400).json({ error: 'courseId is required' });
    }

    const typesArray = fileTypes ? (Array.isArray(fileTypes) ? fileTypes : JSON.parse(fileTypes)) : [];
    
    const files = req.files;
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const results = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileType = typesArray[i] || 'UNKNOWN';
      
      const workbook = xlsx.read(file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(sheet);

      // Create UploadedFile
      const uploadedFile = await prisma.uploadedFile.create({
        data: {
          fileName: file.originalname,
          fileType: fileType,
          courseId: parseInt(courseId, 10),
        }
      });

      // Prepare records & analytics
      let totalScores = {};
      let counts = {};
      const recordsToInsert = [];

      data.forEach((row) => {
        let responses = {};
        for (const [key, val] of Object.entries(row)) {
          // Identify question columns (e.g. CO1, Q1)
          if (fileType === 'CO' && key.toLowerCase().startsWith('co') && typeof val === 'number') {
            responses[key.toUpperCase()] = val;
          } else if ((fileType === 'CURRICULUM' || fileType === 'TEACHING') && key.toLowerCase().startsWith('q') && typeof val === 'number') {
            responses[key.toUpperCase()] = val;
          }
        }

        // Only insert if row has at least one valid response
        if (Object.keys(responses).length > 0) {
            for (const [q, score] of Object.entries(responses)) {
            totalScores[q] = (totalScores[q] || 0) + score;
            counts[q] = (counts[q] || 0) + 1;
            }

            recordsToInsert.push({
            uploadedFileId: uploadedFile.id,
            studentIdentifier: String(row['Roll No'] || row['Student ID'] || row['ID'] || `student_${Math.random().toString(36).substring(7)}`),
            responses: responses
            });
        }
      });

      if (recordsToInsert.length > 0) {
        await prisma.manualFeedbackRecord.createMany({
          data: recordsToInsert
        });
      }

      // Calculate Averages
      let questionAverages = {};
      let sumAll = 0;
      let qCountAll = 0;
      for (const [q, total] of Object.entries(totalScores)) {
        questionAverages[q] = parseFloat((total / counts[q]).toFixed(2));
        sumAll += questionAverages[q];
        qCountAll++;
      }

      let overallAvg = qCountAll > 0 ? parseFloat((sumAll / qCountAll).toFixed(2)) : 0;
      
      const analysis = await prisma.analysisResult.create({
        data: {
          uploadedFileId: uploadedFile.id,
          questionAverages: questionAverages,
          overallSummary: {
            totalResponses: recordsToInsert.length,
            overallAverage: overallAvg
          }
        }
      });

      results.push({
        file: file.originalname,
        type: fileType,
        analysis
      });
    }

    res.status(200).json({ message: 'Files uploaded successfully', results });

  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({ error: 'Failed to process files' });
  }
};

const getAnalysis = async (req, res) => {
  try {
    const { courseId } = req.query;
    
    const courseWhere = courseId ? { id: parseInt(courseId, 10) } : {};
    
    if (req.user.role === 'FACULTY') {
       courseWhere.facultyId = req.user.id; 
    }

    const files = await prisma.uploadedFile.findMany({
      where: {
        ...(courseId ? { courseId: parseInt(courseId, 10) } : {}),
        course: courseWhere
      },
      include: {
        analysis: true,
        course: {
          select: { code: true, name: true, branch: true, semester: true }
        }
      },
      orderBy: { uploadedAt: 'desc' }
    });

    res.status(200).json(files);
  } catch (error) {
    console.error('Analysis Error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
};

module.exports = {
  uploadFeedback,
  getAnalysis
};
