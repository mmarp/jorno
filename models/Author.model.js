const {
    Schema,
    model
} = require('mongoose');

const AuthorSchema = new Schema({
    name: String,
    bio: String,
    picture: String,
    
});

module.exports = model('Author', AuthorSchema);