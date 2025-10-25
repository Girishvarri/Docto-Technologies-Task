const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const verifyUser = require('../middleware/verifyUser');

// Public: fetch books
router.get('/', bookController.getBooks);

// Protected: create/update/delete (requires cookie token -> verifyUser)
router.post('/', verifyUser, bookController.addBook);
router.put('/:id', verifyUser, bookController.updateBook);
router.delete('/:id', verifyUser, bookController.deleteBook);

module.exports = router;
