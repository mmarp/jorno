const express = require('express');
const router = express.Router();

//Require books
const Book = require('../models/Book.model');

//Require authors
const Author = require('../models/Author.model');


const fileUpload = require('../config/cloudinary');



function requireLogin(req, res, next) {
    if (req.session.currentUser) {
        next();
    } else {
        res.redirect('/login');
    }
}




function requireAdmin(req, res, next) {
    if (req.session.currentUser &&
        req.session.currentUser.role === 'Admin') {
        next();
    } else {
        res.redirect('/login');
    }
}


//if for instance I wanted a certain part to be accessible only to admin I would use it like:
//router.get('/books', requireAdmin, async (req, res)




router.get('/books', async (req, res) => {
    const booksFromDB = await Book.find().populate('author').sort({
        title: 1
    }); //sorts books alphabetically
    res.render('books/books-list', {
        booksFromDB
    });
});


//Gets the detail of a book by using bookId
//http://localhost:3000/books/25342534623
router.get('/books/:bookId', async (req, res) => {
    const bookDetail = await Book.findById(req.params.bookId).populate('author');
    res.render('books/book-detail', bookDetail);
});


router.get('/create-book', requireLogin, async (req, res) => {
    const allAuthors = await Author.find().sort({
        name: 1
    });
    res.render('books/book-create', {
        allAuthors
    });
});



//1. Upload image on sign up user
//2. Create a route to list all users with their images




router.post('/create-book', fileUpload.single('image'), async (req, res) => {

    let fileUrlOnCloudinary = ""; //like this, if there is an error the file won't break
    if (req.file) {
        fileUrlOnCloudinary = req.file.path;
    }







    const {
        title,
        description,
        author,
        rating
    } = req.body; //names need to match the names on the form
    //accessing the info we place on the browser
    await Book.create({
        title,
        description,
        author,
        rating,
        imageUrl: fileUrlOnCloudinary,
    });
    res.redirect('/books');
});


//Update
//Render edit book form with the book we are editing
router.get('/books/:bookId/edit', async (req, res) => {
    const bookToEdit = await Book.findById(req.params.bookId).populate('author');
    const allAuthors = await Author.find().sort({
        name: 1
    });
    res.render('books/book-edit', {
        bookToEdit,
        allAuthors
    });
});

router.post('/books/:bookId/edit', async (req, res) => {
    const {
        title,
        description,
        rating,
        author
    } = req.body;
    await Book.findByIdAndUpdate(req.params.bookId, {
        title,
        description,
        rating,
        author,
    });
    res.redirect('/books');
});


//Delete
router.post('/books/:bookId/delete', async (req, res) => {
    await Book.findByIdAndDelete(req.params.bookId);
    res.redirect('/books');
});


//Reviews
router.post('/reviews/:bookId/add', async (req, res) => {
    const {
        username,
        comment
    } = req.body;
    await Book.findByIdAndUpdate(req.params.bookId, {
        $push: {
            reviews: {
                username,
                comment
            }
        },
    });
    res.redirect(`/books/${req.params.bookId}`);
});





module.exports = router; //always the last line