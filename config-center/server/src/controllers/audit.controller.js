const auditService = require('../services/audit.service');

class AuditController {
  // GET /api/v1/audit-logs
  async getLogs(req, res) {
    try {
      const {
        service_name, environment, operator, operation_type,
        start_time, end_time, page = 1, page_size = 20
      } = req.query;
      
      const filters = {};
      if (service_name) filters.serviceName = service_name;
      if (environment) filters.environment = environment;
      if (operator) filters.operator = operator;
      if (operation_type) filters.operationType = operation_type;
      if (start_time) filters.startTime = start_time;
      if (end_time) filters.endTime = end_time;
      
      const result = await auditService.getLogs(
        filters, parseInt(page), parseInt(page_size)
      );
      
      res.json({ code: 0, data: result });
    } catch (error) {
      res.status(500).json({ code: 500, message: error.message });
    }
  }
}

module.exports = new AuditController();
