const express = require('express');
const router = express.Router();



//NewsAPI
const NewsAPI = require('newsapi');
const newsapi = new NewsAPI('444c96d4ece448f6b81ee0ab9726c76b');




router.get('/news/:query', async (req, res) => {
    // news.find({ title: '/dcasdas/'});
    const response = await newsapi.v2.everything({
        q: req.params.query,
        // sources: 'bbc-news,the-verge',
        // domains: 'bbc.co.uk, techcrunch.com',
        // from: '2021-06-03',
        // to: '2021-07-02',
        language: 'en',
        sortBy: 'relevancy',
        page: 4
    });
    const articles = response.articles;
    res.render('news/news', {
        articles
    });
});







//TEST

//router to news
router.get('/news', (req, res) => {
res.render('news/news');
});



//router to news search
router.get('/news-search', async (req, res) => {
const q = req.query.q;
    const response = await newsapi.v2.everything({
        q: q,
        // sources: 'bbc-news,the-verge',
        // domains: 'bbc.co.uk, techcrunch.com',
        // from: '2021-06-03',
        // to: '2021-07-02',
        language: 'en',
        sortBy: 'relevancy',
        page: 4
    });

    const articles = response.articles;
    res.render('news/news-search-results', {
        articles
    });
});





















module.exports = router; //always the last line