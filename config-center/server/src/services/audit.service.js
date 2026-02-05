const db = require('../config/database');

class AuditService {
  // Log an operation
  async log(data) {
    const {
      operationType,
      resourceType = 'config',
      resourceId,
      serviceName,
      environment,
      configKey,
      beforeValue,
      afterValue,
      operator,
      operatorIp,
      userAgent,
      operationStatus = 'success',
      errorMessage
    } = data;
    
    const sql = `
      INSERT INTO audit_logs (
        operation_type, resource_type, resource_id, service_name, environment,
        config_key, before_value, after_value, operator, operator_ip,
        user_agent, operation_status, error_message
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    try {
      await db.query(sql, [
        operationType, resourceType, resourceId, serviceName, environment,
        configKey, beforeValue, afterValue, operator, operatorIp,
        userAgent, operationStatus, errorMessage
      ]);
    } catch (error) {
      console.error('Audit log error:', error.message);
    }
  }
  
  // Get audit logs with filters
  async getLogs(filters = {}, page = 1, pageSize = 20) {
    const offset = (page - 1) * pageSize;
    const conditions = [];
    const params = [];
    
    if (filters.serviceName) {
      conditions.push('service_name = ?');
      params.push(filters.serviceName);
    }
    
    if (filters.environment) {
      conditions.push('environment = ?');
      params.push(filters.environment);
    }
    
    if (filters.operator) {
      conditions.push('operator = ?');
      params.push(filters.operator);
    }
    
    if (filters.operationType) {
      conditions.push('operation_type = ?');
      params.push(filters.operationType);
    }
    
    if (filters.startTime) {
      conditions.push('operation_time >= ?');
      params.push(filters.startTime);
    }
    
    if (filters.endTime) {
      conditions.push('operation_time <= ?');
      params.push(filters.endTime);
    }
    
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    
    // Count total
    const countSql = `SELECT COUNT(*) as total FROM audit_logs ${whereClause}`;
    const [countResult] = await db.query(countSql, params);
    const total = countResult.total;
    
    // Get items
    const sql = `
      SELECT * FROM audit_logs 
      ${whereClause}
      ORDER BY operation_time DESC
      LIMIT ? OFFSET ?
    `;
    const items = await db.query(sql, [...params, pageSize, offset]);
    
    return { total, items, page, pageSize };
  }
}

module.exports = new AuditService();
