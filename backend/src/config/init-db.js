const { getDatabase } = require('./database');

function initDatabase() {
  const db = getDatabase();

  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS articles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      author TEXT DEFAULT 'Anonymous',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      status TEXT DEFAULT 'draft'
    )
  `;

  const createIndexCreatedAt = `
    CREATE INDEX IF NOT EXISTS idx_articles_created_at ON articles(created_at)
  `;

  const createIndexStatus = `
    CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status)
  `;

  try {
    db.exec(createTableSQL);
    db.exec(createIndexCreatedAt);
    db.exec(createIndexStatus);
    
    console.log('数据库初始化成功！');
    console.log('- articles 表已创建');
    console.log('- 索引已创建');
    
    const count = db.prepare('SELECT COUNT(*) as count FROM articles').get();
    console.log(`- 当前文章数量: ${count.count}`);
    
    if (count.count === 0) {
      const insertSample = db.prepare(`
        INSERT INTO articles (title, content, author, status)
        VALUES (?, ?, ?, ?)
      `);
      
      insertSample.run('欢迎使用博客系统', '这是您的第一篇文章。您可以在这里创建、编辑和管理您的博客内容。', '系统管理员', 'published');
      console.log('- 示例文章已创建');
    }
  } catch (error) {
    console.error('数据库初始化失败:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  initDatabase();
  process.exit(0);
}

module.exports = initDatabase;
