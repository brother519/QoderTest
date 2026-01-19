const WebSocket = require('ws');

class ConfigClient {
  constructor(options = {}) {
    this.serverUrl = options.serverUrl || 'http://localhost:3000';
    this.serviceName = options.serviceName;
    this.environment = options.environment || 'dev';
    this.apiKey = options.apiKey;
    
    this.configs = {};
    this.version = 0;
    this.ws = null;
    this.listeners = new Map();
    this.globalListeners = [];
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
    this.reconnectDelay = 1000;
    this.initialized = false;
  }
  
  // Initialize client and load configs
  async init() {
    if (!this.serviceName) {
      throw new Error('serviceName is required');
    }
    
    await this.refresh();
    this.connectWebSocket();
    this.initialized = true;
    
    return this;
  }
  
  // Refresh configs from server
  async refresh() {
    try {
      const url = `${this.serverUrl}/api/v1/configs/batch`;
      const response = await this.httpPost(url, {
        service_name: this.serviceName,
        environment: this.environment
      });
      
      if (response.code === 0) {
        const oldConfigs = { ...this.configs };
        this.configs = response.data.configs;
        this.version = response.data.version;
        
        // Notify listeners about changes
        for (const [key, value] of Object.entries(this.configs)) {
          if (oldConfigs[key] !== value) {
            this.notifyListeners(key, value, oldConfigs[key]);
          }
        }
        
        return this.configs;
      } else {
        throw new Error(response.message || 'Failed to fetch configs');
      }
    } catch (error) {
      console.error('Config refresh error:', error.message);
      throw error;
    }
  }
  
  // Get config value
  get(key, defaultValue = null) {
    if (!this.initialized) {
      console.warn('ConfigClient not initialized. Call init() first.');
    }
    
    // Support nested keys like "database.host"
    const keys = key.split('.');
    let value = this.configs;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return defaultValue;
      }
    }
    
    return value !== undefined ? value : defaultValue;
  }
  
  // Get all configs
  getAll() {
    return { ...this.configs };
  }
  
  // Register change listener for specific key
  onChange(key, callback) {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, []);
    }
    this.listeners.get(key).push(callback);
    
    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(key);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    };
  }
  
  // Register global change listener
  on(event, callback) {
    if (event === 'change') {
      this.globalListeners.push(callback);
      
      return () => {
        const index = this.globalListeners.indexOf(callback);
        if (index > -1) {
          this.globalListeners.splice(index, 1);
        }
      };
    }
  }
  
  // Notify listeners
  notifyListeners(key, newValue, oldValue) {
    // Notify specific key listeners
    const callbacks = this.listeners.get(key) || [];
    for (const callback of callbacks) {
      try {
        callback(newValue, oldValue, { key, serviceName: this.serviceName, environment: this.environment });
      } catch (error) {
        console.error('Listener error:', error.message);
      }
    }
    
    // Notify global listeners
    for (const callback of this.globalListeners) {
      try {
        callback({ key, newValue, oldValue, serviceName: this.serviceName, environment: this.environment });
      } catch (error) {
        console.error('Global listener error:', error.message);
      }
    }
  }
  
  // Connect to WebSocket for real-time updates
  connectWebSocket() {
    const wsUrl = this.serverUrl.replace(/^http/, 'ws');
    const url = `${wsUrl}/ws?service=${this.serviceName}&env=${this.environment}`;
    
    try {
      this.ws = new WebSocket(url);
      
      this.ws.on('open', () => {
        console.log('ConfigClient: WebSocket connected');
        this.reconnectAttempts = 0;
      });
      
      this.ws.on('message', (data) => {
        this.handleMessage(data.toString());
      });
      
      this.ws.on('close', () => {
        console.log('ConfigClient: WebSocket disconnected');
        this.scheduleReconnect();
      });
      
      this.ws.on('error', (error) => {
        console.error('ConfigClient: WebSocket error:', error.message);
      });
    } catch (error) {
      console.error('ConfigClient: WebSocket connection failed:', error.message);
      this.scheduleReconnect();
    }
  }
  
  // Handle incoming WebSocket message
  handleMessage(data) {
    try {
      const message = JSON.parse(data);
      
      switch (message.type) {
        case 'connection_ack':
          console.log('ConfigClient: Connection acknowledged');
          break;
          
        case 'config_changed':
          this.handleConfigChange(message.data);
          break;
          
        case 'ping':
          this.ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
          break;
      }
    } catch (error) {
      console.error('ConfigClient: Message parse error:', error.message);
    }
  }
  
  // Handle config change notification
  handleConfigChange(data) {
    const { configKey, configValue, version, changeType } = data;
    
    console.log(`ConfigClient: Config changed - ${configKey} (${changeType})`);
    
    const oldValue = this.configs[configKey];
    
    if (changeType === 'delete') {
      delete this.configs[configKey];
    } else {
      this.configs[configKey] = configValue;
    }
    
    this.version = version;
    this.notifyListeners(configKey, configValue, oldValue);
  }
  
  // Schedule WebSocket reconnection
  scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('ConfigClient: Max reconnection attempts reached');
      return;
    }
    
    const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts), 30000);
    this.reconnectAttempts++;
    
    console.log(`ConfigClient: Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    setTimeout(() => {
      this.connectWebSocket();
    }, delay);
  }
  
  // HTTP POST helper
  async httpPost(url, body) {
    const http = url.startsWith('https') ? require('https') : require('http');
    
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      const data = JSON.stringify(body);
      
      const options = {
        hostname: urlObj.hostname,
        port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
        path: urlObj.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data)
        }
      };
      
      if (this.apiKey) {
        options.headers['X-API-Key'] = this.apiKey;
      }
      
      const req = http.request(options, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            resolve(JSON.parse(body));
          } catch {
            reject(new Error('Invalid JSON response'));
          }
        });
      });
      
      req.on('error', reject);
      req.write(data);
      req.end();
    });
  }
  
  // Close client
  close() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.listeners.clear();
    this.globalListeners = [];
    this.initialized = false;
  }
}

module.exports = ConfigClient;
