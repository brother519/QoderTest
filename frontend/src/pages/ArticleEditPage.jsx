import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useArticle } from '../hooks/useArticle';
import { articleService } from '../services/articleService';
import ArticleForm from '../components/ArticleForm';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

export default function ArticleEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { article, loading, error } = useArticle(id);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const handleSubmit = async (data) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await articleService.updateArticle(id, data);
      alert('文章更新成功！');
      navigate(`/articles/${id}`);
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} />;
  if (!article) return <ErrorMessage message="文章不存在" />;

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <h1 style={styles.title}>编辑文章</h1>
        
        {submitError && <ErrorMessage message={submitError} />}
        
        <ArticleForm
          article={article}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
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
