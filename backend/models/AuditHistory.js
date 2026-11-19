const mongoose = require('mongoose');

const AuditHistorySchema = new mongoose.Schema({
  invoiceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Invoice',
    required: true,
    index: true,
  },
  invoiceNumber: {
    type: String,
    required: true,
  },
  action: {
    type: String,
    enum: ['created', 'updated', 'deleted', 'status_changed', 'pdf_generated'],
    required: true,
  },
  changes: {
    type: mongoose.Schema.Types.Mixed,
  },
  performedBy: {
    type: String,
    default: 'Owner',
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('AuditHistory', AuditHistorySchema);
