import { Link } from 'react-router-dom';

export default function ArticleCard({ article, onDelete }) {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <Link to={`/articles/${article.id}`} style={styles.title}>
          {article.title}
        </Link>
        <span style={{
          ...styles.status,
          backgroundColor: article.status === 'published' ? '#27ae60' : '#95a5a6'
        }}>
          {article.status === 'published' ? '已发布' : '草稿'}
        </span>
      </div>
      
      <p style={styles.content}>
        {article.content.substring(0, 150)}
        {article.content.length > 150 ? '...' : ''}
      </p>
      
      <div style={styles.footer}>
        <div style={styles.meta}>
          <span>作者: {article.author}</span>
          <span>创建: {formatDate(article.created_at)}</span>
        </div>
        <div style={styles.actions}>
          <Link to={`/articles/${article.id}/edit`} style={styles.editButton}>
            编辑
          </Link>
          <button onClick={() => onDelete(article.id)} style={styles.deleteButton}>
            删除
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  card: {
    backgroundColor: 'white',
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '1.5rem',
    marginBottom: '1rem',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    transition: 'box-shadow 0.3s'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem'
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#2c3e50',
    textDecoration: 'none',
    flex: 1
  },
  status: {
    padding: '0.25rem 0.75rem',
    borderRadius: '12px',
    color: 'white',
    fontSize: '0.85rem',
    fontWeight: 'bold'
  },
  content: {
    color: '#555',
    lineHeight: '1.6',
    marginBottom: '1rem'
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '1rem',
    borderTop: '1px solid #eee'
  },
  meta: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
    fontSize: '0.9rem',
    color: '#777'
  },
  actions: {
    display: 'flex',
    gap: '0.5rem'
  },
  editButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    textDecoration: 'none',
    display: 'inline-block'
  },
  deleteButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  }
};
