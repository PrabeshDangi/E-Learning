const Joi = require("joi");

// Joi validation schema for user credentials
const authSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  name: Joi.string().min(4).max(30).required(),
  role: Joi.string().valid("USER", "SUPERADMIN").optional(),
  // picture: Joi.string().required(),
});

// Function to validate email and password
const validateAuth = (data) => {
  return authSchema.validate(data);
};

module.exports = validateAuth;
