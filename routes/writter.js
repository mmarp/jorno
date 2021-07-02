const express = require('express');
const router = express.Router();


//Require User
const User = require('../models/User.model');


//Require blogposts
const Blogpost = require('../models/Blogposts.model');


const fileUpload = require('../config/cloudinary');


function requireLogin(req, res, next) {
    if (req.session.currentUser) {
        next();
    } else {
        res.redirect('/login');
    }
}




function requireWritter(req, res, next) {
    if (req.session.currentUser &&
        req.session.currentUser.role === 'writter') {
        next();
    } else {
        res.redirect('/login');
    }
}



router.get('/blogposts', async (req, res) => {
    const blogpostsFromDB = await Blogpost.find().sort({
        title: 1
    }); //sorts books alphabetically
    res.render('blogposts/blogposts-list', {
        blogpostsFromDB
    });
});



//Gets the detail of a blogpost by using blogpostsId
//http://localhost:3000/blogposts/25342534623
router.get('/blogposts/:blogpostId', async (req, res) => {
    const blogpostDetail = await Blogpost.findById(req.params.blogpostId);
    res.render('blogposts/blogpost-detail', blogpostDetail);
});


router.get('/create-blogpost', requireWritter, requireLogin, async (req, res) => {
    res.render('blogposts/blogpost-create');
});


router.post('/create-blogpost', async (req, res) => {
    const {
        author,
        title,
        description,
        publishedAt,
        content,
        keywords,
    } = req.body; //names need to match the names on the form
    //accessing the info we place on the browser
    await Blogpost.create({
        author,
        title,
        description,
        publishedAt,
        content,
        keywords,
    });
    res.redirect('/blogposts');
});




//Update
//Render edit book form with the book we are editing
router.get('/blogposts/:blogpostId/edit', async (req, res) => {
    const blogpostToEdit = await Blogpost.findById(req.params.blogpostId);
   
    res.render('blogposts/blogpost-edit', {
        blogpostToEdit,
    });
});

router.post('/blogposts/:blogpostId/edit', async (req, res) => {
    const {
        author,
        title,
        description,
        publishedAt,
        content,
        keywords,
    } = req.body;
    await Blogpost.findByIdAndUpdate(req.params.blogpostId, {
        author,
        title,
        description,
        publishedAt,
        content,
        keywords,
    });
    res.redirect('/blogposts');
});


//Delete
router.post('/blogposts/:blogpostId/delete', async (req, res) => {
    await Blogpost.findByIdAndDelete(req.params.blogpostId);
    res.redirect('/blogposts');
});

















module.exports = router; //always the last line