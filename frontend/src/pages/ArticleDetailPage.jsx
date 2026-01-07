import { useParams, Link } from 'react-router-dom';
import { useArticle } from '../hooks/useArticle';
import { articleService } from '../services/articleService';
import { useNavigate } from 'react-router-dom';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

export default function ArticleDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { article, loading, error } = useArticle(id);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDelete = async () => {
    if (window.confirm('确定要删除这篇文章吗？')) {
      try {
        await articleService.deleteArticle(id);
        alert('文章已删除');
        navigate('/');
      } catch (err) {
        alert('删除失败: ' + err.message);
      }
    }
  };

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} />;
  if (!article) return <ErrorMessage message="文章不存在" />;

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <div style={styles.header}>
          <h1 style={styles.title}>{article.title}</h1>
          <span style={{
            ...styles.status,
            backgroundColor: article.status === 'published' ? '#27ae60' : '#95a5a6'
          }}>
            {article.status === 'published' ? '已发布' : '草稿'}
          </span>
        </div>

        <div style={styles.meta}>
          <span>作者: {article.author}</span>
          <span>创建时间: {formatDate(article.created_at)}</span>
          <span>更新时间: {formatDate(article.updated_at)}</span>
        </div>

        <div style={styles.content}>
          <p style={styles.articleContent}>{article.content}</p>
        </div>

        <div style={styles.actions}>
          <Link to="/" style={styles.backButton}>返回列表</Link>
          <Link to={`/articles/${id}/edit`} style={styles.editButton}>编辑文章</Link>
          <button onClick={handleDelete} style={styles.deleteButton}>删除文章</button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: 'calc(100vh - 80px)',
    backgroundColor: '#f5f5f5',
    padding: '2rem 1rem'
  },
  content: {
    maxWidth: '900px',
    margin: '0 auto',
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
    paddingBottom: '1rem',
    borderBottom: '2px solid #eee'
  },
  title: {
    fontSize: '2rem',
    color: '#2c3e50',
    margin: 0,
    flex: 1
  },
  status: {
    padding: '0.5rem 1rem',
    borderRadius: '12px',
    color: 'white',
    fontSize: '0.9rem',
    fontWeight: 'bold'
  },
  meta: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    fontSize: '0.95rem',
    color: '#7f8c8d',
    marginBottom: '2rem',
    paddingBottom: '1rem',
    borderBottom: '1px solid #eee'
  },
  articleContent: {
    fontSize: '1.1rem',
    lineHeight: '1.8',
    color: '#2c3e50',
    whiteSpace: 'pre-wrap',
    marginBottom: '2rem'
  },
  actions: {
    display: 'flex',
    gap: '1rem',
    paddingTop: '1rem',
    borderTop: '1px solid #eee'
  },
  backButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#95a5a6',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    textDecoration: 'none',
    display: 'inline-block'
  },
  editButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    textDecoration: 'none',
    display: 'inline-block'
  },
  deleteButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  }
};
