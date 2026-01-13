const db = require('../config/database');
const cacheService = require('./cache.service');
const notificationService = require('./notification.service');

class ConfigService {
  // Get configs list
  async getConfigs(serviceName, environment, page = 1, pageSize = 20) {
    const offset = (page - 1) * pageSize;
    
    const countSql = `SELECT COUNT(*) as total FROM configs WHERE service_name = ? AND environment = ?`;
    const [countResult] = await db.query(countSql, [serviceName, environment]);
    const total = countResult.total;
    
    const sql = `
      SELECT id, service_name, environment, config_key, config_value, 
             value_type, description, validator_rules, version, 
             is_encrypted, created_by, updated_by, created_at, updated_at
      FROM configs 
      WHERE service_name = ? AND environment = ?
      ORDER BY updated_at DESC
      LIMIT ? OFFSET ?
    `;
    const items = await db.query(sql, [serviceName, environment, pageSize, offset]);
    
    return { total, items, page, pageSize };
  }
  
  // Get single config by ID
  async getConfigById(id) {
    const sql = `SELECT * FROM configs WHERE id = ?`;
    const rows = await db.query(sql, [id]);
    return rows[0] || null;
  }
  
  // Get config by key
  async getConfigByKey(serviceName, environment, configKey) {
    // Try cache first
    const cached = await cacheService.getConfig(serviceName, environment, configKey);
    if (cached) return cached;
    
    const sql = `SELECT * FROM configs WHERE service_name = ? AND environment = ? AND config_key = ?`;
    const rows = await db.query(sql, [serviceName, environment, configKey]);
    const config = rows[0] || null;
    
    if (config) {
      await cacheService.setConfig(serviceName, environment, configKey, config);
    }
    
    return config;
  }
  
  // Create config
  async createConfig(data, operator) {
    const { serviceName, environment, configKey, configValue, valueType, description, validatorRules, isEncrypted } = data;
    
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();
      
      // Insert config
      const insertSql = `
        INSERT INTO configs (service_name, environment, config_key, config_value, 
                            value_type, description, validator_rules, is_encrypted, 
                            version, created_by, updated_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
      `;
      const [result] = await conn.execute(insertSql, [
        serviceName, environment, configKey, configValue,
        valueType || 'string', description || null, 
        validatorRules ? JSON.stringify(validatorRules) : null,
        isEncrypted || false, operator, operator
      ]);
      
      const configId = result.insertId;
      
      // Create version record
      const versionSql = `
        INSERT INTO config_versions (config_id, service_name, environment, config_key, 
                                    config_value, value_type, version, change_type, created_by)
        VALUES (?, ?, ?, ?, ?, ?, 1, 'create', ?)
      `;
      await conn.execute(versionSql, [
        configId, serviceName, environment, configKey, configValue, valueType || 'string', operator
      ]);
      
      await conn.commit();
      
      // Clear cache and notify
      await cacheService.deleteConfig(serviceName, environment, configKey);
      await notificationService.notifyConfigChange(serviceName, environment, {
        configKey,
        configValue,
        version: 1,
        changeType: 'create',
        operator
      });
      
      return { id: configId, version: 1 };
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  }
  
  // Update config
  async updateConfig(id, data, operator) {
    const { configValue, changeDescription } = data;
    
    const existing = await this.getConfigById(id);
    if (!existing) {
      throw new Error('Config not found');
    }
    
    const newVersion = existing.version + 1;
    const conn = await db.getConnection();
    
    try {
      await conn.beginTransaction();
      
      // Update config
      const updateSql = `
        UPDATE configs 
        SET config_value = ?, version = ?, updated_by = ?, updated_at = NOW()
        WHERE id = ?
      `;
      await conn.execute(updateSql, [configValue, newVersion, operator, id]);
      
      // Create version record
      const versionSql = `
        INSERT INTO config_versions (config_id, service_name, environment, config_key, 
                                    config_value, value_type, version, change_type, 
                                    change_description, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'update', ?, ?)
      `;
      await conn.execute(versionSql, [
        id, existing.service_name, existing.environment, existing.config_key,
        configValue, existing.value_type, newVersion, changeDescription || null, operator
      ]);
      
      await conn.commit();
      
      // Clear cache and notify
      await cacheService.deleteConfig(existing.service_name, existing.environment, existing.config_key);
      await notificationService.notifyConfigChange(existing.service_name, existing.environment, {
        configKey: existing.config_key,
        configValue,
        version: newVersion,
        changeType: 'update',
        operator
      });
      
      return { id, version: newVersion };
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  }
  
  // Delete config
  async deleteConfig(id, operator) {
    const existing = await this.getConfigById(id);
    if (!existing) {
      throw new Error('Config not found');
    }
    
    const conn = await db.getConnection();
    
    try {
      await conn.beginTransaction();
      
      // Create version record for delete
      const versionSql = `
        INSERT INTO config_versions (config_id, service_name, environment, config_key, 
                                    config_value, value_type, version, change_type, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'delete', ?)
      `;
      await conn.execute(versionSql, [
        id, existing.service_name, existing.environment, existing.config_key,
        existing.config_value, existing.value_type, existing.version + 1, operator
      ]);
      
      // Delete config
      const deleteSql = `DELETE FROM configs WHERE id = ?`;
      await conn.execute(deleteSql, [id]);
      
      await conn.commit();
      
      // Clear cache and notify
      await cacheService.deleteConfig(existing.service_name, existing.environment, existing.config_key);
      await notificationService.notifyConfigChange(existing.service_name, existing.environment, {
        configKey: existing.config_key,
        configValue: null,
        version: existing.version + 1,
        changeType: 'delete',
        operator
      });
      
      return { success: true };
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  }
  
  // Batch get configs (for SDK)
  async batchGetConfigs(serviceName, environment, keys = null) {
    // Try cache first for all configs
    const cached = await cacheService.getAllConfigs(serviceName, environment);
    if (cached && !keys) {
      return {
        serviceName,
        environment,
        version: Date.now(),
        configs: cached
      };
    }
    
    let sql = `SELECT config_key, config_value, value_type, version FROM configs WHERE service_name = ? AND environment = ?`;
    const params = [serviceName, environment];
    
    if (keys && keys.length > 0) {
      sql += ` AND config_key IN (${keys.map(() => '?').join(',')})`;
      params.push(...keys);
    }
    
    const rows = await db.query(sql, params);
    
    const configs = {};
    rows.forEach(row => {
      configs[row.config_key] = this.parseValue(row.config_value, row.value_type);
    });
    
    // Cache all configs
    if (!keys) {
      await cacheService.setAllConfigs(serviceName, environment, configs);
    }
    
    return {
      serviceName,
      environment,
      version: Date.now(),
      configs
    };
  }
  
  // Parse value based on type
  parseValue(value, type) {
    if (value === null || value === undefined) return null;
    
    switch (type) {
      case 'number':
        return Number(value);
      case 'boolean':
        return value === 'true' || value === true;
      case 'json':
      case 'array':
        try {
          return JSON.parse(value);
        } catch {
          return value;
        }
      default:
        return value;
    }
  }
  
  // Get version history
  async getVersionHistory(configId, page = 1, pageSize = 20) {
    const offset = (page - 1) * pageSize;
    
    const countSql = `SELECT COUNT(*) as total FROM config_versions WHERE config_id = ?`;
    const [countResult] = await db.query(countSql, [configId]);
    const total = countResult.total;
    
    const sql = `
      SELECT * FROM config_versions 
      WHERE config_id = ?
      ORDER BY version DESC
      LIMIT ? OFFSET ?
    `;
    const items = await db.query(sql, [configId, pageSize, offset]);
    
    return { total, items, page, pageSize };
  }
  
  // Rollback to specific version
  async rollbackToVersion(configId, targetVersion, rollbackReason, operator) {
    const existing = await this.getConfigById(configId);
    if (!existing) {
      throw new Error('Config not found');
    }
    
    // Get target version data
    const versionSql = `SELECT * FROM config_versions WHERE config_id = ? AND version = ?`;
    const versions = await db.query(versionSql, [configId, targetVersion]);
    if (versions.length === 0) {
      throw new Error('Target version not found');
    }
    
    const targetData = versions[0];
    const newVersion = existing.version + 1;
    
    const conn = await db.getConnection();
    
    try {
      await conn.beginTransaction();
      
      // Update config to target version's value
      const updateSql = `
        UPDATE configs 
        SET config_value = ?, version = ?, updated_by = ?, updated_at = NOW()
        WHERE id = ?
      `;
      await conn.execute(updateSql, [targetData.config_value, newVersion, operator, configId]);
      
      // Create rollback version record
      const versionInsertSql = `
        INSERT INTO config_versions (config_id, service_name, environment, config_key, 
                                    config_value, value_type, version, change_type, 
                                    change_description, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'rollback', ?, ?)
      `;
      await conn.execute(versionInsertSql, [
        configId, existing.service_name, existing.environment, existing.config_key,
        targetData.config_value, existing.value_type, newVersion,
        `Rollback to version ${targetVersion}: ${rollbackReason || ''}`, operator
      ]);
      
      await conn.commit();
      
      // Clear cache and notify
      await cacheService.deleteConfig(existing.service_name, existing.environment, existing.config_key);
      await notificationService.notifyConfigChange(existing.service_name, existing.environment, {
        configKey: existing.config_key,
        configValue: targetData.config_value,
        version: newVersion,
        changeType: 'rollback',
        operator
      });
      
      return { id: configId, version: newVersion };
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  }
}

module.exports = new ConfigService();
