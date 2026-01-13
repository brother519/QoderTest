const configService = require('../services/config.service');
const validatorService = require('../services/validator.service');
const auditService = require('../services/audit.service');

class ConfigController {
  // GET /api/v1/configs
  async getConfigs(req, res) {
    try {
      const { service_name, environment, page = 1, page_size = 20 } = req.query;
      
      if (!service_name || !environment) {
        return res.status(400).json({
          code: 400,
          message: 'service_name and environment are required'
        });
      }
      
      const result = await configService.getConfigs(
        service_name, environment,
        parseInt(page), parseInt(page_size)
      );
      
      res.json({ code: 0, message: 'success', data: result });
    } catch (error) {
      res.status(500).json({ code: 500, message: error.message });
    }
  }
  
  // GET /api/v1/configs/:id
  async getConfigById(req, res) {
    try {
      const { id } = req.params;
      const config = await configService.getConfigById(id);
      
      if (!config) {
        return res.status(404).json({ code: 404, message: 'Config not found' });
      }
      
      res.json({ code: 0, data: config });
    } catch (error) {
      res.status(500).json({ code: 500, message: error.message });
    }
  }
  
  // GET /api/v1/configs/by-key
  async getConfigByKey(req, res) {
    try {
      const { service_name, environment, key } = req.query;
      
      if (!service_name || !environment || !key) {
        return res.status(400).json({
          code: 400,
          message: 'service_name, environment and key are required'
        });
      }
      
      const config = await configService.getConfigByKey(service_name, environment, key);
      
      if (!config) {
        return res.status(404).json({ code: 404, message: 'Config not found' });
      }
      
      res.json({ code: 0, data: config });
    } catch (error) {
      res.status(500).json({ code: 500, message: error.message });
    }
  }
  
  // POST /api/v1/configs
  async createConfig(req, res) {
    try {
      const {
        service_name, environment, config_key, config_value,
        value_type, description, validator_rules, is_encrypted
      } = req.body;
      
      if (!service_name || !environment || !config_key) {
        return res.status(400).json({
          code: 400,
          message: 'service_name, environment and config_key are required'
        });
      }
      
      // Validate config value
      if (validator_rules) {
        const validation = validatorService.validate(config_value, value_type || 'string', validator_rules);
        if (!validation.valid) {
          return res.status(400).json({
            code: 400,
            message: 'Validation failed',
            errors: validation.errors
          });
        }
      }
      
      const operator = req.headers['x-operator'] || 'system';
      const result = await configService.createConfig({
        serviceName: service_name,
        environment,
        configKey: config_key,
        configValue: config_value,
        valueType: value_type,
        description,
        validatorRules: validator_rules,
        isEncrypted: is_encrypted
      }, operator);
      
      // Audit log
      await auditService.log({
        operationType: 'create',
        resourceId: result.id,
        serviceName: service_name,
        environment,
        configKey: config_key,
        afterValue: config_value,
        operator,
        operatorIp: req.ip,
        userAgent: req.headers['user-agent']
      });
      
      res.status(201).json({
        code: 0,
        message: 'Config created successfully',
        data: result
      });
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({
          code: 409,
          message: 'Config already exists'
        });
      }
      res.status(500).json({ code: 500, message: error.message });
    }
  }
  
  // PUT /api/v1/configs/:id
  async updateConfig(req, res) {
    try {
      const { id } = req.params;
      const { config_value, change_description } = req.body;
      
      // Get existing config for validation
      const existing = await configService.getConfigById(id);
      if (!existing) {
        return res.status(404).json({ code: 404, message: 'Config not found' });
      }
      
      // Validate if rules exist
      if (existing.validator_rules) {
        const rules = typeof existing.validator_rules === 'string' 
          ? JSON.parse(existing.validator_rules) 
          : existing.validator_rules;
        const validation = validatorService.validate(config_value, existing.value_type, rules);
        if (!validation.valid) {
          return res.status(400).json({
            code: 400,
            message: 'Validation failed',
            errors: validation.errors
          });
        }
      }
      
      const operator = req.headers['x-operator'] || 'system';
      const result = await configService.updateConfig(id, {
        configValue: config_value,
        changeDescription: change_description
      }, operator);
      
      // Audit log
      await auditService.log({
        operationType: 'update',
        resourceId: id,
        serviceName: existing.service_name,
        environment: existing.environment,
        configKey: existing.config_key,
        beforeValue: existing.config_value,
        afterValue: config_value,
        operator,
        operatorIp: req.ip,
        userAgent: req.headers['user-agent']
      });
      
      res.json({
        code: 0,
        message: 'Config updated successfully',
        data: result
      });
    } catch (error) {
      res.status(500).json({ code: 500, message: error.message });
    }
  }
  
  // DELETE /api/v1/configs/:id
  async deleteConfig(req, res) {
    try {
      const { id } = req.params;
      
      const existing = await configService.getConfigById(id);
      if (!existing) {
        return res.status(404).json({ code: 404, message: 'Config not found' });
      }
      
      const operator = req.headers['x-operator'] || 'system';
      await configService.deleteConfig(id, operator);
      
      // Audit log
      await auditService.log({
        operationType: 'delete',
        resourceId: id,
        serviceName: existing.service_name,
        environment: existing.environment,
        configKey: existing.config_key,
        beforeValue: existing.config_value,
        operator,
        operatorIp: req.ip,
        userAgent: req.headers['user-agent']
      });
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ code: 500, message: error.message });
    }
  }
  
  // POST /api/v1/configs/batch
  async batchGetConfigs(req, res) {
    try {
      const { service_name, environment, keys } = req.body;
      
      if (!service_name || !environment) {
        return res.status(400).json({
          code: 400,
          message: 'service_name and environment are required'
        });
      }
      
      const result = await configService.batchGetConfigs(service_name, environment, keys);
      
      res.json({ code: 0, data: result });
    } catch (error) {
      res.status(500).json({ code: 500, message: error.message });
    }
  }
  
  // GET /api/v1/configs/:id/versions
  async getVersionHistory(req, res) {
    try {
      const { id } = req.params;
      const { page = 1, page_size = 20 } = req.query;
      
      const result = await configService.getVersionHistory(
        id, parseInt(page), parseInt(page_size)
      );
      
      res.json({ code: 0, data: result });
    } catch (error) {
      res.status(500).json({ code: 500, message: error.message });
    }
  }
  
  // POST /api/v1/configs/:id/rollback
  async rollbackConfig(req, res) {
    try {
      const { id } = req.params;
      const { target_version, rollback_reason } = req.body;
      
      if (!target_version) {
        return res.status(400).json({
          code: 400,
          message: 'target_version is required'
        });
      }
      
      const existing = await configService.getConfigById(id);
      if (!existing) {
        return res.status(404).json({ code: 404, message: 'Config not found' });
      }
      
      const operator = req.headers['x-operator'] || 'system';
      const result = await configService.rollbackToVersion(
        id, target_version, rollback_reason, operator
      );
      
      // Audit log
      await auditService.log({
        operationType: 'rollback',
        resourceId: id,
        serviceName: existing.service_name,
        environment: existing.environment,
        configKey: existing.config_key,
        beforeValue: existing.config_value,
        afterValue: `Rollback to version ${target_version}`,
        operator,
        operatorIp: req.ip,
        userAgent: req.headers['user-agent']
      });
      
      res.json({
        code: 0,
        message: 'Rollback successful',
        data: result
      });
    } catch (error) {
      res.status(500).json({ code: 500, message: error.message });
    }
  }
}

module.exports = new ConfigController();
