const express = require('express');
const router = express.Router();



//NewsAPI
const NewsAPI = require('newsapi');
const newsapi = new NewsAPI('444c96d4ece448f6b81ee0ab9726c76b');

//GET NEWS

// router.get('/news', async (req, res) => {
//     const newsFromAPI = await newsapi.v2.everything();

//     console.log(newsFromAPI);

//     res.render('news/news', {
//         newsFromAPI
//     });
// });




router.get('/news', async (req, res) => {
    

    res.render('news/news');
});










module.exports = router; //always the last line