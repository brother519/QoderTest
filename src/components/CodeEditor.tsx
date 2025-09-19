import React, { useState, useRef, useEffect } from 'react';
import './CodeEditor.css';

interface CodeTemplate {
  id: string;
  name: string;
  language: string;
  code: string;
  description: string;
}

const CodeEditor: React.FC = () => {
  const [code, setCode] = useState(`// 欢迎使用代码编辑器
function greetProduct(name, price) {
  console.log(\`商品: \${name}, 价格: ¥\${price}\`);
  return {
    name: name,
    price: price,
    formattedPrice: '¥' + price.toLocaleString(),
    isExpensive: price > 10000
  };
}

// 示例商品数据
const products = [
  { name: 'iPhone 15 Pro', price: 9999 },
  { name: 'MacBook Pro', price: 19999 },
  { name: 'AirPods Pro', price: 1999 }
];

// 处理商品数据
products.forEach(product => {
  const result = greetProduct(product.name, product.price);
  console.log('处理结果:', result);
});`);

  const [language, setLanguage] = useState('javascript');
  const [theme, setTheme] = useState('vs-dark');
  const [fontSize, setFontSize] = useState(14);
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const outputRef = useRef<HTMLPreElement>(null);

  const templates: CodeTemplate[] = [
    {
      id: 'js-product',
      name: '商品管理 (JavaScript)',
      language: 'javascript',
      description: '商品数据处理和格式化',
      code: `// 商品管理系统
class ProductManager {
  constructor() {
    this.products = [];
  }
  
  addProduct(name, price, category) {
    const product = {
      id: Date.now(),
      name,
      price,
      category,
      createdAt: new Date().toISOString()
    };
    this.products.push(product);
    return product;
  }
  
  getProducts() {
    return this.products;
  }
  
  getProductsByCategory(category) {
    return this.products.filter(p => p.category === category);
  }
  
  updatePrice(id, newPrice) {
    const product = this.products.find(p => p.id === id);
    if (product) {
      product.price = newPrice;
    }
    return product;
  }
}

// 使用示例
const manager = new ProductManager();
manager.addProduct('iPhone 15', 9999, '手机');
manager.addProduct('MacBook Pro', 19999, '电脑');
manager.addProduct('AirPods', 1999, '耳机');

console.log('所有商品:', manager.getProducts());
console.log('手机类商品:', manager.getProductsByCategory('手机'));`
    },
    {
      id: 'css-style',
      name: '商品卡片样式 (CSS)',
      language: 'css',
      description: '商品展示卡片的CSS样式',
      code: `/* 商品卡片样式 */
.product-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.3s ease;
  border: 1px solid #f0f0f0;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  border-color: #667eea;
}

.product-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.product-card:hover .product-image {
  transform: scale(1.05);
}

.product-info {
  padding: 1.25rem;
}

.product-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.5rem;
}

.product-price {
  color: #e74c3c;
  font-weight: 700;
  font-size: 1.3rem;
}

.product-category {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  font-size: 0.8rem;
  display: inline-block;
  margin-top: 0.5rem;
}`
    },
    {
      id: 'html-structure',
      name: '商品页面结构 (HTML)',
      language: 'html',
      description: '商品展示页面的HTML结构',
      code: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>商品展示页面</title>
</head>
<body>
    <header class="header">
        <h1>商品管理系统</h1>
        <nav class="nav">
            <a href="#products">商品列表</a>
            <a href="#categories">分类管理</a>
            <a href="#orders">订单管理</a>
        </nav>
    </header>
    
    <main class="main">
        <section id="products" class="products-section">
            <h2>热门商品</h2>
            <div class="products-grid">
                <div class="product-card">
                    <img src="product1.jpg" alt="iPhone 15 Pro" class="product-image">
                    <div class="product-info">
                        <h3 class="product-title">iPhone 15 Pro</h3>
                        <p class="product-description">最新一代iPhone，性能强劲</p>
                        <div class="product-price">¥9,999</div>
                        <span class="product-category">智能手机</span>
                    </div>
                </div>
                
                <div class="product-card">
                    <img src="product2.jpg" alt="MacBook Pro" class="product-image">
                    <div class="product-info">
                        <h3 class="product-title">MacBook Pro</h3>
                        <p class="product-description">专业级笔记本电脑</p>
                        <div class="product-price">¥19,999</div>
                        <span class="product-category">笔记本电脑</span>
                    </div>
                </div>
            </div>
        </section>
    </main>
    
    <footer class="footer">
        <p>&copy; 2024 商品管理系统. 保留所有权利.</p>
    </footer>
</body>
</html>`
    },
    {
      id: 'json-data',
      name: '商品数据 (JSON)',
      language: 'json',
      description: '商品信息的JSON数据格式',
      code: `{
  "products": [
    {
      "id": 1,
      "name": "iPhone 15 Pro",
      "description": "Apple最新旗舰手机，配备A17 Pro芯片",
      "price": 9999,
      "category": "智能手机",
      "brand": "Apple",
      "stock": 150,
      "images": [
        "iphone15pro_1.jpg",
        "iphone15pro_2.jpg"
      ],
      "specifications": {
        "screen": "6.1英寸 Super Retina XDR",
        "storage": "128GB",
        "camera": "48MP 主摄像头",
        "battery": "3274mAh"
      },
      "rating": 4.8,
      "reviews": 256,
      "tags": ["新品", "热销", "5G"],
      "status": "active",
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-20T14:25:00Z"
    },
    {
      "id": 2,
      "name": "MacBook Pro 14",
      "description": "专业级笔记本电脑，搭载M3芯片",
      "price": 19999,
      "category": "笔记本电脑",
      "brand": "Apple",
      "stock": 89,
      "images": [
        "macbook_pro_14_1.jpg",
        "macbook_pro_14_2.jpg"
      ],
      "specifications": {
        "processor": "Apple M3芯片",
        "memory": "16GB统一内存",
        "storage": "512GB SSD",
        "display": "14.2英寸 Liquid Retina XDR"
      },
      "rating": 4.9,
      "reviews": 189,
      "tags": ["专业", "高性能", "创作"],
      "status": "active",
      "createdAt": "2024-01-10T09:15:00Z",
      "updatedAt": "2024-01-18T16:40:00Z"
    }
  ],
  "categories": [
    {
      "id": 1,
      "name": "智能手机",
      "description": "各品牌智能手机产品",
      "productCount": 45
    },
    {
      "id": 2,
      "name": "笔记本电脑",
      "description": "办公和游戏笔记本电脑",
      "productCount": 32
    }
  ]
}`
    }
  ];

  const handleTemplateSelect = (template: CodeTemplate) => {
    setCode(template.code);
    setLanguage(template.language);
  };

  const runCode = async () => {
    setIsRunning(true);
    setOutput('正在执行代码...\n');

    try {
      // 模拟代码执行
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (language === 'javascript') {
        // 简单的JavaScript代码执行模拟
        try {
          // 创建一个安全的执行环境
          const logs: string[] = [];
          const mockConsole = {
            log: (...args: any[]) => {
              logs.push(args.map(arg => 
                typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
              ).join(' '));
            }
          };

          // 替换console.log
          const modifiedCode = code.replace(/console\.log/g, 'mockConsole.log');
          
          // 创建函数并执行
          const func = new Function('mockConsole', modifiedCode);
          func(mockConsole);
          
          setOutput(logs.length > 0 ? logs.join('\n') : '代码执行完成，无输出');
        } catch (error) {
          setOutput(`执行错误: ${error}`);
        }
      } else {
        setOutput(`${language.toUpperCase()} 代码预览模式

代码长度: ${code.length} 字符
行数: ${code.split('
').length}

在实际项目中，此代码可以被相应的解释器或编译器处理。`);
      }
    } catch (error) {
      setOutput(`执行错误: ${error}`);
    } finally {
      setIsRunning(false);
    }
  };

  const formatCode = () => {
    if (language === 'javascript') {
      // 简单的代码格式化
      const formatted = code
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .join('\n')
        .replace(/;/g, ';\n')
        .replace(/{/g, '{\n')
        .replace(/}/g, '\n}');
      setCode(formatted);
    }
  };

  const clearCode = () => {
    setCode('');
    setOutput('');
  };

  const copyCode = () => {
    navigator.clipboard.writeText(code);
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [code]);

  return (
    <div className="code-editor-container">
      <h2>代码编辑器</h2>
      <p className="description">
        功能强大的在线代码编辑器，支持多种编程语言，语法高亮和代码执行
      </p>

      <div className="editor-controls">
        <div className="control-group">
          <label>语言:</label>
          <select value={language} onChange={(e) => setLanguage(e.target.value)}>
            <option value="javascript">JavaScript</option>
            <option value="css">CSS</option>
            <option value="html">HTML</option>
            <option value="json">JSON</option>
            <option value="python">Python</option>
          </select>
        </div>

        <div className="control-group">
          <label>主题:</label>
          <select value={theme} onChange={(e) => setTheme(e.target.value)}>
            <option value="vs-light">浅色</option>
            <option value="vs-dark">深色</option>
            <option value="high-contrast">高对比度</option>
          </select>
        </div>

        <div className="control-group">
          <label>字体大小:</label>
          <input
            type="range"
            min="12"
            max="20"
            value={fontSize}
            onChange={(e) => setFontSize(parseInt(e.target.value))}
          />
          <span>{fontSize}px</span>
        </div>
      </div>

      <div className="templates-section">
        <h3>代码模板</h3>
        <div className="templates-grid">
          {templates.map(template => (
            <div
              key={template.id}
              className="template-card"
              onClick={() => handleTemplateSelect(template)}
            >
              <h4>{template.name}</h4>
              <p>{template.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="editor-layout">
        <div className="editor-panel">
          <div className="panel-header">
            <h3>代码编辑区</h3>
            <div className="editor-actions">
              <button onClick={formatCode} className="btn-format">格式化</button>
              <button onClick={copyCode} className="btn-copy">复制</button>
              <button onClick={clearCode} className="btn-clear">清空</button>
            </div>
          </div>
          <div className={`editor-wrapper theme-${theme}`}>
            <textarea
              ref={textareaRef}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="code-textarea"
              style={{ fontSize: `${fontSize}px` }}
              placeholder="在这里编写代码..."
              spellCheck={false}
            />
          </div>
        </div>

        <div className="output-panel">
          <div className="panel-header">
            <h3>输出结果</h3>
            <button 
              onClick={runCode} 
              className="btn-run"
              disabled={isRunning}
            >
              {isRunning ? '执行中...' : '▶️ 运行'}
            </button>
          </div>
          <pre ref={outputRef} className="output-content">
            {output || '点击运行按钮执行代码...'}
          </pre>
        </div>
      </div>

      <div className="editor-stats">
        <div className="stat-item">
          <label>字符数:</label>
          <span>{code.length}</span>
        </div>
        <div className="stat-item">
          <label>行数:</label>
          <span>{code.split('\n').length}</span>
        </div>
        <div className="stat-item">
          <label>当前语言:</label>
          <span>{language.toUpperCase()}</span>
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;