const validatorService = require('../services/validator.service');

class ValidatorController {
  // POST /api/v1/validators/validate
  async validate(req, res) {
    try {
      const { value, value_type, rules } = req.body;
      
      if (value === undefined) {
        return res.status(400).json({
          code: 400,
          message: 'value is required'
        });
      }
      
      const result = validatorService.validate(value, value_type || 'string', rules || {});
      
      if (result.valid) {
        res.json({ code: 0, message: 'Validation passed', data: { valid: true } });
      } else {
        res.status(400).json({
          code: 400,
          message: 'Validation failed',
          errors: result.errors
        });
      }
    } catch (error) {
      res.status(500).json({ code: 500, message: error.message });
    }
  }
}

module.exports = new ValidatorController();
