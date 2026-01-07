import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { articleService } from '../services/articleService';
import ArticleForm from '../components/ArticleForm';
import ErrorMessage from '../components/ErrorMessage';

export default function ArticleCreatePage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (data) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await articleService.createArticle(data);
      alert('文章创建成功！');
      navigate(`/articles/${response.data.article.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <h1 style={styles.title}>创建文章</h1>
        
        {error && <ErrorMessage message={error} />}
        
        <ArticleForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
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
    margin: '0 auto'
  },
  title: {
    fontSize: '2rem',
    color: '#2c3e50',
    marginBottom: '1.5rem'
  }
};
