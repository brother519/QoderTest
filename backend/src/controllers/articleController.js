const Article = require('../models/Article');
const asyncHandler = require('../middleware/asyncHandler');
const { AppError } = require('../middleware/errorHandler');

const getAllArticles = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;

  const filters = {};
  if (status) {
    filters.status = status;
  }

  const pagination = {
    page: parseInt(page),
    limit: parseInt(limit)
  };

  const articles = Article.findAll(filters, pagination);
  const total = Article.count(filters);

  res.json({
    success: true,
    data: {
      articles,
      total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(total / pagination.limit)
    }
  });
});

const getArticleById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const article = Article.findById(id);

  if (!article) {
    throw new AppError('文章不存在', 404, 'ARTICLE_NOT_FOUND');
  }

  res.json({
    success: true,
    data: { article }
  });
});

const createArticle = asyncHandler(async (req, res) => {
  const article = Article.create(req.body);

  res.status(201).json({
    success: true,
    data: { article },
    message: '文章创建成功'
  });
});

const updateArticle = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const existingArticle = Article.findById(id);
  if (!existingArticle) {
    throw new AppError('文章不存在', 404, 'ARTICLE_NOT_FOUND');
  }

  const article = Article.update(id, req.body);

  res.json({
    success: true,
    data: { article },
    message: '文章更新成功'
  });
});

const deleteArticle = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const existingArticle = Article.findById(id);
  if (!existingArticle) {
    throw new AppError('文章不存在', 404, 'ARTICLE_NOT_FOUND');
  }

  Article.delete(id);

  res.json({
    success: true,
    message: '文章删除成功'
  });
});

module.exports = {
  getAllArticles,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle
};
