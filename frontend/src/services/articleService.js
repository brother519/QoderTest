import api from './api';

export const articleService = {
  getAllArticles: (params) => {
    return api.get('/articles', { params });
  },

  getArticleById: (id) => {
    return api.get(`/articles/${id}`);
  },

  createArticle: (data) => {
    return api.post('/articles', data);
  },

  updateArticle: (id, data) => {
    return api.put(`/articles/${id}`, data);
  },

  deleteArticle: (id) => {
    return api.delete(`/articles/${id}`);
  }
};
