const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  token_number: { type: Number, required: true },
  student_name: { type: String, required: true, trim: true },
  student_phone: { type: String, required: true },
  file_link: { type: String, required: true },
  file_type: { type: String, enum: ['PDF', 'DOCX', 'PPT', 'IMAGE'], required: true },
  copies: { type: Number, required: true, min: 1, max: 50 },
  color: { type: String, enum: ['BLACK_WHITE', 'COLOR'], required: true },
  double_sided: { type: Boolean, required: true },
  special_instructions: { type: String, default: '', maxlength: 200 },
  status: {
    type: String,
    enum: ['PENDING', 'PRINTING', 'READY', 'COLLECTED', 'CANCELLED'],
    default: 'PENDING',
  },
  sms_sent: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now },
  ready_at: { type: Date },
  collected_at: { type: Date },
});

module.exports = mongoose.model('Order', orderSchema);
