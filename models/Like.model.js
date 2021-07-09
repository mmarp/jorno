const {
    Schema,
    model
} = require("mongoose");

const likesSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User', // relates to the user model. Is either writer or editor. 
    },
    blog: {
        type: Schema.Types.ObjectId,
        ref: 'Blog' // relates to the blogpost model
    },
}, {
    timestamps: true
});

module.exports = model('Like', likesSchema);