if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config();
}

const express = require('express');
const ejs = require('ejs');
const ejsMate = require('ejs-mate');
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');

const session = require('express-session');
const flash = require('connect-flash');

const rovRoutes = require('./routes/rov.js');
const cityRoutes = require('./routes/city.js');
const areaRoutes = require('./routes/area.js');

// --- MONGOOSE SETUP --- 
mongoose.connect('mongodb://localhost:27017/rov', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Database connected!');
});

// --- EXPRESS SETUP ---
const app = express();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));         // for parsing POST requests
app.use(methodOverride('_method'));                      // enable DELETE method
app.use(express.static(path.join(__dirname, 'public'))); // add `./public/` to PATH

// --- EXPRESS SESSION /FLASH SETUP ---
const sessionOptions = {
    secret: 'this-is-not-a-good-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // in ms
        maxAge: 1000 * 60 * 60 * 24 * 7,
        httpOnly: true
    }
}
app.use(session(sessionOptions));
app.use(flash());
app.use((req,res,next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

// --- ROUTE HANDLERS ---
app.use('/', rovRoutes);
app.use('/', cityRoutes);
app.use('/', areaRoutes);


app.listen(3000, () => {
    console.log('LISTENING ON PORT 3000');
})