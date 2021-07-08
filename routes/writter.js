const express = require('express');
const router = express.Router();


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


    const blogpostDetail = await Blogpost.findById(req.params.blogpostId);

    //
    let bFavorite = false;
    for (let i = 0; i < userDetail.favoritesBlogpost.length; i++) {
        console.log('CHECANDO!!!! ', req.params.blogpostId, userDetail.favoritesBlogpost[i]);
        if (userDetail.favoritesBlogpost[i] == req.params.blogpostId) {
            bFavorite = true;
            console.log('CHECANDO BFAVEEEE ', bFavorite);
        }
    }



    if (req.session.currentUser.role === "writter") {
        const writter = true;
        res.render('blogposts/blogpost-detail', {
            blogpostDetail,
            writter
        });

    } else if (req.session.currentUser.role === "editor") {
        const editor = true;
        if (bFavorite) {
            console.log('CHECANDO SE ENTROU NO IF ')
            res.render('blogposts/blogpost-detail', {
                blogpostDetail,
                editor,
                bFavorite,
                userDetail
            });
        } else {
            res.render('blogposts/blogpost-detail', {
                blogpostDetail,
                editor,
            });
        }

    } else {
        res.render('blogposts/blogpost-detail', {
            blogpostDetail
        });
    }

});



//PREVIOUS WORKING CODE
// router.get('/blogposts/:blogpostId', async (req, res) => {
//     const blogpostDetail = await Blogpost.findById(req.params.blogpostId);
//     res.render('blogposts/blogpost-detail', blogpostDetail);
// });




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
    });
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
    });
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
        const findBlogpost = await Blogpost.findOne(blogpostsFavorites[i]);
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