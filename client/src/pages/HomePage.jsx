import React, { useMemo, useState, useEffect } from 'react'
import Header from '../components/header'
import axios from 'axios';
import toast from 'react-hot-toast';


function HomePage() {
    const [books, setBooks] = useState([]);
    const baseurl = import.meta.env.VITE_BASE_URL;

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [refresh, setRefresh] = useState(false);

    const [modalOpen, setModalOpen] = useState(false)
    const [editing, setEditing] = useState(null) // book id or null

    const [form, setForm] = useState({ title: '', author: '', price: '', category: '', inStock: true })

    const stats = useMemo(() => {
        const total = books.length
        const inStock = books.filter(b => b.inStock).length
        const categories = Array.from(new Set(books.map(b => b.category))).length
        return { total, inStock, categories }
    }, [books])

    const openAdd = () => {
        setEditing(null)
        setForm({ title: '', author: '', price: '', category: '', inStock: true })
        setModalOpen(true)
    }

    const openEdit = (book) => {
        const id = book._id ?? book.id
        setEditing(id)
        setForm({ title: book.title, author: book.author, price: String(book.price), category: book.category, inStock: book.inStock })
        setModalOpen(true)
    }

    const saveNewBook = async (book) => {
        try {
            return axios.post(`${baseurl}/api/books`, book);
        } catch (error) {
            console.error('Error saving new book:', error);
            throw error;
        }
    };

    const updateBook = async (book) => {
        try {
            const id = book.id ?? book._id ?? editing
            return axios.put(`${baseurl}/api/books/${id}`, book);
        } catch (error) {
            console.error('Error updating book:', error);
            throw error;
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        // simple validation
        if (!form.title.trim() || !form.author.trim() || !form.category.trim() || !form.price) {
            alert('Please fill required fields (Title, Author, Category, Price)')
            return
        }
        const priceNum = parseFloat(form.price)
        if (Number.isNaN(priceNum) || priceNum < 0) {
            alert('Price must be a positive number')
            return
        }

        try {
            if (editing) {
                const newBook = { id: editing, title: form.title, author: form.author, price: priceNum, category: form.category, inStock: !!form.inStock }
                const p = updateBook(newBook);
                await toast.promise(
                    p,
                    {
                        loading: 'Saving book...',
                        success: (res) => res?.data?.message || 'Book updated successfully!',
                        error: (err) => err?.response?.data?.message || 'Error updating book.'
                    }
                );
            } else {
                const newBook = { title: form.title, author: form.author, price: priceNum, category: form.category, inStock: !!form.inStock }
                const p = saveNewBook(newBook);
                await toast.promise(
                    p,
                    {
                        loading: 'Adding book...',
                        success: (res) => res?.data?.message || 'Book added successfully!',
                        error: (err) => err?.response?.data?.message || 'Error adding book.'
                    }
                );
            }

            // refresh list after successful add/update
            setRefresh(prev => !prev);
            setModalOpen(false);
        } catch (err) {
            // toast shows error; keep modal open for user to retry or fix
            console.error(err);
        }
    }

    useEffect(() => {
        const fetchBooks = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await axios.get(`${baseurl}/api/books`);
                setBooks(response.data || []);
            } catch (err) {
                console.error('fetchBooks error', err);
                setError('Failed to load books');
                toast.error(err?.response?.data?.message || 'Failed to load books');
            } finally {
                setLoading(false);
            }
        };
        fetchBooks();
    }, [refresh, baseurl]);

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this book?')) return;
        try {
            const p = axios.delete(`${baseurl}/api/books/${id}`);
            await toast.promise(
                p,
                {
                    loading: 'Deleting...',
                    success: (res) => res?.data?.message || 'Deleted',
                    error: (err) => err?.response?.data?.message || 'Delete failed',
                }
            );
            setRefresh(prev => !prev);
        } catch (err) {
            console.error('delete error', err);
        }
    }

    return (
        <div className='min-h-screen bg-[#EFD6AC]/30'>
            <Header />

            <main className='max-w-6xl mx-auto p-6'>
                <div className='flex items-center justify-between mb-6'>
                    <h1 className='text-2xl font-bold text-[#04151F]'>Dashboard</h1>
                    <div className='flex gap-3'>
                        <button onClick={openAdd} className='inline-flex items-center gap-2 px-4 py-2 rounded shadow text-white bg-[#C44900] hover:bg-[#A83A00]'>
                            {/* plus icon */}
                            <svg className='h-4 w-4' viewBox='0 0 24 24' fill='none' stroke='currentColor' xmlns='http://www.w3.org/2000/svg'><path d='M12 5v14M5 12h14' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' /></svg>
                            Add Book
                        </button>
                    </div>
                </div>

                {/* stats */}
                <section className='grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6'>
                    <div className='p-4 rounded-lg bg-[#04151F] text-white'>
                        <div className='text-sm'>Total Books</div>
                        <div className='text-2xl font-semibold'>{stats.total}</div>
                    </div>
                    <div className='p-4 rounded-lg bg-[#183A37] text-white'>
                        <div className='text-sm'>In Stock</div>
                        <div className='text-2xl font-semibold'>{stats.inStock}</div>
                    </div>
                    <div className='p-4 rounded-lg bg-[#432534] text-white'>
                        <div className='text-sm'>Categories</div>
                        <div className='text-2xl font-semibold'>{stats.categories}</div>
                    </div>
                </section>

                {/* table */}
                <section className='bg-white rounded-lg shadow overflow-hidden'>
                    <div className='px-6 py-4 border-b flex items-center justify-between'>
                        <h2 className='text-2xl font-medium text-[#04151F]'>Book List</h2>
                    </div>

                    <div className='p-4 overflow-x-auto'>
                        <table className='min-w-full table-auto'>
                            <thead>
                                <tr className='text-left text-sm text-gray-500'>
                                    <th className='px-3 py-2'>Title</th>
                                    <th className='px-3 py-2'>Author</th>
                                    <th className='px-3 py-2'>Price</th>
                                    <th className='px-3 py-2'>Category</th>
                                    <th className='px-3 py-2'>In Stock</th>
                                    <th className='px-3 py-2'>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading && (
                                    <tr><td className='px-3 py-3' colSpan={6}>Loading...</td></tr>
                                )}

                                {!loading && books.map((book) => {
                                    const bid = book._id ?? book.id;
                                    return (
                                        <tr key={bid} className='border-t'>
                                            <td className='px-3 py-3'>{book.title}</td>
                                            <td className='px-3 py-3'>{book.author}</td>
                                            <td className='px-3 py-3'>{'$' + book.price.toFixed(2)}</td>
                                            <td className='px-3 py-3'>{book.category}</td>
                                            <td className='px-3 py-3'>
                                                {book.inStock ? <span className='inline-block px-2 py-1 rounded bg-green-100 text-green-800 text-xs'>Yes</span> : <span className='inline-block px-2 py-1 rounded bg-red-100 text-red-800 text-xs'>No</span>}
                                            </td>
                                            <td className='px-3 py-3'>
                                                <div className='flex gap-2'>
                                                    <button onClick={() => openEdit(book)} className='px-2 py-1 text-sm rounded bg-[#183A37] text-white hover:opacity-90'>Edit</button>
                                                    <button onClick={() => handleDelete(bid)} className='px-2 py-1 text-sm rounded bg-[#432534] text-white hover:opacity-90'>Delete</button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* modal */}
                {modalOpen && (
                    <div className='fixed inset-0 z-50 flex items-center justify-center'>
                        <div className='absolute inset-0 bg-black/40' onClick={() => setModalOpen(false)} />
                        <form onSubmit={handleSubmit} className='relative bg-white rounded-lg shadow-lg w-full max-w-md p-6 z-10'>
                            <h3 className='text-lg font-semibold mb-4 text-[#04151F]'>{editing ? 'Edit Book' : 'Add Book'}</h3>

                            <div className='space-y-3'>
                                <div>
                                    <label className='block text-sm font-medium mb-1'>Title *</label>
                                    <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className='w-full p-2 border rounded' />
                                </div>
                                <div>
                                    <label className='block text-sm font-medium mb-1'>Author *</label>
                                    <input value={form.author} onChange={e => setForm(f => ({ ...f, author: e.target.value }))} className='w-full p-2 border rounded' />
                                </div>
                                <div>
                                    <label className='block text-sm font-medium mb-1'>Price *</label>
                                    <input value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} type='number' step='0.01' className='w-full p-2 border rounded' />
                                </div>
                                <div>
                                    <label className='block text-sm font-medium mb-1'>Category *</label>
                                    <input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className='w-full p-2 border rounded' />
                                </div>
                                <div className='flex items-center gap-2'>
                                    <input id='stock' type='checkbox' checked={!!form.inStock} onChange={e => setForm(f => ({ ...f, inStock: e.target.checked }))} />
                                    <label htmlFor='stock' className='text-sm'>In Stock</label>
                                </div>
                            </div>

                            <div className='mt-4 flex justify-end gap-2'>
                                <button type='button' onClick={() => setModalOpen(false)} className='px-3 py-2 rounded border'>Cancel</button>
                                <button type='submit' className='px-4 py-2 rounded bg-[#C44900] text-white'>{editing ? 'Save' : 'Add'}</button>
                            </div>
                        </form>
                    </div>
                )}

            </main>
        </div>
    )
}

export default HomePage;