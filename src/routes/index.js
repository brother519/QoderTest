const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoutes');

router.use('/auth', authRoutes);

router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

module.exports = router;
