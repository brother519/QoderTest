const express = require('express');
const router = express.Router();
const {
  getAllArticles,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle
} = require('../controllers/articleController');
const { validateArticle } = require('../middleware/validator');

router.get('/', getAllArticles);
router.get('/:id', getArticleById);
router.post('/', validateArticle, createArticle);
router.put('/:id', validateArticle, updateArticle);
router.delete('/:id', deleteArticle);

module.exports = router;
