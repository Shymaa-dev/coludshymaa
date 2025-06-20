const documentService = require('../services/documentService');

const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const document = await documentService.uploadDocument(req.file);
    res.status(201).json(document);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllDocuments = async (req, res) => {
  try {
    const documents = await documentService.getAllDocuments();
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getDocumentsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const documents = await documentService.getDocumentsByCategory(category);
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    await documentService.deleteDocument(id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  uploadDocument,
  getAllDocuments,
  getDocumentsByCategory,
  deleteDocument,
}; 