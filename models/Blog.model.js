const {
    Schema,
    model
} = require('mongoose');


const BlogSchema = new Schema({
    author: String,
    title: String,
    description: String,
    publishedAt: String,
    content: String,
    keywords: String,
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    like: [{
            type: Schema.Types.ObjectId,
            ref: 'Like' // relates to the Like model
        }],
        reserve: [{
            type: Schema.Types.ObjectId,
            ref: 'Reserve' // relates to the Like model
        }],
}, {
    timestamps: true,
});



module.exports = model('Blog', BlogSchema);