const {
    Schema,
    model
} = require('mongoose');


const BlogPostsSchema = new Schema({
    author: String,
    title: String,
    description: String,
    publishedAt: Date,
    content: String,
    keywords: Array,
}, {
    timestamps: true,
});





module.exports = model('BlogPosts', BlogPostsSchema);