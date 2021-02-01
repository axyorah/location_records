if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config();
}

const express = require('express');
const ejs = require('ejs');
const ejsMate = require('ejs-mate');
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');

const rovRoutes = require('./routes/rov.js');
const cityRoutes = require('./routes/city.js');
const Area = require('./models/area.js');

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

app.use(express.urlencoded({ extended: true })); // for parsing post requests
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

// --- ROUTE HANDLERS ---
app.use('/', rovRoutes);
app.use('/', cityRoutes);


app.listen(3000, () => {
    console.log('LISTENING ON PORT 3000');
})
