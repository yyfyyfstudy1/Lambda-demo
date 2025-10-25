import Joi from 'joi';

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

export const createFamilySchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  description: Joi.string().max(500).optional(),
  members: Joi.array().items(
    Joi.object({
      name: Joi.string().min(1).max(100).required(),
      relationship: Joi.string().min(1).max(50).required(),
      age: Joi.number().min(0).max(150).optional(),
      email: Joi.string().email().optional(),
      phone: Joi.string().max(20).optional()
    })
  ).min(1).required()
});

export const updateFamilySchema = Joi.object({
  name: Joi.string().min(1).max(100).optional(),
  description: Joi.string().max(500).optional(),
  members: Joi.array().items(
    Joi.object({
      name: Joi.string().min(1).max(100).required(),
      relationship: Joi.string().min(1).max(50).required(),
      age: Joi.number().min(0).max(150).optional(),
      email: Joi.string().email().optional(),
      phone: Joi.string().max(20).optional()
    })
  ).min(1).optional()
});

export const validateRequest = <T>(schema: Joi.ObjectSchema, data: any): T => {
  const { error, value } = schema.validate(data, { abortEarly: false });
  if (error) {
    throw new Error(`Validation error: ${error.details.map(d => d.message).join(', ')}`);
  }
  return value;
};
