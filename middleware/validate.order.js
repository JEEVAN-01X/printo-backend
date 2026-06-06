const Joi = require('joi');

const orderSchema = Joi.object({
  student_name: Joi.string().min(2).max(60).required(),
  student_phone: Joi.string().pattern(/^[6-9]\d{9}$/).required(),
  file_link: Joi.string().uri({ scheme: 'https' }).required(),
  file_type: Joi.valid('PDF', 'DOCX', 'PPT', 'IMAGE').required(),
  copies: Joi.number().integer().min(1).max(50).required(),
  color: Joi.valid('BLACK_WHITE', 'COLOR').required(),
  double_sided: Joi.boolean().required(),
  special_instructions: Joi.string().max(200).allow('').optional(),
});

const validateOrder = (req, res, next) => {
  const { error } = orderSchema.validate(req.body, { abortEarly: false });

  if (error) {
    const messages = error.details.map(d => d.message);
    return res.status(400).json({ success: false, error: messages });
  }

  next();
};

module.exports = validateOrder;
