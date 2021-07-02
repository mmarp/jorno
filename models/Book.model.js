const {
    Schema,
    model
} = require('mongoose');


const BookSchema = new Schema({
    title: String,
    description: String,
    author: {
        type: Schema.Types.ObjectId, //reference to the author schema
        ref: 'Author', //connection between models
        //visually it is like a dropdown list
    },

    //  author: [{
    //      type: Schema.Types.ObjectId, //reference to the author schema
    //      ref: 'Author', //connection between models
    //      //visually it is like a dropdown list
    //  }], multiple authors



    rating: Number,
    reviews: [{ //nested model
        username: String,
        comment: String,
    }],
    // user: {
    //   type: Schema.Types.ObjectId,
    //   ref: "User",
    // },
    imageUrl: String,

}, {
    timestamps: true,
});


module.exports = model('Book', BookSchema);