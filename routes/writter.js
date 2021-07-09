const express = require('express');
const router = express.Router();
const Like = require('../models/Like.model');
const Reserve = require('../models/Reserve.model');

//Require User
const User = require('../models/User.model');


//Require blogposts
const Blogpost = require('../models/Blog.model');


const fileUpload = require('../config/cloudinary');


//NewsAPI
const NewsAPI = require('newsapi');
const {
    listen
} = require('../app');
const newsapi = new NewsAPI('444c96d4ece448f6b81ee0ab9726c76b');






function requireLogin(req, res, next) {
    if (req.session.currentUser) {
        next();
    } else {
        res.redirect('/login');
    }
}



//ROLE AS WRITER
function requireWritter(req, res, next) {
    if (req.session.currentUser &&
        req.session.currentUser.role === 'writter') {
        next();
    } else {
        res.redirect('/login');
    }
}



//ROLE AS EDITOR
function requireEditor(req, res, next) {
    if (req.session.currentUser &&
        req.session.currentUser.role === 'editor') {
        next();
    } else {
        res.redirect('/login');
    }
}





//WRITER - SEE OWN BLOGPOSTS 
router.get('/blogposts', requireLogin, async (req, res) => {

    const blogpostsFromDB = await Blogpost.find({
        user: req.session.currentUser
    }).sort({
        title: 1
    }).populate('user'); //sorts books alphabetically
    res.render('blogposts/blogposts-list', {
        blogpostsFromDB
    });
});





//to find things from the current logged user
// Blogpost.find({ user: req.session.currentUser })



//Gets the detail of a blogpost by using blogpostsId
//http://localhost:3000/blogposts/25342534623
router.get('/blogposts/:blogpostId', requireLogin, async (req, res) => {
    //
    const userDetail = await User.findById(req.session.currentUser._id);

    
    //PREVIOUS WORKING CODE 
    // const blogpostDetail = await Blogpost.findById(req.params.blogpostId).populate('user');


    //BEN ⤵️ Adding the deep population method to get the user (editor) that has reserved a given blog post, added to...
    //...the blogpostDetail variable here, and used after the code block that executes likes below. 
    const blogpostDetail = await Blogpost.findById(req.params.blogpostId).populate('user').populate('like').populate({
        path: 'reserve',
        populate: {
            path: 'user'
        }
    });


    //Implementing time to read functionality
    const timeToRead = Math.round(blogpostDetail.content.split(' ').length / 200);
    //
    let bFavorite = false;
    for (let i = 0; i < userDetail.favoritesBlogpost.length; i++) {

        if (userDetail.favoritesBlogpost[i] == req.params.blogpostId) {
            bFavorite = true;

        }
    }

    if (req.session.currentUser.role === "writter") {
        const writter = true;
        res.render('blogposts/blogpost-detail', {
            blogpostDetail,
            timeToRead,
            writter
        });

    } else if (req.session.currentUser.role === "editor") {
        const editor = true;
        if (bFavorite) {

            res.render('blogposts/blogpost-detail', {
                blogpostDetail,
                timeToRead,
                editor,
                bFavorite,
                userDetail
            });
        } else {
            res.render('blogposts/blogpost-detail', {
                blogpostDetail,
                timeToRead,
                editor,
            });
        }

    } else {
        res.render('blogposts/blogpost-detail', {
            blogpostDetail,
            timeToRead,
        });
    }

});



//PREVIOUS WORKING CODE
// router.get('/blogposts/:blogpostId', async (req, res) => {
//     const blogpostDetail = await Blogpost.findById(req.params.blogpostId);
//     res.render('blogposts/blogpost-detail', blogpostDetail);
// });







//BEN ⤵️ recieving likes for the blogpost and checking for likes by users
router.post("/site/:blogpostId/like", async (req, res) => { //post from <form> on site-detail.hbs
    // try {
    const user = await User.findById(req.session.currentUser._id); //Get the current user
    const blog = await Blogpost.findById(req.params.blogpostId); //Get the current blogpost

    const existingLike = await Like.findOne({ //Look for an existing like
        user: user, //Look on the user
        blog: blog //Look on the blogpost
    });

    if (!existingLike) {
        const like = await Like.create({
            user,
            blog
        });

        await Blogpost.findByIdAndUpdate(req.params.blogpostId, { //push like to the specific blogpost
            $push: {
                like: like,
            }
        })
    }

    res.redirect(`/blogposts/${req.params.blogpostId}`); //NB: A redirect like this in the end of a .post route needs..
    //...to end on the {} ... in this case on the direction to the post. We CAN NOT use :blogpost as a parameter in this case.
});

//RECIEVE RESERVATIONS FROM USERS WANTING TO USE THE BLOGPOST ⤵️
router.post("/site/:blogpostId/reserve", async (req, res) => { //post from <form> on site-detail.hbs
    // try {
    const user = await User.findById(req.session.currentUser._id); //Get the current user
    const blog = await Blogpost.findById(req.params.blogpostId); //Get the current blogpost

    const existingReserve = await Reserve.findOne({ //Look for an existing like
        user: user, //Look on the user
        blog: blog, //Look on the blogpost
    });

    if (!existingReserve) {
        const reserve = await Reserve.create({
            user,
            blog,
        });
        await Blogpost.findByIdAndUpdate(req.params.blogpostId, { //push like to the specific blogpost
            $push: {
                reserve: reserve
            }
        })
    }
    //aka. find all the reserves where the blogpost is equal to this ID
    // res.render("books/site-detail", {blogPostDetail, reserveArr});                     //...no need for {}, blogPostDetail is already an object                  
    res.redirect(`/blogposts/${req.params.blogpostId}`);
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




//EDITOR FIND BLOGPOSTS
router.get('/find-blogpost', requireEditor, requireLogin, async (req, res) => {
    const blogpostsFromDB = await Blogpost.find().sort({
        title: 1
    }).populate('user');
    res.render('blogposts/blogpost-find', {
        blogpostsFromDB
    });
});



//EDITOR SEARCH FOR SPECIFIC BLOGPOSTS - SEARCH KEYWORDS
router.get('/blogpost-search', requireEditor, requireLogin, async (req, res) => {
    const {
        keywords
    } = req.query;

    const blogpostsFromDB = await Blogpost.find({
        keywords: {
            $regex: '.*' + keywords + '.*',
            $options: 'i'
        }
    }).sort({
        title: 1
    }).populate('user');
    console.log(blogpostsFromDB.keywords);
    res.render('blogposts/blogpost-find', {
        blogpostsFromDB
    });
});



//SAVING BLOGPOST AS FAVORITE
router.post("/blogposts/:blogpostId", requireLogin, requireEditor, async (req, res) => {
    console.log("HEREEEEEE", req.session.currentUser._id);
    const blogpostsFavorite = await Blogpost.findById(req.params.blogpostId);
    console.log(blogpostsFavorite.title);
    await User.findByIdAndUpdate(req.session.currentUser._id, {
        $push: {
            favoritesBlogpost: blogpostsFavorite
        }
    });

    // const reqQuery = req.query.q;
    res.redirect(`/blogposts/${blogpostsFavorite._id}`);
});




//ADDING A SAVED FAVORITE BLOGPOST
router.get('/blogposts/:userId/favorites', requireEditor, async (req, res) => {
    const userDetail = await User.findById(req.params.userId);
    const blogpostsFavorites = userDetail.favoritesBlogpost;
    let newArray = [];
    for (let i = 0; i < blogpostsFavorites.length; i++) {
        const findBlogpost = await Blogpost.findOne(blogpostsFavorites[i]).populate('user');
        newArray.push(findBlogpost);
    }
    console.log("CHECK NEW ARRAY HERE", newArray);
    res.render('blogposts/blogposts-favorites', {
        newArray
    });
});




//DELETING A SAVED FAVORITE BLOGPOST
router.post("/blogposts/favorites/:blogpostId/delete", requireLogin, requireEditor, async (req, res) => {
    console.log("HEYA", req.session.currentUser._id);
    const blogpostsFavorite = await Blogpost.findById(req.params.blogpostId);

    await User.findByIdAndUpdate(req.session.currentUser._id, {

        $pull: {
            favoritesBlogpost: req.params.blogpostId
        }
    });
    console.log("ARE YOU?", req.params.blogpostId);
    // const reqQuery = req.query.q;
    res.redirect(`/blogposts/${req.session.currentUser._id}/favorites`);
});







//News favorites
router.post("/news/favorites/:query/add", async (req, res) => {
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
    res.redirect(`/news-search?q=${req.params.query}`);
});






router.get('/news/:userId/favorites', async (req, res) => {
    const userDetail = await User.findById(req.params.userId);

    const newsFavorites = userDetail.favorites;
    if (req.session.currentUser.role === "writter") {
        const writter = true;
        res.render('news/news-favorites', {
            newsFavorites,
            writter
        });
    } else if (req.session.currentUser.role === "editor") {
        const editor = true;
        res.render('news/news-favorites', {
            newsFavorites,
            editor
        });
    } else {
        res.render('news/news-favorites', {
            newsFavorites
        });
    }

});



//PREVIOUS WORKING FAVORITES CODE
// router.get('/news/:userId/favorites', async (req, res) => {
//     const userDetail = await User.findById(req.params.userId);

//     const newsFavorites = userDetail.favorites;





//     res.render('news/news-favorites', {
//         newsFavorites
//     });
// });










router.post("/news/favorites/:newsId/delete", async (req, res) => {
    await User.findByIdAndUpdate(req.session.currentUser._id, {
        $pull: {
            favorites: {
                _id: req.params.newsId
            }
        }
    });

    res.redirect(`/news/${req.session.currentUser._id}/favorites`);
});


// Delete news favorites
// router.post('/news/favorites/:newsId/delete', async (req, res) => {

// console.log("hey", req.params.newsId);

//     await User.findByIdAndRemove(req.params.newsId);
//     res.redirect('/news');
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