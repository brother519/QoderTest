import { useState, useEffect } from 'react';
import { articleService } from '../services/articleService';

export function useArticle(id) {
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchArticle = async () => {
    if (!id) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await articleService.getArticleById(id);
      setArticle(response.data.article);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticle();
  }, [id]);

  return {
    article,
    loading,
    error,
    refetch: fetchArticle
  };
}
