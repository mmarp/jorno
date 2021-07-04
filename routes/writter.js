const express = require('express');
const router = express.Router();


//Require User
const User = require('../models/User.model');


//Require blogposts
const Blogpost = require('../models/Blogposts.model');


const fileUpload = require('../config/cloudinary');


//NewsAPI
const NewsAPI = require('newsapi');
const newsapi = new NewsAPI('444c96d4ece448f6b81ee0ab9726c76b');






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


//TEST!!!
router.get('/blogposts', async (req, res) => {
    const blogpostsFromDB = await Blogpost.find({
        user: req.session.currentUser
    }).sort({
        title: 1
    }); //sorts books alphabetically
    res.render('blogposts/blogposts-list', {
        blogpostsFromDB
    });
});

//to find things from the current logged user
// Blogpost.find({ user: req.session.currentUser })



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
        user: req.session.currentUser
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





//News favorites
router.post("/news/favorites/add", async (req, res) => {
    console.log("HEREEEEEE", req.session.currentUser._id);
    const {
        title,
        url
    } = req.body;
    await User.findByIdAndUpdate(req.session.currentUser._id, {
        $push: {
            favorites: {
                title,
                url
            }
        }
    });


    // const reqQuery = req.query.q;
    res.redirect('/news');
});











router.get('/news/:userId/favorites', async (req, res) => {
    const userDetail = await User.findById(req.params.userId);
    
    const newsFavorites = userDetail.favorites;
    res.render('news/news-favorites', {
        newsFavorites
    });
});










router.post("/news/favorites/:newsId/delete", async (req, res) => {
    
    const userDetail = req.session.currentUser;
    for (let i = 0; i < userDetail.favorites.length; i++) {
        console.log("Checando se entrou no for pra testar se o filme tá nos favoritos do date: ", userDetail.favorites[i]);
        if (req.params.newsId === userDetail.favorites[i]) {
            console.log("Achou igual");
            //Usuário logado
            await User.findByIdAndUpdate(req.session.currentUser._id, {
                $pull: {
                    favorites: req.params.newsId
                }
            });
        }
    }

    
    res.redirect("/news/favorites");
});


//Delete news favorites
// router.post('/news/favorites/:newsId/delete', async (req, res) => {

// console.log(req.params.newsId);

//     await User.findByIdAndRemove(req.params.newsId);
//     res.redirect('/news/:newsId/favorites');
// });












//Show favorites
//TEST
// router.get('/news-favorites', async (req, res) => {
//     const newsFavorites = await User.findById(
//         req.session.currentUser._id
//     ).sort({
//         title: 1
//     });


//     console.log(newsFavorites);
// // const response = await newsapi.v2.everything();
// // const articles = response.articles;
// //     for(let i = 0; i < newsFavorites.length; i++){
// //         if(newsFavorites[i] === articles.title){
// //             return;
// //         }
// //     }
//     res.render('news/news-favorites', {
//         newsFavorites
//     });
// });


// router.get('/news-favorites', async (req, res) => {
// const userDetail = await User.findById(req.session.currentUser._id);
// const newArray = [];
// for(let i = 0; i < userDetail.favorites.length; i++){
//     const newsDetails = await newsapi.v2.everything({});
// }
// });








module.exports = router; //always the last line