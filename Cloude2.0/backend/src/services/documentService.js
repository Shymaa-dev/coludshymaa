const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const Document = require('../models/Document');
const s3Service = require('../utils/s3Service');

const extractTitleFromPDF = async (buffer) => {
  try {
    const data = await pdfParse(buffer);
    // Extract first line as title (you might want to implement more sophisticated title extraction)
    const title = data.text.split('\n')[0].trim();
    return title || 'Untitled Document';
  } catch (error) {
    throw new Error(`Error extracting title from PDF: ${error.message}`);
  }
};

const extractTitleFromDocx = async (buffer) => {
  try {
    const result = await mammoth.extractRawText({ buffer });
    // Extract first line as title
    const title = result.value.split('\n')[0].trim();
    return title || 'Untitled Document';
  } catch (error) {
    throw new Error(`Error extracting title from DOCX: ${error.message}`);
  }
};

const determineCategory = (title) => {
  // Implement your categorization logic here
  // This is a simple example - you might want to use NLP or more sophisticated categorization
  const titleLower = title.toLowerCase();
  
  if (titleLower.includes('report')) return 'Reports';
  if (titleLower.includes('contract')) return 'Contracts';
  if (titleLower.includes('invoice')) return 'Invoices';
  if (titleLower.includes('proposal')) return 'Proposals';
  return 'Other';
};

const uploadDocument = async (file) => {
  let s3Result = null; // Declare s3Result here
  try {
    // Upload to S3
    s3Result = await s3Service.uploadFile(file);
    
    // Extract title based on file type
    let title;
    if (file.mimetype === 'application/pdf') {
      title = await extractTitleFromPDF(file.buffer);
    } else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      title = await extractTitleFromDocx(file.buffer);
    } else {
      throw new Error('Unsupported file type');
    }

    // Determine category
    const category = determineCategory(title);

    // Create document in database
    const document = new Document({
      title,
      originalName: file.originalname,
      fileType: file.mimetype.split('/')[1],
      s3Key: s3Result.s3Key,
      category,
    });

    await document.save();
    return document;
  } catch (error) {
    // If there's an error, clean up the S3 upload if s3Result is defined
    if (s3Result) {
      await s3Service.deleteFile(s3Result.s3Key);
    }
    throw error;
  }
};

const getAllDocuments = async () => {
  return Document.find().sort({ uploadDate: -1 });
};

const getDocumentsByCategory = async (category) => {
  return Document.find({ category }).sort({ uploadDate: -1 });
};

const deleteDocument = async (documentId) => {
  const document = await Document.findById(documentId);
  if (!document) {
    throw new Error('Document not found');
  }

  await s3Service.deleteFile(document.s3Key);
  await Document.findByIdAndDelete(documentId);
};

module.exports = {
  uploadDocument,
  getAllDocuments,
  getDocumentsByCategory,
  deleteDocument,
}; 