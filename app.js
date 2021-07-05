// ℹ️ Gets access to environment variables/settings
// https://www.npmjs.com/package/dotenv
require("dotenv/config");

// ℹ️ Connects to the database
require("./db");

// Handles http requests (express is node js framework)
// https://www.npmjs.com/package/express
const express = require("express");

// Handles the handlebars
// https://www.npmjs.com/package/hbs
const hbs = require("hbs");


//Handlebars helpers - added because I want to use the #eq helper
const helpers = require('handlebars-helpers');
hbs.registerHelper(helpers());


const app = express();

// ℹ️ This function is getting exported from the config folder. It runs most pieces of middleware
require("./config")(app);


//Express-session
const session = require('express-session');

//Connect-mongo
const mongoStore = require('connect-mongo');








app.use(
    session({
        resave: true,
        saveUninitialized: true,
        secret: process.env.SESSION_SECRET,
        cookie: { //object stored on your browser
            sameSite: true, //because frontend and backend is the same site
            httpOnly: true, //because we are not using https
            maxAge: 6000000, //session will last 1 hour
        },
        rolling: true, //if I am touching the screen it will renew the maxAge
        //without this option it won't happen
        store: new mongoStore({
            mongoUrl: process.env.MONGODB_URI,
            ttl: 60 * 60 * 24 //ttl - time to leave - 60 * 60 * 24 = 1 day
        })
    })
);



function getCurrentLoggedUser(req, res, next) {
    if (req.session && req.session.currentUser) {
        app.locals.loggedInUser = req.session.currentUser;
        app.locals.loggedId = req.session.currentUser._id;
    } else {
        app.locals.loggedInUser = "";
    }
    next();
}

app.use(getCurrentLoggedUser);


// default value for title local
const projectName = "library-project";
const capitalized = (string) => string[0].toUpperCase() + string.slice(1).toLowerCase();

app.locals.title = `${capitalized(projectName)} created with IronLauncher`; //locals = global variable from the app

// 👇 Start handling routes here
const index = require("./routes/index");
app.use("/", index);

//Book routes
const book = require('./routes/book');
app.use('/', book);


//Author routes
const author = require('./routes/author');
app.use('/', author);


//Auth routes
const auth = require('./routes/auth');
app.use('/', auth);


//News routes
const news = require('./routes/news');
app.use('/', news);

//Writter routes
const writter = require('./routes/writter');
app.use('/', writter);









// ❗ To handle errors. Routes that don't exist or errors that you handle in specific routes
require("./error-handling")(app);

module.exports = app;