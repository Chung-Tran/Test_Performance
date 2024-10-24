const Joi = require("joi");
const { models } = require("mongoose");

const createStudentSchema = Joi.object({
  studentId: Joi.string().required().messages({
    "string.base": "'{#key}' should be a string",
    "string.empty": "'{#key}' cannot be empty",
    "any.required": "'{#key}' is required",
  }),
  firstName: Joi.string()
    .min(3)
    .max(50)
    .pattern(/^[a-zA-Z\s-.'\u00C0-\u024F\u1E00-\u1EFF]+$/, "valid characters")
    .required()
    .messages({
      "string.base": "'{#key}' should be a string",
      "string.empty": "'{#key}' cannot be empty",
      "string.min": "'{#key}' should have a minimum length of {#limit}",
      "string.max": "'{#key}' should have a maximum length of {#limit}",
      "string.pattern.name": "'{#key}' can only contain letters and spaces",
      "any.required": "'{#key}' is required",
    }),
  lastName: Joi.string().alphanum().min(3).max(30).required().messages({
    "string.base": "'{#key}' should be a string",
    "string.empty": "'{#key}' cannot be empty",
    "string.min": "'{#key}' should have a minimum length of {#limit}",
    "string.max": "'{#key}' should have a maximum length of {#limit}",
    "string.alphanum": "'{#key}' can only contain alphanumeric characters",
    "any.required": "'{#key}' is required",
  }),
  email: Joi.string().email({ minDomainSegments: 2 }).required().messages({
    "string.base": "'{#key}' should be a string",
    "string.empty": "'{#key}' cannot be empty",
    "string.email": "'{#key}' must be a valid email",
    "any.required": "'{#key}' is required",
  }),
  dateOfBirth: Joi.date().optional().messages({
    "date.base": "'{#key}' must be a valid string",
    "string.date": "'{#key}' must be a valid date",
  }),
  gender: Joi.string().valid("Male", "Female", "Other").optional().messages({
    "string.base": "'{#key}' should be a string",
    "any.only": "'{#key}' must be one of ['Male', 'Female', 'Other']",
  }),
  phoneNumber: Joi.string()
    .pattern(/^[0-9]{10,15}$/, "numbers")
    .required()
    .messages({
      "string.base": "'{#key}' should be a string",
      "string.empty": "'{#key}' cannot be empty",
      "string.pattern.name":
        "'{#key}' must be a valid phone number containing only digits and must be 10 to 15 digits long",
      "any.required": "'{#key}' is required",
    }),
  address: Joi.string()
    .optional()
    .custom((value, helpers) => {
      if (value.trim() === "")
        return helpers.message("'{#key}' cannot be empty");
      return value;
    })
    .messages({
      "string.base": "'{#key}' should be a string",
    }),
  status: Joi.string().length(24).hex().required(),
  faculty: Joi.string().length(24).hex().required(),
});

module.exports = { createStudentSchema };
