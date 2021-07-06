const {
  Schema,
  model
} = require("mongoose");

// TODO: Please make sure you edit the user model to whatever makes sense in this case
const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true // -> Ideally, should be unique, but its up to you
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
  },
  role: String, //Writter or Editor
  imageUrl: String,
  location: String,
  interests: Array,
  bio: String,

  //TEST
  favorites: [{
    title: String,
    url: String,
  }],
  favoritesBlogpost: Array,
});

const User = model("User", userSchema);

module.exports = User;