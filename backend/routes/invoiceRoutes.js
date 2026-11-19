const express = require('express');
const router = express.Router();
const {
  createInvoice,
  getAllInvoices,
  getInvoiceById,
  updateInvoice,
  deleteInvoice,
  downloadPdf,
  previewInvoiceHtml,
  getNextInvoiceNumber,
  getDashboardStats,
} = require('../controllers/invoiceController');

// Dashboard stats
router.get('/dashboard-stats', getDashboardStats);

// Next invoice number
router.get('/next-number', getNextInvoiceNumber);

// Search & list
router.get('/', getAllInvoices);

// Get by ID or Number
router.get('/:id', getInvoiceById);

// Create
router.post('/', createInvoice);

// Update
router.put('/:id', updateInvoice);

// Delete
router.delete('/:id', deleteInvoice);

// PDF Download
router.get('/:id/pdf', downloadPdf);

// Preview HTML
router.get('/:id/preview', previewInvoiceHtml);

module.exports = router;
