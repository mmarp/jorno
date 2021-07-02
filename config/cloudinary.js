//request cloudinary
const cloudinary = require('cloudinary').v2;
//necessary for requests fomr-data (allows to sen files on my request)
const multer = require('multer');
//connect multer with cloudinary
const { CloudinaryStorage } = require('multer-storage-cloudinary');

//Connects cloudinary library to our subscription
cloudinary.config({
cloud_name: process.env.CLOUDINARY_NAME,
api_key: process.env.CLOUDINARY_KEY,
api_secret: process.env.CLOUDINARY_SECRET,
});

//Storage configuration on cloudinary
const storage = new CloudinaryStorage({
cloudinary,
params: {
    folder: 'books',
    allowed_formats: ['png', 'jpg'], //if you don't use allowed format you allow every file type
},
filename: function(req, file, cb){
    cb(null, file.originalname);
}

});




const uploadCloud = multer({storage});

module.exports = uploadCloud;