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
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
    }
}, {
    timestamps: true,
});





module.exports = model('Blogposts', BlogPostsSchema);