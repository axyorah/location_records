if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config();
}

const express = require('express');
const ejs = require('ejs');
const ejsMate = require('ejs-mate');
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const mongoSanitize = require('express-mongo-sanitize');

const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
const MongoStore = require('connect-mongo')(session);

const passport = require('passport');
const LocalStrategy = require('passport-local');

const generalRoutes = require('./routes/general.js');
const cityRoutes = require('./routes/location.js');
const areaRoutes = require('./routes/collection.js');
const userRoutes = require('./routes/user.js');
const projectRoutes = require('./routes/projects.js');

const ExpressError = require('./utils/ExpressError.js');
const { setLocals } = require('./middleware.js');

const User = require('./models/user.js');

// --- MONGOOSE SETUP --- 
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/rov';
//const dbUrl = 'mongodb://localhost:27017/rov';

mongoose.connect(dbUrl, {
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
app.use(mongoSanitize({replaceWith: '_'}));
app.use(cookieParser());

// --- EXPRESS SESSION /FLASH SETUP ---
const secret = process.env.SECRET || 'this-is-not-a-good-secret';
const store = new MongoStore({
    url: dbUrl,
    secret: secret,
    touchAfter: 24 * 3600
});

store.on('error', (err) => {
    console.log('Session Store Error!');
    console.log(err);
});

const sessionOptions = {
    store: store,
    secret: secret,
    resave: false,
    saveUninitialized: false,
    cookie: { 
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // in ms
        maxAge: 1000 * 60 * 60 * 24 * 7,
        httpOnly: true,
        sameSite: 'strict',
        //secure: true
    }
}
app.use(session(sessionOptions));
app.use(flash());

// --- PASSPORT SETUP ---
// (should come after app.use(session(.)))
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// --- ROUTE HANDLERS ---
app.use('/', generalRoutes);
app.use('/', cityRoutes);
app.use('/', areaRoutes);
app.use('/', userRoutes);
app.use('/', projectRoutes);

// error handlers
app.all('*', setLocals, (req,res,next) => {
    next(new ExpressError('Page Not Found!', 404));
});

app.use(setLocals, (err,req,res,next) => {
    const { status = 500 } = err;
    err.message = err.message ? err.message : 'Something Went Wrong...';
    res.status(status).render('./general/error.ejs', { err });
})

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`LISTENING ON PORT ${port}`);
})