const {
    Schema,
    model
} = require('mongoose');


const BlogPostsSchema = new Schema({
    author: String,
    title: String,
    description: String,
    publishedAt: String,
    content: String,
    keywords: String,
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
    }
}, {
    timestamps: true,
});



module.exports = model('Blogposts', BlogPostsSchema);