import { ValidationError } from '../shared/errors.js';

const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    const errors = result.error.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    return next(new ValidationError(errors.map((e) => `${e.field}: ${e.message}`).join('; ')));
  }

  req.body = result.data;
  next();
};

export default validate;
