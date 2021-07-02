const express = require('express');
const router = express.Router();

//Require author
const Author = require('../models/Author.model');

router.get('/create-author', (req, res) => {
    res.render('authors/author-create');
});


router.post('/create-author', async (req, res) => {
    const {
        name,
        bio,
        picture,
        
    } = req.body; //names need to match the names on the form
    //accessing the info we place on the browser
    await Author.create({
        name,
        bio,
        picture
    });
    res.redirect('/books');
});







module.exports = router;