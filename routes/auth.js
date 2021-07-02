const express = require('express');
const router = express.Router();

//Require User
const User = require('../models/User.model');

//Require bcrypt
const bcrypt = require('bcryptjs');



const fileUpload = require('../config/cloudinary');




router.get('/signup', (req, res) => {
    res.render('auth/signup');
});








router.post('/signup', fileUpload.single('image'), async (req, res) => {
    

    let fileUrlOnCloudinary = ""; //like this, if there is an error the file won't break
    if (req.file) {
        fileUrlOnCloudinary = req.file.path;
    }

    const {
        username,
        email,
        password,
        role,
        image,
        location,
        interests,
        bio,
    } = req.body;

    //check if username and password are filled in
    if (username === '' || password === '') {
        res.render('auth/signup', {
            errorMessage: 'Fill username and password'
        });
        return;
    }

    //check if username already exists
    const user = await User.findOne({
        username
    });
    if (user !== null) {
        res.render('auth/signup', {
            errorMessage: 'Username already exists'
        });
        return;
    }

    //check for password strength
    const myRegex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
    if (myRegex.test(password) === false) {
        res.render('auth/signup', {
            errorMessage: 'Password is too weak',
        });
        return;
    }

    const saltRounds = 10;
    const salt = bcrypt.genSaltSync(saltRounds);
    const hashedPassword = bcrypt.hashSync(password, salt);

    await User.create({
        username,
        email,
        password: hashedPassword,
        role, //passing the hashed/encrypted password when creating a new object
        imageUrl: fileUrlOnCloudinary,
        location,
        interests,
        bio,
    });
    
    res.redirect('/login');
});










router.get('/login', (req, res) => {
    res.render('auth/login');
});


router.post("/login", async (req, res) => {
    const {
        username,
        password
    } = req.body;
    if (!username || !password) {
        res.render("auth/login", {
            errorMessage: "Fill username and password",
        });
        return;
    }
    const user = await User.findOne({
        username
    });
    if (!user) {
        res.render("auth/login", {
            errorMessage: "Invalid login",
        });
        return;
    }

    //Check for password
    if (bcrypt.compareSync(password, user.password)) {
        //Password match

        //Initializing the session with the current user
        req.session.currentUser = user;

        //you could redirect to a landing admin page
        // if(currentUser.role === 'Admin'){
        //     res.redirect('admin');
        // }

        res.redirect(`/auth/${user._id}`);
    } else {
        res.render("auth/login", {
            errorMessage: 'Invalid login',
        });
    }
});







router.get('/users', async (req, res) => {
const usersFromDB = await User.find();
    res.render('auth/users', {usersFromDB});
});


router.get('/auth/:userId', async (req, res) => {
const userProfile = await User.findById(req.params.userId);
res.render('auth/user-profile', userProfile);
});






router.get('/auth/:userId/edit', async (req, res) => {
    const userToEdit = await User.findById(req.params.userId);
    console.log(userToEdit);
    res.render('auth/user-edit', {
        userToEdit,
    });
});


router.post('/auth/:userId/edit', async (req, res) => {
    const {
        imageUrl,
        location,
        interests,
        bio,
    } = req.body;
    await User.findByIdAndUpdate(req.params.userId, {
         imageUrl,
         location,
         interests,
         bio,
    });
    console.log(req.body);
    res.redirect('/');
});











//User profile
router.get('/user-profile', async (req, res) => {
    const userProfile = await User.findById(req.session.currentUser._id);
    res.render('auth/user-profile', 
        userProfile
    );
});










router.post('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});






module.exports = router;