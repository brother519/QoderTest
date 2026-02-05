import { Router } from 'express';
import { searchController } from '../controllers/SearchController';
import { autocompleteController } from '../controllers/AutocompleteController';

const router = Router();

// Search endpoint
router.post('/search', (req, res, next) => searchController.search(req, res, next));

// Autocomplete endpoints
router.get('/autocomplete', (req, res, next) => autocompleteController.getSuggestions(req, res, next));
router.get('/hot-keywords', (req, res, next) => autocompleteController.getHotKeywords(req, res, next));

export default router;
