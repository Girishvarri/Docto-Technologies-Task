const Book = require('../models/bookModel');

// GET /books
const getBooks = async (req, res) => {
    try {
        const books = await Book.find().sort({ createdAt: -1 });
        return res.status(200).json(books);
    } catch (err) {
        console.error('getBooks error:', err);
        return res.status(500).json({ message: 'Failed to fetch books' });
    }
};

// POST /books
const addBook = async (req, res) => {
    try {
        const { title, author, price, category, inStock } = req.body;
        if (!title || !author || price === undefined || !category) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const book = new Book({ title, author, price, category, inStock: !!inStock });
        await book.save();
        return res.status(201).json({ message: 'Book added', book });
    } catch (err) {
        console.error('addBook error:', err);
        return res.status(500).json({ message: 'Failed to add book' });
    }
};

// PUT /books/:id
const updateBook = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, author, price, category, inStock } = req.body;

        const book = await Book.findById(id);
        if (!book) return res.status(404).json({ message: 'Book not found' });

        book.title = title ?? book.title;
        book.author = author ?? book.author;
        book.price = price ?? book.price;
        book.category = category ?? book.category;
        book.inStock = inStock === undefined ? book.inStock : !!inStock;

        await book.save();
        return res.status(200).json({ message: 'Book updated', book });
    } catch (err) {
        console.error('updateBook error:', err);
        return res.status(500).json({ message: 'Failed to update book' });
    }
};

// DELETE /books/:id
const deleteBook = async (req, res) => {
    try {
        const { id } = req.params;
        const book = await Book.findById(id);
        if (!book) return res.status(404).json({ message: 'Book not found' });

        await book.deleteOne();
        return res.status(200).json({ message: 'Book deleted' });
    } catch (err) {
        console.error('deleteBook error:', err);
        return res.status(500).json({ message: 'Failed to delete book' });
    }
};

module.exports = {
    getBooks,
    addBook,
    updateBook,
    deleteBook,
};
