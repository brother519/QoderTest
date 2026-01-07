import { useState, useEffect } from 'react';
import { articleService } from '../services/articleService';

export function useArticles(page = 1, limit = 10, status = '') {
  const [articles, setArticles] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchArticles = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, limit };
      if (status) params.status = status;

      const response = await articleService.getAllArticles(params);
      setArticles(response.data.articles);
      setTotal(response.data.total);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteArticle = async (id) => {
    try {
      await articleService.deleteArticle(id);
      fetchArticles();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  useEffect(() => {
    fetchArticles();
  }, [page, limit, status]);

  return {
    articles,
    total,
    totalPages,
    loading,
    error,
    refetch: fetchArticles,
    deleteArticle
  };
}
